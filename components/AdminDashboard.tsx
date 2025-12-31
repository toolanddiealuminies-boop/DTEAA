// src/components/AdminDashboard.tsx
import React, { useEffect, useMemo, useState } from 'react';
import type { UserData } from '../types';
import { supabase } from '../lib/supabaseClient';
import * as XLSX from 'xlsx';
import { Download, Users, Ticket, UserCheck, Utensils } from 'lucide-react';

interface Props {
  users: UserData[];
  onVerify: (userId: string) => Promise<void>;
  onReject: (userId: string, comments: string) => Promise<void>;
}

/**
 * AdminDashboard with search & filter and client-side debounce
 */
const AdminDashboard: React.FC<Props> = ({ users = [], onVerify, onReject }) => {
  const [selected, setSelected] = useState<UserData | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectUserId, setRejectUserId] = useState<string | null>(null);
  const [rejectionComments, setRejectionComments] = useState('');

  // Event Dashboard State
  const [activeView, setActiveView] = useState<'verifications' | 'events'>('verifications');
  const [eventRegistrations, setEventRegistrations] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

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

  const openRejectModal = (userId: string) => {
    setRejectUserId(userId);
    setRejectionComments('');
    setRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!rejectUserId || !rejectionComments.trim()) {
      alert('Please enter rejection comments');
      return;
    }

    setRejecting(rejectUserId);
    try {
      await onReject(rejectUserId, rejectionComments.trim());
      setRejectModalOpen(false);
      setRejectionComments('');
      setRejectUserId(null);
      // update selected if modal is open
      if (selected && selected.id === rejectUserId) {
        setSelected(prev => prev ? { ...prev, status: 'rejected', rejectionComments: rejectionComments.trim() } : prev);
      }
    } catch (err) {
      console.error('reject failed', err);
      alert('Failed to reject user. Please try again.');
    } finally {
      setRejecting(null);
    }
  };


  const fetchEventRegistrations = async () => {
    setLoadingEvents(true);
    try {
      // Fetch event registrations with alumni_id
      const { data: registrations, error } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', 'alumni-meet-2026')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!registrations || registrations.length === 0) {
        setEventRegistrations([]);
        return;
      }

      // Fetch personal and contact details for all registered users
      const userIds = registrations.map(r => r.user_id);
      
      const [personalRes, contactRes, profilesRes] = await Promise.all([
        supabase.from('personal_details').select('user_id, first_name, last_name').in('user_id', userIds),
        supabase.from('contact_details').select('user_id, mobile').in('user_id', userIds),
        supabase.from('profiles').select('id, alumni_id').in('id', userIds),
      ]);

      const personalMap = new Map((personalRes.data || []).map(p => [p.user_id, p]));
      const contactMap = new Map((contactRes.data || []).map(c => [c.user_id, c]));
      const profileMap = new Map((profilesRes.data || []).map(p => [p.id, p]));

      // Transform data for easier usage
      const transformed = registrations.map((reg: any) => {
        const personal = personalMap.get(reg.user_id);
        const contact = contactMap.get(reg.user_id);
        const profile = profileMap.get(reg.user_id);

        return {
          ...reg,
          firstName: personal?.first_name || 'N/A',
          lastName: personal?.last_name || '',
          mobile: contact?.mobile || 'N/A',
          alumniId: profile?.alumni_id || 'Pending',
        };
      });

      setEventRegistrations(transformed);
    } catch (err) {
      console.error('Error fetching event registrations:', err);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    if (activeView === 'events') {
      fetchEventRegistrations();
    }
  }, [activeView]);

  const exportToExcel = () => {
    const dataToExport = eventRegistrations.map(reg => ({
      'Registration Date': new Date(reg.created_at).toLocaleDateString(),
      'Alumni ID': reg.alumniId,
      'First Name': reg.firstName,
      'Last Name': reg.lastName,
      'Mobile': reg.mobile,
      'Attending': reg.attending ? 'Yes' : 'No',
      'Meal Preference': reg.meal_preference || '-',
      'Total Participants': reg.total_participants,
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Alumni Meet 2026");
    XLSX.writeFile(wb, "Alumni_Meet_2026_Participants.xlsx");
  };

  const eventStats = useMemo(() => {
    const totalReg = eventRegistrations.filter(r => r.attending).length;
    const totalPax = eventRegistrations.reduce((acc, curr) => acc + (curr.attending ? (curr.total_participants || 1) : 0), 0);
    const vegCount = eventRegistrations.filter(r => r.attending && r.meal_preference === 'Veg').reduce((acc, curr) => acc + (curr.total_participants || 1), 0);
    const nonVegCount = totalPax - vegCount;

    return { totalReg, totalPax, vegCount, nonVegCount };
  }, [eventRegistrations]);

  return (
    <div className="max-w-6xl mx-auto mt-8 bg-white dark:bg-dark-card rounded-lg shadow-lg border border-light-border dark:border-dark-border relative z-10 transition-colors duration-200 overflow-hidden">

      {/* Dashboard Header & Tabs */}
      <div className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">Admin Dashboard</h2>

        <div className="flex bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
          <button
            onClick={() => setActiveView('verifications')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeView === 'verifications' ? 'bg-white dark:bg-gray-600 shadow-sm text-primary' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'}`}
          >
            <div className="flex items-center gap-2">
              <UserCheck size={16} />
              Member Verifications
            </div>
          </button>
          <button
            onClick={() => setActiveView('events')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeView === 'events' ? 'bg-white dark:bg-gray-600 shadow-sm text-primary' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'}`}
          >
            <div className="flex items-center gap-2">
              <Ticket size={16} />
              Event Registrations
            </div>
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeView === 'events' ? (
          <div className="animate-fade-in space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  Alumni Meet 2026 <span className="text-xs bg-[#E7A700] text-[#003366] px-2 py-1 rounded-full uppercase">Upcoming</span>
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage event participants and details.</p>
              </div>
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm"
              >
                <Download size={18} />
                Export to Excel
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                <div className="text-blue-600 dark:text-blue-400 font-medium text-sm mb-1">Total Registrations</div>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{eventStats.totalReg}</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800">
                <div className="text-purple-600 dark:text-purple-400 font-medium text-sm mb-1 flex items-center gap-1"><Users size={14} /> Total Participants</div>
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{eventStats.totalPax}</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800">
                <div className="text-green-600 dark:text-green-400 font-medium text-sm mb-1 flex items-center gap-1"><Utensils size={14} /> Veg Meals</div>
                <div className="text-2xl font-bold text-green-900 dark:text-green-100">{eventStats.vegCount}</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800">
                <div className="text-red-600 dark:text-red-400 font-medium text-sm mb-1 flex items-center gap-1"><Utensils size={14} /> Non-Veg Meals</div>
                <div className="text-2xl font-bold text-red-900 dark:text-red-100">{eventStats.nonVegCount}</div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 uppercase font-medium">
                  <tr>
                    <th className="px-6 py-4">Alumni</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4 text-center">Attending</th>
                    <th className="px-6 py-4">Meal Pref</th>
                    <th className="px-6 py-4 text-center">Participants</th>
                    <th className="px-6 py-4 text-right">Registered On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {loadingEvents ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading registrations...</td>
                    </tr>
                  ) : eventRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No registrations yet.</td>
                    </tr>
                  ) : (
                    eventRegistrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900 dark:text-white">{reg.firstName} {reg.lastName}</div>
                          <div className="text-xs text-gray-500">{reg.alumniId}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                          {reg.mobile}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {reg.attending ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                              No
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {reg.meal_preference === 'Veg' ? (
                            <span className="text-green-600 dark:text-green-400 font-medium">Veg</span>
                          ) : reg.meal_preference === 'Non-Veg' ? (
                            <span className="text-red-600 dark:text-red-400 font-medium">Non-Veg</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center font-semibold text-gray-900 dark:text-white">
                          {reg.total_participants}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-500">
                          {new Date(reg.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <>
            {/* Search & Filters */}
            <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-3">
              <div className="flex-1">
                <label className="block text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">Search</label>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, email or alumni ID..."
                  className="w-full px-3 py-2 text-light-text-primary dark:text-dark-text-primary bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 placeholder-gray-400"
                />
                <p className="text-xs text-gray-400 mt-1">Search is debounced by {DEBOUNCE_MS}ms to improve typing performance.</p>
              </div>

              <div className="w-48">
                <label className="block text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full px-3 py-2 text-light-text-primary dark:text-dark-text-primary bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                </select>
              </div>

              <div className="flex items-end space-x-2">
                <button
                  onClick={() => { setQuery(''); setStatusFilter('all'); }}
                  className="px-3 py-2 border border-light-border dark:border-dark-border rounded text-sm text-light-text-primary dark:text-dark-text-primary bg-light-bg dark:bg-dark-bg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Counts */}
            <div className="mb-6 flex items-center justify-between">
              <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                Showing <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">{totalMatched}</span> of <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">{users.length}</span> users
              </div>
              <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                <span className="mr-3">Pending: <span className="font-medium text-light-text-primary dark:text-dark-text-primary">{filteredPending.length}</span></span>
                <span>Verified: <span className="font-medium text-light-text-primary dark:text-dark-text-primary">{filteredVerified.length}</span></span>
              </div>
            </div>

            {/* Pending Verifications */}
            <section className="mb-8">
              <h3 className="text-lg text-yellow-700 dark:text-yellow-500 font-semibold mb-3">
                Pending Verifications ({filteredPending.length})
              </h3>

              {filteredPending.length === 0 ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">No pending verifications found.</div>
              ) : (
                <div className="space-y-3">
                  {filteredPending.map(user => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 border border-yellow-100 dark:border-yellow-900/30 rounded-lg bg-yellow-50/50 dark:bg-yellow-900/10 hover:bg-yellow-100/50 dark:hover:bg-yellow-900/20 transition cursor-pointer"
                    >
                      <div className="flex items-center space-x-4 flex-1" onClick={() => setSelected(user)}>
                        {/* Profile Picture */}
                        <div className="flex-shrink-0">
                          {user.personal.profilePhoto ? (
                            <img
                              src={user.personal.profilePhoto}
                              alt={`${user.personal.firstName} ${user.personal.lastName}`}
                              className="w-12 h-12 rounded-full object-cover border-2 border-primary"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white font-bold text-lg">
                              {(user.personal.firstName?.charAt(0) || '') + (user.personal.lastName?.charAt(0) || '')}
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                            {user.personal.firstName} {user.personal.lastName}
                          </div>
                          <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                            {user.personal.email}
                          </div>
                        </div>

                        {user.payment_receipt ? (
                          <img
                            src={user.payment_receipt}
                            alt="receipt"
                            className="w-16 h-12 object-cover rounded border border-gray-200 dark:border-gray-700"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="text-xs text-red-500 dark:text-red-400">No receipt</div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <div className="text-sm mr-2 text-right hidden sm:block">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Payment Receipt:</div>
                          <div className={`text-sm ${user.payment_receipt ? 'text-green-700 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                            {user.payment_receipt ? 'Uploaded' : 'Missing'}
                          </div>
                        </div>
                        <button
                          onClick={() => handleVerify(user.id)}
                          className={`px-3 py-2 rounded text-white text-sm whitespace-nowrap ${verifying === user.id ? 'bg-green-700' : 'bg-green-600 hover:bg-green-700'}`}
                          disabled={verifying === user.id}
                        >
                          {verifying === user.id ? 'Approving...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => openRejectModal(user.id)}
                          className="px-3 py-2 rounded text-white text-sm bg-red-600 hover:bg-red-700 whitespace-nowrap"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Verified Members */}
            <section>
              <h3 className="text-lg text-green-700 dark:text-green-500 font-semibold mb-3">
                Verified Members ({filteredVerified.length})
              </h3>

              {filteredVerified.length === 0 ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">No verified members found.</div>
              ) : (
                <div className="space-y-3">
                  {filteredVerified.map(user => (
                    <div
                      key={user.id}
                      className="p-3 border border-light-border dark:border-dark-border rounded-lg bg-white dark:bg-gray-800 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition"
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
                          <div className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                            {user.personal.firstName} {user.personal.lastName}
                          </div>
                          <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{user.personal.email}</div>
                        </div>
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400 font-medium whitespace-nowrap">Verified</div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Modal */}
            {selected && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
                <div className="bg-white dark:bg-dark-card rounded-lg w-full max-w-4xl p-6 relative overflow-y-auto max-h-[90vh] shadow-2xl border border-light-border dark:border-dark-border">
                  <button
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
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
                          className="w-20 h-20 rounded-full object-cover border-4 border-primary shadow-lg"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                          {(selected.personal.firstName?.charAt(0) || '') + (selected.personal.lastName?.charAt(0) || '')}
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <div>
                      <h3 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary">
                        {selected.personal.firstName} {selected.personal.lastName}
                      </h3>
                      <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{selected.personal.email}</div>
                      {selected.alumniId && (
                        <div className="text-sm font-medium text-primary mt-1">ID: {selected.alumniId}</div>
                      )}
                    </div>
                  </div>

                  {/* Personal + Contact */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="text-light-text-primary dark:text-dark-text-primary">
                      <h4 className="font-semibold mb-1 text-light-text-secondary dark:text-dark-text-secondary">Personal Details</h4>
                      <p><b>DOB:</b> {selected.personal.dob || '—'}</p>
                      <p><b>Pass Out Year:</b> {selected.personal.passOutYear || '—'}</p>
                      <p><b>Qualification:</b> {selected.personal.highestQualification || '—'}</p>
                      <p><b>Blood Group:</b> {selected.personal.bloodGroup || '—'}</p>
                    </div>
                    <div className="text-light-text-primary dark:text-dark-text-primary">
                      <h4 className="font-semibold mb-1 text-light-text-secondary dark:text-dark-text-secondary">Contact Details</h4>
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
                    <h4 className="font-semibold mb-2 text-light-text-primary dark:text-dark-text-primary">Professional Experience</h4>
                    {selected.experience?.employee?.length > 0 ? (
                      <>
                        <h5 className="font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">Employee Experience</h5>
                        {selected.experience.employee.map(exp => (
                          <div
                            key={exp.id}
                            className="p-3 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 rounded-r-md mb-2"
                          >
                            <p className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                              {exp.designation} @ {exp.companyName}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {exp.startDate || '—'} - {exp.isCurrentEmployer ? 'Present' : exp.endDate || '—'}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {[exp.city, exp.state, exp.country].filter(Boolean).join(', ') || '—'}
                            </p>
                          </div>
                        ))}
                      </>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">No employee experience.</p>
                    )}

                    {selected.experience?.entrepreneur?.length > 0 && (
                      <>
                        <h5 className="font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1 mt-4">Entrepreneur Experience</h5>
                        {selected.experience.entrepreneur.map(exp => (
                          <div
                            key={exp.id}
                            className="p-3 border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 rounded-r-md mb-2"
                          >
                            <p className="font-semibold text-light-text-primary dark:text-dark-text-primary">{exp.companyName}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{exp.natureOfBusiness}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{[exp.city, exp.state, exp.country].filter(Boolean).join(', ') || '—'}</p>
                          </div>
                        ))}
                      </>
                    )}

                    {selected.experience?.isOpenToWork && (
                      <div className="mt-4 p-3 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-r-md">
                        <h5 className="font-semibold text-blue-700 dark:text-blue-400">Open to Work</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Skills: {selected.experience.openToWorkDetails?.technicalSkills || '—'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Payment Receipt */}
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2 text-light-text-primary dark:text-dark-text-primary">Payment Receipt</h4>
                    {selected.payment_receipt ? (
                      <div>
                        <img
                          src={selected.payment_receipt}
                          alt="Payment Receipt"
                          className="max-h-[400px] w-full object-contain border border-gray-200 dark:border-gray-700 rounded bg-black/5"
                        />
                        <a
                          href={selected.payment_receipt}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 dark:text-blue-400 text-sm mt-2 inline-block hover:underline"
                        >
                          Open in new tab
                        </a>
                      </div>
                    ) : (
                      <p className="text-sm text-red-500 dark:text-red-400">No receipt uploaded.</p>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-light-border dark:border-dark-border">
                    <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      <b>Status:</b>{' '}
                      <span className={selected.status === 'verified' ? 'text-green-700 dark:text-green-400' : 'text-yellow-700 dark:text-yellow-500'}>
                        {selected.status}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      {selected.status !== 'verified' && (
                        <>
                          <button
                            onClick={() => handleVerify(selected.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            {verifying === selected.id ? 'Approving...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => { openRejectModal(selected.id); setSelected(null); }}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setSelected(null)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Rejection Modal */}
            {rejectModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
                <div className="bg-white dark:bg-dark-card rounded-lg w-full max-w-md p-6 relative shadow-xl border border-light-border dark:border-dark-border">
                  <button
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={() => {
                      setRejectModalOpen(false);
                      setRejectionComments('');
                      setRejectUserId(null);
                    }}
                  >
                    ✕
                  </button>

                  <h3 className="text-xl font-semibold mb-4 text-red-600 dark:text-red-400">Reject Registration</h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Please provide a reason for rejecting this registration. The user will see this message when they log in.
                  </p>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rejection Comments <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={rejectionComments}
                      onChange={(e) => setRejectionComments(e.target.value)}
                      placeholder="e.g., Payment receipt is unclear, please upload a clearer image..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-800 text-light-text-primary dark:text-dark-text-primary"
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setRejectModalOpen(false);
                        setRejectionComments('');
                        setRejectUserId(null);
                      }}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={rejecting !== null || !rejectionComments.trim()}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {rejecting ? 'Rejecting...' : 'Confirm Rejection'}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
