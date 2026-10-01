const RECIPIENT = "shevrieelaputri399@gmail.com";
const DEFAULT_FROM = "Scrapbook <onboarding@resend.dev>";
const RESEND_TIMEOUT_MS = 10_000;

// Minimal Node/Vercel handler types keep this frontend project's type-checking
// independent of a runtime-only Vercel package.
type VercelRequest = {
  method?: string;
};

type VercelResponse = {
  status: (statusCode: number) => VercelResponse;
  setHeader: (name: string, value: string) => void;
  json: (body: unknown) => void;
};

// Vercel makes process.env available only to this serverless function.
declare const process: { env: Record<string, string | undefined> };

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
): Promise<void> {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not configured.");
    response.status(500).json({ error: "Email notifications are not configured." });
    return;
  }

  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), RESEND_TIMEOUT_MS);

  try {
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || DEFAULT_FROM,
        to: [RECIPIENT],
        subject: "💗 She said yes",
        text: `She just clicked YES on the scrapbook.\n\nAnswer: YES\nTime: ${new Date().toISOString()}`,
      }),
      signal: abortController.signal,
    });

    if (!resendResponse.ok) {
      console.error("Resend failed to send YES notification:", resendResponse.status);
      response.status(502).json({ error: "Unable to send notification." });
      return;
    }

    response.status(200).json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Unable to send YES notification:", message);
    response.status(502).json({ error: "Unable to send notification." });
  } finally {
    clearTimeout(timeout);
  }
}
