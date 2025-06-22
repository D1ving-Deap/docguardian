// Centralized error handling system

export interface AppError {
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userMessage?: string;
  context?: string;
  timestamp: Date;
  userId?: string;
}

export class AppError extends Error {
  public code: string;
  public severity: 'low' | 'medium' | 'high' | 'critical';
  public userMessage?: string;
  public context?: string;
  public timestamp: Date;
  public userId?: string;

  constructor(
    message: string,
    code: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    userMessage?: string,
    context?: string,
    userId?: string
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.severity = severity;
    this.userMessage = userMessage;
    this.context = context;
    this.timestamp = new Date();
    this.userId = userId;
  }
}

// Error codes for different types of errors
export const ERROR_CODES = {
  // Authentication errors
  AUTH_INVALID_CREDENTIALS: 'AUTH_001',
  AUTH_EMAIL_NOT_VERIFIED: 'AUTH_002',
  AUTH_ACCOUNT_LOCKED: 'AUTH_003',
  AUTH_RATE_LIMIT_EXCEEDED: 'AUTH_004',
  AUTH_SESSION_EXPIRED: 'AUTH_005',
  
  // File upload errors
  FILE_INVALID_TYPE: 'FILE_001',
  FILE_TOO_LARGE: 'FILE_002',
  FILE_MALICIOUS: 'FILE_003',
  FILE_UPLOAD_FAILED: 'FILE_004',
  FILE_PROCESSING_FAILED: 'FILE_005',
  
  // OCR errors
  OCR_INITIALIZATION_FAILED: 'OCR_001',
  OCR_PROCESSING_FAILED: 'OCR_002',
  OCR_NO_TEXT_FOUND: 'OCR_003',
  OCR_LOW_CONFIDENCE: 'OCR_004',
  
  // Network errors
  NETWORK_TIMEOUT: 'NET_001',
  NETWORK_CONNECTION_FAILED: 'NET_002',
  NETWORK_SERVER_ERROR: 'NET_003',
  
  // Validation errors
  VALIDATION_INVALID_INPUT: 'VAL_001',
  VALIDATION_MISSING_REQUIRED: 'VAL_002',
  VALIDATION_FORMAT_ERROR: 'VAL_003',
  
  // Permission errors
  PERMISSION_DENIED: 'PERM_001',
  PERMISSION_INSUFFICIENT: 'PERM_002',
  
  // System errors
  SYSTEM_UNKNOWN: 'SYS_001',
  SYSTEM_CONFIGURATION: 'SYS_002',
  SYSTEM_MAINTENANCE: 'SYS_003'
} as const;

// User-friendly error messages
export const USER_ERROR_MESSAGES = {
  [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: 'Invalid email or password. Please try again.',
  [ERROR_CODES.AUTH_EMAIL_NOT_VERIFIED]: 'Please verify your email address before logging in.',
  [ERROR_CODES.AUTH_ACCOUNT_LOCKED]: 'Your account has been temporarily locked. Please contact support.',
  [ERROR_CODES.AUTH_RATE_LIMIT_EXCEEDED]: 'Too many login attempts. Please try again later.',
  [ERROR_CODES.AUTH_SESSION_EXPIRED]: 'Your session has expired. Please log in again.',
  
  [ERROR_CODES.FILE_INVALID_TYPE]: 'This file type is not supported. Please upload a valid document.',
  [ERROR_CODES.FILE_TOO_LARGE]: 'File is too large. Please choose a smaller file.',
  [ERROR_CODES.FILE_MALICIOUS]: 'This file appears to be unsafe and cannot be uploaded.',
  [ERROR_CODES.FILE_UPLOAD_FAILED]: 'Failed to upload file. Please try again.',
  [ERROR_CODES.FILE_PROCESSING_FAILED]: 'Failed to process file. Please try again.',
  
  [ERROR_CODES.OCR_INITIALIZATION_FAILED]: 'Document processing service is unavailable.',
  [ERROR_CODES.OCR_PROCESSING_FAILED]: 'Failed to extract text from document.',
  [ERROR_CODES.OCR_NO_TEXT_FOUND]: 'No readable text found in the document.',
  [ERROR_CODES.OCR_LOW_CONFIDENCE]: 'Document quality is low. Please upload a clearer image.',
  
  [ERROR_CODES.NETWORK_TIMEOUT]: 'Request timed out. Please check your connection.',
  [ERROR_CODES.NETWORK_CONNECTION_FAILED]: 'Connection failed. Please check your internet connection.',
  [ERROR_CODES.NETWORK_SERVER_ERROR]: 'Server error. Please try again later.',
  
  [ERROR_CODES.VALIDATION_INVALID_INPUT]: 'Please check your input and try again.',
  [ERROR_CODES.VALIDATION_MISSING_REQUIRED]: 'Please fill in all required fields.',
  [ERROR_CODES.VALIDATION_FORMAT_ERROR]: 'Please check the format of your input.',
  
  [ERROR_CODES.PERMISSION_DENIED]: 'You do not have permission to perform this action.',
  [ERROR_CODES.PERMISSION_INSUFFICIENT]: 'You need additional permissions for this action.',
  
  [ERROR_CODES.SYSTEM_UNKNOWN]: 'An unexpected error occurred. Please try again.',
  [ERROR_CODES.SYSTEM_CONFIGURATION]: 'System configuration error. Please contact support.',
  [ERROR_CODES.SYSTEM_MAINTENANCE]: 'System is under maintenance. Please try again later.'
};

// Error logging function
export const logError = (error: unknown, context?: string, userId?: string): void => {
  const errorInfo = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
    userId,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  };

  // Log to console in development
  if (import.meta.env.DEV) {
    console.error('Application Error:', errorInfo);
  }

  // In production, send to external logging service
  // Example: sendToLoggingService(errorInfo);
  
  // Store in localStorage for debugging (limited to last 10 errors)
  try {
    const errorLog = JSON.parse(localStorage.getItem('errorLog') || '[]');
    errorLog.push(errorInfo);
    if (errorLog.length > 10) {
      errorLog.shift(); // Remove oldest error
    }
    localStorage.setItem('errorLog', JSON.stringify(errorLog));
  } catch (e) {
    console.error('Failed to log error to localStorage:', e);
  }
};

