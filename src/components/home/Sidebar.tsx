"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/i18n/LocaleProvider";
import {
  NavHomeIcon,
  NavNewChatIcon,
  NavCompassIcon,
  NavHistoryIcon,
  NavPerspectivesIcon,
  NavSpecialistIcon,
  NavProfileIcon,
  NavSettingsIcon,
} from "@/components/ui/icons";

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
}

const defaultNavItems: NavItem[] = [
  { id: "home", label: "الصفحة الرئيسية", icon: NavHomeIcon, isActive: true },
  { id: "new-chat", label: "حوار جديد", icon: NavNewChatIcon },
  { id: "explore-topics", label: "اكتشف المواضيع", icon: NavCompassIcon },
  { id: "history", label: "المحادثات السابقة", icon: NavHistoryIcon },
  { id: "perspectives", label: "مقارنة وجهات النظر", icon: NavPerspectivesIcon },
  { id: "referral", label: "الإحالة لمختص", icon: NavSpecialistIcon },
  { id: "profile", label: "الملف الشخصي", icon: NavProfileIcon },
  { id: "settings", label: "الإعدادات", icon: NavSettingsIcon },
];

export interface SidebarProps {
  navItems?: NavItem[];
  activeId?: string;
  onNavigate?: (id: string) => boolean | void;
  className?: string;
}

export function Sidebar({
  navItems = defaultNavItems,
  activeId = "home",
  onNavigate,
  className = "",
}: SidebarProps) {
  const router = useRouter();
  const { locale, t } = useLocale();
  const localizedLabels: Record<string, string> = {
    home: t.sidebar.home, "new-chat": t.sidebar.newChat, "explore-topics": t.sidebar.explore, history: t.sidebar.history,
    "discussion-map": t.sidebar.map, sources: t.sidebar.sources, issues: t.sidebar.issues, perspectives: t.sidebar.perspectives,
    debate: t.sidebar.debate, referral: t.sidebar.referral, profile: t.sidebar.profile, settings: t.sidebar.settings,
  };

  const handleNavigate = (id: string) => {
    const handled = onNavigate?.(id);
    if (handled === true) return;

    if (id === "home") {
      router.push("/");
    } else if (id === "new-chat") {
      router.push("/new-dialogue");
    } else if (id === "explore-topics") {
      router.push("/explore-topics");
    } else if (id === "discussion-map") {
      router.push("/conversations/demo/discussion-map");
    } else if (id === "issues") {
      router.push("/misconceptions");
    } else if (id === "sources") {
      router.push("/sources");
    } else if (id === "perspectives") {
      router.push("/conversations/demo/compare-views");
    } else if (id === "debate") {
      router.push("/conversations/demo/debate");
    } else if (id === "referral") {
      router.push("/conversations/demo/referral");
    } else if (id === "history") {
      router.push("/conversation-history");
    } else if (id === "profile") {
      router.push("/profile");
    } else if (id === "settings") {
      router.push("/settings");
    }
  };

  return (
    <aside
      aria-label={locale === "en" ? "Sidebar navigation" : "القائمة الجانبية للتنقل"}
      dir={locale === "en" ? "ltr" : "rtl"}
      className={`w-60 sm:w-64 lg:w-[clamp(13rem,19.5vw,17.5rem)] bg-[#fbf6e9]/95 backdrop-blur-md border border-[#e9e3d6] rounded-s-[28px] lg:rounded-[20px] flex flex-col justify-between p-4 sm:p-5 lg:p-3 h-full min-h-screen lg:min-h-0 shadow-[-4px_0_24px_rgba(0,0,0,0.03)] z-20 shrink-0 ${className}`}
    >
      {/* Top Brand & Nav Section */}
      <div>
        {/* Compact Brand Header */}
        <div className="flex flex-col items-center justify-center pt-2 pb-4">
          <Image
            src="/brand/rashid-logo.svg"
            alt="شعار راشد | RASHID"
            width={78}
            height={44}
            priority
            className="h-10 sm:h-11 w-auto object-contain"
          />
        </div>

        {/* 12 Navigation Items */}
        <nav className="flex flex-col gap-0.5 sm:gap-1 lg:gap-0.5" aria-label="أقسام المنصة">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = (item.isActive && activeId === "home") || item.id === activeId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigate(item.id)}
                className={`flex items-center gap-2.5 w-full px-3 py-1.5 sm:py-2 lg:py-1.5 rounded-xl lg:rounded-lg text-[11px] leading-4 font-medium transition-all duration-150 ${locale === "en" ? "text-left" : "text-right"} cursor-pointer ${
                  isActive
                    ? "bg-[#d1ded6] text-[#1b3a32] shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]"
                    : "text-[#3b554e] hover:bg-[#eae3d5]/70 hover:text-[#1b3a32]"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#1b3a32]" : "text-[#4d6b62]"}`} />
                <span className="truncate">{localizedLabels[item.id] ?? item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Branding Caption */}
      <div className="pt-4 pb-1 lg:pb-2 text-center mt-3">
        <p className="text-[11px] text-[#556e66] font-medium leading-tight">
          {t.sidebar.footer[0]}
        </p>
        <p className="text-[11px] text-[#6d867e] leading-tight mt-0.5">
          {t.sidebar.footer[1]}
        </p>
      </div>
    </aside>
  );
}
