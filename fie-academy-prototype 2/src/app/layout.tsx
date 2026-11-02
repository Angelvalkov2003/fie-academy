import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { HtmlLang } from "@/lib/i18n";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});
const serif = Source_Serif_4({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FIE Fencing Academy",
  description:
    "The official online training platform of the Fédération Internationale d'Escrime — prototype.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${serif.variable}`}>
      <body>
        <HtmlLang />
        {children}
      </body>
    </html>
  );
}
