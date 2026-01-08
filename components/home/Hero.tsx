import React from 'react';
import { motion } from 'framer-motion';

interface HeroProps {
    onJoinClick: () => void;
    onLearnMoreClick?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onJoinClick, onLearnMoreClick }) => {
    return (
        <div className="relative h-auto py-12 w-full overflow-hidden flex flex-col justify-start">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")'
                }}
            >
                <div className="absolute inset-0 bg-light-bg/80 dark:bg-dark-bg/90 transition-colors duration-300" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid md:grid-cols-2 gap-8 items-center">

                {/* Left Column: Text Content */}
                <div className="flex flex-col items-center md:items-start text-center md:text-left order-2 md:order-1 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-primary/10 backdrop-blur-sm text-primary text-sm font-medium border border-primary/20">
                            Welcome to DTE Alumni Association
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-4xl md:text-6xl font-bold text-light-text-primary dark:text-dark-text-primary leading-tight font-heading"
                    >
                        Connect. Network. <br />
                        <span className="text-primary">Grow Together.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-lg text-light-text-secondary dark:text-dark-text-secondary max-w-lg"
                    >
                        Join a vibrant community of alumni, share your journey, and inspire the next generation of leaders.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="flex flex-col sm:flex-row gap-4 w-full md:w-auto"
                    >
                        <button
                            onClick={onJoinClick}
                            className="px-8 py-4 rounded-md bg-primary text-white font-bold text-lg hover:bg-primary-hover transition-all transform active:scale-95 shadow-lg shadow-primary/30 w-full sm:w-auto"
                        >
                            Join Community
                        </button>
                        <button
                            onClick={onLearnMoreClick}
                            className="px-8 py-4 rounded-md bg-transparent text-primary font-bold text-lg border-2 border-primary hover:bg-primary hover:text-white transition-all active:scale-95 w-full sm:w-auto"
                        >
                            Learn More
                        </button>
                    </motion.div>
                </div>

                {/* Right Column: Event Flyer */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="order-1 md:order-2 flex justify-center md:justify-end"
                >
                    <div
                        className="relative group cursor-pointer w-full flex justify-center md:justify-end"
                        onClick={onJoinClick}
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative">
                            <img
                                src="/events/Alumni_meetup_2026.png"
                                alt="Alumni Meetup 2026"
                                className="w-full max-w-lg md:max-w-xl lg:max-w-2xl h-auto rounded-xl shadow-2xl border-4 border-white dark:border-gray-800 transform transition duration-500 group-hover:scale-[1.02]"
                            />
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span className="bg-black/75 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm">
                                    Click to Register
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default Hero;
