// src/components/AuthGate.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

/**
 * AuthGate: wraps parts of the app that require checking auth session.
 * - quick synchronous check for localStorage (fast UX)
 * - async `supabase.auth.getSession()` to confirm
 * - subscribes to auth state changes and navigates accordingly
 *
 * Usage: wrap your Router or routes with <AuthGate>...</AuthGate>
 */

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 1) Quick synchronous fallback: if your app stored a session or user in localStorage
    try {
      // Try common keys: `sb:session` is used by some supabase helpers, `alumniForm` was used earlier for form data.
      const possibleKeys = ["sb:session", "supabase.auth.token", "supabase.auth.session", "alumniForm"];
      for (const k of possibleKeys) {
        const raw = localStorage.getItem(k);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            // heuristics: presence of access_token / user / id
            if (parsed && (parsed.access_token || parsed.user || parsed.id)) {
              // we have something that looks like a signed-in session => go to home
              if (mounted) {
                navigate("/home", { replace: true });
                return; // done
              }
            }
          } catch {
            // raw value may not be JSON; ignore
          }
        }
      }
    } catch (err) {
      // ignore localStorage errors in some browsers
      // console.warn('AuthGate localStorage check failed', err);
    }

    // 2) Async: ask Supabase for current session
    (async () => {
      try {
        // supabase v2: supabase.auth.getSession()
        // v1 used supabase.auth.session()
        const maybeGetSession = (supabase.auth as any).getSession || (supabase.auth as any).session;
        if (maybeGetSession) {
          // v2 getSession()
          const result = await (supabase.auth as any).getSession();
          // v2 returns { data: { session } }
          const session = result?.data?.session ?? result?.session ?? null;
          if (mounted) {
            if (session && session.access_token) {
              navigate("/home", { replace: true });
              return;
            } else {
              setLoading(false);
            }
          }
        } else {
          // fallback: try to read current user
          const user = (supabase.auth as any).user ? (supabase.auth as any).user() : null;
          if (user) {
            navigate("/home", { replace: true });
            return;
          } else {
            setLoading(false);
          }
        }
      } catch (err) {
        console.error("AuthGate: supabase getSession error", err);
        if (mounted) setLoading(false);
      }
    })();

    // 3) Subscribe to auth state changes so login/logout events redirect immediately
    const sub = (supabase.auth as any).onAuthStateChange?.((event: string, session: any) => {
      // event examples: "SIGNED_IN", "SIGNED_OUT", "TOKEN_REFRESHED"
      if (!mounted) return;
      if (session && (session.access_token || session.user)) {
        navigate("/home", { replace: true });
      } else {
        // If user signed out, navigate to login
        navigate("/login", { replace: true });
      }
    });

    return () => {
      mounted = false;
      // unsubscribe (handle v1/v2 differences)
      try {
        if (sub?.subscription?.unsubscribe) sub.subscription.unsubscribe();
        else if (sub?.unsubscribe) sub.unsubscribe();
      } catch (e) {
        // ignore
      }
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading session…</div>
      </div>
    );
  }

  // children will render when no session is present (e.g., Login page),
  // or when you put AuthGate around only protected routes, children are the protected content.
  return <>{children}</>;
}
