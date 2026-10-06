import React from "react";
import { Chip } from "@/components/ui/Chip";
import { useLocale } from "@/components/i18n/LocaleProvider";

export interface SuggestionChipsProps {
  suggestions?: string[];
  onSelectSuggestion?: (query: string) => void;
  className?: string;
}

const defaultSuggestions: string[] = [
  "ما معنى هذه الشبهة؟",
  "ما الغاية من وجودنا؟",
  "لماذا تختلف آراء العلماء؟",
  "هل الإسلام انتشر بالسيف؟",
  "ما معنى التوحيد؟",
];

export function SuggestionChips({
  suggestions = defaultSuggestions,
  onSelectSuggestion,
  className = "",
}: SuggestionChipsProps) {
  const { t } = useLocale();
  const localizedSuggestions = suggestions === defaultSuggestions ? t.home.suggestions : suggestions;
  return (
    <section
      aria-label={t.home.examples}
      className={`w-full max-w-2xl mx-auto text-center ${className}`}
    >
      <h2 className="text-[11px] font-semibold leading-4 text-[#203c35] mb-2">
        {t.home.examples}
      </h2>
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        {localizedSuggestions.map((suggestion) => (
          <Chip
            key={suggestion}
            onClick={() => onSelectSuggestion?.(suggestion)}
          >
            {suggestion}
          </Chip>
        ))}
      </div>
    </section>
  );
}
