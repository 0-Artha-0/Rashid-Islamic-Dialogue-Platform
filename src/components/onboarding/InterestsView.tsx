"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/components/onboarding/OnboardingProvider";
import { useSession } from "@/components/session/SessionProvider";
import { sessionSchema } from "@/lib/schemas/session";

const stableInterestValues = ["aqeedah", "quran", "hadith_sunnah", "seerah", "fiqh", "ethics", "comparative_religion", "misconceptions", "existential_questions"] as const;


export function InterestsView() {
  const { locale, t } = useLocale();
  const router = useRouter();
  const { draft, setInterests, finalizeProfile } = useOnboarding();
  const { setSession } = useSession();
  const selectedInterests = draft.interests;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<"incomplete" | "session" | null>(null);

  const toggleInterest = (interest: string) => {
    setInterests(
      selectedInterests.includes(interest)
        ? selectedInterests.filter((selected) => selected !== interest)
        : [...selectedInterests, interest],
    );
  };

  return (
    <main dir={locale === "en" ? "ltr" : "rtl"} className="relative isolate flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-[#f8f4eb] px-4 py-8 text-[#365f4f]">
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

      <section className="flex w-full max-w-[540px] flex-col items-center text-center">
        <Image
          src="/brand/rashid-logo.svg"
          alt="راشد | RASHID"
          width={100}
          height={56}
          priority
          className="h-auto w-[92px] object-contain"
        />

        <div className="mt-12 flex items-center justify-center gap-1.5" dir={locale === "en" ? "ltr" : "rtl"} aria-hidden="true">
          {[1, 2, 3, 4, 5].map((step) => (
            <span
              key={step}
              className={`h-1.5 w-1.5 rounded-full ${
                step === 5 ? "bg-[#365f4f]" : "bg-[#ead9be]"
              }`}
            />
          ))}
        </div>
        <p className="mt-2.5 text-[10px] font-normal leading-4 text-[#8a7858]">
          {t.interests.step}
        </p>

        <h1 className="mt-2 text-[28px] font-bold leading-[1.3] text-[#365f4f]">
          {t.interests.title}
        </h1>

        <div className="mt-2 grid w-full max-w-[500px] grid-cols-2 gap-1.5" role="group" aria-label={t.interests.aria} dir={locale === "en" ? "ltr" : "rtl"}>
          {stableInterestValues.map((interest, index) => {
            const isSelected = selectedInterests.includes(interest);
            const label = [t.interests.options.creed, t.interests.options.quran, t.interests.options.hadith, t.interests.options.seerah, t.interests.options.fiqh, t.interests.options.ethics, t.interests.options.comparative, t.interests.options.misconception, t.interests.options.existential][index];
            const spanClass = index === stableInterestValues.length - 1 ? "col-span-2" : "";
            return (
              <button
                key={interest}
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggleInterest(interest)}
                className={`flex h-9 ${spanClass} items-center justify-center rounded-[12px] bg-[#fffdf8]/35 px-3 text-[12px] font-semibold leading-4 text-[#365f4f] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#365f4f] focus-visible:ring-offset-2 ${
                  isSelected
                    ? "border-2 border-[#365f4f]"
                    : "border border-[#d8bd91] hover:bg-[#fffdf8]/65"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-center gap-2" dir={locale === "en" ? "ltr" : "rtl"}>
          <Link
            href="/onboarding/explanation-depth"
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-[10px] border border-[#d8bd91] bg-[#fffdf8]/45 px-4 text-[12px] font-medium leading-4 text-[#365f4f] transition-colors hover:bg-[#fffdf8]/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#365f4f] focus-visible:ring-offset-2"
          >
            {t.interests.back}
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
              <path d="M16 10H4m0 0 5-5m-5 5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={async () => {
              if (isSubmitting) return;
              const finalizedProfile = finalizeProfile();
              if (!finalizedProfile) {
                setError("incomplete");
                return;
              }

              setError(null);
              setIsSubmitting(true);
              try {
                const response = await fetch("/api/sessions", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ userProfile: finalizedProfile }),
                });
                if (response.status !== 201) throw new Error("Session creation failed");
                const session = sessionSchema.parse(await response.json());
                setSession(session);
                router.push("/");
              } catch {
                setError("session");
              } finally {
                setIsSubmitting(false);
              }
            }}
            className="inline-flex h-10 min-w-[90px] items-center justify-center rounded-[10px] bg-[#365f4f] px-4 text-[12px] font-semibold leading-4 text-white transition-colors hover:bg-[#2d5143] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#365f4f] focus-visible:ring-offset-2"
          >
            {t.interests.continue}
            {locale === "en" && <span aria-hidden="true" className="ms-1">→</span>}
          </button>
          {error && (
            <p role="alert" className="basis-full mt-1 text-[9px] leading-4 text-[#9a5d52]">
              {locale === "en"
                ? error === "incomplete" ? "Please complete the required selections before continuing." : "Unable to start the session right now. Please try again."
                : error === "incomplete" ? "يرجى إكمال الاختيارات المطلوبة قبل المتابعة." : "تعذر بدء الجلسة حالياً. حاول مرة أخرى."}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
