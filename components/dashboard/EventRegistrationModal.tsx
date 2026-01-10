import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { X, Check, Loader2, Upload, Calendar, MapPin, Copy } from 'lucide-react';

interface EventRegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    alumniId: string;
    onSuccess: () => void;
}

const REGISTRATION_FEE = 300;

const EventRegistrationModal: React.FC<EventRegistrationModalProps> = ({ isOpen, onClose, userId, alumniId, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [attending, setAttending] = useState<boolean | null>(null);
    const [totalParticipants, setTotalParticipants] = useState(1);
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successData, setSuccessData] = useState<any>(null);

    // New state to track if we are viewing an existing registration
    const [existingRegistration, setExistingRegistration] = useState<any>(null);
    const [fetchingParams, setFetchingParams] = useState(false);

    // Copy State
    const [copied, setCopied] = useState('');

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(text);
        setTimeout(() => setCopied(''), 2000);
    };

    // Fetch existing registration when modal opens
    React.useEffect(() => {
        if (isOpen && userId) {
            checkExistingRegistration();
        } else {
            // Reset state when closed
            setStep(1);
            setAttending(null);
            setTotalParticipants(1);
            setReceiptFile(null);
            setReceiptPreview(null);
            setError('');
            setSuccessData(null);
            setExistingRegistration(null);
        }
    }, [isOpen, userId]);

    const checkExistingRegistration = async () => {
        setFetchingParams(true);
        try {
            const { data, error } = await supabase
                .from('event_registrations')
                .select('*')
                .eq('user_id', userId)
                .eq('event_id', 'alumni-meet-2026')
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
                console.error('Error fetching registration:', error);
            }

            if (data) {
                setExistingRegistration(data);
                // Pre-fill state for display
                setAttending(data.attending);
                if (data.attending) {
                    setTotalParticipants(data.total_participants);
                    setReceiptPreview(data.payment_receipt);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setFetchingParams(false);
        }
    };

    if (!isOpen) return null;

    const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('File size too large. Max 5MB.');
                return;
            }
            setReceiptFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setReceiptPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            setError('');
        }
    };

    const handleNext = () => {
        if (step === 1 && attending === null) {
            setError('Please select an option.');
            return;
        }
        if (step === 1 && attending === false) {
            // Skip to submission for "Not Attending"
            handleSubmit();
            return;
        }
        setStep(step + 1);
        setError('');
    };

    const handleBack = () => {
        setStep(step - 1);
        setError('');
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        try {
            let receiptUrl = existingRegistration?.payment_receipt || null;

            // Upload receipt if attending and a new file is selected
            if (attending && receiptFile) {
                const fileExt = receiptFile.name.split('.').pop();
                const fileName = `${userId}/${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('receipts')
                    .upload(fileName, receiptFile);

                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage
                    .from('receipts')
                    .getPublicUrl(fileName);

                receiptUrl = urlData.publicUrl;
            } else if (attending && !receiptUrl) {
                // If attending, no existing receipt, and no new file
                throw new Error('Please upload the payment receipt.');
            }

            const registrationData = {
                user_id: userId,
                alumni_id: alumniId,
                event_id: 'alumni-meet-2026',
                attending: attending,
                meal_preference: null, // Removed per user request
                total_participants: attending ? totalParticipants : 0,
                amount_paid: attending ? REGISTRATION_FEE : 0,
                payment_receipt: receiptUrl,
                status: 'pending', // Reset to pending ONLY if re-submitting (e.g. from rejected)
                created_at: new Date().toISOString()
            };

            const { error: insertError } = await supabase
                .from('event_registrations')
                .upsert(registrationData, { onConflict: 'user_id, event_id' });

            if (insertError) throw insertError;

            // Prepare success data
            setSuccessData(registrationData);
            setStep(4); // Success Step

        } catch (err: any) {
            console.error('Registration failed:', err);
            setError(err.message || 'Failed to register. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        onSuccess(); // Refresh dashboard data
        onClose();
    };

    // View Logic:
    // If fetching -> Loader
    // If existingRegistration & status is 'approved' or 'pending' -> Show Details View (Read-only)
    // If existingRegistration & status is 'rejected' -> Show Rejection View + "Try Again"
    // Else (New or updating rejected) -> Show Step Wizard

    if (fetchingParams) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                    <p className="text-center mt-2 text-gray-500">Loading details...</p>
                </div>
            </div>
        );
    }

    // Determine if we should show the read-only details view
    // Conditions: Registration exists AND (status is approved OR pending OR (it was rejected but we aren't editing yet))
    // We can use a simple flag or strictly check existingRegistration.

    const showDetailsMode = existingRegistration && step === 1 && !successData;
    // step === 1 check ensures if we "Try Again" (changing step), we go to wizard.

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full overflow-hidden transform transition-all max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700 shrink-0">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {showDetailsMode
                            ? (existingRegistration.attending ? 'Registration Details' : 'Registration Status')
                            : 'Event Registration'}
                    </h3>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar grow">
                    {/* Event Summary Card */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6 flex gap-4 items-start">
                        <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-lg shrink-0 text-blue-600 dark:text-blue-300">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white">Alumni Meet 2026</h4>
                            <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 flex items-center gap-1">
                                <MapPin size={12} />
                                <span>Institute of Tool Engineering, Dindigul</span>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                                Jan 25, 2026 • 10:00 AM
                            </div>
                        </div>
                    </div>

                    {showDetailsMode ? (
                        // --- EXISTING REGISTRATION VIEW ---
                        <div className="animate-fade-in space-y-6">
                            {/* Status Banner */}
                            <div className={`p-4 rounded-xl flex items-center gap-3 ${existingRegistration.status === 'approved'
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : existingRegistration.status === 'rejected'
                                    ? 'bg-red-50 text-red-700 border border-red-200'
                                    : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                                }`}>
                                {existingRegistration.status === 'approved' && <Check size={20} />}
                                {existingRegistration.status === 'rejected' && <X size={20} />}
                                {existingRegistration.status === 'pending' && <Loader2 size={20} />}
                                <div>
                                    <span className="font-bold uppercase tracking-wide text-xs block mb-1">Status</span>
                                    <span className="font-semibold text-lg capitalize">{existingRegistration.status === 'pending' ? 'Pending Approval' : existingRegistration.status}</span>
                                </div>
                            </div>

                            {/* Rejection Message */}
                            {existingRegistration.status === 'rejected' && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30 text-red-800 dark:text-red-300">
                                    <p className="font-medium">Please correct your application:</p>
                                    <p className="text-sm mt-1">Your previous application was rejected. Please review the details and submit again.</p>
                                </div>
                            )}

                            {/* Details (Only if attending) */}
                            {existingRegistration.attending ? (
                                <div className="space-y-4">
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-3">
                                        <h4 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 pb-2 mb-2">My Selections</h4>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500">Participants</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{existingRegistration.total_participants}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-200">
                                            <span className="text-gray-500">Amount Paid</span>
                                            <span className="font-bold text-[#E7A700]">₹{existingRegistration.amount_paid}</span>
                                        </div>
                                    </div>

                                    {/* Receipt Display */}
                                    {existingRegistration.payment_receipt && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Uploaded Receipt</h4>
                                            <div className="border rounded-xl p-2 bg-gray-50 dark:bg-gray-700/50">
                                                <img
                                                    src={existingRegistration.payment_receipt}
                                                    alt="Receipt"
                                                    className="w-full h-40 object-contain rounded-lg"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">You marked this event as <b>Not Attending</b>.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        // --- WIZARD / EDIT MODE ---
                        <>
                            {/* Steps */}
                            {step === 1 && (
                                <div className="space-y-6 animate-fade-in-right">
                                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Are you attending?</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setAttending(true)}
                                            className={`relative flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${attending === true
                                                ? 'border-[#E7A700] bg-[#E7A700]/10 text-[#E7A700]'
                                                : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-[#E7A700]/50'
                                                }`}
                                        >
                                            {attending === true && <div className="absolute top-2 right-2 text-[#E7A700]"><Check size={16} /></div>}
                                            <Check className={`w-8 h-8 mb-2 ${attending === true ? 'scale-110' : 'opacity-50'}`} />
                                            <span className="font-bold">Yes, I'll be there</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setAttending(false)}
                                            className={`relative flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${attending === false
                                                ? 'border-gray-400 bg-gray-100 text-gray-600'
                                                : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
                                                }`}
                                        >
                                            {attending === false && <div className="absolute top-2 right-2 text-gray-600"><Check size={16} /></div>}
                                            <X className={`w-8 h-8 mb-2 ${attending === false ? 'scale-110' : 'opacity-50'}`} />
                                            <span className="font-bold">No, can't make it</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 2 && attending && (
                                <div className="space-y-6 animate-fade-in-right">
                                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Registration Details</h4>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Number of Participants (including yourself)
                                        </label>
                                        <div className="flex items-center">
                                            <button
                                                type="button"
                                                onClick={() => setTotalParticipants(Math.max(1, totalParticipants - 1))}
                                                className="w-12 h-12 flex items-center justify-center rounded-l-xl bg-gray-100 hover:bg-gray-200 border border-r-0 border-gray-300 font-bold text-lg"
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                readOnly
                                                value={totalParticipants}
                                                className="w-full h-12 text-center border-y border-gray-300 font-bold text-gray-800"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setTotalParticipants(Math.min(10, totalParticipants + 1))}
                                                className="w-12 h-12 flex items-center justify-center rounded-r-xl bg-gray-100 hover:bg-gray-200 border border-l-0 border-gray-300 font-bold text-lg"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <div className="mt-2 text-right text-sm font-bold text-[#E7A700]">
                                            Registration Fee: ₹{REGISTRATION_FEE}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 3 && attending && (
                                <div className="space-y-6 animate-fade-in-right">
                                    <div className="text-center">
                                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Payment</h4>
                                        <p className="text-sm text-gray-500">Please pay fees to finalize registration</p>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-center">
                                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                            ₹{REGISTRATION_FEE}
                                        </div>
                                        <p className="text-sm text-gray-500 mb-4">Total Amount Payable</p>
                                    </div>

                                    {/* Payment Methods */}
                                    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Payment Methods</h4>

                                        {/* UPI Payment */}
                                        <div className="mb-6">
                                            <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center text-sm">
                                                <svg className="w-4 h-4 mr-2 text-[#E7A700]" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                                                </svg>
                                                UPI Payment
                                            </h5>
                                            <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                                                <p className="text-xs text-gray-500 mb-1">UPI ID:</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-mono font-semibold text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-600 select-all flex-grow">
                                                        334703265956342@cnrb
                                                    </p>
                                                    <button
                                                        onClick={() => handleCopy('334703265956342@cnrb')}
                                                        className="p-2 text-gray-500 hover:text-primary transition-colors"
                                                        title="Copy UPI ID"
                                                    >
                                                        {copied === '334703265956342@cnrb' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                                    </button>
                                                </div>
                                                <div className="mt-4">
                                                    <p className="text-xs text-gray-500 mb-2">Scan QR Code to Pay:</p>
                                                    <div className="flex justify-center sm:justify-start">
                                                        <img
                                                            src="/bank_details/QR_code.JPG"
                                                            alt="Payment QR Code"
                                                            className="w-32 h-auto border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bank Transfer */}
                                        <div>
                                            <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center text-sm">
                                                <svg className="w-4 h-4 mr-2 text-[#E7A700]" fill="currentColor" viewBox="0 20 20">
                                                    <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v2H4V6zm0 4h12v2H4v-2z" />
                                                </svg>
                                                Bank Transfer
                                            </h5>
                                            <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-md border border-gray-200 dark:border-gray-700 space-y-2 text-xs">
                                                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
                                                    <span className="font-medium text-gray-500">Account Name</span>
                                                    <span className="font-semibold text-gray-900 dark:text-white text-right">DTEA Association</span>
                                                </div>
                                                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1 items-center">
                                                    <span className="font-medium text-gray-500">Account No</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-gray-900 dark:text-white font-mono text-right select-all">120036956342</span>
                                                        <button
                                                            onClick={() => handleCopy('120036956342')}
                                                            className="text-gray-400 hover:text-primary transition-colors"
                                                            title="Copy Account Number"
                                                        >
                                                            {copied === '120036956342' ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1 items-center">
                                                    <span className="font-medium text-gray-500">IFSC Code</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-gray-900 dark:text-white font-mono text-right select-all">CNRB0001459</span>
                                                        <button
                                                            onClick={() => handleCopy('CNRB0001459')}
                                                            className="text-gray-400 hover:text-primary transition-colors"
                                                            title="Copy IFSC Code"
                                                        >
                                                            {copied === 'CNRB0001459' ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
                                                    <span className="font-medium text-gray-500">Bank</span>
                                                    <span className="font-semibold text-gray-900 dark:text-white text-right">Canara Bank</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="font-medium text-gray-500">Branch</span>
                                                    <span className="font-semibold text-gray-900 dark:text-white text-right">Nagal Nagar</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Upload Payment Receipt
                                        </label>
                                        <div className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${receiptFile ? 'border-green-500 bg-green-50/50' : 'border-gray-300 hover:border-[#E7A700]'}`}>
                                            <input
                                                type="file"
                                                accept="image/png, image/jpeg, image/jpg"
                                                onChange={handleReceiptUpload}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            {receiptPreview ? (
                                                <div className="relative group">
                                                    <img src={receiptPreview} alt="Receipt Preview" className="h-32 mx-auto object-contain rounded-md" />
                                                    <div className="mt-2 text-sm text-green-600 font-medium flex items-center justify-center gap-1">
                                                        <Check size={14} /> Receipt Selected
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            e.preventDefault();
                                                            setReceiptFile(null);
                                                            setReceiptPreview(null);
                                                        }}
                                                        className="absolute -top-2 -right-2 p-1.5 bg-white rounded-full shadow-md text-gray-500 hover:text-red-500 hover:bg-red-50 border border-gray-200 transition-all z-10"
                                                        title="Remove receipt"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                                                        <Upload size={20} />
                                                    </div>
                                                    <p className="text-sm text-gray-600 font-medium">Click to upload receipt</p>
                                                    <p className="text-xs text-gray-400">JPG, PNG up to 5MB</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 4 && (
                                <div className="text-center py-8 animate-fade-in-up">
                                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Check size={40} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        {successData?.attending ? 'Registration Successful!' : 'Response Recorded'}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-sm mx-auto">
                                        {successData?.attending
                                            ? "Thank you for registering. Your payment receipt has been submitted for verification. We'll update you once approved."
                                            : "Thank you for letting us know. We hope to see you in future events."}
                                    </p>

                                    {successData?.attending && (
                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-left max-w-sm mx-auto mb-6 space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Event</span>
                                                <span className="font-semibold text-gray-900 dark:text-white">Alumni Meet 2026</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Total Persons</span>
                                                <span className="font-semibold text-gray-900 dark:text-white">{successData.total_participants}</span>
                                            </div>
                                            <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                                                <span className="text-gray-500">Amount Paid</span>
                                                <span className="font-bold text-[#E7A700]">₹{successData.amount_paid}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {error && (
                        <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm text-center">
                            {error}
                        </div>
                    )}

                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-700 shrink-0 bg-white dark:bg-gray-800">
                    {showDetailsMode ? (
                        <div className="flex gap-3">
                            <button
                                onClick={handleClose}
                                className="w-full py-3 rounded-xl bg-gray-200 text-gray-800 font-bold hover:bg-gray-300 transition-all"
                            >
                                Close
                            </button>
                            {/* Allow re-submission only if rejected or not attending */}
                            {(existingRegistration.status === 'rejected' || !existingRegistration.attending) && (
                                <button
                                    onClick={() => {
                                        setExistingRegistration(null); // Clear 'existing' to enter edit mode
                                        setStep(1);
                                    }}
                                    className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover transition-all"
                                >
                                    {existingRegistration.status === 'rejected' ? 'Fix & Resubmit' : 'Update Response'}
                                </button>
                            )}
                        </div>
                    ) : (
                        step === 4 ? (
                            <button
                                onClick={handleClose}
                                className="w-full py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-all"
                            >
                                Back to Dashboard
                            </button>
                        ) : (
                            <div className="flex gap-3">
                                {step > 1 && (
                                    <button
                                        onClick={handleBack}
                                        disabled={loading}
                                        className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-all"
                                    >
                                        Back
                                    </button>
                                )}
                                <button
                                    onClick={step === 3 || (!attending && step === 1) ? handleSubmit : handleNext}
                                    disabled={loading}
                                    className={`flex-1 py-3 rounded-xl bg-gradient-to-r from-[#003366] to-[#004080] text-white font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2`}
                                >
                                    {loading && <Loader2 className="animate-spin w-5 h-5" />}
                                    {step === 3 || (!attending && step === 1) ? 'Submit' : 'Next'}
                                </button>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};
export default EventRegistrationModal;
