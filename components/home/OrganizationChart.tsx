import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';

interface Member {
    id: string;
    alumni_id: string | null;
    name: string;
    role: string;
    image: string;
    display_order: number;
}

// Fallback data in case Supabase fetch fail
const fallbackMembers: Omit<Member, 'id' | 'alumni_id' | 'display_order'>[] = [
    { name: 'Manikandan V', role: 'President', image: '/ec_memebers/Manikandan V.jpg' },
    { name: 'Vijay Kumar D', role: 'Vice President', image: '/ec_memebers/Vijay Kumar D.jpg' },
    { name: 'Durai Kannan', role: 'Treasurer', image: '/ec_memebers/Durai Kannan.jpg' },
    { name: 'Kannan S', role: 'General Secretary', image: '/ec_memebers/Kannan.jpeg' },
    { name: 'Gopi A', role: 'Joint Secretary', image: '/ec_memebers/Gopi A.jpg' },
    { name: 'Kumaresan', role: 'Regional Vice President - Abroad', image: '/ec_memebers/Kumaresan.jpg' },
    { name: 'Kannan S', role: 'Regional Vice President - Chennai', image: '/ec_memebers/Kannan S.jpg' },
    { name: 'Prasath S', role: 'Regional Vice President - Coimbatore', image: '/ec_memebers/Prasath S.jpg' },
    { name: 'Palanikumar C', role: 'Regional Vice President - Dindigul', image: '/ec_memebers/Palani C.jpg' },
    { name: 'Suresh', role: 'Regional Joint Secretary - North India', image: '/ec_memebers/Suresh.jpeg' },
    { name: 'Saravanan', role: 'Regional Joint Secretary - Abroad', image: '/ec_memebers/Saravanan.jpg' },
    { name: 'Ayyappan', role: 'Regional Joint Secretary - Chennai', image: '/ec_memebers/Ayyappan.jpg' },
    { name: 'Durai Raj', role: 'Regional Joint Secretary - Coimbatore', image: '/ec_memebers/Durai Raj.jpg' },
    { name: 'Selvakumaran A', role: 'Regional Joint Secretary - Dindigul', image: '/ec_memebers/Selvakumaran.jpeg' },
    { name: 'Chitambaram', role: 'Regional Vice President - North India', image: '/ec_memebers/Chitambaram.jpg' },
    { name: 'Kanagaraj M', role: 'Advisory Committee Member', image: '/ec_memebers/Kanagaraj M.jpg' },
    { name: 'Sankarlal S', role: 'Advisory Committee Member', image: '/ec_memebers/Sankarlal S.jpg' },
    { name: 'Murali Mohan', role: 'Head – IT & Digital Platforms', image: '/ec_memebers/Murali Mohan.jpeg' },
];

const OrganizationChart: React.FC = () => {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExecutiveCommittee();
    }, []);

    const fetchExecutiveCommittee = async () => {
        try {
            const { data, error } = await supabase
                .from('executive_committee')
                .select('id, alumni_id, name, role, image, display_order')
                .eq('is_active', true)
                .order('display_order', { ascending: true });

            if (error) {
                console.error('Error fetching executive committee:', error);
                // Use fallback data if fetch fails
                setMembers(fallbackMembers.map((m, i) => ({ 
                    ...m, 
                    id: `fallback-${i}`, 
                    alumni_id: null, 
                    display_order: i 
                })));
                return;
            }

            if (data && data.length > 0) {
                setMembers(data);
            } else {
                // Use fallback if no data in table yet
                setMembers(fallbackMembers.map((m, i) => ({ 
                    ...m, 
                    id: `fallback-${i}`, 
                    alumni_id: null, 
                    display_order: i 
                })));
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setMembers(fallbackMembers.map((m, i) => ({ 
                ...m, 
                id: `fallback-${i}`, 
                alumni_id: null, 
                display_order: i 
            })));
        } finally {
            setLoading(false);
        }
    };
    return (
        <section id="organization-chart" className="py-20 bg-white dark:bg-dark-bg transition-colors duration-300">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4 font-heading">
                        Executive Committee
                    </h2>
                    <div className="h-1 w-24 bg-primary mx-auto rounded-full" />
                    <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Meet the dedicated team leading our association.
                    </p>
                </motion.div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="flex flex-col items-center bg-gray-50 dark:bg-gray-800 rounded-xl p-6 animate-pulse">
                                <div className="w-32 h-32 mb-4 rounded-full bg-gray-200 dark:bg-gray-700" />
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2" />
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {members.map((member, index) => (
                        <motion.div
                            key={member.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="flex flex-col items-center bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300"
                        >
                            <div className="w-32 h-32 mb-4 rounded-full overflow-hidden border-4 border-primary/20">
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-full h-full object-cover object-top transform scale-110"
                                />
                            </div>
                            <h3 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary text-center">
                                {member.name}
                            </h3>
                            <p className="text-primary font-medium text-center mt-1">
                                {member.role}
                            </p>
                        </motion.div>
                    ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default OrganizationChart;
