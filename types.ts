import React from 'react';

export interface EmployeeExperience {
  id: string;
  companyName: string;
  designation: string;
  startDate: string;
  endDate: string;
  isCurrentEmployer: boolean;
}

export interface EntrepreneurExperience {
  id: string;
  companyName: string;
  natureOfBusiness: string;
  address: string;
  city: string;
  pincode: string;
  state: string;
  country: string;
}

export interface OpenToWorkDetails {
  technicalSkills: string;
  certifications: string;
  softSkills: string;
  other: string;
}

export interface UserData {
  id: string; // Corresponds to Supabase auth.users.id
  role: 'user' | 'admin';
  alumniId: string;
  status: 'pending' | 'verified';
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
    address: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    mobile: string;
    telephone: string;
  };
  experience: {
    employee: EmployeeExperience[];
    entrepreneur: EntrepreneurExperience[];
    isOpenToWork: boolean;
    openToWorkDetails: OpenToWorkDetails;
  };
}
