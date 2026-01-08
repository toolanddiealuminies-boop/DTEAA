import React, { useState, useEffect } from 'react';
import Hero from './Hero';
import EventBanner from './EventBanner';
import About from './About';
import OrganizationChart from './OrganizationChart';
import Gallery from './Gallery';
import SponsorPromoPopup from '../SponsorPromoPopup';
import SponsorModal from '../dashboard/SponsorModal';
import { supabase } from '../../lib/supabaseClient';

import ConfirmationModal from '../ConfirmationModal';

interface HomePageProps {
    onLoginClick: () => void;
    onViewGallery?: () => void;
    onViewAbout?: () => void;
    userId?: string;
}

const HomePage: React.FC<HomePageProps> = ({ onLoginClick, onViewGallery, onViewAbout, userId }) => {
    const [showPromoPopup, setShowPromoPopup] = useState(false);
    const [isSponsorModalOpen, setIsSponsorModalOpen] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [showAlreadyRegisteredModal, setShowAlreadyRegisteredModal] = useState(false);

    useEffect(() => {
        if (!userId) return;

        const checkStatus = async () => {
            // 1. Check Registration
            const { data: regData } = await supabase
                .from('event_registrations')
                .select('status')
                .eq('user_id', userId)
                .eq('event_id', 'alumni-meet-2026') // Focused on this event for now
                .maybeSingle();

            setIsRegistered(!!regData);

            if (!regData) return; // Not registered

            // 2. Check Sponsorship
            const { data: sponsorData } = await supabase
                .from('event_sponsorships')
                .select('id')
                .eq('user_id', userId)
                .eq('event_id', 'alumni-meet-2026')
                .maybeSingle();

            if (!sponsorData) {
                // Registered but not sponsored
                setTimeout(() => setShowPromoPopup(true), 3000);
            }
        };

        checkStatus();
    }, [userId]);

    const handleSponsorClick = () => {
        setShowPromoPopup(false);
        setIsSponsorModalOpen(true);
    };

    const handleHeroAction = () => {
        if (userId && isRegistered) {
            setShowAlreadyRegisteredModal(true);
        } else {
            onLoginClick();
        }
    };

    return (
        <div className="font-sans text-gray-900 bg-transparent">
            {/* Navbar handled by Global Layout */}
            <Hero onJoinClick={handleHeroAction} onLearnMoreClick={onViewAbout} />
            <About />
            <OrganizationChart />
            <Gallery onViewGallery={onViewGallery} />

            {/* Already Registered Modal */}
            <ConfirmationModal
                isOpen={showAlreadyRegisteredModal}
                title="Already Registered"
                message="You have already registered for the Alumni Meet 2026. Please visit your dashboard for more details."
                confirmText="Go to Dashboard"
                cancelText="Close"
                onConfirm={() => {
                    setShowAlreadyRegisteredModal(false);
                    onLoginClick(); // Redirects to dashboard if logged in
                }}
                onCancel={() => setShowAlreadyRegisteredModal(false)}
            />

            {/* Sponsor Popup & Modal */}
            <SponsorPromoPopup
                isOpen={showPromoPopup}
                onClose={() => setShowPromoPopup(false)}
                onSponsorClick={handleSponsorClick}
            />

            {userId && (
                <SponsorModal
                    isOpen={isSponsorModalOpen}
                    onClose={() => setIsSponsorModalOpen(false)}
                    userId={userId}
                    eventId="alumni-meet-2026"
                    onSuccess={() => setShowPromoPopup(false)} // Don't show again
                />
            )}
        </div>
    );
};

export default HomePage;
