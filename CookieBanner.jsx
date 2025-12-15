import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Cookie, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowBanner(false);
  };

  const rejectCookies = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50"
        >
          <Card className="bg-white border-[#E0EEF8] shadow-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A8D5F2] to-[#7AB8E8] flex items-center justify-center shrink-0">
                <Cookie className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#2A4D66] mb-2">Cookie-Einstellungen</h3>
                <p className="text-sm text-[#6B8CA8] mb-4">
                  Wir verwenden Cookies, um deine Nutzererfahrung zu verbessern und unsere Dienste zu optimieren. 
                  Du kannst Cookies akzeptieren oder ablehnen.
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={acceptCookies}
                    className="bg-[#A8D5F2] hover:bg-[#7AB8E8] text-white"
                    size="sm"
                  >
                    Akzeptieren
                  </Button>
                  <Button
                    onClick={rejectCookies}
                    variant="outline"
                    size="sm"
                    className="border-[#E0EEF8]"
                  >
                    Ablehnen
                  </Button>
                </div>
              </div>
              <button
                onClick={rejectCookies}
                className="text-[#6B8CA8] hover:text-[#2A4D66] shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}