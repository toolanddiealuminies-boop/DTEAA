import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Card, ProgressBar, Button } from '../ui';
import type { UserData } from '../../types';

interface ProfileCompletenessCardProps {
  userData: UserData;
  onCompleteProfile: () => void;
}

interface ProfileField {
  name: string;
  label: string;
  required: boolean;
  getValue: (data: UserData) => any;
}

const profileFields: ProfileField[] = [
  // Personal - Required
  { name: 'firstName', label: 'First Name', required: true, getValue: (d) => d.personal.firstName },
  { name: 'lastName', label: 'Last Name', required: true, getValue: (d) => d.personal.lastName },
  { name: 'passOutYear', label: 'Year of Pass Out', required: true, getValue: (d) => d.personal.passOutYear },
  { name: 'dob', label: 'Date of Birth', required: true, getValue: (d) => d.personal.dob },
  { name: 'bloodGroup', label: 'Blood Group', required: true, getValue: (d) => d.personal.bloodGroup },
  { name: 'highestQualification', label: 'Highest Qualification', required: true, getValue: (d) => d.personal.highestQualification },
  { name: 'email', label: 'Email', required: true, getValue: (d) => d.personal.email },
  // Personal - Optional
  { name: 'profilePhoto', label: 'Profile Photo', required: false, getValue: (d) => d.personal.profilePhoto },
  { name: 'specialization', label: 'Specialization', required: false, getValue: (d) => d.personal.specialization },
  { name: 'altEmail', label: 'Alternate Email', required: false, getValue: (d) => d.personal.altEmail },
  // Contact - Required
  { name: 'mobile', label: 'Mobile Number', required: true, getValue: (d) => d.contact.mobile },
  { name: 'presentCity', label: 'City', required: true, getValue: (d) => d.contact.presentAddress?.city },
  { name: 'presentState', label: 'State', required: true, getValue: (d) => d.contact.presentAddress?.state },
  { name: 'presentCountry', label: 'Country', required: true, getValue: (d) => d.contact.presentAddress?.country },
  { name: 'presentPincode', label: 'Pincode', required: true, getValue: (d) => d.contact.presentAddress?.pincode },
  // Contact - Optional
  { name: 'telephone', label: 'Telephone', required: false, getValue: (d) => d.contact.telephone },
  // Experience - Optional
  { name: 'experience', label: 'Work Experience', required: false, getValue: (d) => d.experience.employee.length > 0 || d.experience.entrepreneur.length > 0 },
];

const calculateProfileCompleteness = (userData: UserData): { 
  percentage: number; 
  missingRequired: string[]; 
  missingOptional: string[];
  filledCount: number;
  totalCount: number;
} => {
  const missingRequired: string[] = [];
  const missingOptional: string[] = [];
  let filledCount = 0;

  profileFields.forEach((field) => {
    const value = field.getValue(userData);
    const isFilled = value && (typeof value === 'boolean' ? value : String(value).trim() !== '');
    
    if (isFilled) {
      filledCount++;
    } else if (field.required) {
      missingRequired.push(field.label);
    } else {
      missingOptional.push(field.label);
    }
  });

  const percentage = Math.round((filledCount / profileFields.length) * 100);
  return { percentage, missingRequired, missingOptional, filledCount, totalCount: profileFields.length };
};

const ProfileCompletenessCard: React.FC<ProfileCompletenessCardProps> = ({
  userData,
  onCompleteProfile,
}) => {
  const { percentage, missingRequired, missingOptional, filledCount, totalCount } = calculateProfileCompleteness(userData);
  const isComplete = percentage === 100;
  const totalMissing = missingRequired.length + missingOptional.length;

  return (
    <Card highlighted className="h-full">
      <div className="flex flex-col h-full">
        <h3 className="text-lg font-bold text-light-text-primary">Profile Completeness</h3>
        <p className="text-sm text-light-text-secondary mt-1">
          {isComplete
            ? 'Great job! Your profile is complete.'
            : 'Complete your profile to get the most out of your membership.'}
        </p>

        <div className="mt-4">
          <ProgressBar value={percentage} size="lg" />
          <p className="text-xs text-light-text-secondary mt-1">
            {filledCount} of {totalCount} fields completed
          </p>
        </div>

        {!isComplete && (
          <div className="mt-3 space-y-2">
            {missingRequired.length > 0 && (
              <div className="flex items-start gap-2 text-sm text-light-text-secondary">
                <AlertCircle className="w-4 h-4 text-warning-light flex-shrink-0 mt-0.5" />
                <span>
                  {missingRequired.length} required {missingRequired.length === 1 ? 'field' : 'fields'} missing
                </span>
              </div>
            )}
            {missingOptional.length > 0 && missingRequired.length === 0 && (
              <div className="flex items-start gap-2 text-sm text-light-text-secondary">
                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>
                  All required fields complete! {missingOptional.length} optional {missingOptional.length === 1 ? 'field' : 'fields'} remaining.
                </span>
              </div>
            )}
          </div>
        )}

        <div className="mt-auto pt-4">
          <Button
            variant="primary"
            fullWidth
            onClick={onCompleteProfile}
          >
            {isComplete ? 'View Profile' : 'Complete Profile'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProfileCompletenessCard;
