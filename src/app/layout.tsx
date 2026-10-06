import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import { OnboardingProvider } from "@/components/onboarding/OnboardingProvider";
import { SessionProvider } from "@/components/session/SessionProvider";

const alexandria = localFont({
  src: "./fonts/Alexandria-VariableFont_wght.ttf",
  weight: "100 900",
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
      <body className={alexandria.variable}><LocaleProvider><OnboardingProvider><SessionProvider>{children}</SessionProvider></OnboardingProvider></LocaleProvider></body>
    </html>
  );
}
