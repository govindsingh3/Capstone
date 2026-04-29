import { motion, AnimatePresence } from "framer-motion";

const tone = {
  critical: "border-rose-400/40 bg-rose-500/15 text-rose-200",
  warning: "border-amber-400/40 bg-amber-500/15 text-amber-200",
  info: "border-secondary/40 bg-secondary/15 text-blue-100",
  success: "border-emerald-400/40 bg-emerald-500/15 text-emerald-100",
};

const AlertsPanel = ({ alerts }) => {
  return (
    <section className="glass-card p-4">
      <h3 className="mb-3 text-sm font-semibold">Critical Alerts</h3>
      <div className="space-y-2">
        <AnimatePresence>
          {alerts.slice(-4).map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={`rounded-lg border px-3 py-2 text-sm ${tone[alert.level] || tone.info}`}
            >
              {alert.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default AlertsPanel;
