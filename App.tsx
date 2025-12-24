
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import ImageCard from './components/ImageCard';
import { ProcessedImage } from './types';
import { geminiService } from './services/geminiService';

const App: React.FC = () => {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [isProcessingAll, setIsProcessingAll] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    // Fix: Cast FileList to File[] to ensure the 'file' parameter in map is not typed as 'unknown'
    const newFiles = Array.from(e.target.files) as File[];
    const newImages: ProcessedImage[] = newFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      originalName: file.name,
      originalUrl: URL.createObjectURL(file),
      status: 'pending'
    }));

    setImages(prev => [...prev, ...newImages]);
    e.target.value = ''; // Reset input
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const processImages = async () => {
    const pendingImages = images.filter(img => img.status === 'pending');
    if (pendingImages.length === 0) return;

    setIsProcessingAll(true);

    for (const image of pendingImages) {
      // Update status to processing
      setImages(prev => prev.map(img => 
        img.id === image.id ? { ...img, status: 'processing' } : img
      ));

      try {
        // Fetch image as blob and convert to base64
        const blobResponse = await fetch(image.originalUrl);
        const blob = await blobResponse.blob();
        
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        
        const base64Data = await base64Promise;
        const processedUrl = await geminiService.removeWatermark(base64Data, blob.type);

        setImages(prev => prev.map(img => 
          img.id === image.id ? { ...img, status: 'completed', processedUrl } : img
        ));
      } catch (error: any) {
        setImages(prev => prev.map(img => 
          img.id === image.id ? { ...img, status: 'error', error: error.message || '去水印失败' } : img
        ));
      }
    }

    setIsProcessingAll(false);
  };

  const downloadImage = (image: ProcessedImage) => {
    if (!image.processedUrl) return;
    const link = document.createElement('a');
    link.href = image.processedUrl;
    link.download = `no-watermark-${image.originalName}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAll = () => {
    const completedImages = images.filter(img => img.status === 'completed');
    completedImages.forEach(img => downloadImage(img));
  };

  const pendingCount = images.filter(img => img.status === 'pending').length;
  const completedCount = images.filter(img => img.status === 'completed').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Intro Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            AI 生成图片 <span className="text-blue-600">一键去水印</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            支持即梦 (Jimeng)、海螺 (Hailuo) 等主流 AI 平台的图片水印去除。
            基于 Gemini 强大的视觉重构能力，保持画质无损。
          </p>
        </section>

        {/* Upload Area */}
        <div className="mb-8">
          <div className="flex flex-col items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-3xl bg-white cursor-pointer hover:bg-gray-50 transition-all group overflow-hidden relative">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <i className="fas fa-cloud-upload-alt text-2xl text-blue-600"></i>
                </div>
                <p className="mb-2 text-sm text-gray-700">
                  <span className="font-semibold">点击上传</span> 或 拖拽图片到这里
                </p>
                <p className="text-xs text-gray-400">支持 PNG, JPG, JPEG (最多 20 张)</p>
              </div>
              <input 
                type="file" 
                className="hidden" 
                multiple 
                accept="image/*"
                onChange={handleFileChange} 
              />
            </label>
          </div>
        </div>

        {/* Action Bar */}
        {images.length > 0 && (
          <div className="bg-white rounded-2xl p-4 mb-8 shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-600">
                已选 {images.length} 张图片
              </span>
              {completedCount > 0 && (
                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">
                  {completedCount} 张已完成
                </span>
              )}
            </div>
            
            <div className="flex gap-3 w-full sm:w-auto">
              <button 
                onClick={() => setImages([])}
                className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                清空列表
              </button>
              
              {completedCount > 0 && (
                <button 
                  onClick={downloadAll}
                  className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                >
                  全部下载
                </button>
              )}

              <button 
                onClick={processImages}
                disabled={isProcessingAll || pendingCount === 0}
                className="flex-1 sm:flex-none px-8 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
              >
                {isProcessingAll ? (
                  <>
                    <i className="fas fa-spinner animate-spin"></i>
                    处理中...
                  </>
                ) : (
                  <>
                    <i className="fas fa-magic"></i>
                    开始去水印
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Image Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {images.map(image => (
            <ImageCard 
              key={image.id} 
              image={image} 
              onRemove={removeImage} 
              onDownload={downloadImage}
            />
          ))}
        </div>

        {/* Empty State */}
        {images.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-block p-6 bg-white rounded-full mb-6">
              <i className="fas fa-images text-5xl text-gray-200"></i>
            </div>
            <h3 className="text-gray-400 font-medium">还没有上传图片</h3>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-400 mb-2">© 2024 AI 智能去水印工具 - 让创意更纯净</p>
          <div className="flex justify-center gap-4 text-xs text-gray-400">
            <a href="#" className="hover:text-blue-600">隐私权政策</a>
            <a href="#" className="hover:text-blue-600">服务条款</a>
            <a href="#" className="hover:text-blue-600">联系我们</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
