"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

type Region = "id" | "us";
type TimeRange = "1d" | "7d" | "30d";
type Volume = "High" | "Medium" | "Low";

type IdeaResult = {
  id: number;
  idea: string;
  category: string;
  volume: Volume | string;
};

export default function NicheFinderForm() {
  const [keyword, setKeyword] = useState("");
  const [region, setRegion] = useState<Region>("id");
  const [timeRange, setTimeRange] = useState<TimeRange>("1d");

  const [results, setResults] = useState<IdeaResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const router = useRouter();

  const handleSearch = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!keyword.trim()) {
      setErrorMsg("Keyword tidak boleh kosong.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/generate-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: keyword.trim(),
          region,
          timeRange,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Gagal menghubungi API generate-ideas.");
      }

      setResults(Array.isArray(data.ideas) ? data.ideas : []);
    } catch (err: any) {
      console.error("Error fetch /api/generate-ideas:", err);
      setErrorMsg(err?.message || "Terjadi kesalahan saat ambil ide.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (idea: IdeaResult) => {
    const user = auth.currentUser;
    if (!user) {
      alert("Kamu belum login.");
      return;
    }

    try {
      await addDoc(collection(db, "users", user.uid, "ideas"), {
        title: idea.idea,
        category: idea.category ?? "",
        volume: idea.volume ?? "-",
        keyword: keyword.trim(),
        region,
        timeRange,
        createdAt: serverTimestamp(),
      });

      alert("Ide disimpan ke menu Kelola Ide ✅");
    } catch (err: any) {
      console.error("Gagal save ke Firestore:", err);

      if (err.code === "permission-denied") {
        alert(
          "Gagal menyimpan ide (permission-denied).\n\n" +
            "Cek lagi rules Firestore kamu, pastikan user yang login boleh menulis ke /users/{uid}/ideas."
        );
      } else {
        alert(
          `Gagal menyimpan ide. Coba lagi sebentar lagi.\n\nDetail: ${
            err.message || err.code || "unknown error"
          }`
        );
      }
    }
  };

  const handleMetadata = (idea: IdeaResult) => {
    const params = new URLSearchParams({
      title: idea.idea,
      category: idea.category ?? "",
    });
    router.push(`/metadata?${params.toString()}`);
  };

  const handleOpenYoutube = (idea: IdeaResult) => {
    const q = encodeURIComponent(idea.idea || keyword);
    window.open(
      `https://www.youtube.com/results?search_query=${q}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const hasResults = results.length > 0;

  return (
    <div className="grid md:grid-cols-[320px,1fr] gap-4 md:gap-6">
      {/* FORM KIRI */}
      <div className="border-4 border-black bg-[#fffdf5] p-4 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
        <h2 className="font-extrabold text-sm uppercase mb-1">Temukan Ide</h2>
        <p className="text-[11px] mb-4">
          Gunakan formulir di bawah ini untuk menemukan niche berdasarkan kata
          kunci atau video yang sedang viral. Konfigurasikan wilayah dan waktu
          pencarian sebelum klik tombol.
        </p>

        <form onSubmit={handleSearch} className="space-y-4">
          {/* Cari berdasarkan keyword */}
          <div>
            <label className="block text-[11px] font-bold uppercase mb-1">
              1. Cari berdasarkan Kata Kunci
            </label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full border-2 border-black px-2 py-2 text-sm bg-white focus:bg-[#fff1f8] outline-none"
              placeholder="Contoh: Minecraft, horror game, football, dll"
            />
          </div>

          {/* Region & Time */}
          <div className="border-t-2 border-dashed border-black pt-3 mt-3">
            <p className="text-[11px] font-bold uppercase mb-2">
              2. Temukan Video Viral
            </p>

            <div className="mb-3">
              <p className="text-[11px] font-semibold mb-1">
                Berdasarkan Wilayah
              </p>
              <div className="flex flex-wrap gap-3 text-[11px]">
                <label className="inline-flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="region"
                    value="id"
                    checked={region === "id"}
                    onChange={() => setRegion("id")}
                    className="accent-black"
                  />
                  <span>Indonesia</span>
                </label>
                <label className="inline-flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="region"
                    value="us"
                    checked={region === "us"}
                    onChange={() => setRegion("us")}
                    className="accent-black"
                  />
                  <span>Amerika Serikat</span>
                </label>
              </div>
            </div>

            <div className="mb-3">
              <p className="text-[11px] font-semibold mb-1">
                Berdasarkan Waktu
              </p>
              <div className="flex flex-wrap gap-3 text-[11px]">
                <label className="inline-flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="timeRange"
                    value="1d"
                    checked={timeRange === "1d"}
                    onChange={() => setTimeRange("1d")}
                    className="accent-black"
                  />
                  <span>24 Jam</span>
                </label>
                <label className="inline-flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="timeRange"
                    value="7d"
                    checked={timeRange === "7d"}
                    onChange={() => setTimeRange("7d")}
                    className="accent-black"
                  />
                  <span>7 Hari</span>
                </label>
                <label className="inline-flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="timeRange"
                    value="30d"
                    checked={timeRange === "30d"}
                    onChange={() => setTimeRange("30d")}
                    className="accent-black"
                  />
                  <span>30 Hari</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full border-2 border-black bg-[#ff4fa3] text-white font-bold text-xs uppercase py-2 shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-[1px_1px_0_0_rgba(0,0,0,1)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Mengambil Ide..." : "Cari Niche / Video Viral"}
            </button>
          </div>

          <div className="border-2 border-black bg-white px-3 py-2 text-[10px]">
            <p className="font-bold uppercase mb-1">Tips</p>
            <p>
              Setelah menemukan ide yang cocok, klik tombol <b>Simpan</b> di
              tabel hasil. Ide akan masuk ke menu <b>Kelola Ide</b> dan bisa
              dipakai untuk generate naskah, metadata, dan thumbnail.
            </p>
          </div>
        </form>
      </div>

      {/* HASIL KANAN */}
      <div className="border-4 border-black bg-white shadow-[6px_6px_0_0_rgba(0,0,0,1)] overflow-x-auto">
        <div className="border-b-2 border-black px-3 py-2 flex items-center justify-between">
          <h2 className="font-extrabold text-xs md:text-sm uppercase">
            Hasil Pencarian
          </h2>
          {hasResults && (
            <span className="text-[10px] md:text-[11px]">
              Menampilkan {results.length} ide
            </span>
          )}
        </div>

        {errorMsg && (
          <p className="text-[11px] text-red-600 font-semibold px-3 py-2">
            {errorMsg}
          </p>
        )}

        {!hasResults && !loading && !errorMsg && (
          <div className="p-6 text-center text-[11px]">
            <p className="font-bold mb-2">
              Belum ada hasil. Mulai dengan memasukkan kata kunci di sebelah
              kiri.
            </p>
            <p>
              Setelah itu klik tombol{" "}
              <b>&quot;Cari Niche / Video Viral&quot;</b> untuk meminta ide dari
              AI.
            </p>
          </div>
        )}

        {hasResults && (
          <table className="w-full border-collapse text-[11px] md:text-xs">
            <thead>
              <tr>
                <th className="border-2 border-black bg-[#ffd84f] px-2 py-2 w-8">
                  #
                </th>
                <th className="border-2 border-black bg-[#ffd84f] px-2 py-2">
                  Ide
                </th>
                <th className="border-2 border-black bg-[#ffd84f] px-2 py-2">
                  Video Populer
                </th>
                <th className="border-2 border-black bg-[#ffd84f] px-2 py-2">
                  Volume Pencarian
                </th>
                <th className="border-2 border-black bg-[#ffd84f] px-2 py-2">
                  Tindakan
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map((idea) => (
                <tr key={idea.id}>
                  <td className="border-2 border-black px-2 py-2 text-center">
                    {idea.id}
                  </td>
                  <td className="border-2 border-black px-2 py-2 align-top">
                    <p className="font-semibold mb-1">{idea.idea}</p>
                    {idea.category && (
                      <p className="text-[10px] opacity-80">
                        Kategori: {idea.category}
                      </p>
                    )}
                  </td>
                  <td className="border-2 border-black px-2 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleOpenYoutube(idea)}
                      className="border-2 border-black px-2 py-1 text-[10px] font-bold uppercase bg-white shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-[#fff1a6]"
                    >
                      Tampilkan Video
                    </button>
                  </td>
                  <td className="border-2 border-black px-2 py-2 text-center">
                    {idea.volume || "-"}
                  </td>
                  <td className="border-2 border-black px-2 py-2 text-center">
                    <div className="flex flex-col md:flex-row gap-2 justify-center">
                      <button
                        type="button"
                        onClick={() => handleMetadata(idea)}
                        className="border-2 border-black bg-[#ffffff] text-black text-[10px] font-bold px-2 py-1 uppercase shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-[#fff1a6]"
                      >
                        Metadata
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSave(idea)}
                        className="border-2 border-black bg-[#ff4fa3] text-white text-[10px] font-bold px-2 py-1 uppercase shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-[#ff80c0]"
                      >
                        Simpan
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
