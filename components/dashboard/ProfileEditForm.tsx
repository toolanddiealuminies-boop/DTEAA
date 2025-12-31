import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, X } from 'lucide-react';
import type { UserData, EmployeeExperience, EntrepreneurExperience, OpenToWorkDetails, PrivacySettings } from '../../types';
import { supabase } from '../../lib/supabaseClient';
import ProfilePhotoUpload from '../ProfilePhotoUpload';
import { Country, State, City } from 'country-state-city';
import { Button } from '../ui';

type FormErrors = {
  personal?: Partial<Record<keyof UserData['personal'], string>>;
  contact?: Partial<Record<keyof UserData['contact'], string>> | {
    presentAddress?: Partial<Record<keyof UserData['contact']['presentAddress'], string>>;
    permanentAddress?: Partial<Record<keyof UserData['contact']['permanentAddress'], string>>;
    mobile?: string;
    telephone?: string;
    sameAsPresentAddress?: string;
  };
  experience?: any;
};

interface ProfileEditFormProps {
  userData: UserData;
  onSave: (updatedData: UserData) => Promise<void>;
  onCancel: () => void;
}

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; optional?: boolean; error?: string }> = ({ label, id, optional, error, ...props }) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isDate = props.type === 'date';

  const handleDateFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (isDate) {
      e.target.showPicker?.();
    }
    props.onFocus?.(e);
  };

  return (
    <div className="relative pb-5">
      <label htmlFor={id} className="block text-sm font-medium text-light-text-secondary mb-1">
        {label} {optional && <span className="text-xs text-light-text-secondary/60">(Optional)</span>}
      </label>
      <input
        id={id}
        ref={inputRef}
        className={`w-full px-3 py-2 text-light-text-primary bg-light-bg border ${error ? 'border-red-500' : 'border-light-border'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${isDate && !props.value ? 'text-gray-400' : ''}`}
        {...props}
        onFocus={handleDateFocus}
      />
      {error && <p className="mt-1 text-xs text-red-500 absolute bottom-0">{error}</p>}
    </div>
  );
};

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: React.ReactNode; optional?: boolean; error?: string }> = ({ label, id, children, optional, error, ...props }) => (
  <div className="relative pb-5">
    <label htmlFor={id} className="block text-sm font-medium text-light-text-secondary mb-1">
      {label} {optional && <span className="text-xs text-light-text-secondary/60">(Optional)</span>}
    </label>
    <select
      id={id}
      className={`w-full px-3 py-2 text-light-text-primary bg-light-bg border ${error ? 'border-red-500' : 'border-light-border'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200`}
      {...props}
    >
      {children}
    </select>
    {error && <p className="mt-1 text-xs text-red-500 absolute bottom-0">{error}</p>}
  </div>
);

const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; optional?: boolean; error?: string }> = ({ label, id, optional, error, ...props }) => (
  <div className="relative pb-5">
    <label htmlFor={id} className="block text-sm font-medium text-light-text-secondary mb-1">
      {label} {optional && <span className="text-xs text-light-text-secondary/60">(Optional)</span>}
    </label>
    <textarea
      id={id}
      rows={3}
      className={`w-full px-3 py-2 text-light-text-primary bg-light-bg border ${error ? 'border-red-500' : 'border-light-border'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200`}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-500 absolute bottom-0">{error}</p>}
  </div>
);

const Checkbox: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; description?: string }> = ({ label, id, description, ...props }) => (
  <div className="flex items-start">
    <div className="flex items-center h-5">
      <input
        id={id}
        type="checkbox"
        className="focus:ring-primary h-4 w-4 text-primary border-light-border rounded"
        {...props}
      />
    </div>
    <div className="ml-3 text-sm">
      <label htmlFor={id} className="font-medium text-light-text-primary">{label}</label>
      {description && <p className="text-light-text-secondary">{description}</p>}
    </div>
  </div>
);

const Toggle: React.FC<{ label: string; description?: string; checked: boolean; onChange: (checked: boolean) => void }> = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between py-4 border-b border-light-border last:border-b-0">
    <div>
      <p className="font-medium text-light-text-primary">{label}</p>
      {description && <p className="text-sm text-light-text-secondary">{description}</p>}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${checked ? 'bg-primary' : 'bg-gray-200'}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  </div>
);

