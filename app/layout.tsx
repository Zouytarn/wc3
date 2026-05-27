import type { Metadata } from "next";
import { Inter, Cinzel } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cinzel = Cinzel({ subsets: ["latin"], weight: ["700", "900"], variable: "--font-cinzel" });

export const metadata: Metadata = {
  title: "WC3 Strategy Advisor",
  description: "Warcraft III: Reforged — unit counter-picks, hero recommendations and build orders for every matchup.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${cinzel.variable} font-[family-name:var(--font-inter)] min-h-screen bg-[#06060c] text-white`}>
        {/* Sticky header — solid bg, no blur (performance) */}
        <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#06060c]">
          <div className="mx-auto flex max-w-7xl items-center px-4 sm:px-6 h-11">
            <Link href="/" className="flex items-center gap-2.5 select-none group">
              <span className="font-mono text-[10px] tracking-[0.2em] text-amber-500/70 group-hover:text-amber-400/90 transition-colors">WC3</span>
              <span className="text-white/15 font-thin">|</span>
              <span
                style={{ fontFamily: "var(--font-cinzel)" }}
                className="text-xs font-bold text-white/70 group-hover:text-white/90 transition-colors tracking-wide"
              >
                Strategy
              </span>
            </Link>

            <div className="ml-auto flex items-center gap-5">
              <Link
                href="/"
                className="font-mono text-[10px] tracking-[0.15em] uppercase text-white/30 hover:text-white/60 transition-colors"
              >
                Home
              </Link>
              <span className="text-white/10">|</span>
              <Link
                href="/builder"
                className="font-mono text-[10px] tracking-[0.15em] uppercase text-amber-500/50 hover:text-amber-400/80 transition-colors"
              >
                Builder
              </Link>
            </div>
          </div>
        </header>

        <main>{children}</main>

        <footer className="mt-24 border-t border-white/[0.06] py-8">
          <p className="text-center text-xs text-white/20">
            WC3 Strategy Advisor · Unit data from{" "}
            <a href="https://liquipedia.net/warcraft/" className="hover:text-white/40 transition-colors" target="_blank" rel="noopener noreferrer">
              Liquipedia
            </a>{" "}
            (CC-BY-SA 3.0)
          </p>
        </footer>
      </body>
    </html>
  );
}
