import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "@/lib/context";

// Real Claude-powered assistant endpoint. The API key is held server-side and
// never reaches the browser. Streams the model's response back as plain text.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    // Graceful degradation: the UI renders this as a setup notice rather than
    // crashing, so the platform works as a demo before the key is configured.
    return new Response(
      JSON.stringify({
        error: "not_configured",
        message:
          "The AI assistant is not yet connected. Set the ANTHROPIC_API_KEY environment variable (in Vercel → Settings → Environment Variables, and .env.local for local dev) to enable live answers.",
      }),
      { status: 503, headers: { "content-type": "application/json" } },
    );
  }

  let messages: ChatMessage[];
  try {
    const body = await req.json();
    messages = Array.isArray(body?.messages) ? body.messages : [];
  } catch {
    return new Response(JSON.stringify({ error: "bad_request" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const clean = messages
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-16); // bound history

  if (clean.length === 0 || clean[clean.length - 1].role !== "user") {
    return new Response(JSON.stringify({ error: "expects_user_turn" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const client = new Anthropic();

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const modelStream = client.messages.stream({
          model: "claude-opus-4-8",
          max_tokens: 2048,
          system: [
            {
              type: "text",
              text: buildSystemPrompt(),
              cache_control: { type: "ephemeral" }, // stable prefix — cache across turns
            },
          ],
          messages: clean.map((m) => ({ role: m.role, content: m.content })),
        });

        modelStream.on("text", (delta) => controller.enqueue(encoder.encode(delta)));
        const final = await modelStream.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(
            encoder.encode(
              "\n\n[This request was declined. Please rephrase or ask about the project portfolio.]",
            ),
          );
        }
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "unknown error";
        controller.enqueue(encoder.encode(`\n\n[Assistant error: ${msg}]`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
