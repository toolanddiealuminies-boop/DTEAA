import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut } from 'lucide-react';

interface NavbarProps {
    onLoginClick: () => void;
    isLoggedIn?: boolean;
    isAdmin?: boolean;
    onLogout?: () => void;
    userName?: string;
    onAdminClick?: () => void;
    onHomeClick?: () => void;
    isLoginPage?: boolean;
    isRegistrationPage?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onLoginClick, isLoggedIn, isAdmin, onLogout, userName, onAdminClick, onHomeClick, isLoginPage, isRegistrationPage }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);

        // Enforce light mode
        document.documentElement.classList.remove('dark');
        localStorage.theme = 'light';

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', href: '#', onClick: onHomeClick },
        { name: 'About', href: '#about' },

        { name: 'Gallery', href: '#gallery' },
        { name: 'Contact', href: '#footer' },
    ];

    let filteredLinks = navLinks;
    if (isRegistrationPage) {
        filteredLinks = []; // Hide all links for registration page
    } else if (isLoginPage) {
        filteredLinks = navLinks.filter(link => link.name !== 'About' && link.name !== 'Gallery');
    }

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            className={`fixed w-full z-50 transition-all duration-300 ${isScrolled
                ? 'bg-light-card/90 backdrop-blur-md shadow-md py-4'
                : 'bg-transparent py-6'
                }`}
        >
            <div className="container mx-auto px-4 flex justify-between items-center">
                <div
                    className="flex items-center space-x-2 cursor-pointer"
                    onClick={() => onHomeClick && onHomeClick()}
                >
                    {/* Logo Images */}
                    <img
                        src="/dteaa_logo_light.png"
                        alt="DTEAA Logo"
                        className="w-10 h-10 rounded-full object-cover mix-blend-multiply"
                    />
                    <span className="text-xl font-bold text-light-text-primary whitespace-nowrap">
                        <span className="md:hidden">DTEAA</span>
                        <span className="hidden md:inline">Dindigul Tool Engineering Alumni Association</span>
                    </span>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-8">
                    {filteredLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            onClick={(e) => {
                                if (link.onClick) {
                                    e.preventDefault();
                                    link.onClick();
                                }
                            }}
                            className="text-sm font-medium transition-colors hover:text-primary text-light-text-primary"
                        >
                            {link.name}
                        </a>
                    ))}

                    {isAdmin && (
                        <button
                            onClick={onAdminClick}
                            className="text-sm font-medium transition-colors hover:text-primary text-light-text-primary flex items-center gap-1"
                        >
                            Admin
                        </button>
                    )}

                    {isLoggedIn ? (
                        <div className="flex items-center gap-4">
                            <div className="text-sm font-medium text-light-text-primary hidden lg:block">
                                {userName}
                            </div>
                            <button
                                onClick={onLogout}
                                className="px-4 py-2 rounded-md border border-red-500 text-red-500 font-medium hover:bg-red-50 transition-all flex items-center gap-2"
                            >
                                <LogOut size={16} />
                                Logout
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={onLoginClick}
                            className="px-6 py-2 rounded-md bg-primary text-white font-bold hover:bg-primary-hover transition-all active:scale-95"
                        >
                            Login
                        </button>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center gap-4">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 text-light-text-primary"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-light-card border-t border-light-border"
                    >
                        <div className="flex flex-col p-4 space-y-4">
                            {filteredLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    onClick={(e) => {
                                        if (link.onClick) {
                                            e.preventDefault();
                                            link.onClick();
                                        }
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="text-light-text-primary hover:text-primary font-medium"
                                >
                                    {link.name}
                                </a>
                            ))}
                            {isAdmin && (
                                <button
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        onAdminClick && onAdminClick();
                                    }}
                                    className="text-light-text-primary hover:text-primary font-medium text-left"
                                >
                                    Admin Dashboard
                                </button>
                            )}
                            {isLoggedIn ? (
                                <>
                                    <div className="text-light-text-secondary text-sm">
                                        Signed in as {userName}
                                    </div>
                                    <button
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            onLogout && onLogout();
                                        }}
                                        className="w-full py-3 rounded-md border border-red-500 text-red-500 font-bold hover:bg-red-50 transition-all active:scale-95"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        onLoginClick();
                                    }}
                                    className="w-full py-3 rounded-md bg-primary text-white font-bold hover:bg-primary-hover transition-all active:scale-95"
                                >
                                    Login
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;
