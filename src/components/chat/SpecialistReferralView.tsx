"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sidebar } from "@/components/home/Sidebar";
import { useLocale } from "@/components/i18n/LocaleProvider";
import type { ReferralState } from "@/lib/schemas/referral";
import type { StructuredResponse } from "@/lib/schemas/response";

type SpecialistReferralViewProps = {
  response: StructuredResponse;
  referral: ReferralState;
};

const reasonLabels: Record<ReferralState["reason"], string> = {
  personal_fatwa: "مسألة شخصية",
  insufficient_evidence: "الأدلة غير كافية",
  legal_medical_family_complexity: "مسألة قانونية أو طبية أو أسرية",
  out_of_scope: "خارج نطاق المساعدة",
  other: "سبب آخر",
};

function ReferralPanel({ title, children, tone = "sage" }: { title: string; children: ReactNode; tone?: "sage" | "rose" | "sand" }) {
  const { locale } = useLocale();
  const toneClass = {
    sage: "border-[#cbd9cf] bg-[#e7efe8]/90",
    rose: "border-[#e4c9c2] bg-[#f4e5e1]/90",
    sand: "border-[#ddc89f] bg-[#f1e7d2]/90",
  }[tone];
  return (
    <section className={`w-full rounded-[10px] border px-3 py-2 ${locale === "en" ? "text-left" : "text-right"} ${toneClass}`}>
      <h2 className="text-[10px] font-semibold leading-4 text-[#365f4f]">{title}</h2>
      <div className="mt-0.5 text-[10px] leading-[1.45] text-[#344f46]">{children}</div>
    </section>
  );
}

export function SpecialistReferralView({ response, referral }: SpecialistReferralViewProps) {
  const { locale } = useLocale();
  const l = locale === "en" ? { title: "This matter requires a specialist", reason: "Referral reason", explanation: "Explanation", specialistType: "Specialist type", safeInfo: "Safe general information", back: "Back", reasons: { personal_fatwa: "Personal fatwa", insufficient_evidence: "Insufficient evidence", legal_medical_family_complexity: "Legal, medical, or family matter", out_of_scope: "Outside the scope of assistance", other: "Other reason" } } : { title: "هذه المسألة تحتاج إلى مختص", reason: "سبب الإحالة", explanation: "التوضيح", specialistType: "نوع المختص", safeInfo: "معلومات عامة آمنة", back: "رجوع", reasons: reasonLabels };
  return (
    <div dir={locale === "en" ? "ltr" : "rtl"} className="relative isolate flex min-h-screen w-full flex-col-reverse overflow-hidden bg-[#f8f4eb] text-[#365f4f] lg:h-screen lg:min-h-0 lg:flex-row">
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <Image src="/images/onboarding-background.jpeg" alt="" fill priority sizes="100vw" className="object-cover object-center" />
      </div>
      <Sidebar activeId="referral" />
      <main className="relative z-10 flex min-h-screen flex-1 justify-center overflow-y-auto px-5 py-6 sm:px-8 lg:min-h-0 lg:py-5">
        <section className="my-auto flex w-full max-w-[520px] flex-col items-center gap-2">
          <header className="w-full text-center">
            <h1 className="text-[20px] font-bold leading-[1.3] text-[#365f4f]">{l.title}</h1>
          </header>

          <ReferralPanel title={l.reason} tone="sand">
            {l.reasons[referral.reason]}
          </ReferralPanel>
          <ReferralPanel title={l.explanation} tone="rose">
            {referral.message}
          </ReferralPanel>
          {referral.specialistType && (
            <ReferralPanel title={l.specialistType} tone="sage">
              {referral.specialistType}
            </ReferralPanel>
          )}
          {referral.safeGeneralInformation && (
            <ReferralPanel title={l.safeInfo} tone="sage">
              {referral.safeGeneralInformation}
            </ReferralPanel>
          )}

          {response.suggestedActions.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-1" dir={locale === "en" ? "ltr" : "rtl"}>
              {response.suggestedActions.map((action) => (
                <button key={action} type="button" disabled className="cursor-not-allowed rounded-full border border-[#d8bd91] bg-[#fffdf8]/65 px-2.5 py-1 text-[9px] leading-3.5 text-[#8a9991]">
                  {locale === "en" && action === "عرض معلومات عامة" ? "View General Information" : action}
                </button>
              ))}
            </div>
          )}

          <Link
            href="/conversations/demo"
            className="inline-flex h-9 items-center justify-center rounded-[10px] border border-[#d8bd91] bg-[#fffdf8]/65 px-4 text-[11px] font-medium leading-4 text-[#365f4f] transition-colors hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#365f4f] focus-visible:ring-offset-2"
          >
            {l.back}
          </Link>
        </section>
      </main>
    </div>
  );
}
