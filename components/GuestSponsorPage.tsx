import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Upload, Check, Loader2, Copy, Heart, X, ArrowLeft } from 'lucide-react';

const GuestSponsorPage: React.FC = () => {
    // Form State
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [organization, setOrganization] = useState('');
    const [amount, setAmount] = useState<number>(5000);
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

    // UI State
    const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Success
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState('');
    const [successId, setSuccessId] = useState('');

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(text);
        setTimeout(() => setCopied(''), 2000);
    };

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!fullName || !email || !phone || !amount) {
            setError('Please fill in all required fields.');
            return;
        }

        if (!receiptFile) {
            setError('Please upload the payment receipt.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // 1. Upload Receipt
            const fileExt = receiptFile.name.split('.').pop();
            const fileName = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('receipts')
                .upload(fileName, receiptFile);

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
                .from('receipts')
                .getPublicUrl(fileName);

            const receiptUrl = urlData.publicUrl;

            // 2. Submit via RPC (Secure)
            const { data, error: insertError } = await supabase
                .rpc('submit_guest_sponsorship', {
                    p_full_name: fullName,
                    p_email: email,
                    p_phone: phone,
                    p_organization: organization || null,
                    p_amount: amount,
                    p_payment_receipt: receiptUrl
                });

            if (insertError) throw insertError;

            // RPC returns the ID directly
            setSuccessId(data);
            setStep(3);

        } catch (err: any) {
            console.error('Sponsorship failed:', err);
            setError(err.message || 'Failed to submit. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
            {/* Minimal Header */}
            <header className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-10 shadow-sm">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/dteaa_logo_light.png" alt="DTEAA Logo" className="h-10 w-auto" />
                        <div>
                            <h1 className="text-lg font-bold text-[#003366] leading-tight">DTEAA Alumni Meet 2026</h1>
                            <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Guest Sponsorship</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow p-4 md:p-8">
                <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

                    {step === 1 && (
                        <div className="p-8 animate-fade-in">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Support Our Event</h2>
                            <p className="text-gray-600 mb-8">
                                Thank you for your interest in sponsoring the Alumni Meet 2026. Please provide your details below.
                            </p>

                            <form onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                required
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#003366] focus:border-transparent transition-all outline-none"
                                                placeholder="Enter your name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Organization (Optional)</label>
                                            <input
                                                type="text"
                                                value={organization}
                                                onChange={(e) => setOrganization(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#003366] focus:border-transparent transition-all outline-none"
                                                placeholder="Company name"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address <span className="text-red-500">*</span></label>
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#003366] focus:border-transparent transition-all outline-none"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number <span className="text-red-500">*</span></label>
                                            <input
                                                type="tel"
                                                required
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#003366] focus:border-transparent transition-all outline-none"
                                                placeholder="+91 98765 43210"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Sponsorship Amount (₹) <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-3.5 text-gray-500 font-bold">₹</span>
                                            <input
                                                type="number"
                                                required
                                                min="100"
                                                step="100"
                                                value={amount}
                                                onChange={(e) => setAmount(Number(e.target.value))}
                                                className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#003366] focus:border-transparent transition-all outline-none font-bold text-lg"
                                            />
                                        </div>
                                        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                                            {[5000, 10000, 25000, 50000, 100000].map((val) => (
                                                <button
                                                    key={val}
                                                    type="button"
                                                    onClick={() => setAmount(val)}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${amount === val
                                                        ? 'bg-[#003366] text-white shadow-md'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                                >
                                                    ₹{val.toLocaleString()}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-4 rounded-xl bg-gradient-to-r from-[#003366] to-[#004080] text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
                                    >
                                        Proceed to Payment <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="p-8 animate-fade-in-right">
                            <button
                                onClick={() => setStep(1)}
                                className="mb-6 text-gray-500 flex items-center gap-1 text-sm font-medium hover:text-[#003366] transition-colors"
                            >
                                <ArrowLeft size={16} /> Back to Details
                            </button>

                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Complete Payment</h2>

                            <div className="bg-gray-50 p-6 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-center mb-8">
                                <div className="text-4xl font-bold text-[#003366] mb-1">
                                    ₹{amount.toLocaleString()}
                                </div>
                                <p className="text-sm text-gray-500">Total Sponsorship Amount</p>
                            </div>

                            {/* Payment Methods - Reused Logic */}
                            <div className="space-y-6 mb-8">
                                {/* UPI Section */}
                                <div className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
                                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xs font-bold">UPI</div>
                                        UPI Payment
                                    </h4>
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <div className="flex items-center gap-2 mb-4">
                                            <p className="flex-grow font-mono font-semibold bg-white p-3 rounded border border-gray-200 select-all text-gray-800">
                                                334703265956342@cnrb
                                            </p>
                                            <button
                                                onClick={() => handleCopy('334703265956342@cnrb')}
                                                className="p-3 bg-white border border-gray-200 rounded text-gray-500 hover:text-green-600 hover:border-green-500 transition-all"
                                                title="Copy UPI ID"
                                            >
                                                {copied === '334703265956342@cnrb' ? <Check size={20} /> : <Copy size={20} />}
                                            </button>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500 mb-2">Scan QR Code to Pay</p>
                                            <img
                                                src="/bank_details/QR_code.JPG"
                                                alt="Payment QR Code"
                                                className="w-40 h-auto mx-auto border border-gray-200 rounded-lg shadow-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Bank Transfer Section */}
                                <div className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
                                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">BNK</div>
                                        Bank Transfer
                                    </h4>
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-2 text-sm">
                                        <div className="flex justify-between border-b border-gray-200 pb-2">
                                            <span className="font-medium text-gray-500">Account Name</span>
                                            <span className="font-bold text-gray-900 text-right">DTEA Association</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-200 pb-2 items-center">
                                            <span className="font-medium text-gray-500">Account No</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-900 font-mono text-right select-all">120036956342</span>
                                                <button
                                                    onClick={() => handleCopy('120036956342')}
                                                    className="text-gray-400 hover:text-green-600 transition-colors"
                                                    title="Copy Account Number"
                                                >
                                                    {copied === '120036956342' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-200 pb-2 items-center">
                                            <span className="font-medium text-gray-500">IFSC Code</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-900 font-mono text-right select-all">CNRB0001459</span>
                                                <button
                                                    onClick={() => handleCopy('CNRB0001459')}
                                                    className="text-gray-400 hover:text-green-600 transition-colors"
                                                    title="Copy IFSC Code"
                                                >
                                                    {copied === 'CNRB0001459' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-200 pb-2">
                                            <span className="font-medium text-gray-500">Bank</span>
                                            <span className="font-bold text-gray-900 text-right">Canara Bank</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium text-gray-500">Branch</span>
                                            <span className="font-bold text-gray-900 text-right">Nagal Nagar</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Receipt Upload */}
                            <div className="mb-8">
                                <h3 className="font-bold text-gray-800 mb-3">Upload Payment Receipt <span className="text-red-500">*</span></h3>
                                <div className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer group ${receiptFile ? 'border-green-500 bg-green-50/30' : 'border-gray-300 hover:border-[#003366] hover:bg-blue-50/30'}`}>
                                    <input
                                        type="file"
                                        accept="image/png, image/jpeg, image/jpg"
                                        onChange={handleReceiptUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    {receiptPreview ? (
                                        <div className="relative">
                                            <img src={receiptPreview} alt="Receipt Preview" className="h-48 mx-auto object-contain rounded-lg shadow-sm" />
                                            <div className="mt-3 text-sm text-green-700 font-bold flex items-center justify-center gap-2">
                                                <Check size={18} /> Receipt Selected
                                            </div>
                                            <button
                                                onClick={(e) => { e.preventDefault(); setReceiptFile(null); setReceiptPreview(null); }}
                                                className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-md border border-gray-200 hover:bg-red-50 hover:text-red-500 z-20"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                                <Upload size={28} />
                                            </div>
                                            <p className="text-gray-600 font-medium">Click or Drag to upload receipt</p>
                                            <p className="text-xs text-gray-400">Supported formats: JPG, PNG (Max 5MB)</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100 flex items-center gap-2">
                                    <X size={16} /> {error}
                                </div>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={loading || !receiptFile}
                                className="w-full py-4 rounded-xl bg-[#003366] text-white font-bold text-lg shadow-lg hover:shadow-xl hover:bg-[#002855] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3"
                            >
                                {loading && <Loader2 className="animate-spin" />}
                                {loading ? 'Submitting...' : 'Submit Sponsorship'}
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="p-12 text-center animate-fade-in-up">
                            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                <Heart size={48} fill="currentColor" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h2>
                            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                                You are making a huge difference! We have received your sponsorship details.
                            </p>

                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 max-w-sm mx-auto mb-8 text-left space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Amount</span>
                                    <span className="font-bold text-gray-900">₹{amount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Reference ID</span>
                                    <span className="font-mono text-gray-900 truncate ml-4" title={successId}>{successId.slice(0, 8)}...</span>
                                </div>
                                <div className="border-t border-gray-200 pt-3 text-xs text-gray-500 text-center">
                                    A confirmation email will be sent to <b>{email}</b> once approved.
                                </div>
                            </div>

                            <button
                                onClick={() => window.location.reload()}
                                className="inline-block px-8 py-3 rounded-full bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-all shadow-md hover:shadow-lg"
                            >
                                Submit Another Sponsorship
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <footer className="bg-white border-t border-gray-200 py-6 text-center text-sm text-gray-500">
                <p>&copy; 2026 DTEAA. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default GuestSponsorPage;
