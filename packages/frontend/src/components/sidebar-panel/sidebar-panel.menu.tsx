import { SidebarPanelNavModel } from "@/components/sidebar-panel/sidebar-panel.model";
import { ROUTES } from "@/constants/route.constants";
import {
  LayoutDashboardIcon,
  CalendarIcon,
  UserIcon,
  Users,
  DollarSignIcon,
  ShoppingCartIcon,
  CreditCardIcon,
  BoxIcon,
  FileTextIcon,
  Stethoscope,
  TestTube,
  ClipboardList,
  Receipt,
  UserCog,
  CalendarCheck,
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
        title: "Панель регистратуры",
        url: ROUTES.RECEPTION_DASHBOARD,
        icon: UserCog,
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
        title: "Визиты",
        url: ROUTES.VISITS,
        icon: CalendarCheck,
      },
      {
        title: "Назначения",
        url: ROUTES.ORDERS,
        icon: ClipboardList,
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
        title: "Счета",
        url: ROUTES.INVOICES,
        icon: Receipt,
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
