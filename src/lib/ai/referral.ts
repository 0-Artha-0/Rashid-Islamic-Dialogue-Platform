
import { referralStateSchema, type ReferralState } from "@/lib/schemas/referral";
import { routerOutputSchema, type RouterOutput } from "@/lib/schemas/router";

export class ReferralStateError extends Error {
  readonly code = "REFERRAL_STATE_INVALID";
  constructor(message: string) { super(message); this.name = "ReferralStateError"; }
}

export type BuildReferralStateInput = {
  routerOutput: RouterOutput;
  preferredResponseLanguage?: string;
  uiLanguage?: "ar" | "en";
  safeGeneralInformation?: string | null;
  specialistType?: string | null;
  localizedMessages?: Record<string, string>;
};

function languageKey(preferred?: string, ui?: "ar" | "en"): string {
  return preferred?.trim().toLowerCase() || ui || "en";
}

function defaultMessage(reason: ReferralState["reason"], language: string): string {
  const ar = language.startsWith("ar");

  if (reason === "personal_fatwa") {
    return ar
      ? "هذه المسألة تعتمد على ظروفك الشخصية، ولذلك تحتاج إلى توجيه من مختص مؤهل. لا يقدّم راشد حكمًا شخصيًا في هذه الحالة."
      : "This question depends on your personal circumstances, so it requires guidance from a qualified specialist. RASHID does not issue a personalized ruling in this case.";
  }
  if (reason === "insufficient_evidence") {
    return ar
      ? "لا تتوفر لدينا أدلة كافية لإصدار جواب مسؤول في هذه الحالة، لذلك نحيلها بدلًا من التخمين."
      : "The supplied evidence is not sufficient for a responsible answer, so RASHID refers the case rather than guessing.";
  }
  if (reason === "legal_medical_family_complexity") {
    return ar
      ? "هذه الحالة تعتمد على تفاصيل شخصية أو متخصصة تحتاج إلى تقييم مؤهل، لذلك لا يقدّم راشد حكمًا فرديًا فيها."
      : "This case depends on personal or specialist details that require qualified assessment, so RASHID does not issue an individualized judgment here.";
  }
  if (reason === "out_of_scope") {
    return ar
      ? "هذه الحالة تقع خارج نطاق الحكم الفردي الذي يمكن لراشد تقديمه بأمان، لذلك تحتاج إلى توجيه من مختص مناسب."
      : "This case is outside the individualized judgment RASHID can safely provide, so it should be handled by an appropriate qualified specialist.";
  }
  return ar
    ? "تحتاج هذه الحالة إلى توجيه مؤهل بدلًا من تقديم حكم فردي غير موثوق."
    : "This case requires qualified guidance rather than an unreliable individualized judgment.";
}

function mapReason(routerOutput: RouterOutput): ReferralState["reason"] {
  if (routerOutput.personalRuling) return "personal_fatwa";
  return "out_of_scope";
}

export function buildReferralState(rawInput: BuildReferralStateInput): ReferralState {
  const routerOutput = routerOutputSchema.parse(rawInput.routerOutput);

  if (routerOutput.route !== "REFERRAL") {
    throw new ReferralStateError(
      "ReferralState requires route=REFERRAL; received " + routerOutput.route + ".",
    );
  }

  if (routerOutput.personalRuling && routerOutput.contentLevel !== "D") {
    throw new ReferralStateError("RouterOutput with personalRuling=true must use contentLevel=D.");
  }

  const reason = mapReason(routerOutput);
  const language = languageKey(rawInput.preferredResponseLanguage, rawInput.uiLanguage);
  const message =
    rawInput.localizedMessages?.[language] ??
    rawInput.localizedMessages?.[language.split("-")[0]] ??
    defaultMessage(reason, language);

  const specialistType =
    rawInput.specialistType ??
    (reason === "personal_fatwa"
      ? language.startsWith("ar")
        ? "عالم أو جهة شرعية مؤهلة"
        : "A qualified scholar or appropriate religious authority"
      : null);

  const state = referralStateSchema.parse({
    reason,
    message,
    safeGeneralInformation: rawInput.safeGeneralInformation ?? null,
    specialistType,
  });

  if (/\b(halal|haram)\b/i.test(state.message) || /حلال|حرام/.test(state.message)) {
    throw new ReferralStateError("Referral message must not issue a personalized halal/haram ruling.");
  }

  return state;
}
