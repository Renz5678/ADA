import { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useAvailabilities } from '#hooks/useSchedule.js';
import { createAvailability, deleteAvailability } from '#api/schedule.js';
import Button from '#components/ui/Button.jsx';
import { MdDelete } from 'react-icons/md';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function SchedulePage() {
    const queryClient = useQueryClient();
    const { data: availabilities, isLoading } = useAvailabilities();
    
    const [dayOfWeek, setDayOfWeek] = useState('Monday');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');

    const addMutation = useMutation({
        mutationFn: createAvailability,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedule'] });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteAvailability,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedule'] });
        }
    });

    const handleAdd = (e) => {
        e.preventDefault();
        addMutation.mutate({ day_of_week: dayOfWeek, start_time: startTime, end_time: endTime });
    };

    if (isLoading) return <div className="p-6">Loading schedule...</div>;

    // Group blocks by day
    const grouped = availabilities?.reduce((acc, curr) => {
        if (!acc[curr.day_of_week]) acc[curr.day_of_week] = [];
        acc[curr.day_of_week].push(curr);
        return acc;
    }, {});

    return (
        <div className="p-6 flex flex-col gap-6 animate-fadeIn w-full max-w-[1200px] mx-auto font-body">
            <div>
                <h1 className="text-2xl font-semibold font-headline text-[#0F1D29]">Weekly Schedule Planner</h1>
                <p className="text-gray-500 mt-1">Set your working hours for better task planning.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Add Form */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0f0f0] flex flex-col gap-4 h-fit md:col-span-1">
                    <h3 className="font-headline font-semibold text-lg text-[#0F1D29]">Add Availability Block</h3>
                    <form onSubmit={handleAdd} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-label text-[#0F1D29]">Day of Week</label>
                            <select 
                                value={dayOfWeek} 
                                onChange={(e) => setDayOfWeek(e.target.value)}
                                className="border border-[#c1c1c1] rounded-lg px-3 py-2 w-full text-sm font-body bg-white"
                            >
                                {DAYS.map(day => <option key={day} value={day}>{day}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-label text-[#0F1D29]">Start Time</label>
                            <input 
                                type="time" 
                                value={startTime} 
                                onChange={(e) => setStartTime(e.target.value)}
                                className="border border-[#c1c1c1] rounded-lg px-3 py-2 w-full text-sm font-body"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-label text-[#0F1D29]">End Time</label>
                            <input 
                                type="time" 
                                value={endTime} 
                                onChange={(e) => setEndTime(e.target.value)}
                                className="border border-[#c1c1c1] rounded-lg px-3 py-2 w-full text-sm font-body"
                                required
                            />
                        </div>
                        <Button variant="primary" type="submit" disabled={addMutation.isPending} className="mt-2 w-full">
                            {addMutation.isPending ? 'Adding...' : 'Add Block'}
                        </Button>
                    </form>
                </div>

                {/* Display Grid */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0f0f0] md:col-span-2">
                    <h3 className="font-headline font-semibold text-lg text-[#0F1D29] mb-4">Your Schedule</h3>
                    
                    <div className="flex flex-col gap-6">
                        {DAYS.map(day => {
                            const blocks = grouped?.[day] || [];
                            return (
                                <div key={day} className="flex flex-col sm:flex-row sm:items-start gap-4 border-b border-[#f0f0f0] pb-4 last:border-0 last:pb-0">
                                    <div className="w-32 flex-shrink-0 font-medium text-[#0F1D29]">{day}</div>
                                    <div className="flex flex-wrap gap-2 flex-grow">
                                        {blocks.length > 0 ? blocks.map(block => (
                                            <div key={block.availability_id} className="flex items-center gap-2 bg-[#FFF7E6] text-[#8D4A52] px-3 py-1.5 rounded-md text-sm border border-[#8D4A52]/20">
                                                <span>{block.start_time.slice(0, 5)} - {block.end_time.slice(0, 5)}</span>
                                                <button 
                                                    onClick={() => deleteMutation.mutate(block.availability_id)}
                                                    className="text-[#8D4A52] hover:text-red-700 transition"
                                                    title="Remove Block"
                                                >
                                                    <MdDelete size={16} />
                                                </button>
                                            </div>
                                        )) : <span className="text-gray-400 text-sm italic py-1.5">No hours set</span>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
