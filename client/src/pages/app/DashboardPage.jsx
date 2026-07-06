import { useState } from 'react';
import { useAnalyticsSummary, useTopProducts, useWeakProducts, useSalesByMonth } from '#hooks/useAnalytics.js';
import { useScheduledOrders } from '#hooks/useOrders.js';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

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

    return (
        <div className="p-6 flex flex-col gap-6 animate-fadeIn w-full max-w-[1400px] mx-auto font-body">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-semibold font-headline text-[#0F1D29]">Dashboard</h1>
                
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0f0f0] flex flex-col gap-2 transition-opacity duration-150" style={{ opacity: fetchingSummary ? 0.6 : 1 }}>
                    <span className="text-sm font-label uppercase text-gray-500">Total Sales</span>
                    <span className="text-3xl font-headline font-semibold text-[#8D4A52]">
                        {summary ? formatCurrency(summary.totalSales) : '...'}
                    </span>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0f0f0] flex flex-col gap-2 transition-opacity duration-150" style={{ opacity: fetchingSummary ? 0.6 : 1 }}>
                    <span className="text-sm font-label uppercase text-gray-500">Total Expenses</span>
                    <span className="text-3xl font-headline font-semibold text-[#0F1D29]">
                        {summary ? formatCurrency(summary.totalExpenses) : '...'}
                    </span>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0f0f0] flex flex-col gap-2 transition-opacity duration-150" style={{ opacity: fetchingSummary ? 0.6 : 1 }}>
                    <span className="text-sm font-label uppercase text-gray-500">Net Profit</span>
                    <span className="text-3xl font-headline font-semibold text-[#0F1D29]">
                        {summary ? formatCurrency(summary.netProfit) : '...'}
                    </span>
                </div>
            </div>

            {/* Charts & Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Column */}
                <div className="flex flex-col gap-6 lg:col-span-2">
                    {/* Sales Trend */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0f0f0] flex flex-col gap-4">
                        <h3 className="font-headline font-semibold text-lg text-[#0F1D29]">Sales Trend</h3>
                        <div className={`h-64 w-full transition-opacity duration-150 ${fetchingTrend ? 'opacity-60' : ''}`}>
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

                    {/* Upcoming Deadlines */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0f0f0] flex flex-col gap-4">
                        <h3 className="font-headline font-semibold text-lg text-[#0F1D29]">Upcoming Deadlines</h3>
                        <div className={`flex flex-col gap-3 transition-opacity duration-150 ${fetchingScheduled ? 'opacity-60' : ''}`}>
                            {scheduledOrders && scheduledOrders.length > 0 ? scheduledOrders.map(order => (
                                <div 
                                    key={order.order_id} 
                                    onClick={() => navigate(`/orders/${order.order_id}`)}
                                    className="flex justify-between items-center text-sm p-3 rounded-lg border border-[#f0f0f0] hover:border-[#8D4A52] hover:shadow-sm cursor-pointer transition duration-150 bg-[#FFF7E6]/30"
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
                </div>

                {/* Side Column (Products) */}
                <div className="flex flex-col gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0f0f0] flex flex-col gap-4">
                        <h3 className="font-headline font-semibold text-lg text-[#0F1D29]">Top Products</h3>
                        <div className={`flex flex-col gap-3 transition-opacity duration-150 ${fetchingTop ? 'opacity-60' : ''}`}>
                            {topProducts && topProducts.length > 0 ? topProducts.map(p => (
                                <div key={p.product_id} className="flex justify-between items-center text-sm">
                                    <span className="text-[#0F1D29] font-medium truncate pr-4">{p.Product?.product_name || 'Unknown'}</span>
                                    <span className="text-gray-500 whitespace-nowrap">{p.total_quantity} sold</span>
                                </div>
                            )) : <div className="text-sm text-gray-400">No data</div>}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0f0f0] flex flex-col gap-4">
                        <h3 className="font-headline font-semibold text-lg text-[#0F1D29]">Needs Attention</h3>
                        <div className={`flex flex-col gap-3 transition-opacity duration-150 ${fetchingWeak ? 'opacity-60' : ''}`}>
                            {weakProducts && weakProducts.length > 0 ? weakProducts.map(p => (
                                <div key={p.product_id} className="flex justify-between items-center text-sm">
                                    <span className="text-[#0F1D29] font-medium truncate pr-4">{p.Product?.product_name || 'Unknown'}</span>
                                    <span className="text-[#AB626A] whitespace-nowrap">{p.total_quantity} sold</span>
                                </div>
                            )) : <div className="text-sm text-gray-400">No data</div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}