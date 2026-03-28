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
import type { Match } from "@/lib/transformCricAPI";

type Tab = "scorecard" | "commentary";

const MatchDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("scorecard");

  const {
    data: match,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["match", id],
    enabled: !!id,
    queryFn: async () => {
      const res = await api.get(`/match/${id}`);
      return res.data as Match;
    },
    retry: 1,
    refetchInterval: 15000,
  });

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
      <div className="glass-card border-b border-border/50 px-4 py-3">
        <div className="container mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <h1 className="font-heading text-lg font-bold text-foreground">
            {match.team1.shortName} vs {match.team2.shortName}
          </h1>

          {match.status === "live" && <LiveBadge />}
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Score Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card neon-border p-6"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="text-center flex-1">
              <span className="text-3xl">{match.team1.logo}</span>
              <p className="font-heading font-bold text-foreground mt-1">
                {match.team1.shortName}
              </p>
              <p className="font-display text-2xl neon-text font-bold">
                {match.team1Score || "—"}
              </p>
              {match.team1Overs && (
                <p className="text-xs text-muted-foreground">
                  ({match.team1Overs} ov)
                </p>
              )}
            </div>

            <div className="font-display text-xs text-muted-foreground tracking-widest">
              VS
            </div>

            <div className="text-center flex-1">
              <span className="text-3xl">{match.team2.logo}</span>
              <p className="font-heading font-bold text-foreground mt-1">
                {match.team2.shortName}
              </p>
              <p className="font-display text-2xl neon-text font-bold">
                {match.team2Score || "—"}
              </p>
              {match.team2Overs && (
                <p className="text-xs text-muted-foreground">
                  ({match.team2Overs} ov)
                </p>
              )}
            </div>
          </div>

          <p className="text-center text-sm font-heading font-semibold mt-4 neon-text-accent">
            {match.statusText}
          </p>

          <p className="text-center text-[10px] text-muted-foreground mt-1">
            {match.venue}
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-lg bg-secondary/50 p-1">
          {(["scorecard", "commentary"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-md text-sm font-heading font-bold capitalize transition-all ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "scorecard" ? (
          <Scorecard batting={match.batting} bowling={match.bowling} />
        ) : (
          <Commentary entries={match.commentary} />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MatchDetails;
