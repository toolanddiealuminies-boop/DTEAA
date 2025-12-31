import React from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, Award } from 'lucide-react';

const About: React.FC = () => {
    const features = [
        {
            icon: Users,
            title: "Strong Community",
            description: "Connect with thousands of alumni across the globe and build lasting professional relationships."
        },
        {
            icon: Calendar,
            title: "Exclusive Events",
            description: "Participate in reunions, workshops, and networking sessions designed for our alumni."
        },
        {
            icon: Award,
            title: "Career Growth",
            description: "Access mentorship programs, job boards, and resources to accelerate your career."
        }
    ];

    return (
        <section id="about" className="py-20 bg-light-bg dark:bg-dark-bg transition-colors duration-300">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4 font-heading">
                        Why Join DTEAA?
                    </h2>
                    <div className="h-1 w-24 bg-primary mx-auto rounded-full" />
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.2 }}
                            className="p-8 rounded-xl bg-light-card dark:bg-dark-card shadow-lg hover:shadow-xl transition-all duration-300 border border-light-border dark:border-dark-border group hover:-translate-y-2"
                        >
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                                <feature.icon className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-3 font-heading">
                                {feature.title}
                            </h3>
                            <p className="text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default About;
