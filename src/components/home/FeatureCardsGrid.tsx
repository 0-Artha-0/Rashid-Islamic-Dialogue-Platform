import React from "react";
import { Card, CardVariant } from "@/components/ui/Card";
import { useLocale } from "@/components/i18n/LocaleProvider";

export interface FeatureItem {
  id: string;
  title: string;
  subtitle: string;
  variant: CardVariant;
}

const defaultFeatures: FeatureItem[] = [
  // Row 1 (Right to Left in RTL)
  {
    id: "perspectives",
    title: "مقارنة وجهات النظر",
    subtitle: "بموضوعية واحترام",
    variant: "sand",
  },
  {
    id: "map",
    title: "خريطة النقاش",
    subtitle: "لتتبع مسار الحوار",
    variant: "blush",
  },
  {
    id: "answers",
    title: "إجابات موثقة",
    subtitle: "من مصادر معتمدة",
    variant: "sage",
  },
  // Row 2 (Right to Left in RTL)
  {
    id: "debate",
    title: "وضع المناظرة",
    subtitle: "حوار منظم ومحترم",
    variant: "sand",
  },
  {
    id: "misconception",
    title: "مناقشة شبهة",
    subtitle: "بسياق وأدلة",
    variant: "blush",
  },
  {
    id: "referral",
    title: "إحالة لمختص",
    subtitle: "عند الحاجة",
    variant: "sage",
  },
];

export interface FeatureCardsGridProps {
  features?: FeatureItem[];
  onSelectFeature?: (id: string) => void;
  className?: string;
}

export function FeatureCardsGrid({
  features = defaultFeatures,
  onSelectFeature,
  className = "",
}: FeatureCardsGridProps) {
  const { t } = useLocale();
  const localizedFeatures = features === defaultFeatures ? [
    { id: "perspectives", title: t.home.perspectives, subtitle: t.home.perspectivesSub, variant: "sand" as const },
    { id: "map", title: t.home.map, subtitle: t.home.mapSub, variant: "blush" as const },
    { id: "answers", title: t.home.answers, subtitle: t.home.answersSub, variant: "sage" as const },
    { id: "debate", title: t.home.debate, subtitle: t.home.debateSub, variant: "sand" as const },
    { id: "misconception", title: t.home.misconception, subtitle: t.home.misconceptionSub, variant: "blush" as const },
    { id: "referral", title: t.home.referral, subtitle: t.home.referralSub, variant: "sage" as const },
  ] : features;
  return (
    <section
      aria-label="مسارات الحوار والميزات الرئيسية"
      className={`w-full max-w-xl sm:max-w-[574px] mx-auto mb-4 sm:mb-2.5 ${className}`}
    >
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
        {localizedFeatures.map((feature) => (
          <Card
            key={feature.id}
            variant={feature.variant}
            title={feature.title}
            subtitle={feature.subtitle}
            onClick={() => onSelectFeature?.(feature.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelectFeature?.(feature.id);
              }
            }}
          />
        ))}
      </div>
    </section>
  );
}
