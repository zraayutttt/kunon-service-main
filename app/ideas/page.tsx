"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

type SavedIdea = {
  id: string;            // Firestore doc id
  title: string;
  category: string;
  volume: string;
  createdAt: Date | null;
};

export default function IdeasPage() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<SavedIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 🔐 cek login dulu
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setAuthChecking(false);
        router.push("/auth");
        return;
      }

      // ✅ kalau sudah login → listen Firestore real-time
      const colRef = collection(db, "users", user.uid, "ideas");
      const q = query(colRef, orderBy("createdAt", "desc"));

      const unsubIdeas = onSnapshot(
        q,
        (snapshot) => {
          const list: SavedIdea[] = snapshot.docs.map((d) => {
            const raw = d.data() as any;
            return {
              id: d.id,
              // support dua skema: raw.idea (dari NicheFinder) atau raw.title
              title: raw.title ?? raw.idea ?? "",
              category: raw.category ?? "",
              volume: raw.volume ?? "-",
              createdAt: raw.createdAt?.toDate ? raw.createdAt.toDate() : null,
            };
          });

          setIdeas(list);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error("Error onSnapshot ideas:", err);
          setError("Gagal memuat ide. Coba refresh halaman.");
          setLoading(false);
        }
      );

      setAuthChecking(false);

      return () => unsubIdeas();
    });

    return () => unsubAuth();
  }, [router]);

  const handleDelete = async (id: string) => {
    const user = auth.currentUser;
    if (!user) {
      alert("Kamu belum login.");
      return;
    }
    if (!confirm("Hapus ide ini dari daftar?")) return;

    try {
      await deleteDoc(doc(db, "users", user.uid, "ideas", id));
      // tidak perlu setIdeas manual, onSnapshot akan update otomatis
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus ide. Coba lagi sebentar lagi.");
    }
  };

  const hasIdeas = ideas.length > 0;

  if (authChecking) {
    return (
      <main className="min-h-screen bg-[#fdf7ea] flex items-center justify-center">
        <p className="text-xs md:text-sm font-semibold">
          Mengecek sesi login...
        </p>
      </main>
    );
  }

  return (
    <AppShell
      title="Kelola Ide"
      subtitle="Lihat, buka, dan kelola ide yang sudah kamu simpan dari Niche Finder."
    >
      {loading ? (
        <div className="border-4 border-dashed border-black bg-[#fffdf5] p-6 text-center shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
          <p className="font-bold mb-2 text-sm">
            Memuat ide dari database...
          </p>
        </div>
      ) : !hasIdeas ? (
        <div className="border-4 border-dashed border-black bg-[#fffdf5] p-6 text-center shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
          <p className="font-bold mb-2 text-sm">
            Belum ada ide yang tersimpan.
          </p>
          <p className="text-[11px] mb-3">
            Pergi ke halaman <b>Niche Finder</b>, cari niche, lalu klik{" "}
            <b>&quot;Simpan&quot;</b> pada salah satu ide untuk menyimpan ke
            sini.
          </p>
          <Link
            href="/niche-finder"
            className="inline-block border-2 border-black bg-[#ffd84f] px-4 py-2 text-[11px] font-semibold uppercase shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
          >
            Buka Niche Finder
          </Link>
        </div>
      ) : (
        <div className="border-4 border-black bg-white shadow-[6px_6px_0_0_rgba(0,0,0,1)] overflow-x-auto">
          {error && (
            <p className="text-[11px] text-red-600 font-semibold px-3 py-2">
              {error}
            </p>
          )}

          <table className="w-full border-collapse text-[11px] md:text-xs">
            <thead>
              <tr>
                <th className="border-2 border-black bg-[#ffd84f] px-2 py-2 w-8">
                  #
                </th>
                <th className="border-2 border-black bg-[#ffd84f] px-2 py-2">
                  Judul Ide
                </th>
                <th className="border-2 border-black bg-[#ffd84f] px-2 py-2">
                  Kategori
                </th>
                <th className="border-2 border-black bg-[#ffd84f] px-2 py-2">
                  Volume
                </th>
                <th className="border-2 border-black bg-[#ffd84f] px-2 py-2">
                  Dibuat
                </th>
                <th className="border-2 border-black bg-[#ffd84f] px-2 py-2">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {ideas.map((idea, index) => (
                <tr key={idea.id}>
                  <td className="border-2 border-black px-2 py-2 text-center">
                    {index + 1}
                  </td>
                  <td className="border-2 border-black px-2 py-2">
                    {idea.title}
                  </td>
                  <td className="border-2 border-black px-2 py-2">
                    {idea.category || "-"}
                  </td>
                  <td className="border-2 border-black px-2 py-2 text-center">
                    {idea.volume || "-"}
                  </td>
                  <td className="border-2 border-black px-2 py-2 text-center">
                    {idea.createdAt
                      ? idea.createdAt.toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </td>
                  <td className="border-2 border-black px-2 py-2">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/story-builder?title=${encodeURIComponent(
                          idea.title
                        )}&category=${encodeURIComponent(idea.category || "")}`}
                        className="border-2 border-black bg-[#ffe06b] font-bold uppercase text-[10px] px-2 py-1 shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:bg-[#fff1a6]"
                      >
                        Buka Naskah
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(idea.id)}
                        className="border-2 border-black bg-white font-bold uppercase text-[10px] px-2 py-1 shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:bg-[#ffecc1]"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
