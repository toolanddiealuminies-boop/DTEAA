// src/components/AdminDashboard.tsx
import React, { useEffect, useMemo, useState } from 'react';
import type { UserData } from '../types';

interface Props {
  users: UserData[];
  onVerify: (userId: string) => Promise<void>;
}

/**
 * AdminDashboard with search & filter and client-side debounce
 */
const AdminDashboard: React.FC<Props> = ({ users = [], onVerify }) => {
  const [selected, setSelected] = useState<UserData | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);

  // Search & filter state
  const [query, setQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified'>('all');

  // debounce delay in ms
  const DEBOUNCE_MS = 300;

  // debounce effect: update debouncedQuery after user stops typing
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  // Normalize helper for comparisons
  const normalize = (s?: string | null) => (s || '').toString().toLowerCase().trim();

  // Filter the user lists based on debouncedQuery and status filter
  const { filteredPending, filteredVerified, totalMatched } = useMemo(() => {
    const q = normalize(debouncedQuery);

    // helper to check if a user matches the query
    const matchesQuery = (u: UserData) => {
      if (!q) return true;
      const hay = [
        u.personal.firstName,
        u.personal.lastName,
        u.personal.email,
        u.alumniId,
      ].map(normalize).join(' ');
      return hay.includes(q);
    };

    // helper to check status filter
    const matchesStatus = (u: UserData) => {
      if (statusFilter === 'all') return true;
      if (statusFilter === 'pending') return u.status !== 'verified';
      return u.status === 'verified';
    };

    const pending = users.filter(u => u.status !== 'verified' && matchesQuery(u) && matchesStatus(u));
    const verified = users.filter(u => u.status === 'verified' && matchesQuery(u) && matchesStatus(u));

    return { filteredPending: pending, filteredVerified: verified, totalMatched: pending.length + verified.length };
  }, [users, debouncedQuery, statusFilter]);

  const handleVerify = async (id: string) => {
    setVerifying(id);
    try {
      await onVerify(id);
      // update selected status immediately for fast UX
      if (selected && selected.id === id) {
        setSelected(prev => prev ? { ...prev, status: 'verified' } : prev);
      }
    } catch (err) {
      console.error('verify failed', err);
    } finally {
      setVerifying(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 bg-white rounded-lg shadow-lg p-6 border border-[#EDE6D8] relative z-10">
      <h2 className="text-2xl font-semibold mb-4 text-[#2E2E2E]">Admin Dashboard</h2>

      {/* Search & Filters */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-3">
        <div className="flex-1">
          <label className="block text-sm text-gray-600 mb-1">Search</label>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email or alumni ID..."
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#E7A700] focus:border-transparent"
          />
          <p className="text-xs text-gray-400 mt-1">Search is debounced by {DEBOUNCE_MS}ms to improve typing performance.</p>
        </div>

        <div className="w-48">
          <label className="block text-sm text-gray-600 mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#E7A700] focus:border-transparent"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
          </select>
        </div>

        <div className="flex items-end space-x-2">
          <button
            onClick={() => { setQuery(''); setStatusFilter('all'); }}
            className="px-3 py-2 border rounded text-sm text-gray-700 bg-white hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Counts */}
      <div className="mb-6 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold">{totalMatched}</span> of <span className="font-semibold">{users.length}</span> users
        </div>
        <div className="text-sm text-gray-500">
          <span className="mr-3">Pending: <span className="font-medium">{filteredPending.length}</span></span>
          <span>Verified: <span className="font-medium">{filteredVerified.length}</span></span>
        </div>
      </div>

      {/* Pending Verifications */}
      <section className="mb-8">
        <h3 className="text-lg text-yellow-700 font-semibold mb-3">
          Pending Verifications ({filteredPending.length})
        </h3>

        {filteredPending.length === 0 ? (
          <div className="text-sm text-gray-500">No pending verifications found.</div>
        ) : (
          <div className="space-y-3">
            {filteredPending.map(user => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-[#FFF9F0] hover:bg-[#FFF5E2] transition"
              >
                <div className="flex items-center space-x-4 cursor-pointer" onClick={() => setSelected(user)}>
                  {/* Profile Picture */}
                  <div className="flex-shrink-0">
                    {user.personal.profilePhoto ? (
                      <img
                        src={user.personal.profilePhoto}
                        alt={`${user.personal.firstName} ${user.personal.lastName}`}
                        className="w-12 h-12 rounded-full object-cover border-2 border-[#E7A700]"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E7A700] to-[#CF9500] flex items-center justify-center text-white font-bold text-lg">
                        {(user.personal.firstName?.charAt(0) || '') + (user.personal.lastName?.charAt(0) || '')}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="font-semibold text-[#2E2E2E]">
                      {user.personal.firstName} {user.personal.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {user.personal.email}
                    </div>
                  </div>

                  {user.payment_receipt ? (
                    <img
                      src={user.payment_receipt}
                      alt="receipt"
                      className="w-16 h-12 object-cover rounded border"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="text-xs text-red-500">No receipt</div>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-sm mr-4 text-right">
                    <div className="text-xs text-gray-500">Payment Receipt:</div>
                    <div className={`text-sm ${user.payment_receipt ? 'text-green-700' : 'text-red-500'}`}>
                      {user.payment_receipt ? 'Uploaded' : 'Missing'}
                    </div>
                  </div>
                  <button
                    onClick={() => handleVerify(user.id)}
                    className={`px-4 py-2 rounded text-white ${verifying === user.id ? 'bg-green-700' : 'bg-green-600 hover:bg-green-700'}`}
                    disabled={verifying === user.id}
                  >
                    {verifying === user.id ? 'Approving...' : 'Verify & Approve'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Verified Members */}
      <section>
        <h3 className="text-lg text-green-700 font-semibold mb-3">
          Verified Members ({filteredVerified.length})
        </h3>

        {filteredVerified.length === 0 ? (
          <div className="text-sm text-gray-500">No verified members found.</div>
        ) : (
          <div className="space-y-3">
            {filteredVerified.map(user => (
              <div
                key={user.id}
                className="p-3 border rounded-lg bg-white flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelected(user)}
              >
                <div className="flex items-center space-x-3">
                  {/* Profile Picture */}
                  <div className="flex-shrink-0">
                    {user.personal.profilePhoto ? (
                      <img
                        src={user.personal.profilePhoto}
                        alt={`${user.personal.firstName} ${user.personal.lastName}`}
                        className="w-12 h-12 rounded-full object-cover border-2 border-green-500"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-lg">
                        {(user.personal.firstName?.charAt(0) || '') + (user.personal.lastName?.charAt(0) || '')}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="font-semibold text-[#2E2E2E]">
                      {user.personal.firstName} {user.personal.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{user.personal.email}</div>
                  </div>
                </div>
                <div className="text-sm text-green-600 font-medium">Verified</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl p-6 relative overflow-y-auto max-h-[90vh]">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setSelected(null)}
            >
              ✕
            </button>

            {/* Modal Header with Profile Picture */}
            <div className="flex items-center gap-4 mb-6">
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                {selected.personal.profilePhoto ? (
                  <img
                    src={selected.personal.profilePhoto}
                    alt={`${selected.personal.firstName} ${selected.personal.lastName}`}
                    className="w-20 h-20 rounded-full object-cover border-4 border-[#E7A700] shadow-lg"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E7A700] to-[#CF9500] flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {(selected.personal.firstName?.charAt(0) || '') + (selected.personal.lastName?.charAt(0) || '')}
                  </div>
                )}
              </div>
              
              {/* User Info */}
              <div>
                <h3 className="text-xl font-semibold text-[#2E2E2E]">
                  {selected.personal.firstName} {selected.personal.lastName}
                </h3>
                <div className="text-sm text-gray-500">{selected.personal.email}</div>
                {selected.alumniId && (
                  <div className="text-sm font-medium text-[#E7A700] mt-1">ID: {selected.alumniId}</div>
                )}
              </div>
            </div>

            {/* Personal + Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold mb-1">Personal Details</h4>
                <p><b>DOB:</b> {selected.personal.dob || '—'}</p>
                <p><b>Pass Out Year:</b> {selected.personal.passOutYear || '—'}</p>
                <p><b>Qualification:</b> {selected.personal.highestQualification || '—'}</p>
                <p><b>Blood Group:</b> {selected.personal.bloodGroup || '—'}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Contact Details</h4>
                <p><b>Present Address:</b> {[
                  selected.contact.presentAddress?.city,
                  selected.contact.presentAddress?.state,
                  selected.contact.presentAddress?.country
                ].filter(Boolean).join(', ') || '—'}{selected.contact.presentAddress?.pincode ? ` - ${selected.contact.presentAddress.pincode}` : ''}</p>
                {selected.contact.sameAsPresentAddress ? (
                  <p><b>Permanent Address:</b> Same as present address</p>
                ) : (
                  <p><b>Permanent Address:</b> {[
                    selected.contact.permanentAddress?.city,
                    selected.contact.permanentAddress?.state,
                    selected.contact.permanentAddress?.country
                  ].filter(Boolean).join(', ') || '—'}{selected.contact.permanentAddress?.pincode ? ` - ${selected.contact.permanentAddress.pincode}` : ''}</p>
                )}
                <p><b>Mobile:</b> {selected.contact.mobile || '—'}</p>
              </div>
            </div>

            {/* Experience Section */}
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Professional Experience</h4>
              {selected.experience?.employee?.length > 0 ? (
                <>
                  <h5 className="font-medium text-gray-700 mb-1">Employee Experience</h5>
                  {selected.experience.employee.map(exp => (
                    <div
                      key={exp.id}
                      className="p-3 border-l-4 border-yellow-500 bg-yellow-50 rounded-r-md mb-2"
                    >
                      <p className="font-semibold text-[#2E2E2E]">
                        {exp.designation} @ {exp.companyName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {exp.startDate || '—'} - {exp.isCurrentEmployer ? 'Present' : exp.endDate || '—'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {[exp.city, exp.state, exp.country].filter(Boolean).join(', ') || '—'}
                      </p>
                    </div>
                  ))}
                </>
              ) : (
                <p className="text-sm text-gray-500 mb-2">No employee experience.</p>
              )}

              {selected.experience?.entrepreneur?.length > 0 && (
                <>
                  <h5 className="font-medium text-gray-700 mb-1 mt-4">Entrepreneur Experience</h5>
                  {selected.experience.entrepreneur.map(exp => (
                    <div
                      key={exp.id}
                      className="p-3 border-l-4 border-green-500 bg-green-50 rounded-r-md mb-2"
                    >
                      <p className="font-semibold text-[#2E2E2E]">{exp.companyName}</p>
                      <p className="text-sm text-gray-600">{exp.natureOfBusiness}</p>
                      <p className="text-sm text-gray-600">{[exp.city, exp.state, exp.country].filter(Boolean).join(', ') || '—'}</p>
                    </div>
                  ))}
                </>
              )}

              {selected.experience?.isOpenToWork && (
                <div className="mt-4 p-3 border-l-4 border-blue-500 bg-blue-50 rounded-r-md">
                  <h5 className="font-semibold text-blue-700">Open to Work</h5>
                  <p className="text-sm text-gray-600">
                    Skills: {selected.experience.openToWorkDetails?.technicalSkills || '—'}
                  </p>
                </div>
              )}
            </div>

            {/* Payment Receipt */}
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Payment Receipt</h4>
              {selected.payment_receipt ? (
                <div>
                  <img
                    src={selected.payment_receipt}
                    alt="Payment Receipt"
                    className="max-h-[400px] w-full object-contain border rounded"
                  />
                  <a
                    href={selected.payment_receipt}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 text-sm mt-2 inline-block"
                  >
                    Open in new tab
                  </a>
                </div>
              ) : (
                <p className="text-sm text-red-500">No receipt uploaded.</p>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-600">
                <b>Status:</b>{' '}
                <span className={selected.status === 'verified' ? 'text-green-700' : 'text-yellow-700'}>
                  {selected.status}
                </span>
              </div>
              <div className="flex space-x-2">
                {selected.status !== 'verified' && (
                  <button
                    onClick={() => handleVerify(selected.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    {verifying === selected.id ? 'Approving...' : 'Verify & Approve'}
                  </button>
                )}
                <button onClick={() => setSelected(null)} className="px-3 py-2 border rounded">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