const AddressSelects: React.FC<{
  addressType: 'presentAddress' | 'permanentAddress';
  formData: UserData;
  setFormData: React.Dispatch<React.SetStateAction<UserData>>;
  errors: FormErrors;
  disabled?: boolean;
}> = ({ addressType, formData, setFormData, errors, disabled }) => {
  const selectedCountry = formData.contact[addressType]?.country || '';
  const selectedState = formData.contact[addressType]?.state || '';
  const selectedCity = formData.contact[addressType]?.city || '';

  const countryCode = useMemo(() => {
    return Country.getAllCountries().find((c) => c.name === selectedCountry)?.isoCode || '';
  }, [selectedCountry]);

  const stateCode = useMemo(() => {
    if (!countryCode) return '';
    return State.getStatesOfCountry(countryCode).find((s) => s.name === selectedState)?.isoCode || '';
  }, [countryCode, selectedState]);

  const countries = useMemo(() => Country.getAllCountries(), []);
  const states = useMemo(() => (countryCode ? State.getStatesOfCountry(countryCode) : []), [countryCode]);
  const cities = useMemo(() => (stateCode ? City.getCitiesOfState(countryCode, stateCode) : []), [countryCode, stateCode]);

  const handleChange = (field: 'country' | 'state' | 'city', value: string) => {
    setFormData((prev) => {
      const newState = { ...prev };
      if (!newState.contact[addressType]) {
        (newState.contact[addressType] as any) = {};
      }
      (newState.contact[addressType] as any)[field] = value;
      if (field === 'country') {
        (newState.contact[addressType] as any).state = '';
        (newState.contact[addressType] as any).city = '';
      } else if (field === 'state') {
        (newState.contact[addressType] as any).city = '';
      }
      return newState;
    });
  };

  return (
    <>
      <Select
        label="Country"
        id={`${addressType}Country`}
        value={selectedCountry}
        onChange={(e) => handleChange('country', e.target.value)}
        disabled={disabled}
        error={(errors.contact as any)?.[addressType]?.country}
      >
        <option value="">Select Country</option>
        {countries.map((c) => (
          <option key={c.isoCode} value={c.name}>{c.name}</option>
        ))}
      </Select>
      <Select
        label="State"
        id={`${addressType}State`}
        value={selectedState}
        onChange={(e) => handleChange('state', e.target.value)}
        disabled={disabled || !countryCode}
        error={(errors.contact as any)?.[addressType]?.state}
      >
        <option value="">Select State</option>
        {states.map((s) => (
          <option key={s.isoCode} value={s.name}>{s.name}</option>
        ))}
      </Select>
      <Select
        label="City"
        id={`${addressType}City`}
        value={selectedCity}
        onChange={(e) => handleChange('city', e.target.value)}
        disabled={disabled || !stateCode}
        error={(errors.contact as any)?.[addressType]?.city}
      >
        <option value="">Select City</option>
        {cities.map((c) => (
          <option key={c.name} value={c.name}>{c.name}</option>
        ))}
      </Select>
    </>
  );
};

