"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";

export default function ThumbnailPromptPage() {
  // ✅ tanpa dummy
  const [style, setStyle] = useState("");
  const [color, setColor] = useState("");
  const [emotion, setEmotion] = useState("");
  const [elements, setElements] = useState("");
  const [prompt, setPrompt] = useState("");

  const handleGenerate = async () => {
    setPrompt("");
    try {
      const res = await fetch("/api/generate-thumbnail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          style,
          color,
          emotion,
          elements,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal generate prompt.");

      setPrompt(data.prompt || "");
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan saat generate thumbnail prompt.");
    }
  };

  return (
    <AppShell
      title="Thumbnail Prompt"
      subtitle="Rancang prompt thumbnail yang klik-able untuk Midjourney, DALL·E, dsb."
    >
      <div className="grid gap-6 lg:grid-cols-2 text-xs md:text-sm">
        {/* LEFT: FORM */}
        <div className="border-4 border-black bg-[#fffdf5] p-4 md:p-5 shadow-[6px_6px_0_0_rgba(0,0,0,1)] flex flex-col gap-3">
          <span className="font-bold uppercase mb-1">
            Atur Gaya & Komposisi Thumbnail
          </span>

          {/* STYLE BUTTON GROUP */}
          <div className="space-y-1">
            <label className="font-bold">Style</label>
            <div className="flex flex-wrap gap-2">
              {[
                "3D Blocky",
                "Anime Outline",
                "Realistic Cinematic",
                "Minimalist Clean",
              ].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setStyle(item)}
                  className={`border-2 border-black px-3 py-2 text-[11px] font-semibold shadow-[3px_3px_0_0_rgba(0,0,0,1)] ${
                    style === item
                      ? "bg-black text-[#ffd84f]"
                      : "bg-white hover:bg-[#ffeef8]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold">Warna Dominan</label>
            <input
              className="w-full border-2 border-black px-2 py-2 bg-white outline-none focus:bg-[#ffeef8]"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="contoh: kuning neon, pink terang..."
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold">Ekspresi / Emosi</label>
            <input
              className="w-full border-2 border-black px-2 py-2 bg-white outline-none focus:bg-[#ffeef8]"
              value={emotion}
              onChange={(e) => setEmotion(e.target.value)}
              placeholder="contoh: kaget, panik, ekspresi berlebihan..."
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold">Elemen Visual Utama</label>
            <textarea
              className="w-full border-2 border-black px-2 py-2 bg-white outline-none focus:bg-[#ffeef8] min-h-[90px] resize-none"
              value={elements}
              onChange={(e) => setElements(e.target.value)}
              placeholder="contoh: karakter utama di tengah, musuh di belakang, judul besar di atas..."
            />
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            className="mt-2 border-2 border-black bg-[#ff4fa3] text-white font-bold uppercase text-[11px] px-4 py-2 shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
          >
            Generate Prompt
          </button>
        </div>

        {/* RIGHT: PROMPT OUTPUT */}
        <div className="border-4 border-black bg-white p-4 md:p-5 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
          <p className="text-[10px] font-bold uppercase mb-2">
            Prompt Thumbnail Untuk Midjourney / DALL·E / dsb
          </p>
          <textarea
            readOnly
            value={prompt}
            placeholder="Klik Generate Prompt untuk membuat prompt thumbnail..."
            className="w-full border-2 border-black px-2 py-2 bg-[#f5f5f5] min-h-[220px] resize-none text-[12px]"
          />
        </div>
      </div>
    </AppShell>
  );
}
