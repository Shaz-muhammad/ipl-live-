import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Tv, ArrowRight } from "lucide-react";
import { api } from "@/services/api";
import { useEffect, useMemo, useState } from "react";

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

  useEffect(() => {
    if (!open) {
      setLinksByMatchId({});
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
            className="glass-card neon-border p-6 w-full max-lg max-h-[80vh] overflow-y-auto"
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

            {loading ? (
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
                    <h3 className="text-sm font-heading font-bold text-primary text-center">
                      Stream: {matchId}
                    </h3>

                    {links.map((link, index) => (
                      <a
                        key={`${matchId}-${index}`}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 border border-border/50 transition-all group hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <ExternalLink className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                        <span className="text-sm text-foreground font-medium truncate">
                          Link {index + 1}: {link}
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
