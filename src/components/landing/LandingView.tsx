"use client";

import Image from "next/image";
import Link from "next/link";

export function LandingView() {
  return (
    <div className="relative isolate min-h-screen w-full overflow-hidden bg-[#faf7f0] text-[#194036]">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <Image
          src="/images/home-background.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#fffdf6]/10" aria-hidden="true" />
      </div>

      <main className="relative flex min-h-screen w-full items-center justify-center px-5 py-10 sm:px-8">
        <section className="flex w-full max-w-[620px] flex-col items-center text-center">
          <Image
            src="/brand/rashid-logo.svg"
            alt="راشد | RASHID"
            width={220}
            height={123}
            priority
            className="h-auto w-[190px] object-contain drop-shadow-sm sm:w-[230px] lg:w-[270px]"
          />

          <div className="mt-7 flex w-full flex-col items-center gap-5 sm:mt-9 sm:gap-6">
            <p dir="rtl" className="w-full max-w-[560px] text-center text-[14px] font-semibold leading-7 text-[#285344] sm:text-[16px] sm:leading-8">
              منصة ذكية للحوار والمناظرة حول الإسلام، تُبنى الإجابات فيها على الدليل وتُعرض الآراء بوضوح وتوازن.
            </p>
            <p dir="ltr" className="w-full max-w-[560px] text-center text-[13px] font-normal leading-7 text-[#344f46] sm:text-[15px] sm:leading-8">
              An intelligent platform for dialogue and debate about Islam, grounded in evidence and built for clear, balanced perspectives.
            </p>
          </div>

          <div className="mt-9 flex items-center justify-center sm:mt-11">
            <Link
              href="/onboarding/language"
              className="inline-flex min-h-9 items-center justify-center rounded-[10px] bg-[#365f4f] px-5 py-2 text-[13px] font-semibold leading-5 text-white transition-colors hover:bg-[#2d5143] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#365f4f] focus-visible:ring-offset-2"
            >
              ابدأ الحوار · Start a Dialogue
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
