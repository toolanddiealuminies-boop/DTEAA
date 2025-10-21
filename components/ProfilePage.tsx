import React from 'react';
import type { UserData } from '../types';

interface ProfilePageProps {
  userData: UserData;
}

const DetailItem: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => {
    if (!value) return null;
    return (
        <div>
            <p className="text-sm text-[#555555]">{label}</p>
            <p className="text-md font-medium text-[#2E2E2E] whitespace-pre-wrap">{value}</p>
        </div>
    );
};

const ProfilePage: React.FC<ProfilePageProps> = ({ userData }) => {
  const isPending = userData.status === 'pending';
  const isVerified = userData.status === 'verified';

  return (
    <div className="bg-[#FFF9EE] p-8 rounded-xl shadow-2xl w-full max-w-3xl mx-auto animate-slide-up border border-[#DDD2B5]">
      <div className="text-center mb-8 border-b pb-4">
        {/* Verified banner */}
        {isVerified ? (
          <div className="rounded-md p-4 bg-green-50 border border-green-200">
            <h2 className="text-3xl font-bold text-green-600">🎉 Congratulations!</h2>
            <p className="text-[#2E2E2E] mt-2 max-w-xl mx-auto">
              You are registered and verified as a member of the DTE Alumni Association.
              You should have received a confirmation and your official alumni ID: <span className="font-semibold text-[#CF9500]">{userData.alumniId || '—'}</span>
            </p>
          </div>
        ) : (
          // Pending / submitted or generic success state
          <>
            <h2 className={`text-3xl font-bold ${isPending ? 'text-orange-500' : 'text-green-600'}`}>
              {isPending ? 'Submission Received!' : 'Registration Successful!'}
            </h2>
            <p className="text-[#555555] mt-2 max-w-xl mx-auto">
              {isPending 
                ? "Thank you for registering! Your registration is pending. You will receive a confirmation email with your official ID card after your payment has been verified by our team."
                : "Welcome to the DTE Alumni Association. Here is your confirmed profile."
              }
            </p>
          </>
        )}
      </div>

      <div className="space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="w-28 h-28 bg-gradient-to-br from-[#E7A700] to-[#CF9500] rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-lg">
                { (userData.personal.firstName?.charAt(0) || '') + (userData.personal.lastName?.charAt(0) || '') }
            </div>
            <div>
                <h3 className="text-3xl font-bold text-[#2E2E2E] text-center sm:text-left">{userData.personal.firstName} {userData.personal.lastName}</h3>
                <p className="text-lg text-[#E7A700] font-semibold text-center sm:text-left">{userData.alumniId || '—'}</p>
                <p className="text-md text-[#555555] text-center sm:text-left">Batch of {userData.personal.passOutYear || '—'}</p>
            </div>
        </div>

        {/* Personal Details */}
        <section className="p-5 border rounded-lg bg-[#F7F4EF]">
          <h4 className="text-xl font-semibold text-[#2E2E2E] border-b pb-2 mb-4">Personal Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <DetailItem label="Date of Birth" value={userData.personal.dob} />
            <DetailItem label="Blood Group" value={userData.personal.bloodGroup} />
            <DetailItem label="Highest Qualification" value={userData.personal.highestQualification} />
            <DetailItem label="Email" value={userData.personal.email} />
            <DetailItem label="Alternative Email" value={userData.personal.altEmail} />
          </div>
        </section>

         {/* Contact Information */}
        <section className="p-5 border rounded-lg bg-[#F7F4EF]">
          <h4 className="text-xl font-semibold text-[#2E2E2E] border-b pb-2 mb-4">Contact Information</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             <div className="sm:col-span-2">
                <p className="text-sm text-[#555555]">Address</p>
                <p className="text-md font-medium text-[#2E2E2E]">{[
                  userData.contact.address,
                  userData.contact.city,
                  userData.contact.state,
                  userData.contact.country,
                ].filter(Boolean).join(', ') || '—'}{userData.contact.pincode ? ` - ${userData.contact.pincode}` : ''}</p>
            </div>
            <DetailItem label="Mobile Number" value={userData.contact.mobile} />
            <DetailItem label="Telephone Number" value={userData.contact.telephone} />
          </div>
        </section>
        
        {/* Experience Details */}
        {(userData.experience.employee.length > 0 || userData.experience.entrepreneur.length > 0 || userData.experience.isOpenToWork) && (
            <section className="p-5 border rounded-lg bg-[#F7F4EF]">
                <h4 className="text-xl font-semibold text-[#2E2E2E] border-b pb-2 mb-4">Professional Details</h4>
                <div className="space-y-4">
                    {userData.experience.employee.map((exp) => (
                        <div key={exp.id} className="p-4 border-l-4 border-[#E7A700] rounded-r-lg bg-[#FFF9EE]">
                            <p className="font-semibold text-[#2E2E2E]">{exp.designation} at {exp.companyName}</p>
                            <p className="text-sm text-[#555555]">{exp.startDate || '—'} to {exp.isCurrentEmployer ? 'Present' : (exp.endDate || '—')}</p>
                        </div>
                    ))}

                    {userData.experience.entrepreneur.map((exp) => (
                        <div key={exp.id} className="p-4 border-l-4 border-[#E7A700] rounded-r-lg bg-[#FFF9EE]">
                            <p className="font-semibold text-[#2E2E2E]">{exp.companyName}</p>
                            <p className="text-sm text-[#555555]">{exp.natureOfBusiness}</p>
                            <p className="text-sm text-[#555555] mt-2">{[
                              exp.address,
                              exp.city
                            ].filter(Boolean).join(', ') || '—'}</p>
                        </div>
                    ))}

                    {userData.experience.isOpenToWork && (
                        <div className="mt-4 p-4 border-l-4 border-green-500 rounded-r-lg bg-green-50">
                            <h5 className="font-semibold text-green-700">Currently Open to Work</h5>
                            <div className="mt-2 space-y-2">
                                <DetailItem label="Technical Skills" value={userData.experience.openToWorkDetails.technicalSkills} />
                                <DetailItem label="Certifications" value={userData.experience.openToWorkDetails.certifications} />
                                <DetailItem label="Soft Skills" value={userData.experience.openToWorkDetails.softSkills} />
                                <DetailItem label="Other" value={userData.experience.openToWorkDetails.other} />
                            </div>
                        </div>
                    )}
                </div>
            </section>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
