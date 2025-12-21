import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon, User, LogOut } from 'lucide-react';

interface NavbarProps {
    onLoginClick: () => void;
    isLoggedIn?: boolean;
    isAdmin?: boolean;
    onLogout?: () => void;
    userName?: string;
    onAdminClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLoginClick, isLoggedIn, isAdmin, onLogout, userName, onAdminClick }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);

        // Check system preference or saved theme
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDark(false);
            document.documentElement.classList.remove('dark');
        }

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleTheme = () => {
        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
            setIsDark(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
            setIsDark(true);
        }
    };

    const navLinks = [
        { name: 'Home', href: '#' },
        { name: 'About', href: '#about' },
        { name: 'Stats', href: '#stats' },
        { name: 'Gallery', href: '#gallery' },
        { name: 'Contact', href: '#footer' },
    ];

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            className={`fixed w-full z-50 transition-all duration-300 ${isScrolled
                ? 'bg-light-card/90 dark:bg-dark-card/90 backdrop-blur-md shadow-md py-4'
                : 'bg-transparent py-6'
                }`}
        >
            <div className="container mx-auto px-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    {/* Logo Images */}
                    <img
                        src="/dteaa_logo_light.png"
                        alt="DTEAA Logo"
                        className="w-10 h-10 rounded-full object-cover dark:hidden mix-blend-multiply"
                    />
                    <img
                        src="/dteaa_logo_dark.png"
                        alt="DTEAA Logo"
                        className="w-10 h-10 rounded-full object-cover hidden dark:block mix-blend-screen"
                    />
                    <span className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">
                        DTEAA
                    </span>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-8">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="text-sm font-medium transition-colors hover:text-primary text-light-text-primary dark:text-dark-text-primary"
                        >
                            {link.name}
                        </a>
                    ))}

                    {isAdmin && (
                        <button
                            onClick={onAdminClick}
                            className="text-sm font-medium transition-colors hover:text-primary text-light-text-primary dark:text-dark-text-primary flex items-center gap-1"
                        >
                            Admin
                        </button>
                    )}

                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full transition-colors text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-border dark:hover:bg-dark-border"
                        aria-label="Toggle Theme"
                    >
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {isLoggedIn ? (
                        <div className="flex items-center gap-4">
                            <div className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary hidden lg:block">
                                {userName}
                            </div>
                            <button
                                onClick={onLogout}
                                className="px-4 py-2 rounded-md border border-red-500 text-red-500 font-medium hover:bg-red-50 dark:hover:bg-red-900/10 transition-all flex items-center gap-2"
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
                        onClick={toggleTheme}
                        className="p-2 text-light-text-primary dark:text-dark-text-primary"
                    >
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 text-light-text-primary dark:text-dark-text-primary"
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
                        className="md:hidden bg-light-card dark:bg-dark-card border-t border-light-border dark:border-dark-border"
                    >
                        <div className="flex flex-col p-4 space-y-4">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-light-text-primary dark:text-dark-text-primary hover:text-primary font-medium"
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
                                    className="text-light-text-primary dark:text-dark-text-primary hover:text-primary font-medium text-left"
                                >
                                    Admin Dashboard
                                </button>
                            )}
                            {isLoggedIn ? (
                                <>
                                    <div className="text-light-text-secondary dark:text-dark-text-secondary text-sm">
                                        Signed in as {userName}
                                    </div>
                                    <button
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            onLogout && onLogout();
                                        }}
                                        className="w-full py-3 rounded-md border border-red-500 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/10 transition-all active:scale-95"
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
