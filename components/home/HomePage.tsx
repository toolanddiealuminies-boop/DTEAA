import React, { useState, useEffect } from 'react';
import Hero from './Hero';
import About from './About';
import OrganizationChart from './OrganizationChart';
import Gallery from './Gallery';
import { supabase } from '../../lib/supabaseClient';

import ConfirmationModal from '../ConfirmationModal';

interface HomePageProps {
    onLoginClick: () => void;
    onViewGallery?: () => void;
    onViewAbout?: () => void;
    userId?: string;
}

const HomePage: React.FC<HomePageProps> = ({ onLoginClick, onViewGallery, onViewAbout, userId }) => {
    const [isRegistered, setIsRegistered] = useState(false);
    const [showAlreadyRegisteredModal, setShowAlreadyRegisteredModal] = useState(false);

    useEffect(() => {
        if (!userId) return;

        const checkStatus = async () => {
            const { data: regData } = await supabase
                .from('event_registrations')
                .select('status')
                .eq('user_id', userId)
                .eq('event_id', 'alumni-meet-2026')
                .maybeSingle();

            setIsRegistered(!!regData);
        };

        checkStatus();
    }, [userId]);

    const handleHeroAction = () => {
        if (userId && isRegistered) {
            setShowAlreadyRegisteredModal(true);
        } else {
            onLoginClick();
        }
    };

    return (
        <div className="font-sans text-gray-900 bg-transparent">
            <Hero onJoinClick={handleHeroAction} onLearnMoreClick={onViewAbout} />
            <About />
            <OrganizationChart />
            <Gallery onViewGallery={onViewGallery} />

            <ConfirmationModal
                isOpen={showAlreadyRegisteredModal}
                title="Already Registered"
                message="You have already registered for the Alumni Meet 2026. Please visit your dashboard for more details."
                confirmText="Go to Dashboard"
                cancelText="Close"
                onConfirm={() => {
                    setShowAlreadyRegisteredModal(false);
                    onLoginClick();
                }}
                onCancel={() => setShowAlreadyRegisteredModal(false)}
            />
        </div>
    );
};

export default HomePage;
