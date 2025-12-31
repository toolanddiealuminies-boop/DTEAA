import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { X, Check, Loader2 } from 'lucide-react';

interface EventRegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    alumniId: string;
    onSuccess: () => void;
}

const EventRegistrationModal: React.FC<EventRegistrationModalProps> = ({ isOpen, onClose, userId, alumniId, onSuccess }) => {
    const [attending, setAttending] = useState<boolean | null>(null);
    const [mealPreference, setMealPreference] = useState<'Veg' | 'Non-Veg'>('Veg');
    const [totalParticipants, setTotalParticipants] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (attending === null) {
            setError('Please confirm if you are attending.');
            return;
        }

        if (attending === false) {
            // If not attending, we can still record it or just close. 
            // Requirement says "If yes, show meal options". Implies we only really care about "Yes".
            // But valid to record "No".
        }

        setLoading(true);

        try {
            const { error: insertError } = await supabase
                .from('event_registrations')
                .upsert({
                    user_id: userId,
                    alumni_id: alumniId,
                    event_id: 'alumni-meet-2026',
                    attending: attending,
                    meal_preference: attending ? mealPreference : null,
                    total_participants: attending ? totalParticipants : 1,
                    created_at: new Date().toISOString()
                }, { onConflict: 'user_id, event_id' });

            if (insertError) throw insertError;

            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Registration failed:', err);
            setError(err.message || 'Failed to register. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full overflow-hidden transform transition-all">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Alumni Meet 2026</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Attendance Question */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Will you be attending the Alumni Meet?
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setAttending(true)}
                                className={`flex items-center justify-center px-4 py-3 rounded-xl border-2 transition-all ${attending === true
                                    ? 'border-[#E7A700] bg-[#E7A700]/10 text-[#E7A700] font-bold'
                                    : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-[#E7A700]/50'
                                    }`}
                            >
                                <Check className={`w-5 h-5 mr-2 ${attending === true ? 'opacity-100' : 'opacity-0'}`} />
                                Yes, I'm In!
                            </button>
                            <button
                                type="button"
                                onClick={() => setAttending(false)}
                                className={`flex items-center justify-center px-4 py-3 rounded-xl border-2 transition-all ${attending === false
                                    ? 'border-red-500 bg-red-50 text-red-600 font-bold'
                                    : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-red-300'
                                    }`}
                            >
                                <X className={`w-5 h-5 mr-2 ${attending === false ? 'opacity-100' : 'opacity-0'}`} />
                                No, Can't Make It
                            </button>
                        </div>
                    </div>

                    {/* Conditional Fields for Attendees */}
                    {attending && (
                        <div className="space-y-5 animate-fade-in-up">
                            <div>
                                <label htmlFor="mealPreference" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Meal Preference (Lunch)
                                </label>
                                <select
                                    id="mealPreference"
                                    value={mealPreference}
                                    onChange={(e) => setMealPreference(e.target.value as 'Veg' | 'Non-Veg')}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#E7A700] focus:border-transparent outline-none transition-all"
                                >
                                    <option value="Veg">Vegetarian</option>
                                    <option value="Non-Veg">Non-Vegetarian</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="participants" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Total Participants (Including You)
                                </label>
                                <div className="flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => setTotalParticipants(Math.max(1, totalParticipants - 1))}
                                        className="p-3 rounded-l-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-r-0 border-gray-200 dark:border-gray-600"
                                    >
                                        -
                                    </button>
                                    <input
                                        type="number"
                                        id="participants"
                                        min="1"
                                        max="10"
                                        value={totalParticipants}
                                        onChange={(e) => setTotalParticipants(parseInt(e.target.value) || 1)}
                                        className="w-full text-center py-3 bg-gray-50 dark:bg-gray-900 border-y border-gray-200 dark:border-gray-600 focus:outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setTotalParticipants(Math.min(10, totalParticipants + 1))}
                                        className="p-3 rounded-r-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-l-0 border-gray-200 dark:border-gray-600"
                                    >
                                        +
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Family members are welcome!</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || attending === null}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-[#003366] to-[#004080] text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Confirm Registration'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EventRegistrationModal;
