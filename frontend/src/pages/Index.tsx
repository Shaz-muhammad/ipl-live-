import { useEffect, useMemo, useState } from "react";
/**
 * Adsterra and Google AdSense Coexistence Policy:
 * 1. Google AdSense and non-Google ads can coexist on the same page.
 * 2. However, to stay policy-safe, Adsterra popunders MUST remain disabled
 *    on any page that actively displays Google AdSense units.
 * 3. Use the window.__ENABLE_ADSTERRA_POPUNDER__ flag in index.html to 
 *    control popunder visibility globally.
 */
import axios from "axios";
import { io } from "socket.io-client";
import { Header } from "@/components/Header";
import HeroMatchCard from "@/components/HeroMatchCard";
import GoogleAdSense from "@/components/GoogleAdSense";
import AdsterraBanner from "@/components/AdsterraBanner";
import MatchCard from "@/components/MatchCard";
import { SectionHeader } from "@/components/SectionHeader";
import { BlogSection } from "@/components/BlogSection";
import { Footer } from "@/components/Footer";
import { WatchLiveModal } from "@/components/WatchLiveModal";
import { AdminPanel } from "@/components/AdminPanel";
import { useTeamTheme } from "@/hooks/useTeamTheme";
import type { Match } from "@/types/match";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const toMatchArray = (value: unknown): Match[] => {
  return Array.isArray(value) ? (value as Match[]) : [];
};

const Index = () => {
  const [showWatchLive, setShowWatchLive] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  const { resetTheme } = useTeamTheme();

  const liveMatches = useMemo(() => {
    return matches.filter((m) => {
      const state = (m.matchState || "").toLowerCase();
      const status = (m.status || "").toLowerCase();

      return (
        state === "in progress" ||
        status.includes("need") ||
        status.includes("opt to bat") ||
        Boolean(m.team1Score) ||
        Boolean(m.team2Score)
      );
    });
  }, [matches]);

  const selectedMatch = useMemo(() => {
    return matches.find((m) => m.id === selectedMatchId);
  }, [matches, selectedMatchId]);

  const heroMatch = useMemo(() => {
    if (selectedMatch) return selectedMatch;
    if (liveMatches.length > 0) return liveMatches[0];
    if (matches.length > 0) return matches[0];
    return undefined;
  }, [selectedMatch, liveMatches, matches]);

  const listMatches = useMemo(() => {
    if (!heroMatch) return matches;
    return matches.filter((m) => m.id !== heroMatch.id);
  }, [matches, heroMatch]);

  useEffect(() => {
    if (heroMatch) {
      const t1 = heroMatch.team1Short || heroMatch.team1;
      const t2 = heroMatch.team2Short || heroMatch.team2;
      document.title = `IPL 2026 Live Score | ${t1} vs ${t2} Live Updates`;
    } else {
      document.title = "IPL 2026 Live Score | Real-time Match Updates";
    }
  }, [heroMatch]);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await axios.get<Match[]>(`${API_BASE}/live-scores`);
        setMatches(toMatchArray(response.data));
      } catch (error) {
        console.error("Failed to fetch matches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();

    const socket = io(API_BASE);

    socket.on("connect", () => {
      console.log("✅ Connected to socket");
    });

    socket.on("liveScores", (data: unknown) => {
      console.log("MATCHES UPDATE (Live):", data);
      setMatches(toMatchArray(data));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header
        onAdminClick={() => setShowAdmin(true)}
        onWatchLiveClick={() => setShowWatchLive(true)}
        onResetTheme={resetTheme}
      />

      <main className="container mx-auto px-4 py-6 space-y-10 pb-24">
        {loading && (
          <div className="py-6 text-center">
            <p className="animate-pulse text-sm text-primary">
              ⏳ Fetching matches...
            </p>
          </div>
        )}

        {heroMatch && (
          <section>
            <HeroMatchCard match={heroMatch} />
            
            <div className="mt-6 flex justify-center">
              <GoogleAdSense
                adSlot="1234567890" // Replace with real AdSense slot ID
                className="w-full max-w-[728px]"
                style={{ minHeight: "90px" }}
              />
            </div>
          </section>
        )}

        {listMatches.length > 0 && (
          <section className="space-y-6">
            <SectionHeader icon="🏏" title="Live & Recent Matches" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {listMatches.map((m, i) => (
                <div key={m.id}>
                  <MatchCard
                    match={m}
                    onClick={() => setSelectedMatchId(m.id)}
                  />
                  {i === 2 && <AdsterraBanner />}
                </div>
              ))}
            </div>
          </section>
        )}

        {!loading && matches.length === 0 && (
          <div className="mx-auto max-w-lg rounded-2xl border border-border/50 glass-card py-20 text-center">
            <p className="font-heading text-lg font-bold text-muted-foreground">
              No IPL matches found
            </p>
            <p className="mt-2 text-xs text-muted-foreground/60">
              Stay tuned for upcoming live action!
            </p>
          </div>
        )}

        <BlogSection />
      </main>

      <Footer />

      <div className="fixed bottom-0 left-0 right-0 z-40 flex gap-3 border-t border-border/50 glass-card p-3 sm:hidden">
        <button
          onClick={() => setShowWatchLive(true)}
          className="flex-1 rounded-lg bg-destructive/20 py-2 text-xs font-heading font-bold text-neon-red"
        >
          📺 Watch Live
        </button>
        <button
          onClick={() => setShowAdmin(true)}
          className="flex-1 rounded-lg bg-secondary py-2 text-xs font-heading font-bold text-secondary-foreground"
        >
          🔐 Admin
        </button>
      </div>

      <WatchLiveModal
        open={showWatchLive}
        onClose={() => setShowWatchLive(false)}
      />

      <AdminPanel open={showAdmin} onClose={() => setShowAdmin(false)} />
    </div>
  );
};

export default Index;
