import React, { useState, useCallback } from 'react';
import type { UserData, EmployeeExperience, EntrepreneurExperience, OpenToWorkDetails } from '../types';

// A type for the errors state. It's a deeply nested partial of UserData with string values for each field.
// FIX: Corrected FormErrors type to handle primitive properties on UserData.
// The original type incorrectly tried to map over properties of primitive types like 'string',
// causing a type mismatch for fields like 'paymentReceipt'.
// This new definition correctly assigns 'string' for primitive types and recursively maps object types.
type FormErrors = {
  [P in keyof UserData]?: UserData[P] extends object ? {
    [K in keyof UserData[P]]?: UserData[P][K] extends object[]
      ? (
          { [EK in keyof UserData[P][K][number]]?: string } | undefined
        )[]
      : UserData[P][K] extends object
      ? { [SK in keyof UserData[P][K]]?: string }
      : string;
  } : string;
};


// UI Components defined outside the main component
const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string, optional?: boolean, error?: string }> = ({ label, id, optional, error, ...props }) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const isDate = props.type === 'date';

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        if (isDate) {
            e.target.type = 'date';
        }
        if (props.onFocus) {
            props.onFocus(e);
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        if (isDate && !e.target.value) {
            e.target.type = 'text';
        }
        if (props.onBlur) {
            props.onBlur(e);
        }
    };

    const handleIconClick = () => {
        const input = inputRef.current;
        if (!input) return;
        input.type = 'date';
        try {
            input.showPicker();
        } catch (error) {
            input.focus();
        }
    };
    
    return (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-[#555555] mb-1">
            {label} {optional && <span className="text-[#999]">(Optional)</span>}
        </label>
        <div className="relative">
            <input
                id={id}
                ref={inputRef}
                className={`w-full bg-white text-[#2E2E2E] placeholder:text-[#999] px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#FFF9EE] transition duration-200 
                ${isDate ? 'pr-10' : ''}
                ${error ? 'border-red-500 focus:ring-red-500' : 'border-[#DDD2B5] focus:ring-[#E7A700]'}`}
                onFocus={handleFocus}
                onBlur={handleBlur}
                type={isDate && !props.value ? 'text' : props.type}
                placeholder={isDate ? 'DD / MM / YYYY' : props.placeholder}
                aria-invalid={!!error}
                aria-describedby={error ? `${id}-error` : undefined}
                {...props}
            />
            {isDate && (
                 <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={handleIconClick}>
                    <svg className="h-5 w-5 text-[#999]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.75 3a.75.75 0 01.75.75V4h7V3.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V3.75A.75.75 0 015.75 3zM4.5 8.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zM4 10.75a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zM10 13.5a.75.75 0 000 1.5h4a.75.75 0 000-1.5h-4z" clipRule="evenodd" />
                    </svg>
                 </div>
            )}
        </div>
        {error && <p id={`${id}-error`} className="mt-1 text-xs text-red-600 animate-fade-in">{error}</p>}
    </div>
)};

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string, error?: string }> = ({ label, id, children, error, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-[#555555] mb-1">{label}</label>
        <select
            id={id}
            className={`w-full bg-white text-[#2E2E2E] px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#FFF9EE] transition duration-200
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-[#DDD2B5] focus:ring-[#E7A700]'}`}
             aria-invalid={!!error}
             aria-describedby={error ? `${id}-error` : undefined}
            {...props}
        >
            {children}
        </select>
        {error && <p id={`${id}-error`} className="mt-1 text-xs text-red-600 animate-fade-in">{error}</p>}
    </div>
);

const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string, error?: string }> = ({ label, id, error, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-[#555555] mb-1">{label}</label>
        <textarea
            id={id}
            rows={3}
            className={`w-full bg-white text-[#2E2E2E] placeholder:text-[#555555] px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#FFF9EE] transition duration-200
             ${error ? 'border-red-500 focus:ring-red-500' : 'border-[#DDD2B5] focus:ring-[#E7A700]'}`}
             aria-invalid={!!error}
             aria-describedby={error ? `${id}-error` : undefined}
            {...props}
        />
        {error && <p id={`${id}-error`} className="mt-1 text-xs text-red-600 animate-fade-in">{error}</p>}
    </div>
);

const Checkbox: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, id, ...props }) => (
    <div className="flex items-center">
        <input
            id={id}
            type="checkbox"
            className="h-4 w-4 text-[#E7A700] border-gray-300 rounded focus:ring-[#E7A700]"
            {...props}
        />
        <label htmlFor={id} className="ml-2 block text-sm text-[#2E2E2E]">{label}</label>
    </div>
);


interface RegistrationFormProps {
    userData: UserData;
    setUserData: React.Dispatch<React.SetStateAction<UserData>>;
    currentStep: number;
    setCurrentStep: (step: number) => void;
    onRegister: () => void;
}

const Stepper: React.FC<{ currentStep: number }> = ({ currentStep }) => {
    const steps = ['Personal', 'Contact', 'Experience', 'Review', 'Payment'];
    const activeColor = '#E7A700';
    const inactiveColor = '#D8C9A7';
    const activeTextColor = '#2E2E2E';
    const inactiveTextColor = '#555555';

    return (
        <nav aria-label="Progress" className="mb-12">
            <ol role="list" className="flex items-center justify-between">
                {steps.map((step, stepIdx) => (
                    <li key={step} className={`relative ${stepIdx !== steps.length - 1 ? 'flex-1' : ''}`}>
                         <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className={`h-1 w-full transition-colors duration-500 ${stepIdx < currentStep ? 'bg-[#E7A700]' : 'bg-[#D8C9A7]'}`}></div>
                        </div>
                        <div className="relative w-10 h-10 flex items-center justify-center bg-white border-2 rounded-full transition-colors duration-500"
                             style={{ borderColor: stepIdx <= currentStep ? activeColor : inactiveColor }}>
                            <span className="text-lg font-semibold transition-colors duration-500" style={{ color: stepIdx <= currentStep ? activeColor : inactiveTextColor }}>
                                {stepIdx + 1}
                            </span>
                        </div>
                        <span className="absolute top-12 text-sm text-center w-max -translate-x-1/2 left-1/2 font-medium"
                          style={{ color: stepIdx <= currentStep ? activeTextColor : inactiveTextColor }}
                        >
                          {step}
                        </span>
                    </li>
                ))}
            </ol>
        </nav>
    );
};

const RegistrationForm: React.FC<RegistrationFormProps> = ({ userData, setUserData, currentStep, setCurrentStep, onRegister }) => {
    const [errors, setErrors] = useState<FormErrors>({});
    const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

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
            case 'contact.address': return value ? '' : requiredMsg;
            case 'contact.city': return value ? '' : requiredMsg;
            case 'contact.state': return value ? '' : requiredMsg;
            case 'contact.country': return value ? '' : requiredMsg;
            case 'contact.pincode':
                if (!value) return requiredMsg;
                if (!/^\d{5,6}$/.test(value)) return "Please enter a valid 5 or 6 digit pincode.";
                return '';
            case 'contact.mobile':
                if (!value) return requiredMsg;
                if (!/^\+?\d{10,15}$/.test(value)) return "Please enter a valid mobile number.";
                return '';
            default: return '';
        }
    }, [userData]);


    const handleChange = (section: keyof UserData, field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { value } = e.target;
        setUserData(prev => {
           const newData = {
                ...prev,
                [section]: {
                    ...(prev[section] as any),
                    [field]: value
                }
            };
            const error = validateField(section, field, value, newData);
            setErrors(prevErrors => ({
                ...prevErrors,
                [section]: {
                    ...(prevErrors[section] as any),
                    [field]: error
                }
            }));
            return newData;
        });
    };

    const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setUserData(prev => ({ ...prev, paymentReceipt: base64String }));
                setReceiptPreview(base64String);
                setErrors(prev => ({ ...prev, paymentReceipt: undefined }));
            };
            reader.readAsDataURL(file);
        } else {
            setUserData(prev => ({ ...prev, paymentReceipt: '' }));
            setReceiptPreview(null);
            if (file) { // If a file was selected but it's not an image
              setErrors(prev => ({ ...prev, paymentReceipt: "Please upload a valid image file (PNG, JPG)." }));
            }
        }
    };

    const handleEmployeeChange = (index: number, field: keyof EmployeeExperience) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, type, checked } = e.target;
        const isCheckbox = type === 'checkbox';
        const fieldValue = isCheckbox ? checked : value;
        
        setUserData(prev => {
            const newEmployeeData = [...prev.experience.employee];
            const currentEmployee = { ...newEmployeeData[index] };
            (currentEmployee as any)[field] = fieldValue;

            if (field === 'isCurrentEmployer' && checked) {
                currentEmployee.endDate = '';
            }
            newEmployeeData[index] = currentEmployee;
            
            if (field === 'isCurrentEmployer') {
                const endDateError = checked ? '' : (currentEmployee.endDate ? '' : 'This field is required.');
                setErrors(errs => {
                    const empErrors = [...(errs.experience?.employee || [])];
                    empErrors[index] = { ...empErrors[index], endDate: endDateError };
                    return { ...errs, experience: { ...errs.experience, employee: empErrors } };
                });
             }

            return { ...prev, experience: { ...prev.experience, employee: newEmployeeData } };
        });

        let error = '';
        if (field === 'companyName' && !fieldValue) error = "Company name is required.";
        if (field === 'designation' && !fieldValue) error = "Designation is required.";
        if (field === 'startDate' && !fieldValue) error = "Start date is required.";
        
        setErrors(prev => {
            const empErrors = [...(prev.experience?.employee || [])];
            empErrors[index] = { ...empErrors[index], [field]: error };
            return { ...prev, experience: { ...prev.experience, employee: empErrors } };
        });
    };
    
    const handleEntrepreneurChange = (index: number, field: keyof EntrepreneurExperience) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { value } = e.target;
        setUserData(prev => ({
            ...prev, experience: { ...prev.experience,
                entrepreneur: prev.experience.entrepreneur.map((item, i) => i === index ? {...item, [field]: value} : item)
            }
        }));

        const error = value ? '' : 'This field is required.';
        setErrors(prev => {
            const entErrors = [...(prev.experience?.entrepreneur || [])];
            entErrors[index] = { ...entErrors[index], [field]: error };
            return { ...prev, experience: { ...prev.experience, entrepreneur: entErrors } };
        });
    };

    const handleOpenToWorkDetailsChange = (field: keyof OpenToWorkDetails) => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { value } = e.target;
        setUserData(prev => ({
            ...prev,
            experience: {
                ...prev.experience,
                openToWorkDetails: { ...prev.experience.openToWorkDetails, [field]: value }
            }
        }));
    };

    const addEmployeeExperience = () => {
        setUserData(prev => ({
            ...prev,
            experience: {
                ...prev.experience,
                employee: [...prev.experience.employee, { id: `emp_${Date.now()}`, companyName: '', designation: '', startDate: '', endDate: '', isCurrentEmployer: false }]
            }
        }))
    }

    const removeEmployeeExperience = (id: string) => {
        const indexToRemove = userData.experience.employee.findIndex(exp => exp.id === id);
        setUserData(prev => ({
            ...prev,
            experience: {
                ...prev.experience,
                employee: prev.experience.employee.filter(exp => exp.id !== id)
            }
        }));
        setErrors(prev => {
            const empErrors = [...(prev.experience?.employee || [])];
            if(indexToRemove > -1) empErrors.splice(indexToRemove, 1);
            return {...prev, experience: {...prev.experience, employee: empErrors }};
        });
    }

    const addEntrepreneurExperience = () => {
      setUserData(prev => ({
          ...prev,
          experience: {
              ...prev.experience,
              entrepreneur: [...prev.experience.entrepreneur, { id: `ent_${Date.now()}`, companyName: '', natureOfBusiness: '', address: '', city: '', pincode: '', state: '', country: '' }]
          }
      }))
    }
    
    const removeEntrepreneurExperience = (id: string) => {
        const indexToRemove = userData.experience.entrepreneur.findIndex(exp => exp.id === id);
        setUserData(prev => ({
            ...prev,
            experience: {
                ...prev.experience,
                entrepreneur: prev.experience.entrepreneur.filter(exp => exp.id !== id)
            }
        }));
        setErrors(prev => {
            const entErrors = [...(prev.experience?.entrepreneur || [])];
            if(indexToRemove > -1) entErrors.splice(indexToRemove, 1);
            return {...prev, experience: {...prev.experience, entrepreneur: entErrors }};
        });
    }

    const validateStep = (step: number) => {
        const newErrors: FormErrors = {};
        let isValid = true;
        
        const checkFields = (section: keyof UserData, fields: string[]) => {
            const sectionErrors: { [key: string]: string } = {};
            fields.forEach(field => {
                const error = validateField(section, field, (userData[section] as any)[field]);
                if (error) {
                    sectionErrors[field] = error;
                    isValid = false;
                }
            });
            if (Object.keys(sectionErrors).length > 0) (newErrors as any)[section] = sectionErrors;
        };

        if (step === 1) {
            checkFields('personal', ['firstName', 'lastName', 'passOutYear', 'dob', 'bloodGroup', 'highestQualification', 'altEmail']);
        } else if (step === 2) {
            checkFields('contact', ['address', 'city', 'state', 'pincode', 'country', 'mobile']);
        }
        
        setErrors(prev => ({ ...prev, ...newErrors }));
        return isValid;
    };
    
    const nextStep = () => {
        if (validateStep(currentStep)) {
           setCurrentStep(currentStep + 1);
        }
    };
    const prevStep = () => setCurrentStep(currentStep - 1);

    const renderStep = () => {
       const ReviewDetailItem: React.FC<{ label: string; value?: string | React.ReactNode }> = ({ label, value }) => {
            const hasValue = value && (typeof value !== 'string' || value.trim() !== '');
            return (
                <div>
                    <p className="text-sm font-medium text-[#555555]">{label}</p>
                    <p className="text-md text-[#2E2E2E] mt-1">{hasValue ? value : <span className="text-gray-400 italic">Not provided</span>}</p>
                </div>
            );
        };

        switch (currentStep) {
            case 1:
                return (
                    <div className="animate-slide-up space-y-4">
                        <h3 className="text-xl font-semibold text-[#2E2E2E] border-b pb-2">Personal Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="First Name" id="firstName" value={userData.personal.firstName} onChange={handleChange('personal', 'firstName')} required error={errors.personal?.firstName} />
                            <Input label="Last Name" id="lastName" value={userData.personal.lastName} onChange={handleChange('personal', 'lastName')} required error={errors.personal?.lastName}/>
                            <Input label="Year of Pass Out" id="passOutYear" type="number" placeholder="YYYY" value={userData.personal.passOutYear} onChange={handleChange('personal', 'passOutYear')} required error={errors.personal?.passOutYear}/>
                            <Input label="Date of Birth" id="dob" type="date" value={userData.personal.dob} onChange={handleChange('personal', 'dob')} required error={errors.personal?.dob}/>
                            <Select label="Blood Group" id="bloodGroup" value={userData.personal.bloodGroup} onChange={handleChange('personal', 'bloodGroup')} required error={errors.personal?.bloodGroup}>
                                <option value="">Select Blood Group</option>
                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                            </Select>
                            <Input label="Highest Qualification" id="highestQualification" value={userData.personal.highestQualification} onChange={handleChange('personal', 'highestQualification')} required error={errors.personal?.highestQualification}/>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-[#555555] mb-1">Email</label>
                                <div id="email" className="w-full bg-[#F0ECE4] text-[#999] px-3 py-2 rounded-lg cursor-not-allowed">{userData.personal.email}</div>
                            </div>
                            <Input label="Alternative Email" optional id="altEmail" type="email" value={userData.personal.altEmail} onChange={handleChange('personal', 'altEmail')} error={errors.personal?.altEmail}/>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="animate-slide-up space-y-4">
                        <h3 className="text-xl font-semibold text-[#2E2E2E] border-b pb-2">Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <TextArea label="Address" id="address" value={userData.contact.address} onChange={handleChange('contact', 'address')} required error={errors.contact?.address}/>
                            </div>
                            <Input label="City" id="city" value={userData.contact.city} onChange={handleChange('contact', 'city')} required error={errors.contact?.city}/>
                            <Input label="State" id="state" value={userData.contact.state} onChange={handleChange('contact', 'state')} required error={errors.contact?.state}/>
                            <Input label="Pin code / Zip code" id="pincode" value={userData.contact.pincode} onChange={handleChange('contact', 'pincode')} required error={errors.contact?.pincode}/>
                            <Input label="Country" id="country" value={userData.contact.country} onChange={handleChange('contact', 'country')} required error={errors.contact?.country}/>
                            <Input label="Mobile Number" id="mobile" type="tel" value={userData.contact.mobile} onChange={handleChange('contact', 'mobile')} required error={errors.contact?.mobile}/>
                            <Input label="Telephone Number" optional id="telephone" type="tel" value={userData.contact.telephone} onChange={handleChange('contact', 'telephone')} error={errors.contact?.telephone}/>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="animate-slide-up space-y-8">
                        <h3 className="text-xl font-semibold text-[#2E2E2E] border-b pb-2">Experience Details</h3>
                        <div className="space-y-4">
                            <h4 className="font-semibold text-lg text-[#2E2E2E]">Employment History</h4>
                            {userData.experience.employee.map((exp, index) => (
                                <div key={exp.id} className="p-4 border rounded-lg relative space-y-4 bg-white">
                                    <button onClick={() => removeEmployeeExperience(exp.id)} className="absolute top-2 right-2 text-2xl font-bold text-red-500 hover:text-red-700 leading-none">&times;</button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input label="Company Name" id={`emp-company-${index}`} value={exp.companyName} onChange={handleEmployeeChange(index, 'companyName')} error={errors.experience?.employee?.[index]?.companyName}/>
                                        <Input label="Designation" id={`emp-designation-${index}`} value={exp.designation} onChange={handleEmployeeChange(index, 'designation')} error={errors.experience?.employee?.[index]?.designation}/>
                                        <Input label="Employment Start" id={`emp-start-${index}`} type="date" value={exp.startDate} onChange={handleEmployeeChange(index, 'startDate')} error={errors.experience?.employee?.[index]?.startDate}/>
                                        <Input label="Employment End" id={`emp-end-${index}`} type="date" value={exp.endDate} onChange={handleEmployeeChange(index, 'endDate')} disabled={exp.isCurrentEmployer} error={errors.experience?.employee?.[index]?.endDate}/>
                                        <div className="md:col-span-2 pt-2"><Checkbox label="Current Employer" id={`emp-current-${index}`} checked={exp.isCurrentEmployer} onChange={handleEmployeeChange(index, 'isCurrentEmployer')} /></div>
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={addEmployeeExperience} className="text-sm font-semibold text-[#E7A700] hover:text-[#CF9500] transition">+ Add Employment</button>
                        </div>
                        <div className="space-y-4 pt-4 border-t">
                             <h4 className="font-semibold text-lg text-[#2E2E2E]">Entrepreneurial Ventures</h4>
                             {userData.experience.entrepreneur.map((exp, index) => (
                                 <div key={exp.id} className="p-4 border rounded-lg relative space-y-4 bg-white">
                                    <button onClick={() => removeEntrepreneurExperience(exp.id)} className="absolute top-2 right-2 text-2xl font-bold text-red-500 hover:text-red-700 leading-none">&times;</button>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input label="Company Name" id={`ent-company-${index}`} value={exp.companyName} onChange={handleEntrepreneurChange(index, 'companyName')} error={errors.experience?.entrepreneur?.[index]?.companyName}/>
                                        <Input label="Nature of Business" id={`ent-business-${index}`} value={exp.natureOfBusiness} onChange={handleEntrepreneurChange(index, 'natureOfBusiness')} error={errors.experience?.entrepreneur?.[index]?.natureOfBusiness}/>
                                        <div className="md:col-span-2"><TextArea label="Company Address" id={`ent-address-${index}`} value={exp.address} onChange={handleEntrepreneurChange(index, 'address')} error={errors.experience?.entrepreneur?.[index]?.address}/></div>
                                        <Input label="City" id={`ent-city-${index}`} value={exp.city} onChange={handleEntrepreneurChange(index, 'city')} error={errors.experience?.entrepreneur?.[index]?.city}/>
                                        <Input label="State" id={`ent-state-${index}`} value={exp.state} onChange={handleEntrepreneurChange(index, 'state')} error={errors.experience?.entrepreneur?.[index]?.state}/>
                                        <Input label="Pin code / Zip Code" id={`ent-pincode-${index}`} value={exp.pincode} onChange={handleEntrepreneurChange(index, 'pincode')} error={errors.experience?.entrepreneur?.[index]?.pincode}/>
                                        <Input label="Country" id={`ent-country-${index}`} value={exp.country} onChange={handleEntrepreneurChange(index, 'country')} error={errors.experience?.entrepreneur?.[index]?.country}/>
                                    </div>
                                 </div>
                             ))}
                            <button type="button" onClick={addEntrepreneurExperience} className="text-sm font-semibold text-[#E7A700] hover:text-[#CF9500] transition">+ Add Venture</button>
                        </div>
                        <div className="space-y-4 pt-4 border-t">
                            <Checkbox 
                                label="I am currently open to work"
                                id="isOpenToWork"
                                checked={userData.experience.isOpenToWork}
                                onChange={(e) => setUserData(prev => ({...prev, experience: {...prev.experience, isOpenToWork: e.target.checked }}))}
                            />
                            {userData.experience.isOpenToWork && (
                                <div className="p-4 border rounded-lg space-y-4 bg-white">
                                    <TextArea label="Technical Skills" id="otw-tech" value={userData.experience.openToWorkDetails.technicalSkills} onChange={handleOpenToWorkDetailsChange('technicalSkills')} />
                                    <TextArea label="Certifications" id="otw-certs" value={userData.experience.openToWorkDetails.certifications} onChange={handleOpenToWorkDetailsChange('certifications')} />
                                    <TextArea label="Soft Skills" id="otw-soft" value={userData.experience.openToWorkDetails.softSkills} onChange={handleOpenToWorkDetailsChange('softSkills')} />
                                    <TextArea label="Other" id="otw-other" value={userData.experience.openToWorkDetails.other} onChange={handleOpenToWorkDetailsChange('other')} />
                                </div>
                            )}
                        </div>
                    </div>
                );
             case 4:
                return (
                    <div className="animate-slide-up space-y-6">
                        <h3 className="text-2xl font-bold text-[#2E2E2E] border-b pb-3 mb-4">Review Your Details</h3>
                        
                        <div className="p-5 border rounded-lg bg-white">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-semibold text-lg text-[#2E2E2E]">Personal Details</h4>
                                <button onClick={() => setCurrentStep(1)} className="text-sm font-medium text-[#E7A700] hover:underline">Edit</button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                                <ReviewDetailItem label="Full Name" value={`${userData.personal.firstName} ${userData.personal.lastName}`} />
                                <ReviewDetailItem label="Pass Out Year" value={userData.personal.passOutYear} />
                                <ReviewDetailItem label="Date of Birth" value={userData.personal.dob} />
                                <ReviewDetailItem label="Blood Group" value={userData.personal.bloodGroup} />
                                <ReviewDetailItem label="Highest Qualification" value={userData.personal.highestQualification} />
                                <ReviewDetailItem label="Email" value={userData.personal.email} />
                                <ReviewDetailItem label="Alternative Email" value={userData.personal.altEmail} />
                            </div>
                        </div>

                        <div className="p-5 border rounded-lg bg-white">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-semibold text-lg text-[#2E2E2E]">Contact Information</h4>
                                <button onClick={() => setCurrentStep(2)} className="text-sm font-medium text-[#E7A700] hover:underline">Edit</button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                                <div className="sm:col-span-2">
                                    <ReviewDetailItem 
                                        label="Full Address" 
                                        value={[userData.contact.address, userData.contact.city, userData.contact.state, userData.contact.pincode, userData.contact.country].filter(Boolean).join(', ')} 
                                    />
                                </div>
                                <ReviewDetailItem label="Mobile Number" value={userData.contact.mobile} />
                                <ReviewDetailItem label="Telephone Number" value={userData.contact.telephone} />
                            </div>
                        </div>

                        {(userData.experience.employee.length > 0 || userData.experience.entrepreneur.length > 0 || userData.experience.isOpenToWork) && (
                             <div className="p-5 border rounded-lg bg-white">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-semibold text-lg text-[#2E2E2E]">Experience Details</h4>
                                    <button onClick={() => setCurrentStep(3)} className="text-sm font-medium text-[#E7A700] hover:underline">Edit</button>
                                </div>
                                <div className="space-y-4">
                                    {userData.experience.employee.map((exp, index) => (
                                        <div key={exp.id} className={`pt-4 ${index === 0 ? 'pt-0' : 'border-t mt-4'}`}>
                                            <p className="font-semibold text-md text-[#2E2E2E]">{exp.companyName}</p>
                                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                                                <ReviewDetailItem label="Designation" value={exp.designation} />
                                                <ReviewDetailItem label="Duration" value={`${exp.startDate} to ${exp.isCurrentEmployer ? 'Present' : exp.endDate}`} />
                                            </div>
                                        </div>
                                    ))}

                                    {userData.experience.entrepreneur.map((exp, index) => (
                                      <div key={exp.id} className={`pt-4 ${index === 0 && userData.experience.employee.length === 0 ? 'pt-0' : 'border-t mt-4'}`}>
                                          <p className="font-semibold text-md text-[#2E2E2E]">{exp.companyName}</p>
                                          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                                              <ReviewDetailItem label="Nature of Business" value={exp.natureOfBusiness} />
                                              <div className="sm:col-span-2">
                                                  <ReviewDetailItem label="Company Address" value={[exp.address, exp.city, exp.state, exp.pincode, exp.country].filter(Boolean).join(', ')} />
                                              </div>
                                          </div>
                                      </div>
                                    ))}
                                  
                                    {userData.experience.isOpenToWork && (
                                      <div className={`pt-4 ${(userData.experience.employee.length > 0 || userData.experience.entrepreneur.length > 0) ? 'border-t mt-4' : ''}`}>
                                        <p className="font-semibold text-md text-green-600">Open to Work</p>
                                        <div className="mt-2 grid grid-cols-1 gap-y-4 text-sm">
                                            <ReviewDetailItem label="Technical Skills" value={<p className="whitespace-pre-wrap">{userData.experience.openToWorkDetails.technicalSkills}</p>} />
                                            <ReviewDetailItem label="Certifications" value={<p className="whitespace-pre-wrap">{userData.experience.openToWorkDetails.certifications}</p>} />
                                            <ReviewDetailItem label="Soft Skills" value={<p className="whitespace-pre-wrap">{userData.experience.openToWorkDetails.softSkills}</p>} />
                                            <ReviewDetailItem label="Other" value={<p className="whitespace-pre-wrap">{userData.experience.openToWorkDetails.other}</p>} />
                                        </div>
                                      </div>
                                    )}
                                </div>
                             </div>
                        )}
                    </div>
                );
            case 5:
              return (
                <div className="animate-slide-up space-y-6">
                    <h3 className="text-2xl font-bold text-[#2E2E2E] border-b pb-3 mb-4">Payment & Submission</h3>
                    
                    {/* Fee Details */}
                    <div className="p-5 border rounded-lg bg-white">
                        <h4 className="font-semibold text-lg text-[#2E2E2E] mb-4">Fee Structure</h4>
                        <ul className="space-y-2 text-[#555555]">
                            <li className="flex justify-between"><span>Entry Fee (One-time)</span> <span className="font-medium text-[#2E2E2E]">₹100</span></li>
                            <li className="flex justify-between"><span>Membership Fee (Yearly)</span> <span className="font-medium text-[#2E2E2E]">₹600</span></li>
                            <li className="flex justify-between border-t pt-2 font-bold text-[#2E2E2E]"><span>Total Amount</span> <span>₹700</span></li>
                        </ul>
                    </div>

                    {/* Payment Instructions */}
                    <div className="p-5 border rounded-lg bg-white">
                        <h4 className="font-semibold text-lg text-[#2E2E2E] mb-4">Payment Methods</h4>
                        <div className="space-y-4">
                            <div>
                                <p className="font-semibold">UPI</p>
                                <p className="text-md text-[#555555] bg-[#F7F4EF] p-2 rounded-md mt-1">dtee@icici.com</p>
                            </div>
                            <div>
                                <p className="font-semibold">Bank Account</p>
                                <div className="text-md text-[#555555] bg-[#F7F4EF] p-2 rounded-md mt-1 space-y-1">
                                    <p><strong>Account Holder:</strong> Dindigul Tool Engineering Alumni Association</p>
                                    <p><strong>Account Number:</strong> 012345678901</p>
                                    <p><strong>Bank:</strong> ICICI Bank, Dindigul Branch</p>
                                    <p><strong>IFSC Code:</strong> ICIC0001234</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Receipt Upload */}
                    <div className="p-5 border rounded-lg bg-white">
                        <h4 className="font-semibold text-lg text-[#2E2E2E] mb-2">Upload Receipt</h4>
                        <p className="text-sm text-[#555555] mb-4">Please upload a screenshot of your transaction as proof of payment.</p>
                        <input
                            type="file"
                            id="receiptUpload"
                            className="hidden"
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={handleReceiptUpload}
                        />
                        <label htmlFor="receiptUpload" className="cursor-pointer inline-flex items-center justify-center px-4 py-2 bg-[#F7F4EF] border border-[#DDD2B5] rounded-lg shadow-sm text-md font-medium text-[#2E2E2E] hover:bg-[#F0ECE4]">
                           Choose File...
                        </label>
                        {receiptPreview && (
                            <div className="mt-4">
                                <p className="text-sm font-medium text-[#555555] mb-2">Receipt Preview:</p>
                                <img src={receiptPreview} alt="Receipt Preview" className="max-w-xs rounded-md border p-1" />
                            </div>
                        )}
                        {errors.paymentReceipt && <p className="mt-2 text-xs text-red-600 animate-fade-in">{errors.paymentReceipt}</p>}
                    </div>
                </div>
              );
            default: return null;
        }
    }
    
    return (
        <div className="bg-[#FFF9EE] p-6 sm:p-8 rounded-xl shadow-2xl w-full border border-[#DDD2B5]">
            <Stepper currentStep={currentStep - 1} />
            <form onSubmit={(e) => e.preventDefault()}>
                <div className="mt-6">
                    {renderStep()}
                </div>
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex justify-between">
                        <button
                            type="button"
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className="px-5 py-2 bg-transparent border border-[#DDD2B5] text-[#555555] rounded-lg font-semibold hover:bg-[#F0ECE4] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                        >
                            Back
                        </button>
                        {currentStep < 5 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="px-5 py-2 bg-[#E7A700] text-white rounded-lg font-semibold hover:bg-[#CF9500] transition-all duration-300 transform hover:scale-105"
                            >
                                {currentStep === 4 ? 'Proceed to Payment' : 'Next'}
                            </button>
                        ) : (
                             <button
                                type="button"
                                onClick={onRegister}
                                disabled={!userData.paymentReceipt}
                                className="px-5 py-2 bg-[#E7A700] text-white rounded-lg font-semibold hover:bg-[#CF9500] disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                            >
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