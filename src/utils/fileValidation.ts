// File validation utilities for secure upload handling

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

// Allowed file types for document uploads
export const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  all: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  SMALL: 1 * 1024 * 1024, // 1MB
  MEDIUM: 5 * 1024 * 1024, // 5MB
  LARGE: 10 * 1024 * 1024, // 10MB
  MAX: 25 * 1024 * 1024 // 25MB
};

// Malicious file extensions to block
export const BLOCKED_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.scr', '.pif', '.vbs', '.js', '.jar',
  '.msi', '.dmg', '.app', '.sh', '.py', '.php', '.asp', '.aspx', '.jsp'
];

// Validate file type
export const validateFileType = (file: File, allowedTypes: string[] = ALLOWED_FILE_TYPES.all): boolean => {
  return allowedTypes.includes(file.type);
};

// Validate file size
export const validateFileSize = (file: File, maxSize: number = FILE_SIZE_LIMITS.MEDIUM): boolean => {
  return file.size <= maxSize;
};

// Validate file extension
export const validateFileExtension = (fileName: string): boolean => {
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  return !BLOCKED_EXTENSIONS.includes(extension);
};

// Validate file name
export const validateFileName = (fileName: string): boolean => {
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /\.\./, // Directory traversal
    /[<>:"|?*]/, // Invalid characters
    /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, // Reserved names
    /\.(exe|bat|cmd|com|scr|pif|vbs|js|jar|msi|dmg|app|sh|py|php|asp|aspx|jsp)$/i // Executable files
  ];
  
  return !suspiciousPatterns.some(pattern => pattern.test(fileName));
};

// Comprehensive file validation
export const validateFile = (
  file: File, 
  options: {
    allowedTypes?: string[];
    maxSize?: number;
    requireValidName?: boolean;
  } = {}
): FileValidationResult => {
  const {
    allowedTypes = ALLOWED_FILE_TYPES.all,
    maxSize = FILE_SIZE_LIMITS.MEDIUM,
    requireValidName = true
  } = options;

  const warnings: string[] = [];

  // Check file type
  if (!validateFileType(file, allowedTypes)) {
    return {
      isValid: false,
      error: `File type "${file.type}" is not allowed. Allowed types: ${allowedTypes.join(', ')}`
    };
  }

  // Check file size
  if (!validateFileSize(file, maxSize)) {
    return {
      isValid: false,
      error: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum limit of ${(maxSize / 1024 / 1024).toFixed(2)}MB`
    };
  }

  // Check file extension
  if (!validateFileExtension(file.name)) {
    return {
      isValid: false,
      error: `File extension is not allowed for security reasons`
    };
  }

  // Check file name
  if (requireValidName && !validateFileName(file.name)) {
    return {
      isValid: false,
      error: `File name contains invalid characters or patterns`
    };
  }

  // Warning for large files
  if (file.size > FILE_SIZE_LIMITS.LARGE) {
    warnings.push('Large file detected. Upload may take longer than usual.');
  }

  // Warning for certain file types
  if (file.type === 'application/pdf' && file.size > 5 * 1024 * 1024) {
    warnings.push('Large PDF detected. Consider compressing the file for faster processing.');
  }

  return {
    isValid: true,
    warnings: warnings.length > 0 ? warnings : undefined
  };
};

// Generate safe file name
export const generateSafeFileName = (originalName: string, userId: string): string => {
  const timestamp = Date.now();
  const extension = originalName.substring(originalName.lastIndexOf('.'));
  const safeExtension = extension.toLowerCase();
  
  // Remove any path traversal attempts
  const cleanName = originalName.replace(/[<>:"|?*]/g, '_').replace(/\.\./g, '_');
  
  return `${userId}_${timestamp}${safeExtension}`;
};

// Check if file is an image
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

// Check if file is a PDF
export const isPdfFile = (file: File): boolean => {
  return file.type === 'application/pdf';
};

// Get file type category
export const getFileTypeCategory = (file: File): 'image' | 'document' | 'unknown' => {
  if (isImageFile(file)) return 'image';
  if (isPdfFile(file)) return 'document';
  return 'unknown';
};

// Format file size for display
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}; 