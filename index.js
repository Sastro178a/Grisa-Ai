import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  const { message, mode } = req.body;
  try {
    let reply = "";

    if (mode === "soal") {
      const geminiResp = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + process.env.GEMINI_API_KEY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: message }] }] })
      });
      const geminiData = await geminiResp.json();
      reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "Tidak ada respon dari Gemini.";
    } else {
      const openaiResp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + process.env.OPENAI_API_KEY
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: message }]
        })
      });
      const openaiData = await openaiResp.json();
      reply = openaiData.choices?.[0]?.message?.content || "Tidak ada respon dari ChatGPT.";
    }

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Terjadi kesalahan di server." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Grisa AI Backend berjalan di port ${PORT}`));
