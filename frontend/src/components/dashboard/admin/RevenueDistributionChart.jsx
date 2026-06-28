import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const RevenueDistributionChart = ({ hotelRevenue = 0, tourRevenue = 0 }) => {
    const data = [
        { name: 'Hotels', value: hotelRevenue, color: '#003366' },
        { name: 'Tours', value: tourRevenue, color: '#008000' }
    ];

    const total = hotelRevenue + tourRevenue;

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const percentage = total > 0 ? ((payload[0].value / total) * 100).toFixed(1) : 0;
            return (
                <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100">
                    <p className="font-bold text-gray-800">{payload[0].name}</p>
                    <p className="text-[#003366] font-black text-lg">₹{payload[0].value.toLocaleString('en-IN')}</p>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{percentage}% of Total</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="h-[300px] w-full">
            {total > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <div className="text-4xl mb-4"></div>
                    <p className="font-bold">No revenue data available yet</p>
                </div>
            )}
        </div>
    );
};

export default RevenueDistributionChart;
