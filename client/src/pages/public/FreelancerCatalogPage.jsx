import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthPromptModal from '../../components/ui/AuthPromptModal.jsx';
import Button from '../../components/ui/Button.jsx';
import { MdArrowBack, MdMessage, MdAddShoppingCart } from 'react-icons/md';

export default function FreelancerCatalogPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [freelancer, setFreelancer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);

    useEffect(() => {
        const fetchFreelancer = async () => {
            try {
                const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                const url = baseURL.endsWith('/') ? `${baseURL}marketplace/freelancer/${id}` : `${baseURL}/marketplace/freelancer/${id}`;
                const response = await axios.get(url);
                setFreelancer(response.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Failed to load maker profile');
                setLoading(false);
            }
        };
        fetchFreelancer();
    }, [id]);

    const handleInteract = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowAuthModal(true);
    };

    if (loading) return <div className="p-8 text-center animate-pulse">Loading Profile...</div>;
    if (error || !freelancer) return <div className="p-8 text-center text-red-500">{error || 'Not found'}</div>;

    const products = freelancer.Products || [];

    return (
        <div className="min-h-screen bg-[#FDF9F1]">
            {/* Header/Banner */}
            <div className="h-48 md:h-64 relative bg-gray-200">
                {freelancer.banner_image ? (
                    <img src={freelancer.banner_image} alt="Banner" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full" style={{ backgroundColor: freelancer.theme_color || '#0F1D29' }}></div>
                )}
                <div className="absolute top-4 left-4">
                    <button 
                        onClick={() => navigate('/marketplace')}
                        className="bg-white/80 hover:bg-white backdrop-blur-sm p-2 rounded-xl text-[#0F1D29] shadow-sm transition-all"
                    >
                        <MdArrowBack size={24} />
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 pb-12">
                {/* Profile Info */}
                <div className="flex flex-col md:flex-row gap-6 items-start -mt-12 md:-mt-16 mb-12 relative z-10">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl border-4 border-[#FDF9F1] overflow-hidden bg-white shadow-lg flex-shrink-0">
                        {freelancer.profile_picture ? (
                            <img src={freelancer.profile_picture} alt={freelancer.business_name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-[#E57A44] flex items-center justify-center text-white font-bold text-3xl uppercase">
                                {freelancer.business_name?.substring(0,2) || freelancer.username?.substring(0,2)}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 pt-2 md:pt-16">
                        <h1 className="text-3xl md:text-4xl font-headline font-black text-[#0F1D29]">{freelancer.business_name}</h1>
                        <p className="text-gray-500 font-body mt-1">@{freelancer.username}</p>
                        <p className="text-gray-700 font-body mt-4 max-w-2xl">{freelancer.bio || freelancer.description}</p>
                    </div>
                    <div className="w-full md:w-auto pt-2 md:pt-16">
                        <Button variant="primary" className="w-full md:w-auto flex items-center justify-center gap-2" onClick={handleInteract}>
                            <MdMessage size={20} />
                            Contact Maker
                        </Button>
                    </div>
                </div>

                {/* Catalog */}
                <div>
                    <h2 className="text-2xl font-headline font-bold text-[#0F1D29] mb-6 border-b border-gray-200 pb-2">Product Catalog</h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map(product => (
                            <div key={product.product_id} className="bg-white border border-[#e8d5b5] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
                                <div className="h-48 bg-gray-100 relative overflow-hidden">
                                    {product.image_url ? (
                                        <img src={product.image_url} alt={product.product_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-body">No Image</div>
                                    )}
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full font-bold text-[#0F1D29] text-sm shadow-sm">
                                        ${Number(product.price).toFixed(2)}
                                    </div>
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="font-headline font-bold text-[#0F1D29] text-lg mb-1">{product.product_name}</h3>
                                    <p className="text-xs text-gray-500 font-body mb-3">Code: {product.product_code}</p>
                                    <p className="text-sm text-gray-700 font-body line-clamp-2 mb-4 flex-1">{product.description}</p>
                                    <button 
                                        onClick={handleInteract}
                                        className="w-full py-2.5 bg-[#E57A44] hover:bg-[#D46933] text-white font-bold rounded-xl transition-colors font-body text-sm flex items-center justify-center gap-2"
                                    >
                                        <MdAddShoppingCart size={18} />
                                        Request Order
                                    </button>
                                </div>
                            </div>
                        ))}
                        
                        {products.length === 0 && (
                            <div className="col-span-full text-center py-12 text-gray-500 bg-white/50 rounded-3xl border border-dashed border-gray-300">
                                This maker hasn't added any products to their catalog yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AuthPromptModal 
                isOpen={showAuthModal} 
                onClose={() => setShowAuthModal(false)} 
            />
        </div>
    );
}
