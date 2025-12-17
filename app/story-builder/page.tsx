"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import AppShell from "@/components/layout/AppShell";

function StoryBuilderContent() {
  const searchParams = useSearchParams();
  const initialTitle = searchParams.get("title") || "";
  const category = searchParams.get("category") || "General";

  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState("");

  // TEMA, CLIP, STYLE sekarang tetap string, tapi diisi dari <select>
  const [theme, setTheme] = useState("Action");
  const [clips, setClips] = useState("8");
  const [mode, setMode] = useState<"text_to_story" | "text_to_video">(
    "text_to_story"
  );
  const [style, setStyle] = useState("Blocky 3D");
  const [camera, setCamera] = useState<"Static Shot" | "Camera Movement">(
    "Static Shot"
  );

  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setErrorMsg(null);
    setOutput("");

    try {
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          theme,
          clips,
          mode,
          style,
          camera,
          category,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal generate cerita.");

      setOutput(data.story || "Tidak ada naskah yang diterima dari server.");
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell
      title="Naskah / Story Builder"
      subtitle="Bangun naskah video short dengan struktur clip yang jelas dan konsisten."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* LEFT FORM */}
        <div className="space-y-4">
          {/* Judul */}
          <div>
            <label className="font-bold text-xs uppercase">Judul Video</label>
            <input
              className="w-full border-2 border-black px-2 py-2 bg-white focus:bg-[#fff1f8]"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Minecraft Shorts dan Konten Viral (Animasi, Memes)"
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="font-bold text-xs uppercase">
              Deskripsi Singkat
            </label>
            <textarea
              className="w-full border-2 border-black px-2 py-2 bg-white focus:bg-[#fff1f8]"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="minecraft sedang berkelahi..."
            />
          </div>

          {/* TEMA → SELECT */}
          <div>
            <label className="font-bold text-xs uppercase">Tema</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {[
                "Action",
                "Comedy",
                "Horror",
                "Drama",
                "Mystery",
                "Adventure",
                "Slice of Life",
                "Education",
              ].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  className={`px-3 py-2 border-2 border-black text-[11px] font-bold uppercase shadow-[3px_3px_0_0_rgba(0,0,0,1)]
          ${
            theme === t
              ? "bg-black text-[#ffd84f]"
              : "bg-white hover:bg-[#ffecc1]"
          }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* JUMLAH CLIP → SELECT */}
          <div>
            <label className="font-bold text-xs uppercase">Jumlah Clip</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {["4", "6", "8", "10", "12"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setClips(c)}
                  className={`px-3 py-2 border-2 border-black text-[11px] font-bold uppercase shadow-[3px_3px_0_0_rgba(0,0,0,1)]
          ${
            clips === c
              ? "bg-black text-[#ffd84f]"
              : "bg-white hover:bg-[#ffecc1]"
          }`}
                >
                  {c} Clip
                </button>
              ))}
            </div>
          </div>

          {/* GAYA VISUAL → SELECT */}
          <div>
            <label className="font-bold text-xs uppercase">Gaya Visual</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {[
                "Blocky 3D",
                "Anime",
                "Pixel Art",
                "Realistic",
                "Cartoon",
                "Cinematic",
                "Minimalist",
              ].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStyle(s)}
                  className={`px-3 py-2 border-2 border-black text-[11px] font-bold uppercase shadow-[3px_3px_0_0_rgba(0,0,0,1)]
          ${
            style === s
              ? "bg-black text-[#ffd84f]"
              : "bg-white hover:bg-[#ffecc1]"
          }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Gerakan kamera */}
          <div>
            <label className="font-bold text-xs uppercase">
              Gerakan Kamera
            </label>

            <div className="flex flex-wrap gap-2 mt-1">
              {["Static Shot", "Camera Movement"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() =>
                    setCamera(c as "Static Shot" | "Camera Movement")
                  }
                  className={`
          px-3 
          py-2 
          border-2 
          border-black 
          text-[11px] 
          font-bold 
          uppercase 
          shadow-[3px_3px_0_0_rgba(0,0,0,1)]
          ${
            camera === c
              ? "bg-black text-[#ffd84f]"
              : "bg-white hover:bg-[#ffecc1]"
          }
        `}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Tombol */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="mt-2 border-2 border-black bg-[#ff4fa3] text-white font-bold uppercase text-[11px] px-4 py-2 shadow-[4px_4px_0_0_rgba(0,0,0,1)]
            active:translate-x-[2px] active:translate-y-[2px]
            active:shadow-[2px_2px_0_0_rgba(0,0,0,1)] disabled:opacity-60"
          >
            {loading ? "Sabar Yaa..." : "Buat Cerita dengan AI"}
          </button>

          {errorMsg && (
            <p className="text-red-600 font-semibold text-xs">{errorMsg}</p>
          )}
        </div>

        {/* RIGHT OUTPUT */}
        <div>
          <label className="font-bold text-xs uppercase">Hasil Naskah</label>
          <textarea
            className="w-full h-[400px] border-2 border-black px-3 py-3 bg-[#fffdf5]"
            value={output}
            readOnly
          />
        </div>
      </div>
    </AppShell>
  );
}

export default function StoryBuilderPage() {
  return (
    <Suspense
      fallback={<div className="p-4 text-xs">Loading story builder...</div>}
    >
      <StoryBuilderContent />
    </Suspense>
  );
}
