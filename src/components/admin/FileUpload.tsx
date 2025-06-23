import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, Image, File, AlertCircle, Link as LinkIcon, Newspaper, Bell, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploadProps {
  category: 'pdfs' | 'news' | 'links' | 'alerts' | 'groups';
  onUpload: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  category, 
  onUpload,
  maxFiles = 10,
  maxSize = 5242880 // 5MB
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const getCategoryConfig = () => {
    switch (category) {
      case 'pdfs':
        return {
          accept: { 'application/pdf': ['.pdf'] },
          icon: FileText,
          label: 'PDF Documents'
        };
      case 'news':
        return {
          accept: { 
            'application/json': ['.json'],
            'image/*': ['.jpg', '.jpeg', '.png'] 
          },
          icon: Newspaper,
          label: 'News Articles'
        };
      case 'links':
        return {
          accept: { 'application/json': ['.json'] },
          icon: LinkIcon,
          label: 'Links',
          noDrag: category === 'links'
        };
      case 'alerts':
        return {
          accept: { 'application/json': ['.json'] },
          icon: Bell,
          label: 'Alerts'
        };
      case 'groups':
        return {
          accept: { 'application/json': ['.json'] },
          icon: Users,
          label: 'Discussion Groups'
        };
    }
  };

  const config = getCategoryConfig();

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(file => {
        const error = file.errors[0];
        return `${file.file.name}: ${error.message}`;
      });
      setError(errors.join(', '));
      return;
    }

    setError(null);
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const removeFile = (fileToRemove: File) => {
    setFiles(files.filter(file => file !== fileToRemove));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: config.accept,
    maxFiles,
    maxSize,
    multiple: true
  });

  const handleUpload = async () => {
    try {
      await onUpload(files);
      setFiles([]);
      setError(null);
    } catch (err) {
      setError('Error uploading files. Please try again.');
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.includes('pdf')) return <FileText className="w-6 h-6" />;
    if (file.type.includes('image')) return <Image className="w-6 h-6" />;
    if (file.type.includes('json')) {
      switch (category) {
        case 'links': return <LinkIcon className="w-6 h-6" />;
        case 'news': return <Newspaper className="w-6 h-6" />;
        case 'alerts': return <Bell className="w-6 h-6" />;
        case 'groups': return <Users className="w-6 h-6" />;
        default: return <File className="w-6 h-6" />;
      }
    }
    return <File className="w-6 h-6" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const CategoryIcon = config.icon;

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`p-8 border-2 border-dashed rounded-xl transition-colors ${
          isDragActive 
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
            : 'border-gray-300 dark:border-gray-700'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center text-center">
          <CategoryIcon className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            {isDragActive ? `Drop ${config.label} here` : `Drag & drop ${config.label} here`}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            or click to select files
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Maximum file size: {formatFileSize(maxSize)}
          </p>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
          >
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}

        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-2"
          >
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file)}
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{file.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(file)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}

            <button
              onClick={handleUpload}
              className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Upload {files.length} file{files.length !== 1 ? 's' : ''}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload;