// src/utils/formatters.ts

export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '$0.00';
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (
  value: number,
  locale: string = 'en-US',
  options: Intl.NumberFormatOptions = {}
): string => {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0';
  }

  // For large numbers, use compact notation
  if (value >= 1000000) {
    return new Intl.NumberFormat(locale, {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 1,
      ...options,
    }).format(value);
  }

  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
    ...options,
  }).format(value);
};

export const formatPercentage = (
  value: number,
  decimals: number = 2,
  locale: string = 'en-US'
): string => {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0%';
  }

  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
};

export const formatDate = (
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {},
  locale: string = 'en-US'
): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }

    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options,
    };

    return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

export const formatDateTime = (
  date: Date | string,
  locale: string = 'en-US'
): string => {
  return formatDate(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }, locale);
};

export const formatRelativeTime = (
  date: Date | string,
  locale: string = 'en-US'
): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - dateObj.getTime();
    
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    
    if (years > 0) return rtf.format(-years, 'year');
    if (months > 0) return rtf.format(-months, 'month');
    if (weeks > 0) return rtf.format(-weeks, 'week');
    if (days > 0) return rtf.format(-days, 'day');
    if (hours > 0) return rtf.format(-hours, 'hour');
    if (minutes > 0) return rtf.format(-minutes, 'minute');
    
    return 'Just now';
  } catch (error) {
    console.error('Relative time formatting error:', error);
    return 'Unknown';
  }
};

export const formatDuration = (seconds: number): string => {
  if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) {
    return '0s';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
};

export const formatFileSize = (bytes: number): string => {
  if (typeof bytes !== 'number' || isNaN(bytes) || bytes < 0) {
    return '0 B';
  }

  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  if (i === 0) return bytes + ' ' + sizes[i];
  
  return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
};

export const formatMetric = (
  value: number,
  type: 'currency' | 'number' | 'percentage' | 'duration',
  options?: any
): string => {
  switch (type) {
    case 'currency':
      return formatCurrency(value, options?.currency, options?.locale);
    case 'number':
      return formatNumber(value, options?.locale, options);
    case 'percentage':
      return formatPercentage(value, options?.decimals, options?.locale);
    case 'duration':
      return formatDuration(value);
    default:
      return String(value);
  }
};