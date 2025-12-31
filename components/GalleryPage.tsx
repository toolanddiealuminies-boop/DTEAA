import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Calendar, MapPin } from 'lucide-react';
import Navbar from './home/Navbar';

interface GalleryImage {
  id: string;
  src: string;
  title: string;
  description: string;
  date?: string;
  location?: string;
}

// Gallery images with descriptions
const galleryImages: GalleryImage[] = [
  {
    id: '1',
    src: '/events/Alumni_meetup_21_12_2025.jpeg',
    title: 'Alumni Meetup 2025',
    description: 'Annual alumni gathering bringing together graduates from various batches to reconnect, share experiences, and strengthen our community bonds.',
    date: 'December 21, 2025',
    location: 'DTE Campus, Dindigul',
  },
  {
    id: '2',
    src: '/events/VKV_Meetup_21_12_2025.jpeg',
    title: 'VKV Sir Meetup',
    description: `VKV சார் அவர்களுடன் நீண்ட நேரம் உரையாடினோம். அவர் நம் முன்னாள் மாணவர் சங்கத்திற்கு (DTEAA) மிக முக்கியமான கருத்துகளை வழங்கினார். அவருடன் கழித்த ஒவ்வொரு விநாடியும் மிக மதிப்புடையதாக இருந்தது.
எங்கள் உரையாடல் 2 மணி நேரம் சென்றது
மிகுந்த நன்றி ஐயா.`,
    date: 'December 21, 2025',
    location: 'Dindigul',
  },
  {
    id: '3',
    src: '/events/Alumni_meetup_2023.jpeg',
    title: 'Alumni Meetup 2023',
    description: `Mr.Ramani Krishnan_ 1987 Batch
( MRV - Mahindra Research valley - Chennai ) 
( Vice President _ Manufacturing Engineering) has delivered excellent speech about current scenario and Experience gathered in last 35 years`,
    date: '2023',
    location: 'DTE Campus, Dindigul',
  },
  {
    id: '4',
    src: '/events/Independenace_day.jpeg',
    title: 'Independence Day Celebration',
    description: 'Commemorating Independence Day with flag hoisting ceremony and cultural programs at the campus.',
    date: 'August 15, 2024',
    location: 'DTE Campus',
  },
  {
    id: '5',
    src: '/events/Independenace_day_1.jpeg',
    title: 'Independence Day - Cultural Event',
    description: '',
    date: 'August 15, 2024',
    location: 'DTE Campus',
  },
  {
    id: '6',
    src: '/events/event_1.jpeg',
    title: 'Alumni Event',
    description: 'A memorable event at Fusion 360 Mega Challege oragnized by CENTER FOR EXCELLENCE IN AUTOMOBILE TECHNOLOGY - Anna University.',
    date: 'March 23, 2023',
    location: 'DTE Campus',
  },
  {
    id: '7',
    src: '/events/Autocad_comp.jpeg',
    title: 'AutoCAD Competition',
    description: 'FUSION 360 Competition on 2023 - ITE Students Awarded & Won Many prizes from All over Tamilnadu Polytechnic.',
    date: '2023',
    location: '',
  },
  {
    id: '8',
    src: '/events/Alumni_meetup_2017_1.jpeg',
    title: 'Alumni Meetup 2017',
    description: 'Annual alumni meetup event with distinguished alumni sharing their experiences and insights.',
    date: '2017',
    location: 'DTE Campus, Dindigul',
  },
  {
    id: '9',
    src: '/events/Alumni_meetup_2017_2.jpeg',
    title: 'Alumni Meetup 2017',
    description: `திரு. நீல கண்டன்,
திரு. குணசீலன் ஐயா அவர்களுக்குப் பிறகு 
மதிப்பிற்குரிய முன்னாள் முதல்வர் திரு 
V.K. வெங்கடேஸ்வரன் ஐயா
பணிக் காலத்தில் நம் பயிலகம் புதிய வளாகம் கட்டப் பட்டது.`,
    date: '2017',
    location: 'DTE Campus, Dindigul',
  },
  {
    id: '10',
    src: '/events/Alumni_meetup_2017_3.jpeg',
    title: 'Alumni Meetup 2017',
    description: 'Annual alumni meetup event 2017 - Group photo from the event',
    date: '2017',
    location: 'DTE Campus, Dindigul',
  },
  {
    id: '11',
    src: '/events/Alumni_meetup_2017_4.jpeg',
    title: 'Alumni Meetup 2017',
    description: 'Annual alumni meetup event 2017 - Group photo from the event',
    date: '2017',
    location: 'DTE Campus, Dindigul',
  },

];

interface GalleryPageProps {
  onBack: () => void;
  onViewAbout?: () => void;
  onLoginClick?: () => void;
}

const GalleryPage: React.FC<GalleryPageProps> = ({ onBack, onViewAbout, onLoginClick }) => {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (image: GalleryImage, index: number) => {
    setSelectedImage(image);
    setCurrentIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const goToPrevious = () => {
    const newIndex = currentIndex === 0 ? galleryImages.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    setSelectedImage(galleryImages[newIndex]);
  };

  const goToNext = () => {
    const newIndex = currentIndex === galleryImages.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    setSelectedImage(galleryImages[newIndex]);
  };

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, currentIndex]);

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      {/* Navbar */}
      <Navbar
        onLoginClick={onLoginClick || (() => {})}
        onHomeClick={onBack}
        onViewGallery={() => {}}
        onViewAbout={onViewAbout}
        hideContact={true}
      />

      {/* Gallery Grid */}
      <div className="container mx-auto px-4 py-12 pt-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4 font-heading">
            Memories & Moments
          </h2>
          <div className="h-1 w-24 bg-primary mx-auto rounded-full" />
          <p className="mt-4 text-light-text-secondary dark:text-dark-text-secondary max-w-2xl mx-auto">
            Browse through our collection of memorable events and gatherings that define our alumni community.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group cursor-pointer"
              onClick={() => openLightbox(image, index)}
            >
              <div className="relative overflow-hidden rounded-xl shadow-md">
                <img
                  src={image.src}
                  alt={image.title}
                  className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-semibold text-lg">{image.title}</h3>
                    {image.date && (
                      <p className="text-white/80 text-sm flex items-center gap-1 mt-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {image.date}
                      </p>
                    )}
                  </div>
                </div>
                <div className="absolute top-3 right-3 bg-primary text-white px-3 py-1 rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  View
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-50"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Navigation Buttons */}
            <button
              onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors z-50"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors z-50"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            {/* Image and Details */}
            <motion.div
              key={selectedImage.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-5xl w-full mx-4 flex flex-col lg:flex-row gap-6 items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image */}
              <div className="flex-1 max-h-[70vh]">
                <img
                  src={selectedImage.src}
                  alt={selectedImage.title}
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>

              {/* Details Panel */}
              <div className="lg:w-80 bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
                <h2 className="text-2xl font-bold mb-3">{selectedImage.title}</h2>
                
                <p className="text-white/80 leading-relaxed mb-4">
                  {selectedImage.description}
                </p>

                <div className="space-y-2 text-sm">
                  {selectedImage.date && (
                    <div className="flex items-center gap-2 text-white/70">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{selectedImage.date}</span>
                    </div>
                  )}
                  {selectedImage.location && (
                    <div className="flex items-center gap-2 text-white/70">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{selectedImage.location}</span>
                    </div>
                  )}
                </div>

                {/* Image Counter */}
                <div className="mt-6 pt-4 border-t border-white/20 text-center text-white/50 text-sm">
                  {currentIndex + 1} / {galleryImages.length}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryPage;
