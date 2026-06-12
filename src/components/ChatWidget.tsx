import React, { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Sparkles, Loader2 } from 'lucide-react';

const ChatWindow = lazy(() => import('./ChatWindow'));

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    setHasOpened(true);
  };

  return (
    <div className="fixed bottom-6 right-6 md:right-8 md:bottom-8 z-[1000] flex flex-col items-end">
      {hasOpened && (
        <Suspense fallback={null}>
          <ChatWindow isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </Suspense>
      )}

      <motion.button
        animate={{ 
          scale: isOpen ? 0.9 : 1,
          opacity: isOpen ? 0 : 1
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleOpen}
        className={`relative flex items-center justify-center w-14 h-14 bg-paper-light border-2 border-accent text-accent rounded-2xl shadow-[4px_4px_0_0_var(--color-accent)] cursor-pointer z-50 overflow-visible group ${isOpen ? 'pointer-events-none' : ''}`}
      >
        <MessageSquare size={24} />
      </motion.button>
    </div>
  );
}
