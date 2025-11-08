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
  CalendarCheck,
  UserCog,
  Building2,
} from "lucide-react";

export const SIDEBAR_PANEL_NAV_MENU: SidebarPanelNavModel[] = [
  {
    title: "Клиника",
    children: [
      {
        title: "Панель управления",
        url: ROUTES.DASHBOARD,
        icon: LayoutDashboardIcon,
      },
      {
        title: "Очередь отделений",
        url: ROUTES.DEPARTMENT_QUEUE,
        icon: Building2,
      },
      {
        title: "Записи",
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
    title: "Финансы",
    children: [
      {
        title: "Счета",
        url: ROUTES.INVOICES,
        icon: Receipt,
      },
    ],
  },
  {
    title: "Материальные активы",
    children: [
      {
        title: "Склады",
        url: ROUTES.STOCKS,
        icon: BoxIcon,
      },
    ],
  },
  {
    title: "Периферия",
    children: [
      {
        title: "Отчеты",
        url: ROUTES.REPORT,
        icon: FileTextIcon,
      },
    ],
  },
];
