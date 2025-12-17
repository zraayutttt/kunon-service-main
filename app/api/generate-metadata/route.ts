import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-lite" });

// helper untuk ambil objek JSON dari respon Gemini
function extractJsonObject(raw: string) {
  // buang code fence markdown ``` dan ```json
  let text = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  // cari { pertama dan } terakhir
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Tidak menemukan objek JSON di respon AI.");
  }

  const jsonString = text.slice(start, end + 1);
  return JSON.parse(jsonString);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      tags,
      language,
    }: {
      title: string;
      description: string;
      tags: string;
      language: "id" | "en";
    } = body;

    const prompt = `
Kamu adalah pakar SEO YouTube Short.

Data awal:
- Judul: ${title}
- Deskripsi: ${description}
- Tags awal (comma separated): ${tags}
- Bahasa: ${language === "id" ? "Indonesia" : "English"}

Tugas:
1. Perbaiki / optimalkan judul agar lebih klik-able, tetap natural.
2. Tulis deskripsi 2-3 paragraf singkat, optimasi keyword tapi tidak spam.
3. Buat daftar 15-25 tags yang relevan (tanpa #).

SANGAT PENTING:
- Balas HANYA dalam format JSON object.
- JANGAN pakai markdown.
- JANGAN pakai \`\`\` atau code block.
- JANGAN ada teks di luar JSON.

Contoh struktur:
{
  "title": "judul",
  "description": "deskripsi panjang",
  "tags": ["tag1", "tag2", "..."]
}
`;

    const result = await model.generateContent(prompt);
    const rawText = result.response.text().trim();

    console.log("RAW GEMINI METADATA RESPONSE:", rawText);

    let data: any;
    try {
      data = extractJsonObject(rawText);
    } catch (e: any) {
      console.error("Gagal parsing JSON dari Gemini:", e);
      return NextResponse.json(
        {
          error:
            "Gagal parse respon AI. Coba lagi beberapa saat lagi atau cek prompt.",
          // optional: kirim raw untuk debug (jangan dipakai di production)
          // raw: rawText,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      title: data.title ?? title,
      description: data.description ?? description,
      tags: Array.isArray(data.tags) ? data.tags : [],
    });
  } catch (err: any) {
    console.error("Error generate-metadata:", err);
    const message =
      err?.message ||
      (typeof err === "string" ? err : "") ||
      "Terjadi kesalahan saat memanggil Gemini API.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
