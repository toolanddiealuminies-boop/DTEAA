import React from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import About from './About';
import Stats from './Stats';
import Gallery from './Gallery';
import Footer from './Footer';

interface HomePageProps {
    onLoginClick: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onLoginClick }) => {
    return (
        <div className="font-sans text-gray-900 bg-white">
            <Navbar onLoginClick={onLoginClick} />
            <Hero />
            <About />
            <Stats />
            <Gallery />
            <Footer />
        </div>
    );
};

export default HomePage;
