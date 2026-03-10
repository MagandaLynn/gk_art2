# Artist Portfolio Website

A modern artist portfolio with a featured landing carousel, editable portfolio sections, and admin-managed About and Contact pages.

## Features

- Landing page carousel that highlights marked images.
- Portfolio sections with cover image, description, and lightbox navigation.
- About and Contact pages editable with rich text.
- Social link icons shown on About and Contact.
- Admin-only dashboard with color scheme picker and section reordering.

## Running locally

```bash
npm run dev
```

Open http://localhost:3000.

## Admin access

- Admin page: /admin (not linked from the public navigation)
- Default access code: artist-admin
- Updates are saved to local browser storage for quick iteration.

## AWS image uploads (recommended)

This project supports admin-only uploads to S3 with optional CloudFront delivery.

1. Create a new S3 bucket in us-east-1.
2. Configure access:
	- Simple setup: allow public read for the bucket or `/uploads/*`.
	- Recommended setup: attach CloudFront with Origin Access Control and keep the bucket private.
3. Copy `.env.example` to `.env.local` and set the values.

The admin upload fields will send files to S3 and store the resulting URL.

## Editing content

Use the admin dashboard to:

- Mark images as highlighted for the landing carousel.
- Add, edit, or reorder portfolio sections.
- Update the About and Contact copy with rich text.
- Change the color theme.

Placeholder portfolio images are stored in the public folder. Replace them with real artwork when ready.
