
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <i className="fas fa-magic text-white text-xl"></i>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">AI 智能去水印</span>
          </div>
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-500">
            <a href="#" className="hover:text-blue-600 transition-colors">使用教程</a>
            <a href="#" className="hover:text-blue-600 transition-colors">批量处理</a>
            <a href="#" className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-all shadow-sm">
              立即体验
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
