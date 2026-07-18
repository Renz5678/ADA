import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUsers, updateUserStatus, fetchFeedbacks, updateFeedbackStatus } from '#api/admin.js';
import toast from 'react-hot-toast';
import { MdArrowBack } from 'react-icons/md';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('users');

    const { data: users, isLoading: usersLoading } = useQuery({
        queryKey: ['adminUsers'],
        queryFn: fetchUsers,
    });

    const { data: feedbacks, isLoading: feedbacksLoading } = useQuery({
        queryKey: ['adminFeedbacks'],
        queryFn: fetchFeedbacks,
    });

    const userMutation = useMutation({
        mutationFn: ({ userId, data }) => updateUserStatus(userId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            toast.success('User updated successfully');
        },
        onError: () => toast.error('Failed to update user')
    });

    const feedbackMutation = useMutation({
        mutationFn: ({ feedbackId, status }) => updateFeedbackStatus(feedbackId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminFeedbacks'] });
            toast.success('Feedback updated successfully');
        },
        onError: () => toast.error('Failed to update feedback')
    });

    const handleSoftDelete = (user) => {
        const reason = prompt("Enter warning message for soft delete (or leave blank for default):");
        if (reason !== null) {
            userMutation.mutate({ 
                userId: user.user_id, 
                data: { 
                    is_deleted: true, 
                    warning_message: reason || "Your account has been deleted for violating our terms of service." 
                } 
            });
        }
    };

    const handleRestore = (user) => {
        if (confirm("Restore this user?")) {
            userMutation.mutate({ 
                userId: user.user_id, 
                data: { 
                    is_deleted: false, 
                    warning_message: null 
                } 
            });
        }
    };

    const handleApproval = (user, status) => {
        userMutation.mutate({ userId: user.user_id, data: { approval_status: status } });
    };

    const handleFeedbackStatus = (feedbackId, status) => {
        feedbackMutation.mutate({ feedbackId, status });
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 border border-[#dddddd] transition-colors text-gray-600 hover:text-[#0F1D29]"
                >
                    <MdArrowBack size={24} />
                </button>
                <h1 className="text-3xl font-headline font-bold text-[#0F1D29]">Admin Dashboard</h1>
            </div>

            <div className="flex space-x-6 border-b border-[#dddddd] pb-0">
                <button 
                    onClick={() => setActiveTab('users')} 
                    className={`px-4 py-3 font-semibold transition-colors border-b-2 ${activeTab === 'users' ? 'text-[#8D4A52] border-[#8D4A52]' : 'text-gray-500 border-transparent hover:text-[#0F1D29]'}`}
                >
                    User Approvals
                </button>
                <button 
                    onClick={() => setActiveTab('feedbacks')} 
                    className={`px-4 py-3 font-semibold transition-colors border-b-2 ${activeTab === 'feedbacks' ? 'text-[#8D4A52] border-[#8D4A52]' : 'text-gray-500 border-transparent hover:text-[#0F1D29]'}`}
                >
                    Feedback & Reports
                </button>
            </div>

            {activeTab === 'users' && (
                <div className="bg-white rounded-xl shadow-sm border border-[#dddddd] p-6">
                    <h2 className="text-xl font-bold text-[#0F1D29] mb-6 font-headline">Manage Users</h2>
                    {usersLoading ? (
                        <div className="animate-pulse flex space-x-4">
                            <div className="h-10 bg-gray-200 rounded w-full"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {users?.map(user => (
                                <div key={user.user_id} className="bg-white border border-[#dddddd] rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                                    {/* Header / Banner */}
                                    <div className="h-24 w-full bg-gray-100 relative">
                                        {user.banner_image ? (
                                            <img src={user.banner_image} alt="Banner" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300"></div>
                                        )}
                                        <div className="absolute -bottom-8 left-4">
                                            {user.profile_picture ? (
                                                <img src={user.profile_picture} alt="Avatar" className="w-16 h-16 rounded-full border-4 border-white object-cover bg-white" />
                                            ) : (
                                                <div className="w-16 h-16 rounded-full border-4 border-white bg-[#0F1D29] flex items-center justify-center text-white font-bold text-xl">
                                                    {user.business_name ? user.business_name.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* User Details */}
                                    <div className="pt-10 px-5 pb-4 flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-lg text-[#0F1D29]">{user.business_name}</h3>
                                                <p className="text-sm text-gray-500">@{user.username} • {user.email}</p>
                                            </div>
                                            {user.is_deleted && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-red-100 text-red-800 uppercase tracking-wide">
                                                    Deleted
                                                </span>
                                            )}
                                        </div>
                                        
                                        {user.bio && (
                                            <p className="mt-3 text-sm text-gray-600 line-clamp-2">{user.bio}</p>
                                        )}
                                        
                                        {/* Products Preview */}
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Product Listings ({user.Products?.length || 0})</h4>
                                            {user.Products && user.Products.length > 0 ? (
                                                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                                    {user.Products.map(prod => (
                                                        <div key={prod.product_id} className="flex-none w-20 group relative">
                                                            <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 mb-1">
                                                                {prod.image_url ? (
                                                                    <img src={prod.image_url} alt={prod.product_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                        <span className="text-xs">No img</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <p className="text-[10px] text-gray-600 truncate font-medium">{prod.product_name}</p>
                                                            <p className="text-[10px] font-bold text-[#8D4A52]">₱{Number(prod.price).toLocaleString()}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-400 italic">No products listed yet.</p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Actions */}
                                    <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-between items-center mt-auto">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-gray-500 uppercase">Status:</span>
                                            <select 
                                                value={user.approval_status}
                                                onChange={(e) => handleApproval(user, e.target.value)}
                                                className="bg-white border border-[#dddddd] rounded-md px-2 py-1 text-sm font-medium outline-none focus:border-[#8D4A52] focus:ring-1 focus:ring-[#8D4A52] transition-all cursor-pointer shadow-sm"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="approved">Approved</option>
                                                <option value="rejected">Rejected</option>
                                                <option value="banned">Banned</option>
                                            </select>
                                        </div>
                                        
                                        <div>
                                            {user.is_deleted ? (
                                                <button onClick={() => handleRestore(user)} className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md font-semibold text-sm transition-colors border border-blue-200">
                                                    Restore
                                                </button>
                                            ) : (
                                                <button onClick={() => handleSoftDelete(user)} className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-md font-semibold text-sm transition-colors border border-red-200">
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {users?.length === 0 && (
                                <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <div className="flex flex-col items-center justify-center">
                                        <span className="text-gray-400 font-medium">No users found.</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'feedbacks' && (
                <div className="bg-white rounded-xl shadow-sm border border-[#dddddd] p-6">
                    <h2 className="text-xl font-bold text-[#0F1D29] mb-6 font-headline">Feedback & Bug Reports</h2>
                    {feedbacksLoading ? (
                        <div className="space-y-4">
                            {[1, 2].map(i => (
                                <div key={i} className="animate-pulse bg-gray-50 h-32 rounded-lg border border-gray-100"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {feedbacks?.map(fb => (
                                <div key={fb.feedback_id} className="bg-white p-5 rounded-lg border border-[#dddddd] hover:border-[#8D4A52] hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${fb.type === 'bug' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                                {fb.type}
                                            </span>
                                            <h3 className="text-lg font-bold text-[#0F1D29] mt-2">{fb.title}</h3>
                                            <p className="text-sm text-gray-500 mt-1">From: <span className="font-medium text-gray-700">{fb.user?.username || 'Unknown'}</span> ({fb.user?.email || 'N/A'})</p>
                                        </div>
                                        <select
                                            value={fb.status}
                                            onChange={(e) => handleFeedbackStatus(fb.feedback_id, e.target.value)}
                                            className="bg-white border border-[#dddddd] rounded-md px-3 py-1.5 text-sm font-medium outline-none focus:border-[#8D4A52] focus:ring-1 focus:ring-[#8D4A52] cursor-pointer shadow-sm"
                                        >
                                            <option value="open">Open</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    </div>
                                    <div className="mt-4 text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-md text-sm border border-gray-100 leading-relaxed">
                                        {fb.description}
                                    </div>
                                    <div className="mt-3 text-xs text-gray-400 font-medium">
                                        Submitted on: {new Date(fb.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                    </div>
                                </div>
                            ))}
                            {feedbacks?.length === 0 && (
                                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                    <p className="text-gray-500 font-medium">No feedback or reports found.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
