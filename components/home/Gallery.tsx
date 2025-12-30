import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface GalleryProps {
    onViewGallery?: () => void;
}

const Gallery: React.FC<GalleryProps> = ({ onViewGallery }) => {
    const images = [
        "/events/Alumni_meetup_21_12_2025.jpeg",  
        "/events/VKV_Meetup_21_12_2025.jpeg", 
        "/events/Alumni_meetup_2023.jpeg",     
        "/events/Independenace_day.jpeg",
        "/events/Independenace_day_1.jpeg",        
        "/events/event_1.jpeg",
        // "/events/Autocad_comp.jpeg",
    ];

    return (
        <section id="gallery" className="py-20 bg-light-bg dark:bg-dark-bg transition-colors duration-300">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4 font-heading">
                        Memories & Moments
                    </h2>
                    <div className="h-1 w-24 bg-primary mx-auto rounded-full" />
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {images.map((src, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="relative group overflow-hidden rounded-xl shadow-lg aspect-video cursor-pointer"
                            onClick={onViewGallery}
                        >
                            <img
                                src={src}
                                alt={`Gallery image ${index + 1}`}
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">View Gallery</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* View All Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-center mt-10"
                >
                    <button
                        onClick={onViewGallery}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary-hover transition-colors shadow-lg hover:shadow-xl"
                    >
                        View All Photos
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </motion.div>
            </div>
        </section>
    );
};

export default Gallery;
