
import React from 'react';
import { ProcessedImage } from '../types';

interface ImageCardProps {
  image: ProcessedImage;
  onRemove: (id: string) => void;
  onDownload: (image: ProcessedImage) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ image, onRemove, onDownload }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition-all duration-300">
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {image.status === 'processing' && (
          <div className="absolute inset-0 z-10 bg-black/40 flex flex-col items-center justify-center text-white space-y-3">
            <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium">修复中...</p>
          </div>
        )}
        
        {image.status === 'error' && (
          <div className="absolute inset-0 z-10 bg-red-50/90 flex flex-col items-center justify-center text-red-600 p-4 text-center">
            <i className="fas fa-exclamation-circle text-2xl mb-2"></i>
            <p className="text-xs font-semibold">{image.error || '处理失败'}</p>
          </div>
        )}

        <img 
          src={image.processedUrl || image.originalUrl} 
          alt={image.originalName} 
          className={`w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 ${image.status === 'processing' ? 'blur-sm' : ''}`}
        />
        
        {image.status === 'completed' && (
          <div className="absolute top-2 left-2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shadow-sm">
            已修复
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs text-gray-500 truncate max-w-[120px]" title={image.originalName}>
            {image.originalName}
          </p>
          {image.status === 'completed' && (
            <button 
              onClick={() => onDownload(image)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              <i className="fas fa-download"></i>
              保存
            </button>
          )}
        </div>
        
        <button 
          onClick={() => onRemove(image.id)}
          disabled={image.status === 'processing'}
          className="w-full py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          移除
        </button>
      </div>
    </div>
  );
};

export default ImageCard;
