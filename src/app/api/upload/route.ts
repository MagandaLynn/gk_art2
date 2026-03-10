import { NextResponse } from "next/server";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const DEFAULT_ACCESS_CODE = "artist-admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { fileName, fileType, accessCode } = (await request.json()) as {
    fileName?: string;
    fileType?: string;
    accessCode?: string;
  };

  const adminAccessCode = process.env.ADMIN_ACCESS_CODE || DEFAULT_ACCESS_CODE;
  if (!accessCode || accessCode !== adminAccessCode) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bucket = process.env.AWS_S3_BUCKET;
  const region = process.env.AWS_REGION || "us-east-1";
  if (!bucket || !fileName || !fileType) {
    return NextResponse.json({ error: "Missing configuration" }, { status: 400 });
  }

  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
  const key = `uploads/${Date.now()}-${sanitizedName}`;

  const client = new S3Client({ region });

  const acl = process.env.AWS_S3_ACL;
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: fileType,
    CacheControl: "public, max-age=31536000",
    ...(acl ? { ACL: acl } : {}),
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 60 });
  const cdnDomain = process.env.CLOUDFRONT_DOMAIN;
  const fileUrl = cdnDomain
    ? `https://${cdnDomain}/${key}`
    : `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

  return NextResponse.json({ uploadUrl, fileUrl });
}
