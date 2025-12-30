import React from 'react';
import { motion } from 'framer-motion';
import { Target, Users, Phone, Mail, GraduationCap, Heart, Award, Briefcase, Shield, HandHeart } from 'lucide-react';
import Navbar from './home/Navbar';

interface AboutPageProps {
  onBack: () => void;
  onViewGallery?: () => void;
  onLoginClick?: () => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ onBack, onViewGallery, onLoginClick }) => {
  const objectives = [
    { icon: Users, text: 'To create a strong and continuous connection between alumni, faculty, and current students.' },
    { icon: GraduationCap, text: 'To support education, career development, and personal growth of members.' },
    { icon: HandHeart, text: 'To encourage networking and collaboration among alumni through events and activities.' },
    { icon: Award, text: 'To involve alumni in academic development, technical learning, and mentoring programs.' },
    { icon: Briefcase, text: 'To provide scholarships, awards, career guidance, and job-related support to students.' },
    { icon: Heart, text: 'To promote social welfare activities and community service among alumni.' },
    { icon: Shield, text: 'To offer medical support, insurance awareness, and health-related assistance to members.' },
    { icon: Users, text: 'To support alumni and their families during emergency or difficult situations.' },
  ];

  const contributions = [
    'Share professional knowledge and industry experience',
    'Mentor students and young alumni',
    'Participate in events, workshops, and alumni meets',
    'Support institutional and community development initiatives',
  ];

  const contacts = [
    { name: 'V. Manikandan', role: 'President', phone: '90436 72733' },
    { name: 'D. Vijaykumar', role: 'Vice President', phone: '88660 63226' },
    { name: 'S. Kannan', role: 'General Secretary', phone: '98944 83859' },
    { name: 'B. Duraikannan', role: 'Treasurer', phone: '98945 25599' },
  ];

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      {/* Navbar */}
      <Navbar
        onLoginClick={onLoginClick || (() => {})}
        onHomeClick={onBack}
        onViewGallery={onViewGallery}
        onViewAbout={() => {}}
        hideContact={true}
      />

      {/* Hero Section */}
      <section className="py-12 pt-28 bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4 font-heading">
              DINDIGUL TOOL ENGINEERING
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-heading">
              ALUMNI ASSOCIATION (DTEAA)
            </h2>
            <p className="text-lg text-light-text-secondary dark:text-dark-text-secondary mb-2">
              Registration No: <span className="font-semibold text-primary">SRG/DINDUGUL/56/2025</span>
            </p>
            <p className="text-xl font-semibold text-primary mt-4">
              DTEAA – Grow Together
            </p>
          </motion.div>
        </div>
      </section>

      {/* Registration Certificate */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl overflow-hidden">
              <img
                src="/about/Registration.jpeg"
                alt="DTEAA Registration Certificate"
                className="w-full h-auto"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 bg-white dark:bg-dark-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-3 mb-6">
              <GraduationCap className="w-8 h-8 text-primary" />
              <h2 className="text-2xl md:text-3xl font-bold text-light-text-primary dark:text-dark-text-primary font-heading">
                About DTEAA
              </h2>
            </div>
            <p className="text-lg text-light-text-secondary dark:text-dark-text-secondary leading-relaxed mb-4">
              The Dindigul Tool Engineering Alumni Association (DTEAA) is formed to connect former students of Dindigul Tool Engineering and strengthen lifelong relationships among alumni, faculty, and current students.
            </p>
            <p className="text-lg text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
              Our association works to support education, career growth, and social well-being through active alumni participation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Vision & Objectives */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-3 mb-8">
              <Target className="w-8 h-8 text-primary" />
              <h2 className="text-2xl md:text-3xl font-bold text-light-text-primary dark:text-dark-text-primary font-heading">
                Our Vision & Objectives
              </h2>
            </div>
            <div className="grid gap-4">
              {objectives.map((obj, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-4 p-4 bg-white dark:bg-dark-card rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                    <obj.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-light-text-secondary dark:text-dark-text-secondary">
                    {obj.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How Alumni Can Contribute */}
      <section className="py-12 bg-white dark:bg-dark-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-3 mb-8">
              <Users className="w-8 h-8 text-primary" />
              <h2 className="text-2xl md:text-3xl font-bold text-light-text-primary dark:text-dark-text-primary font-heading">
                How Alumni Can Contribute
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {contributions.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl"
                >
                  <div className="w-2 h-2 bg-primary rounded-full shrink-0" />
                  <p className="text-light-text-secondary dark:text-dark-text-secondary">
                    {item}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-3 mb-8">
              <Phone className="w-8 h-8 text-primary" />
              <h2 className="text-2xl md:text-3xl font-bold text-light-text-primary dark:text-dark-text-primary font-heading">
                Contact Information
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {contacts.map((contact, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
                    {contact.name}
                  </h3>
                  <p className="text-primary font-medium mb-3">{contact.role}</p>
                  <a
                    href={`tel:+91${contact.phone.replace(/\s/g, '')}`}
                    className="flex items-center gap-2 text-light-text-secondary dark:text-dark-text-secondary hover:text-primary transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span>+91 {contact.phone}</span>
                  </a>
                </motion.div>
              ))}
            </div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-8 text-center"
            >
              <a
                href="mailto:toolanddie.aluminies@gmail.com"
                className="inline-flex items-center gap-3 px-6 py-4 bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors"
              >
                <Mail className="w-6 h-6 text-primary" />
                <span className="text-lg font-medium text-primary">
                  toolanddie.aluminies@gmail.com
                </span>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer spacing */}
      <div className="h-12" />
    </div>
  );
};

export default AboutPage;
