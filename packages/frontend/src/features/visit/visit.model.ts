import { format, differenceInMinutes, differenceInHours, differenceInDays } from "date-fns";
import { ru } from "date-fns/locale";
import type { VisitResponseDto } from "./visit.dto";
import { VISIT_STATUS_LABELS } from "./visit.constants";

export const getVisitStatusLabel = (status: string): string => {
  return VISIT_STATUS_LABELS[status] || status;
};

export const isVisitEditable = (visit: VisitResponseDto): boolean => {
  return visit.status === "IN_PROGRESS";
};

export const canCompleteVisit = (visit: VisitResponseDto): boolean => {
  return visit.status === "IN_PROGRESS";
};

export const canCancelVisit = (visit: VisitResponseDto): boolean => {
  return visit.status === "IN_PROGRESS";
};

export const formatVisitDate = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, "dd.MM.yyyy HH:mm", { locale: ru });
};

export const getVisitUnpaidTotal = (visit: VisitResponseDto): number => {
  return (
    visit.serviceOrders
      ?.filter((so) => so.paymentStatus === "UNPAID")
      .reduce((sum, so) => sum + so.service.price, 0) ?? 0
  );
};

export const hasVisitUnpaidServices = (visit: VisitResponseDto): boolean => {
  return (
    visit.serviceOrders?.some((so) => so.paymentStatus === "UNPAID") ?? false
  );
};

export const formatDoctorShortName = (employee?: VisitResponseDto["employee"]): string => {
  if (!employee) {
    return "—";
  }
  return `${employee.lastName} ${employee.firstName[0]}.`;
};

export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  
  const minutes = differenceInMinutes(now, date);
  const hours = differenceInHours(now, date);
  const days = differenceInDays(now, date);
  
  if (minutes < 1) {
    return "только что";
  }
  
  if (minutes < 60) {
    const lastDigit = minutes % 10;
    const lastTwoDigits = minutes % 100;
    
    let suffix = "минут";
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
      suffix = "минут";
    } else if (lastDigit === 1) {
      suffix = "минуту";
    } else if (lastDigit >= 2 && lastDigit <= 4) {
      suffix = "минуты";
    }
    
    return `${minutes} ${suffix} назад`;
  }
  
  if (hours < 24) {
    const lastDigit = hours % 10;
    const lastTwoDigits = hours % 100;
    
    let suffix = "часов";
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
      suffix = "часов";
    } else if (lastDigit === 1) {
      suffix = "час";
    } else if (lastDigit >= 2 && lastDigit <= 4) {
      suffix = "часа";
    }
    
    return `${hours} ${suffix} назад`;
  }
  
  if (days < 7) {
    const lastDigit = days % 10;
    const lastTwoDigits = days % 100;
    
    let suffix = "дней";
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
      suffix = "дней";
    } else if (lastDigit === 1) {
      suffix = "день";
    } else if (lastDigit >= 2 && lastDigit <= 4) {
      suffix = "дня";
    }
    
    return `${days} ${suffix} назад`;
  }
  
  // Если больше недели, показываем дату
  return format(date, "dd.MM.yyyy", { locale: ru });
};
