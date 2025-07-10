// src/utils/performance.ts

/**
 * Creates a debounced version of a function that delays invoking func until after
 * wait milliseconds have elapsed since the last time the debounced function was invoked.
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate: boolean = false
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
};

/**
 * Creates a throttled version of a function that only invokes func at most once per
 * every wait milliseconds.
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  let previous = 0;
  const { leading = true, trailing = true } = options;
  
  return function executedFunction(...args: Parameters<T>) {
    const now = Date.now();
    
    if (!previous && !leading) previous = now;
    
    const remaining = wait - (now - previous);
    
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func(...args);
    } else if (!timeout && trailing) {
      timeout = setTimeout(() => {
        previous = !leading ? 0 : Date.now();
        timeout = null;
        func(...args);
      }, remaining);
    }
  };
};

/**
 * Memoizes a function result based on its arguments
 */
export const memoize = <T extends (...args: any[]) => any>(
  func: T,
  resolver?: (...args: Parameters<T>) => string
): T => {
  const cache = new Map<string, ReturnType<T>>();
  
  const memoized = (...args: Parameters<T>): ReturnType<T> => {
    const key = resolver ? resolver(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = func(...args);
    cache.set(key, result);
    return result;
  };
  
  return memoized as T;
};

/**
 * Creates a function that will delay the execution of func until the current call stack has cleared
 */
export const defer = <T extends (...args: any[]) => any>(func: T) => {
  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(func(...args));
      }, 0);
    });
  };
};

/**
 * Batch multiple function calls into a single execution
 */
export const batch = <T extends (...args: any[]) => any>(
  func: T,
  batchSize: number = 10,
  delay: number = 0
) => {
  let batch: Array<{ args: Parameters<T>; resolve: (value: ReturnType<T>) => void }> = [];
  let timeout: NodeJS.Timeout | null = null;
  
  const processBatch = () => {
    const currentBatch = [...batch];
    batch = [];
    timeout = null;
    
    currentBatch.forEach(({ args, resolve }) => {
      resolve(func(...args));
    });
  };
  
  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise((resolve) => {
      batch.push({ args, resolve });
      
      if (batch.length >= batchSize) {
        if (timeout) {
          clearTimeout(timeout);
        }
        processBatch();
      } else if (!timeout) {
        timeout = setTimeout(processBatch, delay);
      }
    });
  };
};

/**
 * Limits the rate of function execution
 */
export const rateLimit = <T extends (...args: any[]) => any>(
  func: T,
  maxCalls: number,
  windowMs: number
): ((...args: Parameters<T>) => Promise<ReturnType<T>>) => {
  const calls: number[] = [];
  
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const now = Date.now();
    
    // Remove old calls outside the window
    while (calls.length > 0 && calls[0] <= now - windowMs) {
      calls.shift();
    }
    
    if (calls.length >= maxCalls) {
      const oldestCall = calls[0];
      const waitTime = oldestCall + windowMs - now;
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return rateLimit(func, maxCalls, windowMs)(...args);
    }
    
    calls.push(now);
    return func(...args);
  };
};

/**
 * Retries a function execution with exponential backoff
 */
export const retry = async <T>(
  func: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000,
  maxDelay: number = 10000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await func();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};

/**
 * Measures the execution time of a function
 */
export const measurePerformance = <T extends (...args: any[]) => any>(
  func: T,
  label?: string
): T => {
  return ((...args: Parameters<T>): ReturnType<T> => {
    const startTime = performance.now();
    const result = func(...args);
    const endTime = performance.now();
    
    const duration = endTime - startTime;
    const labelText = label || func.name || 'Anonymous function';
    
    console.log(`${labelText} execution time: ${duration.toFixed(2)}ms`);
    
    return result;
  }) as T;
};

/**
 * Creates a lazy-loaded function that initializes only when first called
 */
export const lazy = <T>(initializer: () => T): (() => T) => {
  let instance: T;
  let initialized = false;
  
  return (): T => {
    if (!initialized) {
      instance = initializer();
      initialized = true;
    }
    return instance;
  };
};

/**
 * Creates a function that can only be called once
 */
export const once = <T extends (...args: any[]) => any>(func: T): T => {
  let called = false;
  let result: ReturnType<T>;
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    if (!called) {
      called = true;
      result = func(...args);
    }
    return result;
  }) as T;
};

/**
 * Cancellable timeout that can be cleared
 */
export class CancellableTimeout {
  private timeoutId: NodeJS.Timeout | null = null;
  private cancelled = false;
  
  constructor(
    private callback: () => void,
    private delay: number
  ) {}
  
  start(): void {
    if (this.cancelled) return;
    
    this.timeoutId = setTimeout(() => {
      if (!this.cancelled) {
        this.callback();
      }
    }, this.delay);
  }
  
  cancel(): void {
    this.cancelled = true;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
  
  reset(): void {
    this.cancel();
    this.cancelled = false;
    this.start();
  }
}

/**
 * Simple queue implementation for managing async operations
 */
export class AsyncQueue {
  private queue: Array<() => Promise<any>> = [];
  private running = false;
  
  async add<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await operation();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.process();
    });
  }
  
  private async process(): Promise<void> {
    if (this.running || this.queue.length === 0) {
      return;
    }
    
    this.running = true;
    
    while (this.queue.length > 0) {
      const operation = this.queue.shift();
      if (operation) {
        await operation();
      }
    }
    
    this.running = false;
  }
  
  clear(): void {
    this.queue = [];
  }
  
  get length(): number {
    return this.queue.length;
  }
}