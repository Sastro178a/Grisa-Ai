import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const handler = async (req) => {
  if (req.method === "POST" && new URL(req.url).pathname === "/api/chat") {
    try {
      const { message } = await req.json();

      // 🔹 Ganti dengan API key kamu
      const apiKey = Deno.env.get("OPENAI_API_KEY");
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: message }],
        }),
      });

      const data = await response.json();
      return new Response(JSON.stringify({ reply: data.choices?.[0]?.message?.content || "Tidak ada jawaban" }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }

  return new Response("Grisa AI aktif ✅");
};

serve(handler);
