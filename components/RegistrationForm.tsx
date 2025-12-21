import React, { useState, useCallback, useEffect, useMemo } from 'react';
import type { UserData, EmployeeExperience, EntrepreneurExperience, OpenToWorkDetails } from '../types';
import { supabase } from '../lib/supabaseClient';
import ProfilePhotoUpload from './ProfilePhotoUpload';
import { Country, State, City } from 'country-state-city';

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
    paymentReceipt?: string;
};

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string, optional?: boolean, error?: string }> = ({ label, id, optional, error, ...props }) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const isDate = props.type === 'date';

    // Handle date input focus to show date picker on desktop
    const handleDateFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        if (isDate) {
            e.target.showPicker?.();
        }
        props.onFocus?.(e);
    };

    return (
        <div className="relative pb-5">
            <label htmlFor={id} className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
                {label} {optional && <span className="text-xs text-light-text-secondary/60 dark:text-dark-text-secondary/60">(Optional)</span>}
            </label>
            <input
                id={id}
                ref={inputRef}
                className={`w-full px-3 py-2 text-light-text-primary dark:text-dark-text-primary bg-light-bg dark:bg-dark-bg border ${error ? 'border-red-500' : 'border-light-border dark:border-dark-border'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${isDate && !props.value ? 'text-gray-400' : ''}`}
                {...props}
                onFocus={handleDateFocus}
            />
            {error && <p className="mt-1 text-xs text-red-500 absolute bottom-0">{error}</p>}
        </div>
    );
};

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: React.ReactNode; optional?: boolean; error?: string }> = ({ label, id, children, optional, error, ...props }) => (
    <div className="relative pb-5">
        <label htmlFor={id} className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
            {label} {optional && <span className="text-xs text-light-text-secondary/60 dark:text-dark-text-secondary/60">(Optional)</span>}
        </label>
        <select
            id={id}
            className={`w-full px-3 py-2 text-light-text-primary dark:text-dark-text-primary bg-light-bg dark:bg-dark-bg border ${error ? 'border-red-500' : 'border-light-border dark:border-dark-border'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200`}
            {...props}
        >
            {children}
        </select>
        {error && <p className="mt-1 text-xs text-red-500 absolute bottom-0">{error}</p>}
    </div>
);

const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string, optional?: boolean, error?: string }> = ({ label, id, optional, error, ...props }) => (
    <div className="relative pb-5">
        <label htmlFor={id} className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
            {label} {optional && <span className="text-xs text-light-text-secondary/60 dark:text-dark-text-secondary/60">(Optional)</span>}
        </label>
        <textarea
            id={id}
            rows={3}
            className={`w-full px-3 py-2 text-light-text-primary dark:text-dark-text-primary bg-light-bg dark:bg-dark-bg border ${error ? 'border-red-500' : 'border-light-border dark:border-dark-border'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200`}
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
                className="focus:ring-primary h-4 w-4 text-primary border-light-border dark:border-dark-border rounded"
                {...props}
            />
        </div>
        <div className="ml-3 text-sm">
            <label htmlFor={id} className="font-medium text-light-text-primary dark:text-dark-text-primary">
                {label}
            </label>
            {description && <p className="text-light-text-secondary dark:text-dark-text-secondary">{description}</p>}
        </div>
    </div>
);

interface RegistrationFormProps {
    userData: UserData;
    setUserData: React.Dispatch<React.SetStateAction<UserData>>;
    currentStep: number;
    setCurrentStep: (step: number) => void;
    onRegister: (receiptFile: File) => void;
}

const Stepper: React.FC<{ currentStep: number }> = ({ currentStep }) => {
    const steps = ['Personal', 'Contact', 'Experience', 'Review', 'Payment'];
    return (
        <div className="mb-8">
            <ol className="flex items-center w-full">
                {steps.map((step, index) => (
                    <li key={step} className={`flex w-full items-center ${index < steps.length - 1 ? "after:content-[''] after:w-full after:h-1 after:border-b after:border-4 after:inline-block" : ''} ${index < currentStep ? 'text-[#E7A700] after:border-[#E7A700]' : index === currentStep ? 'text-[#E7A700] after:border-gray-200' : 'text-gray-400 after:border-gray-200'}`}>
                        <span className={`flex items-center justify-center w-10 h-10 rounded-full lg:h-12 lg:w-12 shrink-0 ${index < currentStep ? 'bg-[#E7A700]' : index === currentStep ? 'bg-[#E7A700] ring-4 ring-[#E7A700]/30' : 'bg-gray-200'}`}>
                            <span className={`font-bold ${index <= currentStep ? 'text-white' : 'text-gray-600'}`}>
                                {index + 1}
                            </span>
                        </span>
                    </li>
                ))}
            </ol>
            <div className="flex justify-between mt-2 text-sm font-medium text-gray-600">
                {steps.map((step, index) => (
                    <span key={index} className={`text-center ${index === currentStep ? 'text-[#E7A700] font-bold' : ''}`} style={{ flexBasis: '20%' }}>
                        {step}
                    </span>
                ))}
            </div>
        </div>
    );
};

