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
      // Map DB (snake_case) fields to frontend camelCase shape expected by the app
      const mapped: UserData = {
        id: data.id,
        role: (data.role as any) || 'user',
        alumniId: (data.alumni_id ?? (data.alumniId as any)) || '',
        status: data.status || 'pending',
        paymentReceipt: data.payment_receipt ?? (data.paymentReceipt as any) ?? '',
        personal: data.personal ?? {
          firstName: '',
          lastName: '',
          passOutYear: '',
          dob: '',
          bloodGroup: '',
          email: '',
          altEmail: '',
          highestQualification: '',
        },
        contact: data.contact ?? {
          address: '',
          city: '',
          state: '',
          pincode: '',
          country: '',
          mobile: '',
          telephone: '',
        },
        experience: data.experience ?? {
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

      setUserData(mapped);
      setRegistrationFormData(mapped);
      setIsRegistered(true);
    } else {
      setIsRegistered(false);
      setRegistrationFormData(prev => ({
        ...initialUserData,
        id: session?.user.id || '',
        personal: {
          ...initialUserData.personal,
          email: session?.user?.email || '',
          firstName: (session?.user?.user_metadata?.full_name || '').split(' ')[0] || '',
          lastName: (session?.user?.user_metadata?.full_name || '').split(' ').slice(1).join(' ') || '',
        }
      }));
    }
  };

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

  // Keep registrationFormData in sync with the authenticated session user
  useEffect(() => {
    if (session?.user) {
      setRegistrationFormData(prev => ({
        ...prev,
        id: session.user.id,
        personal: {
          ...prev.personal,
          email: session.user.email || prev.personal.email,
          firstName: (session.user.user_metadata?.full_name || '').split(' ')[0] || prev.personal.firstName,
          lastName: (session.user.user_metadata?.full_name || '').split(' ').slice(1).join(' ') || prev.personal.lastName,
        }
      }));

      // Clear any stale persisted form state to avoid inserting old ids
      try {
        localStorage.removeItem('alumniForm');
      } catch (e) {
        // ignore
      }
    }
  }, [session?.user?.id]);

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
    if (!session?.user) return alert("You must be logged in to register.");
    if (!registrationFormData.personal.passOutYear) {
      alert("Year of Pass Out is required to generate an ID.");
      setCurrentStep(1);
      return;
    }

    // upload receipt
    const fileExt = receiptFile.name.split('.').pop();
    const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('receipts').upload(fileName, receiptFile);

    if (uploadError) {
      alert('Failed to upload payment receipt. Please try again.');
      return;
    }

    // Use public url (works if bucket is public)
    const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(fileName);
    const publicUrl = urlData?.publicUrl || '';

    const year = registrationFormData.personal.passOutYear;
    if (!/^\d{4}$/.test(year)) {
      alert('Invalid pass out year.');
      return;
    }

    // Helper to compute next sequential number for the year
    const computeNextAlumniId = async (): Promise<string> => {
      // Find the latest alumni_id for this year
      const likePattern = `DTEAA-${year}-%`;
      const res = await supabase
        .from('profiles')
        .select('alumni_id')
        .ilike('alumni_id', likePattern)
        .order('alumni_id', { ascending: false })
        .limit(1);

      if (res.error) {
        console.warn('Error finding latest alumni_id:', res.error);
        return `DTEAA-${year}-0001`;
      }

      const row = res.data && res.data[0];
      if (!row || !row.alumni_id) {
        return `DTEAA-${year}-0001`;
      }

      // parse last 4 digits and increment
      const parts = row.alumni_id.split('-');
      const last = parts[parts.length - 1];
      const num = parseInt(last, 10);
      const next = Number.isFinite(num) ? num + 1 : 1;
      return `DTEAA-${year}-${String(next).padStart(4, '0')}`;
    };

    // Try inserting with retry in case of unique constraint conflict
    const MAX_ATTEMPTS = 5;
    let attempt = 0;
    let insertedData: any = null;
    while (attempt < MAX_ATTEMPTS) {
      attempt += 1;
      const alumniId = await computeNextAlumniId();

      // Prepare row to insert (use snake_case columns to match DB)
      // IMPORTANT: enforce the current authenticated uid here to satisfy RLS
      const profileRow = {
        id: session.user.id,
        alumni_id: alumniId,
        payment_receipt: publicUrl,
        personal: registrationFormData.personal,
        contact: registrationFormData.contact,
        experience: registrationFormData.experience
      };

      const { data: insertRes, error: insertError } = await supabase
        .from('profiles')
        .insert(profileRow)
        .select()
        .single();

      if (insertError) {
        // If conflict on unique alumni_id, retry (someone else might have created the same id just now)
        const msg = (insertError as any).message || JSON.stringify(insertError);
        console.warn(`Insert attempt #${attempt} failed: ${msg}`);

        // detect unique constraint violation (Postgres unique violation)
        // error code for unique constraint is usually "23505" for Postgres; supabase-js error shape may vary
        const isUniqueConflict = insertError.code === '23505' || /unique/i.test(msg) || /already exists/i.test(msg);
        if (isUniqueConflict && attempt < MAX_ATTEMPTS) {
          // brief wait then retry
          await new Promise(r => setTimeout(r, 200 * attempt));
          continue;
        } else {
          alert('Failed to save your registration. Please try again later.');
          // cleanup uploaded file if desired
          try {
            await supabase.storage.from('receipts').remove([fileName]);
          } catch (e) { /* ignore */ }
          return;
        }
      }

      if (insertRes) {
        insertedData = insertRes;
        break;
      }
    }

    if (insertedData) {
      // Map DB fields to frontend expected shape (same as fetchUserProfile)
      const mapped: UserData = {
        id: insertedData.id,
        role: insertedData.role ?? 'user',
        alumniId: insertedData.alumni_id ?? '',
        status: insertedData.status ?? 'pending',
        paymentReceipt: insertedData.payment_receipt ?? '',
        personal: insertedData.personal ?? registrationFormData.personal,
        contact: insertedData.contact ?? registrationFormData.contact,
        experience: insertedData.experience ?? registrationFormData.experience
      };

      setUserData(mapped);
      setIsRegistered(true);
    } else {
      alert('Failed to save your registration after multiple attempts. Please try again.');
      // cleanup uploaded file
      try {
        await supabase.storage.from('receipts').remove([fileName]);
      } catch (e) { /* ignore */ }
    }
  };

  // inside App.tsx
  const handleVerify = async (userId: string) => {
    if (userData?.role !== 'admin') return alert("Permission denied.");

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ status: 'verified' })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Verify update error', error);
        alert(`Failed to verify user ${userId}. (${error.message || error.details || 'unknown error'})`);
        return;
      }

      // Refresh the list so AdminDashboard sees latest data
      await fetchAllUsers();

      // Optionally: you could trigger an email or notification here (server-side)
      alert(`User ${userId} marked as verified.`);
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
      
      <div className="flex flex-col items-center p-4 sm:p-6 lg:p-8 pt-24 font-sans min-h-screen">
        <div className="w-full max-w-4xl mx-auto mt-8">
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
