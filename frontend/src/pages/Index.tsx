import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { HeroMatchCard } from "@/components/HeroMatchCard";
import { MatchCard } from "@/components/MatchCard";
import { SectionHeader } from "@/components/SectionHeader"; 
 import { BlogSection } from "@/components/BlogSection";
 import { Footer } from "@/components/Footer";
 import { WatchLiveModal } from "@/components/WatchLiveModal";
import { AdminPanel } from "@/components/AdminPanel";
import { useTeamTheme } from "@/hooks/useTeamTheme";
import {
  type Match,
  type MergedMatch,
  transformCricAPIMatches,
} from "@/lib/transformCricAPI";
import { connectSocket } from "@/services/socket";

const Index = () => {
  const [showWatchLive, setShowWatchLive] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [selectedMatchIds, setSelectedMatchIds] = useState<string[]>([]);

  const { setTeamTheme, resetTheme } = useTeamTheme();

  const [cricMatches, setCricMatches] = useState<MergedMatch[]>([]);
  const [lastValidMatches, setLastValidMatches] = useState<MergedMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const matches: Match[] = useMemo(() => {
    const source = cricMatches.length > 0 ? cricMatches : lastValidMatches;
    return transformCricAPIMatches(source);
  }, [cricMatches, lastValidMatches]);

  useEffect(() => {
    const socket = connectSocket();

    socket.on("connect", () => {
      console.log("✅ Connected to backend");
    });

    const onLiveScores = (data: MergedMatch[]) => {
      console.log("🔥 Live data received:", data);

      if (data && data.length > 0) {
        setCricMatches(data);
        setLastValidMatches(data);
      } else {
        console.log("⚠️ Empty response, keeping previous data");
      }

      setIsLoading(false);
      setIsError(false);
    };

    const onError = () => {
      console.log("❌ Socket error");
      setIsError(true);
      setIsLoading(false);
    };

    socket.on("liveScores", onLiveScores);
    socket.on("connect_error", onError);
    socket.on("error", onError);

    return () => {
      socket.off("liveScores", onLiveScores);
      socket.off("connect_error", onError);
      socket.off("error", onError);
    };
  }, []);

  const liveMatches = useMemo(
    () => (matches || []).filter(
      (m) =>
        m?.status?.toLowerCase().includes("live") ||
        (m as any)?.matchState === "live" ||
        m?.team1Score ||
        m?.team2Score
    ),
    [matches],
  );

  const heroMatch = liveMatches[0];

  const handleTeamClick = (
    teamId: string,
    primary: string,
    secondary: string,
  ) => {
    setTeamTheme(teamId, primary, secondary);
  };

  const openWatchLive = () => {
    // Collect all match IDs from the live matches array.
    // We use match.apiId || match.id to ensure consistency with admin saving.
    const relevantMatchIds = liveMatches.map((match) => match.id);

    console.log("📺 Opening Watch Live for matchIds:", relevantMatchIds);
    setSelectedMatchIds(relevantMatchIds);
    setShowWatchLive(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onAdminClick={() => setShowAdmin(true)}
        onWatchLiveClick={openWatchLive}
        onResetTheme={resetTheme}
      />

      <main className="container mx-auto px-4 py-6 space-y-10 pb-24">
        {isLoading && (
          <div className="text-center py-6">
            <p className="text-sm text-primary">⏳ Fetching matches...</p>
          </div>
        )}

        {isError && (
          <div className="text-center py-4">
            <p className="text-xs text-red-400">⚠️ Live score unavailable</p>
          </div>
        )}

        {!isLoading && matches.length === 0 && (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">
              No IPL live match currently
            </p>
          </div>
        )}

        {heroMatch ? (
          <>
            <section>
              <HeroMatchCard match={heroMatch} onTeamClick={handleTeamClick} />
            </section>

            <section>
              <SectionHeader icon="🔴" title="Live Matches" />
              {liveMatches.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {liveMatches.map((m, i) => (
                    <MatchCard
                      key={m.id}
                      match={m}
                      index={i}
                      onTeamClick={handleTeamClick}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center">
                  No live matches currently
                </p>
              )}
            </section>
          </>
        ) : !isLoading && (
          <div className="text-center py-20 glass-card rounded-2xl border border-border/50">
            <p className="text-lg font-heading font-bold text-muted-foreground">
              No IPL live match currently
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
          onClick={openWatchLive}
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
        matchIds={selectedMatchIds}
        open={showWatchLive}
        onClose={() => setShowWatchLive(false)}
      />

      <AdminPanel open={showAdmin} onClose={() => setShowAdmin(false)} />
    </div>
  );
};

export default Index;
