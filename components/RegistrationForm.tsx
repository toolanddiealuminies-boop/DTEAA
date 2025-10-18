import React, { useState, useCallback } from 'react';
import type { UserData, EmployeeExperience, EntrepreneurExperience, OpenToWorkDetails } from '../types';

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
} & { paymentReceipt?: string };


// FIX: Implement the Input component to return JSX.
const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string, optional?: boolean, error?: string }> = ({ label, id, optional, error, ...props }) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const isDate = props.type === 'date';
    return (
        <div className="relative pb-5">
            <label htmlFor={id} className="block text-sm font-medium text-[#555555] mb-1">
                {label} {optional && <span className="text-xs text-gray-400">(Optional)</span>}
            </label>
            <input
                id={id}
                ref={inputRef}
                className={`w-full px-3 py-2 text-[#2E2E2E] bg-white border ${error ? 'border-red-500' : 'border-[#DDD2B5]'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E7A700] focus:border-transparent transition-all duration-200 ${isDate && !props.value ? 'text-gray-400' : ''}`}
                {...props}
            />
            {error && <p className="mt-1 text-xs text-red-500 absolute bottom-0">{error}</p>}
        </div>
    );
};

// ... (Select, TextArea, Checkbox components are unchanged) -> Implementing for completeness.
const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: React.ReactNode; optional?: boolean; error?: string }> = ({ label, id, children, optional, error, ...props }) => (
    <div className="relative pb-5">
        <label htmlFor={id} className="block text-sm font-medium text-[#555555] mb-1">
            {label} {optional && <span className="text-xs text-gray-400">(Optional)</span>}
        </label>
        <select
            id={id}
            className={`w-full px-3 py-2 text-[#2E2E2E] bg-white border ${error ? 'border-red-500' : 'border-[#DDD2B5]'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E7A700] focus:border-transparent transition-all duration-200`}
            {...props}
        >
            {children}
        </select>
        {error && <p className="mt-1 text-xs text-red-500 absolute bottom-0">{error}</p>}
    </div>
);

const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string, optional?: boolean, error?: string }> = ({ label, id, optional, error, ...props }) => (
    <div className="relative pb-5">
        <label htmlFor={id} className="block text-sm font-medium text-[#555555] mb-1">
            {label} {optional && <span className="text-xs text-gray-400">(Optional)</span>}
        </label>
        <textarea
            id={id}
            rows={3}
            className={`w-full px-3 py-2 text-[#2E2E2E] bg-white border ${error ? 'border-red-500' : 'border-[#DDD2B5]'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E7A700] focus:border-transparent transition-all duration-200`}
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
                className="focus:ring-[#E7A700] h-4 w-4 text-[#E7A700] border-gray-300 rounded"
                {...props}
            />
        </div>
        <div className="ml-3 text-sm">
            <label htmlFor={id} className="font-medium text-[#2E2E2E]">
                {label}
            </label>
            {description && <p className="text-[#555555]">{description}</p>}
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

// FIX: Implement the Stepper component to return JSX.
const Stepper: React.FC<{ currentStep: number }> = ({ currentStep }) => {
    const steps = ['Personal', 'Contact', 'Experience', 'Review', 'Payment'];
    return (
        <div className="mb-8">
            <ol className="flex items-center w-full">
                {steps.map((step, index) => (
                    <li key={step} className={`flex w-full items-center ${index < steps.length - 1 ? "after:content-[''] after:w-full after:h-1 after:border-b after:border-4 after:inline-block" : ''} ${index <= currentStep ? 'text-[#E7A700] after:border-[#E7A700]' : 'text-gray-400 after:border-gray-200'}`}>
                        <span className={`flex items-center justify-center w-10 h-10 rounded-full lg:h-12 lg:w-12 shrink-0 ${index <= currentStep ? 'bg-[#E7A700]' : 'bg-gray-200'}`}>
                            <span className={`font-bold ${index <= currentStep ? 'text-white' : 'text-gray-600'}`}>
                                {index + 1}
                            </span>
                        </span>
                    </li>
                ))}
            </ol>
             <div className="flex justify-between mt-2 text-sm font-medium text-gray-600">
                {steps.map((step, index) => (
                    <span key={index} className={`text-center ${index === currentStep-1 ? 'text-[#E7A700] font-bold' : ''}`} style={{ flexBasis: '20%' }}>
                        {step}
                    </span>
                ))}
            </div>
        </div>
    );
};

const RegistrationForm: React.FC<RegistrationFormProps> = ({ userData, setUserData, currentStep, setCurrentStep, onRegister }) => {
    const [errors, setErrors] = useState<FormErrors>({});
    const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
    const [receiptFile, setReceiptFile] = useState<File | null>(null);

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
    
    const handleExperienceChange = <T extends EmployeeExperience | EntrepreneurExperience>(type: 'employee' | 'entrepreneur', index: number, field: keyof T) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { value, type: inputType, checked } = e.target as HTMLInputElement;
        setUserData(prev => {
            const newExperience = [...prev.experience[type]];
            newExperience[index] = {
                ...newExperience[index],
                [field]: inputType === 'checkbox' ? checked : value
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
            ? { id: `${Date.now()}`, companyName: '', designation: '', startDate: '', endDate: '', isCurrentEmployer: false }
            : { id: `${Date.now()}`, companyName: '', natureOfBusiness: '', address: '', city: '', pincode: '', state: '', country: '' };
        
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
    
    // FIX: Add prevStep and nextStep functions
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
                        <h3 className="text-xl font-semibold text-[#2E2E2E]">Personal Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                            <Input label="First Name" id="firstName" value={userData.personal.firstName} onChange={handleChange('personal', 'firstName')} error={errors.personal?.firstName} />
                            <Input label="Last Name" id="lastName" value={userData.personal.lastName} onChange={handleChange('personal', 'lastName')} error={errors.personal?.lastName} />
                            <Input label="Year of Pass Out" id="passOutYear" type="number" placeholder="YYYY" value={userData.personal.passOutYear} onChange={handleChange('personal', 'passOutYear')} error={errors.personal?.passOutYear} />
                            <Input label="Date of Birth" id="dob" type="date" value={userData.personal.dob} onChange={handleChange('personal', 'dob')} error={errors.personal?.dob} />
                            <Select label="Blood Group" id="bloodGroup" value={userData.personal.bloodGroup} onChange={handleChange('personal', 'bloodGroup')} error={errors.personal?.bloodGroup}>
                                <option value="">Select...</option>
                                <option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
                            </Select>
                            <Input label="Highest Qualification" id="highestQualification" value={userData.personal.highestQualification} onChange={handleChange('personal', 'highestQualification')} error={errors.personal?.highestQualification} />
                            <Input label="Email Address" id="email" type="email" value={userData.personal.email} disabled />
                            <Input label="Alternate Email" id="altEmail" type="email" optional value={userData.personal.altEmail} onChange={handleChange('personal', 'altEmail')} error={errors.personal?.altEmail} />
                        </div>
                    </div>
                );
            case 2: // Contact Details
                return (
                     <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-[#2E2E2E]">Contact Information</h3>
                        <TextArea label="Address" id="address" value={userData.contact.address} onChange={handleChange('contact', 'address')} error={errors.contact?.address} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                            <Input label="City" id="city" value={userData.contact.city} onChange={handleChange('contact', 'city')} error={errors.contact?.city} />
                            <Input label="State" id="state" value={userData.contact.state} onChange={handleChange('contact', 'state')} error={errors.contact?.state} />
                            <Input label="Pincode" id="pincode" type="text" value={userData.contact.pincode} onChange={handleChange('contact', 'pincode')} error={errors.contact?.pincode} />
                            <Input label="Country" id="country" value={userData.contact.country} onChange={handleChange('contact', 'country')} error={errors.contact?.country} />
                            <Input label="Mobile Number" id="mobile" type="tel" value={userData.contact.mobile} onChange={handleChange('contact', 'mobile')} error={errors.contact?.mobile} />
                            <Input label="Telephone Number" id="telephone" type="tel" optional value={userData.contact.telephone} onChange={handleChange('contact', 'telephone')} />
                        </div>
                    </div>
                );
            case 3: // Experience Details
                return (
                     <div className="space-y-8">
                        <h3 className="text-xl font-semibold text-[#2E2E2E]">Professional Experience</h3>
                        {/* Employee */}
                        <div>
                            <h4 className="font-semibold text-lg text-[#555555] mb-2">Employee Experience</h4>
                            {userData.experience.employee.map((exp, index) => (
                                <div key={exp.id} className="p-4 border rounded-lg mb-4 space-y-4 relative bg-[#F7F4EF]">
                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                                        <Input label="Company Name" value={exp.companyName} onChange={handleExperienceChange('employee', index, 'companyName')} />
                                        <Input label="Designation" value={exp.designation} onChange={handleExperienceChange('employee', index, 'designation')} />
                                        <Input label="Start Date" type="date" value={exp.startDate} onChange={handleExperienceChange('employee', index, 'startDate')} />
                                        <Input label="End Date" type="date" value={exp.endDate} onChange={handleExperienceChange('employee', index, 'endDate')} disabled={exp.isCurrentEmployer} />
                                    </div>
                                    <Checkbox label="I currently work here" checked={exp.isCurrentEmployer} onChange={handleExperienceChange('employee', index, 'isCurrentEmployer')} />
                                    <button type="button" onClick={() => removeExperience('employee', index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">&times;</button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addExperience('employee')} className="text-sm font-medium text-[#E7A700] hover:text-[#CF9500]">+ Add Employment</button>
                        </div>
                         {/* Entrepreneur */}
                        <div>
                            <h4 className="font-semibold text-lg text-[#555555] mb-2">Entrepreneur Experience</h4>
                             {userData.experience.entrepreneur.map((exp, index) => (
                                <div key={exp.id} className="p-4 border rounded-lg mb-4 space-y-4 relative bg-[#F7F4EF]">
                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                                         <Input label="Company Name" value={exp.companyName} onChange={handleExperienceChange('entrepreneur', index, 'companyName')} />
                                         <Input label="Nature of Business" value={exp.natureOfBusiness} onChange={handleExperienceChange('entrepreneur', index, 'natureOfBusiness')} />
                                         <Input label="Address" value={exp.address} onChange={handleExperienceChange('entrepreneur', index, 'address')} />
                                         <Input label="City" value={exp.city} onChange={handleExperienceChange('entrepreneur', index, 'city')} />
                                     </div>
                                    <button type="button" onClick={() => removeExperience('entrepreneur', index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">&times;</button>
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
                                onChange={(e) => setUserData(prev => ({...prev, experience: {...prev.experience, isOpenToWork: e.target.checked}}))} />

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
                    <div>
                         <h3 className="text-xl font-semibold text-[#2E2E2E] mb-4">Review Your Information</h3>
                         <p className="text-sm text-[#555555] mb-6">Please review all the information you have provided. You can go back to edit any details before proceeding to payment.</p>
                         {/* A summary view could be displayed here. For simplicity, we just show a confirmation message. */}
                    </div>
                );
            case 5: // Payment
                 return (
                    <div>
                        <h3 className="text-xl font-semibold text-[#2E2E2E] mb-2">Final Step: Payment</h3>
                        <p className="text-sm text-[#555555] mb-6">Please complete the payment and upload the receipt to finalize your registration.</p>
                        <div className="p-6 border rounded-lg bg-[#F7F4EF]">
                            {/* Payment details would go here */}
                            <p className="font-semibold mb-4">Upload your payment receipt:</p>
                            <input type="file" accept="image/*" onChange={handleReceiptUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#E7A700]/20 file:text-[#CF9500] hover:file:bg-[#E7A700]/30"/>
                            {errors.paymentReceipt && <p className="mt-2 text-xs text-red-500">{errors.paymentReceipt}</p>}
                            {receiptPreview && <img src={receiptPreview} alt="Receipt Preview" className="mt-4 rounded-lg max-h-60 border" />}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };
    
    return (
        <div className="bg-[#FFF9EE] p-6 sm:p-8 rounded-xl shadow-2xl w-full border border-[#DDD2B5]">
            <Stepper currentStep={currentStep - 1} />
            <form onSubmit={(e) => e.preventDefault()} className="min-h-[300px]">
                <div className="mt-6">
                    {renderStep()}
                </div>
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex justify-between">
                        <button type="button" onClick={prevStep} disabled={currentStep === 1} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E7A700] disabled:opacity-50">Back</button>
                        {currentStep < 5 ? (
                            <button type="button" onClick={nextStep} className="px-4 py-2 text-sm font-medium text-white bg-[#E7A700] border border-transparent rounded-md shadow-sm hover:bg-[#CF9500] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E7A700]">
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
