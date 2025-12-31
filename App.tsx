// src/App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import LoginPage from './components/LoginPage';
import RegistrationForm from './components/RegistrationForm';
import ProfilePage from './components/ProfilePage';
import Layout from './components/Layout'; // <--- Changed from Header
import AdminDashboard from './components/AdminDashboard';
import { Dashboard } from './components/dashboard';
import { supabase } from './lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import type { UserData } from './types';
import HomePage from './components/home/HomePage';
import GalleryPage from './components/GalleryPage';
import AboutPage from './components/AboutPage';
import ConfirmationModal from './components/ConfirmationModal';

const initialUserData: UserData = {
  id: '',
  role: 'user',
  alumniId: '',
  status: 'pending',
  paymentReceipt: '',
  privacy: {
    showEmail: true,
    showPhone: false,
    showCompany: false,
    showLocation: false,
  },
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
    presentAddress: {
      city: '',
      state: '',
      pincode: '',
      country: '',
    },
    permanentAddress: {
      city: '',
      state: '',
      pincode: '',
      country: '',
    },
    sameAsPresentAddress: false,
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
  const [showLogin, setShowLogin] = useState(false); // New state for Home Page vs Login
  const [showGallery, setShowGallery] = useState(false); // Gallery page state
  const [showAbout, setShowAbout] = useState(false); // About page state

  // fetch profile by user id and update local state (normalized schema)
  const fetchUserProfile = async (userId: string) => {
    // Fetch from all normalized tables
    const [profileRes, personalRes, contactRes, employeeRes, entrepreneurRes, openToWorkRes, privacyRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('personal_details').select('*').eq('user_id', userId).single(),
      supabase.from('contact_details').select('*').eq('user_id', userId).single(),
      supabase.from('employee_experiences').select('*').eq('user_id', userId),
      supabase.from('entrepreneur_experiences').select('*').eq('user_id', userId),
      supabase.from('open_to_work_details').select('*').eq('user_id', userId).single(),
      supabase.from('privacy_settings').select('*').eq('user_id', userId).single(),
    ]);

    const profile = profileRes.data;
    const personal = personalRes.data;
    const contact = contactRes.data;
    const employees = employeeRes.data || [];
    const entrepreneurs = entrepreneurRes.data || [];
    const openToWork = openToWorkRes.data;
    const privacy = privacyRes.data;

    if (profileRes.error && profileRes.error.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileRes.error);
    }

    if (profile) {
      // Map DB (snake_case) fields to frontend camelCase shape expected by the app
      const mapped: UserData = {
        id: profile.id,
        role: (profile.role as any) || 'user',
        alumniId: profile.alumni_id || '',
        status: profile.status || 'pending',
        rejectionComments: profile.rejection_comments || '',
        paymentReceipt: profile.payment_receipt || '',
        personal: {
          firstName: personal?.first_name || '',
          lastName: personal?.last_name || '',
          passOutYear: personal?.pass_out_year || '',
          dob: personal?.dob || '',
          bloodGroup: personal?.blood_group || '',
          email: personal?.email || '',
          altEmail: personal?.alt_email || '',
          highestQualification: personal?.highest_qualification || '',
          specialization: personal?.specialization || '',
          profilePhoto: profile.profile_photo || '',
        },
        contact: {
          presentAddress: {
            city: contact?.present_city || '',
            state: contact?.present_state || '',
            pincode: contact?.present_pincode || '',
            country: contact?.present_country || '',
          },
          permanentAddress: {
            city: contact?.permanent_city || '',
            state: contact?.permanent_state || '',
            pincode: contact?.permanent_pincode || '',
            country: contact?.permanent_country || '',
          },
          sameAsPresentAddress: contact?.same_as_present_address || false,
          mobile: contact?.mobile || '',
          telephone: contact?.telephone || '',
        },
        experience: {
          employee: employees.map((e: any) => ({
            id: e.id,
            companyName: e.company_name || '',
            designation: e.designation || '',
            startDate: e.start_date || '',
            endDate: e.end_date || '',
            isCurrentEmployer: e.is_current_employer || false,
            city: e.city || '',
            state: e.state || '',
            country: e.country || '',
          })),
          entrepreneur: entrepreneurs.map((e: any) => ({
            id: e.id,
            companyName: e.company_name || '',
            natureOfBusiness: e.nature_of_business || '',
            city: e.city || '',
            state: e.state || '',
            country: e.country || '',
          })),
          isOpenToWork: openToWork?.is_open_to_work || false,
          openToWorkDetails: {
            technicalSkills: openToWork?.technical_skills || '',
            certifications: openToWork?.certifications || '',
            softSkills: openToWork?.soft_skills || '',
            other: openToWork?.other || '',
          },
        },
        privacy: {
          showEmail: privacy?.show_email ?? true,
          showPhone: privacy?.show_phone ?? false,
          showCompany: privacy?.show_company ?? false,
          showLocation: privacy?.show_location ?? false,
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
      // Fetch all profiles
      const { data: profiles, error: profileError } = await supabase.from('profiles').select('*');
      if (profileError) {
        console.error('Error fetching all users:', profileError);
        return;
      }

      if (!profiles || profiles.length === 0) {
        setAllUsers([]);
        return;
      }

      // Fetch related data for all profiles
      const userIds = profiles.map(p => p.id);
      
      const [personalRes, contactRes, employeeRes, entrepreneurRes, openToWorkRes, privacyRes] = await Promise.all([
        supabase.from('personal_details').select('*').in('user_id', userIds),
        supabase.from('contact_details').select('*').in('user_id', userIds),
        supabase.from('employee_experiences').select('*').in('user_id', userIds),
        supabase.from('entrepreneur_experiences').select('*').in('user_id', userIds),
        supabase.from('open_to_work_details').select('*').in('user_id', userIds),
        supabase.from('privacy_settings').select('*').in('user_id', userIds),
      ]);

      // Map data by user_id
      const personalMap = new Map((personalRes.data || []).map(p => [p.user_id, p]));
      const contactMap = new Map((contactRes.data || []).map(c => [c.user_id, c]));
      const privacyMap = new Map((privacyRes.data || []).map(p => [p.user_id, p]));
      const openToWorkMap = new Map((openToWorkRes.data || []).map(o => [o.user_id, o]));
      
      const employeeMap = new Map<string, any[]>();
      (employeeRes.data || []).forEach(e => {
        if (!employeeMap.has(e.user_id)) employeeMap.set(e.user_id, []);
        employeeMap.get(e.user_id)!.push(e);
      });
      const entrepreneurMap = new Map<string, any[]>();
      (entrepreneurRes.data || []).forEach(e => {
        if (!entrepreneurMap.has(e.user_id)) entrepreneurMap.set(e.user_id, []);
        entrepreneurMap.get(e.user_id)!.push(e);
      });

      // Combine into UserData objects
      const usersData: UserData[] = profiles.map(profile => {
        const personal = personalMap.get(profile.id);
        const contact = contactMap.get(profile.id);
        const privacy = privacyMap.get(profile.id);
        const openToWork = openToWorkMap.get(profile.id);
        const employees = employeeMap.get(profile.id) || [];
        const entrepreneurs = entrepreneurMap.get(profile.id) || [];

        return {
          id: profile.id,
          role: profile.role || 'user',
          alumniId: profile.alumni_id || '',
          status: profile.status || 'pending',
          rejectionComments: profile.rejection_comments || '',
          paymentReceipt: profile.payment_receipt || '',
          personal: {
            firstName: personal?.first_name || '',
            lastName: personal?.last_name || '',
            passOutYear: personal?.pass_out_year || '',
            dob: personal?.dob || '',
            bloodGroup: personal?.blood_group || '',
            email: personal?.email || '',
            altEmail: personal?.alt_email || '',
            highestQualification: personal?.highest_qualification || '',
            specialization: personal?.specialization || '',
            profilePhoto: profile.profile_photo || '',
          },
          contact: {
            presentAddress: {
              city: contact?.present_city || '',
              state: contact?.present_state || '',
              pincode: contact?.present_pincode || '',
              country: contact?.present_country || '',
            },
            permanentAddress: {
              city: contact?.permanent_city || '',
              state: contact?.permanent_state || '',
              pincode: contact?.permanent_pincode || '',
              country: contact?.permanent_country || '',
            },
            sameAsPresentAddress: contact?.same_as_present_address || false,
            mobile: contact?.mobile || '',
            telephone: contact?.telephone || '',
          },
          experience: {
            employee: employees.map((e: any) => ({
              id: e.id,
              companyName: e.company_name || '',
              designation: e.designation || '',
              startDate: e.start_date || '',
              endDate: e.end_date || '',
              isCurrentEmployer: e.is_current_employer || false,
              city: e.city || '',
              state: e.state || '',
              country: e.country || '',
            })),
            entrepreneur: entrepreneurs.map((e: any) => ({
              id: e.id,
              companyName: e.company_name || '',
              natureOfBusiness: e.nature_of_business || '',
              city: e.city || '',
              state: e.state || '',
              country: e.country || '',
            })),
            isOpenToWork: openToWork?.is_open_to_work || false,
            openToWorkDetails: {
              technicalSkills: openToWork?.technical_skills || '',
              certifications: openToWork?.certifications || '',
              softSkills: openToWork?.soft_skills || '',
              other: openToWork?.other || '',
            },
          },
          privacy: {
            showEmail: privacy?.show_email ?? true,
            showPhone: privacy?.show_phone ?? false,
            showCompany: privacy?.show_company ?? false,
            showLocation: privacy?.show_location ?? false,
          },
        };
      });

      setAllUsers(usersData);
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
                  rejectionComments: newData.rejection_comments || '',
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
                  privacy: newData.privacy ?? {
                    showEmail: true,
                    showPhone: false,
                    showCompany: false,
                    showLocation: false,
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
  const handleRegister = async (receiptFile: File | null) => {
    console.log('=== REGISTRATION STARTED ===');
    console.log('User ID:', session?.user?.id);
    console.log('User Email:', session?.user?.email);
    console.log('Receipt File:', receiptFile ? `${receiptFile.name} (${receiptFile.size} bytes)` : 'SKIPPED (Alumni Meet)');

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
      let publicUrl = '';
      if (receiptFile) {
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
        publicUrl = urlData?.publicUrl || '';
      } else {
        console.log('>>> Step 2: Skipping payment receipt upload (Alumni Meet Registration)');
        publicUrl = 'ALUMNI_MEET_REGISTRATION';
      }
      console.log('Receipt public URL:', publicUrl);

      const year = registrationFormData.personal.passOutYear;
      console.log('>>> Step 3: Validating year and checking if user exists...');
      console.log('Pass out year:', year);

      if (!/^\d{4}$/.test(year)) {
        console.error('INVALID YEAR FORMAT:', year);
        alert('Invalid pass out year.');
        return;
      }

      // Check if user already exists (e.g., rejected user resubmitting)
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id, alumni_id, status, profile_photo')
        .eq('id', session.user.id)
        .single();

      const isResubmission = existingProfile && existingProfile.status === 'rejected';
      console.log('User exists:', !!existingProfile, 'Status:', existingProfile?.status);
      console.log('Existing profile photo:', existingProfile?.profile_photo);
      console.log('Is resubmission:', isResubmission);

      // If resubmitting without a new photo, preserve the existing one
      if (isResubmission && !profilePhotoUrl && existingProfile.profile_photo) {
        profilePhotoUrl = existingProfile.profile_photo;
        console.log('Preserving existing profile photo:', profilePhotoUrl);
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
      console.log('>>> Step 4: Inserting profile into normalized tables...');
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
        const alumniId = isResubmission ? existingProfile.alumni_id : await computeNextAlumniId();

        console.log('\n🎯 ATTEMPTING DATABASE OPERATION WITH:');
        console.log('   Alumni ID:', alumniId);
        console.log('   User ID:', session.user.id);
        console.log('   Email:', session.user.email);
        console.log('   Is resubmission:', isResubmission);

        console.log(`\n📤 Sending ${isResubmission ? 'UPDATE' : 'INSERT'} request to normalized tables...`);

        try {
          // Step 1: Insert/Update profiles table
          const profileRow = {
            id: session.user.id,
            alumni_id: alumniId,
            payment_receipt: publicUrl,
            profile_photo: profilePhotoUrl,
            status: 'pending',
            rejection_comments: null,
          };

          let profileRes, profileError;
          if (isResubmission) {
            const { data, error } = await supabase
              .from('profiles')
              .update(profileRow)
              .eq('id', session.user.id)
              .select()
              .single();
            profileRes = data;
            profileError = error;
          } else {
            const { data, error } = await supabase
              .from('profiles')
              .insert(profileRow)
              .select()
              .single();
            profileRes = data;
            profileError = error;
          }

          if (profileError) {
            const msg = (profileError as any).message || JSON.stringify(profileError);
            const isUniqueConflict = profileError.code === '23505' || /unique/i.test(msg) || /already exists/i.test(msg);
            
            if (isUniqueConflict && !isResubmission && attempt < MAX_ATTEMPTS) {
              console.log('\n⚠️ UNIQUE CONSTRAINT VIOLATION on profiles');
              await new Promise(r => setTimeout(r, 200 * attempt));
              continue;
            }
            throw profileError;
          }

          console.log('✓ Profiles table updated');

          // Step 2: Insert/Update personal_details table
          const personalRow = {
            user_id: session.user.id,
            alumni_id: alumniId,
            first_name: registrationFormData.personal.firstName,
            last_name: registrationFormData.personal.lastName,
            pass_out_year: registrationFormData.personal.passOutYear,
            dob: registrationFormData.personal.dob || null,
            blood_group: registrationFormData.personal.bloodGroup,
            email: registrationFormData.personal.email,
            alt_email: registrationFormData.personal.altEmail,
            highest_qualification: registrationFormData.personal.highestQualification,
            specialization: registrationFormData.personal.specialization,
          };

          if (isResubmission) {
            await supabase.from('personal_details').update(personalRow).eq('user_id', session.user.id);
          } else {
            await supabase.from('personal_details').insert(personalRow);
          }
          console.log('✓ Personal details table updated');

          // Step 3: Insert/Update contact_details table
          const contactRow = {
            user_id: session.user.id,
            alumni_id: alumniId,
            present_city: registrationFormData.contact.presentAddress.city,
            present_state: registrationFormData.contact.presentAddress.state,
            present_pincode: registrationFormData.contact.presentAddress.pincode,
            present_country: registrationFormData.contact.presentAddress.country,
            permanent_city: registrationFormData.contact.permanentAddress.city,
            permanent_state: registrationFormData.contact.permanentAddress.state,
            permanent_pincode: registrationFormData.contact.permanentAddress.pincode,
            permanent_country: registrationFormData.contact.permanentAddress.country,
            same_as_present_address: registrationFormData.contact.sameAsPresentAddress,
            mobile: registrationFormData.contact.mobile,
            telephone: registrationFormData.contact.telephone,
          };

          if (isResubmission) {
            await supabase.from('contact_details').update(contactRow).eq('user_id', session.user.id);
          } else {
            await supabase.from('contact_details').insert(contactRow);
          }
          console.log('✓ Contact details table updated');

          // Step 4: Handle employee_experiences (delete old and insert new for resubmission)
          if (isResubmission) {
            await supabase.from('employee_experiences').delete().eq('user_id', session.user.id);
          }
          if (registrationFormData.experience.employee.length > 0) {
            const employeeRows = registrationFormData.experience.employee.map(emp => ({
              user_id: session.user.id,
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
          console.log('✓ Employee experiences table updated');

          // Step 5: Handle entrepreneur_experiences (delete old and insert new for resubmission)
          if (isResubmission) {
            await supabase.from('entrepreneur_experiences').delete().eq('user_id', session.user.id);
          }
          if (registrationFormData.experience.entrepreneur.length > 0) {
            const entrepreneurRows = registrationFormData.experience.entrepreneur.map(ent => ({
              user_id: session.user.id,
              alumni_id: alumniId,
              company_name: ent.companyName,
              nature_of_business: ent.natureOfBusiness,
              city: ent.city,
              state: ent.state,
              country: ent.country,
            }));
            await supabase.from('entrepreneur_experiences').insert(entrepreneurRows);
          }
          console.log('✓ Entrepreneur experiences table updated');

          // Step 6: Insert/Update open_to_work_details table
          const openToWorkRow = {
            user_id: session.user.id,
            alumni_id: alumniId,
            is_open_to_work: registrationFormData.experience.isOpenToWork,
            technical_skills: registrationFormData.experience.openToWorkDetails.technicalSkills,
            certifications: registrationFormData.experience.openToWorkDetails.certifications,
            soft_skills: registrationFormData.experience.openToWorkDetails.softSkills,
            other: registrationFormData.experience.openToWorkDetails.other,
          };

          if (isResubmission) {
            await supabase.from('open_to_work_details').update(openToWorkRow).eq('user_id', session.user.id);
          } else {
            await supabase.from('open_to_work_details').insert(openToWorkRow);
          }
          console.log('✓ Open to work details table updated');

          // Step 7: Insert/Update privacy_settings table
          const privacyRow = {
            user_id: session.user.id,
            alumni_id: alumniId,
            show_email: true,
            show_phone: false,
            show_company: false,
            show_location: false,
          };

          if (isResubmission) {
            await supabase.from('privacy_settings').update(privacyRow).eq('user_id', session.user.id);
          } else {
            await supabase.from('privacy_settings').insert(privacyRow);
          }
          console.log('✓ Privacy settings table updated');

          // All tables updated successfully
          console.log('\n🎉 SUCCESS! All normalized tables updated!');
          console.log('═══════════════════════════════════════');
          console.log('📋 FINAL INSERTED DATA:');
          console.log('   User ID:', profileRes.id);
          console.log('   Alumni ID:', profileRes.alumni_id);
          console.log('   Status:', profileRes.status);
          console.log('   Email:', registrationFormData.personal.email);
          console.log('═══════════════════════════════════════');
          
          insertedData = {
            ...profileRes,
            personal: registrationFormData.personal,
            contact: registrationFormData.contact,
            experience: registrationFormData.experience,
          };
          break;

        } catch (insertError: any) {
          console.log(`\n❌ ${isResubmission ? 'UPDATE' : 'INSERT'} FAILED`);
          console.error(`DATABASE OPERATION FAILED - Attempt #${attempt}:`, insertError);

          const isFKViolation = insertError.code === '23503';

          if (isFKViolation) {
            console.error('CRITICAL: Foreign key violation.');
            alert('Your session has expired or is invalid. Please log in again.');
            await supabase.auth.signOut();
            window.location.reload();
            return;
          }

          if (attempt >= MAX_ATTEMPTS) {
            alert(`Failed to save your registration. Error: ${insertError.message || 'Unknown error'}. Please contact support with this error code: ${insertError.code || 'NO_CODE'}`);
            return;
          }

          // Brief wait then retry
          await new Promise(r => setTimeout(r, 200 * attempt));
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
          personal: {
            ...registrationFormData.personal,
            profilePhoto: profilePhotoUrl,
          },
          contact: registrationFormData.contact,
          experience: registrationFormData.experience,
          privacy: {
            showEmail: true,
            showPhone: false,
            showCompany: false,
            showLocation: false,
          },
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
          if (receiptFile) {
            console.warn('Skipping receipt cleanup due to scope limitations (cleanup after final failure).');
          }
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

  const handleReject = async (userId: string, comments: string) => {
    if (userData?.role !== 'admin') return alert("Permission denied.");

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          status: 'rejected',
          rejection_comments: comments
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Reject update error', error);
        alert(`Failed to reject user ${userId}. (${error.message || error.details || 'unknown error'})`);
        return;
      }

      // Refresh the list so AdminDashboard sees latest data
      await fetchAllUsers();

      alert(`User ${userId} has been rejected. They will see your comments when they log in.`);
    } catch (err) {
      console.error('handleReject error', err);
      alert(`Failed to reject user ${userId}.`);
    }
  };

  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  // Determine if user is in registration flow (logged in but not registered)
  const isRegistration = !!session && !isRegistered;

  // Modified logout handler
  const handleLogoutClick = () => {
    if (isRegistration) {
      setShowLogoutConfirmation(true);
    } else {
      handleLogout();
    }
  };

  const confirmLogout = async () => {
    setShowLogoutConfirmation(false);
    await handleLogout();
  };

  const renderContent = () => {
    if (loading) return <div className="text-center p-12 text-lg font-medium text-light-text-secondary dark:text-dark-text-secondary">Loading session...</div>;
    if (isAdminView) return <AdminDashboard users={allUsers} onVerify={handleVerify} onReject={handleReject} />;

    // If not logged in, show LoginPage (which is wrapped by the main layout when showLogin is true)
    if (!session && showLogin) return <LoginPage onBack={() => setShowLogin(false)} />;

    // If user registration was rejected, show them the payment page with rejection comments
    if (isRegistered && userData?.status === 'rejected') {
      return (
        <RegistrationForm
          userData={userData}
          setUserData={setUserData}
          currentStep={5} // Go directly to payment step
          setCurrentStep={setCurrentStep}
          onRegister={handleRegister}
        />
      );
    }

    if (!isRegistered && session) {
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

    // if (session && isRegistered && userData?.status === 'pending') {
    //   // Profile Page for pending users (waiting for admin approval)
    //   return <ProfilePage userData={userData!} />;
    // }

    // Default fallback: Home Page (if not logged in and not showing login)
    return <HomePage onLoginClick={() => setShowLogin(true)} onViewGallery={() => setShowGallery(true)} onViewAbout={() => setShowAbout(true)} />;
  };

  // If showing Gallery page
  if (showGallery) {
    return <GalleryPage onBack={() => setShowGallery(false)} onViewAbout={() => { setShowGallery(false); setShowAbout(true); }} onLoginClick={() => { setShowGallery(false); setShowLogin(true); }} />;
  }

  // If showing About page
  if (showAbout) {
    return <AboutPage onBack={() => setShowAbout(false)} onViewGallery={() => { setShowAbout(false); setShowGallery(true); }} onLoginClick={() => { setShowAbout(false); setShowLogin(true); }} />;
  }

  // If user is verified OR PENDING, render Dashboard outside of Layout (it has its own navbar)
  if (session && isRegistered && (userData?.status === 'verified' || userData?.status === 'pending') && !isAdminView) {
    return (
      <>
        {/* Logout Confirmation Modal */}
        <ConfirmationModal
          isOpen={showLogoutConfirmation}
          title="Logout Confirmation"
          message="Are you sure you want to logout?"
          confirmText="Logout"
          cancelText="Cancel"
          onConfirm={confirmLogout}
          onCancel={() => setShowLogoutConfirmation(false)}
        />
        <Dashboard userData={userData!} onLogout={handleLogoutClick} />
      </>
    );
  }

  return (
    <Layout
      onLoginClick={() => setShowLogin(true)}
      isLoggedIn={!!session}
      isAdmin={userData?.role === 'admin'}
      onLogout={handleLogoutClick}
      userName={userData?.personal?.firstName}
      onAdminClick={() => setIsAdminView(true)}
      onHomeClick={() => {
        setShowLogin(false);
        setIsAdminView(false);
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      isLoginPage={!session && showLogin}
      isRegistrationPage={isRegistration}
      onViewGallery={() => setShowGallery(true)}
      onViewAbout={() => setShowAbout(true)}
    >
      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutConfirmation}
        title="Incomplete Registration"
        message="Do you want to continue the registration process?"
        confirmText="No"
        cancelText="Yes"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirmation(false)}
      />

      {/* Verification Notification */}
      {showVerificationNotification && (
        <div className="fixed top-24 right-4 z-50 animate-slide-in-right">
          <div className="bg-success-light text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3">
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

      {/* Global Page Header/Title - only show if NOT on Home Page as Hero suffices there */}
      {(!session && !showLogin && !loading) ? null : (
        <header className="text-center mb-10 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#E7A700] to-[#CF9500] pb-2 font-heading">
            Dindigul Tool Engineering
          </h1>
          <h2 className="text-2xl sm:text-3xl font-semibold text-light-text-primary dark:text-dark-text-primary mt-1 font-heading">
            Alumni Association
          </h2>
        </header>
      )}

      <div className="w-full">
        {renderContent()}
      </div>
    </Layout>
  );
};

export default App;
