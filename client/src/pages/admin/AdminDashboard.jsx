import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUsers, updateUserStatus, fetchFeedbacks, updateFeedbackStatus } from '#api/admin.js';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
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
            <h1 className="text-3xl font-headline font-bold text-[#0F1D29]">Admin Dashboard</h1>

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
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-700">
                                <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b border-[#dddddd]">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">ID</th>
                                        <th className="px-6 py-4 font-semibold">Username / Email</th>
                                        <th className="px-6 py-4 font-semibold">Business</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                        <th className="px-6 py-4 font-semibold">Deleted</th>
                                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users?.map(user => (
                                        <tr key={user.user_id} className="border-b border-[#dddddd] hover:bg-[#FFF7E6] transition-colors group">
                                            <td className="px-6 py-4">{user.user_id}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-[#0F1D29]">{user.username}</div>
                                                <div className="text-xs text-gray-500 mt-1">{user.email}</div>
                                            </td>
                                            <td className="px-6 py-4 font-medium">{user.business_name}</td>
                                            <td className="px-6 py-4">
                                                <select 
                                                    value={user.approval_status}
                                                    onChange={(e) => handleApproval(user, e.target.value)}
                                                    className="bg-white border border-[#dddddd] rounded-md px-3 py-1.5 text-sm outline-none focus:border-[#8D4A52] focus:ring-1 focus:ring-[#8D4A52] transition-all cursor-pointer"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="approved">Approved</option>
                                                    <option value="rejected">Rejected</option>
                                                    <option value="banned">Banned</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.is_deleted ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        Yes
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        No
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {user.is_deleted ? (
                                                    <button onClick={() => handleRestore(user)} className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors">
                                                        Restore
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handleSoftDelete(user)} className="text-red-600 hover:text-red-800 font-medium text-sm transition-colors">
                                                        Soft Delete
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {users?.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                                <div className="flex flex-col items-center justify-center">
                                                    <span className="text-gray-400 mb-2">No users found.</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
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
