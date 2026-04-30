import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday } from 'date-fns';

export const formatDate = (date: string | Date): string =>
  format(new Date(date), 'MMM d, yyyy');

export const formatDateTime = (date: string | Date): string =>
  format(new Date(date), 'MMM d, yyyy • h:mm a');

export const formatTime = (date: string | Date): string =>
  format(new Date(date), 'h:mm a');

export const timeAgo = (date: string | Date): string =>
  formatDistanceToNow(new Date(date), { addSuffix: true });

export const smartDate = (date: string | Date): string => {
  const d = new Date(date);
  if (isToday(d)) return `Today, ${format(d, 'h:mm a')}`;
  if (isTomorrow(d)) return `Tomorrow, ${format(d, 'h:mm a')}`;
  if (isYesterday(d)) return `Yesterday, ${format(d, 'h:mm a')}`;
  return formatDate(d);
};

export const getInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/** Simple class merger without external deps */
export const cn = (...classes: (string | undefined | null | false | 0)[]): string =>
  classes.filter(Boolean).join(' ');

/** @deprecated use `cn` instead */
export const clsx = cn;