const ExperienceAddressSelects: React.FC<{
  experienceType: 'employee' | 'entrepreneur';
  index: number;
  formData: UserData;
  setFormData: React.Dispatch<React.SetStateAction<UserData>>;
}> = ({ experienceType, index, formData, setFormData }) => {
  const experience = formData.experience[experienceType][index];
  const selectedCountry = experience?.country || '';
  const selectedState = experience?.state || '';
  const selectedCity = experience?.city || '';

  const countryCode = useMemo(() => {
    return Country.getAllCountries().find((c) => c.name === selectedCountry)?.isoCode || '';
  }, [selectedCountry]);

  const stateCode = useMemo(() => {
    if (!countryCode) return '';
    return State.getStatesOfCountry(countryCode).find((s) => s.name === selectedState)?.isoCode || '';
  }, [countryCode, selectedState]);

  const countries = useMemo(() => Country.getAllCountries(), []);
  const states = useMemo(() => (countryCode ? State.getStatesOfCountry(countryCode) : []), [countryCode]);
  const cities = useMemo(() => (stateCode ? City.getCitiesOfState(countryCode, stateCode) : []), [countryCode, stateCode]);

  const handleChange = (field: 'country' | 'state' | 'city', value: string) => {
    setFormData((prev) => {
      const newState = { ...prev };
      const expArray = [...newState.experience[experienceType]];
      expArray[index] = { ...expArray[index], [field]: value };
      if (field === 'country') {
        expArray[index].state = '';
        expArray[index].city = '';
      } else if (field === 'state') {
        expArray[index].city = '';
      }
      newState.experience[experienceType] = expArray as any;
      return newState;
    });
  };

  return (
    <>
      <Select
        label="Country"
        id={`${experienceType}${index}Country`}
        value={selectedCountry}
        onChange={(e) => handleChange('country', e.target.value)}
      >
        <option value="">Select Country</option>
        {countries.map((c) => (
          <option key={c.isoCode} value={c.name}>{c.name}</option>
        ))}
      </Select>
      <Select
        label="State"
        id={`${experienceType}${index}State`}
        value={selectedState}
        onChange={(e) => handleChange('state', e.target.value)}
        disabled={!countryCode}
      >
        <option value="">Select State</option>
        {states.map((s) => (
          <option key={s.isoCode} value={s.name}>{s.name}</option>
        ))}
      </Select>
      <Select
        label="City"
        id={`${experienceType}${index}City`}
        value={selectedCity}
        onChange={(e) => handleChange('city', e.target.value)}
        disabled={!stateCode}
      >
        <option value="">Select City</option>
        {cities.map((c) => (
          <option key={c.name} value={c.name}>{c.name}</option>
        ))}
      </Select>
    </>
  );
};

