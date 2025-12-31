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
import EventRegistrationModal from './EventRegistrationModal';

interface DashboardProps {
  userData: UserData;
  onLogout: () => void;
  onUserDataUpdate?: (updatedData: UserData) => void;
}

// Mock events data - Replace with actual API call
const mockEvents: Event[] = [
  {
    id: 'alumni-meet-2026',
    title: 'Alumni Meet 2026',
    date: '2026-01-25',
    location: 'Institute of Tool Engineering, Dindigul',
    description: 'Join us for a day of nostalgia, networking, and celebration.',
  },
  // {
  //   id: '2',
  //   title: 'Career Networking Session',
  //   date: '2025-01-20',
  //   location: 'Virtual Event',
  //   description: 'Connect with fellow alumni and explore opportunities.',
  // },
  // {
  //   id: '3',
  //   title: 'Tech Talk: AI in Manufacturing',
  //   date: '2025-01-25',
  //   location: 'Auditorium, Block A',
  //   description: 'Expert session on AI applications.',
  // },
];

const Dashboard: React.FC<DashboardProps> = ({ userData, onLogout, onUserDataUpdate }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'directory' | 'events' | 'profile'>('dashboard');
  const [events] = useState<Event[]>(mockEvents);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [localUserData, setLocalUserData] = useState<UserData>(userData);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

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

      // Update normalized tables
      // 1. Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ profile_photo: profilePhotoUrl })
        .eq('id', updatedData.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        alert(`Failed to update profile: ${profileError.message}`);
        return;
      }

      // 2. Update personal_details table
      await supabase
        .from('personal_details')
        .update({
          first_name: updatedData.personal.firstName,
          last_name: updatedData.personal.lastName,
          pass_out_year: updatedData.personal.passOutYear,
          dob: updatedData.personal.dob || null,
          blood_group: updatedData.personal.bloodGroup,
          email: updatedData.personal.email,
          alt_email: updatedData.personal.altEmail,
          highest_qualification: updatedData.personal.highestQualification,
          specialization: updatedData.personal.specialization,
        })
        .eq('user_id', updatedData.id);

      // 3. Update contact_details table
      await supabase
        .from('contact_details')
        .update({
          present_city: updatedData.contact.presentAddress.city,
          present_state: updatedData.contact.presentAddress.state,
          present_pincode: updatedData.contact.presentAddress.pincode,
          present_country: updatedData.contact.presentAddress.country,
          permanent_city: updatedData.contact.permanentAddress.city,
          permanent_state: updatedData.contact.permanentAddress.state,
          permanent_pincode: updatedData.contact.permanentAddress.pincode,
          permanent_country: updatedData.contact.permanentAddress.country,
          same_as_present_address: updatedData.contact.sameAsPresentAddress,
          mobile: updatedData.contact.mobile,
          telephone: updatedData.contact.telephone,
        })
        .eq('user_id', updatedData.id);

      // 4. Update employee_experiences (delete and re-insert)
      await supabase.from('employee_experiences').delete().eq('user_id', updatedData.id);
      if (updatedData.experience.employee.length > 0) {
        const { data: profileData } = await supabase.from('profiles').select('alumni_id').eq('id', updatedData.id).single();
        const alumniId = profileData?.alumni_id;
        const employeeRows = updatedData.experience.employee.map(emp => ({
          user_id: updatedData.id,
          alumni_id: alumniId,
          company_name: emp.companyName,
          designation: emp.designation,
          start_date: emp.startDate || null,
          end_date: emp.endDate || null,
          is_current_employer: emp.isCurrentEmployer,
          city: emp.city,
          state: emp.state,
          country: emp.country,
        }));
        await supabase.from('employee_experiences').insert(employeeRows);
      }

      // 5. Update entrepreneur_experiences (delete and re-insert)
      await supabase.from('entrepreneur_experiences').delete().eq('user_id', updatedData.id);
      if (updatedData.experience.entrepreneur.length > 0) {
        const { data: profileData } = await supabase.from('profiles').select('alumni_id').eq('id', updatedData.id).single();
        const alumniId = profileData?.alumni_id;
        const entrepreneurRows = updatedData.experience.entrepreneur.map(ent => ({
          user_id: updatedData.id,
          alumni_id: alumniId,
          company_name: ent.companyName,
          nature_of_business: ent.natureOfBusiness,
          city: ent.city,
          state: ent.state,
          country: ent.country,
        }));
        await supabase.from('entrepreneur_experiences').insert(entrepreneurRows);
      }

      // 6. Update open_to_work_details
      await supabase
        .from('open_to_work_details')
        .update({
          is_open_to_work: updatedData.experience.isOpenToWork,
          technical_skills: updatedData.experience.openToWorkDetails.technicalSkills,
          certifications: updatedData.experience.openToWorkDetails.certifications,
          soft_skills: updatedData.experience.openToWorkDetails.softSkills,
          other: updatedData.experience.openToWorkDetails.other,
        })
        .eq('user_id', updatedData.id);

      // 7. Update privacy_settings
      await supabase
        .from('privacy_settings')
        .update({
          show_email: updatedData.privacy?.showEmail ?? true,
          show_phone: updatedData.privacy?.showPhone ?? false,
          show_company: updatedData.privacy?.showCompany ?? false,
          show_location: updatedData.privacy?.showLocation ?? false,
        })
        .eq('user_id', updatedData.id);

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
    if (eventId === 'alumni-meet-2026') {
      setSelectedEventId(eventId);
      setIsEventModalOpen(true);
    } else {
      console.log('View event details:', eventId);
      setActiveTab('events');
    }
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
            className="space-y-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-light-text-primary">Events</h1>
              <p className="text-light-text-secondary mt-1">
                Stay connected with your alumni network through events
              </p>
            </div>

            {/* Upcoming Events */}
            <div>
              <h2 className="text-xl font-bold text-light-text-primary mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Upcoming Events
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {events.filter(e => new Date(e.date) >= new Date()).map((event) => (
                  <motion.div
                    key={event.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-light-card rounded-xl shadow-sm border border-light-border overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-[#003366] to-[#004080] p-4 text-white">
                      <div className="text-3xl font-bold">{new Date(event.date).getDate()}</div>
                      <div className="text-sm opacity-90">
                        {new Date(event.date).toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-light-text-primary mb-2">{event.title}</h3>
                      <p className="text-sm text-light-text-secondary mb-3">{event.description}</p>
                      <div className="flex items-center gap-2 text-sm text-light-text-secondary mb-4">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {event.location}
                      </div>
                      <button
                        onClick={() => {
                          setSelectedEventId(event.id);
                          setIsEventModalOpen(true);
                        }}
                        className="w-full py-3 rounded-lg bg-gradient-to-r from-[#E7A700] to-[#FFB800] text-white font-bold hover:shadow-lg transition-all"
                      >
                        Register Now
                      </button>
                    </div>
                  </motion.div>
                ))}
                {events.filter(e => new Date(e.date) >= new Date()).length === 0 && (
                  <div className="col-span-full bg-light-card rounded-xl shadow-sm border border-light-border p-8 text-center">
                    <p className="text-light-text-secondary">No upcoming events at this time.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Past Events */}
            <div>
              <h2 className="text-xl font-bold text-light-text-primary mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                Past Events
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {events.filter(e => new Date(e.date) < new Date()).map((event) => (
                  <motion.div
                    key={event.id}
                    className="bg-light-card rounded-xl shadow-sm border border-light-border overflow-hidden opacity-75"
                  >
                    <div className="bg-gray-400 p-4 text-white">
                      <div className="text-3xl font-bold">{new Date(event.date).getDate()}</div>
                      <div className="text-sm opacity-90">
                        {new Date(event.date).toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-light-text-primary mb-2">{event.title}</h3>
                      <p className="text-sm text-light-text-secondary mb-3">{event.description}</p>
                      <div className="flex items-center gap-2 text-sm text-light-text-secondary">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {event.location}
                      </div>
                      <div className="mt-4 py-2 text-center text-sm text-gray-500 border-t border-light-border">
                        Event Completed
                      </div>
                    </div>
                  </motion.div>
                ))}
                {events.filter(e => new Date(e.date) < new Date()).length === 0 && (
                  <div className="col-span-full bg-light-card rounded-xl shadow-sm border border-light-border p-8 text-center">
                    <p className="text-light-text-secondary">No past events to display.</p>
                  </div>
                )}
              </div>
            </div>
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

      <EventRegistrationModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        userId={localUserData.id}
        alumniId={localUserData.alumniId}
        onSuccess={() => {
          // Optional: Show success toast or refresh participation status
          alert('Successfully registered for Alumni Meet 2026!');
        }}
      />
    </div>
  );
};

export default Dashboard;
