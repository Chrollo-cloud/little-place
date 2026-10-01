# us-again site

Pink scrapbook-style interactive website.

## Run

```bash
npm install
npm run dev
```

## YES email notification (Resend)

The final-page **YES** button starts its celebration immediately and sends a separate `POST /api/notify-yes` request. The request is protected from repeat clicks during a visit, and a failed email request does not affect the celebration.

1. Create a [Resend](https://resend.com) account and generate an API key.
2. In your deployment platform's environment-variable settings, add `RESEND_API_KEY` with that key. Do not add it to frontend code or a `VITE_*` variable.
3. Deploy the site. The `api/notify-yes.ts` endpoint is Vercel-compatible.
4. Click **YES** and confirm the celebration appears straight away.
5. Confirm the notification arrives at `shevrieelaputri399@gmail.com`.

Resend uses `onboarding@resend.dev` as the default sender. For production delivery from your own identity, verify a domain in Resend and optionally add `RESEND_FROM_EMAIL` (for example, `Scrapbook <hello@yourdomain.com>`) in the deployment environment.

## Easy asset adjustments

Open `src/styles.css` and look for **EASY ASSET ADJUSTMENTS**.

Change `--photo-zoom` for photo zoom, or the individual `--*-size` variables for the pink decorations.

Photo order is in `src/data/content.ts` under `photos`.
Song names/files are in `src/data/content.ts` under `songs`.

The aquarium/fish system remains capped at 3 selected fish and existing fish stay in place when a new one is added.
