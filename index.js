// Import server dari Deno standar library
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Ambil API key dari Environment Variables di Deno Deploy
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

// Jalankan server utama
serve(async (req) => {
  const { pathname } = new URL(req.url);

  // CORS preflight agar frontend bisa akses backend
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  // Endpoint utama untuk komunikasi AI
  if (req.method === "POST" && pathname === "/api/chat") {
    try {
      const { message, model } = await req.json();
      let reply = "⚠️ Tidak ada respons dari AI.";

      // Gunakan Gemini untuk mode pencarian & soal
      if (model === "soal" || model === "pencarian") {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: message }] }],
            }),
          }
        );
        const data = await geminiRes.json();
        reply = data.candidates?.[0]?.content?.parts?.[0]?.text || reply;

      // Gunakan ChatGPT untuk mode riset & ngobrol
      } else {
        const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: message }],
          }),
        });
        const data = await openaiRes.json();
        reply = data.choices?.[0]?.message?.content || reply;
      }

      return new Response(JSON.stringify({ reply }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (err) {
      console.error(err);
      return new Response(
        JSON.stringify({ reply: "❌ Terjadi kesalahan di server." }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  }

  // Jika bukan API, tampilkan status server aktif
  return new Response("✅ Grisa AI Backend aktif.", {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
});
