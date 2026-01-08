import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { X, Check, Loader2, Upload, DollarSign, Smartphone, Landmark } from 'lucide-react';

interface SponsorModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    eventId: string;
    onSuccess: () => void;
}

const SponsorModal: React.FC<SponsorModalProps> = ({ isOpen, onClose, userId, eventId, onSuccess }) => {
    const [amount, setAmount] = useState<number | ''>('');
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [copied, setCopied] = useState('');

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(text);
        setTimeout(() => setCopied(''), 2000);
    };

    if (!isOpen) return null;

    const resetState = () => {
        setAmount('');
        setReceiptFile(null);
        setReceiptPreview(null);
        setLoading(false);
        setError('');
        setSuccess(false);
    };

    const handleClose = () => {
        onClose();
        setTimeout(resetState, 300); // Reset after close animation
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
        }
    };

    const handleSubmit = async () => {
        if (!amount || Number(amount) <= 0) {
            setError('Please enter a valid sponsorship amount.');
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
            const fileName = `${userId}/${eventId}_sponsor_${Math.random()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('receipts')
                .upload(fileName, receiptFile);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('receipts')
                .getPublicUrl(fileName);

            // 2. Insert Sponsorship Record using RPC to bypass RLS issues
            const { error: insertError } = await supabase.rpc('submit_sponsorship', {
                p_event_id: eventId,
                p_amount: Number(amount),
                p_receipt_url: publicUrl
            });

            if (insertError) throw insertError;

            setSuccess(true);
            onSuccess(); // Trigger parent refresh immediately

        } catch (err: any) {
            console.error('Sponsorship error:', err);
            setError(err.message || 'Failed to submit sponsorship. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                <div className="bg-white dark:bg-dark-card w-full max-w-md rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Thank You!</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Your sponsorship of ₹{amount} has been submitted for approval. We appreciate your support!
                    </p>
                    <button
                        onClick={handleClose}
                        className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-dark-card w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-primary" />
                        Sponsor Event
                    </h3>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors text-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Amount Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Sponsorship Amount (₹)
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                            <input
                                type="number"
                                min="100"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                onWheel={(e) => e.currentTarget.blur()}
                                className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                placeholder="Enter amount"
                            />
                        </div>
                    </div>

                    {/* Payment Details */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50">
                        <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-4 uppercase tracking-wider">
                            Payment Methods
                        </h4>

                        <div className="space-y-6">
                            {/* UPI Payment */}
                            <div className="bg-white dark:bg-dark-bg p-3 rounded-lg border border-blue-100 dark:border-blue-800/30">
                                <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center text-sm">
                                    <Smartphone className="w-5 h-5 text-[#E7A700] mr-2" />
                                    UPI Payment
                                </h5>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-grow mr-2">
                                            <p className="text-xs text-gray-500 uppercase mb-1">UPI ID</p>
                                            <p className="font-mono font-medium text-gray-900 dark:text-white select-all text-sm bg-gray-50 dark:bg-gray-800/50 p-2 rounded">
                                                334703265956342@cnrb
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleCopy('334703265956342@cnrb')}
                                            className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors self-end mb-1"
                                            title="Copy UPI ID"
                                        >
                                            {copied === '334703265956342@cnrb' ? <Check className="w-3 h-3" /> : <span className="text-xs font-bold">COPY</span>}
                                        </button>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-500 uppercase mb-2">Scan QR Code</p>
                                        <div className="bg-white p-2 inline-block rounded-lg shadow-sm border border-gray-100">
                                            <img
                                                src="/bank_details/QR_code.JPG"
                                                alt="Payment QR Code"
                                                className="w-32 h-auto rounded"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bank Transfer */}
                            <div className="bg-white dark:bg-dark-bg p-3 rounded-lg border border-blue-100 dark:border-blue-800/30">
                                <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center text-sm">
                                    <Landmark className="w-5 h-5 text-[#E7A700] mr-2" />
                                    Bank Transfer
                                </h5>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                                        <span className="text-gray-500">Account Name</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">DTEA Association</span>
                                    </div>

                                    <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2">
                                        <span className="text-gray-500">Account No</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-semibold text-gray-900 dark:text-white select-all">120036956342</span>
                                            <button
                                                onClick={() => handleCopy('120036956342')}
                                                className="text-primary hover:text-primary-hover p-1"
                                                title="Copy Account Number"
                                            >
                                                {copied === '120036956342' ? <Check className="w-3 h-3" /> : <span className="text-xs font-bold">COPY</span>}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2">
                                        <span className="text-gray-500">IFSC Code</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-semibold text-gray-900 dark:text-white select-all">CNRB0001459</span>
                                            <button
                                                onClick={() => handleCopy('CNRB0001459')}
                                                className="text-primary hover:text-primary-hover p-1"
                                                title="Copy IFSC Code"
                                            >
                                                {copied === 'CNRB0001459' ? <Check className="w-3 h-3" /> : <span className="text-xs font-bold">COPY</span>}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                                        <span className="text-gray-500">Bank</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">Canara Bank</span>
                                    </div>

                                    <div className="flex justify-between pt-1">
                                        <span className="text-gray-500">Branch</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">Nagal Nagar</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Receipt Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Upload Payment Receipt
                        </label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-xl hover:border-primary transition-colors cursor-pointer relative bg-gray-50 dark:bg-gray-900/50">
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                accept="image/*"
                                onChange={handleReceiptUpload}
                            />
                            <div className="space-y-1 text-center">
                                {receiptPreview ? (
                                    <div className="relative">
                                        <img src={receiptPreview} alt="Receipt Preview" className="h-32 mx-auto object-contain rounded-md" />
                                        <div className="mt-2 text-sm text-green-600 font-medium flex items-center justify-center gap-1">
                                            <Check className="w-4 h-4 mr-1 text-green-600" /> Receipt Selected
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent triggering file input
                                                setReceiptFile(null);
                                                setReceiptPreview(null);
                                            }}
                                            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md text-gray-500 hover:text-red-500 hover:bg-gray-100 transition-all"
                                            title="Remove receipt"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="mx-auto h-12 w-12 text-gray-400 flex items-center justify-center border-2 border-gray-300 rounded mb-2">
                                            <Upload className="w-6 h-6" />
                                        </div>
                                        <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                                            <span className="relative cursor-pointer bg-transparent rounded-md font-medium text-primary hover:text-primary-hover focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                                                Upload a file
                                            </span>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-500">
                                            PNG, JPG up to 5MB
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            'Submit Sponsorship'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SponsorModal;
