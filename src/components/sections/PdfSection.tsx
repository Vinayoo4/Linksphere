import React from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import Card from '../ui/Card';
import { Pdf } from '../../types';
import SectionTitle from './SectionTitle';

interface PdfSectionProps {
  pdfs: Pdf[];
}

const PdfSection: React.FC<PdfSectionProps> = ({ pdfs }) => {
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (pdfs.length === 0) return null;

  return (
    <section>
      <SectionTitle 
        title="PDF Resources" 
        icon={<FileText className="w-5 h-5" />}
      />
      
      <div className="grid gap-4 mt-4">
        {pdfs.map((pdf) => (
          <motion.div key={pdf.id} variants={item}>
            <Card 
              variant="glass" 
              className="hover:bg-gray-50 dark:hover:bg-gray-800/90"
              onClick={() => window.open(pdf.url, '_blank')}
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400">
                  <FileText size={20} />
                </div>
                
                <div className="flex-grow">
                  <h3 className="font-medium text-gray-900 dark:text-white">{pdf.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {pdf.size && <span className="mr-2">{pdf.size}</span>}
                    {pdf.added && <span>Added {pdf.added}</span>}
                  </p>
                </div>
                
                <div className="flex-shrink-0 text-gray-400">
                  <FileText size={16} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default PdfSection;