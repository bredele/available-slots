# available-slots

Find available time slots from your daily schedule with configurable chunks &amp; breaks.

## Installation

```sh
npm install available-slots
```

## Usage

```ts
import slots from 'available-slots';

// basic usage - 30min chunks, no breaks
slots({
  busy: [
    { start: '09:00', end: '10:30' },
    { start: '14:00', end: '15:30' },
  ],
});

// custom slot size and breaks
slots({
  busy: [
    { start: '09:00', end: '10:30' },
    { start: '14:00', end: '15:30' },
  ],
  slotSize: 45,
  breakTime: 15,
  startTime: '08:00',
  endTime: '18:00',
});
```
