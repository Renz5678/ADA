import React, { useState, Fragment } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useAvailabilities } from '#hooks/useSchedule.js';
import { createAvailability, deleteAvailability } from '#api/schedule.js';
import Button from '#components/ui/Button.jsx';
import Skeleton from '#components/ui/Skeleton.jsx';
import { MdDelete } from 'react-icons/md';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const BLOCK_COLORS = {
    Free: 'bg-green-100 border-green-300 text-green-800',
    Flexible: 'bg-blue-100 border-blue-300 text-blue-800',
    Unavailable: 'bg-gray-200 border-gray-400 text-gray-800'
};

export default function SchedulePage() {
    const queryClient = useQueryClient();
    const { data: availabilities, isLoading } = useAvailabilities();
    
    const [dayOfWeek, setDayOfWeek] = useState('Monday');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');
    const [blockType, setBlockType] = useState('Free');

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
        addMutation.mutate({ day_of_week: dayOfWeek, start_time: startTime, end_time: endTime, block_type: blockType });
    };

    const getBlocksForHour = (day, hour) => {
        if (!availabilities) return [];
        return availabilities.filter(b => {
            if (b.day_of_week !== day) return false;
            const startHour = parseInt(b.start_time.split(':')[0]);
            const endHour = parseInt(b.end_time.split(':')[0]);
            const endMin = parseInt(b.end_time.split(':')[1]);
            return (startHour <= hour) && (hour < endHour || (hour === endHour && endMin > 0));
        });
    };

    if (isLoading) return (
        <div className="w-full flex flex-col gap-6 max-w-[1400px] mx-auto flex-1 min-h-0">
            <Skeleton className="h-24 w-full rounded-2xl shrink-0" />
            <Skeleton className="flex-1 min-h-0 w-full rounded-2xl" />
        </div>
    );

    return (
        <div className="flex flex-col gap-6 animate-fadeIn w-full max-w-[1400px] mx-auto font-body flex-1 min-h-0 overflow-hidden">
            <div className="shrink-0">
                <h1 className="text-2xl font-semibold font-headline text-[#0F1D29]">Schedule Planner</h1>
                <p className="text-gray-500 mt-1">Set your free time, flexible hours, and unavailability.</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#f0f0f0] shrink-0">
                <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-4">
                    <div className="flex flex-col gap-1 w-[130px]">
                        <label className="text-sm font-label text-[#0F1D29]">Day</label>
                        <select 
                            value={dayOfWeek} 
                            onChange={(e) => setDayOfWeek(e.target.value)}
                            className="border border-[#c1c1c1] rounded-lg px-3 py-2 text-sm font-body bg-white"
                        >
                            {DAYS.map(day => <option key={day} value={day}>{day}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1 w-[130px]">
                        <label className="text-sm font-label text-[#0F1D29]">Start</label>
                        <input 
                            type="time" 
                            value={startTime} 
                            onChange={(e) => setStartTime(e.target.value)}
                            className="border border-[#c1c1c1] rounded-lg px-3 py-2 text-sm font-body"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1 w-[130px]">
                        <label className="text-sm font-label text-[#0F1D29]">End</label>
                        <input 
                            type="time" 
                            value={endTime} 
                            onChange={(e) => setEndTime(e.target.value)}
                            className="border border-[#c1c1c1] rounded-lg px-3 py-2 text-sm font-body"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1 w-[130px]">
                        <label className="text-sm font-label text-[#0F1D29]">Type</label>
                        <select 
                            value={blockType} 
                            onChange={(e) => setBlockType(e.target.value)}
                            className="border border-[#c1c1c1] rounded-lg px-3 py-2 text-sm font-body bg-white"
                        >
                            <option value="Free">Free Time</option>
                            <option value="Flexible">Flexible</option>
                            <option value="Unavailable">Unavailable</option>
                        </select>
                    </div>
                    <Button variant="primary" type="submit" disabled={addMutation.isPending}>
                        {addMutation.isPending ? 'Adding...' : '+ Add Block'}
                    </Button>
                </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#f0f0f0] overflow-y-auto flex-1 relative">
                <div className="min-w-[800px]">
                    <div className="grid grid-cols-[60px_repeat(7,1fr)]">
                        {/* Header Row */}
                        <div className="sticky top-0 bg-[#F5F3F3] border-b border-r border-[#e0e0e0] p-2 z-20"></div>
                        {DAYS.map(day => (
                            <div key={day} className="sticky top-0 bg-[#F5F3F3] border-b border-r border-[#e0e0e0] p-2 text-center text-sm font-label font-medium text-[#0F1D29] z-20">
                                {day}
                            </div>
                        ))}

                        {/* Grid Rows */}
                        {HOURS.map(hour => (
                            <Fragment key={hour}>
                                <div className="border-b border-r border-[#e0e0e0] p-2 text-[11px] text-gray-500 text-right pr-2 bg-gray-50/50 sticky left-0 z-10">
                                    {hour.toString().padStart(2, '0')}:00
                                </div>
                                {DAYS.map(day => {
                                    const blocks = getBlocksForHour(day, hour);
                                    return (
                                        <div key={`${day}-${hour}`} className="border-b border-r border-[#e0e0e0] min-h-[44px] relative group hover:bg-[#FFF7E6]/30 transition-colors">
                                            {blocks.map(block => {
                                                const colorClass = BLOCK_COLORS[block.block_type || 'Free'];
                                                const startHour = parseInt(block.start_time.split(':')[0]);
                                                const endHour = parseInt(block.end_time.split(':')[0]);
                                                const endMin = parseInt(block.end_time.split(':')[1]);
                                                const isStart = startHour === hour;
                                                const isEnd = (endHour === hour && endMin === 0) || (endHour === hour + 1 && endMin === 0 && startHour !== hour);
                                                
                                                return (
                                                    <div 
                                                        key={block.availability_id} 
                                                        className={`absolute left-0 right-0 border-x ${isStart ? 'border-t-2 border-t-white/50 rounded-t-sm' : 'border-t-0'} ${isEnd ? 'border-b-2 rounded-b-sm' : 'border-b-0'} ${colorClass} z-10 mx-[2px] px-1.5 py-0.5 overflow-hidden shadow-sm flex flex-col group/block`}
                                                        style={{ 
                                                            top: isStart ? '2px' : '-1px', 
                                                            bottom: '0px'
                                                        }}
                                                    >
                                                        {isStart && (
                                                            <>
                                                                <div className="flex justify-between items-start">
                                                                    <div className="text-[11px] font-semibold tracking-tight truncate mix-blend-color-burn">{block.block_type || 'Free'}</div>
                                                                    <button 
                                                                        onClick={() => deleteMutation.mutate(block.availability_id)}
                                                                        className="opacity-0 group-hover/block:opacity-100 hover:text-red-700 transition cursor-pointer"
                                                                    >
                                                                        <MdDelete size={14} />
                                                                    </button>
                                                                </div>
                                                                <div className="text-[10px] leading-none opacity-80 truncate mix-blend-color-burn font-medium">
                                                                    {block.start_time.slice(0,5)} - {block.end_time.slice(0,5)}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </Fragment>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
