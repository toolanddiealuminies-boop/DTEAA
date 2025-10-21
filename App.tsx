// src/App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import LoginPage from './components/LoginPage';
import RegistrationForm from './components/RegistrationForm';
import ProfilePage from './components/ProfilePage';
import Header from './components/Header';
import AdminDashboard from './components/AdminDashboard';
import { supabase } from './lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import type { UserData } from './types';

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

  // fetch profile by user id and update local state
  const fetchUserProfile = useCallback(
    async (userId: string | undefined) => {
      if (!userId) return;
      try {
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
          // no profile found - prefill registration form from session if possible
          setIsRegistered(false);
          setRegistrationFormData(prev => {
            // use session values as default if available
            const email = session?.user?.email || prev.personal.email || '';
            const fullName = session?.user?.user_metadata?.full_name || '';
            const first = fullName ? fullName.split(' ')[0] : prev.personal.firstName;
            const last = fullName ? fullName.split(' ').slice(1).join(' ') : prev.personal.lastName;
            return {
              ...initialUserData,
              id: session?.user?.id || prev.id || '',
              personal: {
                ...initialUserData.personal,
                email,
                firstName: first || '',
                lastName: last || '',
              },
            };
          });
        }
      } catch (err) {
        console.error('fetchUserProfile error', err);
      }
    },
    [session]
  );

  const fetchAllUsers = useCallback(async () => {
    if (userData?.role !== 'admin') return;
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) {
        console.error('Error fetching all users:', error);
      } else {
        setAllUsers(data || []);
      }
    } catch (err) {
      console.error('fetchAllUsers error', err);
    }
  }, [userData]);

  // Setup session check + subscription
  useEffect(() => {
    let mounted = true;
    let subscription: any = null;

    const hydrateFromLocal = () => {
      try {
        // quick heuristic: check common supabase session key or a saved session
        const raw = localStorage.getItem('sb:session') || localStorage.getItem('supabase.auth.token') || localStorage.getItem('alumniForm') || null;
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (parsed && (parsed.access_token || parsed.user || parsed.id)) {
              // nothing else required here — we will still call getSession below to confirm
              return true;
            }
          } catch {
            // ignore non-json
          }
        }
        return false;
      } catch {
        return false;
      }
    };

    (async () => {
      try {
        // quick synchronous/local fallback - helpful for snappy UX
        const quick = hydrateFromLocal();
        if (quick && mounted) {
          // attempt to get actual session still, but allow UI to proceed if getSession takes time
          // we don't automatically setSession here without validation
        }

        // Supabase v2: getSession() returns { data: { session } }
        // v1 used supabase.auth.session()
        const getSessionFn = (supabase.auth as any).getSession || (supabase.auth as any).session;
        if (getSessionFn) {
          try {
            const result = await (supabase.auth as any).getSession();
            const s = result?.data?.session ?? result?.session ?? null;
            if (!mounted) return;
            setSession(s);
            if (s) {
              await fetchUserProfile(s.user.id);
            } else {
              // not logged in; ensure app shows login
              setUserData(null);
              setIsRegistered(false);
            }
          } catch (err) {
            console.error('getSession error', err);
            // fall through and set loading false
          }
        } else {
          // fallback if older API
          try {
            const user = (supabase.auth as any).user ? (supabase.auth as any).user() : null;
            if (user) {
              setSession({ user } as Session);
              await fetchUserProfile(user.id);
            } else {
              setSession(null);
            }
          } catch (err) {
            console.error('fallback session check failed', err);
          }
        }
      } catch (err) {
        console.error('session initialization failed', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    // subscription to auth changes
    try {
      const sub = (supabase.auth as any).onAuthStateChange?.((event: string, s: any) => {
        if (!mounted) return;
        // set session (could be null on sign out)
        setSession(s ?? null);

        if (s && s.user?.id) {
          // on sign-in
          fetchUserProfile(s.user.id);
        } else {
          // sign-out
          setUserData(null);
          setIsRegistered(false);
          setIsAdminView(false);
        }
      });

      // different supabase versions return different shapes; normalize to `subscription`
      subscription = sub?.data?.subscription ?? sub?.subscription ?? sub;
    } catch (err) {
      console.error('onAuthStateChange subscribe failed', err);
    }

    return () => {
      mounted = false;
      try {
        if (subscription?.unsubscribe) subscription.unsubscribe();
        else if (subscription?.remove) subscription.remove();
        else if (typeof subscription === 'function') subscription(); // in very old versions
      } catch (e) {
        // ignore unsubscribe errors
      }
    };
    // Run once on mount. We intentionally omit fetchUserProfile from deps to avoid resubscribing.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // When userData updates check for admin view / fetch users
  useEffect(() => {
    if (userData?.role === 'admin') {
      setIsAdminView(true);
      fetchAllUsers();
    } else {
      setIsAdminView(false);
    }
  }, [userData, fetchAllUsers]);

  // logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // supabase will trigger onAuthStateChange and clear user; we also clear local state as fallback
      setSession(null);
      setUserData(null);
      setIsRegistered(false);
      setIsAdminView(false);
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  // registration handler (upload receipt + insert profile)
  const handleRegister = async (receiptFile: File) => {
  if (!session?.user) {
    alert("You must be logged in to register.");
    return;
  }

  if (!registrationFormData.personal.passOutYear) {
    alert("Year of Pass Out is required to generate an ID.");
    setCurrentStep(1);
    return;
  }

  try {
    // Upload receipt
    const fileExt = receiptFile.name.split('.').pop();
    const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(fileName, receiptFile);

    if (uploadError) {
      console.error('Storage upload error', { uploadError, uploadData });
      alert(`Failed to upload payment receipt: ${uploadError.message || JSON.stringify(uploadError)}`);
      return;
    }

    // Get public URL (or use signed URL if bucket is private)
    const { data: publicData, error: publicError } = await supabase.storage
      .from('receipts')
      .getPublicUrl(fileName);

    if (publicError) {
      console.error('getPublicUrl error', { publicError, publicData });
      alert('Uploaded receipt but could not get public URL. Check bucket permissions.');
      return;
    }

    const publicUrl = publicData?.publicUrl ?? '';

    // Create unique alumni id
    const uniqueNum = String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0');
    const alumniId = `DTEAA-${registrationFormData.personal.passOutYear}-${uniqueNum}`;

    // IMPORTANT: use the auth user id from the session to satisfy FK constraint
    const userId = session.user.id;

    // Build the row to insert
    const profileRow = {
      id: userId,                     // <- use session.user.id (not registrationFormData.id)
      alumni_id: alumniId,
      payment_receipt: publicUrl,
      personal: registrationFormData.personal,
      contact: registrationFormData.contact,
      experience: registrationFormData.experience,
      // optionally: status/role if you want to override defaults
      // status: 'pending', role: 'user'
    };

    const { data: insertedData, error: insertError, status, statusText } = await supabase
      .from('profiles')
      .insert(profileRow)
      .select()
      .single();

    if (insertError) {
      console.error('Insert error', { insertError, status, statusText, profileRow });
      alert(`Failed to save your registration. (${insertError.message || insertError?.details || 'unknown error'})`);

      // cleanup uploaded file if needed
      try {
        await supabase.storage.from('receipts').remove([fileName]);
      } catch (cleanupErr) {
        console.warn('Failed to cleanup uploaded file after insert error', cleanupErr);
      }
      return;
    }

    // success
    setUserData(insertedData);
    setIsRegistered(true);
    console.info('Registration saved', insertedData);
  } catch (err) {
    console.error('Unexpected error in handleRegister', err);
    alert('An unexpected error occurred during registration. Check console for details.');
  }
};


  const handleVerify = async (userId: string) => {
    if (userData?.role !== 'admin') return alert("Permission denied.");

    try {
      const { error } = await supabase.from('profiles').update({ status: 'verified' }).eq('id', userId);

      if (error) {
        alert(`Failed to verify user ${userId}.`);
      } else {
        setAllUsers(users => users.map(user => user.id === userId ? { ...user, status: 'verified' } : user));
        alert(`User ${userId} has been verified. A confirmation email simulation has been triggered.`);
      }
    } catch (err) {
      console.error('handleVerify error', err);
      alert(`Failed to verify user ${userId}.`);
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
      <Header
  isRegistered={isRegistered}
  isLoggedIn={!!session}
  onLogout={handleLogout}
  isAdminView={isAdminView}
  onAdminClick={() => setIsAdminView(true)}
/>
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
