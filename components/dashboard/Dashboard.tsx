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
import PrivacySettingsTab from './PrivacySettingsTab';
import Footer from '../home/Footer';
import { supabase } from '../../lib/supabaseClient';
import type { UserData } from '../../types';
import EventRegistrationModal from './EventRegistrationModal';
import SponsorModal from './SponsorModal';
import SponsorPromoPopup from '../SponsorPromoPopup';
import VoucherCard from './VoucherCard';
import InvoiceModal from './InvoiceModal';
import { Heart } from 'lucide-react';
import PaymentInfoCard from './PaymentInfoCard';

interface DashboardProps {
  userData: UserData;
  onLogout: () => void;
  onUserDataUpdate?: (updatedData: UserData) => void;
  onHomeClick?: () => void;
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
];

const Dashboard: React.FC<DashboardProps> = ({ userData, onLogout, onUserDataUpdate, onHomeClick }) => {
  // Initialize tab from URL query param or default to 'dashboard'
  const getInitialTab = () => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && ['dashboard', 'directory', 'events', 'profile', 'privacy'].includes(tab)) {
      return tab as 'dashboard' | 'directory' | 'events' | 'profile' | 'privacy';
    }
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState<'dashboard' | 'directory' | 'events' | 'profile' | 'privacy'>(getInitialTab);
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editInitialStep, setEditInitialStep] = useState(0);
  const [localUserData, setLocalUserData] = useState<UserData>(userData);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Sync state -> URL
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (activeTab === 'dashboard') {
      params.delete('tab');
    } else {
      params.set('tab', activeTab);
    }

    // Construct new URL
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;

    // Only push if changed to avoid loops/noise
    if (window.location.search !== (params.toString() ? '?' + params.toString() : '')) {
      window.history.pushState({}, '', newUrl);
    }
  }, [activeTab]);

  // Sync URL -> State (Back/Forward support)
  React.useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab && ['dashboard', 'directory', 'events', 'profile', 'privacy'].includes(tab)) {
        setActiveTab(tab as any);
      } else {
        setActiveTab('dashboard');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sponsorship State
  const [isSponsorModalOpen, setIsSponsorModalOpen] = useState(false);
  const [hasSponsored, setHasSponsored] = useState(false);
  const [showPromoPopup, setShowPromoPopup] = useState(false);
  const [sponsorships, setSponsorships] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]); // These are now Invoices
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const fetchRegistrations = async () => {
    if (!userData.id) return;

    try {
      // 1. Fetch Registrations
      const { data: regData } = await supabase
        .from('event_registrations')
        .select('event_id, status')
        .eq('user_id', userData.id);

      // 2. Fetch Sponsorships
      const { data: sponsorData } = await supabase
        .from('event_sponsorships')
        .select('id, status, amount, event_id, created_at')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false });

      // 3. Fetch E-Vouchers
      console.log('Fetching vouchers for user:', userData.id);
      const { data: voucherData, error: voucherError } = await supabase
        .from('e_vouchers')
        .select('*')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false });

      if (voucherError) console.error('Error fetching vouchers:', voucherError);
      console.log('Voucher Data:', voucherData);

      const isRegisteredForAny = regData && regData.length > 0;
      const alreadySponsored = sponsorData && sponsorData.length > 0;
      setHasSponsored(!!alreadySponsored);
      setSponsorships(sponsorData || []);
      setVouchers(voucherData || []);

      // Show popup if NOT sponsored yet AND there are future events
      const hasFutureEvents = mockEvents.some(e => new Date(e.date) >= new Date());
      if (!alreadySponsored && hasFutureEvents) {
        // slight delay for better UX
        setTimeout(() => setShowPromoPopup(true), 2000);
      }

      if (regData) {
        const registrationMap = new Map(regData.map((r: any) => [r.event_id, r.status]));

        // Merge with mockEvents
        const updatedEvents = mockEvents.map(event => ({
          ...event,
          registrationStatus: registrationMap.get(event.id) as any || null
        }));
        setEvents(updatedEvents);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  React.useEffect(() => {
    fetchRegistrations();
  }, [userData.id]);

  const handleSponsorClick = (eventId: string) => {
    setSelectedEventId(eventId);
    setIsSponsorModalOpen(true);
    setShowPromoPopup(false); // Close popup if opened via button
  };

  const handleSponsorSuccess = () => {
    setHasSponsored(true);
    fetchRegistrations(); // Refresh data
  };

  const handleViewDirectory = () => {
    setActiveTab('directory');
  };

  const handleViewEvents = () => {
    setActiveTab('events');
  };

  const handleViewProfile = () => {
    setActiveTab('profile');
  };

  const getFirstIncompleteStep = (data: UserData): number => {
    // Step 0: Personal - check required fields
    const p = data.personal;
    if (!p.firstName || !p.lastName || !p.passOutYear || !p.dob || !p.bloodGroup || !p.highestQualification || !p.email) {
      return 0;
    }
    // Step 1: Contact - check required fields
    const c = data.contact;
    if (!c.mobile || !c.presentAddress?.country || !c.presentAddress?.state || !c.presentAddress?.city) {
      return 1;
    }
    // Step 2: Experience - optional but if empty, suggest
    if (data.experience.employee.length === 0 && data.experience.entrepreneur.length === 0) {
      return 2;
    }
    // Step 3: Privacy
    return 3;
  };

  const handleCompleteProfile = () => {
    const step = getFirstIncompleteStep(localUserData);
    setEditInitialStep(step);
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
    // If registered, maybe just show details or edit?
    // For now, simple logic: if it's the specific event, open modal
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
          initialStep={editInitialStep}
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

            {/* Payment Info for Pending/Rejected Users */}
            {localUserData.status !== 'verified' && (
              <motion.div variants={itemVariants}>
                <PaymentInfoCard
                  status={localUserData.status}
                  rejectionComments={localUserData.rejectionComments}
                />
              </motion.div>
            )}

            {/* My E-Vouchers - Show only if exists */}
            {/* My E-Vouchers - Show only if exists */}
            {vouchers.length > 0 && (
              <div className="animate-fade-in-up">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-green-500 rounded-full"></span>
                  Payment Receipts
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {vouchers.map(v => (
                    <div key={v.id} onClick={() => setSelectedInvoice(v)} className="cursor-pointer transition-transform hover:scale-105" title="Click to view Invoice">
                      <VoucherCard voucher={v} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Events - Full Width (only show future events on dashboard) */}
            {events.filter(e => new Date(e.date) >= new Date()).length > 0 && (
              <motion.div variants={itemVariants}>
                <UpcomingEventsSection
                  events={events.filter(e => new Date(e.date) >= new Date())}
                  onViewDetails={handleEventDetails}
                  onBrowseAll={handleBrowseAllEvents}
                  onSponsorClick={handleSponsorClick}
                />
              </motion.div>
            )}

            {/* My Contributions Section */}
            {/* My Contributions Section */}
            {hasSponsored && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="bg-white rounded-xl shadow-sm border border-light-border p-6 overflow-hidden">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-red-500 fill-current" />
                        My Contributions
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">Thank you for supporting our alumni community.</p>
                    </div>
                    <button
                      onClick={() => handleSponsorClick('alumni-meet-2026')}
                      className="w-full md:w-auto px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                    >
                      <Heart className="w-4 h-4" />
                      Sponsor More
                    </button>
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 border border-gray-100 rounded-lg overflow-hidden">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Event
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {sponsorships.map((sponsor) => (
                          <tr key={sponsor.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {events.find(e => e.id === sponsor.event_id)?.title || 'Alumni Event'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(sponsor.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                              ₹{sponsor.amount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${sponsor.status === 'approved' ? 'bg-green-100 text-green-800' :
                                  sponsor.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'}`}>
                                {sponsor.status ? sponsor.status.charAt(0).toUpperCase() + sponsor.status.slice(1) : 'Pending'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-4">
                    {sponsorships.map((sponsor) => (
                      <div key={sponsor.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {events.find(e => e.id === sponsor.event_id)?.title || 'Alumni Event'}
                          </h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide 
                              ${sponsor.status === 'approved' ? 'bg-green-100 text-green-800' :
                              sponsor.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'}`}>
                            {sponsor.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-end">
                          <div className="text-xs text-gray-500">
                            {new Date(sponsor.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-xl font-bold text-gray-900">
                            ₹{sponsor.amount}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
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

                      {/* Add Status Badge logic here for Events Tab too if needed, or reuse component logic */}
                      {event.registrationStatus === 'approved' && (
                        <div className="mb-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          Registered
                        </div>
                      )}
                      {event.registrationStatus === 'pending' && (
                        <div className="mb-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                          Pending Approval
                        </div>
                      )}

                      <button
                        onClick={() => {
                          setSelectedEventId(event.id);
                          setIsEventModalOpen(true);
                        }}
                        className={`w-full py-3 rounded-lg font-bold transition-all ${event.registrationStatus
                          ? 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50'
                          : 'bg-gradient-to-r from-[#E7A700] to-[#FFB800] text-white hover:shadow-lg'
                          }`}
                      >
                        {event.registrationStatus ? 'View Details' : 'Register Now'}
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

      case 'privacy':
        return (
          <PrivacySettingsTab
            userData={localUserData}
            onUpdate={(updatedPrivacy) => {
              const newUserData = { ...localUserData, privacy: updatedPrivacy };
              setLocalUserData(newUserData);
              if (onUserDataUpdate) onUserDataUpdate(newUserData);
            }}
          />
        );

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
        onHomeClick={onHomeClick}
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
          fetchRegistrations(); // Refresh registration data
          // alert('Successfully registered for Alumni Meet 2026!'); // Removed alert as modal shows success
        }}
      />

      {/* Sponsor Modal */}
      <SponsorModal
        isOpen={isSponsorModalOpen}
        onClose={() => setIsSponsorModalOpen(false)}
        userId={localUserData.id}
        eventId={selectedEventId || 'alumni-meet-2026'}
        onSuccess={handleSponsorSuccess}
      />

      {/* Sponsor Promo Popup */}
      <SponsorPromoPopup
        isOpen={showPromoPopup}
        onClose={() => setShowPromoPopup(false)}
        onSponsorClick={() => handleSponsorClick('alumni-meet-2026')}
      />
      <InvoiceModal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
        userName={`${localUserData.personal.firstName} ${localUserData.personal.lastName}`}
        alumniId={localUserData.personal.alumniId || localUserData.alumniId || 'N/A'}
      />
    </div>
  );
};

export default Dashboard;
