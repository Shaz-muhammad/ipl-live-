import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Mail, Send, CheckCircle2, AlertCircle, MapPin, Phone, MessageSquare, Headphones } from "lucide-react";
import { api } from "@/services/api";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    else if (formData.subject.trim().length < 3) newErrors.subject = "Subject is too short";
    if (!formData.message.trim()) newErrors.message = "Message is required";
    else if (formData.message.trim().length < 10) newErrors.message = "Message must be at least 10 chars";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setStatus("idle");
    setStatusMsg("");
    setErrors({});

    try {
      const res = await api.post("/contact", formData);
      
      if (res.data?.ok) {
        setStatus("success");
        setStatusMsg(res.data.message || "Message delivered successfully!");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
        setStatusMsg(res.data?.error || "Failed to deliver message");
      }
    } catch (err: any) {
      console.error("❌ Contact error:", err);
      setStatus("error");
      const errMsg = err.response?.data?.error || "Service temporarily unavailable. Please check your connection.";
      setStatusMsg(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-6 py-16 space-y-20">
        
        {/* Header */}
        <section className="text-center space-y-6 max-w-3xl mx-auto pt-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="font-heading text-4xl md:text-6xl font-bold text-foreground tracking-tight">
              Contact <span className="text-primary neon-text">Support</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto font-body">
              For match issues, live link concerns, partnership queries, or platform support, contact us through the form below or use the official support details.
            </p>
          </motion.div>
        </section>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* Support Information */}
          <section className="space-y-12">
            <div className="space-y-8">
              <h2 className="font-heading text-2xl font-bold text-foreground flex items-center gap-3">
                <Headphones className="h-6 w-6 text-primary" /> Support Information
              </h2>
              
              <div className="space-y-6">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-4 group glass-card p-6 border border-border/30 hover:border-primary/50 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center text-primary border border-border/50 group-hover:bg-primary/10 transition-all shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Email Support</p>
                    <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">ipl.live1003@gmail.com</p>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-start gap-4 group glass-card p-6 border border-border/30 hover:border-primary/50 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center text-primary border border-border/50 group-hover:bg-primary/10 transition-all shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Headquarters</p>
                    <p className="text-sm font-bold text-foreground">ABC, XYZ</p>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-start gap-4 group glass-card p-6 border border-border/30 hover:border-primary/50 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center text-primary border border-border/50 group-hover:bg-primary/10 transition-all shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Global Hotline</p>
                    <p className="text-sm font-bold text-foreground">xxxxxxxxxx</p>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Neon Tip */}
            <div className="glass-card p-6 border border-primary/20 bg-primary/5 rounded-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-[11px] text-muted-foreground leading-relaxed font-body relative z-10">
                <span className="text-primary font-bold">Pro Tip:</span> Include your Match ID or Device Type if reporting a technical glitch for faster resolution.
              </p>
            </div>
          </section>

          {/* Contact Form */}
          <section className="glass-card p-8 md:p-10 border border-border/50 rounded-[32px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32 rounded-full" />
            
            <h2 className="font-heading text-2xl font-bold text-foreground mb-8 relative z-10">Send Message</h2>

            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Full Name</label>
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className={`w-full px-4 py-3 bg-secondary/50 border ${errors.name ? 'border-destructive/50' : 'border-border/50'} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm`}
                  />
                  {errors.name && <p className="text-[10px] text-destructive ml-1">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Email Address</label>
                  <input
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className={`w-full px-4 py-3 bg-secondary/50 border ${errors.email ? 'border-destructive/50' : 'border-border/50'} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm`}
                  />
                  {errors.email && <p className="text-[10px] text-destructive ml-1">{errors.email}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Subject</label>
                <input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Partnership Query"
                  className={`w-full px-4 py-3 bg-secondary/50 border ${errors.subject ? 'border-destructive/50' : 'border-border/50'} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm`}
                />
                {errors.subject && <p className="text-[10px] text-destructive ml-1">{errors.subject}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Your Message</label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we help you?"
                  className={`w-full px-4 py-3 bg-secondary/50 border ${errors.message ? 'border-destructive/50' : 'border-border/50'} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm resize-none`}
                />
                {errors.message && <p className="text-[10px] text-destructive ml-1">{errors.message}</p>}
              </div>

              <AnimatePresence>
                {status === "success" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-[11px] text-green-500 flex items-center gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0" /> {statusMsg}
                  </motion.div>
                )}
                {status === "error" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-[11px] text-destructive flex items-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" /> {statusMsg}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/80 py-4 rounded-xl text-white font-heading font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 group"
              >
                {isSubmitting ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                    <MessageSquare className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <>
                    Deploy Message 
                    <Send className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </>
                )}
              </button>
            </form>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
