import React from 'react';

const DteLogo = () => (
    <svg width="40" height="40" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <title>DTE Alumni Association Logo</title>
        <circle cx="60" cy="60" r="58" fill="#FFF9EE" stroke="#DDD2B5" strokeWidth="4"/>
        <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fontFamily="sans-serif" fontSize="48" fontWeight="bold" fill="#2E2E2E">
            DT<tspan fill="#E7A700">E</tspan>
        </text>
    </svg>
);

interface HeaderProps {
  isRegistered: boolean;
}

const Header: React.FC<HeaderProps> = ({ isRegistered }) => {
  return (
    <header className="sticky top-0 z-50 bg-[#FFFDF8]/90 backdrop-blur-sm shadow-sm border-b border-[#DDD2B5]/50">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex-shrink-0 flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E7A700] rounded-lg">
            <DteLogo />
            <span className="ml-3 text-xl font-bold text-[#2E2E2E] hidden sm:block">DTE Alumni</span>
          </a>

          {/* Navigation */}
          {isRegistered && (
            <nav aria-label="Main navigation">
              <ul className="flex items-center space-x-4 sm:space-x-6">
                <li>
                  <a href="#" className="px-2 py-1 text-sm font-medium text-[#555555] hover:text-[#E7A700] transition-colors duration-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E7A700]">Home</a>
                </li>
                <li>
                  <a href="#" className="px-2 py-1 text-sm font-medium text-[#555555] hover:text-[#E7A700] transition-colors duration-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E7A700]">Events</a>
                </li>
                <li>
                  <a href="#" className="px-2 py-1 text-sm font-medium text-[#555555] hover:text-[#E7A700] transition-colors duration-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E7A700]">Directory</a>
                </li>
                <li>
                  <a href="#" className="px-3 py-2 text-sm font-medium text-white bg-[#E7A700] rounded-md hover:bg-[#CF9500] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E7A700]">Profile</a>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
