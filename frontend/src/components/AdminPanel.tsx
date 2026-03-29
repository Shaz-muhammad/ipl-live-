import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  LogIn,
  Plus,
  Trash2,
  Shield,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { api, loadAuthToken, setAuthToken } from "@/services/api";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface MatchLinkDoc {
  _id?: string;
  matchId: string;
  links: string[];
  updatedAt?: string;
}

export function AdminPanel({ open, onClose }: Props) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [matchId, setMatchId] = useState("");
  const [newLink, setNewLink] = useState("");
  const [links, setLinks] = useState<Record<string, string[]>>({});
  const [allLinks, setAllLinks] = useState<MatchLinkDoc[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    loadAuthToken();
    const token = localStorage.getItem("admin_jwt");
    const loggedIn = !!token;
    setIsLoggedIn(loggedIn);

    if (loggedIn) {
      void fetchAllLinks();
    }
  }, [open]);

  const fetchAllLinks = async () => {
    setIsLoading(true);
    setError("");

    try {
      const res = await api.get("/admin/links");
      setAllLinks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("API ERROR (fetchAllLinks):", err);
      setError("Failed to load saved links");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMatchLinks = async () => {
    const trimmedMatchId = matchId.trim();
    if (!trimmedMatchId) return;

    setIsLoading(true);
    setError("");

    try {
      const res = await api.get(
        `/admin/links/${encodeURIComponent(trimmedMatchId)}`,
      );
      const fetchedLinks = Array.isArray(res.data?.links) ? res.data.links : [];

      setLinks((prev) => ({
        ...prev,
        [trimmedMatchId]: fetchedLinks,
      }));
    } catch (err) {
      console.error("API ERROR (fetchMatchLinks):", err);
      setError("Failed to load links for this match");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setError("");
    setIsLoading(true);

    try {
      const res = await api.post("/admin/login", {
        username: username.trim(),
        password,
      });

      const token = res.data?.token as string | undefined;

      if (token) {
        setAuthToken(token);
        setIsLoggedIn(true);
        await fetchAllLinks();
      } else {
        setError("Invalid response from server");
      }
    } catch (err) {
      console.error("API ERROR (handleLogin):", err);
      setError("Invalid credentials or server error");
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
    setMatchId("");
    setNewLink("");
    setLinks({});
    setAllLinks([]);
    setError("");
  };

  const addLink = async () => {
    const trimmedMatchId = matchId.trim();
    const trimmedLink = newLink.trim();

    if (!trimmedMatchId || !trimmedLink) return;

    setIsLoading(true);
    setError("");

    try {
      // Get existing links for this match first
      let currentLinks = links[trimmedMatchId] || [];
      if (currentLinks.length === 0) {
        const res = await api.get(`/admin/links/${encodeURIComponent(trimmedMatchId)}`);
        currentLinks = Array.isArray(res.data?.links) ? res.data.links : [];
      }

      const updatedLinks = Array.from(new Set([...currentLinks, trimmedLink]));

      await api.post("/admin/links", {
        matchId: trimmedMatchId,
        links: updatedLinks,
      });

      setLinks((prev) => ({
        ...prev,
        [trimmedMatchId]: updatedLinks,
      }));

      setNewLink("");
      await fetchAllLinks();
      alert("Link added successfully");
    } catch (err) {
      console.error("API ERROR (addLink):", err);
      setError("Failed to save link");
      alert("Failed to save link");
    } finally {
      setIsLoading(false);
    }
  };

  const removeMatchLinks = async (mid: string) => {
    if (!window.confirm(`Are you sure you want to delete all links for ${mid}?`)) return;
    setError("");

    try {
      await api.delete(`/admin/links/${encodeURIComponent(mid)}`);
      
      setLinks((prev) => {
        const next = { ...prev };
        delete next[mid];
        return next;
      });

      await fetchAllLinks();
      alert("Links deleted successfully");
    } catch (err) {
      console.error("API ERROR (removeMatchLinks):", err);
      setError("Failed to delete links");
      alert("Failed to delete links");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="glass-card neon-border p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <h2 className="font-heading text-xl font-bold text-foreground">
                  Admin Panel
                </h2>
              </div>

              <div className="flex items-center gap-2">
                {isLoggedIn && (
                  <button
                    onClick={handleLogout}
                    className="text-xs flex items-center gap-1 px-3 py-1 rounded bg-destructive/20 text-destructive"
                  >
                    <LogOut className="h-3 w-3" />
                    Logout
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {!isLoggedIn ? (
              <div className="space-y-4">
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full px-3 py-2 bg-input border rounded"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-3 py-2 bg-input border rounded"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      void handleLogin();
                    }
                  }}
                />

                {error && <p className="text-xs text-red-500">{error}</p>}

                <button
                  onClick={() => void handleLogin()}
                  className="w-full bg-primary py-2 rounded text-white flex items-center justify-center gap-2"
                  disabled={isLoading}
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  value={matchId}
                  onChange={(e) => setMatchId(e.target.value)}
                  placeholder="Match ID (example: ipl-1)"
                  className="w-full px-3 py-2 bg-input border rounded"
                />

                <div className="flex gap-2">
                  <button
                    onClick={() => void fetchMatchLinks()}
                    className="px-3 py-2 rounded bg-secondary text-secondary-foreground text-sm"
                    disabled={isLoading || !matchId.trim()}
                  >
                    Load Links
                  </button>

                  <button
                    onClick={() => void fetchAllLinks()}
                    className="px-3 py-2 rounded bg-secondary text-secondary-foreground"
                    disabled={isLoading}
                    title="Refresh all"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                    />
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                    placeholder="Streaming URL"
                    className="flex-1 px-3 py-2 bg-input border rounded"
                  />
                  <button
                    onClick={() => void addLink()}
                    className="bg-primary px-4 rounded text-white"
                    disabled={isLoading || !matchId.trim() || !newLink.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {error && <p className="text-xs text-red-500">{error}</p>}

                {matchId.trim() && links[matchId.trim()]?.length ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-primary font-bold">
                        {matchId.trim()}
                      </p>
                      <button
                        onClick={() => void removeMatchLinks(matchId.trim())}
                        className="text-[10px] text-red-500 hover:underline"
                      >
                        Delete All
                      </button>
                    </div>
                    {links[matchId.trim()].map((link, i) => (
                      <div
                        key={i}
                        className="flex justify-between text-xs bg-secondary p-2 rounded mt-1 gap-2"
                      >
                        <span className="truncate">{link}</span>
                      </div>
                    ))}
                  </div>
                ) : null}

                {allLinks.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold border-b border-border/50 pb-1">
                      Saved Match Links
                    </p>
                    {allLinks.map((doc) => (
                      <div key={doc._id || doc.matchId} className="bg-secondary/20 p-2 rounded-lg border border-border/30">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-primary font-bold">
                            {doc.matchId}
                          </p>
                          <button
                            onClick={() => void removeMatchLinks(doc.matchId)}
                            className="text-red-500 hover:text-red-400"
                            title="Delete match links"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                        {doc.links.map((link, i) => (
                          <div
                            key={`${doc.matchId}-${i}`}
                            className="text-[10px] text-muted-foreground truncate opacity-70"
                          >
                            • {link}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
