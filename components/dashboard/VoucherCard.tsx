import React from 'react';
import { Ticket, DollarSign, Calendar, ShieldCheck, Download } from 'lucide-react';

interface VoucherProps {
    voucher: {
        id: string;
        code: string;
        type: string;
        amount: number;
        created_at: string;
        event_id: string;
    };
}

const VoucherCard: React.FC<VoucherProps> = ({ voucher }) => {
    const isSponsorship = voucher.type === 'sponsorship';

    return (
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all group">
            {/* Decorative Background Pattern */}
            <div className={`absolute top-0 left-0 w-2 h-full ${isSponsorship ? 'bg-purple-500' : 'bg-green-500'}`}></div>
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gray-50 dark:bg-gray-700/50 z-0"></div>

            <div className="relative z-10 p-5 pl-7">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className={`text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1 ${isSponsorship ? 'text-purple-600 dark:text-purple-400' : 'text-green-600 dark:text-green-400'}`}>
                            {isSponsorship ? <ShieldCheck size={12} /> : <Ticket size={12} />}
                            {isSponsorship ? 'Sponsorship Invoice' : 'Event Invoice'}
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-lg">Alumni Meet 2026</h4>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <Calendar size={12} />
                            <span>Jan 25, 2026</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-400">Value</div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white flex items-center justify-end">
                            <span className="text-xs text-gray-500 mr-1">₹</span>
                            {voucher.amount}
                        </div>
                    </div>
                </div>

                {/* Dashed Divider */}
                <div className="relative h-px w-full border-t border-dashed border-gray-300 dark:border-gray-600 my-4">
                    <div className="absolute -left-7 -top-1.5 w-3 h-3 rounded-full bg-gray-100 dark:bg-gray-900"></div>
                    <div className="absolute -right-7 -top-1.5 w-3 h-3 rounded-full bg-gray-100 dark:bg-gray-900"></div>
                </div>

                <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 mb-1">INVOICE CODE</p>
                    <div className="font-mono text-xl font-bold tracking-widest text-gray-800 dark:text-gray-200 select-all">
                        {voucher.code}
                    </div>
                </div>

                <div className="mt-4 text-center">
                    <p className="text-[10px] text-gray-400">Present this code at the venue entry.</p>
                </div>
            </div>
        </div>
    );
};

export default VoucherCard;
