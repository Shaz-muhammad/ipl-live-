import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { Header } from "@/components/Header";
import { HeroMatchCard } from "@/components/HeroMatchCard";
import MatchCard from "@/components/MatchCard";
import { SectionHeader } from "@/components/SectionHeader";
import { BlogSection } from "@/components/BlogSection";
import { Footer } from "@/components/Footer";
import { WatchLiveModal } from "@/components/WatchLiveModal";
import { AdminPanel } from "@/components/AdminPanel";
import { useTeamTheme } from "@/hooks/useTeamTheme";
import { AdSenseContainer } from "@/components/AdSenseContainer";
import type { Match } from "@/types/match";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Index = () => {
  const [showWatchLive, setShowWatchLive] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  const { resetTheme } = useTeamTheme();

  const liveMatches = useMemo(() => {
    return matches.filter(m => {
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
    return matches.find(m => m.id === selectedMatchId);
  }, [matches, selectedMatchId]);

  const heroMatch = useMemo(() => {
    if (selectedMatch) return selectedMatch;
    if (liveMatches.length > 0) return liveMatches[0];
    if (matches.length > 0) return matches[0];
    return undefined;
  }, [selectedMatch, liveMatches, matches]);

  const listMatches = useMemo(() => {
    if (!heroMatch) return matches;
    return matches.filter(m => m.id !== heroMatch.id);
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
        const response = await axios.get(`${API_BASE}/live-scores`);
        setMatches(Array.isArray(response.data) ? response.data : []);
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

    socket.on("liveScores", (data: Match[]) => {
      console.log("MATCHES UPDATE (Live):", data);
      setMatches(Array.isArray(data) ? data : []);
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
              <AdSenseContainer
                slot="LIVE_SECTION_AD"
                style={{
                  display: "block",
                  width: "100%",
                  maxWidth: "728px",
                  height: "90px",
                }}
                className="min-h-[90px]"
              />
            </div>
          </section>
        )}

        {listMatches.length > 0 && (
          <section className="space-y-6">
            <SectionHeader icon="🏏" title="Live & Recent Matches" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {listMatches.map((m) => (
                <MatchCard
                  key={m.id}
                  match={m}
                  onClick={() => setSelectedMatchId(m.id)}
                />
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
