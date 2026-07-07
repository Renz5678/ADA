import { useState } from 'react';
import { useAnalyticsSummary, useTopProducts, useWeakProducts, useSalesByMonth, useSuggestedTasks } from '#hooks/useAnalytics.js';
import { useScheduledOrders } from '#hooks/useOrders.js';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { MdLocalFireDepartment, MdFlashOn, MdPushPin, MdLightbulb } from 'react-icons/md';
import Skeleton from '#components/ui/Skeleton.jsx';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);

const formatMonth = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short' });
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'No deadline';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function DashboardPage() {
    const [period, setPeriod] = useState('month');
    const navigate = useNavigate();

    const { data: summary, isFetching: fetchingSummary } = useAnalyticsSummary(period);
    const { data: topProducts, isFetching: fetchingTop } = useTopProducts();
    const { data: weakProducts, isFetching: fetchingWeak } = useWeakProducts();
    const { data: salesTrend, isFetching: fetchingTrend } = useSalesByMonth();
    const { data: scheduledOrders, isFetching: fetchingScheduled } = useScheduledOrders();
    const { data: suggestedTasks, isFetching: fetchingSuggestions } = useSuggestedTasks();

    if ((!summary && fetchingSummary) || (!salesTrend && fetchingTrend)) {
        return (
            <div className="flex flex-col gap-4 w-full max-w-[1400px] mx-auto font-body flex-1 min-h-0 overflow-hidden">
                <div className="flex justify-between shrink-0">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-8 w-48" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
                    <Skeleton className="h-[84px] w-full rounded-2xl" />
                    <Skeleton className="h-[84px] w-full rounded-2xl" />
                    <Skeleton className="h-[84px] w-full rounded-2xl" />
                </div>
                <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
                    <Skeleton className="lg:w-2/3 h-full rounded-2xl" />
                    <Skeleton className="lg:w-1/3 h-full rounded-2xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 animate-fadeIn w-full max-w-[1400px] mx-auto font-body flex-1 min-h-0 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                <h1 className="text-xl sm:text-2xl font-semibold font-headline text-[#0F1D29]">Dashboard</h1>
                
                <div className="flex bg-[#f0f0f0] rounded-lg p-1">
                    {['today', 'week', 'month'].map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-1.5 text-sm rounded-md capitalize transition duration-150 ${period === p ? 'bg-white shadow-sm font-medium text-[#0F1D29]' : 'text-gray-500 hover:text-[#0F1D29]'}`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#f0f0f0] flex flex-col gap-1 transition-opacity duration-150" style={{ opacity: fetchingSummary ? 0.6 : 1 }}>
                    <span className="text-xs font-label uppercase text-gray-500">Total Sales</span>
                    <span className="text-2xl font-headline font-semibold text-[#8D4A52]">
                        {summary ? formatCurrency(summary.totalSales) : '...'}
                    </span>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#f0f0f0] flex flex-col gap-1 transition-opacity duration-150" style={{ opacity: fetchingSummary ? 0.6 : 1 }}>
                    <span className="text-xs font-label uppercase text-gray-500">Total Expenses</span>
                    <span className="text-2xl font-headline font-semibold text-[#0F1D29]">
                        {summary ? formatCurrency(summary.totalExpenses) : '...'}
                    </span>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#f0f0f0] flex flex-col gap-1 transition-opacity duration-150" style={{ opacity: fetchingSummary ? 0.6 : 1 }}>
                    <span className="text-xs font-label uppercase text-gray-500">Net Profit</span>
                    <span className="text-2xl font-headline font-semibold text-[#0F1D29]">
                        {summary ? formatCurrency(summary.netProfit) : '...'}
                    </span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
                
                {/* Left Column: Sales Trend (Takes more space) */}
                <div className="lg:w-2/3 bg-white rounded-2xl p-5 shadow-sm border border-[#f0f0f0] flex flex-col gap-3 min-h-0">
                    <h3 className="font-headline font-semibold text-base text-[#0F1D29] shrink-0">Sales Trend</h3>
                    <div className={`flex-1 min-h-0 transition-opacity duration-150 ${fetchingTrend ? 'opacity-60' : ''}`}>
                        {salesTrend && salesTrend.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={salesTrend}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="month" tickFormatter={formatMonth} axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dx={-10} tickFormatter={(val) => `₱${val}`} />
                                    <Tooltip 
                                        formatter={(value) => [formatCurrency(value), 'Sales']} 
                                        labelFormatter={formatMonth}
                                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                    />
                                    <Line type="monotone" dataKey="total_sales" stroke="#8D4A52" strokeWidth={3} dot={{fill: '#8D4A52', r: 4}} activeDot={{r: 6}} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">No data available</div>
                        )}
                    </div>
                </div>

                {/* Right Column: Split into Suggested Focus, Deadlines, and Products */}
                <div className="lg:w-1/3 flex flex-col gap-4 min-h-0 lg:max-h-full">
                    
                    {/* Suggested Focus */}
                    <div className="bg-[#FFF7E6] rounded-2xl p-5 shadow-sm border border-[#e8d5b5] flex flex-col gap-3 shrink-0 transition-opacity duration-150" style={{ opacity: fetchingSuggestions ? 0.6 : 1 }}>
                        <div className="flex items-center justify-between">
                            <h3 className="font-headline font-semibold text-base text-[#8D4A52]">Suggested Focus</h3>
                            <span className="flex h-2.5 w-2.5 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8D4A52] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#8D4A52]"></span>
                            </span>
                        </div>
                        {suggestedTasks && suggestedTasks.length > 0 ? (
                            <div className="flex flex-col gap-2">
                                {suggestedTasks.map((task, index) => (
                                    <div
                                        key={task.order_id}
                                        onClick={() => navigate(`/orders/${task.order_id}`)}
                                        className="bg-white p-3 rounded-xl shadow-sm border border-[#f0f0f0] cursor-pointer hover:border-[#8D4A52] transition"
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-sm flex items-center justify-center">
                                                    {index === 0 ? <MdLocalFireDepartment className="text-orange-500" /> : index === 1 ? <MdFlashOn className="text-yellow-500" /> : <MdPushPin className="text-blue-500" />}
                                                </span>
                                                <span className="font-semibold text-[#0F1D29] text-sm">Order #{task.order_id}</span>
                                            </div>
                                            <span className="text-xs font-bold text-[#8D4A52]">{formatCurrency(task.total_amount)}</span>
                                        </div>
                                        <div className="text-xs text-gray-500 mb-1">Due: {formatDate(task.deadline)}</div>
                                        {task.scheduleSuggestion && (
                                            <div className="text-xs font-medium text-blue-700 bg-blue-50 p-2 rounded-lg flex items-center gap-1">
                                                <MdLightbulb /> {task.scheduleSuggestion}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500">You're all caught up!</div>
                        )}
                    </div>

                    {/* Upcoming Deadlines */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#f0f0f0] flex flex-col gap-3 flex-1 min-h-0">
                        <h3 className="font-headline font-semibold text-base text-[#0F1D29] shrink-0">Upcoming Deadlines</h3>
                        <div className={`flex flex-col gap-2 overflow-y-auto transition-opacity duration-150 ${fetchingScheduled ? 'opacity-60' : ''}`}>
                            {scheduledOrders && scheduledOrders.length > 0 ? scheduledOrders.map(order => (
                                <div 
                                    key={order.order_id} 
                                    onClick={() => navigate(`/orders/${order.order_id}`)}
                                    className="flex justify-between items-center text-sm p-2.5 rounded-lg border border-[#f0f0f0] hover:border-[#8D4A52] hover:shadow-sm cursor-pointer transition duration-150 bg-[#FFF7E6]/30 shrink-0"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-[#0F1D29] font-medium truncate">Order #{order.order_id}</span>
                                        <span className="text-gray-500 text-xs">Due: {formatDate(order.deadline)}</span>
                                    </div>
                                    <span className="text-[#8D4A52] font-semibold">{formatCurrency(order.total_amount)}</span>
                                </div>
                            )) : <div className="text-sm text-gray-400">No upcoming tasks</div>}
                        </div>
                    </div>

                    {/* Products Performance */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#f0f0f0] flex flex-col gap-3 flex-1 min-h-0">
                        <div className="grid grid-cols-2 gap-4 h-full">
                            <div className="flex flex-col gap-2 overflow-y-auto pr-2">
                                <h3 className="font-headline font-semibold text-sm text-[#0F1D29] shrink-0 sticky top-0 bg-white z-10 pb-1">Top Products</h3>
                                <div className={`flex flex-col gap-2 transition-opacity duration-150 ${fetchingTop ? 'opacity-60' : ''}`}>
                                    {topProducts && topProducts.length > 0 ? topProducts.map(p => (
                                        <div key={p.product_id} className="flex flex-col text-xs shrink-0 border-b border-[#f0f0f0] pb-1">
                                            <span className="text-[#0F1D29] font-medium truncate">{p.Product?.product_name || 'Unknown'}</span>
                                            <span className="text-gray-500">{p.total_quantity} sold</span>
                                        </div>
                                    )) : <div className="text-xs text-gray-400">No data</div>}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 overflow-y-auto pl-2 border-l border-[#f0f0f0]">
                                <h3 className="font-headline font-semibold text-sm text-[#0F1D29] shrink-0 sticky top-0 bg-white z-10 pb-1">Needs Attention</h3>
                                <div className={`flex flex-col gap-2 transition-opacity duration-150 ${fetchingWeak ? 'opacity-60' : ''}`}>
                                    {weakProducts && weakProducts.length > 0 ? weakProducts.map(p => (
                                        <div key={p.product_id} className="flex flex-col text-xs shrink-0 border-b border-[#f0f0f0] pb-1">
                                            <span className="text-[#0F1D29] font-medium truncate">{p.Product?.product_name || 'Unknown'}</span>
                                            <span className="text-[#AB626A]">{p.total_quantity} sold</span>
                                        </div>
                                    )) : <div className="text-xs text-gray-400">No data</div>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}