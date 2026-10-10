import DashboardShell from "@/src/components/Dashboardshell/Dashboardshell";

export const metadata = {
  title: "Dashboard | Futuristic Coders Admin Portal",
};

export default function DashboardLayout({ children }) {
  return <DashboardShell>{children}</DashboardShell>;
}