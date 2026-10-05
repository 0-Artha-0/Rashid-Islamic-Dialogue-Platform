"use client";

import Image from "next/image";
import { Sidebar } from "@/components/home/Sidebar";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { useSession } from "@/components/session/SessionProvider";

const fieldsAr = [
  ["اللغة", "غير محددة"],
  ["الخلفية الدينية", "غير محددة"],
  ["الهدف", "غير محدد"],
  ["مستوى الشرح", "غير محدد"],
  ["الاهتمامات", "لم تُحدد بعد"],
] as const;

const valueLabels = {
  religiousBackground: { muslim: ["مسلم", "Muslim"], non_muslim: ["غير مسلم", "Non-Muslim"], other: ["من خلفية دينية أخرى", "Another religion or belief"], prefer_not_to_say: ["أفضل عدم الإجابة", "Prefer not to say"] },
  goal: { learn_about_islam: ["التعرف على الإسلام", "Learn about Islam"], ask_specific_question: ["لدي سؤال محدد", "Ask a specific question"], discuss_misconception: ["مناقشة شبهة", "Explore a misconception"], deepen_understanding: ["التعمق في المعرفة", "Deepen my understanding"], structured_debate: ["مقارنة الآراء", "Compare viewpoints"], other: ["فهم موضوع معين", "Understand a specific topic"] },
  depth: { brief: ["مختصر", "Brief"], balanced: ["متوازن", "Balanced"], detailed: ["تفصيلي", "Detailed"] },
  interests: { aqeedah: ["العقيدة", "Creed & Belief"], quran: ["القرآن", "Quran"], hadith_sunnah: ["الحديث والسنة", "Hadith & Sunnah"], seerah: ["السيرة", "Prophetic Biography"], fiqh: ["الفقه", "Jurisprudence"], ethics: ["الأخلاق", "Ethics"], comparative_religion: ["مقارنة الأديان", "Comparative Religion"], misconceptions: ["الشبهات", "Misconceptions"], existential_questions: ["أسئلة الوجود والغاية", "Existential Questions & Purpose"] },
} as const;

export function ProfileView() {
  const { locale } = useLocale();
  const { userProfile } = useSession();
  const languageIndex = locale === "en" ? 1 : 0;
  const display = (value: string | undefined, map: Record<string, readonly [string, string]>) => value ? map[value]?.[languageIndex] ?? value : (locale === "en" ? "Unset" : "غير محدد");
  const fields = userProfile ? [
    [locale === "en" ? "Language" : "اللغة", locale === "en" ? (userProfile.uiLanguage === "en" ? "English" : "Arabic") : (userProfile.uiLanguage === "en" ? "الإنجليزية" : "العربية")],
    [locale === "en" ? "Religious background" : "الخلفية الدينية", display(userProfile.religiousBackground, valueLabels.religiousBackground)],
    [locale === "en" ? "Goal" : "الهدف", display(userProfile.goal, valueLabels.goal)],
    [locale === "en" ? "Explanation depth" : "مستوى الشرح", display(userProfile.explanationDepth, valueLabels.depth)],
    [locale === "en" ? "Interests" : "الاهتمامات", userProfile.interests.length > 0 ? userProfile.interests.map((interest) => display(interest, valueLabels.interests)).join(locale === "en" ? ", " : "، ") : (locale === "en" ? "Not selected yet" : "لم تُحدد بعد")],
  ] as const : locale === "en" ? [["Language", "Unset"], ["Religious background", "Unset"], ["Goal", "Unset"], ["Explanation depth", "Unset"], ["Interests", "Not selected yet"]] as const : fieldsAr;
  return (
    <div dir={locale === "en" ? "ltr" : "rtl"} className="relative isolate flex min-h-screen w-full flex-col-reverse overflow-hidden bg-[#f8f4eb] text-[#365f4f] lg:h-screen lg:min-h-0 lg:flex-row">
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <Image src="/images/onboarding-background.jpeg" alt="" fill priority sizes="100vw" className="object-cover object-center" />
      </div>
      <Sidebar activeId="profile" />
      <main className="relative z-10 flex min-h-screen flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:min-h-0">
        <section className="flex w-full max-w-[620px] flex-col items-center text-center">
          <h1 className="text-[20px] font-bold leading-[1.3]">{locale === "en" ? "Profile" : "الملف الشخصي"}</h1>
          <p className="mt-1 text-[10px] leading-4 text-[#65796f]">{locale === "en" ? "Your current Rashid profile" : "بياناتك الحالية في راشد"}</p>
          <div className="mt-3 w-full space-y-1.5">
            {fields.map(([label, value], index) => (
              <div key={label} className={`flex items-center justify-between rounded-[10px] border px-3 py-2 text-right ${index % 3 === 0 ? "border-[#cbd9cf] bg-[#e7efe8]/90" : index % 3 === 1 ? "border-[#e4c9c2] bg-[#f4e5e1]/90" : "border-[#ddc89f] bg-[#f1e7d2]/90"}`}>
                <span className="text-[10px] font-semibold">{label}</span>
                <span className="text-[10px] text-[#65796f]">{value}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 rounded-[9px] border border-[#ddc89f] bg-[#f1e7d2]/90 px-3 py-1.5 text-[9px] leading-4 text-[#65796f]">{locale === "en" ? "Profile selections have not been saved yet." : "لم تُحفظ اختيارات الملف الشخصي بعد."}</p>
        </section>
      </main>
    </div>
  );
}
