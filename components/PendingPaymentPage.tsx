import React, { useState } from 'react';
import { Copy, Check, Clock, CreditCard, CheckCircle, LogOut, Home, Upload, Loader2, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import type { UserData } from '../types';
import Footer from './home/Footer';

interface PendingPaymentPageProps {
    userData: UserData;
    onLogout: () => void;
    onHomeClick?: () => void;
}

const PendingPaymentPage: React.FC<PendingPaymentPageProps> = ({ userData, onLogout, onHomeClick }) => {
    const [copied, setCopied] = useState('');
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [error, setError] = useState('');

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

    const handleUploadReceipt = async () => {
        if (!receiptFile) return;
        setUploading(true);
        setError('');

        try {
            const fileExt = receiptFile.name.split('.').pop();
            const fileName = `${userData.id}/${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage.from('receipts').upload(fileName, receiptFile);
            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(fileName);
            const publicUrl = urlData?.publicUrl || '';

            // Update profile with the new receipt
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ payment_receipt: publicUrl })
                .eq('id', userData.id);

            if (updateError) throw updateError;

            setUploadSuccess(true);
            setReceiptFile(null);
            setReceiptPreview(null);
        } catch (err: any) {
            console.error('Receipt upload failed:', err);
            setError(err.message || 'Failed to upload receipt. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const hasExistingReceipt = !!userData.paymentReceipt && userData.paymentReceipt !== 'ALUMNI_MEET_REGISTRATION';

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Navbar */}
            <header className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-30 shadow-sm">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/dteaa_logo_light.png" alt="DTEAA Logo" className="h-10 w-auto" />
                        <div>
                            <h1 className="text-lg font-bold text-[#003366] leading-tight">DTEAA Alumni Portal</h1>
                            <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Payment & Verification</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {onHomeClick && (
                            <button
                                onClick={onHomeClick}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#003366] hover:bg-gray-100 rounded-lg transition-all"
                            >
                                <Home size={16} />
                                <span className="hidden sm:inline">Home</span>
                            </button>
                        )}
                        <button
                            onClick={onLogout}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                            <LogOut size={16} />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow p-4 md:p-8">
                <div className="max-w-3xl mx-auto space-y-6">

                    {/* Status Banner */}
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                <Clock className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-amber-800 mb-1">Registration Pending Verification</h2>
                                <p className="text-amber-700 text-sm">
                                    Hi <strong>{userData.personal.firstName || 'User'}</strong>,
                                    {hasExistingReceipt
                                        ? ' your payment receipt has been submitted and is being reviewed by the admin. You will be notified once verified.'
                                        : ' please complete your payment using the details below and upload the receipt to proceed.'}
                                </p>
                                {userData.alumniId && (
                                    <p className="text-amber-600 text-xs mt-2">
                                        Alumni ID: <span className="font-mono font-bold">{userData.alumniId}</span>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Fee Structure */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 bg-gradient-to-r from-[#003366] to-[#004080]">
                            <h3 className="font-bold text-white text-lg flex items-center gap-2">
                                <CreditCard className="w-5 h-5" />
                                Membership Fee Structure
                            </h3>
                        </div>
                        <div className="p-6 space-y-3">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div>
                                    <p className="font-medium text-gray-800">One-time Registration Fee</p>
                                    <p className="text-xs text-gray-500">Paid once at the time of registration</p>
                                </div>
                                <span className="text-xl font-bold text-[#003366]">₹100</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div>
                                    <p className="font-medium text-gray-800">Yearly Subscription</p>
                                    <p className="text-xs text-gray-500">Annual membership renewal fee</p>
                                </div>
                                <span className="text-xl font-bold text-[#003366]">₹600</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                                <div>
                                    <p className="font-bold text-gray-900">Total (First Year)</p>
                                    <p className="text-xs text-gray-500">Registration + First year subscription</p>
                                </div>
                                <span className="text-2xl font-bold text-[#003366]">₹700</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 bg-gradient-to-r from-[#003366] to-[#004080]">
                            <h3 className="font-bold text-white text-lg">Payment Details</h3>
                            <p className="text-blue-200 text-sm">Use any of the methods below to make your payment</p>
                        </div>
                        <div className="p-6 space-y-6">

                            {/* UPI Section */}
                            <div className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm">
                                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
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
                                            {copied === '334703265956342@cnrb' ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                                        </button>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500 mb-2">Scan QR Code to Pay</p>
                                        <img
                                            src="/bank_details/QR_code.JPG"
                                            alt="Payment QR Code"
                                            className="w-40 h-auto mx-auto border border-gray-200 rounded-lg shadow-sm"
                                        />
                                        <a
                                            href="upi://pay?pa=334703265956342@cnrb&pn=DTEA%20Association&am=700&cu=INR"
                                            className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-orange-700 transition-all text-sm"
                                        >
                                            📱 Pay via UPI App
                                        </a>
                                        <p className="text-xs text-gray-400 mt-2">Opens GPay, Paytm, PhonePe, CRED etc. (Mobile only)</p>
                                    </div>
                                </div>
                            </div>

                            {/* Bank Transfer Section */}
                            <div className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm">
                                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
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
                    </div>

                    {/* Receipt Upload Section */}
                    {!hasExistingReceipt && !uploadSuccess && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 bg-gradient-to-r from-green-600 to-green-700">
                                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                                    <Upload className="w-5 h-5" />
                                    Upload Payment Receipt
                                </h3>
                                <p className="text-green-200 text-sm">After making your payment, upload the screenshot/receipt here</p>
                            </div>
                            <div className="p-6">
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

                                {error && (
                                    <div className="mt-4 p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100 flex items-center gap-2">
                                        <X size={16} /> {error}
                                    </div>
                                )}

                                <button
                                    onClick={handleUploadReceipt}
                                    disabled={uploading || !receiptFile}
                                    className="mt-4 w-full py-4 rounded-xl bg-[#003366] text-white font-bold text-lg shadow-lg hover:shadow-xl hover:bg-[#002855] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3"
                                >
                                    {uploading && <Loader2 className="animate-spin" />}
                                    {uploading ? 'Uploading...' : 'Submit Receipt'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Success Message */}
                    {(hasExistingReceipt || uploadSuccess) && (
                        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-green-800 mb-1">Receipt Submitted Successfully</h3>
                                    <p className="text-green-700 text-sm">
                                        Your payment receipt has been submitted. The admin will verify it and you will be notified once approved.
                                        Please check back later or wait for a confirmation email.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Benefits */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h4 className="font-semibold text-gray-800 mb-4">Benefits after verification:</h4>
                        <ul className="space-y-2">
                            {[
                                'Official Alumni ID Card (Digital)',
                                'Access to Alumni Directory',
                                'Event Registration & Sponsorship',
                                'Networking with fellow alumni',
                                'Profile visibility in the directory',
                            ].map((benefit, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    {benefit}
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PendingPaymentPage;
