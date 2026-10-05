"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { HomeView } from "@/components/home/HomeView";
import { useSession } from "@/components/session/SessionProvider";

export default function Home() {
  const router = useRouter();
  const { isHydrated, sessionId, userProfile } = useSession();

  useEffect(() => {
    if (isHydrated && (!sessionId || !userProfile)) {
      router.replace("/landing");
    }
  }, [isHydrated, router, sessionId, userProfile]);

  if (!isHydrated || !sessionId || !userProfile) return null;

  return <HomeView />;
}
