import type { Metadata } from "next";
import { Alexandria } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";

const alexandria = Alexandria({
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-alexandria",
});

export const metadata: Metadata = {
  title: "راشد | RASHID",
  description: "Evidence-based Islamic dialogue platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={alexandria.variable}><LocaleProvider>{children}</LocaleProvider></body>
    </html>
  );
}
