import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/dashboard/shared/DashboardLayout";
import { adminSidebarItems } from "../../components/dashboard/admin/adminSidebarItems";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminSearchBar from "../../components/admin/AdminSearchBar";
import AdminStatsGrid from "../../components/admin/AdminStatsGrid";
import UserCard from "../../components/admin/UserCard";
import CreateUserModal from "../../components/admin/CreateUserModal";
import DeleteConfirmationModal from "../../components/admin/DeleteConfirmationModal";
import { API } from "../../config/api";

const AdminEmployees = () => {
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(API.ADMIN.EMPLOYEES, {
                credentials: "include",
            });
            const data = await response.json();

            if (data.status === "success") {
                setEmployees(data.data);
            } else {
                toast.error("Failed to load employees");
            }
        } catch (error) {
            console.error("Error fetching employees:", error);
            toast.error("Error loading employees");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (formData, onSuccess) => {
        setIsCreating(true);
        try {
            const response = await fetch(API.ADMIN.CREATE_USER, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ ...formData, role: "employee" }),
            });

            const data = await response.json();

            if (data.status === "success" || response.status === 201) {
                toast.success("Employee created successfully!");
                if (onSuccess) onSuccess();
                setShowCreateModal(false);
                fetchEmployees();
            } else {
                toast.error(data.message || "Failed to create employee");
            }
        } catch (error) {
            console.error("Error creating employee:", error);
            toast.error("Error creating employee");
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedEmployee) return;

        try {
            const response = await fetch(API.ADMIN.USER(selectedEmployee._id), {
                method: "DELETE",
                credentials: "include",
            });

            const data = await response.json();

            if (data.status === "success") {
                toast.success("Employee deleted successfully!");
                setShowDeleteModal(false);
                setSelectedEmployee(null);
                fetchEmployees();
            } else {
                toast.error(data.message || "Failed to delete employee");
            }
        } catch (error) {
            console.error("Error deleting employee:", error);
            toast.error("Error deleting employee");
        }
    };

    const filteredEmployees = employees.filter(emp =>
        emp.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.assignments?.some(asgn => asgn.title?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (isLoading) {
        return (
            <DashboardLayout title="Employee Management" sidebarItems={adminSidebarItems}>
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-blue-100 border-t-[#003366] rounded-full animate-spin"></div>
                </div>
            </DashboardLayout>
        );
    }

    const stats = [
        { label: "Total Employees", value: employees.length, bgClass: "bg-white shadow-gray-200/40 border border-gray-100", valueClass: "text-[#003366]" },
        { label: "Active", value: employees.length, textClass: "text-white", bgClass: "bg-gradient-to-br from-blue-600 to-blue-800 shadow-blue-900/20", labelClass: "text-blue-100" },
        { label: "Search Results", value: filteredEmployees.length, bgClass: "bg-white shadow-gray-200/40 border border-gray-100", valueClass: "text-gray-800" },
    ];

    return (
        <DashboardLayout title="Employee Management" sidebarItems={adminSidebarItems}>
            <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">

                <div className="flex justify-between items-end">
                    <AdminPageHeader
                        title="Employees"
                        subtitle="Manage verified employees for assignment."
                        icon=""
                    />
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-[#003366] text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-900 transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2"
                    >
                        <span>Create Employee</span>
                    </button>
                </div>

                <AdminSearchBar
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    placeholder="Search by name, email, or assignment (e.g. Hotel name)..."
                />

                <AdminStatsGrid stats={stats} />

                {filteredEmployees.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredEmployees.map((emp, idx) => (
                            <UserCard
                                key={emp._id}
                                user={emp}
                                onDelete={(user) => { setSelectedEmployee(user); setShowDeleteModal(true); }}
                                roleLabel="Employee"
                                roleColorClass="bg-blue-100 text-blue-600"
                                animationDelay={`${idx * 50}ms`}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-gray-50 rounded-[2rem] p-12 text-center border-2 border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl"></div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No employees found</h3>
                        <p className="text-gray-500 mb-6">Create your first employee to start assigning tasks.</p>
                    </div>
                )}

                <CreateUserModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreate}
                    title="Create Employee"
                    isLoading={isCreating}
                />

                <DeleteConfirmationModal
                    isOpen={showDeleteModal}
                    onClose={() => { setShowDeleteModal(false); setSelectedEmployee(null); }}
                    onConfirm={handleDelete}
                    itemName={selectedEmployee?.fullName}
                />
            </div>
        </DashboardLayout>
    );
};

export default AdminEmployees;
