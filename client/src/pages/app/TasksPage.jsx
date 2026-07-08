
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '#api/axiosInstance.js';
import Skeleton from '#components/ui/Skeleton.jsx';
import { MdCheckCircle, MdRadioButtonUnchecked, MdAccessTime, MdDeleteOutline } from 'react-icons/md';

const fetchTasks = async () => {
    const { data } = await api.get('/tasks');
    return data;
};

export default function TasksPage() {
    const queryClient = useQueryClient();
    const { data: tasks, isFetching, isError } = useQuery({ queryKey: ['tasks'], queryFn: fetchTasks });

    const updateTaskMut = useMutation({
        mutationFn: async ({ id, updates }) => {
            const { data } = await api.put(`/tasks/${id}`, updates);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['tasks']);
            toast.success('Task updated!');
        },
        onError: () => toast.error('Failed to update task.')
    });

    const deleteTaskMut = useMutation({
        mutationFn: async (id) => {
            const { data } = await api.delete(`/tasks/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['tasks']);
            toast.success('Task deleted!');
        },
        onError: () => toast.error('Failed to delete task.')
    });

    const toggleStatus = (task) => {
        const newStatus = task.status === 'Done' ? 'Not Started' : 'Done';
        updateTaskMut.mutate({ id: task.task_id, updates: { status: newStatus } });
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this task?")) {
            deleteTaskMut.mutate(id);
        }
    };

    if (isFetching && !tasks) {
        return (
            <div className="w-full flex flex-col gap-6 flex-1 min-h-0">
                <Skeleton className="h-24 w-full rounded-2xl shrink-0" />
                <Skeleton className="flex-1 min-h-0 w-full rounded-2xl" />
            </div>
        );
    }

    if (isError) return <div className="w-full text-center py-20 text-red-600">Failed to load tasks.</div>;

    const notStartedTasks = tasks?.filter(t => t.status === 'Not Started' || t.status === 'In Progress') || [];
    const doneTasks = tasks?.filter(t => t.status === 'Done') || [];

    return (
        <div className="w-full flex flex-col gap-6 animate-fadeIn flex-1 min-h-0 overflow-y-auto">
            <div className="shrink-0">
                <h1 className="text-xl sm:text-2xl font-semibold font-headline text-[#0F1D29]">Tasks</h1>
                <p className="text-sm text-gray-500 mt-1 font-body">Manage your daily tasks and automatically generated order fulfillments.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0f0f0] flex flex-col gap-4">
                <h2 className="text-lg font-semibold font-headline text-[#0F1D29]">Active Tasks ({notStartedTasks.length})</h2>
                {notStartedTasks.length === 0 ? (
                    <p className="text-gray-500 text-sm">No active tasks.</p>
                ) : (
                    <div className="flex flex-col gap-3">
                        {notStartedTasks.map(task => (
                            <div key={task.task_id} className="flex items-center justify-between p-4 border border-[#f0f0f0] rounded-xl hover:shadow-sm transition bg-white">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => toggleStatus(task)} className="text-gray-300 hover:text-emerald-500 transition">
                                        <MdRadioButtonUnchecked size={24} />
                                    </button>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-[#0F1D29] font-headline">{task.title}</span>
                                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                            {task.deadline && (
                                                <span className="flex items-center gap-1">
                                                    <MdAccessTime />
                                                    {new Date(task.deadline).toLocaleDateString()}
                                                </span>
                                            )}
                                            {task.related_order_id && (
                                                <span className="px-2 py-0.5 bg-[#f0f0f0] rounded text-[#0F1D29]">Order #{task.related_order_id}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => handleDelete(task.task_id)} className="text-gray-400 hover:text-red-500 transition p-2">
                                    <MdDeleteOutline size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {doneTasks.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0f0f0] flex flex-col gap-4 opacity-75">
                    <h2 className="text-lg font-semibold font-headline text-[#0F1D29]">Completed ({doneTasks.length})</h2>
                    <div className="flex flex-col gap-3">
                        {doneTasks.map(task => (
                            <div key={task.task_id} className="flex items-center justify-between p-4 border border-[#f0f0f0] rounded-xl bg-gray-50">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => toggleStatus(task)} className="text-emerald-500 transition">
                                        <MdCheckCircle size={24} />
                                    </button>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-500 line-through font-headline">{task.title}</span>
                                    </div>
                                </div>
                                <button onClick={() => handleDelete(task.task_id)} className="text-gray-400 hover:text-red-500 transition p-2">
                                    <MdDeleteOutline size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
