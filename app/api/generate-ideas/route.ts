import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

type Volume = "High" | "Medium" | "Low";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      keyword,
      region,
      timeRange,
    }: {
      keyword: string;
      region: "id" | "us";
      timeRange: "1d" | "7d" | "30d";
    } = body;

    if (!keyword) {
      return NextResponse.json(
        { error: "Keyword wajib diisi." },
        { status: 400 }
      );
    }

    const prompt = `
Kamu adalah asisten riset ide konten YouTube Shorts.

Cari 5-10 ide video berdasarkan:
- keyword: "${keyword}"
- region: "${region}"
- timeRange: "${timeRange}"

Balas HANYA dalam format JSON array, tanpa teks lain.
Setiap item harus seperti ini:
{
  "idea": "judul ide singkat",
  "category": "kategori singkat",
  "volume": "High" | "Medium" | "Low"
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    let ideas: any[] = [];
    try {
      ideas = JSON.parse(
        text
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim()
      );
    } catch {
      ideas = [];
    }

    const ideasWithId = ideas.map((item, index) => ({
      id: index + 1,
      idea: item.idea ?? "",
      category: item.category ?? "",
      volume: (item.volume as Volume) ?? "Medium",
    }));

    return NextResponse.json({ ideas: ideasWithId });
  } catch (err: any) {
    console.error("Error generate-ideas:", err);
    return NextResponse.json(
      {
        error:
          err?.message ||
          "Terjadi kesalahan saat memanggil Gemini API untuk generate ide.",
      },
      { status: 500 }
    );
  }
}
