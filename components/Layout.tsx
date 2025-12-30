import React, { ReactNode } from 'react';
import Navbar from './home/Navbar';
import Footer from './home/Footer';

interface LayoutProps {
    children: ReactNode;
    onLoginClick?: () => void;
    isLoggedIn?: boolean;
    isAdmin?: boolean;
    onLogout?: () => void;
    userName?: string;
    onAdminClick?: () => void;
    onHomeClick?: () => void;
    onViewGallery?: () => void;
    onViewAbout?: () => void;
    isLoginPage?: boolean;
    isRegistrationPage?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
    children,
    onLoginClick = () => { },
    isLoggedIn = false,
    isAdmin = false,
    onLogout,
    userName,
    onAdminClick,
    onHomeClick,
    onViewGallery,
    onViewAbout,
    isLoginPage,
    isRegistrationPage
}) => {
    return (
        <div className="flex flex-col min-h-screen font-sans bg-light-bg text-light-text-primary transition-colors duration-300">
            <Navbar
                onLoginClick={onLoginClick}
                isLoggedIn={isLoggedIn}
                isAdmin={isAdmin}
                onLogout={onLogout}
                userName={userName}
                onAdminClick={onAdminClick}
                onHomeClick={onHomeClick}
                onViewGallery={onViewGallery}
                onViewAbout={onViewAbout}
                isLoginPage={isLoginPage}
                isRegistrationPage={isRegistrationPage}
            />

            <main className="flex-grow pt-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>

            <Footer onViewAbout={onViewAbout} />
        </div>
    );
};

export default Layout;
