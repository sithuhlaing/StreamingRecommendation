// src/utils/generators.ts

/**
 * Generate a unique ID using various methods
 */
export const generateId = (
  method: 'uuid' | 'nanoid' | 'timestamp' | 'random' = 'uuid',
  length: number = 21
): string => {
  switch (method) {
    case 'uuid':
      return generateUUID();
    case 'nanoid':
      return generateNanoId(length);
    case 'timestamp':
      return generateTimestampId();
    case 'random':
      return generateRandomId(length);
    default:
      return generateUUID();
  }
};

/**
 * Generate a UUID v4
 */
export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback implementation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Generate a NanoID-style identifier
 */
export const generateNanoId = (length: number = 21): string => {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let id = '';
  
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    
    for (let i = 0; i < length; i++) {
      id += alphabet[bytes[i] % alphabet.length];
    }
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < length; i++) {
      id += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
  }
  
  return id;
};

/**
 * Generate a timestamp-based ID
 */
export const generateTimestampId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomSuffix}`;
};

/**
 * Generate a random ID with specified length
 */
export const generateRandomId = (length: number = 12): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

/**
 * Generate a URL-friendly slug from text
 */
export const generateSlug = (
  text: string,
  options: {
    maxLength?: number;
    separator?: string;
    lowercase?: boolean;
    removeSpecialChars?: boolean;
  } = {}
): string => {
  const {
    maxLength = 50,
    separator = '-',
    lowercase = true,
    removeSpecialChars = true
  } = options;
  
  let slug = text.trim();
  
  // Convert to lowercase if requested
  if (lowercase) {
    slug = slug.toLowerCase();
  }
  
  // Replace spaces and underscores with separator
  slug = slug.replace(/[\s_]+/g, separator);
  
  // Remove special characters if requested
  if (removeSpecialChars) {
    slug = slug.replace(/[^\w\-]/g, '');
  }
  
  // Remove multiple consecutive separators
  slug = slug.replace(new RegExp(`${separator}+`, 'g'), separator);
  
  // Remove separator from start and end
  slug = slug.replace(new RegExp(`^${separator}+|${separator}+$`, 'g'), '');
  
  // Truncate to max length
  if (maxLength && slug.length > maxLength) {
    slug = slug.substring(0, maxLength);
    // Remove trailing separator if truncation caused it
    slug = slug.replace(new RegExp(`${separator}+$`), '');
  }
  
  return slug;
};

/**
 * Generate a random color in hex format
 */
export const generateRandomColor = (format: 'hex' | 'rgb' | 'hsl' = 'hex'): string => {
  switch (format) {
    case 'hex':
      return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
    
    case 'rgb': {
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      return `rgb(${r}, ${g}, ${b})`;
    }
    
    case 'hsl': {
      const h = Math.floor(Math.random() * 360);
      const s = Math.floor(Math.random() * 101);
      const l = Math.floor(Math.random() * 101);
      return `hsl(${h}, ${s}%, ${l}%)`;
    }
    
    default:
      return generateRandomColor('hex');
  }
};

/**
 * Generate a set of brand-safe colors
 */
export const generateBrandColors = (count: number = 5): string[] => {
  const brandPalettes = [
    ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
    ['#6C5CE7', '#A29BFE', '#FD79A8', '#FDCB6E', '#E17055'],
    ['#00B894', '#00CEC9', '#0984E3', '#6C5CE7', '#A29BFE'],
    ['#E84393', '#FD79A8', '#FDCB6E', '#E17055', '#00B894'],
    ['#2D3436', '#636E72', '#B2BEC3', '#DDD', '#FFF']
  ];
  
  const palette = brandPalettes[Math.floor(Math.random() * brandPalettes.length)];
  
  if (count <= palette.length) {
    return palette.slice(0, count);
  }
  
  // If we need more colors than available in palette, generate additional ones
  const colors = [...palette];
  while (colors.length < count) {
    colors.push(generateRandomColor('hex'));
  }
  
  return colors;
};

/**
 * Generate a random password
 */
export const generatePassword = (
  length: number = 12,
  options: {
    includeUppercase?: boolean;
    includeLowercase?: boolean;
    includeNumbers?: boolean;
    includeSymbols?: boolean;
    excludeSimilar?: boolean;
  } = {}
): string => {
  const {
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSymbols = true,
    excludeSimilar = false
  } = options;
  
  let charset = '';
  
  if (includeUppercase) {
    charset += excludeSimilar ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  }
  
  if (includeLowercase) {
    charset += excludeSimilar ? 'abcdefghjkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
  }
  
  if (includeNumbers) {
    charset += excludeSimilar ? '23456789' : '0123456789';
  }
  
  if (includeSymbols) {
    charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  }
  
  if (!charset) {
    throw new Error('At least one character type must be included');
  }
  
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
};

/**
 * Generate a random username
 */
export const generateUsername = (
  options: {
    style?: 'adjective-noun' | 'noun-number' | 'random';
    length?: number;
    separator?: string;
  } = {}
): string => {
  const { style = 'adjective-noun', length = 12, separator = '' } = options;
  
  const adjectives = [
    'swift', 'bright', 'clever', 'bold', 'gentle', 'fierce', 'calm', 'brave',
    'wise', 'quick', 'strong', 'smart', 'cool', 'warm', 'fresh', 'crisp'
  ];
  
  const nouns = [
    'tiger', 'eagle', 'wolf', 'fox', 'bear', 'lion', 'hawk', 'deer',
    'shark', 'whale', 'dolphin', 'phoenix', 'dragon', 'unicorn', 'pegasus', 'griffin'
  ];
  
  switch (style) {
    case 'adjective-noun': {
      const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      return `${adj}${separator}${noun}`;
    }
    
    case 'noun-number': {
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      const number = Math.floor(Math.random() * 9999) + 1;
      return `${noun}${separator}${number}`;
    }
    
    case 'random':
    default:
      return generateRandomId(length);
  }
};

/**
 * Generate a mock email address
 */
export const generateMockEmail = (
  domain: string = 'example.com',
  style: 'realistic' | 'random' = 'realistic'
): string => {
  if (style === 'realistic') {
    const firstNames = ['john', 'jane', 'mike', 'sarah', 'david', 'lisa', 'tom', 'anna'];
    const lastNames = ['smith', 'johnson', 'brown', 'davis', 'miller', 'wilson', 'moore', 'taylor'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const separator = Math.random() > 0.5 ? '.' : '';
    const number = Math.random() > 0.7 ? Math.floor(Math.random() * 999) + 1 : '';
    
    return `${firstName}${separator}${lastName}${number}@${domain}`;
  } else {
    const randomString = generateRandomId(8).toLowerCase();
    return `${randomString}@${domain}`;
  }
};

/**
 * Generate fake data for testing
 */
export const generateMockData = {
  campaign: () => ({
    id: generateId(),
    name: `Campaign ${generateRandomId(6)}`,
    status: ['draft', 'active', 'paused', 'completed'][Math.floor(Math.random() * 4)],
    budget: Math.floor(Math.random() * 50000) + 1000,
    spend: Math.floor(Math.random() * 30000),
    impressions_served: Math.floor(Math.random() * 1000000) + 10000,
    clicks: Math.floor(Math.random() * 50000) + 100,
    conversions: Math.floor(Math.random() * 5000) + 10,
    start_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }),
  
  advertiser: () => ({
    id: generateId(),
    name: `Advertiser ${generateRandomId(4)}`,
    company_name: `Company ${generateRandomId(6)}`,
    industry: ['Technology', 'Healthcare', 'Finance', 'Retail', 'Entertainment'][Math.floor(Math.random() * 5)],
    contact_email: generateMockEmail(),
    tier: ['basic', 'standard', 'premium'][Math.floor(Math.random() * 3)],
    monthly_ad_spend: Math.floor(Math.random() * 100000) + 5000,
    is_active: Math.random() > 0.2,
    created_at: new Date().toISOString(),
  }),
  
  user: () => ({
    id: generateId(),
    username: generateUsername(),
    email: generateMockEmail(),
    firstName: ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa'][Math.floor(Math.random() * 6)],
    lastName: ['Smith', 'Johnson', 'Brown', 'Davis', 'Miller', 'Wilson'][Math.floor(Math.random() * 6)],
    role: ['admin', 'manager', 'user'][Math.floor(Math.random() * 3)],
    isActive: Math.random() > 0.1,
    createdAt: new Date().toISOString(),
  })
};

/**
 * Generate a batch of mock data
 */
export const generateMockDataBatch = <T>(
  generator: () => T,
  count: number
): T[] => {
  return Array.from({ length: count }, generator);
};