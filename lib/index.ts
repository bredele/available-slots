export interface TimeSlot {
  start: string;
  end: string;
}

export interface SlotsOptions {
  busy: TimeSlot[];
  slotSize?: number;
  breakTime?: number;
  startTime?: string;
  endTime?: string;
}

/**
 * Converts time in HH:MM format to total minutes since midnight.
 * This makes time calculations and comparisons much easier to work with.
 */

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

/**
 * Converts total minutes since midnight back to HH:MM time format.
 * Ensures proper zero-padding for consistent time string formatting.
 */

const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
};

/**
 * Consolidates overlapping or adjacent busy time periods into single merged slots.
 * This prevents gaps in the schedule from being incorrectly identified as available
 * when busy periods actually touch or overlap each other.
 */

const mergeOverlappingSlots = (slots: TimeSlot[]): TimeSlot[] => {
  if (slots.length === 0) return [];

  const sortedSlots = slots
    .map((slot) => ({
      start: timeToMinutes(slot.start),
      end: timeToMinutes(slot.end),
    }))
    .sort((a, b) => a.start - b.start);

  const merged: { start: number; end: number }[] = [sortedSlots[0]];

  for (let i = 1; i < sortedSlots.length; i++) {
    const current = sortedSlots[i];
    const last = merged[merged.length - 1];

    if (current.start <= last.end) {
      last.end = Math.max(last.end, current.end);
    } else {
      merged.push(current);
    }
  }

  return merged.map((slot) => ({
    start: minutesToTime(slot.start),
    end: minutesToTime(slot.end),
  }));
};

/**
 * Finds gaps between busy periods and creates available time slots with proper spacing.
 * The algorithm walks through the day, fitting slots before each busy period, then
 * continuing after busy periods end. Break time is added between consecutive available slots.
 */

const generateAvailableSlots = (
  mergedBusy: TimeSlot[],
  startTime: number,
  endTime: number,
  slotSize: number,
  breakTime: number
): TimeSlot[] => {
  const available: TimeSlot[] = [];
  const totalSlotTime = slotSize + breakTime;

  const busyInMinutes = mergedBusy.map((slot) => ({
    start: timeToMinutes(slot.start),
    end: timeToMinutes(slot.end),
  }));

  let currentTime = startTime;

  for (const busySlot of busyInMinutes) {
    while (currentTime + slotSize <= busySlot.start) {
      available.push({
        start: minutesToTime(currentTime),
        end: minutesToTime(currentTime + slotSize),
      });
      currentTime += totalSlotTime;
    }
    currentTime = Math.max(currentTime, busySlot.end);
  }

  while (currentTime + slotSize <= endTime) {
    available.push({
      start: minutesToTime(currentTime),
      end: minutesToTime(currentTime + slotSize),
    });
    currentTime += totalSlotTime;
  }

  return available;
};

/**
 * Main entry point for finding available time slots in a daily schedule.
 * Processes user options, handles overlapping busy periods, and orchestrates
 * the slot generation algorithm to return available time periods.
 */

const slots = (options: SlotsOptions): TimeSlot[] => {
  const {
    busy,
    slotSize = 30,
    breakTime = 0,
    startTime = "08:00",
    endTime = "18:00",
  } = options;

  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  if (busy.length === 0) {
    return generateAvailableSlots(
      [],
      startMinutes,
      endMinutes,
      slotSize,
      breakTime
    );
  }

  const mergedBusy = mergeOverlappingSlots(busy);
  return generateAvailableSlots(
    mergedBusy,
    startMinutes,
    endMinutes,
    slotSize,
    breakTime
  );
};

export default slots;
