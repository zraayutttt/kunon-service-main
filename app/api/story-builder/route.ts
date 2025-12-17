import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// pakai model aktif (tidak pakai 1.5 lagi)
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      theme,
      clips,
      mode,
      style,
      camera,
      category,
    } = body;

    const prompt = `
Kamu adalah AI Story Builder untuk video short.

Buatkan naskah terstruktur untuk video short dengan detail berikut:
- Judul: ${title || "-"}
- Deskripsi konsep: ${description || "-"}
- Tema: ${theme || "-"}
- Kategori konten: ${category || "-"}
- Jumlah clip (scene): ${clips || "-"}
- Mode: ${mode === "text_to_video" ? "Storyboard visual" : "Script cerita"}
- Gaya visual: ${style || "-"}
- Gerakan kamera: ${camera || "-"}

Buat output dengan format:

1. Pembuka (Hook) — 1 clip
2. Isi — bagi menjadi beberapa clip sesuai jumlah "${clips}" (Clip 1, Clip 2, dst).
3. Penutup (Closing + Call to Action)

Untuk setiap clip tuliskan:
- WAKTU PERKIRAAN (misal: 0-3 detik)
- VISUAL (apa yang terlihat di layar)
- AUDIO / NARASI (apa yang diucapkan / sound effect).

Gunakan bahasa Indonesia santai yang cocok untuk TikTok / Reels / Shorts.
Jangan jelaskan instruksi lagi, langsung tulis scriptnya.
`;

    const result = await model.generateContent(prompt);
    const story = result.response.text();

    return NextResponse.json({ story });
  } catch (err: any) {
    console.error("[Gemini StoryBuilder ERROR]:", err);
    return NextResponse.json(
      {
        error:
          err?.message ||
          "Terjadi kesalahan saat generate naskah Story Builder dengan Gemini.",
      },
      { status: 500 }
    );
  }
}
