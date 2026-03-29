import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { LiveBadge } from "@/components/LiveBadge";
import { Scorecard } from "@/components/Scorecard";
import { Commentary } from "@/components/Commentary";
import { Footer } from "@/components/Footer";
import { api } from "@/services/api";
import { 
  getTeamLabel, 
  safeText, 
  formatOvers, 
  normalizeMatch 
} from "@/utils/matchHelpers";

type Tab = "summary" | "scorecard" | "commentary" | "info";

const MatchDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("summary");

  const {
    data: rawMatch,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["match", id],
    enabled: !!id,
    queryFn: async () => {
      const res = await api.get(`/match/${id}`);
      return res.data;
    },
    retry: 1,
    refetchInterval: 15000,
  });

  const match = rawMatch ? normalizeMatch(rawMatch) : null;

  // 🚫 NO MOCK DATA FALLBACK
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl mb-4">🏏</p>
          <p className="text-muted-foreground">Loading match...</p>
        </div>
      </div>
    );
  }

  if (isError || !match) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl mb-4">⚠️</p>
          <p className="text-muted-foreground">
            Match data unavailable (Backend/API issue)
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 text-primary text-sm hover:underline"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="glass-card border-b border-border/50 px-4 py-3 sticky top-0 z-50">
        <div className="container mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <h1 className="font-heading text-sm font-bold text-foreground truncate">
            {getTeamLabel(match.team1Short, match.team1)} vs {getTeamLabel(match.team2Short, match.team2)}
          </h1>

          <div className="ml-auto flex items-center gap-2">
            {match.status === "live" && <LiveBadge />}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Score Summary Card (Cricbuzz Hero Style) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card neon-border p-5 md:p-6"
        >
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 md:gap-8 mb-6">
            <div className="flex flex-col items-center gap-2">
              <span className="text-4xl filter drop-shadow-neon-sm">{match.team1Logo || "🏏"}</span>
              <p className="font-heading font-bold text-foreground text-sm uppercase">
                {getTeamLabel(match.team1Short, match.team1)}
              </p>
              <p className="font-display text-xl md:text-2xl neon-text font-bold leading-none">
                {safeText(match.team1Score, "—")}
              </p>
              {match.team1Overs && (
                <p className="text-[10px] text-muted-foreground">({formatOvers(match.team1Overs)})</p>
              )}
            </div>

            <div className="font-display text-[10px] text-muted-foreground/50 font-bold">VS</div>

            <div className="flex flex-col items-center gap-2">
              <span className="text-4xl filter drop-shadow-neon-sm">{match.team2Logo || "🏏"}</span>
              <p className="font-heading font-bold text-foreground text-sm uppercase">
                {getTeamLabel(match.team2Short, match.team2)}
              </p>
              <p className="font-display text-xl md:text-2xl neon-text font-bold leading-none">
                {safeText(match.team2Score, "—")}
              </p>
              {match.team2Overs && (
                <p className="text-[10px] text-muted-foreground">({formatOvers(match.team2Overs)})</p>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border/20 text-center space-y-2">
            <p className="text-sm font-heading font-bold text-neon-text-accent uppercase tracking-wider">
              {match.result || match.status}
            </p>
            {match.venue && (
              <p className="text-[10px] text-muted-foreground opacity-70">
                {match.venue} {match.date && `• ${match.date}`}
              </p>
            )}
          </div>
        </motion.div>

        {/* Tabs (Cricbuzz Style) */}
        <div className="flex gap-1 border-b border-border/30 overflow-x-auto no-scrollbar">
          {(["summary", "scorecard", "commentary", "info"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-xs font-heading font-bold uppercase tracking-widest whitespace-nowrap transition-all border-b-2 ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "summary" && (
            <div className="space-y-4">
              <section className="glass-card p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase text-muted-foreground border-b border-border/10 pb-2">Match Highlights</h3>
                <div className="space-y-2 text-xs">
                  {match.tossWinner && (
                    <p className="text-foreground"><span className="text-muted-foreground">Toss:</span> {match.tossWinner} elected to {match.tossChoice}</p>
                  )}
                  {match.target && match.target > 0 && (
                    <p className="text-neon-blue font-bold"><span className="text-muted-foreground">Target:</span> {match.target} runs</p>
                  )}
                  {match.rrr && match.rrr !== "0" && (
                    <p className="text-neon-red font-bold"><span className="text-muted-foreground">Req. Run Rate:</span> {match.rrr}</p>
                  )}
                  {match.currentInnings && (
                    <p className="text-foreground"><span className="text-muted-foreground">Innings:</span> {match.currentInnings}</p>
                  )}
                </div>
              </section>
              <Scorecard batting={match.batting?.slice(0, 3)} bowling={match.bowling?.slice(0, 3)} />
            </div>
          )}

          {activeTab === "scorecard" && (
            <Scorecard batting={match.batting} bowling={match.bowling} />
          )}

          {activeTab === "commentary" && (
            <Commentary entries={match.commentary || []} />
          )}

          {activeTab === "info" && (
            <section className="glass-card p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-muted-foreground mb-1 uppercase tracking-tighter">Venue</p>
                  <p className="font-bold">{match.venue}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1 uppercase tracking-tighter">Date & Time</p>
                  <p className="font-bold">{match.date} • {match.time}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1 uppercase tracking-tighter">Series</p>
                  <p className="font-bold">Indian Premier League 2026</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1 uppercase tracking-tighter">Match State</p>
                  <p className="font-bold uppercase text-primary">{match.matchState || match.status}</p>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MatchDetails;
