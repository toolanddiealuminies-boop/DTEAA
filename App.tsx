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
    specialization: '',
    profilePhoto: '',
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
  const [showVerificationNotification, setShowVerificationNotification] = useState(false);

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
        personal: {
          ...(data.personal ?? {
            firstName: '',
            lastName: '',
            passOutYear: '',
            dob: '',
            bloodGroup: '',
            email: '',
            altEmail: '',
            highestQualification: '',
            specialization: '',
            profilePhoto: '',
          }),
          // Override with the profile_photo URL from the database if it exists
          profilePhoto: data.profile_photo || data.personal?.profilePhoto || '',
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
    let profileSubscription: any = null;

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

    // Setup real-time profile updates subscription
    const setupProfileSubscription = (userId: string) => {
      try {
        profileSubscription = supabase
          .channel('profile-changes')
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'profiles',
              filter: `id=eq.${userId}`
            },
            (payload) => {
              if (!mounted) return;
              console.log('Profile updated:', payload);
              
              // Update userData with the new data
              const newData = payload.new;
              if (newData) {
                const mapped: UserData = {
                  id: newData.id,
                  role: newData.role || 'user',
                  alumniId: newData.alumni_id || '',
                  status: newData.status || 'pending',
                  paymentReceipt: newData.payment_receipt || '',
                  personal: {
                    ...(newData.personal ?? {
                      firstName: '',
                      lastName: '',
                      passOutYear: '',
                      dob: '',
                      bloodGroup: '',
                      email: '',
                      altEmail: '',
                      highestQualification: '',
                      specialization: '',
                      profilePhoto: '',
                    }),
                    profilePhoto: newData.profile_photo || newData.personal?.profilePhoto || '',
                  },
                  contact: newData.contact ?? {
                    address: '',
                    city: '',
                    state: '',
                    pincode: '',
                    country: '',
                    mobile: '',
                    telephone: '',
                  },
                  experience: newData.experience ?? {
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
                
                // Show notification if status changed to verified
                if (newData.status === 'verified' && userData?.status !== 'verified') {
                  setShowVerificationNotification(true);
                  // Auto-hide notification after 5 seconds
                  setTimeout(() => {
                    setShowVerificationNotification(false);
                  }, 5000);
                }
              }
            }
          )
          .subscribe();
      } catch (err) {
        console.error('Profile subscription failed', err);
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
              // Setup real-time subscription for this user
              setupProfileSubscription(s.user.id);
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
              // Setup real-time subscription for this user
              setupProfileSubscription(user.id);
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
          // Setup real-time subscription for this user
          setupProfileSubscription(s.user.id);
        } else {
          // sign-out
          setUserData(null);
          setIsRegistered(false);
          setIsAdminView(false);
          // Clean up profile subscription
          if (profileSubscription) {
            try {
              supabase.removeChannel(profileSubscription);
              profileSubscription = null;
            } catch (e) {
              console.warn('Failed to cleanup profile subscription:', e);
            }
          }
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
      
      // Clean up profile subscription
      if (profileSubscription) {
        try {
          supabase.removeChannel(profileSubscription);
        } catch (e) {
          console.warn('Failed to cleanup profile subscription:', e);
        }
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
    console.log('=== REGISTRATION STARTED ===');
    console.log('User ID:', session?.user?.id);
    console.log('User Email:', session?.user?.email);
    console.log('Receipt File:', receiptFile?.name, receiptFile?.size, 'bytes');
    
    if (!session?.user) {
      console.error('REGISTRATION FAILED: No session user');
      return alert("You must be logged in to register.");
    }
    
    if (!registrationFormData.personal.passOutYear) {
      console.error('REGISTRATION FAILED: Missing pass out year');
      alert("Year of Pass Out is required to generate an ID.");
      setCurrentStep(1);
      return;
    }

    console.log('Registration Form Data:', JSON.stringify({
      personal: {
        ...registrationFormData.personal,
        profilePhoto: registrationFormData.personal.profilePhoto ? '[BASE64_DATA]' : 'none'
      },
      contact: registrationFormData.contact,
      experience: {
        ...registrationFormData.experience,
        employee: registrationFormData.experience.employee.length + ' entries',
        entrepreneur: registrationFormData.experience.entrepreneur.length + ' entries'
      }
    }, null, 2));

    try {
    let profilePhotoUrl = '';
    
    // Upload profile photo if exists
    if (registrationFormData.personal.profilePhoto && registrationFormData.personal.profilePhoto.startsWith('data:')) {
      console.log('>>> Step 1: Uploading profile photo...');
      try {
        // Convert base64 to blob
        const response = await fetch(registrationFormData.personal.profilePhoto);
        const blob = await response.blob();
        console.log('Profile photo blob size:', blob.size, 'bytes, type:', blob.type);
        
        // Upload to Supabase storage
        const photoFileName = `${session.user.id}/profile_${Date.now()}.jpg`;
        console.log('Uploading to photos bucket:', photoFileName);
        
        const { error: photoUploadError } = await supabase.storage
          .from('photos')
          .upload(photoFileName, blob, {
            contentType: 'image/jpeg',
            upsert: true
          });
        
        if (photoUploadError) {
          console.error('PHOTO UPLOAD FAILED:', {
            error: photoUploadError,
            message: photoUploadError.message,
            statusCode: (photoUploadError as any).statusCode,
            details: JSON.stringify(photoUploadError)
          });
          // Don't fail the registration, just warn
        } else {
          // Get public URL for the uploaded photo
          const { data: photoUrlData } = supabase.storage.from('photos').getPublicUrl(photoFileName);
          profilePhotoUrl = photoUrlData?.publicUrl || '';
          console.log('✓ Profile photo uploaded successfully:', profilePhotoUrl);
        }
      } catch (error) {
        console.error('PHOTO PROCESSING ERROR:', error);
        // Don't fail registration for photo upload issues
      }
    } else {
      console.log('>>> Step 1: No profile photo to upload');
    }

    // upload receipt
    console.log('>>> Step 2: Uploading payment receipt...');
    const fileExt = receiptFile.name.split('.').pop();
    const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
    console.log('Receipt file name:', fileName, 'extension:', fileExt);
    
    const { error: uploadError } = await supabase.storage.from('receipts').upload(fileName, receiptFile);

    if (uploadError) {
      console.error('RECEIPT UPLOAD FAILED:', {
        error: uploadError,
        message: uploadError.message,
        statusCode: (uploadError as any).statusCode,
        fileName: fileName,
        fileSize: receiptFile.size,
        details: JSON.stringify(uploadError)
      });
      alert('Failed to upload payment receipt. Please try again.');
      return;
    }

    console.log('✓ Receipt uploaded successfully');
    
    // Use public url (works if bucket is public)
    const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(fileName);
    const publicUrl = urlData?.publicUrl || '';
    console.log('Receipt public URL:', publicUrl);

    const year = registrationFormData.personal.passOutYear;
    console.log('>>> Step 3: Validating year and generating Alumni ID...');
    console.log('Pass out year:', year);
    
    if (!/^\d{4}$/.test(year)) {
      console.error('INVALID YEAR FORMAT:', year);
      alert('Invalid pass out year.');
      return;
    }

    // Helper to compute next sequential number for the year using database function
    const computeNextAlumniId = async (): Promise<string> => {
      console.log('═══════════════════════════════════════');
      console.log('🔍 COMPUTING NEXT ALUMNI ID');
      console.log('Year:', year);
      console.log('═══════════════════════════════════════');
      
      // Call the database function that bypasses RLS to get the next ID
      const { data, error } = await supabase.rpc('get_next_alumni_id', {
        pass_out_year: year
      });

      if (error) {
        console.error('❌ Error calling get_next_alumni_id function:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        console.log('⚠️ Using fallback ID: DTEAA-' + year + '-0001');
        // Fallback to basic sequential if function fails
        return `DTEAA-${year}-0001`;
      }

      const nextId = data as string;
      console.log('✅ Database function returned:', nextId);
      console.log('═══════════════════════════════════════');
      return nextId;
    };

    // Try inserting with retry in case of unique constraint conflict
    console.log('>>> Step 4: Inserting profile into database...');
    const MAX_ATTEMPTS = 15;
    let attempt = 0;
    let insertedData: any = null;
    
    while (attempt < MAX_ATTEMPTS) {
      attempt += 1;
      console.log('\n');
      console.log('╔══════════════════════════════════════════════╗');
      console.log(`║  DATABASE INSERT ATTEMPT #${attempt}/${MAX_ATTEMPTS}               ║`);
      console.log('╚══════════════════════════════════════════════╝');
      
      // Get the next sequential alumni ID from database function
      // The function handles finding the correct next ID even on retries
      const alumniId = await computeNextAlumniId();
      
      console.log('\n🎯 ATTEMPTING INSERT WITH:');
      console.log('   Alumni ID:', alumniId);
      console.log('   User ID:', session.user.id);
      console.log('   Email:', session.user.email);

      // Prepare row to insert (use snake_case columns to match DB)
      // IMPORTANT: enforce the current authenticated uid here to satisfy RLS
      const profileRow = {
        id: session.user.id,
        alumni_id: alumniId,
        payment_receipt: publicUrl,
        profile_photo: profilePhotoUrl,
        personal: {
          ...registrationFormData.personal,
          profilePhoto: profilePhotoUrl // Update the personal object with the URL
        },
        contact: registrationFormData.contact,
        experience: registrationFormData.experience
      };

      console.log('Inserting profile row:', {
        id: profileRow.id,
        alumni_id: profileRow.alumni_id,
        payment_receipt: profileRow.payment_receipt ? 'URL_PROVIDED' : 'NO_URL',
        profile_photo: profileRow.profile_photo ? 'URL_PROVIDED' : 'NO_URL',
        personal_fields: Object.keys(profileRow.personal),
        contact_fields: Object.keys(profileRow.contact),
        experience_summary: {
          employee_count: profileRow.experience.employee.length,
          entrepreneur_count: profileRow.experience.entrepreneur.length,
          isOpenToWork: profileRow.experience.isOpenToWork
        }
      });

      console.log('\n📤 Sending insert request to database...');
      
      const { data: insertRes, error: insertError } = await supabase
        .from('profiles')
        .insert(profileRow)
        .select()
        .single();

      if (insertError) {
        console.log('\n❌ INSERT FAILED');
        // If conflict on unique alumni_id, retry (someone else might have created the same id just now)
        const msg = (insertError as any).message || JSON.stringify(insertError);
        
        console.error(`DATABASE INSERT FAILED - Attempt #${attempt}:`, {
          error: insertError,
          errorCode: insertError.code,
          errorMessage: insertError.message,
          errorDetails: (insertError as any).details,
          errorHint: (insertError as any).hint,
          statusCode: (insertError as any).statusCode,
          fullError: JSON.stringify(insertError, null, 2)
        });

        // detect unique constraint violation (Postgres unique violation)
        // error code for unique constraint is usually "23505" for Postgres; supabase-js error shape may vary
        const isUniqueConflict = insertError.code === '23505' || /unique/i.test(msg) || /already exists/i.test(msg);
        
        if (isUniqueConflict && attempt < MAX_ATTEMPTS) {
          console.log('\n⚠️ UNIQUE CONSTRAINT VIOLATION');
          console.log('The alumni_id', profileRow.alumni_id, 'already exists in the database');
          console.log(`Waiting ${200 * attempt}ms before retry...`);
          console.log('Will regenerate a fresh alumni_id on next attempt...');
          // brief wait then retry
          await new Promise(r => setTimeout(r, 200 * attempt));
          continue;
        } else {
          console.error('REGISTRATION FAILED - Final error after all attempts or non-retryable error');
          console.error('Error type:', isUniqueConflict ? 'UNIQUE_CONSTRAINT' : 'OTHER');
          console.error('Possible causes:');
          console.error('1. RLS (Row Level Security) policy blocking insert');
          console.error('2. Missing required columns in database');
          console.error('3. Data type mismatch');
          console.error('4. User does not have INSERT permission');
          console.error('5. Database constraint violation');
          
          alert(`Failed to save your registration. Error: ${insertError.message || 'Unknown error'}. Please contact support with this error code: ${insertError.code || 'NO_CODE'}`);
          
          // cleanup uploaded file if desired
          try {
            console.log('Cleaning up uploaded receipt...');
            await supabase.storage.from('receipts').remove([fileName]);
            console.log('✓ Receipt cleanup successful');
          } catch (e) {
            console.error('Receipt cleanup failed:', e);
          }
          return;
        }
      }

      if (insertRes) {
        console.log('\n🎉 SUCCESS! Profile inserted successfully!');
        console.log('═══════════════════════════════════════');
        console.log('📋 FINAL INSERTED DATA:');
        console.log('   User ID:', insertRes.id);
        console.log('   Alumni ID:', insertRes.alumni_id);
        console.log('   Status:', insertRes.status);
        console.log('   Email:', insertRes.personal?.email || 'N/A');
        console.log('═══════════════════════════════════════');
        insertedData = insertRes;
        break;
      }
    }

    if (insertedData) {
      console.log('>>> Step 5: Finalizing registration...');
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
      console.log('✓✓✓ REGISTRATION COMPLETED SUCCESSFULLY! ✓✓✓');
      console.log('Alumni ID:', mapped.alumniId);
      console.log('Status:', mapped.status);
      console.log('=== END OF REGISTRATION ===');
    } else {
      console.error('REGISTRATION FAILED: No data inserted after all attempts');
      console.error('This should not happen - check the retry logic');
      alert('Failed to save your registration after multiple attempts. Please try again or contact support.');
      // cleanup uploaded file
      try {
        console.log('Cleaning up uploaded receipt...');
        await supabase.storage.from('receipts').remove([fileName]);
        console.log('✓ Receipt cleanup successful');
      } catch (e) {
        console.error('Receipt cleanup failed:', e);
      }
      console.log('=== END OF REGISTRATION (FAILED) ===');
    }
    } catch (unexpectedError: any) {
      console.error('!!! UNEXPECTED ERROR DURING REGISTRATION !!!');
      console.error('Error type:', typeof unexpectedError);
      console.error('Error name:', unexpectedError?.name);
      console.error('Error message:', unexpectedError?.message);
      console.error('Error stack:', unexpectedError?.stack);
      console.error('Full error object:', unexpectedError);
      
      alert(`An unexpected error occurred during registration: ${unexpectedError?.message || 'Unknown error'}. Please check the console for details and contact support.`);
      console.log('=== END OF REGISTRATION (UNEXPECTED ERROR) ===');
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
      
      {/* Verification Notification */}
      {showVerificationNotification && (
        <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
          <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold">Congratulations! 🎉</p>
              <p className="text-sm">You have been verified. Your ID card is now available!</p>
            </div>
            <button 
              onClick={() => setShowVerificationNotification(false)}
              className="ml-4 text-white hover:text-gray-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
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
