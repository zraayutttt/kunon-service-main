"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";

interface AppShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

const NAV_ITEMS = [
  { href: "/niche-finder", label: "Niche Finder" },
  { href: "/story-builder", label: "Naskah" },
  { href: "/metadata", label: "Metadata" },
  { href: "/thumbnail-prompt", label: "Thumbnail" },
  { href: "/ideas", label: "Kelola Ide" }, // sesuaikan dengan route-mu
];

export default function AppShell({ title, subtitle, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // 🔐 Proteksi: semua page yang pakai AppShell wajib login
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        setUser(null);
        setCheckingAuth(false);
        router.push("/"); // kembali ke halaman login/root
        return;
      }
      setUser(u);
      setCheckingAuth(false);
    });

    return () => unsub();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/"); // setelah logout balik ke login
    } catch (err) {
      console.error(err);
      alert("Gagal logout. Coba lagi sebentar lagi.");
    }
  };

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-[#fdf7ea] flex items-center justify-center">
        <p className="text-xs md:text-sm font-semibold">
          Mengecek sesi login...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fdf7ea] text-black">
      <div className="max-w-6xl mx-auto my-6 border-4 border-black bg-white shadow-[10px_10px_0_0_rgba(0,0,0,1)]">
        {/* TOP BAR */}
        <header className="border-b-4 border-black bg-[#ffd84f] px-4 md:px-6 py-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-base md:text-lg font-extrabold uppercase tracking-wide">
                {title}
              </h1>
              {subtitle && (
                <p className="text-[10px] md:text-xs">{subtitle}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Nav desktop */}
              <nav className="hidden md:flex gap-2 text-[11px] font-semibold uppercase">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`border-2 border-black px-2 py-1 shadow-[3px_3px_0_0_rgba(0,0,0,1)]
                      ${
                        pathname === item.href
                          ? "bg-black text-[#ffd84f]"
                          : "bg-white hover:bg-[#fff1a6]"
                      }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              {/* User + Logout */}
              <div className="flex items-center gap-2">
                {user && (
                  <span className="hidden md:inline-block text-[11px] font-semibold px-2 py-1 border-2 border-black bg-white">
                    {user.displayName || user.email}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="border-2 border-black bg-[#ff4fa3] text-white text-[11px] font-bold uppercase px-3 py-1 shadow-[3px_3px_0_0_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Nav mobile (selalu kelihatan di bawah judul) */}
          <nav className="mt-2 flex md:hidden gap-2 text-[11px] font-semibold uppercase overflow-x-auto pb-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`border-2 border-black px-2 py-1 shadow-[3px_3px_0_0_rgba(0,0,0,1)] whitespace-nowrap
                  ${
                    pathname === item.href
                      ? "bg-black text-[#ffd84f]"
                      : "bg-white hover:bg-[#fff1a6]"
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        {/* CONTENT */}
        <section className="px-4 md:px-6 py-5">{children}</section>
      </div>
    </main>
  );
}
