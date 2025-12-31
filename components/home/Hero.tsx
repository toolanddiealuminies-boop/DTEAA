import React from 'react';
import { motion } from 'framer-motion';

interface HeroProps {
    onJoinClick: () => void;
    onLearnMoreClick?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onJoinClick, onLearnMoreClick }) => {
    return (
        <div className="relative h-screen w-full overflow-hidden">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")'
                }}
            >
                <div className="absolute inset-0 bg-light-bg/80 dark:bg-dark-bg/90 transition-colors duration-300" />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 pb-16 pt-32">
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="mb-8"
                >
                    <img
                        src="/dteaa_logo_light.png"
                        className="w-32 h-32 md:w-48 md:h-48 rounded-full shadow-2xl border-4 border-light-card/20 dark:border-dark-card/20 object-cover dark:hidden mix-blend-multiply"
                        alt="DTEAA Logo Light"
                    />
                    <img
                        src="/dteaa_logo_dark.png"
                        className="w-32 h-32 md:w-48 md:h-48 rounded-full shadow-2xl border-4 border-light-card/20 dark:border-dark-card/20 object-cover hidden dark:block mix-blend-screen"
                        alt="DTEAA Logo Dark"
                    />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-primary/10 backdrop-blur-sm text-primary text-sm font-medium mb-6 border border-primary/20">
                        Welcome to DTE Alumni Association
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-4xl md:text-6xl lg:text-7xl font-bold text-light-text-primary dark:text-dark-text-primary mb-6 leading-tight font-heading"
                >
                    Connect. Network. <br />
                    <span className="text-primary">Grow Together.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="text-lg md:text-xl text-light-text-secondary dark:text-dark-text-secondary max-w-2xl mb-10"
                >
                    Join a vibrant community of alumni, share your journey, and inspire the next generation of leaders.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="flex flex-col sm:flex-row gap-4"
                >
                    <button
                        onClick={onJoinClick}
                        className="px-8 py-4 rounded-md bg-primary text-white font-bold text-lg hover:bg-primary-hover transition-all transform active:scale-95 shadow-lg shadow-primary/30"
                    >
                        Join Community
                    </button>
                    <button
                        onClick={onLearnMoreClick}
                        className="px-8 py-4 rounded-md bg-transparent text-primary font-bold text-lg border-2 border-primary hover:bg-primary hover:text-white transition-all active:scale-95"
                    >
                        Learn More
                    </button>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            {/* <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
            >
                <div className="w-6 h-10 border-2 border-light-text-secondary dark:border-dark-text-secondary rounded-full flex justify-center p-1">
                    <motion.div
                        animate={{ y: [0, 12, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="w-1.5 h-1.5 bg-light-text-primary dark:bg-dark-text-primary rounded-full"
                    />
                </div>
            </motion.div> */}
        </div>
    );
};

export default Hero;
