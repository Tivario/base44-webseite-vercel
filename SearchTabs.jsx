import React from 'react';
import { MapPin, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SearchTabs({ activeTab, onTabChange }) {
  return (
    <div className="flex bg-[#EBF5FF] rounded-2xl p-1.5">
      <button
        onClick={() => onTabChange('local')}
        className={`relative flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-medium transition-colors ${
          activeTab === 'local' ? 'text-white' : 'text-[#6B8CA8]'
        }`}
      >
        {activeTab === 'local' && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 bg-[#A8D5F2] rounded-xl"
            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
          />
        )}
        <span className="relative flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Lokal
        </span>
      </button>
      <button
        onClick={() => onTabChange('international')}
        className={`relative flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-medium transition-colors ${
          activeTab === 'international' ? 'text-white' : 'text-[#6B8CA8]'
        }`}
      >
        {activeTab === 'international' && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 bg-[#A8D5F2] rounded-xl"
            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
          />
        )}
        <span className="relative flex items-center gap-2">
          <Globe className="w-4 h-4" />
          International
        </span>
      </button>
    </div>
  );
}