import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { Header } from "@/components/Header";
import HeroMatchCard from "@/components/HeroMatchCard";
import MatchCard from "@/components/MatchCard";
import { SectionHeader } from "@/components/SectionHeader";
import { BlogSection } from "@/components/BlogSection";
import { Footer } from "@/components/Footer";
import { WatchLiveModal } from "@/components/WatchLiveModal";
import NativeBannerAd from "@/components/NativeBannerAd";
import AdsterraBanner468 from "@/components/AdsterraBanner468";
import { AdminPanel } from "@/components/AdminPanel";
import { useTeamTheme } from "@/hooks/useTeamTheme";
import type { Match } from "@/types/match";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const extractMatches = (payload: unknown): Match[] => {
  console.log("EXTRACTING MATCHES FROM PAYLOAD:", payload);
  if (!payload) return [];
  
  if (Array.isArray(payload)) {
    return payload as Match[];
  }

  if (typeof payload === "object") {
    const p = payload as any;
    // Check common payload wrappers
    if (Array.isArray(p.data)) return p.data;
    if (Array.isArray(p.matches)) return p.matches;
    if (Array.isArray(p.latestMatches)) return p.latestMatches;
    
    // Check if it's a single match object instead of an array
    if (p.id && (p.team1 || p.team2)) {
      return [p as Match];
    }
  }

  return [];
};

const Index = () => {
  const [showWatchLive, setShowWatchLive] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [apiStatus, setApiStatus] = useState<string>("no-match");
  const [loading, setLoading] = useState(true);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  const { resetTheme } = useTeamTheme();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "a") {
        setShowAdmin(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const liveMatches = useMemo(() => {
    return matches.filter((m) => {
      const state = (m.matchState || "").toLowerCase();
      const status = (m.status || "").toLowerCase();
      const result = (m.result || "").toLowerCase();

      return (
        state.includes("progress") &&
        !state.includes("complete") &&
        !status.includes("won by") &&
        !result.includes("won by")
      );
    });
  }, [matches]);

  const selectedMatch = useMemo(() => {
    return matches.find((m) => m.id === selectedMatchId);
  }, [matches, selectedMatchId]);

  const heroMatch = useMemo(() => {
    return liveMatches.length > 0 ? liveMatches[0] : undefined;
  }, [liveMatches]);

  const listMatches = useMemo(() => {
    return liveMatches.slice(1);
  }, [liveMatches]);

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
        console.log("FETCH RESPONSE:", response.data);
        const parsed = extractMatches(response.data);
        console.log("PARSED FETCH MATCHES:", parsed);
        setMatches(parsed);
        if (response.data && typeof response.data === "object" && "apiStatus" in response.data) {
          setApiStatus(String(response.data.apiStatus));
        }
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
      const parsed = extractMatches(data);
      console.log("PARSED SOCKET MATCHES:", parsed);
      setMatches(parsed);
      if (data && typeof data === "object") {
        const payload = data as { apiStatus?: string };
        if (payload.apiStatus) {
          setApiStatus(payload.apiStatus);
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    console.log("MATCHES STATE CHANGED:", matches);
  }, [matches]);

  const handleWatchLive = () => {
    // Adsterra Smartlink (Direct Link)
    const smartlinkUrl = "https://www.profitablecpmratenetwork.com/g9jtwg7d?key=b9e7db9dc9e1eb37e2ee8c405a86aa3b";
    
    // Open the smartlink in a new tab
    window.open(smartlinkUrl, "_blank");
    
    // Then show the streaming links (WatchLiveModal)
    setShowWatchLive(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <AdsterraBanner468 />
      <Header
        onWatchLiveClick={handleWatchLive}
        onResetTheme={resetTheme}
        onLogoClick={() => setShowAdmin(true)} // Hidden multi-tap trigger
      /><main className="container mx-auto px-4 py-6 space-y-10 pb-24">
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
            <AdsterraBanner468 />
          </section>
        )}

        {listMatches.length > 0 && (
          <section className="space-y-6">
            <SectionHeader icon="🏏" title="Live & Recent Matches" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {listMatches.map((m, index) => (
                <div key={m.id} className="contents">
                  <MatchCard
                    match={m}
                    onClick={() => setSelectedMatchId(m.id)}
                  />
                  {/* Insert Ad after the 2nd match card (index 1) */}
                  {index === 1 && (
                    <div className="sm:col-span-2 lg:col-span-1 flex items-center justify-center">
                      <NativeBannerAd />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {!loading && matches.length === 0 && (
          <div className="mx-auto max-w-lg rounded-2xl border border-border/50 glass-card py-20 text-center">
            <p className="font-heading text-lg font-bold text-muted-foreground">
              {apiStatus === "paused" ? "API is currently paused" : "No live IPL matches found"}
            </p>
            <p className="mt-2 text-xs text-muted-foreground/60">
              {apiStatus === "live" ? "Wait for the next live match update!" : "Stay tuned for upcoming live action!"}
            </p>
          </div>
        )}

        <BlogSection />
      </main>

      <Footer />

      <div className="fixed bottom-0 left-0 right-0 z-40 flex gap-3 border-t border-border/50 glass-card p-3 sm:hidden">
        <button
          onClick={handleWatchLive}
          className="flex-1 rounded-lg bg-destructive/20 py-2 text-xs font-heading font-bold text-neon-red"
        >
          📺 Watch Live
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
