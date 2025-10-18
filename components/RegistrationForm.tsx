import React from 'react';
import type { UserData, EmployeeExperience, EntrepreneurExperience, OpenToWorkDetails } from '../types';

// UI Components defined outside the main component

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string, optional?: boolean }> = ({ label, id, optional, ...props }) => {
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

        // Ensure the input is of type 'date' before trying to show the picker
        input.type = 'date';
        
        try {
            input.showPicker();
        } catch (error) {
            // Fallback for browsers that don't support showPicker() or if it fails
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
                className={`w-full bg-white text-[#2E2E2E] placeholder:text-[#999] px-3 py-2 border border-[#DDD2B5] rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#FFF9EE] focus:ring-[#E7A700] transition duration-200 
                ${isDate ? 'pr-10' : ''}`}
                onFocus={handleFocus}
                onBlur={handleBlur}
                // Render as 'text' initially if it's a date field with no value to show the placeholder
                type={isDate && !props.value ? 'text' : props.type}
                placeholder={isDate ? 'DD / MM / YYYY' : props.placeholder}
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
    </div>
)};

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }> = ({ label, id, children, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-[#555555] mb-1">{label}</label>
        <select
            id={id}
            className="w-full bg-white text-[#2E2E2E] px-3 py-2 border border-[#DDD2B5] rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#FFF9EE] focus:ring-[#E7A700] transition duration-200"
            {...props}
        >
            {children}
        </select>
    </div>
);

const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }> = ({ label, id, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-[#555555] mb-1">{label}</label>
        <textarea
            id={id}
            rows={3}
            className="w-full bg-white text-[#2E2E2E] placeholder:text-[#555555] px-3 py-2 border border-[#DDD2B5] rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#FFF9EE] focus:ring-[#E7A700] transition duration-200"
            {...props}
        />
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
    const steps = ['Personal', 'Contact', 'Experience', 'Review'];
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

    const handleChange = (section: keyof UserData, field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { value } = e.target;
        setUserData(prev => ({
            ...prev,
            [section]: {
                ...(prev[section] as any),
                [field]: value
            }
        }));
    };

    const handleEmployeeChange = (index: number, field: keyof EmployeeExperience) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, type, checked } = e.target;
        const isCheckbox = type === 'checkbox';
        const newEmployeeData = [...userData.experience.employee];
        const currentEmployee = { ...newEmployeeData[index] };
        (currentEmployee as any)[field] = isCheckbox ? checked : value;

        if (field === 'isCurrentEmployer' && checked) {
            currentEmployee.endDate = '';
        }
        newEmployeeData[index] = currentEmployee;
        setUserData(prev => ({ ...prev, experience: { ...prev.experience, employee: newEmployeeData } }));
    };

    const handleEntrepreneurChange = (index: number, field: keyof EntrepreneurExperience) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { value } = e.target;
        const newEntrepreneurData = [...userData.experience.entrepreneur];
        (newEntrepreneurData[index] as any)[field] = value;
        setUserData(prev => ({ ...prev, experience: { ...prev.experience, entrepreneur: newEntrepreneurData } }));
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
        setUserData(prev => ({
            ...prev,
            experience: {
                ...prev.experience,
                employee: prev.experience.employee.filter(exp => exp.id !== id)
            }
        }))
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
        setUserData(prev => ({
            ...prev,
            experience: {
                ...prev.experience,
                entrepreneur: prev.experience.entrepreneur.filter(exp => exp.id !== id)
            }
        }))
    }

    const nextStep = () => setCurrentStep(currentStep + 1);
    const prevStep = () => setCurrentStep(currentStep - 1);

    const renderStep = () => {
        const ReviewItem: React.FC<{ label: string; value?: string | React.ReactNode }> = ({ label, value }) => (
            value ? <div><strong className="font-semibold text-[#2E2E2E]">{label}:</strong> {value}</div> : null
        );

        switch (currentStep) {
            case 1:
                return (
                    <div className="animate-slide-up space-y-4">
                        <h3 className="text-xl font-semibold text-[#2E2E2E] border-b pb-2">Personal Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="First Name" id="firstName" value={userData.personal.firstName} onChange={handleChange('personal', 'firstName')} required />
                            <Input label="Last Name" id="lastName" value={userData.personal.lastName} onChange={handleChange('personal', 'lastName')} required />
                            <Input label="Year of Pass Out" id="passOutYear" type="number" placeholder="YYYY" value={userData.personal.passOutYear} onChange={handleChange('personal', 'passOutYear')} required />
                            <Input label="Date of Birth" id="dob" type="date" value={userData.personal.dob} onChange={handleChange('personal', 'dob')} required />
                            <Select label="Blood Group" id="bloodGroup" value={userData.personal.bloodGroup} onChange={handleChange('personal', 'bloodGroup')} required>
                                <option value="">Select Blood Group</option>
                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                            </Select>
                            <Input label="Highest Qualification" id="highestQualification" value={userData.personal.highestQualification} onChange={handleChange('personal', 'highestQualification')} required />
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-[#555555] mb-1">
                                    Email
                                </label>
                                <div id="email" className="w-full bg-[#F0ECE4] text-[#999] px-3 py-2 rounded-lg cursor-not-allowed">
                                    {userData.personal.email}
                                </div>
                            </div>
                            <Input label="Alternative Email" optional id="altEmail" type="email" value={userData.personal.altEmail} onChange={handleChange('personal', 'altEmail')} />
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="animate-slide-up space-y-4">
                        <h3 className="text-xl font-semibold text-[#2E2E2E] border-b pb-2">Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <TextArea label="Address" id="address" value={userData.contact.address} onChange={handleChange('contact', 'address')} required />
                            </div>
                            <Input label="City" id="city" value={userData.contact.city} onChange={handleChange('contact', 'city')} required />
                            <Input label="State" id="state" value={userData.contact.state} onChange={handleChange('contact', 'state')} required />
                            <Input label="Pin code / Zip code" id="pincode" value={userData.contact.pincode} onChange={handleChange('contact', 'pincode')} required />
                            <Input label="Country" id="country" value={userData.contact.country} onChange={handleChange('contact', 'country')} required />
                            <Input label="Mobile Number" id="mobile" type="tel" value={userData.contact.mobile} onChange={handleChange('contact', 'mobile')} required />
                            <Input label="Telephone Number" optional id="telephone" type="tel" value={userData.contact.telephone} onChange={handleChange('contact', 'telephone')} />
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="animate-slide-up space-y-8">
                        <h3 className="text-xl font-semibold text-[#2E2E2E] border-b pb-2">Experience Details</h3>
                        
                        {/* Employee Experience Section */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-lg text-[#2E2E2E]">Employment History</h4>
                            {userData.experience.employee.map((exp, index) => (
                                <div key={exp.id} className="p-4 border rounded-lg relative space-y-4 bg-white">
                                    <button onClick={() => removeEmployeeExperience(exp.id)} className="absolute top-2 right-2 text-2xl font-bold text-red-500 hover:text-red-700 leading-none">&times;</button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input label="Company Name" id={`emp-company-${index}`} value={exp.companyName} onChange={handleEmployeeChange(index, 'companyName')} />
                                        <Input label="Designation" id={`emp-designation-${index}`} value={exp.designation} onChange={handleEmployeeChange(index, 'designation')} />
                                        <Input label="Employment Start" id={`emp-start-${index}`} type="date" value={exp.startDate} onChange={handleEmployeeChange(index, 'startDate')} />
                                        <Input label="Employment End" id={`emp-end-${index}`} type="date" value={exp.endDate} onChange={handleEmployeeChange(index, 'endDate')} disabled={exp.isCurrentEmployer}/>
                                        <div className="md:col-span-2 pt-2">
                                            <Checkbox label="Current Employer" id={`emp-current-${index}`} checked={exp.isCurrentEmployer} onChange={handleEmployeeChange(index, 'isCurrentEmployer')} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={addEmployeeExperience} className="text-sm font-semibold text-[#E7A700] hover:text-[#CF9500] transition">+ Add Employment</button>
                        </div>
                        
                        {/* Entrepreneur Experience Section */}
                        <div className="space-y-4 pt-4 border-t">
                             <h4 className="font-semibold text-lg text-[#2E2E2E]">Entrepreneurial Ventures</h4>
                             {userData.experience.entrepreneur.map((exp, index) => (
                                 <div key={exp.id} className="p-4 border rounded-lg relative space-y-4 bg-white">
                                    <button onClick={() => removeEntrepreneurExperience(exp.id)} className="absolute top-2 right-2 text-2xl font-bold text-red-500 hover:text-red-700 leading-none">&times;</button>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input label="Company Name" id={`ent-company-${index}`} value={exp.companyName} onChange={handleEntrepreneurChange(index, 'companyName')} />
                                        <Input label="Nature of Business" id={`ent-business-${index}`} value={exp.natureOfBusiness} onChange={handleEntrepreneurChange(index, 'natureOfBusiness')} />
                                        <div className="md:col-span-2"><TextArea label="Company Address" id={`ent-address-${index}`} value={exp.address} onChange={handleEntrepreneurChange(index, 'address')} /></div>
                                        <Input label="City" id={`ent-city-${index}`} value={exp.city} onChange={handleEntrepreneurChange(index, 'city')} />
                                        <Input label="State" id={`ent-state-${index}`} value={exp.state} onChange={handleEntrepreneurChange(index, 'state')} />
                                        <Input label="Pin code / Zip Code" id={`ent-pincode-${index}`} value={exp.pincode} onChange={handleEntrepreneurChange(index, 'pincode')} />
                                        <Input label="Country" id={`ent-country-${index}`} value={exp.country} onChange={handleEntrepreneurChange(index, 'country')} />
                                    </div>
                                 </div>
                             ))}
                            <button type="button" onClick={addEntrepreneurExperience} className="text-sm font-semibold text-[#E7A700] hover:text-[#CF9500] transition">+ Add Venture</button>
                        </div>

                        {/* Open to Work Section */}
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
                        {/* Personal */}
                        <div className="p-5 border rounded-lg bg-white">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-semibold text-lg text-[#2E2E2E]">Personal Details</h4>
                                <button onClick={() => setCurrentStep(1)} className="text-sm font-medium text-[#E7A700] hover:underline">Edit</button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                <ReviewItem label="Name" value={`${userData.personal.firstName} ${userData.personal.lastName}`} />
                                <ReviewItem label="Pass Out Year" value={userData.personal.passOutYear} />
                                <ReviewItem label="Date of Birth" value={userData.personal.dob} />
                                <ReviewItem label="Blood Group" value={userData.personal.bloodGroup} />
                                <ReviewItem label="Qualification" value={userData.personal.highestQualification} />
                                <ReviewItem label="Email" value={userData.personal.email} />
                                <ReviewItem label="Alt Email" value={userData.personal.altEmail} />
                            </div>
                        </div>
                         {/* Contact */}
                         <div className="p-5 border rounded-lg bg-white">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-semibold text-lg text-[#2E2E2E]">Contact Information</h4>
                                <button onClick={() => setCurrentStep(2)} className="text-sm font-medium text-[#E7A700] hover:underline">Edit</button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                               <div className="col-span-2"><strong className="font-semibold text-[#2E2E2E]">Address:</strong> {`${userData.contact.address}, ${userData.contact.city}, ${userData.contact.state}, ${userData.contact.country} - ${userData.contact.pincode}`}</div>
                                <ReviewItem label="Mobile" value={userData.contact.mobile} />
                                <ReviewItem label="Telephone" value={userData.contact.telephone} />
                            </div>
                        </div>
                        {/* Experience */}
                        {(userData.experience.employee.length > 0 || userData.experience.entrepreneur.length > 0 || userData.experience.isOpenToWork) && (
                             <div className="p-5 border rounded-lg bg-white">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-semibold text-lg text-[#2E2E2E]">Experience Details</h4>
                                    <button onClick={() => setCurrentStep(3)} className="text-sm font-medium text-[#E7A700] hover:underline">Edit</button>
                                </div>
                                <div className="space-y-4 text-sm">
                                  {userData.experience.employee.map((exp) => (
                                      <div key={exp.id} className="pl-4 border-l-2 border-[#E7A700]">
                                          <p className="font-bold">{exp.companyName}</p>
                                          <ReviewItem label="Designation" value={exp.designation} />
                                          <ReviewItem label="Duration" value={`${exp.startDate} to ${exp.isCurrentEmployer ? 'Present' : exp.endDate}`} />
                                      </div>
                                  ))}
                                  {userData.experience.entrepreneur.map((exp) => (
                                      <div key={exp.id} className="pl-4 border-l-2 border-[#E7A700] mt-4">
                                        <p className="font-bold">{exp.companyName}</p>
                                          <ReviewItem label="Business Nature" value={exp.natureOfBusiness} />
                                          <ReviewItem label="Address" value={`${exp.address}, ${exp.city}`} />
                                      </div>
                                  ))}
                                  {userData.experience.isOpenToWork && (
                                    <div className="pl-4 border-l-2 border-green-500 mt-4">
                                      <p className="font-bold text-green-600">Open to Work</p>
                                      <ReviewItem label="Technical Skills" value={<p className="whitespace-pre-wrap">{userData.experience.openToWorkDetails.technicalSkills}</p>} />
                                      <ReviewItem label="Certifications" value={<p className="whitespace-pre-wrap">{userData.experience.openToWorkDetails.certifications}</p>} />
                                      <ReviewItem label="Soft Skills" value={<p className="whitespace-pre-wrap">{userData.experience.openToWorkDetails.softSkills}</p>} />
                                    </div>
                                  )}
                                </div>
                             </div>
                        )}
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
                        {currentStep < 4 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="px-5 py-2 bg-[#E7A700] text-white rounded-lg font-semibold hover:bg-[#CF9500] transition-all duration-300 transform hover:scale-105"
                            >
                                Next
                            </button>
                        ) : (
                             <button
                                type="button"
                                onClick={onRegister}
                                className="px-5 py-2 bg-[#E7A700] text-white rounded-lg font-semibold hover:bg-[#CF9500] transition-all duration-300 transform hover:scale-105"
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