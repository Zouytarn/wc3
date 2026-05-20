import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WC3 Strategy Advisor",
  description: "Warcraft III: Reforged — unit counter-picks, hero recommendations and build orders for every matchup.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-[#06060c] text-white`}>
        {/* Sticky frosted header */}
        <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#06060c]/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 sm:px-6 h-12">
            <Link href="/" className="flex items-center gap-2.5 select-none">
              <span className="text-lg">⚔️</span>
              <span className="font-semibold text-white tracking-tight text-sm">WC3 Strategy</span>
            </Link>
            <div className="ml-auto">
              <Link
                href="/"
                className="text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                Home
              </Link>
            </div>
          </div>
        </header>

        <main>{children}</main>

        <footer className="mt-24 border-t border-white/[0.06] py-8">
          <p className="text-center text-xs text-white/20">
            WC3 Strategy Advisor · Data based on Warcraft III: Reforged
          </p>
        </footer>
      </body>
    </html>
  );
}
