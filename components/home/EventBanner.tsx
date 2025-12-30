import React from 'react';
import { Calendar, MapPin } from 'lucide-react';

interface EventBannerProps {
    onActionClick?: () => void;
}

const EventBanner: React.FC<EventBannerProps> = ({ onActionClick }) => {
    return (
        <section className="bg-gradient-to-r from-[#003366] to-[#004080] text-white py-12 px-4 relative overflow-hidden rounded-[2rem] mx-4 my-8 shadow-2xl">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between relative z-10">
                <div className="mb-8 md:mb-0 text-center md:text-left">
                    <div className="inline-block bg-[#E7A700] text-[#003366] text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wide">
                        Upcoming Major Event
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Alumni Meet 2026</h2>
                    <p className="text-blue-100 max-w-xl text-lg mb-6">
                        Join us for a day of nostalgia, networking, and celebration. Reconnect with old friends and make new memories.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-6 text-sm font-medium">
                        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                            <Calendar className="w-5 h-5 text-[#E7A700]" />
                            <span>January 25, 2026</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                            <MapPin className="w-5 h-5 text-[#E7A700]" />
                            <span>Institute of Tool Engineering, Dindigul</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md max-w-sm w-full">
                    <div className="text-center">
                        <h3 className="text-xl font-bold mb-2">Register Today</h3>
                        <p className="text-sm text-blue-100 mb-6">Alumni can register specifically for this event.</p>
                        <div className="space-y-3">
                            <button
                                onClick={onActionClick}
                                className="w-full bg-[#E7A700] text-[#003366] font-bold py-3 px-6 rounded-lg shadow-lg text-center transform hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer hover:bg-[#ffbe0b]"
                            >
                                Mark Your Calendar
                            </button>
                            <p className="text-xs text-blue-200 mt-2">
                                * Registration details inside dashboard
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default EventBanner;
