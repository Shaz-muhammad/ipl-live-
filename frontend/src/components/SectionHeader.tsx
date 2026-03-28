import { motion } from 'framer-motion';

interface Props {
  icon: string;
  title: string;
}

export function SectionHeader({ icon, title }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-2 mb-4"
    >
      <span className="text-lg">{icon}</span>
      <h2 className="font-heading text-xl font-bold text-foreground">{title}</h2>
    </motion.div>
  );
}
