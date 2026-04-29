import {
  LayoutDashboard,
  Building2,
  Radar,
  BrainCircuit,
  GraduationCap,
  FileText,
} from "lucide-react";

export const navItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Institution", path: "/institution", icon: Building2 },
  { label: "Simulation Lab", path: "/simulation", icon: Radar },
  { label: "AI Insights", path: "/ai-insights", icon: BrainCircuit },
  { label: "Learning Center", path: "/learning", icon: GraduationCap },
  { label: "Reports", path: "/reports", icon: FileText },
];
