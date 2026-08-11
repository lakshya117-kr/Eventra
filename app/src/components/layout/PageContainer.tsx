import { motion } from 'framer-motion';

interface PageContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export default function PageContainer({ title, subtitle, children, action }: PageContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">{title}</h1>
          {subtitle && <p className="text-zinc-500 mt-1 text-sm">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </motion.div>
  );
}
