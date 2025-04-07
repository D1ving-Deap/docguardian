
// AWS S3 Storage Utility
// This utility leverages localStorage for credentials storage and provides
// S3-like methods for uploading, retrieving, and deleting files

import { v4 as uuidv4 } from 'uuid';

// Storage structure
interface S3File {
  key: string;
  data: string; // Base64 encoded content
  contentType: string;
  size: number;
  lastModified: number;
  metadata?: Record<string, string>;
}

// Mock S3 Bucket
interface S3Bucket {
  name: string;
  files: Record<string, S3File>;
  totalSize: number;
}

// Initialize mock bucket storage 
const initBuckets = (): Record<string, S3Bucket> => {
  const existingBuckets = localStorage.getItem('aws-s3-buckets');
  if (existingBuckets) {
    try {
      return JSON.parse(existingBuckets);
    } catch (error) {
      console.error("Error parsing S3 buckets from localStorage", error);
    }
  }
  
  // Default buckets setup
  const buckets: Record<string, S3Bucket> = {
    'user-documents': {
      name: 'user-documents',
      files: {},
      totalSize: 0
    },
    'system-documents': {
      name: 'system-documents',
      files: {},
      totalSize: 0
    },
    'property-docs': {
      name: 'property-docs',
      files: {},
      totalSize: 0
    }
  };
  
  localStorage.setItem('aws-s3-buckets', JSON.stringify(buckets));
  return buckets;
};

// Get buckets data
const getBuckets = (): Record<string, S3Bucket> => {
  return initBuckets();
};

// Save buckets data
const saveBuckets = (buckets: Record<string, S3Bucket>) => {
  localStorage.setItem('aws-s3-buckets', JSON.stringify(buckets));
};

// Check if AWS is connected
const isAWSConnected = (): boolean => {
  const savedConnection = localStorage.getItem('aws-connection');
  return !!savedConnection;
};

// Free tier limits (in bytes)
const FREE_TIER_LIMITS = {
  TOTAL_STORAGE: 5 * 1024 * 1024 * 1024, // 5GB
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  
  // For tracking (not enforced here)
  MONTHLY_GETS: 20000,
  MONTHLY_PUTS: 2000,
  MONTHLY_TRANSFER: 15 * 1024 * 1024 * 1024 // 15GB
};

// Get file as base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
};

// Upload file to S3
export const uploadFile = async (
  file: File, 
  bucket: string = 'user-documents',
  key?: string,
  metadata?: Record<string, string>
): Promise<{ key: string; url: string } | { error: string }> => {
  try {
    if (!isAWSConnected()) {
      return { error: 'AWS is not connected' };
    }
    
    // Check file size
    if (file.size > FREE_TIER_LIMITS.MAX_FILE_SIZE) {
      return { error: `File size exceeds maximum limit of ${FREE_TIER_LIMITS.MAX_FILE_SIZE / (1024 * 1024)}MB` };
    }
    
    const buckets = getBuckets();
    
    // Check if bucket exists
    if (!buckets[bucket]) {
      return { error: `Bucket "${bucket}" does not exist` };
    }
    
    // Check total storage
    if (buckets[bucket].totalSize + file.size > FREE_TIER_LIMITS.TOTAL_STORAGE) {
      return { error: 'Free tier storage limit would be exceeded' };
    }
    
    // Generate a key if not provided
    const fileKey = key || `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    // Convert file to base64
    const base64Data = await fileToBase64(file);
    
    // Create S3 file object
    const s3File: S3File = {
      key: fileKey,
      data: base64Data,
      contentType: file.type,
      size: file.size,
      lastModified: Date.now(),
      metadata
    };
    
    // Add file to bucket
    buckets[bucket].files[fileKey] = s3File;
    buckets[bucket].totalSize += file.size;
    
    // Save updated buckets
    saveBuckets(buckets);
    
    // Return key and mock URL
    return {
      key: fileKey,
      url: `s3://${bucket}/${fileKey}`
    };
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    return { error: 'Failed to upload file' };
  }
};

