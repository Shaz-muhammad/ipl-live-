import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Newspaper, ChevronRight, Info } from "lucide-react";
import { BlogCard, type Blog } from "./BlogCard";
import { SectionHeader } from "./SectionHeader";
import GoogleAdSense from "./GoogleAdSense";
import { api } from "@/services/api";

const CACHE_KEY = "ipl_latest_news_cache";

export function BlogSection() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // 🧠 Load persisted news on mount
  useEffect(() => {
    const saved = localStorage.getItem(CACHE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBlogs(parsed);
        }
      } catch (e) {
        console.warn("Failed to parse cached news");
      }
    }
  }, []);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setIsLoading(true);
        const res = await api.get("/blogs");
        const data = Array.isArray(res.data) ? res.data : [];
        
        if (data.length > 0) {
          setBlogs(data);
          setError(false);
          // Persist for "last latest" functionality
          localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        }
      } catch (err) {
        console.error("❌ Failed to fetch blogs:", err);
        // If we have cached blogs, don't show the full error state
        if (blogs.length === 0) {
          setError(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, [blogs.length === 0]); // Only retry if we don't even have cache

  // Determine if we are showing stale data
  const isShowingStale = error && blogs.length > 0;

  if (!isLoading && blogs.length === 0 && !error) return null;

  return (
    <section className="container mx-auto px-4 py-12 border-t border-border/30 mt-12">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <SectionHeader icon="📰" title="Latest IPL News" />
          {isShowingStale && (
            <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-medium uppercase tracking-tighter ml-1">
              <Info className="h-3 w-3 text-primary/60" /> 
              Showing last known news (offline)
            </div>
          )}
        </div>
        
        <a 
          href="https://www.iplt20.com/news" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-widest flex items-center gap-1 group"
        >
          View All News <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
        </a>
      </div>

      {/* Loading Skeleton (Only if no blogs at all) */}
      {isLoading && blogs.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card h-[350px] animate-pulse bg-secondary/20 rounded-xl" />
          ))}
        </div>
      ) : error && blogs.length === 0 ? (
        <div className="text-center py-10 glass-card bg-destructive/5 border border-dashed border-destructive/20 rounded-2xl">
          <p className="text-sm text-muted-foreground">Unable to fetch latest news at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog, i) => (
            <div key={blog.id} className="contents">
              <BlogCard blog={blog} index={i} />
              
              {/* Ad after every 2 blog cards */}
              {(i + 1) % 2 === 0 && (
                <div className="flex justify-center items-center py-4 bg-secondary/5 border border-dashed border-border/20 rounded-xl min-h-[150px]">
                  <div className="text-center w-full">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Advertisement</p>
                    {/* TODO: Replace with real AdSense slot ID when available */}
                    <GoogleAdSense 
                      adSlot="REPLACE_WITH_REAL_SLOT_ID" 
                      style={{ display: "block", width: "100%", height: "90px" }}
                      className="mx-auto"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
