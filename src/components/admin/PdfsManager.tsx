import React, { useState } from 'react';
import { FileText, Trash2 } from 'lucide-react';
import FileUpload from './FileUpload';
import { motion, AnimatePresence } from 'framer-motion';
import { useLinks } from '../../hooks/useLinks';

const PdfsManager: React.FC = () => {
  const { pdfs, addPdf, removePdf } = useLinks();
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (files: File[]) => {
    setIsUploading(true);
    try {
      for (const file of files) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const pdfUrl = e.target?.result as string;
          await addPdf({
            id: crypto.randomUUID(),
            title: file.name,
            url: pdfUrl,
            size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            added: new Date().toLocaleDateString()
          });
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Error uploading PDFs:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">PDF Resources</h2>
          <p className="text-gray-600 dark:text-gray-400">Upload and manage PDF documents</p>
        </div>
      </div>

      <FileUpload category="pdfs" onUpload={handleUpload} />

      <div className="grid gap-4">
        <AnimatePresence>
          {pdfs.map((pdf) => (
            <motion.div
              key={pdf.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{pdf.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {pdf.size} • Added {pdf.added}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => removePdf(pdf.id)}
                  className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PdfsManager;