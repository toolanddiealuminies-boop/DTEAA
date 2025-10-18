import React, { useState } from 'react';
import { UserData, EmployeeExperience, EntrepreneurExperience } from './types';
import LoginPage from './components/LoginPage';
import RegistrationForm from './components/RegistrationForm';
import ProfilePage from './components/ProfilePage';
import Header from './components/Header';
import AdminDashboard from './components/AdminDashboard';

const initialUserData: UserData = {
  alumniId: '',
  status: 'pending',
  paymentReceipt: '',
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

const mockUserDatabase: UserData[] = [];

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [userData, setUserData] = useState<UserData>(initialUserData);
  const [allUsers, setAllUsers] = useState<UserData[]>(mockUserDatabase);


  const handleLogin = () => {
    // This is a mock login.
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
    setIsAdminView(false);
  };

  const handleAdminLogin = () => {
    setIsLoggedIn(true);
    setIsAdminView(true);
  };
  
  const handleRegister = () => {
    if (!userData.personal.passOutYear) {
      alert("Year of Pass Out is required to generate an ID.");
      setCurrentStep(1);
      return;
    }
    const uniqueNum = String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0');
    const id = `DTEAA-${userData.personal.passOutYear}-${uniqueNum}`;
    const finalUserData = { ...userData, alumniId: id, status: 'pending' as const };

    setUserData(finalUserData);
    setAllUsers(prev => [...prev, finalUserData]);
    setIsRegistered(true);
  };

  const handleVerify = (alumniId: string) => {
    setAllUsers(users => users.map(user => user.alumniId === alumniId ? { ...user, status: 'verified' } : user));
    alert(`User ${alumniId} has been verified. A confirmation email simulation has been triggered.`);
  };


  const renderContent = () => {
    if (isAdminView) {
      return <AdminDashboard users={allUsers} onVerify={handleVerify} />;
    }
    if (!isLoggedIn) {
      return <LoginPage onLogin={handleLogin} onAdminLogin={handleAdminLogin} />;
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
    <>
      <Header isRegistered={isRegistered} />
      {/* Main content area, pushed down to avoid overlapping with the sticky header */}
      <div className="flex flex-col items-center p-4 sm:p-6 lg:p-8 pt-24 font-sans">
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
    </>
  );
};

export default App;
