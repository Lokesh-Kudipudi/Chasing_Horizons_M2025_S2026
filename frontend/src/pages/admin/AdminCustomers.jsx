import React, { useState, useEffect } from "react";
import { FaUser, FaEnvelope, FaPhone, FaSearch, FaCalendar, FaDollarSign } from "react-icons/fa";
import DashboardLayout from "../../components/dashboard/shared/DashboardLayout.jsx";
import { adminSidebarItems } from "../../components/dashboard/admin/adminSidebarItems.jsx";
import { API } from "../../config/api";

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch(API.ADMIN.CUSTOMERS, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch customers");
        }
        const data = await response.json();
        setCustomers(data.data || []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer =>
    customer.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout title="Customers" sidebarItems={adminSidebarItems}>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-100 border-t-[#003366] rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Customers" sidebarItems={adminSidebarItems}>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Customers" sidebarItems={adminSidebarItems}>
      <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-gray-100 pb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold text-[#003366] mb-3 flex items-center gap-3">
              <span className="bg-blue-50 p-2 rounded-xl text-3xl"></span> Customers
            </h1>
            <p className="text-gray-500 text-lg">View and manage all customer accounts.</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none transition-all"
            />
          </div>
        </div>



        {/* Customers Grid */}
        {filteredCustomers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCustomers.map((customer, idx) => (
              <div
                key={customer._id}
                className="bg-white rounded-[2rem] p-6 shadow-lg shadow-gray-200/40 border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group animate-slide-up"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#003366] to-[#0055aa] rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg overflow-hidden">
                    {customer.photo ? (
                      <img src={customer.photo} alt={customer.fullName} className="w-full h-full object-cover" />
                    ) : (
                      customer.fullName
                        ? customer.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)
                        : "U"
                    )}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-1">{customer.fullName}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-2 mb-2">
                  <FaEnvelope className="text-blue-400" /> {customer.email}
                </p>
                {customer.phone && (
                  <p className="text-sm text-gray-500 flex items-center gap-2 mb-3">
                    <FaPhone className="text-blue-400" /> {customer.phone}
                  </p>
                )}
                
                <div className="pt-4 border-t border-gray-100 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-1"><FaCalendar className="text-gray-400" /> Last Travel</span>
                    <span className="font-bold text-gray-800">{customer.lastTravel || "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Bookings</span>
                    <span className="font-bold text-[#003366]">{customer.bookings || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-1"><FaDollarSign className="text-green-500" /> Total Spent</span>
                    <span className="font-bold text-green-600">₹{customer.spent?.toLocaleString('en-IN') || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-[2rem] p-12 text-center border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl"></div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No customers found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminCustomers;
