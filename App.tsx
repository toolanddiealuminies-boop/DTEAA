import React, { useState, useEffect } from 'react';
import { UserData } from './types';
import LoginPage from './components/LoginPage';
import RegistrationForm from './components/RegistrationForm';
import ProfilePage from './components/ProfilePage';
import Header from './components/Header';
import AdminDashboard from './components/AdminDashboard';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';

const initialUserData: UserData = {
  id: '',
  role: 'user',
  alumniId: '',
  status: 'pending',
  paymentReceipt: '',
  personal: {
    firstName: '',
    lastName: '',
    passOutYear: '',
    dob: '',
    bloodGroup: '',
    email: '',
    altEmail: '',
    highestQualification: '',
  },
  contact: {
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: '',
    mobile: '',
    telephone: '',
  },
  experience: {
    employee: [],
    entrepreneur: [],
    isOpenToWork: false,
    openToWorkDetails: {
      technicalSkills: '',
      certifications: '',
      softSkills: '',
      other: '',
    },
  },
};

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [registrationFormData, setRegistrationFormData] = useState<UserData>(initialUserData);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session) {
        await fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        await fetchUserProfile(session.user.id);
      } else {
        setUserData(null);
        setIsRegistered(false);
        setIsAdminView(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);
  
  useEffect(() => {
    if (userData?.role === 'admin') {
      setIsAdminView(true);
      fetchAllUsers();
    } else {
      setIsAdminView(false);
    }
  }, [userData]);


  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
    }
    
    if (data) {
      setUserData(data);
      setRegistrationFormData(data);
      setIsRegistered(true);
    } else {
      setIsRegistered(false);
      setRegistrationFormData(prev => ({
        ...initialUserData,
        id: session?.user.id || '',
        personal: {
            ...initialUserData.personal,
            email: session?.user.email || '',
            firstName: session?.user.user_metadata?.full_name?.split(' ')[0] || '',
            lastName: session?.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
        }
      }));
    }
  };

  const fetchAllUsers = async () => {
    if (userData?.role !== 'admin') return;
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) console.error('Error fetching all users:', error);
    else setAllUsers(data || []);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };
  
  const handleRegister = async (receiptFile: File) => {
    if (!session?.user) return alert("You must be logged in to register.");
    if (!registrationFormData.personal.passOutYear) {
      alert("Year of Pass Out is required to generate an ID.");
      setCurrentStep(1);
      return;
    }

    const fileExt = receiptFile.name.split('.').pop();
    const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('receipts').upload(fileName, receiptFile);

    if (uploadError) {
      alert('Failed to upload payment receipt. Please try again.');
      return;
    }
    
    const { data: { publicUrl } } = supabase.storage.from('receipts').getPublicUrl(fileName);

    const uniqueNum = String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0');
    const alumniId = `DTEAA-${registrationFormData.personal.passOutYear}-${uniqueNum}`;
    
    const { id, personal, contact, experience } = registrationFormData;
    const profileData = { id, alumni_id: alumniId, payment_receipt: publicUrl, personal, contact, experience };

    const { data: insertedData, error: insertError } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    if (insertError) {
      alert('Failed to save your registration. Please try again.');
      await supabase.storage.from('receipts').remove([fileName]);
      return;
    }
    
    if (insertedData) {
      setUserData(insertedData);
      setIsRegistered(true);
    }
  };

  const handleVerify = async (userId: string) => {
     if (userData?.role !== 'admin') return alert("Permission denied.");
     
     const { error } = await supabase.from('profiles').update({ status: 'verified' }).eq('id', userId);

    if (error) alert(`Failed to verify user ${userId}.`);
    else {
        setAllUsers(users => users.map(user => user.id === userId ? { ...user, status: 'verified' } : user));
        alert(`User ${userId} has been verified. A confirmation email simulation has been triggered.`);
    }
  };

  const renderContent = () => {
    if (loading) return <div className="text-center p-12 text-lg font-medium text-[#555555]">Loading session...</div>;
    if (isAdminView) return <AdminDashboard users={allUsers} onVerify={handleVerify} />;
    if (!session) return <LoginPage />;
    if (!isRegistered) {
      return (
        <RegistrationForm
          userData={registrationFormData}
          setUserData={setRegistrationFormData}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          onRegister={handleRegister}
        />
      );
    }
    return <ProfilePage userData={userData!} />;
  };

  return (
    <>
      <Header isRegistered={isRegistered} isLoggedIn={!!session} onLogout={handleLogout} />
      <div className="flex flex-col items-center p-4 sm:p-6 lg:p-8 pt-24 font-sans">
        <div className="w-full max-w-4xl mx-auto">
          <header className="text-center mb-8 animate-fade-in">
              <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#E7A700] to-[#CF9500] pb-2">
                Dindigul Tool Engineering
              </h1>
              <h2 className="text-2xl sm:text-3xl font-semibold text-[#2E2E2E] mt-1">
                Alumni Association
              </h2>
          </header>
          <main>{renderContent()}</main>
        </div>
      </div>
    </>
  );
};

export default App;
