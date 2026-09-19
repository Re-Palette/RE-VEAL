import {
  Bell,
  Briefcase,
  Building2,
  CalendarDays,
  Compass,
  GraduationCap,
  Home,
  LayoutGrid,
  MessageCircle,
  Globe,
  Settings,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import type { UIKey } from "@/lib/i18n/dictionary";

export interface NavItem {
  href: string;
  labelKey: UIKey;
  icon: React.ComponentType<{ className?: string }>;
  /** Shown as a count chip in the sidebar. */
  badge?: "messages" | "notifications";
}

export interface NavGroup {
  labelKey: UIKey;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    labelKey: "nav.main",
    items: [
      { href: "/", labelKey: "nav.home", icon: Home },
      { href: "/discover", labelKey: "nav.discover", icon: Compass },
      { href: "/map", labelKey: "nav.map", icon: Globe },
      { href: "/match", labelKey: "nav.match", icon: Sparkles },
    ],
  },
  {
    labelKey: "nav.connect",
    items: [
      { href: "/people", labelKey: "nav.people", icon: Users },
      { href: "/brands", labelKey: "nav.brands", icon: Building2 },
      { href: "/projects", labelKey: "nav.projects", icon: Briefcase },
      { href: "/events", labelKey: "nav.events", icon: CalendarDays },
    ],
  },
  {
    labelKey: "nav.grow",
    items: [
      { href: "/learn", labelKey: "nav.learn", icon: GraduationCap },
      { href: "/portfolio", labelKey: "nav.portfolio", icon: LayoutGrid },
    ],
  },
  {
    labelKey: "nav.personal",
    items: [
      { href: "/messages", labelKey: "nav.messages", icon: MessageCircle, badge: "messages" },
      { href: "/notifications", labelKey: "nav.notifications", icon: Bell, badge: "notifications" },
      { href: "/profile", labelKey: "nav.profile", icon: UserRound },
      { href: "/settings", labelKey: "nav.settings", icon: Settings },
    ],
  },
];

/** Mobile bottom navigation — the five destinations that matter on a phone. */
export const MOBILE_NAV: NavItem[] = [
  { href: "/", labelKey: "nav.home", icon: Home },
  { href: "/map", labelKey: "nav.map", icon: Globe },
  { href: "/match", labelKey: "nav.match", icon: Sparkles },
  { href: "/projects", labelKey: "nav.projects", icon: Briefcase },
  { href: "/messages", labelKey: "nav.messages", icon: MessageCircle, badge: "messages" },
];
