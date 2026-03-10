import { NextResponse } from "next/server";
import { Readable } from "stream";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { defaultSiteData, type SiteData } from "@/data/siteData";

const DEFAULT_ACCESS_CODE = "artist-admin";

export const runtime = "nodejs";

const streamToString = async (stream: unknown) => {
  if (!stream) return "";

  if (typeof (stream as ReadableStream).getReader === "function") {
    const reader = (stream as ReadableStream).getReader();
    const decoder = new TextDecoder();
    let result = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += decoder.decode(value, { stream: true });
    }
    result += decoder.decode();
    return result;
  }

  if (stream instanceof Readable || Symbol.asyncIterator in (stream as object)) {
    const decoder = new TextDecoder();
    let result = "";
    for await (const chunk of stream as AsyncIterable<Uint8Array>) {
      result +=
        chunk instanceof Uint8Array
          ? decoder.decode(chunk, { stream: true })
          : decoder.decode(new Uint8Array(chunk as ArrayBuffer), { stream: true });
    }
    result += decoder.decode();
    return result;
  }

  return "";
};

const getClient = () => {
  const region = process.env.AWS_REGION || "us-east-1";
  return new S3Client({ region });
};

const getBucketAndKey = () => {
  const bucket = process.env.AWS_DATA_BUCKET || process.env.AWS_S3_BUCKET;
  const key = process.env.AWS_DATA_KEY || "site-data.json";
  return { bucket, key };
};

export async function GET() {
  const { bucket, key } = getBucketAndKey();
  if (!bucket) {
    return NextResponse.json(defaultSiteData, { status: 200 });
  }

  try {
    const client = getClient();
    const response = await client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
    const body = await streamToString(response.Body ?? null);
    if (!body) {
      return NextResponse.json(defaultSiteData, { status: 200 });
    }
    const parsed = JSON.parse(body) as SiteData;
    return NextResponse.json({ ...defaultSiteData, ...parsed }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to load site data",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const { bucket, key } = getBucketAndKey();
  if (!bucket) {
    return NextResponse.json({ error: "Missing storage" }, { status: 400 });
  }

  let payload: { data?: SiteData; accessCode?: string };
  try {
    payload = (await request.json()) as {
      data?: SiteData;
      accessCode?: string;
    };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { data, accessCode } = payload;

  const adminAccessCode = process.env.ADMIN_ACCESS_CODE || DEFAULT_ACCESS_CODE;
  if (!accessCode || accessCode !== adminAccessCode) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!data) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  try {
    const client = getClient();
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: "application/json",
        CacheControl: "no-store",
        Body: JSON.stringify(data),
      })
    );

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to save site data",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
