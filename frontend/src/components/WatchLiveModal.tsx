import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Tv, ArrowRight } from "lucide-react";
import { api } from "@/services/api";
import { useEffect, useMemo, useState } from "react";
import { AdSenseContainer } from "./AdSenseContainer";

interface Props {
  open: boolean;
  onClose: () => void;
  matchIds?: string[];
}

export function WatchLiveModal({ open, onClose }: Props) {
  const [linksByMatchId, setLinksByMatchId] = useState<
    Record<string, string[]>
  >({});
  const [loading, setLoading] = useState(false);
  const [showAd, setShowAd] = useState(true);

  useEffect(() => {
    if (!open) {
      setLinksByMatchId({});
      setShowAd(true); // Reset ad state when modal closes
      return;
    }

    let cancelled = false;
    setLoading(true);

    // Fetch all available streaming links from the backend
    api.get("/admin/all-links")
      .then((res) => {
        if (cancelled) return;

        const docs = Array.isArray(res.data) ? res.data : [];
        const grouped: Record<string, string[]> = {};
        
        docs.forEach((doc: any) => {
          if (doc.matchId && Array.isArray(doc.links) && doc.links.length > 0) {
            grouped[doc.matchId] = doc.links;
          }
        });

        console.log("📺 All live links loaded:", grouped);
        setLinksByMatchId(grouped);
      })
      .catch((err) => {
        console.error("❌ Error fetching all links:", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  const groupedEntries = useMemo(
    () => Object.entries(linksByMatchId),
    [linksByMatchId],
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-card neon-border p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Tv className="h-5 w-5 text-primary" />
                <h2 className="font-heading text-xl font-bold text-foreground">
                  Watch Live
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {showAd ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-6">
                <div className="text-center space-y-2">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Advertisement</p>
                  <div className="glass-card p-4 bg-secondary/10 border border-dashed border-border/20 rounded-xl min-w-[300px] min-h-[250px] flex items-center justify-center">
                    <AdSenseContainer 
                      slot="INTERSTITIAL_AD" 
                      style={{ display: "block", width: "300px", height: "250px" }}
                      className="mx-auto"
                    />
                  </div>
                </div>
                
                <button
                  onClick={() => setShowAd(false)}
                  className="group flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-heading font-bold text-primary-foreground hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20"
                >
                  Continue to Watch Live
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
                
                <p className="text-[9px] text-muted-foreground/60 max-w-[200px] text-center italic">
                  Supporting our ads helps us keep this service free and updated.
                </p>
              </div>
            ) : loading ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                Loading streaming links...
              </p>
            ) : groupedEntries.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                No live streaming links available yet.
              </p>
            ) : (
              <div className="space-y-5">
                {groupedEntries.map(([matchId, links]) => (
                  <div key={matchId} className="space-y-3">
                    <h3 className="text-sm font-heading font-bold text-primary">
                      {matchId}
                    </h3>

                    {links.map((link, index) => (
                      <a
                        key={`${matchId}-${index}`}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
                      >
                        <ExternalLink className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                        <span className="text-sm text-foreground truncate">
                          {link}
                        </span>
                      </a>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
