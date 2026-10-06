"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { sessionSchema, type Session } from "@/lib/schemas/session";
import { userProfileSchema, type UserProfile } from "@/lib/schemas/userProfile";

type SessionState = {
  sessionId?: string;
  userProfile?: UserProfile;
};

type SessionContextValue = SessionState & {
  isHydrated: boolean;
  setSession: (session: Session) => void;
  clearSession: () => void;
};

const STORAGE_KEY = "rashid.session.v1";
const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SessionState>({});
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as unknown;
      if (!parsed || typeof parsed !== "object") throw new Error("Invalid stored session");
      const candidate = parsed as { sessionId?: unknown; userProfile?: unknown };
      const sessionId = typeof candidate.sessionId === "string" && candidate.sessionId.length > 0 ? candidate.sessionId : undefined;
      const profile = userProfileSchema.safeParse(candidate.userProfile);
      if (!sessionId || !profile.success) throw new Error("Invalid stored session");
      setState({ sessionId, userProfile: profile.data });
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const value = useMemo<SessionContextValue>(() => ({
    ...state,
    isHydrated,
    setSession: (session) => {
      const validated = sessionSchema.parse(session);
      const nextState = { sessionId: validated.id, userProfile: validated.userProfile };
      setState(nextState);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    },
    clearSession: () => {
      setState({});
      sessionStorage.removeItem(STORAGE_KEY);
    },
  }), [isHydrated, state]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession must be used inside SessionProvider");
  return value;
}
