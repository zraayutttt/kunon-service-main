"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { useSearchParams } from "next/navigation";

function MetadataContent() {
  const searchParams = useSearchParams();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [language, setLanguage] = useState<"id" | "en">("id");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔹 ambil title & category dari URL (?title=...&category=...)
  useEffect(() => {
    const qTitle = searchParams.get("title");
    const qCategory = searchParams.get("category");

    if (qTitle) {
      setTitle(qTitle);
      setDescription(
        `Video short dengan ide: ${qTitle}${
          qCategory ? ` (${qCategory})` : ""
        }. Sesuaikan deskripsi ini dengan gaya kontenmu.`
      );
      setTags("short, shorts, tiktok, youtube shorts");
    }
  }, [searchParams]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/generate-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          tags,
          language,
        }),
      });

      const data = await res.json();
      console.log("API /api/generate-metadata response:", data);

      if (!res.ok) throw new Error(data.error || "Gagal generate metadata.");

      if (data.title) setTitle(data.title);
      if (data.description) setDescription(data.description);
      if (data.tags) {
        const tagString = Array.isArray(data.tags)
          ? data.tags.join(", ")
          : String(data.tags);
        setTags(tagString);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan saat generate metadata.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell
      title="Metadata YouTube"
      subtitle="Generate judul, deskripsi, dan tag untuk video short kamu."
    >
      <div className="grid gap-6 lg:grid-cols-2 text-xs md:text-sm">
        {/* LEFT: FORM */}
        <div className="border-4 border-black bg-[#fffdf5] p-4 md:p-5 shadow-[6px_6px_0_0_rgba(0,0,0,1)] flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="font-bold uppercase">Generator Metadata</span>
            <span className="border-2 border-black px-2 py-1 text-[10px] bg-white font-semibold">
              {language === "id" ? "Bahasa: ID" : "Language: EN"}
            </span>
          </div>

          <div className="space-y-1">
            <label className="font-bold">Judul</label>
            <input
              className="w-full border-2 border-black px-2 py-2 bg-white outline-none focus:bg-[#ffeef8]"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold">Deskripsi</label>
            <textarea
              className="w-full border-2 border-black px-2 py-2 bg-white outline-none focus:bg-[#ffeef8] min-h-[120px] resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold">Tags (pisahkan dengan koma)</label>
            <textarea
              className="w-full border-2 border-black px-2 py-2 bg-white outline-none focus:bg-[#ffeef8] min-h-[70px] resize-none"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between gap-4 mt-2">
            <div className="flex gap-2 items-center">
              <span className="font-bold">Bahasa:</span>
              <button
                type="button"
                onClick={() => setLanguage("id")}
                className={`border-2 border-black px-2 py-1 text-[11px] font-semibold ${
                  language === "id" ? "bg-black text-[#ffd84f]" : "bg-white"
                }`}
              >
                ID
              </button>
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`border-2 border-black px-2 py-1 text-[11px] font-semibold ${
                  language === "en" ? "bg-black text-[#ffd84f]" : "bg-white"
                }`}
              >
                EN
              </button>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="border-2 border-black bg-[#ff8a3d] px-3 py-2 font-semibold shadow-[3px_3px_0_0_rgba(0,0,0,1)] disabled:opacity-60"
            >
              {loading ? "Generating..." : "Generate dengan AI"}
            </button>
          </div>

          {error && (
            <p className="mt-2 text-[11px] text-red-600 font-semibold">
              {error}
            </p>
          )}
        </div>

        {/* RIGHT: PREVIEW */}
        <div className="border-4 border-black bg-white p-4 md:p-5 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
          <div className="border-2 border-black p-3 bg-[#f4f4f4] mb-3">
            <p className="text-[10px] uppercase font-bold mb-1">
              Preview Metadata YouTube
            </p>
            <p className="text-[11px]">
              Ini adalah contoh tampilan judul, deskripsi, dan tag yang akan
              kamu gunakan di YouTube.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-bold uppercase mb-1">Judul</p>
              <p className="border-2 border-black px-2 py-2 bg-white text-[12px]">
                {title}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase mb-1">Deskripsi</p>
              <div className="border-2 border-black px-2 py-2 bg-white text-[12px] whitespace-pre-wrap">
                {description}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase mb-1">Tags</p>
              <div className="border-2 border-black px-2 py-2 bg-white text-[11px]">
                {tags
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .map((t) => `#${t.replace(/\s+/g, "")}`)
                  .join(" ")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function MetadataPageWrapper() {
  return (
    <Suspense fallback={<div className="p-4 text-xs">Loading metadata...</div>}>
      <MetadataContent />
    </Suspense>
  );
}
