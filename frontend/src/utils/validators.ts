// src/utils/validators.ts

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
};

export const validatePhone = (phone: string): boolean => {
  // Remove all non-numeric characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Check for valid US phone number (10 or 11 digits)
  if (cleanPhone.length === 10 || (cleanPhone.length === 11 && cleanPhone[0] === '1')) {
    return true;
  }
  
  // Check for international format
  const internationalRegex = /^\+?[1-9]\d{1,14}$/;
  return internationalRegex.test(phone.replace(/\s+/g, ''));
};

export const validateUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

export const validateCampaignName = (name: string): { isValid: boolean; error?: string } => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Campaign name is required' };
  }
  
  if (name.length < 3) {
    return { isValid: false, error: 'Campaign name must be at least 3 characters' };
  }
  
  if (name.length > 255) {
    return { isValid: false, error: 'Campaign name cannot exceed 255 characters' };
  }
  
  // Check for invalid characters
  const validNameRegex = /^[a-zA-Z0-9\s\-_\.]+$/;
  if (!validNameRegex.test(name)) {
    return { isValid: false, error: 'Campaign name contains invalid characters' };
  }
  
  return { isValid: true };
};

export const validateBudget = (budget: number): { isValid: boolean; error?: string } => {
  if (typeof budget !== 'number' || isNaN(budget)) {
    return { isValid: false, error: 'Budget must be a valid number' };
  }
  
  if (budget <= 0) {
    return { isValid: false, error: 'Budget must be greater than 0' };
  }
  
  if (budget < 100) {
    return { isValid: false, error: 'Minimum budget is $100' };
  }
  
  if (budget > 10000000) {
    return { isValid: false, error: 'Maximum budget is $10,000,000' };
  }
  
  return { isValid: true };
};

export const validateDateRange = (
  startDate: Date, 
  endDate: Date
): { isValid: boolean; error?: string } => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  if (startDate < now) {
    return { isValid: false, error: 'Start date cannot be in the past' };
  }
  
  if (endDate <= startDate) {
    return { isValid: false, error: 'End date must be after start date' };
  }
  
  const maxDuration = 365; // days
  const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (duration > maxDuration) {
    return { isValid: false, error: `Campaign duration cannot exceed ${maxDuration} days` };
  }
  
  return { isValid: true };
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateFileUpload = (
  file: File,
  maxSize: number = 10 * 1024 * 1024, // 10MB
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'application/pdf']
): { isValid: boolean; error?: string } => {
  if (file.size > maxSize) {
    return { 
      isValid: false, 
      error: `File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit` 
    };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: `File type ${file.type} is not allowed` 
    };
  }
  
  return { isValid: true };
};

export const validateCreditCard = (cardNumber: string): { isValid: boolean; error?: string } => {
  // Remove spaces and dashes
  const cleanNumber = cardNumber.replace(/[\s-]/g, '');
  
  // Check if it's all digits
  if (!/^\d+$/.test(cleanNumber)) {
    return { isValid: false, error: 'Card number must contain only digits' };
  }
  
  // Check length (13-19 digits for most cards)
  if (cleanNumber.length < 13 || cleanNumber.length > 19) {
    return { isValid: false, error: 'Invalid card number length' };
  }
  
  // Luhn algorithm validation
  let sum = 0;
  let shouldDouble = false;
  
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber.charAt(i));
    
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  if (sum % 10 !== 0) {
    return { isValid: false, error: 'Invalid card number' };
  }
  
  return { isValid: true };
};

export const validatePostalCode = (postalCode: string, country: string = 'US'): boolean => {
  const patterns: { [key: string]: RegExp } = {
    US: /^\d{5}(-\d{4})?$/, // 12345 or 12345-6789
    CA: /^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/, // K1A 0A6
    UK: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i, // SW1A 1AA
    DE: /^\d{5}$/, // 12345
    FR: /^\d{5}$/, // 75001
  };
  
  const pattern = patterns[country.toUpperCase()];
  return pattern ? pattern.test(postalCode.trim()) : true; // Default to valid for unknown countries
};