// Get user-friendly error message
export const getUserErrorMessage = (error: unknown): string => {
  if (error instanceof AppError) {
    return error.userMessage || USER_ERROR_MESSAGES[error.code] || error.message;
  }
  
  if (error instanceof Error) {
    // Try to match error message to known patterns
    const message = error.message.toLowerCase();
    
    if (message.includes('invalid email') || message.includes('wrong password')) {
      return USER_ERROR_MESSAGES[ERROR_CODES.AUTH_INVALID_CREDENTIALS];
    }
    
    if (message.includes('email not confirmed') || message.includes('not verified')) {
      return USER_ERROR_MESSAGES[ERROR_CODES.AUTH_EMAIL_NOT_VERIFIED];
    }
    
    if (message.includes('too many requests') || message.includes('rate limit')) {
      return USER_ERROR_MESSAGES[ERROR_CODES.AUTH_RATE_LIMIT_EXCEEDED];
    }
    
    if (message.includes('network') || message.includes('connection')) {
      return USER_ERROR_MESSAGES[ERROR_CODES.NETWORK_CONNECTION_FAILED];
    }
    
    if (message.includes('timeout')) {
      return USER_ERROR_MESSAGES[ERROR_CODES.NETWORK_TIMEOUT];
    }
  }
  
  return USER_ERROR_MESSAGES[ERROR_CODES.SYSTEM_UNKNOWN];
};

// Handle error with logging and user feedback
export const handleError = (
  error: unknown, 
  context?: string, 
  userId?: string
): { userMessage: string; severity: 'low' | 'medium' | 'high' | 'critical' } => {
  // Log the error
  logError(error, context, userId);
  
  // Get user-friendly message
  const userMessage = getUserErrorMessage(error);
  
  // Determine severity
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  
  if (error instanceof AppError) {
    severity = error.severity;
  } else if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes('permission') || message.includes('unauthorized')) {
      severity = 'high';
    } else if (message.includes('network') || message.includes('timeout')) {
      severity = 'medium';
    }
  }
  
  return { userMessage, severity };
};

// Create specific error types
export const createAuthError = (code: string, message: string, userMessage?: string): AppError => {
  return new AppError(
    message,
    code,
    'high',
    userMessage || USER_ERROR_MESSAGES[code],
    'authentication'
  );
};

export const createFileError = (code: string, message: string, userMessage?: string): AppError => {
  return new AppError(
    message,
    code,
    'medium',
    userMessage || USER_ERROR_MESSAGES[code],
    'file_upload'
  );
};

export const createValidationError = (code: string, message: string, userMessage?: string): AppError => {
  return new AppError(
    message,
    code,
    'low',
    userMessage || USER_ERROR_MESSAGES[code],
    'validation'
  );
};

// Retry mechanism for network requests
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
};

// Error boundary helper
export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};

// Get error severity color for UI
export const getErrorSeverityColor = (severity: 'low' | 'medium' | 'high' | 'critical'): string => {
  switch (severity) {
    case 'low': return 'text-blue-600';
    case 'medium': return 'text-yellow-600';
    case 'high': return 'text-orange-600';
    case 'critical': return 'text-red-600';
    default: return 'text-gray-600';
  }
}; 