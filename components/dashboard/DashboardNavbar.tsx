import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, User, ChevronDown } from 'lucide-react';

interface DashboardNavbarProps {
  userName: string;
  profilePhoto?: string;
  activeTab: 'dashboard' | 'directory' | 'events' | 'profile';
  onTabChange: (tab: 'dashboard' | 'directory' | 'events' | 'profile') => void;
  onLogout: () => void;
  onHomeClick?: () => void;
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({
  userName,
  profilePhoto,
  activeTab,
  onTabChange,
  onLogout,
  onHomeClick,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Dashboard', tab: 'dashboard' as const },
    { name: 'Directory', tab: 'directory' as const },
    { name: 'Events', tab: 'events' as const },
    { name: 'Profile', tab: 'profile' as const },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-light-card/95 backdrop-blur-md shadow-md py-3'
          : 'bg-light-card py-4'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={onHomeClick}
        >
          <img
            src="/dteaa_logo_light.png"
            alt="DTEAA Logo"
            className="w-10 h-10 rounded-full object-cover mix-blend-multiply"
          />
          <span className="text-xl font-bold text-light-text-primary whitespace-nowrap">
            <span className="md:hidden">DTEAA</span>
            <span className="hidden md:inline">DTEAA</span>
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => (
            <button
              key={link.tab}
              onClick={() => onTabChange(link.tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === link.tab
                  ? 'bg-primary/10 text-primary'
                  : 'text-light-text-secondary hover:bg-gray-100 hover:text-light-text-primary'
              }`}
            >
              {link.name}
            </button>
          ))}
        </div>

        {/* User Dropdown - Desktop */}
        <div className="hidden md:block relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt={userName}
                className="w-8 h-8 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
            )}
            <span className="text-sm font-medium text-light-text-primary max-w-[120px] truncate">
              {userName}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-light-text-secondary transition-transform ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 overflow-hidden"
              >
                <button
                  onClick={() => {
                    onTabChange('profile');
                    setIsDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-light-text-primary hover:bg-gray-50 flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <hr className="my-1 border-gray-100" />
                <button
                  onClick={() => {
                    onLogout();
                    setIsDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt={userName}
              className="w-8 h-8 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
          )}
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
            <div className="flex flex-col p-4 space-y-2">
              <div className="px-4 py-2 text-sm text-light-text-secondary">
                Signed in as <span className="font-medium text-light-text-primary">{userName}</span>
              </div>
              <hr className="border-gray-100" />
              {navLinks.map((link) => (
                <button
                  key={link.tab}
                  onClick={() => {
                    onTabChange(link.tab);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === link.tab
                      ? 'bg-primary/10 text-primary'
                      : 'text-light-text-primary hover:bg-gray-50'
                  }`}
                >
                  {link.name}
                </button>
              ))}
              <hr className="border-gray-100" />
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onLogout();
                }}
                className="w-full py-3 rounded-lg border border-red-500 text-red-500 font-medium hover:bg-red-50 transition-all flex items-center justify-center gap-2"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default DashboardNavbar;
