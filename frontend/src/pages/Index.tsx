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
import { connectSocket } from "@/services/socket";
import type { Match } from "@/types/match";

type ApiStatus = "live" | "no-match" | "paused" | "unavailable"; 

type LiveScoreResponse = { 
  apiStatus: ApiStatus; 
  data: Match[] 
}; 

const Index = () => {
  const [showWatchLive, setShowWatchLive] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  const { setTeamTheme, resetTheme } = useTeamTheme();

  const [cricMatches, setCricMatches] = useState<Match[]>([]);
  const [lastValidMatches, setLastValidMatches] = useState<Match[]>([]);
  const [apiStatus, setApiStatus] = useState<ApiStatus>("live");
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const matches = useMemo(() => {
    return cricMatches.length > 0 ? cricMatches : lastValidMatches;
  }, [cricMatches, lastValidMatches]);

  useEffect(() => {
    const socket = connectSocket();

    socket.on("connect", () => {
      console.log("✅ Connected to backend");
    });

    const onLiveScores = (response: LiveScoreResponse | Match[]) => {
      console.log("SOCKET PAYLOAD:", response);

      let status: ApiStatus = "live";
      let data: Match[] = [];

      if (Array.isArray(response)) {
        data = response;
      } else {
        status = response.apiStatus ?? "live";
        data = response.data ?? [];
      }

      setApiStatus(status);
      setCricMatches(data);

      if (data.length > 0) {
        console.log("RAW BACKEND MATCHES:", data);
        setLastValidMatches(data);
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

  const liveMatches = useMemo(() => {
    const live = matches.filter((m) => {
      const state = m.matchState?.toLowerCase() || "";
      const status = m.status?.toLowerCase() || "";
      return (
        state.includes("progress") ||
        status.includes("need") ||
        status.includes("opt") ||
        status.includes("won toss") ||
        Boolean(m.team1Score) ||
        Boolean(m.team2Score)
      );
    });
    console.log("MATCHES USED IN UI:", matches);
    console.log("LIVE MATCHES:", live);
    return live;
  }, [matches]);

  const heroMatch = useMemo(() => {
    const match = liveMatches.length > 0 
      ? liveMatches[0] 
      : matches.length > 0 
      ? matches[0] 
      : undefined;
    console.log("HERO MATCH:", match);
    return match;
  }, [liveMatches, matches]);

  const listMatches = useMemo(() => {
    if (!heroMatch) return [];
    return matches.filter(m => m.id !== heroMatch.id);
  }, [matches, heroMatch]);

  const handleTeamClick = (
    teamId: string,
    primary: string,
    secondary: string,
  ) => {
    setTeamTheme(teamId, primary, secondary);
  };

  const openWatchLive = () => {
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

        {heroMatch ? (
          <>
            <section>
              <HeroMatchCard match={heroMatch} onTeamClick={handleTeamClick} />
            </section>

            {listMatches.length > 0 && (
              <section>
                <SectionHeader icon="🏏" title="Recent Matches" />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {listMatches.map((m, i) => (
                    <MatchCard
                      key={m.id}
                      match={m}
                      index={i}
                      onTeamClick={handleTeamClick}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          !isLoading && (
            <div className="text-center py-20 glass-card rounded-2xl border border-border/50 max-w-lg mx-auto">
              {apiStatus === "paused" || apiStatus === "unavailable" ? (
                <>
                  <p className="text-lg font-heading font-bold text-muted-foreground">
                    Live score temporarily unavailable
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-2">
                    Please check again in a few minutes
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg font-heading font-bold text-muted-foreground">
                    No IPL live match currently
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-2">
                    Stay tuned for upcoming live action!
                  </p>
                </>
              )}
            </div>
          )
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
        open={showWatchLive}
        onClose={() => setShowWatchLive(false)}
      />

      <AdminPanel open={showAdmin} onClose={() => setShowAdmin(false)} />
    </div>
  );
};

export default Index;
