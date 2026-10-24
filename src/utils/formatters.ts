import { ForwardDay } from '../types';

export const formatLKR = (num: number | string | undefined | null): string => {
  return 'LKR ' + Number(num || 0).toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const getForward7Days = (): ForwardDay[] => {
  const days: ForwardDay[] = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayNumber = i + 1;
    const dateFormatted = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const dayMonthStr = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    const relativeLabel = i === 0 ? 'Today' : `Today + ${i}`;
    days.push({
      dayIndex: dayNumber,
      label: `Day ${dayNumber}`,
      dateStr: dateFormatted,
      isToday: i === 0,
      weekday: d.toLocaleDateString('en-US', { weekday: 'long' }),
      relativeLabel,
      dayMonthStr,
      offsetDays: i
    });
  }
  return days;
};
