import { SidebarPanelNavModel } from "@/components/sidebar-panel/sidebar-panel.model";
import { ROUTES } from "@/constants/route.constants";
import {
  LayoutDashboardIcon,
  CalendarIcon,
  UserIcon,
  Activity,
  Users,
  DollarSignIcon,
  ShoppingCartIcon,
  CreditCardIcon,
  BoxIcon,
  FileTextIcon,
  Stethoscope,
  TestTube,
} from "lucide-react";

export const SIDEBAR_PANEL_NAV_MENU: SidebarPanelNavModel[] = [
  {
    title: "Clinc",
    children: [
      {
        title: "Dashboard",
        url: ROUTES.DASHBOARD,
        icon: LayoutDashboardIcon,
      },
      {
        title: "Панель врача",
        url: ROUTES.DOCTOR_DASHBOARD,
        icon: Stethoscope,
      },
      {
        title: "Reservations",
        url: ROUTES.APPOINTMENTS,
        icon: CalendarIcon,
      },
      {
        title: "Пациенты",
        url: ROUTES.PATIENTS,
        icon: UserIcon,
      },
      {
        title: "Treatments",
        url: ROUTES.TREATMENTS,
        icon: Activity,
      },
      {
        title: "Шаблоны анализов",
        url: ROUTES.ANALYSIS_TEMPLATES,
        icon: TestTube,
      },
      {
        title: "Сотрудники",
        url: ROUTES.EMPLOYEES,
        icon: Users,
      },
    ],
  },
  {
    title: "Finance",
    children: [
      {
        title: "Accounts",
        url: ROUTES.ACCOUNTS,
        icon: DollarSignIcon,
      },

      {
        title: "Sales",
        url: ROUTES.SALES,
        icon: ShoppingCartIcon,
      },
      {
        title: "Purchases",
        url: ROUTES.PURCHASES,
        icon: ShoppingCartIcon,
      },
      {
        title: "Payment Method",
        url: ROUTES.PAYMENT_METHOD,
        icon: CreditCardIcon,
      },
    ],
  },
  {
    title: "Physical Asset",
    children: [
      {
        title: "Stocks",
        url: ROUTES.STOCKS,
        icon: BoxIcon,
      },
    ],
  },
  {
    title: "Pheriperals",
    children: [
      {
        title: "Report",
        url: ROUTES.REPORT,
        icon: FileTextIcon,
      },
    ],
  },
];
