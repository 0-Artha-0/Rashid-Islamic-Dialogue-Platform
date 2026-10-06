import { useLocale } from "@/components/i18n/LocaleProvider";

type AttachmentMenuProps = { onClose: () => void };

export function AttachmentMenu({ onClose }: AttachmentMenuProps) {
  const { locale, t } = useLocale();
  return (
    <div className="absolute bottom-12 left-0 z-30 w-[220px] rounded-[12px] border border-[#d8bd91] bg-[#fffdf6]/95 p-3 text-right shadow-[0_8px_24px_rgba(55,74,61,0.12)]" dir={locale === "en" ? "ltr" : "rtl"}>
      <h2 className="text-[11px] font-semibold text-[#365f4f]">{t.attachment.title}</h2>
      <p className="mt-1 text-[9px] leading-4 text-[#65796f]">{t.attachment.unavailable}</p>
      <div className="mt-2 flex items-center justify-end">
        <button type="button" onClick={onClose} className="rounded-full border border-[#cbd9cf] bg-[#e7efe8]/90 px-3 py-1 text-[9px] text-[#365f4f]">{t.attachment.cancel}</button>
      </div>
    </div>
  );
}
