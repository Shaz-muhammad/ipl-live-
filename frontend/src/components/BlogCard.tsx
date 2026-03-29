import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Calendar, Newspaper } from "lucide-react";
import { isUrl } from "@/utils/matchHelpers";

export interface Blog {
  id: string;
  title: string;
  summary: string;
  image: string | null;
  source: string;
  publishedAt: string;
  url: string;
}

interface Props {
  blog: Blog;
  index: number;
}

export function BlogCard({ blog, index }: Props) {
  const [imgError, setImgError] = useState(false);

  // Styled Neon Placeholder for missing/broken images
  const Placeholder = () => (
    <div className="w-full h-full bg-secondary/30 flex flex-col items-center justify-center gap-3 border-b border-border/50">
      <div className="p-3 rounded-full bg-primary/10 border border-primary/20 shadow-lg shadow-primary/10">
        <Newspaper className="h-8 w-8 text-primary/60 neon-text" />
      </div>
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
        Image Preview Unavailable
      </span>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="glass-card overflow-hidden flex flex-col h-full border border-border/50 hover:border-primary/50 transition-all duration-300 group"
    >
      {/* Thumbnail Area */}
      <div className="relative aspect-video overflow-hidden bg-secondary/20">
        {!isUrl(blog.image || "") || imgError ? (
          <Placeholder />
        ) : (
          <img
            src={blog.image!}
            alt={blog.title}
            onError={() => setImgError(true)}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
          />
        )}
        
        <div className="absolute top-2 left-2 px-2 py-1 bg-background/80 backdrop-blur-md rounded-md text-[10px] font-bold text-primary uppercase tracking-wider border border-primary/20 shadow-lg">
          {blog.source}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="font-heading font-bold text-lg leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
          {blog.title}
        </h3>
        
        <p className="text-xs text-muted-foreground line-clamp-3 flex-1 font-body leading-relaxed">
          {blog.summary}
        </p>

        {/* Meta Footer */}
        <div className="flex items-center justify-between mt-2 pt-3 border-t border-border/30">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <Calendar className="h-3 w-3 text-primary/60" />
            <span className="font-medium">
              {new Date(blog.publishedAt).toLocaleDateString("en-IN", { 
                day: '2-digit', 
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>
          
          <a
            href={blog.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[10px] font-bold text-primary hover:text-primary/80 transition-all uppercase tracking-wider group/link"
          >
            Read More 
            <ExternalLink className="h-3 w-3 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
