import React from 'react';

interface SectionTitleProps {
  title: string;
  icon?: React.ReactNode;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ title, icon }) => {
  return (
    <div className="flex items-center gap-2 mb-2">
      {icon && (
        <div className="text-primary-600 dark:text-primary-400">
          {icon}
        </div>
      )}
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h2>
    </div>
  );
};

export default SectionTitle;