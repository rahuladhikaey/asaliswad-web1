# Deploying to Render

This project is configured for deployment on [Render](https://render.com).

## Prerequisites

1. Create a [Render](https://render.com) account.
2. Connect your GitHub/GitLab repository to Render.

## Deployment Steps

1. Click on **New +** and select **Blueprint**.
2. Select your repository.
3. Render will automatically detect the `render.yaml` file.
4. Click **Apply**.

## Environment Variables

During the setup (or in the dashboard after creation), ensure the following environment variables are set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

You can copy these from your `.env.local` file.

## Why Render?

Render provides a full Node.js environment which is better for Next.js features that require a standard server environment (like some Razorpay integrations or complex SSR logic) compared to the restricted Edge runtime on Cloudflare.
