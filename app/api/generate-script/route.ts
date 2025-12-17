// app/api/generate-script/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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
    }: {
      title: string;
      description: string;
      theme: string;
      clips: number;
      mode: "text_to_video" | "script_to_video";
      style: string;
      camera: string;
      category: string;
    } = body;

    if (!title && !description) {
      return NextResponse.json(
        { error: "Minimal isi judul atau deskripsi." },
        { status: 400 }
      );
    }

    const prompt = `
Kamu adalah scriptwriter untuk konten TikTok/YouTube Shorts.

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
    const story = result.response.text().trim();

    return NextResponse.json({ story });
  } catch (err: any) {
    console.error("Error generate-script:", err);
    const message =
      err?.message ||
      (typeof err === "string" ? err : "") ||
      "Terjadi kesalahan saat memanggil Gemini API.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
