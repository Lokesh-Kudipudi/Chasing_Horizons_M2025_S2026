import React, { useState, useEffect } from "react";
import { FaChartLine, FaHotel, FaMapMarkedAlt, FaDollarSign, FaCalendarAlt } from "react-icons/fa";
import DashboardLayout from "../../components/dashboard/shared/DashboardLayout.jsx";
import { adminSidebarItems } from "../../components/dashboard/admin/adminSidebarItems.jsx";
import { API } from "../../config/api";

export default function AdminReports() {
    const [hotelReports, setHotelReports] = useState([]);
    const [tourReports, setTourReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const [hotelRes, tourRes] = await Promise.all([
                    fetch(`${API.BASE}/api/admin/reports/commissions/hotels`, { credentials: "include" }),
                    fetch(`${API.BASE}/api/admin/reports/commissions/tours`, { credentials: "include" })
                ]);

                if (!hotelRes.ok || !tourRes.ok) throw new Error("Failed to fetch reports");

                const [hotelData, tourData] = await Promise.all([hotelRes.json(), tourRes.json()]);

                setHotelReports(hotelData.data || []);
                setTourReports(tourData.data || []);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    if (loading) {
        return (
            <DashboardLayout title="Commission Reports" sidebarItems={adminSidebarItems}>
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-blue-100 border-t-[#003366] rounded-full animate-spin"></div>
                </div>
            </DashboardLayout>
        );
    }

    const totalHotelCommission = hotelReports.reduce((sum, r) => sum + r.totalCommission, 0);
    const totalTourCommission = tourReports.reduce((sum, r) => sum + r.totalCommission, 0);

    return (
        <DashboardLayout title="Commission Reports" sidebarItems={adminSidebarItems}>
            <div className="p-8 space-y-8 animate-fade-in">

                {/* Header */}
                <div className="border-b border-gray-100 pb-6">
                    <h1 className="text-4xl font-serif font-bold text-[#003366] mb-2 flex items-center gap-3">
                        <span className="bg-green-50 p-2 rounded-xl text-3xl"></span> Earnings & Reports
                    </h1>
                    <p className="text-gray-500 text-lg">Detailed overview of commissions from hotels and tours.</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-[#003366] to-[#0055aa] p-6 rounded-[2rem] shadow-xl shadow-blue-900/20 text-white hover:shadow-2xl transition-all duration-500">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                <FaHotel size={24} />
                            </div>
                            <div className="text-blue-100 text-sm font-bold uppercase tracking-widest">Hotel Commissions</div>
                        </div>
                        <div className="text-4xl font-bold">₹{totalHotelCommission.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="bg-gradient-to-br from-[#004d00] to-[#008000] p-6 rounded-[2rem] shadow-xl shadow-green-900/20 text-white hover:shadow-2xl transition-all duration-500">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                <FaMapMarkedAlt size={24} />
                            </div>
                            <div className="text-green-100 text-sm font-bold uppercase tracking-widest">Tour Commissions</div>
                        </div>
                        <div className="text-4xl font-bold">₹{totalTourCommission.toLocaleString('en-IN')}</div>
                    </div>
                </div>

                {/* Tables Container */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Hotel Reports Table */}
                    <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <FaHotel className="text-[#003366]" /> Hotel Commissions
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 text-left">
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Hotel</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Bookings</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Share %</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Commission</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {hotelReports.map((report) => (
                                        <tr key={report._id} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="px-6 py-4 font-bold text-gray-800">{report.hotelInfo?.title || "Unknown Hotel"}</td>
                                            <td className="px-6 py-4 text-center text-gray-600 font-medium">{report.bookingCount}</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-md font-black italic">
                                                    {totalHotelCommission > 0 ? ((report.totalCommission / totalHotelCommission) * 100).toFixed(1) : 0}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-[#003366]">₹{report.totalCommission.toLocaleString('en-IN')}</td>
                                        </tr>
                                    ))}
                                    {!hotelReports.length && (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-gray-400">No hotel data available</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Tour Reports Table */}
                    <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <FaMapMarkedAlt className="text-green-600" /> Tour Commissions
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 text-left">
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Tour Package</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Bookings</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Share %</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Commission</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {tourReports.map((report) => (
                                        <tr key={report._id} className="hover:bg-green-50/30 transition-colors">
                                            <td className="px-6 py-4 font-bold text-gray-800">{report.tourInfo?.title || "Unknown Tour"}</td>
                                            <td className="px-6 py-4 text-center text-gray-600 font-medium">{report.bookingCount}</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-[10px] bg-green-50 text-green-600 px-2 py-1 rounded-md font-black italic">
                                                    {totalTourCommission > 0 ? ((report.totalCommission / totalTourCommission) * 100).toFixed(1) : 0}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-green-700">₹{report.totalCommission.toLocaleString('en-IN')}</td>
                                        </tr>
                                    ))}
                                    {!tourReports.length && (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-gray-400">No tour data available</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}