// Get file from S3
export const getFile = (
  key: string,
  bucket: string = 'user-documents'
): { data: string; contentType: string } | { error: string } => {
  try {
    if (!isAWSConnected()) {
      return { error: 'AWS is not connected' };
    }
    
    const buckets = getBuckets();
    
    // Check if bucket exists
    if (!buckets[bucket]) {
      return { error: `Bucket "${bucket}" does not exist` };
    }
    
    // Check if file exists
    if (!buckets[bucket].files[key]) {
      return { error: `File "${key}" does not exist in bucket "${bucket}"` };
    }
    
    const file = buckets[bucket].files[key];
    
    return {
      data: file.data,
      contentType: file.contentType
    };
  } catch (error) {
    console.error('Error getting file from S3:', error);
    return { error: 'Failed to get file' };
  }
};

// Delete file from S3
export const deleteFile = (
  key: string,
  bucket: string = 'user-documents'
): { success: boolean } | { error: string } => {
  try {
    if (!isAWSConnected()) {
      return { error: 'AWS is not connected' };
    }
    
    const buckets = getBuckets();
    
    // Check if bucket exists
    if (!buckets[bucket]) {
      return { error: `Bucket "${bucket}" does not exist` };
    }
    
    // Check if file exists
    if (!buckets[bucket].files[key]) {
      return { error: `File "${key}" does not exist in bucket "${bucket}"` };
    }
    
    // Get file size before deletion
    const fileSize = buckets[bucket].files[key].size;
    
    // Delete file
    delete buckets[bucket].files[key];
    buckets[bucket].totalSize -= fileSize;
    
    // Save updated buckets
    saveBuckets(buckets);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    return { error: 'Failed to delete file' };
  }
};

// List files in bucket
export const listFiles = (
  bucket: string = 'user-documents',
  prefix?: string
): { files: { key: string; size: number; lastModified: number }[] } | { error: string } => {
  try {
    if (!isAWSConnected()) {
      return { error: 'AWS is not connected' };
    }
    
    const buckets = getBuckets();
    
    // Check if bucket exists
    if (!buckets[bucket]) {
      return { error: `Bucket "${bucket}" does not exist` };
    }
    
    // Get files matching prefix
    const files = Object.values(buckets[bucket].files)
      .filter(file => !prefix || file.key.startsWith(prefix))
      .map(file => ({
        key: file.key,
        size: file.size,
        lastModified: file.lastModified
      }));
    
    return { files };
  } catch (error) {
    console.error('Error listing files in S3 bucket:', error);
    return { error: 'Failed to list files' };
  }
};

// Get URL for file
export const getFileUrl = (
  key: string,
  bucket: string = 'user-documents'
): { url: string } | { error: string } => {
  try {
    if (!isAWSConnected()) {
      return { error: 'AWS is not connected' };
    }
    
    const buckets = getBuckets();
    
    // Check if bucket exists
    if (!buckets[bucket]) {
      return { error: `Bucket "${bucket}" does not exist` };
    }
    
    // Check if file exists
    if (!buckets[bucket].files[key]) {
      return { error: `File "${key}" does not exist in bucket "${bucket}"` };
    }
    
    // Get file
    const file = buckets[bucket].files[key];
    
    // Create data URL
    const url = `data:${file.contentType};base64,${file.data}`;
    
    return { url };
  } catch (error) {
    console.error('Error getting file URL from S3:', error);
    return { error: 'Failed to get file URL' };
  }
};

// Get free tier usage
export const getFreeTierUsage = (): {
  totalStorage: number;
  totalStoragePercent: number;
  bucketsUsage: Record<string, { size: number, files: number }>;
} => {
  const buckets = getBuckets();
  
  // Calculate total storage used
  let totalStorage = 0;
  const bucketsUsage: Record<string, { size: number, files: number }> = {};
  
  Object.keys(buckets).forEach(bucketName => {
    const bucket = buckets[bucketName];
    totalStorage += bucket.totalSize;
    bucketsUsage[bucketName] = {
      size: bucket.totalSize,
      files: Object.keys(bucket.files).length
    };
  });
  
  // Calculate percentage of free tier used
  const totalStoragePercent = (totalStorage / FREE_TIER_LIMITS.TOTAL_STORAGE) * 100;
  
  return {
    totalStorage,
    totalStoragePercent,
    bucketsUsage
  };
};

// For easy imports in other files
export const s3 = {
  uploadFile,
  getFile,
  deleteFile,
  listFiles,
  getFileUrl,
  getFreeTierUsage,
  isAWSConnected
};

export default s3;
