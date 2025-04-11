
// Supabase Storage Utility
// This utility provides S3-like methods for uploading, retrieving, and deleting files
// using Supabase Storage instead of AWS S3

import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Default bucket names
const DEFAULT_BUCKETS = [
  'user-documents',
  'applications'
];

// Get buckets data
const getBuckets = async (): Promise<string[]> => {
  try {
    // Check if our buckets exist
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error("Error listing buckets:", error);
      return [];
    }
    
    return buckets?.map(bucket => bucket.name) || [];
  } catch (error) {
    console.error("Error getting buckets:", error);
    return [];
  }
};

// Free tier limits (in bytes) - used for validation
const FREE_TIER_LIMITS = {
  TOTAL_STORAGE: 5 * 1024 * 1024 * 1024, // 5GB
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
};

// Sanitize filename to be storage-friendly
const sanitizeFileName = (fileName: string): string => {
  // Remove special characters, spaces replaced with underscores
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')  // Replace special chars with underscore
    .replace(/_{2,}/g, '_');          // Replace multiple underscores with single one
};

// Upload file to Supabase Storage
export const uploadFile = async (
  file: File, 
  bucket: string = 'user-documents',
  key?: string,
  metadata?: Record<string, string>
): Promise<{ key: string; url: string } | { error: string }> => {
  try {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { error: 'Authentication required to upload files' };
    }
    
    // Check file size
    if (file.size > FREE_TIER_LIMITS.MAX_FILE_SIZE) {
      return { error: `File size exceeds maximum limit of ${FREE_TIER_LIMITS.MAX_FILE_SIZE / (1024 * 1024)}MB` };
    }
    
    // Generate a key if not provided
    const sanitizedFileName = sanitizeFileName(file.name);
    const fileKey = key || `${uuidv4()}-${sanitizedFileName}`;
    
    // Make sure the key itself is sanitized
    const sanitizedKey = sanitizeFileName(fileKey);
    
    console.log(`Uploading file to ${bucket}/${sanitizedKey}`);
    
    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(sanitizedKey, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
        ...(metadata && { metadata })
      });
    
    if (error) {
      console.error('Error uploading file to Supabase Storage:', error);
      return { error: error.message };
    }
    
    // Get public URL if successful
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(sanitizedKey);
    
    return {
      key: sanitizedKey,
      url: publicUrl
    };
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return { error: error.message || 'Failed to upload file' };
  }
};

// Get file from Supabase Storage
export const getFile = async (
  key: string,
  bucket: string = 'user-documents'
): Promise<{ data: Blob; contentType: string } | { error: string }> => {
  try {
    // Download file from Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(key);
    
    if (error || !data) {
      console.error('Error downloading file from Supabase Storage:', error);
      return { error: error?.message || 'Failed to download file' };
    }
    
    return {
      data,
      contentType: data.type
    };
  } catch (error: any) {
    console.error('Error getting file:', error);
    return { error: error.message || 'Failed to get file' };
  }
};

// Delete file from Supabase Storage
export const deleteFile = async (
  key: string,
  bucket: string = 'user-documents'
): Promise<{ success: boolean } | { error: string }> => {
  try {
    // Delete file from Supabase Storage
    const { error } = await supabase.storage
      .from(bucket)
      .remove([key]);
    
    if (error) {
      console.error('Error deleting file from Supabase Storage:', error);
      return { error: error.message };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting file:', error);
    return { error: error.message || 'Failed to delete file' };
  }
};

// List files in bucket
export const listFiles = async (
  bucket: string = 'user-documents',
  prefix?: string
): Promise<{ files: { key: string; size: number; lastModified: number }[] } | { error: string }> => {
  try {
    // List files from Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(prefix || '', {
        limit: 1000,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' }
      });
    
    if (error) {
      console.error('Error listing files from Supabase Storage:', error);
      return { error: error.message };
    }
    
    // Map files to the expected format
    const files = data
      .filter(item => !item.id.endsWith('/')) // Filter out folders
      .map(item => ({
        key: item.name,
        size: item.metadata?.size || 0,
        lastModified: new Date(item.created_at).getTime()
      }));
    
    return { files };
  } catch (error: any) {
    console.error('Error listing files:', error);
    return { error: error.message || 'Failed to list files' };
  }
};

// Get URL for file
export const getFileUrl = async (
  key: string,
  bucket: string = 'user-documents'
): Promise<{ url: string } | { error: string }> => {
  try {
    // Get public URL from Supabase Storage
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(key);
    
    return { url: publicUrl };
  } catch (error: any) {
    console.error('Error getting file URL:', error);
    return { error: error.message || 'Failed to get file URL' };
  }
};

// Check if storage is connected
export const isStorageConnected = async (): Promise<boolean> => {
  try {
    // Check if we can list buckets
    const buckets = await getBuckets();
    return buckets.length > 0;
  } catch (error) {
    return false;
  }
};

// Get free tier usage
export const getFreeTierUsage = async (): Promise<{
  totalStorage: number;
  totalStoragePercent: number;
  bucketsUsage: Record<string, { size: number, files: number }>;
} | { error: string }> => {
  try {
    // Get all buckets
    const buckets = await getBuckets();
    
    // Calculate total storage and files per bucket
    let totalStorage = 0;
    const bucketsUsage: Record<string, { size: number, files: number }> = {};
    
    // Process each bucket
    for (const bucketName of buckets) {
      // Get files in bucket
      const listResult = await listFiles(bucketName);
      
      if ('error' in listResult) {
        console.error(`Error listing files in bucket ${bucketName}:`, listResult.error);
        continue;
      }
      
      // Calculate bucket usage
      const files = listResult.files;
      const bucketSize = files.reduce((sum, file) => sum + file.size, 0);
      
      // Update totals
      totalStorage += bucketSize;
      bucketsUsage[bucketName] = {
        size: bucketSize,
        files: files.length
      };
    }
    
    // Calculate percentage of free tier used
    const totalStoragePercent = (totalStorage / FREE_TIER_LIMITS.TOTAL_STORAGE) * 100;
    
    return {
      totalStorage,
      totalStoragePercent,
      bucketsUsage
    };
  } catch (error: any) {
    console.error('Error calculating free tier usage:', error);
    return { error: error.message || 'Failed to calculate storage usage' };
  }
};

// For easy imports in other files
export const storage = {
  uploadFile,
  getFile,
  deleteFile,
  listFiles,
  getFileUrl,
  isStorageConnected,
  getBuckets,
  getFreeTierUsage
};

export default storage;
