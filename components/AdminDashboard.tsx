import React from 'react';
import type { UserData } from '../types';

interface AdminDashboardProps {
  users: UserData[];
  onVerify: (alumniId: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, onVerify }) => {
  const pendingUsers = users.filter(u => u.status === 'pending');
  const verifiedUsers = users.filter(u => u.status === 'verified');

  return (
    <div className="bg-[#FFF9EE] p-6 sm:p-8 rounded-xl shadow-2xl w-full border border-[#DDD2B5] animate-fade-in">
      <h3 className="text-2xl font-bold text-[#2E2E2E] border-b pb-3 mb-6">Admin Dashboard</h3>

      {/* Pending Verifications */}
      <section>
        <h4 className="text-xl font-semibold text-[#E7A700] mb-4">Pending Verifications ({pendingUsers.length})</h4>
        {pendingUsers.length > 0 ? (
          <div className="space-y-4">
            {pendingUsers.map(user => (
              <div key={user.alumniId} className="p-4 border rounded-lg bg-white flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-grow">
                  <p className="font-bold text-lg">{user.personal.firstName} {user.personal.lastName}</p>
                  <p className="text-sm text-[#555555]">{user.alumniId}</p>
                  <p className="text-sm text-[#555555]">{user.personal.email}</p>
                </div>
                <div className="flex-shrink-0">
                  <p className="text-sm font-medium mb-1">Payment Receipt:</p>
                  {user.paymentReceipt ? (
                     <img src={user.paymentReceipt} alt="Payment Receipt" className="rounded-md w-48 h-auto border" />
                  ) : (
                    <p className="text-xs text-red-500">No receipt uploaded.</p>
                  )}
                </div>
                <div className="md:pl-4 self-center">
                  <button
                    onClick={() => onVerify(user.alumniId)}
                    className="w-full md:w-auto px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all duration-300"
                  >
                    Verify & Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[#555555] italic">No pending verifications.</p>
        )}
      </section>

      {/* Verified Members */}
      <section className="mt-8 pt-6 border-t">
        <h4 className="text-xl font-semibold text-green-600 mb-4">Verified Members ({verifiedUsers.length})</h4>
         {verifiedUsers.length > 0 ? (
           <ul className="space-y-2">
            {verifiedUsers.map(user => (
               <li key={user.alumniId} className="p-3 border rounded-lg bg-white flex justify-between items-center">
                 <div>
                    <p className="font-semibold">{user.personal.firstName} {user.personal.lastName}</p>
                    <p className="text-sm text-[#555555]">{user.alumniId}</p>
                 </div>
                 <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">VERIFIED</span>
               </li>
            ))}
           </ul>
         ) : (
           <p className="text-[#555555] italic">No verified members yet.</p>
         )}
      </section>
    </div>
  );
};

export default AdminDashboard;
