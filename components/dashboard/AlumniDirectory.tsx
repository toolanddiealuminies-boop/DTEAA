import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, MapPin, Building2, GraduationCap, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import type { UserData, PrivacySettings } from '../../types';

interface AlumniMember {
  id: string;
  personal: UserData['personal'];
  contact: UserData['contact'];
  experience: UserData['experience'];
  privacy: PrivacySettings;
  status: string;
}


const defaultPrivacy: PrivacySettings = {
  showEmail: true,
  showPhone: false,
  showCompany: false,
  showLocation: false,
};

const calculateProfileCompleteness = (member: AlumniMember): number => {
  let filled = 0;
  const total = 17;
  
  if (member.personal.firstName) filled++;
  if (member.personal.lastName) filled++;
  if (member.personal.passOutYear) filled++;
  if (member.personal.dob) filled++;
  if (member.personal.bloodGroup) filled++;
  if (member.personal.highestQualification) filled++;
  if (member.personal.email) filled++;
  if (member.personal.profilePhoto) filled++;
  if (member.personal.specialization) filled++;
  if (member.personal.altEmail) filled++;
  if (member.contact.mobile) filled++;
  if (member.contact.presentAddress?.city) filled++;
  if (member.contact.presentAddress?.state) filled++;
  if (member.contact.presentAddress?.country) filled++;
  if (member.contact.presentAddress?.pincode) filled++;
  if (member.contact.telephone) filled++;
  if (member.experience.employee.length > 0 || member.experience.entrepreneur.length > 0) filled++;
  
  return Math.round((filled / total) * 100);
};

const getCompletenessLabel = (percentage: number): { label: string; color: string } => {
  if (percentage === 100) return { label: 'Complete profile', color: 'text-green-600' };
  if (percentage >= 70) return { label: 'Good profile', color: 'text-green-600' };
  if (percentage >= 50) return { label: 'Incomplete profile', color: 'text-yellow-600' };
  return { label: 'Complete profile', color: 'text-orange-500' };
};

const getCurrentCompany = (member: AlumniMember): { company: string; designation: string } | null => {
  const currentJob = member.experience.employee.find(e => e.isCurrentEmployer);
  if (currentJob) {
    return { company: currentJob.companyName, designation: currentJob.designation };
  }
  if (member.experience.employee.length > 0) {
    const latest = member.experience.employee[member.experience.employee.length - 1];
    return { company: latest.companyName, designation: latest.designation };
  }
  if (member.experience.entrepreneur.length > 0) {
    const latest = member.experience.entrepreneur[member.experience.entrepreneur.length - 1];
    return { company: latest.companyName, designation: 'Entrepreneur' };
  }
  return null;
};

