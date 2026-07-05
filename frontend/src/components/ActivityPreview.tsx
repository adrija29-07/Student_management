import React, { useEffect, useState } from 'react';
import { X, File, Image as ImageIcon, FileText, Music, Video, Download, Eye, AlertCircle } from 'lucide-react';

interface ActivityPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  filePath: string | null | undefined;
  title: string;
  type?: string;
  description?: string;
}

export const ActivityPreview: React.FC<ActivityPreviewProps> = ({
  isOpen,
  onClose,
  filePath,
  title,
  type,
  description,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !filePath) {
      setPreview(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const fileUrl = `http://localhost:5000/uploads/${filePath}`;
    const extension = filePath.split('.').pop()?.toLowerCase() || '';

    // Image extensions that can be previewed
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
      setPreview(`<img src="${fileUrl}" alt="Preview" class="max-w-full max-h-96 rounded-lg" />`);
    }
    // PDF preview
    else if (extension === 'pdf') {
      setPreview(`<embed src="${fileUrl}" type="application/pdf" class="w-full h-96 rounded-lg" />`);
    }
    // Video preview
    else if (['mp4', 'webm', 'ogg'].includes(extension)) {
      setPreview(`<video controls class="max-w-full max-h-96 rounded-lg"><source src="${fileUrl}" /></video>`);
    }
    // Audio preview
    else if (['mp3', 'wav', 'ogg'].includes(extension)) {
      setPreview(`<audio controls class="w-full"><source src="${fileUrl}" /></audio>`);
    }
    // Default: show file info with download link
    else {
      setPreview(null);
    }

    setLoading(false);
  }, [isOpen, filePath]);

  const getFileIcon = () => {
    if (!filePath) return <File className="h-6 w-6" />;
    const ext = filePath.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return <ImageIcon className="h-6 w-6" />;
    if (ext === 'pdf') return <FileText className="h-6 w-6" />;
    if (['mp4', 'webm', 'ogg'].includes(ext)) return <Video className="h-6 w-6" />;
    if (['mp3', 'wav'].includes(ext)) return <Music className="h-6 w-6" />;
    return <File className="h-6 w-6" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white truncate">{title}</h3>
            {type && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{type}</p>}
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
          >
            <X className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!filePath ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700 mb-3" />
                <p className="text-slate-500 dark:text-slate-400">No file attached</p>
              </div>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-brand-600 border-t-transparent"></div>
            </div>
          ) : preview ? (
            <div className="flex items-center justify-center">
              <div dangerouslySetInnerHTML={{ __html: preview }} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="flex justify-center mb-3 text-slate-400">{getFileIcon()}</div>
                <p className="text-slate-600 dark:text-slate-400 font-medium">{filePath.split('/').pop()}</p>
                <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                  Preview not available for this file type
                </p>
              </div>
            </div>
          )}

          {description && (
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {filePath && (
          <div className="flex items-center justify-between p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            <span className="text-xs text-slate-500 dark:text-slate-400">{filePath}</span>
            <a
              href={`http://localhost:5000/uploads/${filePath}`}
              download
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              <Download className="h-4 w-4" /> Download
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
