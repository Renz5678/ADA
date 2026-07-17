import { useState, useEffect, useRef } from "react";
import { useProfile, useUpdateProfile, useUploadProfileImages } from "#hooks/useUser.js";
import toast from "react-hot-toast";
import { MdImage, MdEdit, MdSave } from "react-icons/md";

export default function ProfileSettingsPage() {
    const { data: profile, isLoading } = useProfile();
    const updateProfileMut = useUpdateProfile();
    const uploadImagesMut = useUploadProfileImages();

    const [form, setForm] = useState({ business_name: "", bio: "", description: "", theme_color: "#8D4A52" });
    const [profilePic, setProfilePic] = useState(null);
    const [bannerImg, setBannerImg] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const profileInputRef = useRef(null);
    const bannerInputRef = useRef(null);

    useEffect(() => {
        if (profile) {
            setForm({
                business_name: profile.business_name || "",
                bio: profile.bio || "",
                description: profile.description || "",
                theme_color: profile.theme_color || "#8D4A52"
            });
        }
    }, [profile]);

    const handleSaveAll = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        
        try {
            const promises = [];
            let updatedImages = false;

            // Check if text needs updating
            if (form.business_name !== profile.business_name || form.bio !== profile.bio || form.description !== profile.description || form.theme_color !== profile.theme_color) {
                promises.push(updateProfileMut.mutateAsync(form));
            }

            // Check if images need updating
            if (profilePic || bannerImg) {
                const formData = new FormData();
                if (profilePic) formData.append("profile_picture", profilePic);
                if (bannerImg) formData.append("banner_image", bannerImg);
                promises.push(uploadImagesMut.mutateAsync(formData));
                updatedImages = true;
            }

            if (promises.length === 0) {
                toast("No changes to save.", { icon: "ℹ️" });
                setIsSaving(false);
                return;
            }

            await Promise.all(promises);
            
            toast.success("Profile updated successfully!");
            
            // Clear local file states so they don't re-upload
            if (updatedImages) {
                setProfilePic(null);
                setBannerImg(null);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-8 font-body animate-pulse">Loading profile settings...</div>;

    // Derived preview URLs
    const previewBanner = bannerImg ? URL.createObjectURL(bannerImg) : profile?.banner_image;
    const previewAvatar = profilePic ? URL.createObjectURL(profilePic) : profile?.profile_picture;

    return (
        <div className="flex flex-col w-full h-full p-4 lg:p-8 overflow-y-auto font-body bg-[#F8FAFC]">
            <div className="max-w-4xl w-full mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-headline font-bold text-[#0F1D29]">Profile Customization</h1>
                        <p className="text-gray-500 mt-1">Design your storefront and tell clients about your business.</p>
                    </div>
                    <button 
                        onClick={handleSaveAll}
                        disabled={isSaving}
                        className="hidden md:flex items-center gap-2 px-6 py-3 bg-[#0F1D29] text-white font-medium rounded-xl hover:bg-[#8D4A52] transition-colors shadow-lg shadow-gray-200 disabled:opacity-70"
                    >
                        <MdSave size={20} />
                        {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                    {/* Visuals Editor - Integrated Preview */}
                    <div className="relative">
                        {/* Banner Section */}
                        <div className="relative h-48 sm:h-64 w-full bg-gray-100 group">
                            {previewBanner ? (
                                <img src={previewBanner} className="w-full h-full object-cover" alt="banner preview" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gradient-to-br from-gray-50 to-gray-100">
                                    <MdImage size={48} className="mb-2 opacity-50" />
                                    <span className="text-sm font-medium">No Banner Set</span>
                                </div>
                            )}
                            
                            {/* Banner Overlay Action */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <button 
                                    onClick={() => bannerInputRef.current?.click()}
                                    className="flex items-center gap-2 bg-white/90 backdrop-blur text-gray-800 px-5 py-2.5 rounded-full font-semibold shadow-xl hover:bg-white transition-transform transform hover:scale-105"
                                >
                                    <MdEdit size={18} /> Edit Banner
                                </button>
                                <input 
                                    type="file" 
                                    accept="image/jpeg, image/png, image/webp"
                                    className="hidden" 
                                    ref={bannerInputRef}
                                    onChange={e => setBannerImg(e.target.files[0])}
                                />
                            </div>
                        </div>

                        {/* Profile Picture Section */}
                        <div className="absolute -bottom-12 sm:-bottom-16 left-6 sm:left-10 group">
                            <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-white p-1 shadow-lg">
                                <div className="w-full h-full rounded-xl bg-gray-100 overflow-hidden relative">
                                    {previewAvatar ? (
                                        <img src={previewAvatar} className="w-full h-full object-cover" alt="profile preview" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-[#0F1D29] text-white font-headline font-bold text-4xl">
                                            {profile?.business_name ? profile.business_name.charAt(0).toUpperCase() : "B"}
                                        </div>
                                    )}
                                    
                                    {/* Avatar Overlay Action */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <button 
                                            onClick={() => profileInputRef.current?.click()}
                                            className="bg-white/90 backdrop-blur text-gray-800 p-2 rounded-full shadow-lg hover:bg-white transition-transform transform hover:scale-110"
                                        >
                                            <MdEdit size={20} />
                                        </button>
                                        <input 
                                            type="file" 
                                            accept="image/jpeg, image/png, image/webp"
                                            className="hidden" 
                                            ref={profileInputRef}
                                            onChange={e => setProfilePic(e.target.files[0])}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Text Details Editor */}
                    <div className="pt-20 sm:pt-24 px-6 sm:px-10 pb-10 flex flex-col gap-8">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex flex-col gap-6">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Business Name</label>
                                    </div>
                                    <input
                                        type="text"
                                        value={form.business_name}
                                        onChange={e => setForm({ ...form, business_name: e.target.value })}
                                        placeholder="Your Business Name"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-[#8D4A52] focus:ring-2 focus:ring-[#8D4A52]/20 transition-all font-bold text-gray-800 mb-6"
                                    />
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Catchphrase</label>
                                        <span className={`text-xs font-medium ${form.bio.length > 180 ? 'text-red-500' : 'text-gray-400'}`}>
                                            {form.bio.length}/200
                                        </span>
                                    </div>
                                    <input
                                        type="text"
                                        maxLength={200}
                                        value={form.bio}
                                        onChange={e => setForm({ ...form, bio: e.target.value })}
                                        placeholder="e.g. Premium handcrafted furniture"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-[#8D4A52] focus:ring-2 focus:ring-[#8D4A52]/20 transition-all font-medium text-gray-800"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">A short, punchy tagline that appears under your business name.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Brand Color</label>
                                    <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-3 focus-within:bg-white focus-within:border-[#8D4A52] focus-within:ring-2 focus-within:ring-[#8D4A52]/20 transition-all">
                                        <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 shadow-inner">
                                            <input
                                                type="color"
                                                value={form.theme_color}
                                                onChange={e => setForm({ ...form, theme_color: e.target.value })}
                                                className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-800 uppercase">{form.theme_color}</span>
                                            <span className="text-xs text-gray-500">Used for buttons and highlights</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">About Your Business</label>
                                <textarea
                                    rows={8}
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    placeholder="Tell your story. What makes your products unique? What is your process like?"
                                    className="w-full h-[calc(100%-28px)] min-h-[160px] bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 outline-none focus:bg-white focus:border-[#8D4A52] focus:ring-2 focus:ring-[#8D4A52]/20 transition-all resize-none text-gray-800 leading-relaxed"
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Save Button */}
                <button 
                    onClick={handleSaveAll}
                    disabled={isSaving}
                    className="md:hidden w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#0F1D29] text-white font-bold rounded-xl hover:bg-[#8D4A52] transition-colors shadow-lg shadow-gray-200 disabled:opacity-70 mb-8"
                >
                    <MdSave size={24} />
                    {isSaving ? "Saving Everything..." : "Save Changes"}
                </button>
            </div>
        </div>
    );
}
