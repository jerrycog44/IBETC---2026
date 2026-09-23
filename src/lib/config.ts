// Global Application Configuration for IBETC 2026 Platform

export const CONFIG = {
  // Video upload limits (Configurable)
  MAX_VIDEO_SIZE_MB: Number(process.env.NEXT_PUBLIC_MAX_VIDEO_SIZE_MB || 100),
  MAX_VIDEO_SIZE_BYTES: Number(process.env.NEXT_PUBLIC_MAX_VIDEO_SIZE_MB || 100) * 1024 * 1024,
  ALLOWED_VIDEO_MIME_TYPES: ['video/mp4'],
  ALLOWED_VIDEO_EXTENSIONS: ['.mp4'],
  
  // Storage Bucket
  STORAGE_BUCKET_VIDEOS: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'debate-videos',
  
  // Pagination
  DEFAULT_PAGE_SIZE: 12,
  ADMIN_PAGE_SIZE: 20,
};
