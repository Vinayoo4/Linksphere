import React from 'react';
import { motion } from 'framer-motion';
import Profile from './Profile';
import LinkSection from './sections/LinkSection';
import PdfSection from './sections/PdfSection';
import NewsSection from './sections/NewsSection';
import AlertSection from './sections/AlertSection';
import GroupSection from './sections/GroupSection';
import { useLinks } from '../hooks/useLinks';

const LinkTree: React.FC = () => {
  const { links, pdfs, news, alerts, groups } = useLinks();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Profile 
        name="Jane Appleseed"
        bio="Digital content creator sharing resources, news, and fostering community discussions"
        avatar="https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=600"
      />
      
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="mt-8 space-y-6"
      >
        <NewsSection news={news} />
        <AlertSection alerts={alerts} />
        <LinkSection links={links} />
        <PdfSection pdfs={pdfs} />
        <GroupSection groups={groups} />
      </motion.div>
    </div>
  );
};

export default LinkTree;