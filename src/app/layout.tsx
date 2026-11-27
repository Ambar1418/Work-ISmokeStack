import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const primarySans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SONIA — Living Strategy Tree",
  description:
    "See the unseen. Connect the dots. Make things simpler. Explore Sonia Specialist's interactive Living Strategy Tree and AI Strategy Guide.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${primarySans.variable} h-full antialiased scroll-smooth`}>
      <body className="min-h-full bg-[#081510] text-[#F4EFE4] font-sans selection:bg-[#C9A65B]/30 selection:text-[#F4EFE4] overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