const Stepper: React.FC<{ currentStep: number; steps: string[] }> = ({ currentStep, steps }) => {
  return (
    <div className="mb-8">
      <div className="hidden md:block">
        <ol className="flex items-center w-full">
          {steps.map((step, index) => (
            <li
              key={step}
              className={`flex w-full items-center ${index < steps.length - 1 ? "after:content-[''] after:w-full after:h-1 after:border-b after:border-4 after:inline-block" : ''} ${index < currentStep ? 'text-primary after:border-primary' : index === currentStep ? 'text-primary after:border-gray-200' : 'text-gray-400 after:border-gray-200'}`}
            >
              <span className={`flex items-center justify-center w-10 h-10 rounded-full lg:h-12 lg:w-12 shrink-0 ${index < currentStep ? 'bg-primary' : index === currentStep ? 'bg-primary ring-4 ring-primary/30' : 'bg-gray-200'}`}>
                <span className={`font-bold ${index <= currentStep ? 'text-white' : 'text-gray-600'}`}>{index + 1}</span>
              </span>
            </li>
          ))}
        </ol>
        <div className="flex justify-between mt-2 text-sm font-medium text-gray-600">
          {steps.map((step, index) => (
            <span key={index} className={`text-center ${index === currentStep ? 'text-primary font-bold' : ''}`} style={{ flexBasis: `${100 / steps.length}%` }}>
              {step}
            </span>
          ))}
        </div>
      </div>
      <div className="md:hidden flex flex-col items-center justify-center space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-100">
        <div className="flex items-center space-x-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-bold ring-4 ring-primary/30">
            {currentStep + 1}
          </span>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Step {currentStep + 1} of {steps.length}</span>
            <span className="text-lg font-bold text-primary">{steps[currentStep]}</span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}></div>
        </div>
      </div>
    </div>
  );
};

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ userData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<UserData>({ ...userData });
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [showSpecialization, setShowSpecialization] = useState(!!userData.personal.highestQualification);

  const steps = ['Personal', 'Contact', 'Experience', 'Privacy', 'Review'];

  // Initialize privacy settings with defaults if not present
  React.useEffect(() => {
    if (!formData.privacy) {
      setFormData(prev => ({
        ...prev,
        privacy: {
          showEmail: true,
          showPhone: false,
          showCompany: false,
          showLocation: false,
        }
      }));
    }
  }, []);

  const handlePrivacyChange = (field: keyof PrivacySettings) => (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [field]: checked,
      }
    }));
  };

  const validateField = useCallback((section: keyof UserData, field: string, value: any, allData: UserData = formData): string => {
    const requiredMsg = 'This field is required.';
    switch (`${section}.${field}`) {
      case 'personal.firstName': return value ? '' : requiredMsg;
      case 'personal.lastName': return value ? '' : requiredMsg;
      case 'personal.passOutYear':
        if (!value) return requiredMsg;
        if (!/^\d{4}$/.test(value) || parseInt(value, 10) > new Date().getFullYear() || parseInt(value, 10) < 1950) {
          return 'Please enter a valid 4-digit year.';
        }
        return '';
      case 'personal.dob': return value ? '' : requiredMsg;
      case 'personal.bloodGroup': return value ? '' : requiredMsg;
      case 'personal.highestQualification': return value ? '' : requiredMsg;
      case 'personal.altEmail':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Please enter a valid email address.';
        }
        return '';
      case 'contact.presentAddress.city': return value ? '' : requiredMsg;
      case 'contact.presentAddress.state': return value ? '' : requiredMsg;
      case 'contact.presentAddress.country': return value ? '' : requiredMsg;
      case 'contact.presentAddress.pincode':
        if (!value) return requiredMsg;
        if (!/^\d{4,6}$/.test(value)) return 'Please enter a valid 4, 5 or 6 digit pincode.';
        return '';
      case 'contact.permanentAddress.city': return allData.contact.sameAsPresentAddress || value ? '' : requiredMsg;
      case 'contact.permanentAddress.state': return allData.contact.sameAsPresentAddress || value ? '' : requiredMsg;
      case 'contact.permanentAddress.country': return allData.contact.sameAsPresentAddress || value ? '' : requiredMsg;
      case 'contact.permanentAddress.pincode':
        if (allData.contact.sameAsPresentAddress) return '';
        if (!value) return requiredMsg;
        if (!/^\d{4,6}$/.test(value)) return 'Please enter a valid 4, 5 or 6 digit pincode.';
        return '';
      case 'contact.mobile':
        if (!value) return requiredMsg;
        if (!/^\+?\d{10,15}$/.test(value)) return 'Please enter a valid mobile number.';
        return '';
      default: return '';
    }
  }, [formData]);

  const handleChange = (section: keyof UserData, field: string, subfield?: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { value } = e.target;
    setFormData((prev) => {
      let newData: UserData;
      if (subfield) {
        newData = {
          ...prev,
          [section]: {
            ...(prev[section] as any),
            [field]: {
              ...((prev[section] as any)[field] || {}),
              [subfield]: value,
            },
          },
        };
      } else {
        newData = {
          ...prev,
          [section]: {
            ...(prev[section] as any),
            [field]: value,
          },
        };
      }
      const error = validateField(section, subfield ? `${field}.${subfield}` : field, value, newData);
      setErrors((prevErrors) => {
        if (subfield) {
          return {
            ...prevErrors,
            [section]: {
              ...(prevErrors[section] as any),
              [field]: {
                ...((prevErrors[section] as any)?.[field] || {}),
                [subfield]: error,
              },
            },
          };
        } else {
          return {
            ...prevErrors,
            [section]: {
              ...(prevErrors[section] as any),
              [field]: error,
            },
          };
        }
      });
      return newData;
    });
  };

  const handleSameAsPresentAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    setFormData((prev) => {
      if (checked) {
        return {
          ...prev,
          contact: {
            ...prev.contact,
            sameAsPresentAddress: true,
            permanentAddress: { ...prev.contact.presentAddress },
          },
        };
      } else {
        return {
          ...prev,
          contact: {
            ...prev.contact,
            sameAsPresentAddress: false,
          },
        };
      }
    });
    if (checked) {
      setErrors((prev) => ({
        ...prev,
        contact: {
          ...(prev.contact as any),
          permanentAddress: {},
        },
      }));
    }
  };

  const handleExperienceChange = <K extends 'employee' | 'entrepreneur'>(type: K, index: number, field: keyof UserData['experience'][K][number]) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { value, type: inputType, checked } = e.target as HTMLInputElement;
    setFormData((prev) => {
      const newExperience = [...prev.experience[type]];
      newExperience[index] = {
        ...newExperience[index],
        [field]: inputType === 'checkbox' ? checked : value,
      };
      return {
        ...prev,
        experience: {
          ...prev.experience,
          [type]: newExperience,
        },
      };
    });
  };

  const addExperience = (type: 'employee' | 'entrepreneur') => {
    const newExp = type === 'employee'
      ? { id: `${Date.now()}`, companyName: '', designation: '', startDate: '', endDate: '', isCurrentEmployer: false, city: '', state: '', country: '' }
      : { id: `${Date.now()}`, companyName: '', natureOfBusiness: '', city: '', state: '', country: '' };
    setFormData((prev) => ({
      ...prev,
      experience: {
        ...prev.experience,
        [type]: [...prev.experience[type], newExp],
      },
    }));
  };

  const removeExperience = (type: 'employee' | 'entrepreneur', index: number) => {
    setFormData((prev) => ({
      ...prev,
      experience: {
        ...prev.experience,
        [type]: prev.experience[type].filter((_, i) => i !== index),
      },
    }));
  };

  const handleOpenToWorkDetailsChange = (field: keyof OpenToWorkDetails) => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      experience: {
        ...prev.experience,
        openToWorkDetails: {
          ...prev.experience.openToWorkDetails,
          [field]: e.target.value,
        },
      },
    }));
  };

  const prevStep = () => setCurrentStep(Math.max(0, currentStep - 1));

  const nextStep = () => {
    let isValid = true;
    const newErrors: FormErrors = {};

    if (currentStep === 0) {
      const personalErrors: Partial<Record<keyof UserData['personal'], string>> = {};
      (['firstName', 'lastName', 'passOutYear', 'dob', 'bloodGroup', 'highestQualification', 'altEmail'] as Array<keyof UserData['personal']>).forEach((key) => {
        const error = validateField('personal', key, formData.personal[key]);
        if (error) {
          personalErrors[key] = error;
          isValid = false;
        }
      });
      if (!isValid) newErrors.personal = personalErrors;
    } else if (currentStep === 1) {
      const contactErrors: any = { presentAddress: {}, permanentAddress: {} };
      ['city', 'state', 'country', 'pincode'].forEach((field) => {
        const error = validateField('contact', `presentAddress.${field}`, formData.contact.presentAddress?.[field as keyof typeof formData.contact.presentAddress]);
        if (error) {
          contactErrors.presentAddress[field] = error;
          isValid = false;
        }
      });
      if (!formData.contact.sameAsPresentAddress) {
        ['city', 'state', 'country', 'pincode'].forEach((field) => {
          const error = validateField('contact', `permanentAddress.${field}`, formData.contact.permanentAddress?.[field as keyof typeof formData.contact.permanentAddress], formData);
          if (error) {
            contactErrors.permanentAddress[field] = error;
            isValid = false;
          }
        });
      }
      const mobileError = validateField('contact', 'mobile', formData.contact.mobile);
      if (mobileError) {
        contactErrors.mobile = mobileError;
        isValid = false;
      }
      if (!isValid) newErrors.contact = contactErrors;
    }

    setErrors(newErrors);
    if (isValid) {
      setCurrentStep(Math.min(steps.length - 1, currentStep + 1));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <h4 className="text-xl font-semibold text-light-text-primary mb-4">Personal Information</h4>
            <div className="flex justify-center mb-6">
              <ProfilePhotoUpload
                value={formData.personal.profilePhoto}
                onChange={(photoData) => setFormData((prev) => ({
                  ...prev,
                  personal: { ...prev.personal, profilePhoto: photoData },
                }))}
                error={errors.personal?.profilePhoto}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
              <Input label="First Name" id="firstName" value={formData.personal.firstName} onChange={handleChange('personal', 'firstName')} error={errors.personal?.firstName} />
              <Input label="Last Name" id="lastName" value={formData.personal.lastName} onChange={handleChange('personal', 'lastName')} error={errors.personal?.lastName} />
              <Input label="Year of Pass Out" id="passOutYear" type="number" placeholder="YYYY" value={formData.personal.passOutYear} onChange={handleChange('personal', 'passOutYear')} error={errors.personal?.passOutYear} />
              <Input label="Date of Birth" id="dob" type="date" value={formData.personal.dob} onChange={handleChange('personal', 'dob')} error={errors.personal?.dob} />
              <Select label="Blood Group" id="bloodGroup" value={formData.personal.bloodGroup} onChange={handleChange('personal', 'bloodGroup')} error={errors.personal?.bloodGroup}>
                <option value="">Select...</option>
                <option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
              </Select>
              <Select
                label="Highest Qualification"
                id="highestQualification"
                value={formData.personal.highestQualification}
                onChange={(e) => {
                  handleChange('personal', 'highestQualification')(e);
                  setShowSpecialization(!!e.target.value);
                }}
                error={errors.personal?.highestQualification}
              >
                <option value="">Select...</option>
                <option value="B.E">B.E</option>
                <option value="B.Tech">B.Tech</option>
                <option value="M.E">M.E</option>
                <option value="M.Tech">M.Tech</option>
                <option value="PhD">Ph.D</option>
                <option value="DTE">D.T.E</option>
                <option value="DME">D.M.E</option>
                <option value="Other">Other</option>
              </Select>
              {(showSpecialization || formData.personal.highestQualification) && (
                <Input label="Specialization" id="specialization" placeholder="e.g., Computer Science" value={formData.personal.specialization} onChange={handleChange('personal', 'specialization')} optional />
              )}
              <div>
                <Input label="Email Address" id="email" type="email" value={formData.personal.email} disabled />
                <p className="mt-1 text-xs text-gray-500">Email cannot be changed.</p>
              </div>
              <Input label="Alternate Email" id="altEmail" type="email" optional value={formData.personal.altEmail} onChange={handleChange('personal', 'altEmail')} error={errors.personal?.altEmail} />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <h4 className="text-xl font-semibold text-light-text-primary mb-4">Contact Details</h4>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-100 space-y-4">
              <div>
                <h5 className="font-semibold text-primary mb-2">Present Address</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                  <AddressSelects addressType="presentAddress" formData={formData} setFormData={setFormData} errors={errors} />
                  <Input label="Pincode" id="presentPincode" type="text" placeholder="4, 5 or 6 digits" value={formData.contact.presentAddress?.pincode || ''} onChange={handleChange('contact', 'presentAddress', 'pincode')} error={(errors.contact as any)?.presentAddress?.pincode} />
                </div>
              </div>
              <div className="pl-4">
                <Checkbox label="Permanent address is same as present address" id="sameAsPresentAddress" checked={formData.contact.sameAsPresentAddress || false} onChange={handleSameAsPresentAddress} />
              </div>
              <div className="bg-white p-4 rounded-lg border border-light-border">
                <h4 className="font-semibold text-light-text-secondary mb-3">Permanent Address</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                  <AddressSelects addressType="permanentAddress" formData={formData} setFormData={setFormData} errors={errors} disabled={formData.contact.sameAsPresentAddress} />
                  <Input label="Pincode" id="permanentPincode" type="text" placeholder="4, 5 or 6 digits" value={formData.contact.permanentAddress?.pincode || ''} onChange={handleChange('contact', 'permanentAddress', 'pincode')} error={(errors.contact as any)?.permanentAddress?.pincode} disabled={formData.contact.sameAsPresentAddress} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                <Input label="Mobile Number" id="mobile" type="tel" value={formData.contact.mobile || ''} onChange={handleChange('contact', 'mobile')} error={(errors.contact as any)?.mobile} />
                <Input label="Telephone Number" id="telephone" type="tel" optional value={formData.contact.telephone || ''} onChange={handleChange('contact', 'telephone')} />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-8">
            <h3 className="text-xl font-semibold text-light-text-primary">Professional Experience</h3>
            <div>
              <h4 className="font-semibold text-lg text-light-text-secondary mb-2">Employee Experience</h4>
              {formData.experience.employee.map((exp, index) => (
                <div key={exp.id} className="p-4 pt-12 border border-light-border rounded-lg mb-4 space-y-4 relative bg-gray-50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                    <Input label="Company Name" value={exp.companyName} onChange={handleExperienceChange('employee', index, 'companyName')} />
                    <Input label="Designation" value={exp.designation} onChange={handleExperienceChange('employee', index, 'designation')} />
                    <Input label="Start Date" type="date" value={exp.startDate} onChange={handleExperienceChange('employee', index, 'startDate')} />
                    <Input label="End Date" type="date" value={exp.endDate} onChange={handleExperienceChange('employee', index, 'endDate')} disabled={exp.isCurrentEmployer} />
                    <ExperienceAddressSelects experienceType="employee" index={index} formData={formData} setFormData={setFormData} />
                  </div>
                  <Checkbox label="I currently work here" checked={exp.isCurrentEmployer} onChange={handleExperienceChange('employee', index, 'isCurrentEmployer')} />
                  <button type="button" onClick={() => removeExperience('employee', index)} className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 text-sm font-medium text-red-600 hover:text-white hover:bg-red-600 border border-red-600 rounded transition-colors duration-200">
                    <X className="w-4 h-4" /><span>Remove</span>
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => addExperience('employee')} className="text-sm font-medium text-primary hover:text-primary-hover">+ Add Employment</button>
            </div>
            <div>
              <h4 className="font-semibold text-lg text-light-text-secondary mb-2">Entrepreneur Experience</h4>
              {formData.experience.entrepreneur.map((exp, index) => (
                <div key={exp.id} className="p-4 pt-12 border border-light-border rounded-lg mb-4 space-y-4 relative bg-gray-50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                    <Input label="Company Name" value={exp.companyName} onChange={handleExperienceChange('entrepreneur', index, 'companyName')} />
                    <Input label="Nature of Business" value={exp.natureOfBusiness} onChange={handleExperienceChange('entrepreneur', index, 'natureOfBusiness')} />
                    <ExperienceAddressSelects experienceType="entrepreneur" index={index} formData={formData} setFormData={setFormData} />
                  </div>
                  <button type="button" onClick={() => removeExperience('entrepreneur', index)} className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 text-sm font-medium text-red-600 hover:text-white hover:bg-red-600 border border-red-600 rounded transition-colors duration-200">
                    <X className="w-4 h-4" /><span>Remove</span>
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => addExperience('entrepreneur')} className="text-sm font-medium text-primary hover:text-primary-hover">+ Add Business</button>
            </div>
            <div>
              <Checkbox label="I am currently open to work" description="Check this if you are looking for new job opportunities." checked={formData.experience.isOpenToWork} onChange={(e) => setFormData((prev) => ({ ...prev, experience: { ...prev.experience, isOpenToWork: e.target.checked } }))} />
              {formData.experience.isOpenToWork && (
                <div className="mt-4 pl-6 border-l-2 border-primary space-y-4">
                  <TextArea label="Technical Skills" value={formData.experience.openToWorkDetails.technicalSkills} onChange={handleOpenToWorkDetailsChange('technicalSkills')} />
                  <TextArea label="Certifications" value={formData.experience.openToWorkDetails.certifications} onChange={handleOpenToWorkDetailsChange('certifications')} />
                  <TextArea label="Soft Skills" value={formData.experience.openToWorkDetails.softSkills} onChange={handleOpenToWorkDetailsChange('softSkills')} />
                  <TextArea label="Other Information" optional value={formData.experience.openToWorkDetails.other} onChange={handleOpenToWorkDetailsChange('other')} />
                </div>
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-light-text-primary">Privacy Settings</h3>
              <p className="text-sm text-light-text-secondary mt-1">Control who can see your information in the alumni directory</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-light-border">
              <Toggle
                label="Show Email"
                description="Allow other alumni to see your email address"
                checked={formData.privacy?.showEmail ?? true}
                onChange={handlePrivacyChange('showEmail')}
              />
              <Toggle
                label="Show Phone"
                description="Allow other alumni to see your phone number"
                checked={formData.privacy?.showPhone ?? false}
                onChange={handlePrivacyChange('showPhone')}
              />
              <Toggle
                label="Show Company"
                description="Allow other alumni to see your current company/designation"
                checked={formData.privacy?.showCompany ?? false}
                onChange={handlePrivacyChange('showCompany')}
              />
              <Toggle
                label="Show Location"
                description="Allow other alumni to see your city/location"
                checked={formData.privacy?.showLocation ?? false}
                onChange={handlePrivacyChange('showLocation')}
              />
            </div>
            <p className="text-xs text-light-text-secondary">
              Note: Your name, batch year, and profile photo will always be visible in the directory.
            </p>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-light-text-primary">Review Your Information</h3>
            <p className="text-sm text-light-text-secondary mb-4">Please review all the information before saving.</p>
            <section className="bg-white p-4 rounded border border-light-border">
              <h4 className="font-semibold text-light-text-primary mb-3">Personal</h4>
              {formData.personal.profilePhoto && (
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary">
                    <img src={formData.personal.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div><strong className="text-light-text-secondary">Name:</strong> {formData.personal.firstName} {formData.personal.lastName}</div>
                <div><strong className="text-light-text-secondary">Year:</strong> {formData.personal.passOutYear}</div>
                <div><strong className="text-light-text-secondary">DOB:</strong> {formData.personal.dob}</div>
                <div><strong className="text-light-text-secondary">Blood Group:</strong> {formData.personal.bloodGroup}</div>
                <div><strong className="text-light-text-secondary">Qualification:</strong> {formData.personal.highestQualification}</div>
                {formData.personal.specialization && <div><strong className="text-light-text-secondary">Specialization:</strong> {formData.personal.specialization}</div>}
                <div><strong className="text-light-text-secondary">Email:</strong> {formData.personal.email}</div>
                {formData.personal.altEmail && <div><strong className="text-light-text-secondary">Alt Email:</strong> {formData.personal.altEmail}</div>}
              </div>
            </section>
            <section className="bg-white p-4 rounded border border-light-border">
              <h4 className="font-semibold text-light-text-primary mb-3">Contact</h4>
              <div className="text-sm space-y-2">
                <div><strong className="text-light-text-secondary">Present Address:</strong> {[formData.contact.presentAddress?.city, formData.contact.presentAddress?.state, formData.contact.presentAddress?.country].filter(Boolean).join(', ')} - {formData.contact.presentAddress?.pincode}</div>
                <div><strong className="text-light-text-secondary">Permanent Address:</strong> {formData.contact.sameAsPresentAddress ? 'Same as present' : [formData.contact.permanentAddress?.city, formData.contact.permanentAddress?.state, formData.contact.permanentAddress?.country].filter(Boolean).join(', ') + ' - ' + formData.contact.permanentAddress?.pincode}</div>
                <div><strong className="text-light-text-secondary">Mobile:</strong> {formData.contact.mobile}</div>
                {formData.contact.telephone && <div><strong className="text-light-text-secondary">Telephone:</strong> {formData.contact.telephone}</div>}
              </div>
            </section>
            <section className="bg-white p-4 rounded border border-light-border">
              <h4 className="font-semibold text-light-text-primary mb-3">Experience</h4>
              <div className="text-sm space-y-2">
                <div><strong className="text-light-text-secondary">Open to work:</strong> {formData.experience.isOpenToWork ? 'Yes' : 'No'}</div>
                <div><strong className="text-light-text-secondary">Employee Experience:</strong> {formData.experience.employee.length > 0 ? formData.experience.employee.map((e) => e.companyName).join(', ') : 'None'}</div>
                <div><strong className="text-light-text-secondary">Entrepreneur Experience:</strong> {formData.experience.entrepreneur.length > 0 ? formData.experience.entrepreneur.map((e) => e.companyName).join(', ') : 'None'}</div>
              </div>
            </section>
            <section className="bg-white p-4 rounded border border-light-border">
              <h4 className="font-semibold text-light-text-primary mb-3">Privacy Settings</h4>
              <div className="text-sm space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${formData.privacy?.showEmail ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  <strong className="text-light-text-secondary">Show Email:</strong> {formData.privacy?.showEmail ? 'Yes' : 'No'}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${formData.privacy?.showPhone ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  <strong className="text-light-text-secondary">Show Phone:</strong> {formData.privacy?.showPhone ? 'Yes' : 'No'}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${formData.privacy?.showCompany ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  <strong className="text-light-text-secondary">Show Company:</strong> {formData.privacy?.showCompany ? 'Yes' : 'No'}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${formData.privacy?.showLocation ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  <strong className="text-light-text-secondary">Show Location:</strong> {formData.privacy?.showLocation ? 'Yes' : 'No'}
                </div>
              </div>
            </section>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-light-card rounded-xl shadow-sm border border-light-border p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <button onClick={onCancel} className="flex items-center gap-2 text-light-text-secondary hover:text-light-text-primary transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>
        <h2 className="text-xl font-bold text-light-text-primary">Edit Profile</h2>
      </div>

      <Stepper currentStep={currentStep} steps={steps} />

      <div className="mb-8">{renderStep()}</div>

      <div className="flex justify-between pt-4 border-t border-light-border">
        {currentStep > 0 ? (
          <Button variant="outline" onClick={prevStep}>Previous</Button>
        ) : (
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        )}
        {currentStep < steps.length - 1 ? (
          <Button variant="primary" onClick={nextStep}>Next</Button>
        ) : (
          <Button variant="primary" onClick={handleSave} disabled={saving} icon={<Save className="w-4 h-4" />}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default ProfileEditForm;
