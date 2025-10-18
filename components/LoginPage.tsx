import React from 'react';

interface LoginPageProps {
  onLogin: () => void;
  onAdminLogin: () => void;
}

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.802 8.94C34.353 4.909 29.493 2.5 24 2.5C11.986 2.5 2.5 11.986 2.5 24s9.486 21.5 21.5 21.5S45.5 36.014 45.5 24c0-1.545-.138-3.056-.389-4.522z"></path>
    <path fill="#FF3D00" d="M6.306 14.691c-1.831 3.14-2.806 6.748-2.806 10.618s.975 7.478 2.806 10.618C3.181 32.748 1.5 28.616 1.5 24s1.681-8.748 4.806-11.309z"></path>
    <path fill="#4CAF50" d="M24 45.5c5.493 0 10.353-2.409 14.802-6.39l-4.84-4.84C30.68 36.154 27.461 38 24 38c-5.223 0-9.649-3.343-11.303-7.918l-4.99 4.99C11.353 41.091 17.253 45.5 24 45.5z"></path>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.14-4.082 5.571l4.819 4.819C42.022 34.572 45.5 29.559 45.5 24c0-1.545-.138-3.056-.389-4.522z"></path>
  </svg>
);


const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onAdminLogin }) => {
  return (
    <div className="bg-[#FFF9EE] p-8 sm:p-12 rounded-xl shadow-2xl text-center max-w-md mx-auto animate-fade-in border border-[#DDD2B5]">
      <h3 className="text-2xl font-bold text-[#2E2E2E] mb-2">Welcome Alumni!</h3>
      <p className="text-[#555555] mb-8">Please sign in to continue to your profile or register.</p>
      <div className="space-y-4">
        <button
          onClick={onLogin}
          className="w-full inline-flex items-center justify-center px-4 py-3 bg-[#F7F4EF] border border-[#DDD2B5] rounded-lg shadow-sm text-md font-medium text-[#2E2E2E] hover:bg-[#F0ECE4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E7A700] transition-all duration-300 transform hover:scale-105 hover:shadow-md"
        >
          <GoogleIcon />
          Sign in with Google
        </button>
        <button
          onClick={onAdminLogin}
          className="w-full inline-flex items-center justify-center px-4 py-3 bg-transparent text-sm font-medium text-[#555555] hover:text-[#2E2E2E] transition-colors"
        >
          Admin Login
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
