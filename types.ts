
export interface ProcessedImage {
  id: string;
  originalName: string;
  originalUrl: string;
  processedUrl?: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}

export interface ProcessingResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}
