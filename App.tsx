import React, { useState } from 'react';
import { UserData, EmployeeExperience, EntrepreneurExperience } from './types';
import LoginPage from './components/LoginPage';
import RegistrationForm from './components/RegistrationForm';
import ProfilePage from './components/ProfilePage';

const initialUserData: UserData = {
  alumniId: '',
  personal: {
    firstName: '',
    lastName: '',
    passOutYear: '',
    dob: '',
    bloodGroup: '',
    email: '',
    altEmail: '',
    highestQualification: '',
  },
  contact: {
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: '',
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [userData, setUserData] = useState<UserData>(initialUserData);

  const handleLogin = () => {
    // This is a mock login. In a real app, you'd use an OAuth flow.
    const mockEmail = 'alumni.member@gmail.com';
    const mockFirstName = 'Alumni';
    const mockLastName = 'Member';
    
    setUserData(prev => ({
      ...prev,
      personal: {
        ...prev.personal,
        email: mockEmail,
        firstName: mockFirstName,
        lastName: mockLastName,
      }
    }));
    setIsLoggedIn(true);
  };
  
  const handleRegister = () => {
    if (!userData.personal.passOutYear) {
      alert("Year of Pass Out is required to generate an ID.");
      setCurrentStep(1);
      return;
    }
    const uniqueNum = String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0');
    const id = `DTEAA-${userData.personal.passOutYear}-${uniqueNum}`;
    setUserData(prev => ({ ...prev, alumniId: id }));
    setIsRegistered(true);
  };

  const renderContent = () => {
    if (!isLoggedIn) {
      return <LoginPage onLogin={handleLogin} />;
    }
    if (!isRegistered) {
      return (
        <RegistrationForm
          userData={userData}
          setUserData={setUserData}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          onRegister={handleRegister}
        />
      );
    }
    return <ProfilePage userData={userData} />;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8 animate-fade-in">
            <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#E7A700] to-[#CF9500] pb-2">
              Dindigul Tool Engineering
            </h1>
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#2E2E2E] mt-1">
              Alumni Association
            </h2>
        </header>
        <main>{renderContent()}</main>
      </div>
    </div>
  );
};

export default App;
