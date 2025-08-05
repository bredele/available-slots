interface TimeSlot {
  start: string;
  end: string;
}

interface SlotsOptions {
  busy: TimeSlot[];
  slotSize?: number;
  breakTime?: number;
  startTime?: string;
  endTime?: string;
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

function mergeOverlappingSlots(slots: TimeSlot[]): TimeSlot[] {
  if (slots.length === 0) return [];
  
  const sortedSlots = slots
    .map(slot => ({
      start: timeToMinutes(slot.start),
      end: timeToMinutes(slot.end)
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

  return merged.map(slot => ({
    start: minutesToTime(slot.start),
    end: minutesToTime(slot.end)
  }));
}

function generateAvailableSlots(
  mergedBusy: TimeSlot[],
  startTime: number,
  endTime: number,
  slotSize: number,
  breakTime: number
): TimeSlot[] {
  const available: TimeSlot[] = [];
  const totalSlotTime = slotSize + breakTime;

  const busyInMinutes = mergedBusy.map(slot => ({
    start: timeToMinutes(slot.start),
    end: timeToMinutes(slot.end)
  }));

  let currentTime = startTime;

  for (const busySlot of busyInMinutes) {
    while (currentTime + slotSize <= busySlot.start) {
      available.push({
        start: minutesToTime(currentTime),
        end: minutesToTime(currentTime + slotSize)
      });
      currentTime += totalSlotTime;
    }
    currentTime = Math.max(currentTime, busySlot.end);
  }

  while (currentTime + slotSize <= endTime) {
    available.push({
      start: minutesToTime(currentTime),
      end: minutesToTime(currentTime + slotSize)
    });
    currentTime += totalSlotTime;
  }

  return available;
}

export default function slots(options: SlotsOptions): TimeSlot[] {
  const {
    busy,
    slotSize = 30,
    breakTime = 0,
    startTime = '08:00',
    endTime = '18:00'
  } = options;

  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  if (busy.length === 0) {
    return generateAvailableSlots([], startMinutes, endMinutes, slotSize, breakTime);
  }

  const mergedBusy = mergeOverlappingSlots(busy);
  return generateAvailableSlots(mergedBusy, startMinutes, endMinutes, slotSize, breakTime);
}