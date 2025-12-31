import React from 'react';
import { motion } from 'framer-motion';

const Stats: React.FC = () => {
    const stats = [
        { value: "1000+", label: "Alumni" },
        { value: "50+", label: "Events" },
        { value: "100+", label: "Mentors" },
        { value: "₹10L+", label: "Scholarships" },
    ];

    return (
        <section id="stats" className="py-20 bg-primary/5 dark:bg-dark-bg border-y border-light-border dark:border-dark-border relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 dark:opacity-5 pattern-grid-lg" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.5 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="p-6"
                        >
                            <div className="text-4xl md:text-5xl font-bold text-primary mb-2 font-heading">
                                {stat.value}
                            </div>
                            <div className="text-sm md:text-base text-light-text-secondary dark:text-dark-text-secondary font-medium uppercase tracking-wider">
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Stats;
