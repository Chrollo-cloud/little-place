const RECIPIENT = "shevrieelaputri399@gmail.com";
const DEFAULT_FROM = "Scrapbook <onboarding@resend.dev>";

// Vercel provides this at runtime. Keeping the type local avoids adding Node
// types to the browser-only Vite project.
declare const process: { env: Record<string, string | undefined> };

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { Allow: "POST" },
    });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not configured.");
    return new Response("Email notifications are not configured.", { status: 500 });
  }

  const timestamp = new Date().toISOString();

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
        text: `She just clicked YES on the scrapbook.\n\nAnswer: YES\nTime: ${timestamp}`,
      }),
    });

    if (!resendResponse.ok) {
      console.error("Resend failed to send YES notification:", await resendResponse.text());
      return new Response("Unable to send notification.", { status: 502 });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Unable to send YES notification:", error);
    return new Response("Unable to send notification.", { status: 502 });
  }
}
