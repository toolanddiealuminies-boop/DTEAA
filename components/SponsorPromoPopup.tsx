import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X } from 'lucide-react';

interface SponsorPromoPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onSponsorClick: () => void;
}

const SponsorPromoPopup: React.FC<SponsorPromoPopupProps> = ({ isOpen, onClose, onSponsorClick }) => {
    // Auto-show delay handled by parent or effect here? Parent is better.
    // We'll trust the isOpen prop.

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    className="fixed bottom-4 right-4 z-[60] max-w-sm w-full"
                >
                    <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl border border-primary/20 overflow-hidden relative">
                        {/* decorative background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />

                        <div className="p-5 relative">
                            <button
                                onClick={onClose}
                                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            <div className="flex gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center animate-pulse-slow">
                                        <Heart className="w-6 h-6 fill-current" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-lg leading-tight mb-1">
                                        Support Your Alma Mater
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        Help make the 2026 Alumni Meet unforgettable! Your sponsorship drives our community forward.
                                    </p>
                                    <button
                                        onClick={onSponsorClick}
                                        className="w-full py-2 px-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all transform active:scale-95 text-sm"
                                    >
                                        Sponsor the Event
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SponsorPromoPopup;
