import { Link } from "react-router-dom";
import { Shield, Info, Mail, Github, Twitter, Instagram } from "lucide-react";
import { motion } from "framer-motion";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-background/50 backdrop-blur-xl border-t border-border/50 pt-16 pb-8 mt-24">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/10">
                <Shield className="h-6 w-6 text-primary neon-text" />
              </div>
              <h2 className="font-heading text-xl font-bold text-foreground tracking-tight">
                IPL <span className="text-primary neon-text">LIVE</span>
              </h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              The ultimate futuristic platform for live IPL scores, in-depth analysis, and real-time match commentary. Experience the game like never before.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="p-2 rounded-lg bg-secondary/50 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-secondary/50 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-secondary/50 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all">
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest border-l-2 border-primary pl-3">
              Platform
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-xs text-muted-foreground hover:text-primary hover:translate-x-1 transition-all flex items-center gap-2 group">
                  <div className="w-1 h-1 rounded-full bg-border group-hover:bg-primary transition-all" />
                  Live Scores
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-xs text-muted-foreground hover:text-primary hover:translate-x-1 transition-all flex items-center gap-2 group">
                  <div className="w-1 h-1 rounded-full bg-border group-hover:bg-primary transition-all" />
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-xs text-muted-foreground hover:text-primary hover:translate-x-1 transition-all flex items-center gap-2 group">
                  <div className="w-1 h-1 rounded-full bg-border group-hover:bg-primary transition-all" />
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest border-l-2 border-primary pl-3">
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy-policy" className="text-xs text-muted-foreground hover:text-primary hover:translate-x-1 transition-all flex items-center gap-2 group">
                  <div className="w-1 h-1 rounded-full bg-border group-hover:bg-primary transition-all" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <a href="https://www.iplt20.com/news" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary hover:translate-x-1 transition-all flex items-center gap-2 group">
                  <div className="w-1 h-1 rounded-full bg-border group-hover:bg-primary transition-all" />
                  Latest News
                </a>
              </li>
              <li>
                <a href="https://www.iplt20.com/stats" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary hover:translate-x-1 transition-all flex items-center gap-2 group">
                  <div className="w-1 h-1 rounded-full bg-border group-hover:bg-primary transition-all" />
                  Stats & Records
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest border-l-2 border-primary pl-3">
              Stay Updated
            </h3>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Subscribe to get notified about the latest match schedules and platform updates.
            </p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email address" 
                className="flex-1 px-3 py-2 bg-secondary/50 border border-border/50 rounded-lg text-[10px] focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
              <button className="px-3 py-2 bg-primary/20 text-primary border border-primary/30 rounded-lg text-[10px] font-bold hover:bg-primary hover:text-white transition-all">
                Join
              </button>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="border-t border-border/30 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-muted-foreground font-body">
            &copy; {currentYear} IPL LIVE. All rights reserved. 
            <span className="mx-2 opacity-30">|</span> 
            Made with <span className="text-red-500 mx-1">❤️</span> for Cricket Fans
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy-policy" className="text-[10px] text-muted-foreground hover:text-primary transition-colors">Privacy</Link>
            <Link to="/contact" className="text-[10px] text-muted-foreground hover:text-primary transition-colors">Support</Link>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-sm shadow-green-500/50" />
              <span className="text-[9px] text-muted-foreground uppercase tracking-tighter">System Online</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
