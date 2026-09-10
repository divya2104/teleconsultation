import {
  LayoutDashboard,
  CalendarDays,
  FileText,
  BellRing,
  UserCog,
  ListChecks,
  Clock,
  Users,
  Stethoscope,
  CreditCard,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { label: string; href: string; icon: LucideIcon };

export const marketingNav: { label: string; href: string }[] = [
  { label: "Home", href: "/" },
  { label: "How it works", href: "/how-it-works" },
  { label: "For doctors", href: "/for-doctors" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
];

export const forDoctorsMenu: NavItem[] = [
  { label: "Overview", href: "/for-doctors", icon: BarChart3 },
  { label: "Onboarding & verification", href: "/for-doctors#onboarding", icon: Users },
  { label: "Earnings & payouts", href: "/for-doctors#earnings", icon: CreditCard },
  { label: "FAQ", href: "/for-doctors#faq", icon: FileText },
];

export const patientNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Appointments", href: "/dashboard?tab=appointments", icon: CalendarDays },
  { label: "Prescriptions", href: "/dashboard?tab=prescriptions", icon: FileText },
  { label: "Recalls", href: "/dashboard?tab=recalls", icon: BellRing },
  { label: "Profile", href: "/profile", icon: UserCog },
];

export const doctorNav: NavItem[] = [
  { label: "Dashboard", href: "/doctor/dashboard", icon: LayoutDashboard },
  { label: "Queue", href: "/doctor/queue", icon: ListChecks },
  { label: "Availability", href: "/doctor/availability", icon: Clock },
  { label: "Patients", href: "/doctor/patients", icon: Users },
  { label: "Profile", href: "/doctor/profile", icon: UserCog },
];

export const adminNav: NavItem[] = [
  { label: "Doctors", href: "/admin?tab=doctors", icon: Stethoscope },
  { label: "Bookings", href: "/admin?tab=bookings", icon: CalendarDays },
  { label: "Payments", href: "/admin?tab=payments", icon: CreditCard },
  { label: "Analytics", href: "/admin?tab=analytics", icon: BarChart3 },
];

export type Role = "patient" | "doctor" | "admin";

export const navByRole: Record<Role, NavItem[]> = {
  patient: patientNav,
  doctor: doctorNav,
  admin: adminNav,
};

/** Landing route for a signed-in user of each role. */
export const roleHome: Record<Role, string> = {
  patient: "/dashboard",
  doctor: "/doctor/dashboard",
  admin: "/admin",
};
