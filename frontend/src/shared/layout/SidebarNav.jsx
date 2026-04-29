import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { navItems } from "./navigation.js";
import { useUIStore } from "../../store/index.js";

const SidebarContent = ({ mobile = false }) => {
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const closeMobileSidebar = useUIStore((state) => state.closeMobileSidebar);

  const handleNav = () => {
    if (mobile) closeMobileSidebar();
  };

  return (
    <>
      <div className="mb-8 flex items-center justify-between px-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary/20 text-secondary">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          {!sidebarCollapsed && <span className="text-sm font-semibold tracking-wide">DPRES Command</span>}
        </div>
        {!mobile && (
          <button
            type="button"
            onClick={toggleSidebar}
            className="interactive focus-ring rounded-full border p-2" style={{ borderColor: 'var(--btn-border)' }}
            aria-label="Toggle sidebar"
          >
            <ChevronLeft className={`h-4 w-4 transition ${sidebarCollapsed ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>

      <nav className="space-y-2" aria-label="Main navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNav}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  isActive ? "" : "hover:bg-[var(--nav-inactive-hover)] [color:var(--nav-inactive)]"
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? { background: "var(--nav-active-bg)", color: "var(--nav-active-text)" }
                  : {}
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full transition ${
                      isActive ? "bg-secondary shadow-[0_0_12px_rgba(59,130,246,0.9)]" : "bg-transparent"
                    }`}
                    aria-hidden="true"
                  />
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};

const SidebarNav = () => {
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const mobileSidebarOpen = useUIStore((state) => state.mobileSidebarOpen);
  const closeMobileSidebar = useUIStore((state) => state.closeMobileSidebar);

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 88 : 248 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="glass-card hidden h-screen shrink-0 p-4 lg:block"
      >
        <SidebarContent />
      </motion.aside>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 backdrop-blur-sm lg:hidden" style={{ background: 'rgba(15,23,42,0.45)' }} onClick={closeMobileSidebar} aria-hidden="true" />
      )}

      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: mobileSidebarOpen ? 0 : -280 }}
        transition={{ duration: 0.25 }}
        className="glass-card fixed left-0 top-0 z-50 h-screen w-64 p-4 lg:hidden"
        aria-hidden={!mobileSidebarOpen}
      >
        <SidebarContent mobile />
      </motion.aside>
    </>
  );
};

export default SidebarNav;