const AlumniCard: React.FC<{ member: AlumniMember; onViewProfile: (id: string) => void }> = ({ member, onViewProfile }) => {
  const privacy = member.privacy || defaultPrivacy;
  const completeness = calculateProfileCompleteness(member);
  const { label: completenessLabel, color: completenessColor } = getCompletenessLabel(completeness);
  const currentCompany = getCurrentCompany(member);
  const location = member.contact.presentAddress?.city && member.contact.presentAddress?.country
    ? `${member.contact.presentAddress.city}, ${member.contact.presentAddress.country}`
    : null;

  const initials = `${member.personal.firstName?.[0] || ''}${member.personal.lastName?.[0] || ''}`.toUpperCase();
  const randomColor = useMemo(() => {
    const colors = ['bg-primary', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
    return colors[member.id.charCodeAt(0) % colors.length];
  }, [member.id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-light-border p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-4">
        {member.personal.profilePhoto ? (
          <div className="relative">
            <img
              src={member.personal.profilePhoto}
              alt={`${member.personal.firstName} ${member.personal.lastName}`}
              className="w-14 h-14 rounded-full object-cover border-2 border-light-border"
            />
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
          </div>
        ) : (
          <div className="relative">
            <div className={`w-14 h-14 rounded-full ${randomColor} flex items-center justify-center text-white font-bold text-lg`}>
              {initials}
            </div>
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-light-text-primary truncate">
            {member.personal.firstName} {member.personal.lastName}
          </h3>
          
          {privacy.showCompany && currentCompany && (
            <p className="text-sm text-light-text-secondary flex items-center gap-1 mt-0.5">
              <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">
                <span className="text-primary font-medium">{currentCompany.designation}</span>
                {currentCompany.company && <span> at {currentCompany.company}</span>}
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm text-light-text-secondary">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-primary flex-shrink-0" />
          <span>Batch of {member.personal.passOutYear}</span>
        </div>
        
        {privacy.showLocation && location && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
            <span>{location}</span>
          </div>
        )}
      </div>

      <p className={`mt-3 text-sm font-medium ${completenessColor}`}>
        {completenessLabel}
      </p>

      <button
        onClick={() => onViewProfile(member.id)}
        className="mt-4 w-full py-2.5 px-4 border border-light-border rounded-lg text-sm font-medium text-light-text-primary hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
      >
        View Profile
        <ChevronRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
};


interface AlumniDirectoryProps {
  currentUserId: string;
  onViewProfile: (userId: string) => void;
}

const AlumniDirectory: React.FC<AlumniDirectoryProps> = ({ currentUserId, onViewProfile }) => {
  const [members, setMembers] = useState<AlumniMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      // Fetch all verified profiles from normalized tables
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, alumni_id, profile_photo, status')
        .eq('status', 'verified');

      if (profileError) {
        console.error('Error fetching profiles:', profileError);
        setMembers([]);
        return;
      }

      if (!profiles || profiles.length === 0) {
        setMembers([]);
        return;
      }

      // Fetch related data for all verified profiles
      const userIds = profiles.map(p => p.id);
      
      const [personalRes, contactRes, employeeRes, entrepreneurRes, openToWorkRes, privacyRes] = await Promise.all([
        supabase.from('personal_details').select('*').in('user_id', userIds),
        supabase.from('contact_details').select('*').in('user_id', userIds),
        supabase.from('employee_experiences').select('*').in('user_id', userIds),
        supabase.from('entrepreneur_experiences').select('*').in('user_id', userIds),
        supabase.from('open_to_work_details').select('*').in('user_id', userIds),
        supabase.from('privacy_settings').select('*').in('user_id', userIds),
      ]);

      // Map data by user_id for quick lookup
      const personalMap = new Map((personalRes.data || []).map(p => [p.user_id, p]));
      const contactMap = new Map((contactRes.data || []).map(c => [c.user_id, c]));
      const privacyMap = new Map((privacyRes.data || []).map(p => [p.user_id, p]));
      const openToWorkMap = new Map((openToWorkRes.data || []).map(o => [o.user_id, o]));
      
      // Group experiences by user_id
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

      // Combine into member objects
      const membersData = profiles.map(profile => {
        const personal = personalMap.get(profile.id);
        const contact = contactMap.get(profile.id);
        const privacy = privacyMap.get(profile.id);
        const openToWork = openToWorkMap.get(profile.id);
        const employees = employeeMap.get(profile.id) || [];
        const entrepreneurs = entrepreneurMap.get(profile.id) || [];

        return {
          id: profile.id,
          status: profile.status,
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

      // Filter out current user from display (but keep for testing if alone)
      const otherMembers = membersData.filter(m => m.id !== currentUserId);
      
      // If no other members, show current user's profile as demo
      setMembers(otherMembers.length > 0 ? otherMembers : membersData);
    } catch (err) {
      console.error('Fetch error:', err);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const fullName = `${member.personal.firstName} ${member.personal.lastName}`.toLowerCase();
        const company = getCurrentCompany(member)?.company?.toLowerCase() || '';
        if (!fullName.includes(query) && !company.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [members, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-light-text-primary">Alumni Directory</h1>
            <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-sm font-medium rounded-full">
              {members.length} members
            </span>
          </div>
          <p className="text-sm text-light-text-secondary">
            Find and connect with fellow alumni from your institution
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-text-secondary" />
        <input
          type="text"
          placeholder="Search alumni..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-light-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Content */}
      <div>
        {/* Results count */}
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-light-text-secondary" />
          <span className="text-sm text-light-text-secondary">
            {filteredMembers.length}+ alumni
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl border border-light-border p-5 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-gray-200"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="bg-white rounded-xl border border-light-border p-8 text-center">
            <Users className="w-12 h-12 text-light-text-secondary mx-auto mb-3" />
            <h3 className="font-semibold text-light-text-primary mb-1">No alumni found</h3>
            <p className="text-sm text-light-text-secondary">
              {searchQuery ? 'Try adjusting your search' : 'No other verified alumni yet. Be the first to invite your batchmates!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {filteredMembers.map(member => (
                <AlumniCard
                  key={member.id}
                  member={member}
                  onViewProfile={onViewProfile}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlumniDirectory;
