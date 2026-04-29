import { Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import SidebarNav from "./SidebarNav.jsx";
import TopBar from "./TopBar.jsx";

const AppShell = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen p-3 md:p-4">
      <div className="flex min-h-[calc(100vh-1.5rem)] gap-3 md:gap-4">
        <SidebarNav />
        <main className="w-full min-w-0">
          <TopBar />
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="pb-6"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AppShell;
