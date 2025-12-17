"use client";

import { useRouter } from "next/navigation";

export default function TopBar() {
  const router = useRouter();

  const handleLogout = () => {
    // TODO: hapus token kalau sudah pakai auth beneran
    // Untuk sekarang langsung kembali ke halaman login
    router.push("/");
  };

  return (
    <header className="border-b-4 border-black bg-[#ffd84f] px-6 py-4 flex items-center justify-between">
      <p className="font-bold tracking-wide text-[13px]">
  CREATOR SUITE ✦ AI SHORT GENERATOR
</p>

      {/* Tombol Logout */}
      <button
        onClick={handleLogout}
        className="border-2 border-black px-3 py-1 text-[11px] md:text-xs font-semibold uppercase bg-white hover:bg-[#ffecc1]
        shadow-[4px_4px_0_0_rgba(0,0,0,1)]
        active:translate-x-[2px] active:translate-y-[2px]
        active:shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
      >
        Logout
      </button>
    </header>
  );
}
