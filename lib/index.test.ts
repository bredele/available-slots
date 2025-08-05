import test from 'node:test';
import assert from 'node:assert';
import slots from './index.js';

test('basic usage - 30min chunks, no breaks', () => {
  const result = slots({
    busy: [
      { start: '09:00', end: '10:30' },
      { start: '14:00', end: '15:30' },
    ],
  });

  const expected = [
    { start: '08:00', end: '08:30' },
    { start: '08:30', end: '09:00' },
    { start: '10:30', end: '11:00' },
    { start: '11:00', end: '11:30' },
    { start: '11:30', end: '12:00' },
    { start: '12:00', end: '12:30' },
    { start: '12:30', end: '13:00' },
    { start: '13:00', end: '13:30' },
    { start: '13:30', end: '14:00' },
    { start: '15:30', end: '16:00' },
    { start: '16:00', end: '16:30' },
    { start: '16:30', end: '17:00' },
    { start: '17:00', end: '17:30' },
    { start: '17:30', end: '18:00' },
  ];

  assert.deepStrictEqual(result, expected);
});

test('custom slot size and breaks', () => {
  const result = slots({
    busy: [
      { start: '09:00', end: '10:30' },
      { start: '14:00', end: '15:30' },
    ],
    slotSize: 45,
    breakTime: 15,
    startTime: '08:00',
    endTime: '18:00',
  });

  const expected = [
    { start: '08:00', end: '08:45' },
    { start: '10:30', end: '11:15' },
    { start: '11:30', end: '12:15' },
    { start: '12:30', end: '13:15' },
    { start: '15:30', end: '16:15' },
    { start: '16:30', end: '17:15' },
  ];

  assert.deepStrictEqual(result, expected);
});

test('no busy slots - full day available', () => {
  const result = slots({
    busy: [],
    startTime: '09:00',
    endTime: '12:00',
  });

  const expected = [
    { start: '09:00', end: '09:30' },
    { start: '09:30', end: '10:00' },
    { start: '10:00', end: '10:30' },
    { start: '10:30', end: '11:00' },
    { start: '11:00', end: '11:30' },
    { start: '11:30', end: '12:00' },
  ];

  assert.deepStrictEqual(result, expected);
});

test('overlapping busy slots are merged', () => {
  const result = slots({
    busy: [
      { start: '09:00', end: '10:30' },
      { start: '10:00', end: '11:00' },
      { start: '10:45', end: '12:00' },
    ],
    startTime: '08:00',
    endTime: '13:00',
  });

  const expected = [
    { start: '08:00', end: '08:30' },
    { start: '08:30', end: '09:00' },
    { start: '12:00', end: '12:30' },
    { start: '12:30', end: '13:00' },
  ];

  assert.deepStrictEqual(result, expected);
});

test('adjacent busy slots are merged', () => {
  const result = slots({
    busy: [
      { start: '09:00', end: '10:00' },
      { start: '10:00', end: '11:00' },
    ],
    startTime: '08:00',
    endTime: '12:00',
  });

  const expected = [
    { start: '08:00', end: '08:30' },
    { start: '08:30', end: '09:00' },
    { start: '11:00', end: '11:30' },
    { start: '11:30', end: '12:00' },
  ];

  assert.deepStrictEqual(result, expected);
});

test('fully booked day returns empty array', () => {
  const result = slots({
    busy: [{ start: '08:00', end: '18:00' }],
  });

  assert.deepStrictEqual(result, []);
});

test('busy slots outside work hours are ignored', () => {
  const result = slots({
    busy: [
      { start: '07:00', end: '08:30' },
      { start: '17:30', end: '19:00' },
    ],
    startTime: '08:00',
    endTime: '18:00',
  });

  const expected = [
    { start: '08:30', end: '09:00' },
    { start: '09:00', end: '09:30' },
    { start: '09:30', end: '10:00' },
    { start: '10:00', end: '10:30' },
    { start: '10:30', end: '11:00' },
    { start: '11:00', end: '11:30' },
    { start: '11:30', end: '12:00' },
    { start: '12:00', end: '12:30' },
    { start: '12:30', end: '13:00' },
    { start: '13:00', end: '13:30' },
    { start: '13:30', end: '14:00' },
    { start: '14:00', end: '14:30' },
    { start: '14:30', end: '15:00' },
    { start: '15:00', end: '15:30' },
    { start: '15:30', end: '16:00' },
    { start: '16:00', end: '16:30' },
    { start: '16:30', end: '17:00' },
    { start: '17:00', end: '17:30' },
  ];

  assert.deepStrictEqual(result, expected);
});

test('break time creates gaps between slots', () => {
  const result = slots({
    busy: [{ start: '10:00', end: '10:30' }],
    slotSize: 30,
    breakTime: 15,
    startTime: '08:00',
    endTime: '12:00',
  });

  const expected = [
    { start: '08:00', end: '08:30' },
    { start: '08:45', end: '09:15' },
    { start: '09:30', end: '10:00' },
    { start: '10:30', end: '11:00' },
    { start: '11:15', end: '11:45' },
  ];

  assert.deepStrictEqual(result, expected);
});

test('small work window with large slots', () => {
  const result = slots({
    busy: [],
    slotSize: 60,
    startTime: '10:00',
    endTime: '11:30',
  });

  const expected = [{ start: '10:00', end: '11:00' }];

  assert.deepStrictEqual(result, expected);
});

test('unordered busy slots are handled correctly', () => {
  const result = slots({
    busy: [
      { start: '14:00', end: '15:00' },
      { start: '09:00', end: '10:00' },
      { start: '11:30', end: '12:30' },
    ],
    startTime: '08:00',
    endTime: '16:00',
  });

  const expected = [
    { start: '08:00', end: '08:30' },
    { start: '08:30', end: '09:00' },
    { start: '10:00', end: '10:30' },
    { start: '10:30', end: '11:00' },
    { start: '11:00', end: '11:30' },
    { start: '12:30', end: '13:00' },
    { start: '13:00', end: '13:30' },
    { start: '13:30', end: '14:00' },
    { start: '15:00', end: '15:30' },
    { start: '15:30', end: '16:00' },
  ];

  assert.deepStrictEqual(result, expected);
});

test('edge case: slot exactly fits at end of day', () => {
  const result = slots({
    busy: [],
    slotSize: 30,
    startTime: '17:30',
    endTime: '18:00',
  });

  const expected = [{ start: '17:30', end: '18:00' }];

  assert.deepStrictEqual(result, expected);
});

test('complex overlapping scenario', () => {
  const result = slots({
    busy: [
      { start: '11:00', end: '12:00' },
      { start: '13:00', end: '14:00' },
      { start: '09:30', end: '11:30' },
      { start: '13:30', end: '15:30' },
      { start: '09:00', end: '10:00' },
    ],
    startTime: '08:00',
    endTime: '16:00',
  });

  const expected = [
    { start: '08:00', end: '08:30' },
    { start: '08:30', end: '09:00' },
    { start: '12:00', end: '12:30' },
    { start: '12:30', end: '13:00' },
    { start: '15:30', end: '16:00' },
  ];

  assert.deepStrictEqual(result, expected);
});
