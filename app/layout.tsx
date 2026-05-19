import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WC3 Strategy Advisor",
  description: "Warcraft III: Reforged – unit counter-picks, hero recommendations, and build orders for every matchup.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0a0f] text-[#e8e0d0] antialiased">
        <header className="border-b border-[#3a2a0a] bg-black/40 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
            <span className="text-2xl">⚔️</span>
            <div>
              <h1 className="text-lg font-bold text-amber-400 leading-none">WC3 Strategy Advisor</h1>
              <p className="text-xs text-amber-700">Warcraft III: Reforged</p>
            </div>
            <nav className="ml-auto flex gap-4 text-sm text-amber-600 hover:text-amber-400">
              <a href="/" className="hover:text-amber-300 transition-colors">Home</a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="border-t border-[#3a2a0a] mt-16 py-6 text-center text-xs text-amber-900">
          WC3 Strategy Advisor — data based on Warcraft III: Reforged mechanics
        </footer>
      </body>
    </html>
  );
}
