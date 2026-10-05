
import assert from "node:assert/strict";
import { buildReferralState, ReferralStateError } from "../src/lib/ai/referral";
import type { RouterOutput } from "../src/lib/schemas/router";

const personalArabic: RouterOutput = {
  queryLanguage: "ar", contentLevel: "D", route: "REFERRAL",
  ambiguous: false, personalRuling: true, needs: ["referral"],
  conceptIds: [], clarificationQuestion: null,
};

const personal = buildReferralState({
  routerOutput: personalArabic,
  preferredResponseLanguage: "ar",
  safeGeneralInformation: "يمكن عرض معلومات عامة مدعومة فقط دون إصدار حكم شخصي.",
});
assert.equal(personal.reason, "personal_fatwa");
assert.match(personal.message, /ظروفك الشخصية/);
assert.match(personal.specialistType ?? "", /عالم|جهة شرعية/);

const personalEnglish = buildReferralState({
  routerOutput: { ...personalArabic, queryLanguage: "en" },
  preferredResponseLanguage: "en",
  safeGeneralInformation: "General information may be provided when already supported by approved evidence.",
});
assert.equal(personalEnglish.reason, "personal_fatwa");
assert.match(personalEnglish.message, /personal circumstances/);

const nonPersonal: RouterOutput = {
  queryLanguage: "en", contentLevel: "D", route: "REFERRAL",
  ambiguous: false, personalRuling: false, needs: ["referral"],
  conceptIds: [], clarificationQuestion: null,
};
const nonPersonalState = buildReferralState({ routerOutput: nonPersonal, preferredResponseLanguage: "en" });
assert.equal(nonPersonalState.reason, "out_of_scope");
assert.doesNotMatch(nonPersonalState.message, /personalized ruling|halal|haram/i);

assert.throws(
  () => buildReferralState({ routerOutput: { ...personalArabic, route: "EXPLAIN" }, preferredResponseLanguage: "ar" }),
  (error) => error instanceof ReferralStateError,
);

const localized = buildReferralState({
  routerOutput: personalArabic,
  preferredResponseLanguage: "fr",
  localizedMessages: { fr: "Cette question nécessite l’avis d’un spécialiste qualifié." },
});
assert.equal(localized.message, "Cette question nécessite l’avis d’un spécialiste qualifié.");

assert.throws(\n  () => buildReferralState({ routerOutput: personalArabic, preferredResponseLanguage: "ar", localizedMessages: { ar: "هذا حلال لك شخصيًا." } }),\n  (error) => error instanceof ReferralStateError,\n);\n\nconst schemaSafe = buildReferralState({ routerOutput: personalArabic, uiLanguage: "en", safeGeneralInformation: null });
assert.equal(typeof schemaSafe.message, "string");
assert.equal(schemaSafe.reason, "personal_fatwa");

console.log("✓ referral special-state tests passed");
