"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Sidebar } from "@/components/home/Sidebar";
import { useLocale } from "@/components/i18n/LocaleProvider";

const topics = [
  { label: "العقيدة", description: "التوحيد وأصول الإيمان", tone: "sage" },
  { label: "القرآن", description: "تفسير الآيات والتدبر", tone: "rose" },
  { label: "الحديث والسنة", description: "السنة النبوية وشروحها", tone: "sand" },
  { label: "السيرة", description: "حياة النبي ﷺ ومواقفه", tone: "sand" },
  { label: "الفقه", description: "العبادات وأحكام الحياة", tone: "rose" },
  { label: "الأخلاق", description: "القيم والسلوك في الإسلام", tone: "sage" },
  { label: "مقارنة الأديان", description: "فهم المعتقدات الأخرى", tone: "sage" },
  { label: "الشبهات", description: "إجابة التساؤلات والتفكير الناقد", tone: "rose" },
  { label: "أسئلة الوجود والغاية", description: "المعنى والغاية من الحياة", tone: "sand" },
] as const;
const topicsEn = [
  ["Creed", "Monotheism and the foundations of belief"], ["Quran", "Interpretation and reflection"], ["Hadith & Sunnah", "Prophetic tradition and its explanations"], ["Prophetic Biography", "The Prophet's life and example"], ["Jurisprudence", "Worship and practical rulings"], ["Ethics", "Values and conduct in Islam"], ["Comparative Religion", "Understanding other beliefs"], ["Misconceptions", "Questions and critical thinking"], ["Existential Questions & Purpose", "Meaning and purpose in life"],
] as const;

const topicTones = {
  sage: "border-[#cbd9cf] bg-[#e7efe8]/90",
  rose: "border-[#e4c9c2] bg-[#f4e5e1]/90",
  sand: "border-[#ddc89f] bg-[#f1e7d2]/90",
};

export function ExploreTopicsView() {
  const { locale } = useLocale();
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const displayTopics = locale === "en" ? topics.map((topic, index) => ({ ...topic, label: topicsEn[index][0], description: topicsEn[index][1] })) : topics;
  const visibleTopics = displayTopics.filter((topic) =>
    `${topic.label} ${topic.description}`.toLocaleLowerCase().includes(normalizedQuery),
  );

  return (
    <div dir={locale === "en" ? "ltr" : "rtl"} className="relative isolate flex min-h-screen w-full flex-col-reverse overflow-hidden bg-[#f8f4eb] text-[#365f4f] lg:h-screen lg:min-h-0 lg:flex-row">
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <Image
          src="/images/onboarding-background.jpeg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      <Sidebar activeId="explore-topics" />

      <main className="relative z-10 flex min-h-screen flex-1 justify-center overflow-y-auto px-5 py-6 sm:px-8 lg:min-h-0 lg:py-5">
        <section className="my-auto flex w-full max-w-[660px] flex-col items-center text-center">
          <header className="w-full">
            <h1 className="text-[22px] font-bold leading-[1.3] text-[#365f4f]">{locale === "en" ? "Explore Topics" : "اكتشف المواضيع"}</h1>
            <p className="mt-1 text-[10px] leading-4 text-[#65796f]">
              {locale === "en" ? "Explore topics that interest you and find a starting point for dialogue" : "استكشف موضوعات تهمك، واقرأ في بدايات الحوار"}
            </p>
          </header>

          <label className="relative mt-2.5 block w-full">
            <span className="sr-only">{locale === "en" ? "Search for a topic or question..." : "ابحث عن موضوع أو سؤال..."}</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={locale === "en" ? "Search for a topic or question..." : "ابحث عن موضوع أو سؤال..."}
              className="h-10 w-full rounded-[10px] border border-[#d8bd91] bg-[#fffdf8]/75 px-4 pe-10 text-right text-[11px] leading-4 text-[#365f4f] placeholder-[#65796f] focus:outline-none focus:ring-2 focus:ring-[#365f4f]/20"
              dir={locale === "en" ? "ltr" : "rtl"}
            />
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#65796f]">
              <circle cx="8.8" cy="8.8" r="5.8" stroke="currentColor" strokeWidth="1.4" />
              <path d="m13.2 13.2 3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </label>

          <div className="mt-2 flex w-full items-center justify-between text-[10px] leading-4 text-[#65796f]" dir="rtl">
            <span>{locale === "en" ? "All topics" : "جميع المواضيع"}</span>
            <span>{visibleTopics.length} {locale === "en" ? "topics" : "مواضيع"}</span>
          </div>

          {visibleTopics.length > 0 ? (
            <div className="mt-1.5 grid w-full grid-cols-3 gap-2" dir="rtl">
              {visibleTopics.map((topic) => (
                <button
                  key={topic.label}
                  type="button"
                  className={`flex min-h-[78px] flex-col items-center justify-center rounded-[10px] border px-2 py-2 text-center text-[#365f4f] transition-colors hover:brightness-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#365f4f]/30 ${topicTones[topic.tone]}`}
                >
                  <span className="text-[11px] font-semibold leading-4">{topic.label}</span>
                  <span className="mt-0.5 text-[9px] leading-[1.35] text-[#4e665b]">{topic.description}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-[11px] leading-4 text-[#65796f]">{locale === "en" ? "No matching topics found." : "لا توجد مواضيع مطابقة."}</p>
          )}

          <p className="mt-2.5 text-[10px] leading-4 text-[#65796f]">{locale === "en" ? "Choose a topic to explore or start your dialogue" : "اختر موضوعاً لاستكشافه أو ابدأ حوارك"}</p>
          <Link
            href="/new-dialogue"
            className="mt-1 inline-flex h-8 items-center justify-center rounded-[9px] bg-[#365f4f] px-4 text-[11px] font-semibold leading-4 text-white transition-colors hover:bg-[#2d5143] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#365f4f] focus-visible:ring-offset-2"
          >
            {locale === "en" ? "Start Dialogue" : "ابدأ الحوار"}
          </Link>
        </section>
      </main>
    </div>
  );
}
