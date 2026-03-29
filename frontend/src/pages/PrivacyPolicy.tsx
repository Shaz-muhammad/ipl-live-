import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Shield, Lock, Eye, Cookie, UserCheck, Scale, ExternalLink } from "lucide-react";

const PrivacyPolicy = () => {
  const sections = [
    {
      icon: <Eye className="h-6 w-6" />,
      title: "Information Collection",
      content: "We collect basic analytics data such as IP addresses, device types, and browser versions to optimize our futuristic scoring interface. When you use our contact form, we collect your name and email to facilitate communication."
    },
    {
      icon: <Cookie className="h-6 w-6" />,
      title: "Cookies & Tracking",
      content: "Our platform uses essential cookies to remember your preferred team themes and session states. We also use performance cookies to understand how fans interact with live scorecards and commentary sections."
    },
    {
      icon: <Scale className="h-6 w-6" />,
      title: "Third-Party & External Links",
      content: "To provide the most comprehensive coverage, we include links to official IPLT20 news, articles, and live streaming services. Please note that these external sites have their own privacy policies which we do not control."
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: "Data Retention & Security",
      content: "Match-related interactions and contact submissions are stored securely in our encrypted database. We implement strict security protocols to ensure your data remains protected from unauthorized access."
    },
    {
      icon: <UserCheck className="h-6 w-6" />,
      title: "User Rights",
      content: "As a fan on our platform, you have the right to request access to or deletion of any personal data you've shared through our contact forms. We are committed to transparency in all our data practices."
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-6 py-16 space-y-20 max-w-4xl pt-10">
        
        {/* Header */}
        <section className="text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-2xl shadow-primary/20"
          >
            <Shield className="h-10 w-10 text-primary neon-text" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="font-heading text-4xl md:text-6xl font-bold text-foreground tracking-tight">
              Privacy <span className="text-primary neon-text">Policy</span>
            </h1>
            <p className="text-sm text-muted-foreground font-body max-w-2xl mx-auto leading-relaxed">
              Last Updated: March 2026. This policy outlines our commitment to protecting the privacy of cricket fans worldwide.
            </p>
          </motion.div>
        </section>

        {/* Note on External Links */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-secondary/30 border border-primary/20 flex items-start gap-4"
        >
          <ExternalLink className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="text-primary font-bold">Important Note:</span> Our "Latest IPL News" section fetches metadata from official <span className="text-foreground font-bold">IPLT20.com</span> public pages. All news links redirect users to the original source. We do not host or claim ownership of external article content.
          </p>
        </motion.div>

        {/* Content Sections */}
        <section className="space-y-12">
          {sections.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-8 border border-border/50 rounded-3xl group hover:border-primary/30 transition-all"
            >
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-14 h-14 rounded-2xl bg-secondary/50 flex items-center justify-center text-primary flex-shrink-0 group-hover:scale-110 group-hover:bg-primary/10 transition-all">
                  {s.icon}
                </div>
                <div className="space-y-4">
                  <h3 className="font-heading text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-body">
                    {s.content}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </section>

        {/* Contact Info */}
        <section className="text-center py-10 bg-secondary/10 rounded-3xl border border-dashed border-border/50">
          <p className="text-xs text-muted-foreground font-body">
            Questions regarding our data practices? Reach out at: 
            <br />
            <a 
              href="mailto:ipl.live1003@gmail.com"
              className="text-primary font-bold hover:underline mt-2 inline-block text-sm"
            >
              ipl.live1003@gmail.com
            </a>
          </p>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
