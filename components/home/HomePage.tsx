import React from 'react';
import Hero from './Hero';
import About from './About';
import OrganizationChart from './OrganizationChart';
import Gallery from './Gallery';

interface HomePageProps {
    onLoginClick: () => void;
    onViewGallery?: () => void;
    onViewAbout?: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onLoginClick, onViewGallery, onViewAbout }) => {
    return (
        <div className="font-sans text-gray-900 bg-transparent">
            {/* Navbar handled by Global Layout */}
            <Hero onJoinClick={onLoginClick} />
            <About />
            <OrganizationChart />
            <Gallery onViewGallery={onViewGallery} />
            {/* Footer handled by Global Layout */}
        </div>
    );
};

export default HomePage;
