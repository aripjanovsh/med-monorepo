import type { QueueItemResponseDto } from "./reception.dto";

/**
 * Calculate wait time color based on minutes
 */
export const calculateWaitTimeColor = (minutes: number): string => {
  const THRESHOLDS = {
    NORMAL: 15,
    WARNING: 30,
    CRITICAL: 45,
  };

  if (minutes < THRESHOLDS.NORMAL) return "green";
  if (minutes < THRESHOLDS.WARNING) return "yellow";
  if (minutes < THRESHOLDS.CRITICAL) return "orange";
  return "red";
};

/**
 * Check if wait time is considered long
 */
export const isLongWaitTime = (minutes: number): boolean => {
  const WARNING_THRESHOLD = 30;
  return minutes >= WARNING_THRESHOLD;
};

/**
 * Get queue item priority based on appointment type and wait time
 */
export const getQueuePriority = (item: QueueItemResponseDto): number => {
  // Higher number = higher priority
  let priority = 0;

  // Emergency appointments get highest priority
  if (item.appointment.status === "EMERGENCY") {
    priority += 1000;
  }

  // Long wait times increase priority
  if (item.waitTime >= 45) {
    priority += 100;
  } else if (item.waitTime >= 30) {
    priority += 50;
  }

  // Earlier check-in gets higher priority
  priority += 100 - item.position;

  return priority;
};

/**
 * Sort queue items by priority
 */
export const sortQueueByPriority = (
  items: QueueItemResponseDto[]
): QueueItemResponseDto[] => {
  return [...items].sort((a, b) => getQueuePriority(b) - getQueuePriority(a));
};
