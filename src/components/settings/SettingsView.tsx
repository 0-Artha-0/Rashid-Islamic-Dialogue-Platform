"use client";

import Image from "next/image";
import { useState } from "react";
import { Sidebar } from "@/components/home/Sidebar";
import { useLocale } from "@/components/i18n/LocaleProvider";

export function SettingsView() {
  const { locale } = useLocale();
  const [language, setLanguage] = useState("العربية");
  const [notifications, setNotifications] = useState(false);
  const [compact, setCompact] = useState(false);

  return (
    <div dir={locale === "en" ? "ltr" : "rtl"} className="relative isolate flex min-h-screen w-full flex-col-reverse overflow-hidden bg-[#f8f4eb] text-[#365f4f] lg:h-screen lg:min-h-0 lg:flex-row">
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <Image src="/images/onboarding-background.jpeg" alt="" fill priority sizes="100vw" className="object-cover object-center" />
      </div>
      <Sidebar activeId="settings" />
      <main className="relative z-10 flex min-h-screen flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:min-h-0">
        <section className="flex w-full max-w-[620px] flex-col items-center text-center">
          <h1 className="text-[20px] font-bold leading-[1.3]">{locale === "en" ? "Settings" : "الإعدادات"}</h1>
          <p className="mt-1 text-[10px] leading-4 text-[#65796f]">{locale === "en" ? "Preferences for this session only" : "تفضيلات هذه الجلسة فقط"}</p>
          <div className="mt-3 w-full space-y-1.5">
            <button type="button" onClick={() => setLanguage(language === "العربية" ? "English" : "العربية")} className="flex w-full items-center justify-between rounded-[10px] border border-[#cbd9cf] bg-[#e7efe8]/90 px-3 py-2 text-right text-[10px]">
              <span className="font-semibold">{locale === "en" ? "Language" : "اللغة"}</span><span className="text-[#65796f]">{locale === "en" ? (language === "العربية" ? "Arabic" : "English") : language}</span>
            </button>
            <button type="button" onClick={() => setNotifications((value) => !value)} className="flex w-full items-center justify-between rounded-[10px] border border-[#e4c9c2] bg-[#f4e5e1]/90 px-3 py-2 text-right text-[10px]">
              <span className="font-semibold">{locale === "en" ? "Notifications" : "التنبيهات"}</span><span className="text-[#65796f]">{notifications ? (locale === "en" ? "On" : "مفعلة") : (locale === "en" ? "Off" : "متوقفة")}</span>
            </button>
            <button type="button" onClick={() => setCompact((value) => !value)} className="flex w-full items-center justify-between rounded-[10px] border border-[#ddc89f] bg-[#f1e7d2]/90 px-3 py-2 text-right text-[10px]">
              <span className="font-semibold">{locale === "en" ? "Compact view" : "عرض مختصر"}</span><span className="text-[#65796f]">{compact ? (locale === "en" ? "On" : "مفعل") : (locale === "en" ? "Off" : "متوقف")}</span>
            </button>
          </div>
          <p className="mt-2 text-[9px] leading-4 text-[#7a8d84]">{locale === "en" ? "These preferences are temporary and will not be saved after leaving the page." : "هذه التفضيلات مؤقتة ولن تُحفظ بعد مغادرة الصفحة."}</p>
        </section>
      </main>
    </div>
  );
}
