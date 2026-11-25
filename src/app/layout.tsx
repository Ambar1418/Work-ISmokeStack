import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Plus_Jakarta_Sans,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";

const editorialSerif = Cormorant_Garamond({
  variable: "--font-editorial",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const bodySans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const monoFont = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "SONIA — The Architect of Clarity",
  description:
    "See the unseen. Connect the dots. Make things simpler. An interactive botanical storytelling experience exploring Sonia's professional identity, thinking philosophy, and leadership journey.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${editorialSerif.variable} ${bodySans.variable} ${monoFont.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full bg-[#061725] text-[#F5F7F4] font-sans selection:bg-[#38D996]/25 selection:text-[#A6F2C8] overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
