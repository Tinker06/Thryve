import { useEffect, useState } from "react";
import { getCurrentProfile } from "./auth";
import type { Profile } from "./types";

interface CurrentUserState {
  profile: Profile | null;
  loading: boolean;
}

export function useCurrentUser(): CurrentUserState {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const p = await getCurrentProfile();
        if (!cancelled) setProfile(p as Profile | null);
      } catch {
        if (!cancelled) setProfile(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return { profile, loading };
}