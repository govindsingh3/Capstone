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
  const menuRef = useRef(null);

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
          className="interactive focus-ring rounded-full border border-white/10 p-2 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-4 w-4" />
        </button>

        <label className="relative hidden w-56 md:block" aria-label="Search">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            className="focus-ring w-full rounded-full border border-white/10 bg-slate-900/30 py-2 pl-9 pr-4 text-sm placeholder:text-slate-400 focus:border-secondary"
            placeholder="Search modules"
          />
        </label>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <button
          type="button"
          className="interactive focus-ring relative rounded-full border border-white/10 p-2"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          className="interactive focus-ring rounded-full border border-white/10 p-2"
          aria-label={`Activate ${theme === "dark" ? "light" : "dark"} theme`}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((state) => !state)}
            className="focus-ring flex items-center gap-2 rounded-full border border-white/10 px-2 py-1.5"
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
                onClick={logout}
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
