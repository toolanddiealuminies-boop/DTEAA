import React from 'react';

export interface EmployeeExperience {
  id: string;
  companyName: string;
  designation: string;
  startDate: string;
  endDate: string;
  isCurrentEmployer: boolean;
  city: string;
  state: string;
  country: string;
}

export interface EntrepreneurExperience {
  id: string;
  companyName: string;
  natureOfBusiness: string;
  city: string;
  state: string;
  country: string;
}

export interface OpenToWorkDetails {
  technicalSkills: string;
  certifications: string;
  softSkills: string;
  other: string;
}

export interface PrivacySettings {
  showEmail: boolean;
  showPhone: boolean;
  showCompany: boolean;
  showLocation: boolean;
}

export interface UserData {
  id: string; // Corresponds to Supabase auth.users.id
  role: 'user' | 'admin';
  alumniId: string;
  status: 'pending' | 'verified' | 'rejected';
  rejectionComments?: string; // Comments explaining why the registration was rejected
  paymentReceipt: string; // Stores the public URL from Supabase Storage
  personal: {
    firstName: string;
    lastName: string;
    passOutYear: string;
    dob: string;
    bloodGroup: string;
    email: string;
    altEmail: string;
    highestQualification: string;
    specialization: string;
    profilePhoto: string; // Base64 encoded image data
  };
  contact: {
    presentAddress: {
      city: string;
      state: string;
      pincode: string;
      country: string;
    };
    permanentAddress: {
      city: string;
      state: string;
      pincode: string;
      country: string;
    };
    sameAsPresentAddress: boolean;
    mobile: string;
    telephone: string;
  };
  experience: {
    employee: EmployeeExperience[];
    entrepreneur: EntrepreneurExperience[];
    isOpenToWork: boolean;
    openToWorkDetails: OpenToWorkDetails;
  };
  privacy: PrivacySettings;
}
