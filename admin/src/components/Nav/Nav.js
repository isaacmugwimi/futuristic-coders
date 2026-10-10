import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  CreditCard,
  Award,
  Settings,
} from "lucide-react";

export const MAIN_NAV = [
  {
    href: "/dashboard",
    label: "Dashboard",
    subtitle: "Overview of your academy",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/dashboard/students",
    label: "Students",
    subtitle: "Track progress and performance",
    icon: Users,
  },
  {
    href: "/dashboard/programs",
    label: "Programs",
    subtitle: "Manage courses and curriculum",
    icon: BookOpen,
  },
  {
    href: "/dashboard/enrollments",
    label: "Enrollments",
    subtitle: "Handle registrations and subscriptions",
    icon: FileText,
  },
  {
    href: "/dashboard/payments",
    label: "Payments",
    subtitle: "Monitor transactions and invoices",
    icon: CreditCard,
  },
  {
    href: "/dashboard/certificates",
    label: "Certificates",
    subtitle: "Generate and verify certificates",
    icon: Award,
  },
];

export const SYSTEM_NAV = [
  {
    href: "/dashboard/settings",
    label: "Settings",
    subtitle: "Manage users and system preferences",
    icon: Settings,
  },
];

export const ALL_NAV = [...MAIN_NAV, ...SYSTEM_NAV];

export function isActive(pathname, item) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}