// Component for handling Country-State-City logic
const AddressSelects: React.FC<{
    addressType: 'presentAddress' | 'permanentAddress',
    userData: UserData,
    setUserData: React.Dispatch<React.SetStateAction<UserData>>,
    errors: FormErrors,
    disabled?: boolean
}> = ({ addressType, userData, setUserData, errors, disabled }) => {

    const selectedCountry = userData.contact[addressType]?.country || '';
    const selectedState = userData.contact[addressType]?.state || '';
    const selectedCity = userData.contact[addressType]?.city || '';

    // Derived codes
    const countryCode = useMemo(() => {
        return Country.getAllCountries().find(c => c.name === selectedCountry)?.isoCode || '';
    }, [selectedCountry]);

    const stateCode = useMemo(() => {
        if (!countryCode) return '';
        return State.getStatesOfCountry(countryCode).find(s => s.name === selectedState)?.isoCode || '';
    }, [countryCode, selectedState]);

    // Data Sources
    const countries = useMemo(() => Country.getAllCountries(), []);
    const states = useMemo(() => countryCode ? State.getStatesOfCountry(countryCode) : [], [countryCode]);
    const cities = useMemo(() => stateCode ? City.getCitiesOfState(countryCode, stateCode) : [], [countryCode, stateCode]);

    const handleChange = (field: 'country' | 'state' | 'city', value: string) => {
        setUserData(prev => {
            const newState = { ...prev };
            // Update the specific field
            if (!newState.contact[addressType]) {
                // Should not happen if initialized correctly, but safe guard
                (newState.contact[addressType] as any) = {};
            }

            (newState.contact[addressType] as any)[field] = value;

            // Reset dependent fields
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
                value={selectedCountry} // We store Name, not Code
                onChange={(e) => {
                    // Find the name associated with the selected ISO code, or if we use name as value directly
                    // It's cleaner to use the ISO Code as the value of the option, but store the Name in userData.
                    // But here, `value` prop expects the Name to match what we stored.
                    // Let's assume options value is Name.
                    handleChange('country', e.target.value);
                }}
                disabled={disabled}
                error={(errors.contact as any)?.[addressType]?.country}
            >
                <option value="">Select Country</option>
                {countries.map(c => (
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
                {states.map(s => (
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
                {cities.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                ))}
            </Select>
        </>
    );
};

const RegistrationForm: React.FC<RegistrationFormProps> = ({ userData, setUserData, currentStep, setCurrentStep, onRegister }) => {
    const [errors, setErrors] = useState<FormErrors>({});
    const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [showSpecialization, setShowSpecialization] = useState(!!userData.personal.highestQualification);

    // Hydrate from localStorage if userData is empty (defensive).
    useEffect(() => {
        let didHydrate = false;
        try {
            const hasName = Boolean(userData && userData.personal && userData.personal.firstName);
            if (!hasName && typeof window !== 'undefined') {
                const saved = localStorage.getItem('alumniForm');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (parsed) {
                        setUserData(parsed);
                        didHydrate = true;
                    }
                }
            }
        } catch (e) {
            // ignore parse errors
        }

        // If we didn't hydrate from localStorage, try Supabase session (for prefilled email)
        (async () => {
            try {
                if (!didHydrate && (!userData || !userData.personal || !userData.personal.email)) {
                    const getSession = (supabase.auth as any).getSession || (supabase.auth as any).session;
                    if (getSession) {
                        const result = await (supabase.auth as any).getSession();
                        const s = result?.data?.session ?? result?.session ?? null;
                        if (s && s.user) {
                            setUserData(prev => ({
                                ...prev,
                                id: prev?.id || s.user.id || '',
                                personal: {
                                    ...prev?.personal,
                                    email: prev?.personal?.email || s.user.email || '',
                                    firstName: prev?.personal?.firstName || ((s.user.user_metadata?.full_name && s.user.user_metadata.full_name.split(' ')[0]) || ''),
                                    lastName: prev?.personal?.lastName || ((s.user.user_metadata?.full_name && s.user.user_metadata.full_name.split(' ').slice(1).join(' ')) || ''),
                                }
                            }));
                        }
                    } else {
                        // older API fallback: supabase.auth.user()
                        const user = (supabase.auth as any).user ? (supabase.auth as any).user() : null;
                        if (user) {
                            setUserData(prev => ({
                                ...prev,
                                id: prev?.id || user.id || '',
                                personal: {
                                    ...prev?.personal,
                                    email: prev?.personal?.email || user.email || '',
                                    firstName: prev?.personal?.firstName || ((user.user_metadata?.full_name && user.user_metadata.full_name.split(' ')[0]) || ''),
                                    lastName: prev?.personal?.lastName || ((user.user_metadata?.full_name && user.user_metadata.full_name.split(' ').slice(1).join(' ')) || ''),
                                }
                            }));
                        }
                    }
                }
            } catch (err) {
                // ignore session errors
                // console.warn('Session hydrate failed', err);
            }
        })();
    }, [setUserData, userData]);

    const validateField = useCallback((section: keyof UserData, field: string, value: any, allData: UserData = userData): string => {
        const requiredMsg = "This field is required.";
        switch (`${section}.${field}`) {
            case 'personal.firstName': return value ? '' : requiredMsg;
            case 'personal.lastName': return value ? '' : requiredMsg;
            case 'personal.passOutYear':
                if (!value) return requiredMsg;
                if (!/^\d{4}$/.test(value) || parseInt(value, 10) > new Date().getFullYear() || parseInt(value, 10) < 1950) {
                    return "Please enter a valid 4-digit year.";
                }
                return '';
            case 'personal.dob': return value ? '' : requiredMsg;
            case 'personal.bloodGroup': return value ? '' : requiredMsg;
            case 'personal.highestQualification': return value ? '' : requiredMsg;
            case 'personal.altEmail':
                if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    return "Please enter a valid email address.";
                }
                return '';
            case 'contact.presentAddress.city': return value ? '' : requiredMsg;
            case 'contact.presentAddress.state': return value ? '' : requiredMsg;
            case 'contact.presentAddress.country': return value ? '' : requiredMsg;
            case 'contact.presentAddress.pincode':
                if (!value) return requiredMsg;
                if (!/^\d{4,6}$/.test(value)) return "Please enter a valid 4, 5 or 6 digit pincode.";
                return '';
            case 'contact.permanentAddress.city': return (allData.contact.sameAsPresentAddress || value) ? '' : requiredMsg;
            case 'contact.permanentAddress.state': return (allData.contact.sameAsPresentAddress || value) ? '' : requiredMsg;
            case 'contact.permanentAddress.country': return (allData.contact.sameAsPresentAddress || value) ? '' : requiredMsg;
            case 'contact.permanentAddress.pincode':
                if (allData.contact.sameAsPresentAddress) return '';
                if (!value) return requiredMsg;
                if (!/^\d{4,6}$/.test(value)) return "Please enter a valid 4, 5 or 6 digit pincode.";
                return '';
            case 'contact.mobile':
                if (!value) return requiredMsg;
                if (!/^\+?\d{10,15}$/.test(value)) return "Please enter a valid mobile number.";
                return '';
            default: return '';
        }
    }, [userData]);

    const handleChange = (section: keyof UserData, field: string, subfield?: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { value } = e.target;
        setUserData(prev => {
            let newData: UserData;
            if (subfield) {
                // Handle nested fields like presentAddress.city
                newData = {
                    ...prev,
                    [section]: {
                        ...(prev[section] as any),
                        [field]: {
                            ...((prev[section] as any)[field] || {}),
                            [subfield]: value
                        }
                    }
                };
            } else {
                // Handle flat fields
                newData = {
                    ...prev,
                    [section]: {
                        ...(prev[section] as any),
                        [field]: value
                    }
                };
            }
            const validationKey = subfield ? `${section}.${field}.${subfield}` : `${section}.${field}`;
            const error = validateField(section, subfield ? `${field}.${subfield}` : field, value, newData);
            setErrors(prevErrors => {
                if (subfield) {
                    return {
                        ...prevErrors,
                        [section]: {
                            ...(prevErrors[section] as any),
                            [field]: {
                                ...((prevErrors[section] as any)?.[field] || {}),
                                [subfield]: error
                            }
                        }
                    };
                } else {
                    return {
                        ...prevErrors,
                        [section]: {
                            ...(prevErrors[section] as any),
                            [field]: error
                        }
                    };
                }
            });
            return newData;
        });
    };

    const handleSameAsPresentAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { checked } = e.target;
        setUserData(prev => {
            if (checked) {
                // Copy present address to permanent address
                return {
                    ...prev,
                    contact: {
                        ...prev.contact,
                        sameAsPresentAddress: true,
                        permanentAddress: {
                            ...prev.contact.presentAddress
                        }
                    }
                };
            } else {
                // Uncheck - clear permanent address fields
                return {
                    ...prev,
                    contact: {
                        ...prev.contact,
                        sameAsPresentAddress: false
                    }
                };
            }
        });
        // Clear permanent address errors when checked
        if (checked) {
            setErrors(prev => ({
                ...prev,
                contact: {
                    ...(prev.contact as any),
                    permanentAddress: {}
                }
            }));
        }
    };

    const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setReceiptFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setReceiptPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            setErrors(prev => ({ ...prev, paymentReceipt: undefined }));
        } else {
            setReceiptFile(null);
            setReceiptPreview(null);
            if (file) {
                setErrors(prev => ({ ...prev, paymentReceipt: "Please upload a valid image file (PNG, JPG)." }));
            }
        }
    };

    const handleExperienceChange = <K extends 'employee' | 'entrepreneur'>(type: K, index: number, field: keyof UserData['experience'][K][number]) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { value, type: inputType, checked } = e.target as HTMLInputElement;
        setUserData(prev => {
            const newExperience = [...prev.experience[type]];
            newExperience[index] = {
                ...newExperience[index],
                [field]: (inputType === 'checkbox' ? checked : value) as any,
            };
            return {
                ...prev,
                experience: {
                    ...prev.experience,
                    [type]: newExperience
                }
            };
        });
    };

    const addExperience = (type: 'employee' | 'entrepreneur') => {
        const newExp = type === 'employee'
            ? { id: `${Date.now()}`, companyName: '', designation: '', startDate: '', endDate: '', isCurrentEmployer: false, city: '', state: '', country: '' }
            : { id: `${Date.now()}`, companyName: '', natureOfBusiness: '', city: '', state: '', country: '' };

        setUserData(prev => ({
            ...prev,
            experience: {
                ...prev.experience,
                [type]: [...prev.experience[type], newExp]
            }
        }));
    };

    const removeExperience = (type: 'employee' | 'entrepreneur', index: number) => {
        setUserData(prev => ({
            ...prev,
            experience: {
                ...prev.experience,
                [type]: prev.experience[type].filter((_, i) => i !== index)
            }
        }));
    };

    const handleOpenToWorkDetailsChange = (field: keyof OpenToWorkDetails) => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setUserData(prev => ({
            ...prev,
            experience: {
                ...prev.experience,
                openToWorkDetails: {
                    ...prev.experience.openToWorkDetails,
                    [field]: e.target.value,
                }
            }
        }));
    };

    const prevStep = () => setCurrentStep(Math.max(1, currentStep - 1));

    const nextStep = () => {
        let isValid = true;
        const newErrors: FormErrors = {};

        if (currentStep === 1) {
            const personalErrors: Partial<Record<keyof UserData['personal'], string>> = {};
            (Object.keys(userData.personal) as Array<keyof UserData['personal']>).forEach(key => {
                const error = validateField('personal', key, userData.personal[key]);
                if (error) {
                    personalErrors[key] = error;
                    isValid = false;
                }
            });
            if (!isValid) newErrors.personal = personalErrors;
        } else if (currentStep === 2) {
            const contactErrors: Partial<Record<keyof UserData['contact'], string>> = {};
            (Object.keys(userData.contact) as Array<keyof UserData['contact']>).forEach(key => {
                const error = validateField('contact', key, userData.contact[key]);
                if (error) {
                    contactErrors[key] = error;
                    isValid = false;
                }
            });
            if (!isValid) newErrors.contact = contactErrors;
        }

        setErrors(newErrors);

        if (isValid) {
            try {
                localStorage.setItem('alumniForm', JSON.stringify(userData));
            } catch (e) {
                console.warn('Could not persist form to localStorage', e);
            }
            setCurrentStep(Math.min(5, currentStep + 1));
        }
    };

    const handleSubmit = () => {
        if (receiptFile) {
            onRegister(receiptFile);
        } else {
            setErrors(prev => ({ ...prev, paymentReceipt: "A payment receipt is required to register." }));
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1: // Personal Details
                return (
                    <div className="space-y-4">
                        <h4 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">Personal Information</h4>

                        {/* Profile Photo Upload */}
                        <div className="flex justify-center mb-6">
                            <ProfilePhotoUpload
                                value={userData.personal.profilePhoto}
                                onChange={(photoData) => setUserData(prev => ({
                                    ...prev,
                                    personal: {
                                        ...prev.personal,
                                        profilePhoto: photoData
                                    }
                                }))}
                                error={errors.personal?.profilePhoto}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                            <Input label="First Name" id="firstName" value={userData.personal.firstName} onChange={handleChange('personal', 'firstName')} error={errors.personal?.firstName} />
                            <Input label="Last Name" id="lastName" value={userData.personal.lastName} onChange={handleChange('personal', 'lastName')} error={errors.personal?.lastName} />
                            <Input label="Year of Pass Out" id="passOutYear" type="number" placeholder="YYYY" value={userData.personal.passOutYear} onChange={handleChange('personal', 'passOutYear')} error={errors.personal?.passOutYear} />
                            <Input label="Date of Birth" id="dob" type="date" value={userData.personal.dob} onChange={handleChange('personal', 'dob')} error={errors.personal?.dob} />
                            <Select label="Blood Group" id="bloodGroup" value={userData.personal.bloodGroup} onChange={handleChange('personal', 'bloodGroup')} error={errors.personal?.bloodGroup}>
                                <option value="">Select...</option>
                                <option>A+</option>
                                <option>A-</option>
                                <option>B+</option>
                                <option>B-</option>
                                <option>AB+</option>
                                <option>AB-</option>
                                <option>O+</option>
                                <option>O-</option>
                            </Select>
                            <Select label="Highest Qualification" id="highestQualification" value={userData.personal.highestQualification} onChange={(e) => {
                                handleChange('personal', 'highestQualification')(e);
                                setShowSpecialization(!!e.target.value);
                                if (!e.target.value) {
                                    setUserData(prev => ({
                                        ...prev,
                                        personal: {
                                            ...prev.personal,
                                            specialization: ''
                                        }
                                    }));
                                }
                            }} error={errors.personal?.highestQualification}>
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
                            {/* Specialization field - shows when qualification is selected */}
                            {(showSpecialization || userData.personal.highestQualification) && (
                                <Input
                                    label="Specialization"
                                    id="specialization"
                                    placeholder="e.g., Computer Science, Mechanical, etc."
                                    value={userData.personal.specialization}
                                    onChange={handleChange('personal', 'specialization')}
                                    error={errors.personal?.specialization}
                                />
                            )}
                            {/* Email: disabled only when value exists */}
                            <div>
                                <Input label="Email Address" id="email" type="email" value={userData.personal.email} onChange={handleChange('personal', 'email')} disabled={!!userData.personal.email} />
                                {userData.personal.email && <p className="mt-1 text-xs text-gray-500">Email taken from your sign-in method and cannot be changed here.</p>}
                            </div>
                            <Input label="Alternate Email" id="altEmail" type="email" optional value={userData.personal.altEmail} onChange={handleChange('personal', 'altEmail')} error={errors.personal?.altEmail} />
                        </div>
                    </div>
                );
            case 2: // Contact Details
                return (
                    <div className="space-y-6 animate-fade-in-right">
                        <h4 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">Contact Details</h4>

                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-md border border-gray-100 dark:border-gray-800 space-y-4">
                            <div>
                                <h5 className="font-semibold text-primary mb-2">Personal Information</h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                                    <AddressSelects
                                        addressType="presentAddress"
                                        userData={userData}
                                        setUserData={setUserData}
                                        errors={errors}
                                    />
                                    <Input
                                        label="Pincode"
                                        id="presentPincode"
                                        type="text"
                                        placeholder="4, 5 or 6 digits"
                                        value={userData.contact.presentAddress?.pincode || ''}
                                        onChange={handleChange('contact', 'presentAddress', 'pincode')}
                                        error={(errors.contact as any)?.presentAddress?.pincode}
                                    />
                                </div>
                            </div>

                            {/* Same as Present Address Checkbox */}
                            <div className="pl-4">
                                <Checkbox
                                    label="Permanent address is same as present address"
                                    id="sameAsPresentAddress"
                                    checked={userData.contact.sameAsPresentAddress || false}
                                    onChange={handleSameAsPresentAddress}
                                />
                            </div>

                            {/* Permanent Address */}
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-light-border dark:border-dark-border">
                                <h4 className="font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-3">Permanent Address</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                                    <AddressSelects
                                        addressType="permanentAddress"
                                        userData={userData}
                                        setUserData={setUserData}
                                        errors={errors}
                                        disabled={userData.contact.sameAsPresentAddress}
                                    />
                                    <Input
                                        label="Pincode"
                                        id="permanentPincode"
                                        type="text"
                                        placeholder="4, 5 or 6 digits"
                                        value={userData.contact.permanentAddress?.pincode || ''}
                                        onChange={handleChange('contact', 'permanentAddress', 'pincode')}
                                        error={(errors.contact as any)?.permanentAddress?.pincode}
                                        disabled={userData.contact.sameAsPresentAddress}
                                    />
                                </div>
                            </div>

                            {/* Contact Numbers */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                                <Input
                                    label="Mobile Number"
                                    id="mobile"
                                    type="tel"
                                    value={userData.contact.mobile || ''}
                                    onChange={handleChange('contact', 'mobile')}
                                    error={(errors.contact as any)?.mobile}
                                />
                                <Input
                                    label="Telephone Number"
                                    id="telephone"
                                    type="tel"
                                    optional
                                    value={userData.contact.telephone || ''}
                                    onChange={handleChange('contact', 'telephone')}
                                />
                            </div>
                        </div>
                    </div>
                );
            case 3: // Experience Details
                return (
                    <div className="space-y-8 animate-fade-in-right">
                        <h3 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary">Professional Experience</h3>
                        {/* Employee */}
                        <div>
                            <h4 className="font-semibold text-lg text-light-text-secondary dark:text-dark-text-secondary mb-2">Employee Experience</h4>
                            {userData.experience.employee.map((exp, index) => (
                                <div key={exp.id} className="p-4 pt-12 border border-light-border dark:border-dark-border rounded-lg mb-4 space-y-4 relative bg-gray-50 dark:bg-gray-800/50">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                                        <Input label="Company Name" value={exp.companyName} onChange={handleExperienceChange('employee', index, 'companyName')} />
                                        <Input label="Designation" value={exp.designation} onChange={handleExperienceChange('employee', index, 'designation')} />
                                        <Input label="Start Date" type="date" value={exp.startDate} onChange={handleExperienceChange('employee', index, 'startDate')} />
                                        <Input label="End Date" type="date" value={exp.endDate} onChange={handleExperienceChange('employee', index, 'endDate')} disabled={exp.isCurrentEmployer} />
                                        <Input label="City" value={exp.city} onChange={handleExperienceChange('employee', index, 'city')} />
                                        <Input label="State" value={exp.state} onChange={handleExperienceChange('employee', index, 'state')} />
                                        <Input label="Country" value={exp.country} onChange={handleExperienceChange('employee', index, 'country')} />
                                    </div>
                                    <Checkbox label="I currently work here" checked={exp.isCurrentEmployer} onChange={handleExperienceChange('employee', index, 'isCurrentEmployer')} />
                                    <button
                                        type="button"
                                        onClick={() => removeExperience('employee', index)}
                                        className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 text-sm font-medium text-red-600 hover:text-white hover:bg-red-600 border border-red-600 rounded transition-colors duration-200"
                                        title="Remove this entry"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        <span>Close</span>
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addExperience('employee')} className="text-sm font-medium text-[#E7A700] hover:text-[#CF9500]">+ Add Employment</button>
                        </div>
                        {/* Entrepreneur */}
                        <div>
                            <h4 className="font-semibold text-lg text-light-text-secondary dark:text-dark-text-secondary mb-2">Entrepreneur Experience / தொழில் முனைவோர்</h4>
                            {userData.experience.entrepreneur.map((exp, index) => (
                                <div key={exp.id} className="p-4 pt-12 border border-light-border dark:border-dark-border rounded-lg mb-4 space-y-4 relative bg-gray-50 dark:bg-gray-800/50">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                                        <Input label="Company Name" value={exp.companyName} onChange={handleExperienceChange('entrepreneur', index, 'companyName')} />
                                        <Input label="Nature of Business" value={exp.natureOfBusiness} onChange={handleExperienceChange('entrepreneur', index, 'natureOfBusiness')} />
                                        <Input label="City" value={exp.city} onChange={handleExperienceChange('entrepreneur', index, 'city')} />
                                        <Input label="State" value={exp.state} onChange={handleExperienceChange('entrepreneur', index, 'state')} />
                                        <Input label="Country" value={exp.country} onChange={handleExperienceChange('entrepreneur', index, 'country')} />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeExperience('entrepreneur', index)}
                                        className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 text-sm font-medium text-red-600 hover:text-white hover:bg-red-600 border border-red-600 rounded transition-colors duration-200"
                                        title="Remove this entry"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        <span>Close</span>
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addExperience('entrepreneur')} className="text-sm font-medium text-[#E7A700] hover:text-[#CF9500]">+ Add Business</button>
                        </div>
                        {/* Open to Work */}
                        <div>
                            <Checkbox
                                label="I am currently open to work"
                                description="Check this if you are looking for new job opportunities."
                                checked={userData.experience.isOpenToWork}
                                onChange={(e) => setUserData(prev => ({ ...prev, experience: { ...prev.experience, isOpenToWork: e.target.checked } }))} />

                            {userData.experience.isOpenToWork && (
                                <div className="mt-4 pl-6 border-l-2 border-[#E7A700] space-y-4">
                                    <TextArea label="Technical Skills" value={userData.experience.openToWorkDetails.technicalSkills} onChange={handleOpenToWorkDetailsChange('technicalSkills')} />
                                    <TextArea label="Certifications" value={userData.experience.openToWorkDetails.certifications} onChange={handleOpenToWorkDetailsChange('certifications')} />
                                    <TextArea label="Soft Skills" value={userData.experience.openToWorkDetails.softSkills} onChange={handleOpenToWorkDetailsChange('softSkills')} />
                                    <TextArea label="Other Information" optional value={userData.experience.openToWorkDetails.other} onChange={handleOpenToWorkDetailsChange('other')} />
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 4: // Review
                return (
                    <div className="space-y-6 animate-fade-in-right">
                        <h3 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary">Review Your Information</h3>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">
                            Please review all the information you have provided. You can go back to edit any details before proceeding to payment.
                        </p>

                        {/* Personal Section */}
                        <section className="bg-white dark:bg-gray-800 p-4 rounded border border-light-border dark:border-dark-border">
                            <div className="flex justify-between items-start">
                                <h4 className="font-semibold text-light-text-primary dark:text-dark-text-primary">Personal</h4>
                                <button
                                    type="button"
                                    className="text-sm underline text-primary hover:text-primary-hover"
                                    onClick={() => setCurrentStep(1)}
                                >
                                    Edit
                                </button>
                            </div>
                            <div className="mt-3 text-light-text-primary dark:text-dark-text-primary">
                                {/* Profile Photo Preview */}
                                {userData.personal.profilePhoto && (
                                    <div className="flex justify-center mb-4">
                                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary bg-gray-100 dark:bg-gray-700">
                                            <img
                                                src={userData.personal.profilePhoto}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                    <div><strong className="text-light-text-secondary dark:text-dark-text-secondary">First name:</strong> <div>{userData.personal.firstName || '—'}</div></div>
                                    <div><strong className="text-light-text-secondary dark:text-dark-text-secondary">Last name:</strong> <div>{userData.personal.lastName || '—'}</div></div>
                                    <div><strong className="text-light-text-secondary dark:text-dark-text-secondary">Year of pass out:</strong> <div>{userData.personal.passOutYear || '—'}</div></div>
                                    <div><strong className="text-light-text-secondary dark:text-dark-text-secondary">DOB:</strong> <div>{userData.personal.dob || '—'}</div></div>
                                    <div><strong className="text-light-text-secondary dark:text-dark-text-secondary">Blood group:</strong> <div>{userData.personal.bloodGroup || '—'}</div></div>
                                    <div><strong className="text-light-text-secondary dark:text-dark-text-secondary">Highest qualification:</strong> <div>{userData.personal.highestQualification || '—'}</div></div>
                                    {userData.personal.specialization && <div><strong className="text-light-text-secondary dark:text-dark-text-secondary">Specialization:</strong> <div>{userData.personal.specialization}</div></div>}
                                    <div><strong className="text-light-text-secondary dark:text-dark-text-secondary">Email:</strong> <div>{userData.personal.email || '—'}</div></div>
                                    <div><strong className="text-light-text-secondary dark:text-dark-text-secondary">Alternate Email:</strong> <div>{userData.personal.altEmail || '—'}</div></div>
                                </div>
                            </div>
                        </section>

                        {/* Contact Section */}
                        <section className="bg-white dark:bg-gray-800 p-4 rounded border border-light-border dark:border-dark-border">
                            <div className="flex justify-between items-start">
                                <h4 className="font-semibold text-light-text-primary dark:text-dark-text-primary">Contact</h4>
                                <button type="button" className="text-sm underline text-primary hover:text-primary-hover" onClick={() => setCurrentStep(2)}>Edit</button>
                            </div>
                            <div className="mt-3 text-sm space-y-3 text-light-text-primary dark:text-dark-text-primary">
                                {/* Present Address */}
                                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                                    <strong className="text-primary">Present Address:</strong>
                                    <div className="mt-1 space-y-1">
                                        <div><strong className="text-light-text-secondary dark:text-dark-text-secondary">City:</strong> {userData.contact.presentAddress?.city || '—'}</div>
                                        <div><strong className="text-light-text-secondary dark:text-dark-text-secondary">State:</strong> {userData.contact.presentAddress?.state || '—'}</div>
                                        <div><strong className="text-light-text-secondary dark:text-dark-text-secondary">Pincode:</strong> {userData.contact.presentAddress?.pincode || '—'}</div>
                                        <div><strong className="text-light-text-secondary dark:text-dark-text-secondary">Country:</strong> {userData.contact.presentAddress?.country || '—'}</div>
                                    </div>
                                </div>

                                {/* Permanent Address */}
                                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                                    <strong className="text-primary">Permanent Address:</strong>
                                    {userData.contact.sameAsPresentAddress ? (
                                        <div className="mt-1 text-light-text-secondary dark:text-dark-text-secondary italic">Same as present address</div>
                                    ) : (
                                        <div className="mt-1 space-y-1">
                                            <div><strong className="text-light-text-secondary dark:text-dark-text-secondary">City:</strong> {userData.contact.permanentAddress?.city || '—'}</div>
                                            <div><strong className="text-light-text-secondary dark:text-dark-text-secondary">State:</strong> {userData.contact.permanentAddress?.state || '—'}</div>
                                            <div><strong className="text-light-text-secondary dark:text-dark-text-secondary">Pincode:</strong> {userData.contact.permanentAddress?.pincode || '—'}</div>
                                            <div><strong className="text-light-text-secondary dark:text-dark-text-secondary">Country:</strong> {userData.contact.permanentAddress?.country || '—'}</div>
                                        </div>
                                    )}
                                </div>

                                {/* Contact Numbers */}
                                <div>
                                    <div><strong className="text-light-text-secondary dark:text-dark-text-secondary">Mobile:</strong> {userData.contact.mobile || '—'}</div>
                                    <div><strong className="text-light-text-secondary dark:text-dark-text-secondary">Telephone:</strong> {userData.contact.telephone || '—'}</div>
                                </div>
                            </div>
                        </section>

                        {/* Experience Section */}
                        <section className="bg-white dark:bg-gray-800 p-4 rounded border border-light-border dark:border-dark-border">
                            <div className="flex justify-between items-start">
                                <h4 className="font-semibold text-light-text-primary dark:text-dark-text-primary">Experience</h4>
                                <button type="button" className="text-sm underline text-primary hover:text-primary-hover" onClick={() => setCurrentStep(3)}>Edit</button>
                            </div>
                            <div className="mt-3 text-sm space-y-3 text-light-text-primary dark:text-dark-text-primary">
                                <div>
                                    <strong>Open to work:</strong> <div>{userData.experience.isOpenToWork ? 'Yes' : 'No'}</div>
                                </div>

                                <div>
                                    <strong>Employee Experience:</strong>
                                    {userData.experience.employee && userData.experience.employee.length > 0 ? (
                                        <ul className="list-disc ml-5">
                                            {userData.experience.employee.map((e) => (
                                                <li key={e.id} className="mb-1">
                                                    <div><strong>Company:</strong> {e.companyName || '—'}</div>
                                                    <div><strong>Designation:</strong> {e.designation || '—'}</div>
                                                    <div><strong>From:</strong> {e.startDate || '—'} <strong>To:</strong> {e.endDate || (e.isCurrentEmployer ? 'Present' : '—')}</div>
                                                    <div><strong>Location:</strong> {[e.city, e.state, e.country].filter(Boolean).join(', ') || '—'}</div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : <div>—</div>}
                                </div>

                                <div>
                                    <strong>Entrepreneur Experience:</strong>
                                    {userData.experience.entrepreneur && userData.experience.entrepreneur.length > 0 ? (
                                        <ul className="list-disc ml-5">
                                            {userData.experience.entrepreneur.map((e) => (
                                                <li key={e.id} className="mb-1">
                                                    <div><strong>Company:</strong> {e.companyName || '—'}</div>
                                                    <div><strong>Nature of business:</strong> {e.natureOfBusiness || '—'}</div>
                                                    <div><strong>Location:</strong> {[e.city, e.state, e.country].filter(Boolean).join(', ') || '—'}</div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : <div>—</div>}
                                </div>

                                {userData.experience.isOpenToWork && (
                                    <div className="mt-2">
                                        <strong>Open to work details:</strong>
                                        <div className="mt-1 text-sm">
                                            <div><strong>Technical Skills</strong><div>{userData.experience.openToWorkDetails.technicalSkills || '—'}</div></div>
                                            <div><strong>Certifications</strong><div>{userData.experience.openToWorkDetails.certifications || '—'}</div></div>
                                            <div><strong>Soft Skills</strong><div>{userData.experience.openToWorkDetails.softSkills || '—'}</div></div>
                                            <div><strong>Other</strong><div>{userData.experience.openToWorkDetails.other || '—'}</div></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                );


            case 5: // Payment
                return (
                    <div className="space-y-6 animate-fade-in-right">
                        <div>
                            <h3 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">Final Step: Payment</h3>
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Complete the payment and upload the receipt to finalize your registration.</p>
                        </div>

                        {/* Rejection Comments Alert */}
                        {userData.status === 'rejected' && userData.rejectionComments && (
                            <div className="p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 rounded-r-lg">
                                <div className="flex items-start">
                                    <svg className="w-6 h-6 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <h4 className="text-red-800 dark:text-red-200 font-semibold mb-1">Registration Rejected</h4>
                                        <p className="text-red-700 dark:text-red-300 text-sm mb-2">
                                            Your previous registration was rejected for the following reason:
                                        </p>
                                        <div className="bg-white dark:bg-gray-800 p-3 rounded border border-red-200 dark:border-red-800">
                                            <p className="text-red-900 dark:text-red-100 text-sm whitespace-pre-wrap">{userData.rejectionComments}</p>
                                        </div>
                                        <p className="text-red-700 dark:text-red-300 text-sm mt-2">
                                            Please address the issue and upload a new payment receipt below.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Fee Structure */}
                        <div className="p-6 border rounded-lg bg-white dark:bg-gray-800 shadow-sm border-light-border dark:border-dark-border">
                            <h4 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">Fee Structure</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-light-border dark:border-dark-border">
                                    <span className="text-light-text-secondary dark:text-dark-text-secondary">Registration Fee (One Time)</span>
                                    <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">₹ 100</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-light-border dark:border-dark-border">
                                    <span className="text-light-text-secondary dark:text-dark-text-secondary">Annual Fee (Yearly)</span>
                                    <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">₹ 600</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-t-2 border-primary">
                                    <span className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">Total Amount</span>
                                    <span className="text-xl font-bold text-primary">₹ 700</span>
                                </div>
                            </div>
                            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-primary rounded-md">
                                <p className="text-sm text-primary font-medium">
                                    💡 Please proceed with the payment of ₹700 using any of the methods below and upload the receipt.
                                </p>
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div className="p-6 border rounded-lg bg-light-bg dark:bg-dark-bg border-light-border dark:border-dark-border">
                            <h4 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">Payment Methods</h4>

                            {/* UPI Payment */}
                            <div className="mb-6">
                                <h5 className="font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-2 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                                    </svg>
                                    UPI Payment
                                </h5>
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-md border border-light-border dark:border-dark-border">
                                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">UPI ID:</p>
                                    <p className="text-lg font-mono font-semibold text-light-text-primary dark:text-dark-text-primary bg-gray-50 dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-700 select-all">
                                        334703265956342@cnrb
                                    </p>
                                    <div className="mt-4">
                                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">Scan QR Code to Pay:</p>
                                        <div className="flex justify-center sm:justify-start">
                                            <img
                                                src="/bank_details/QR_code.JPG"
                                                alt="Payment QR Code"
                                                className="w-48 h-auto border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bank Transfer */}
                            <div className="mb-6">
                                <h5 className="font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-2 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v2H4V6zm0 4h12v2H4v-2z" />
                                    </svg>
                                    Bank Transfer
                                </h5>
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-md border border-light-border dark:border-dark-border space-y-3">
                                    <div className="space-y-3">
                                        <div className="flex flex-col sm:flex-row sm:justify-between border-b border-light-border dark:border-dark-border pb-2">
                                            <span className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Account Holder Name</span>
                                            <span className="font-semibold text-light-text-primary dark:text-dark-text-primary text-right">Dindigul Tool Engineering Alumni Association</span>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:justify-between border-b border-light-border dark:border-dark-border pb-2">
                                            <span className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Account Number</span>
                                            <span className="font-semibold text-light-text-primary dark:text-dark-text-primary font-mono text-right select-all">120036956342</span>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:justify-between border-b border-light-border dark:border-dark-border pb-2">
                                            <span className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">IFSC Code</span>
                                            <span className="font-semibold text-light-text-primary dark:text-dark-text-primary font-mono text-right select-all">CNRB0001459</span>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:justify-between border-b border-light-border dark:border-dark-border pb-2">
                                            <span className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">MICR Code</span>
                                            <span className="font-semibold text-light-text-primary dark:text-dark-text-primary font-mono text-right select-all">625015029</span>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:justify-between border-b border-light-border dark:border-dark-border pb-2">
                                            <span className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Bank Name</span>
                                            <span className="font-semibold text-light-text-primary dark:text-dark-text-primary text-right">Canara Bank</span>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:justify-between border-b border-light-border dark:border-dark-border pb-2">
                                            <span className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Branch Name</span>
                                            <span className="font-semibold text-light-text-primary dark:text-dark-text-primary text-right">Nagal Nagar, Dindigul</span>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:justify-between border-b border-light-border dark:border-dark-border pb-2">
                                            <span className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Branch Code</span>
                                            <span className="font-semibold text-light-text-primary dark:text-dark-text-primary font-mono text-right">001459</span>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:justify-between pb-2">
                                            <span className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary sm:w-1/3">Address</span>
                                            <span className="font-semibold text-light-text-primary dark:text-dark-text-primary text-right sm:w-2/3">Varadaraja Bhavanam, 119, Railway Station Road, Nagal nagar, Dindigul-624003</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Receipt Upload */}
                            <div>
                                <h5 className="font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-2">Upload Payment Receipt</h5>
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-md border border-light-border dark:border-dark-border">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleReceiptUpload}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 dark:text-gray-400"
                                    />
                                    {errors.paymentReceipt && <p className="mt-2 text-xs text-red-500">{errors.paymentReceipt}</p>}
                                    {receiptPreview && (
                                        <div className="mt-4">
                                            <img src={receiptPreview} alt="Receipt Preview" className="rounded-lg max-h-60 border shadow-sm" />
                                        </div>
                                    )}
                                    <p className="text-xs text-light-text-secondary/70 dark:text-dark-text-secondary/70 mt-2">
                                        Please upload a clear image of your payment receipt (PNG, JPG formats supported)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-light-card dark:bg-dark-card p-6 sm:p-8 rounded-xl shadow-2xl w-full border border-light-border dark:border-dark-border">
            <Stepper currentStep={currentStep - 1} />
            <form onSubmit={(e) => e.preventDefault()} className="min-h-[300px]">
                <div className="mt-6">
                    {renderStep()}
                </div>
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between">
                        <button type="button" onClick={prevStep} disabled={currentStep === 1} className="px-4 py-2 text-sm font-medium text-light-text-primary dark:text-dark-text-primary bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50">Back</button>
                        {currentStep < 5 ? (
                            <button type="button" onClick={nextStep} className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                                {currentStep === 4 ? 'Proceed to Payment' : 'Next'}
                            </button>
                        ) : (
                            <button type="button" onClick={handleSubmit} disabled={!receiptFile} className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                Submit & Register
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
};

export default RegistrationForm;
