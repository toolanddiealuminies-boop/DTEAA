import React from 'react';
import { createPortal } from 'react-dom';
import { X, Printer } from 'lucide-react';

interface InvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: any; // The voucher object
    userName: string;
    alumniId: string;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, invoice, userName, alumniId }) => {
    if (!isOpen || !invoice) return null;

    const handlePrint = () => {
        window.print();
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/60 backdrop-blur-sm">
            <style type="text/css" media="print">
                {`
                @page { size: auto; margin: 20px; }
                
                /* 1. Hide the Main App completely (collapses height) */
                #root {
                    display: none !important;
                }

                /* 2. Reset Body for Print */
                body, html {
                    background: white !important;
                    height: auto !important;
                    overflow: visible !important;
                }

                /* 3. Style the Portal Content */
                /* Target the wrapper div of this component explicitly */
                div[class*="fixed inset-0"] {
                    position: static !important;
                    background: white !important;
                    overflow: visible !important;
                    display: block !important;
                }

                /* 4. Hide Overlay/Background effects */
                .backdrop-blur-sm {
                   backdrop-filter: none !important;
                   background: white !important;
                }

                /* 5. Hide Actions Bar */
                .actions-bar {
                     display: none !important;
                }

                /* 6. Ensure Content is Visible */
                #invoice-card-content {
                    box-shadow: none !important;
                    margin: 0 !important;
                    width: 100% !important;
                    max-width: none !important;
                }
                `}
            </style>

            <div className="flex min-h-full items-center justify-center p-4 text-center">
                <div
                    id="invoice-card-content"
                    className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all"
                >

                    {/* Actions Bar (Hidden on Print) */}
                    <div className="actions-bar flex justify-between items-center p-4 bg-gray-50 border-b border-gray-200">
                        <h3 className="font-bold text-gray-700">Receipt</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                            >
                                <Printer size={16} /> Print
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-500 hover:bg-gray-200 rounded transition"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Invoice Content */}
                    <div className="p-8 md:p-12 space-y-8">

                        {/* Header */}
                        <div className="border-b-2 border-gray-800 pb-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <img src="/dteaa_logo_light.png" alt="DTEAA Logo" className="h-24 w-auto object-contain" />
                                </div>
                                <div className="text-right">
                                    <h2 className="text-xl font-bold text-[#003366]">Dindigul Tool Engineering Alumni Association</h2>
                                    <p className="text-sm text-gray-600">43/16, Balasubramaniam Oil Mill Compound, Natham Road,</p>
                                    <p className="text-sm text-gray-600">Adianoothu, Dindigul - 624003</p>
                                    <p className="text-sm text-gray-600">Email: toolanddie.aluminies@gmail.com</p>
                                </div>
                            </div>

                            <div className="text-center">
                                <h1 className="text-3xl font-extrabold text-gray-900 uppercase tracking-widest">Invoice</h1>
                                <p className="text-sm text-gray-500 mt-1">Original Recipient</p>
                            </div>
                        </div>

                        {/* Details Row */}
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Billed To:</h4>
                                <p className="font-bold text-gray-800 text-lg">{userName}</p>
                                <p className="text-gray-600">Alumni ID: {alumniId || 'N/A'}</p>
                            </div>
                            <div className="text-right">
                                <div className="mb-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Invoice Number:</span>
                                    <span className="font-mono font-bold text-gray-800">{invoice.code}</span>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Date:</span>
                                    <span className="font-bold text-gray-800">{new Date(invoice.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="mt-8">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider border-y border-gray-300">
                                        <th className="py-3 px-4 w-1/2">Description</th>
                                        <th className="py-3 px-4 text-center">Type</th>
                                        <th className="py-3 px-4 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    <tr>
                                        <td className="py-4 px-4 font-medium text-gray-800">
                                            Alumni Meet 2026 - {invoice.type === 'registration' ? 'Event Registration' : 'Sponsorship Contribution'}
                                        </td>
                                        <td className="py-4 px-4 text-center text-sm text-gray-500 capitalize">
                                            {invoice.type}
                                        </td>
                                        <td className="py-4 px-4 text-right font-bold text-gray-800">
                                            ₹{invoice.amount.toLocaleString()}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="flex justify-end pt-4">
                            <div className="w-64 space-y-3">
                                <div className="flex justify-between text-gray-600 text-sm">
                                    <span>Subtotal:</span>
                                    <span>₹{invoice.amount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 text-sm">
                                    <span>Tax (0%):</span>
                                    <span>₹0</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg text-gray-900 border-t border-gray-300 pt-2">
                                    <span>Total:</span>
                                    <span>₹{invoice.amount.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer / Notes */}
                        <div className="pt-12 mt-12 border-t border-gray-200">
                            <div className="mb-8">
                                <h4 className="text-sm font-bold text-gray-700 mb-1">Terms & Notes:</h4>
                                <ul className="text-xs text-gray-500 list-disc list-inside space-y-1">
                                    <li>This is a computer-generated receipt/invoice and does not require a physical signature.</li>
                                    <li>Thank you for your contribution to the DTEA Alumni Association.</li>
                                    {/* <li>Please retain this invoice for your tax records.</li> */}
                                </ul>
                            </div>

                            <div className="flex justify-between items-end">
                                <div className="text-center">
                                    <div className="h-16 w-32 mb-2 flex items-center justify-center border border-dashed border-gray-300 rounded bg-gray-50">
                                        <span className="text-[10px] text-gray-400 italic">Digitally Verified</span>
                                    </div>
                                    <p className="text-xs font-bold text-gray-600 uppercase">Authorized Signatory</p>
                                </div>
                                <div className="text-2xl font-bold text-gray-200 select-none">DTEAA</div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default InvoiceModal;
