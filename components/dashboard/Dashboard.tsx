import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardNavbar from './DashboardNavbar';
import WelcomeCard from './WelcomeCard';
import ProfileCompletenessCard from './ProfileCompletenessCard';
import QuickActionsCard from './QuickActionsCard';
import UpcomingEventsSection, { Event } from './UpcomingEventsSection';
import ProfileEditForm from './ProfileEditForm';
import AlumniDirectory from './AlumniDirectory';
import ProfilePage from '../ProfilePage';
import Footer from '../home/Footer';
import { supabase } from '../../lib/supabaseClient';
import type { UserData } from '../../types';

interface DashboardProps {
  userData: UserData;
  onLogout: () => void;
  onUserDataUpdate?: (updatedData: UserData) => void;
}

// Mock events data - Replace with actual API call
const mockEvents: Event[] = [
//   Uncomment below to test with events
//   {
//     id: '1',
//     title: 'Annual Alumni Meet 2025',
//     date: '2025-02-15',
//     location: 'DTE Campus, Dindigul',
//     description: 'Join us for our annual gathering of alumni.',
//   },
//   {
//     id: '2',
//     title: 'Career Networking Session',
//     date: '2025-01-20',
//     location: 'Virtual Event',
//     description: 'Connect with fellow alumni and explore opportunities.',
//   },
//   {
//     id: '3',
//     title: 'Tech Talk: AI in Manufacturing',
//     date: '2025-01-25',
//     location: 'Auditorium, Block A',
//     description: 'Expert session on AI applications.',
//   },
];

const Dashboard: React.FC<DashboardProps> = ({ userData, onLogout, onUserDataUpdate }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'directory' | 'events' | 'profile'>('dashboard');
  const [events] = useState<Event[]>(mockEvents);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [localUserData, setLocalUserData] = useState<UserData>(userData);

  const handleViewDirectory = () => {
    setActiveTab('directory');
  };

  const handleViewEvents = () => {
    setActiveTab('events');
  };

  const handleViewProfile = () => {
    setActiveTab('profile');
  };

  const handleCompleteProfile = () => {
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async (updatedData: UserData) => {
    try {
      // Upload profile photo if it's a base64 string (new upload)
      let profilePhotoUrl = updatedData.personal.profilePhoto;
      
      if (profilePhotoUrl && profilePhotoUrl.startsWith('data:')) {
        const response = await fetch(profilePhotoUrl);
        const blob = await response.blob();
        const photoFileName = `${updatedData.id}/profile_${Date.now()}.jpg`;
        
        const { error: photoUploadError } = await supabase.storage
          .from('photos')
          .upload(photoFileName, blob, {
            contentType: 'image/jpeg',
            upsert: true
          });

        if (!photoUploadError) {
          const { data: photoUrlData } = supabase.storage.from('photos').getPublicUrl(photoFileName);
          profilePhotoUrl = photoUrlData?.publicUrl || profilePhotoUrl;
        }
      }

      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({
          personal: {
            ...updatedData.personal,
            profilePhoto: profilePhotoUrl,
          },
          profile_photo: profilePhotoUrl,
          contact: updatedData.contact,
          experience: updatedData.experience,
          privacy: updatedData.privacy || {
            showEmail: true,
            showPhone: false,
            showCompany: false,
            showLocation: false,
          },
        })
        .eq('id', updatedData.id);

      if (error) {
        console.error('Profile update error:', error);
        alert(`Failed to update profile: ${error.message}`);
        return;
      }

      // Update local state
      const newUserData = {
        ...updatedData,
        personal: {
          ...updatedData.personal,
          profilePhoto: profilePhotoUrl,
        },
      };
      setLocalUserData(newUserData);
      
      // Notify parent component
      if (onUserDataUpdate) {
        onUserDataUpdate(newUserData);
      }

      setIsEditingProfile(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Save profile error:', err);
      alert('Failed to save profile. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
  };

  const handleEventDetails = (eventId: string) => {
    console.log('View event details:', eventId);
    setActiveTab('events');
  };

  const handleBrowseAllEvents = () => {
    setActiveTab('events');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
      },
    },
  };

  const renderContent = () => {
    // Show edit profile form if editing
    if (isEditingProfile) {
      return (
        <ProfileEditForm
          userData={localUserData}
          onSave={handleSaveProfile}
          onCancel={handleCancelEdit}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <motion.div
            key="dashboard-content"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Top Row - 3 Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <motion.div variants={itemVariants}>
                <WelcomeCard
                  userName={localUserData.personal.firstName || 'User'}
                  role="Alumni"
                  status={localUserData.status}
                  profilePhoto={localUserData.personal.profilePhoto}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <ProfileCompletenessCard
                  userData={localUserData}
                  onCompleteProfile={handleCompleteProfile}
                />
              </motion.div>

              <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-1">
                <QuickActionsCard
                  onViewDirectory={handleViewDirectory}
                  onViewEvents={handleViewEvents}
                  onViewProfile={handleViewProfile}
                />
              </motion.div>
            </div>

            {/* Upcoming Events - Full Width */}
            <motion.div variants={itemVariants}>
              <UpcomingEventsSection
                events={events}
                onViewDetails={handleEventDetails}
                onBrowseAll={handleBrowseAllEvents}
              />
            </motion.div>
          </motion.div>
        );

      case 'directory':
        return (
          <AlumniDirectory
            currentUserId={localUserData.id}
            onViewProfile={(userId) => {
              console.log('View profile:', userId);
              // TODO: Navigate to member profile view
            }}
          />
        );

      case 'events':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-light-card rounded-xl shadow-sm border border-light-border p-8 text-center"
          >
            <h2 className="text-2xl font-bold text-light-text-primary mb-4">Events</h2>
            <p className="text-light-text-secondary">
              No events scheduled at this time. Check back later for upcoming events!
            </p>
          </motion.div>
        );

      case 'profile':
        return <ProfilePage userData={localUserData} />;

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-light-bg">
      <DashboardNavbar
        userName={localUserData.personal.firstName || 'User'}
        profilePhoto={localUserData.personal.profilePhoto}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={onLogout}
      />

      <main className="flex-grow pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && !isEditingProfile && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-bold text-light-text-primary">Dashboard</h1>
              <p className="text-light-text-secondary mt-1">
                Welcome back! Here's what's happening with your alumni network.
              </p>
            </motion.div>
          )}
          {renderContent()}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
