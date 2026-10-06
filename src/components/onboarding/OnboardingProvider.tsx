"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { ContentLanguage, UiLanguage } from "@/lib/schemas/common";
import { userProfileSchema, type UserProfile } from "@/lib/schemas/userProfile";

type ReligiousBackground = NonNullable<UserProfile["religiousBackground"]>;
type NonMuslimBackground = NonNullable<UserProfile["nonMuslimBackground"]>;
type UserGoal = UserProfile["goal"];
type ExplanationDepth = UserProfile["explanationDepth"];
type ReligiousBackgroundSelection = ReligiousBackground | "interested_in_learning";

export type OnboardingDraft = {
  uiLanguage: UiLanguage;
  preferredResponseLanguage: ContentLanguage;
  religiousBackground?: ReligiousBackground;
  nonMuslimBackground?: NonMuslimBackground;
  religiousBackgroundSelection?: ReligiousBackgroundSelection;
  goal?: UserGoal;
  explanationDepth?: ExplanationDepth;
  interests: string[];
};

type OnboardingContextValue = {
  draft: OnboardingDraft;
  setUiLanguage: (language: UiLanguage) => void;
  setPreferredResponseLanguage: (language: ContentLanguage) => void;
  setReligiousBackground: (background: ReligiousBackground | undefined) => void;
  setNonMuslimBackground: (background: NonMuslimBackground | undefined) => void;
  setReligiousBackgroundSelection: (selection: ReligiousBackgroundSelection) => void;
  setGoal: (goal: UserGoal) => void;
  setExplanationDepth: (depth: ExplanationDepth) => void;
  setInterests: (interests: string[]) => void;
  resetDraft: () => void;
  finalizeProfile: () => UserProfile | null;
};

const initialDraft: OnboardingDraft = {
  uiLanguage: "ar",
  preferredResponseLanguage: "ar",
  explanationDepth: "balanced",
  interests: [],
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<OnboardingDraft>(initialDraft);
  const value = useMemo<OnboardingContextValue>(() => ({
    draft,
    setUiLanguage: (uiLanguage) => setDraft((current) => ({ ...current, uiLanguage })),
    setPreferredResponseLanguage: (preferredResponseLanguage) => setDraft((current) => ({ ...current, preferredResponseLanguage })),
    setReligiousBackground: (religiousBackground) => setDraft((current) => ({
      ...current,
      religiousBackground,
      ...(religiousBackground === "non_muslim" ? {} : { nonMuslimBackground: undefined }),
    })),
    setNonMuslimBackground: (nonMuslimBackground) => {
      setDraft((current) => ({ ...current, nonMuslimBackground }));
    },
    setReligiousBackgroundSelection: (religiousBackgroundSelection) => setDraft((current) => ({ ...current, religiousBackgroundSelection })),
    setGoal: (goal) => setDraft((current) => ({ ...current, goal })),
    setExplanationDepth: (explanationDepth) => setDraft((current) => ({ ...current, explanationDepth })),
    setInterests: (interests) => setDraft((current) => ({ ...current, interests })),
    resetDraft: () => setDraft(initialDraft),
    finalizeProfile: () => {
      const result = userProfileSchema.safeParse({
        uiLanguage: draft.uiLanguage,
        preferredResponseLanguage: draft.preferredResponseLanguage,
        religiousBackground: draft.religiousBackground,
        nonMuslimBackground: draft.religiousBackground === "non_muslim" ? draft.nonMuslimBackground : undefined,
        goal: draft.goal,
        explanationDepth: draft.explanationDepth,
        interests: draft.interests,
      });
      return result.success ? result.data : null;
    },
  }), [draft]);

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const value = useContext(OnboardingContext);
  if (!value) throw new Error("useOnboarding must be used inside OnboardingProvider");
  return value;
}
