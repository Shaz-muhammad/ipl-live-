import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Shield, Zap, Layout, Users, BarChart3, Radio } from "lucide-react";

const About = () => {
  const features = [
    {
      icon: <Radio className="h-6 w-6" />,
      title: "Live Scores",
      desc: "Real-time updates for every match with millisecond precision."
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Scorecards",
      desc: "Detailed batting and bowling stats for every inning played."
    },
    {
      icon: <Layout className="h-6 w-6" />,
      title: "Fan Themes",
      desc: "Customizable UI themes that match your favorite IPL team's colors."
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Live Links",
      desc: "Curated streaming links to watch the action live from any device."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Futuristic UI",
      desc: "A cutting-edge glassmorphic design built for speed and mobile responsiveness."
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-6 py-16 space-y-24">
        
        {/* Hero */}
        <section className="text-center space-y-8 max-w-3xl mx-auto pt-10">
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
              The Future of <span className="text-primary neon-text">Cricket</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              IPL LIVE is a premium, futuristic platform dedicated to providing cricket enthusiasts with an immersive match-day experience. From live ball-by-ball scores to dynamic team-themed interfaces, we've built every feature with speed and fan engagement in mind.
            </p>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-8 border border-border/50 hover:border-primary/50 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center text-primary mb-6 group-hover:scale-110 group-hover:bg-primary/10 transition-all">
                {f.icon}
              </div>
              <h3 className="font-heading text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                {f.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-body">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </section>

        {/* Mission */}
        <section className="glass-card p-8 md:p-12 border border-primary/20 bg-primary/5 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32 rounded-full" />
          <div className="relative z-10 max-w-2xl">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-6">Our Mission</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-8 font-body">
              Our mission is to bridge the gap between complex sports data and fan-friendly visualization. We believe that tracking your favorite team shouldn't just be about numbers—it should be an experience that reflects the energy and passion of the game.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="px-4 py-2 rounded-full bg-background/50 border border-border/50 text-[10px] font-bold text-primary uppercase tracking-widest">Speed First</div>
              <div className="px-4 py-2 rounded-full bg-background/50 border border-border/50 text-[10px] font-bold text-primary uppercase tracking-widest">Fan Focused</div>
              <div className="px-4 py-2 rounded-full bg-background/50 border border-border/50 text-[10px] font-bold text-primary uppercase tracking-widest">Innovation</div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default About;
