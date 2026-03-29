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
import { normalizeMatches, isLiveLike } from "@/utils/matchHelpers";
import { Match } from "@/types/match";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const HomePage = () => {
  const [showWatchLive, setShowWatchLive] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  const { setTeamTheme, resetTheme } = useTeamTheme();

  useEffect(() => {
    // Initial fetch
    const fetchMatches = async () => {
      try {
        const response = await axios.get(`${API_BASE}/live-scores`);
        const normalized = normalizeMatches(response.data);
        setMatches(normalized);
      } catch (error) {
        console.error("Failed to fetch matches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();

    // Socket connection
    const socket = io(API_BASE);
    
    socket.on("connect", () => {
      console.log("✅ Connected to socket");
    });

    socket.on("liveScores", (data: any) => {
      console.log("MATCHES UPDATE:", data);
      const normalized = normalizeMatches(data);
      setMatches(normalized);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const liveMatches = useMemo(() => {
    const filtered = matches.filter(isLiveLike);
    console.log("RAW BACKEND MATCHES:", matches);
    console.log("MATCHES USED IN UI:", matches);
    console.log("LIVE MATCHES:", filtered);
    return filtered;
  }, [matches]);
  
  const visibleMatches = useMemo(() => {
    return matches;
  }, [matches]);

  const selectedMatch = useMemo(() => {
    return matches.find(m => m.id === selectedMatchId);
  }, [matches, selectedMatchId]);

  const heroMatch = useMemo(() => {
    const selected = selectedMatch;
    const firstLive = liveMatches.length > 0 ? liveMatches[0] : undefined;
    const firstAny = matches.length > 0 ? matches[0] : undefined;
    
    const hero = selected || firstLive || firstAny;
    console.log("HERO MATCH:", hero);
    return hero;
  }, [selectedMatch, liveMatches, matches]);

  const listMatches = useMemo(() => {
    if (!heroMatch) return matches;
    return matches.filter(m => m.id !== heroMatch.id);
  }, [matches, heroMatch]);

  const handleTeamClick = (
    teamId: string,
    primary: string,
    secondary: string,
  ) => {
    setTeamTheme(teamId, primary, secondary);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onAdminClick={() => setShowAdmin(true)}
        onWatchLiveClick={() => setShowWatchLive(true)}
        onResetTheme={resetTheme}
      />

      <main className="container mx-auto px-4 py-6 space-y-10 pb-24">
        {loading && (
          <div className="text-center py-6">
            <p className="text-sm text-primary animate-pulse">⏳ Fetching matches...</p>
          </div>
        )}

        {heroMatch && (
          <section>
            <HeroMatchCard 
              match={heroMatch} 
              onTeamClick={handleTeamClick} 
            />
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
          <div className="text-center py-20 glass-card rounded-2xl border border-border/50 max-w-lg mx-auto">
            <p className="text-lg font-heading font-bold text-muted-foreground">
              No IPL matches found
            </p>
            <p className="text-xs text-muted-foreground/60 mt-2">
              Stay tuned for upcoming live action!
            </p>
          </div>
        )}

        <BlogSection />
      </main>

      <Footer />

      <div className="fixed bottom-0 left-0 right-0 z-40 glass-card border-t border-border/50 p-3 flex gap-3 sm:hidden">
        <button
          onClick={() => setShowWatchLive(true)}
          className="flex-1 rounded-lg bg-destructive/20 text-neon-red py-2 text-xs font-heading font-bold"
        >
          📺 Watch Live
        </button>
        <button
          onClick={() => setShowAdmin(true)}
          className="flex-1 rounded-lg bg-secondary text-secondary-foreground py-2 text-xs font-heading font-bold"
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

export default HomePage;
