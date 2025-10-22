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
  isLoggedIn: boolean;
  onLogout: () => void;
  isAdminView?: boolean;
  onAdminClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ isRegistered, isLoggedIn, onLogout, isAdminView, onAdminClick }) => {
  return (
    <header className="w-full fixed top-0 left-0 bg-white border-b border-[#F0E9D8] z-40">
      <div className="max-w-6xl mx-auto flex items-center justify-end px-4 sm:px-6 lg:px-8 h-14">
        <nav className="flex items-center space-x-4">
          {/* Show Admin Dashboard link only if user is admin */}
          {isAdminView && onAdminClick && (
            <button
              onClick={onAdminClick}
              className="text-sm font-medium px-3 py-1 rounded-md bg-[#FFF8E5] border border-[#E7A700] text-[#CF9500] hover:bg-[#FFF2D0]"
              title="Admin Dashboard"
            >
              Admin Dashboard
            </button>
          )}

          {isLoggedIn ? (
            <>
              <button
                onClick={onLogout}
                className="text-sm font-medium px-3 py-1 rounded-md bg-white border border-gray-200 hover:bg-gray-50"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="text-sm text-gray-600">Not signed in</div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;

