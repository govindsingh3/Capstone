import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, Menu, MoonStar, Search, Sun, UserCircle2 } from "lucide-react";
import { useUIStore } from "../../store/index.js";
import { useAuth } from "../../hooks/useAuth.js";

const TopBar = () => {
  const openMobileSidebar = useUIStore((state) => state.openMobileSidebar);
  const theme = useUIStore((state) => state.theme);
  const toggleTheme = useUIStore((state) => state.toggleTheme);
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const menuRef = useRef(null);
  const alertsRef = useRef(null);

  const notifications = useMemo(
    () => [
      { id: 1, title: "Readiness sync completed", detail: "All institutions updated 7m ago." },
      { id: 2, title: "New district report available", detail: "North Zone flood preparedness report is ready." },
      { id: 3, title: "Simulation reminder", detail: "Quarterly evacuation drill starts tomorrow." },
    ],
    []
  );

  const initials = useMemo(() => {
    const name = user?.name || "Admin User";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user]);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);

  useEffect(() => {
    const onClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (alertsRef.current && !alertsRef.current.contains(event.target)) {
        setAlertsOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="glass-card sticky top-0 z-30 mb-4 flex items-center justify-between gap-3 p-3 md:p-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={openMobileSidebar}
          className="icon-button interactive focus-ring rounded-full p-2 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-4 w-4" />
        </button>

        <label className="relative hidden w-56 md:block" aria-label="Search">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            className="panel-input focus-ring w-full rounded-full py-2 pl-9 pr-4 text-sm"
            placeholder="Search modules"
          />
        </label>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <div className="relative" ref={alertsRef}>
          <button
            type="button"
            onClick={() => {
              setAlertsOpen((state) => !state);
              setMenuOpen(false);
            }}
            className="icon-button interactive focus-ring relative rounded-full p-2"
            aria-label="Notifications"
            aria-haspopup="menu"
            aria-expanded={alertsOpen}
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
          </button>

          {alertsOpen && (
            <div className="surface-card absolute right-0 mt-2 w-80 overflow-hidden" role="menu" aria-label="Notifications panel">
              <div className="border-b border-[var(--border)] px-3 py-2 text-sm font-semibold">Notifications</div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((item) => (
                  <div key={item.id} className="border-b border-[var(--border)] px-3 py-2 last:border-b-0">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          className="icon-button interactive focus-ring rounded-full p-2"
          aria-label={`Activate ${theme === "dark" ? "light" : "dark"} theme`}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((state) => !state)}
            className="icon-button focus-ring flex items-center gap-2 rounded-full px-2 py-1.5"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="User menu"
          >
            <div className="grid h-8 w-8 place-items-center rounded-full bg-secondary/20 text-xs font-semibold text-secondary">
              {initials}
            </div>
            <span className="hidden text-sm md:block">{user?.name || "Administrator"}</span>
          </button>

          {menuOpen && (
            <div
              className="surface-card absolute right-0 mt-2 w-48 overflow-hidden"
              role="menu"
              aria-label="User actions"
            >
              <div className="border-b border-white/10 px-3 py-2 text-sm text-muted">{user?.email || "admin@dpres.app"}</div>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                className="focus-ring flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-secondary/10"
                role="menuitem"
              >
                <UserCircle2 className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
