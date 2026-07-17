import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


export default function MarketplacePage() {
    const [freelancers, setFreelancers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFreelancers = async () => {
            try {
                const baseURL = import.meta.env.VITE_API_URL || 'https://ada-mumf.onrender.com';
                const url = baseURL.endsWith('/') ? `${baseURL}marketplace/freelancers` : `${baseURL}/marketplace/freelancers`;
                const response = await axios.get(url);
                setFreelancers(response.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Failed to load makers');
                setLoading(false);
            }
        };
        fetchFreelancers();
    }, []);

    if (loading) return <div className="p-8 text-center animate-pulse text-[#0F1D29]">Loading Makers...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="h-screen overflow-y-auto bg-[#FDF9F1] p-6 lg:p-12">
            <div className="max-w-6xl mx-auto">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl lg:text-5xl font-headline font-black text-[#0F1D29] tracking-tight mb-4">Discover Independent Makers</h1>
                    <p className="text-lg text-gray-600 font-body max-w-2xl mx-auto">Browse catalogs, discover unique products, and connect directly with talented creators on ADA.</p>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {freelancers.map(maker => (
                        <div 
                            key={maker.user_id} 
                            onClick={() => navigate(`/marketplace/${maker.user_id}`)}
                            className="bg-[#FFF7E6] border border-[#e8d5b5] rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col group"
                        >
                            <div className="h-32 bg-gray-200 relative overflow-hidden">
                                {maker.banner_image ? (
                                    <img src={maker.banner_image} alt="Banner" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full" style={{ backgroundColor: maker.theme_color || '#0F1D29' }}></div>
                                )}
                            </div>
                            <div className="px-6 pb-6 pt-2 relative flex-1 flex flex-col">
                                <div className="w-16 h-16 rounded-2xl border-4 border-[#FFF7E6] overflow-hidden -mt-10 mb-3 bg-white shadow-sm flex-shrink-0">
                                    {maker.profile_picture ? (
                                        <img src={maker.profile_picture} alt={maker.business_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-[#E57A44] flex items-center justify-center text-white font-bold text-xl uppercase">
                                            {maker.business_name?.substring(0,2) || maker.username?.substring(0,2)}
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-headline font-bold text-[#0F1D29] text-xl mb-1 line-clamp-1">{maker.business_name}</h3>
                                <p className="text-sm text-gray-500 font-body mb-3">@{maker.username}</p>
                                <p className="text-sm text-gray-700 font-body line-clamp-3 mb-4 flex-1">{maker.bio || maker.description || 'No bio provided.'}</p>
                                
                                <button className="w-full py-2 bg-[#0F1D29]/5 hover:bg-[#0F1D29]/10 text-[#0F1D29] font-bold rounded-xl transition-colors font-body text-sm mt-auto">
                                    View Catalog
                                </button>
                            </div>
                        </div>
                    ))}
                    
                    {freelancers.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No makers found on the marketplace yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
