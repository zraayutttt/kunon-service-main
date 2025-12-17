// app/api/generate-thumbnail/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      style,
      color,
      emotion,
      elements,
    }: {
      style: string;
      color: string;
      emotion: string;
      elements: string;
    } = body;

    const prompt = `
Buatkan prompt untuk AI image (Midjourney / DALL·E) khusus YouTube thumbnail.

Detail:
- Style: ${style}
- Warna dominan: ${color}
- Ekspresi karakter: ${emotion}
- Elemen komposisi: ${elements}

Tulis 1 paragraf prompt bahasa Inggris yang sangat detail,
menggunakan kata kunci penting untuk thumbnail YouTube (clickable, high contrast, rim light, dsb).

Balas HANYA prompt final, tanpa penjelasan lain.
`;

    const result = await model.generateContent(prompt);
    const finalPrompt = result.response.text().trim();

    return NextResponse.json({ prompt: finalPrompt });
  } catch (err: any) {
    console.error("Error generate-thumbnail:", err);
    const message =
      err?.message ||
      (typeof err === "string" ? err : "") ||
      "Terjadi kesalahan saat memanggil Gemini API.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
