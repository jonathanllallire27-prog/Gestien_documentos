import React from 'react';
import { X, Download, FileText } from 'lucide-react';

function DocumentViewer({ document, onClose }) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = document.url;
    link.download = document.nombre;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isImage = document.tipo.startsWith('image/');
  const isPDF = document.tipo === 'application/pdf';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 truncate">{document.nombre}</h2>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-all duration-300"
            >
              <Download size={18} />
              Descargar
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-300"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        
        <div className="flex-1 border-2 border-gray-300 rounded-xl p-4 bg-gray-50 overflow-auto">
          {isImage ? (
            <div className="flex justify-center">
              <img 
                src={document.url} 
                alt={document.nombre} 
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : isPDF ? (
            <iframe
              src={document.url}
              className="w-full h-full min-h-[500px] border-0"
              title={document.nombre}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <FileText className="text-gray-400 mb-4" size={64} />
              <p className="text-gray-500 text-lg">Vista previa no disponible</p>
              <p className="text-gray-400">Descarga el archivo para ver su contenido</p>
              <button
                onClick={handleDownload}
                className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-all duration-300"
              >
                <Download size={18} />
                Descargar Archivo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DocumentViewer;