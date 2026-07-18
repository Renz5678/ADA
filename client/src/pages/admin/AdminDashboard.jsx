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
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-gray-100">Admin Dashboard</h1>

            <div className="flex space-x-4 border-b border-gray-700 pb-2">
                <button 
                    onClick={() => setActiveTab('users')} 
                    className={`px-4 py-2 font-semibold rounded-t-lg transition-colors ${activeTab === 'users' ? 'text-[#38bdf8] border-b-2 border-[#38bdf8]' : 'text-gray-400 hover:text-gray-200'}`}
                >
                    User Approvals
                </button>
                <button 
                    onClick={() => setActiveTab('feedbacks')} 
                    className={`px-4 py-2 font-semibold rounded-t-lg transition-colors ${activeTab === 'feedbacks' ? 'text-[#38bdf8] border-b-2 border-[#38bdf8]' : 'text-gray-400 hover:text-gray-200'}`}
                >
                    Feedback & Reports
                </button>
            </div>

            {activeTab === 'users' && (
                <div className="bg-[#1a2332] rounded-xl p-6 shadow-xl border border-gray-700/50">
                    <h2 className="text-xl font-bold text-gray-100 mb-4">Manage Users</h2>
                    {usersLoading ? (
                        <p className="text-gray-400">Loading users...</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-300">
                                <thead className="text-xs uppercase bg-[#0f1623] text-gray-400 border-b border-gray-700">
                                    <tr>
                                        <th className="px-4 py-3">ID</th>
                                        <th className="px-4 py-3">Username / Email</th>
                                        <th className="px-4 py-3">Business</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Deleted</th>
                                        <th className="px-4 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users?.map(user => (
                                        <tr key={user.user_id} className="border-b border-gray-800 hover:bg-[#0f1623]/50">
                                            <td className="px-4 py-3">{user.user_id}</td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-100">{user.username}</div>
                                                <div className="text-xs text-gray-500">{user.email}</div>
                                            </td>
                                            <td className="px-4 py-3">{user.business_name}</td>
                                            <td className="px-4 py-3">
                                                <select 
                                                    value={user.approval_status}
                                                    onChange={(e) => handleApproval(user, e.target.value)}
                                                    className="bg-[#0f1623] border border-gray-700 rounded px-2 py-1 text-sm outline-none focus:border-[#38bdf8]"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="approved">Approved</option>
                                                    <option value="rejected">Rejected</option>
                                                    <option value="banned">Banned</option>
                                                </select>
                                            </td>
                                            <td className="px-4 py-3">
                                                {user.is_deleted ? (
                                                    <span className="text-red-400 font-semibold">Yes</span>
                                                ) : (
                                                    <span className="text-green-400">No</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {user.is_deleted ? (
                                                    <button onClick={() => handleRestore(user)} className="text-blue-400 hover:text-blue-300 text-sm">
                                                        Restore
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handleSoftDelete(user)} className="text-red-400 hover:text-red-300 text-sm">
                                                        Soft Delete
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {users?.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-6 text-center text-gray-500">No users found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'feedbacks' && (
                <div className="bg-[#1a2332] rounded-xl p-6 shadow-xl border border-gray-700/50">
                    <h2 className="text-xl font-bold text-gray-100 mb-4">Feedback & Bug Reports</h2>
                    {feedbacksLoading ? (
                        <p className="text-gray-400">Loading feedbacks...</p>
                    ) : (
                        <div className="space-y-4">
                            {feedbacks?.map(fb => (
                                <div key={fb.feedback_id} className="bg-[#0f1623] p-4 rounded-lg border border-gray-800">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${fb.type === 'bug' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                {fb.type}
                                            </span>
                                            <h3 className="text-lg font-bold text-gray-100 mt-2">{fb.title}</h3>
                                            <p className="text-sm text-gray-400">From: {fb.user?.username || 'Unknown'} ({fb.user?.email || 'N/A'})</p>
                                        </div>
                                        <select
                                            value={fb.status}
                                            onChange={(e) => handleFeedbackStatus(fb.feedback_id, e.target.value)}
                                            className="bg-[#1a2332] border border-gray-700 rounded px-3 py-1 text-sm outline-none focus:border-[#38bdf8]"
                                        >
                                            <option value="open">Open</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    </div>
                                    <div className="mt-3 text-gray-300 whitespace-pre-wrap bg-[#1a2332] p-3 rounded text-sm border border-gray-700/50">
                                        {fb.description}
                                    </div>
                                    <div className="mt-2 text-xs text-gray-500">
                                        Submitted on: {new Date(fb.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                            {feedbacks?.length === 0 && (
                                <p className="text-center text-gray-500 py-6">No feedbacks found.</p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
