import React from 'react';
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps {
    onViewAbout?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onViewAbout }) => {
    return (
        <footer id="footer" className="bg-light-card dark:bg-dark-card border-t border-light-border dark:border-dark-border pt-16 pb-8 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center space-x-2 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-hover rounded-full flex items-center justify-center text-white font-bold text-xl">
                                D
                            </div>
                            <span className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">
                                DTEAA
                            </span>
                        </div>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6 max-w-md">
                            Connecting alumni, fostering growth, and building a legacy of excellence for the Department of Technical Education.
                        </p>
                        <div className="flex space-x-4">
                            {[Facebook, Twitter, Linkedin, Instagram].map((Icon, index) => (
                                <a
                                    key={index}
                                    href="#"
                                    className="w-10 h-10 rounded-full bg-light-bg dark:bg-white/5 flex items-center justify-center text-light-text-secondary dark:text-dark-text-secondary hover:bg-primary hover:text-white transition-all"
                                >
                                    <Icon size={20} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary mb-6 font-heading">Quick Links</h4>
                        <ul className="space-y-3">
                            <li>
                                <button 
                                    onClick={onViewAbout} 
                                    className="text-light-text-secondary dark:text-dark-text-secondary hover:text-primary transition-colors"
                                >
                                    About Us
                                </button>
                            </li>
                            <li>
                                <a href="#gallery" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-primary transition-colors">
                                    Events
                                </a>
                            </li>
                            <li>
                                <a href="#footer" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-primary transition-colors">
                                    Contact
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary mb-6 font-heading">Contact Us</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start space-x-3 text-light-text-secondary dark:text-dark-text-secondary">
                                <MapPin className="w-5 h-5 text-primary mt-1 shrink-0" />
                                <span>43/16, Balasubramaniam Oil Mill Compound, Natham Road, Adianoothu, Dindigul - 624003</span>
                            </li>
                            <li className="flex items-center space-x-3 text-light-text-secondary dark:text-dark-text-secondary">
                                <Phone className="w-5 h-5 text-primary shrink-0" />
                                <span>+91 90436 72733</span>
                            </li>
                            <li className="flex items-center space-x-3 text-light-text-secondary dark:text-dark-text-secondary">
                                <Mail className="w-5 h-5 text-primary shrink-0" />
                                <span>toolanddie.aluminies@gmail.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-light-border dark:border-dark-border pt-8 text-center text-light-text-secondary dark:text-dark-text-secondary text-sm">
                    <p>&copy; {new Date().getFullYear()} DTE Alumni Association. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
