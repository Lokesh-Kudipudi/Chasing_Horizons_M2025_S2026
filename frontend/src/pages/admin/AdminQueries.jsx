import { useState, useEffect } from "react";
import { FaEnvelope, FaUser, FaSearch, FaTrash, FaInfoCircle, FaQuestionCircle } from "react-icons/fa";
import DashboardLayout from "../../components/dashboard/shared/DashboardLayout.jsx";
import { adminSidebarItems } from "../../components/dashboard/admin/adminSidebarItems.jsx";
import toast from "react-hot-toast";
import { API } from "../../config/api";

export default function AdminQueries() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuery, setSelectedQuery] = useState(null);

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        const response = await fetch(
          API.ADMIN.QUERIES,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch queries");
        }

        const data = await response.json();
        setQueries(data.userQueries || []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQueries();
  }, []);

  const handleDeleteQuery = async (id) => {
    try {
      const response = await fetch(
        API.ADMIN.QUERY(id),
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        setQueries(queries.filter((q) => q._id !== id));
        setSelectedQuery(null);
        toast.success("Query deleted successfully");
      } else {
        toast.error("Failed to delete query");
      }
    } catch (error) {
      console.error("Error deleting query:", error);
      toast.error("Error deleting query");
    }
  };

  const filteredQueries = queries.filter(query =>
    query.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    query.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    query.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout title="User Queries" sidebarItems={adminSidebarItems}>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-100 border-t-[#003366] rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="User Queries" sidebarItems={adminSidebarItems}>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="User Queries" sidebarItems={adminSidebarItems}>
      <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-gray-100 pb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold text-[#003366] mb-3 flex items-center gap-3">
              <span className="bg-blue-50 p-2 rounded-xl text-3xl"></span> User Queries
            </h1>
            <p className="text-gray-500 text-lg">View and manage customer inquiries.</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none transition-all"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100">
            <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Total Queries</div>
            <div className="text-4xl font-bold text-[#003366]">{queries.length}</div>
          </div>
          <div className="bg-gradient-to-br from-[#003366] to-[#0055aa] p-6 rounded-[2rem] shadow-xl shadow-blue-900/20 text-white">
            <div className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-2">Search Results</div>
            <div className="text-4xl font-bold">{filteredQueries.length}</div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100">
            <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Recent (Today)</div>
            <div className="text-4xl font-bold text-green-600">
              {queries.filter(q => {
                const today = new Date().toDateString();
                return new Date(q.createdAt).toDateString() === today;
              }).length}
            </div>
          </div>
        </div>

        {/* Queries Grid */}
        {filteredQueries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {filteredQueries.map((query, idx) => (
              <div
                key={query._id}
                className="bg-white rounded-[2rem] p-6 shadow-lg shadow-gray-200/40 border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group animate-slide-up"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#003366] to-[#0055aa] rounded-xl flex items-center justify-center text-white font-bold text-lg">
                      {query.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{query.name}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <FaEnvelope className="text-blue-400" size={12} /> {query.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteQuery(query._id)}
                    className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all"
                  >
                    <FaTrash />
                  </button>
                </div>
                
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                      <FaQuestionCircle /> Reason
                    </span>
                    <span className="text-sm font-bold text-[#003366] mt-1 block px-3 py-1 bg-blue-50 rounded-lg inline-block">
                      {query.reason}
                    </span>
                  </div>
                  
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Query</span>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-xl">{query.query}</p>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
                    <span> {new Date(query.createdAt).toLocaleDateString()}</span>
                    <button
                      onClick={() => setSelectedQuery(query)}
                      className="text-[#003366] font-bold hover:text-blue-900 flex items-center gap-1"
                    >
                      <FaInfoCircle /> Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-[2rem] p-12 text-center border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl"></div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No queries found</h3>
            <p className="text-gray-500">No customer queries at the moment.</p>
          </div>
        )}

        {/* Details Modal */}
        {/* Details Modal */}
        {selectedQuery && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-slide-up max-h-[90vh] overflow-y-auto">
              <div className="bg-[#003366] p-6 flex justify-between items-center text-white sticky top-0">
                <h3 className="font-bold text-xl">Query Details</h3>
                <button onClick={() => setSelectedQuery(null)} className="bg-white/10 p-2 rounded-full hover:bg-white/20">×</button>
              </div>
              
              <div className="p-8 space-y-6">
                <div>
                  <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2"><FaUser /> Contact Information</h4>
                  <p className="text-sm text-gray-600">Name: {selectedQuery.name}</p>
                  <p className="text-sm text-gray-600">Email: {selectedQuery.email}</p>
                  <p className="text-sm text-gray-600">Phone: {selectedQuery.phone || "N/A"}</p>
                </div>
                
                <div>
                  <h4 className="font-bold text-gray-700 mb-2">Reason</h4>
                  <span className="px-4 py-2 bg-blue-100 text-[#003366] rounded-xl font-bold text-sm">{selectedQuery.reason}</span>
                </div>
                
                <div>
                  <h4 className="font-bold text-gray-700 mb-2">Query Message</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-xl">{selectedQuery.query}</p>
                </div>

                {/* Reply Section */}
                <div>
                  <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2"><FaEnvelope /> Admin Reply</h4>
                  {selectedQuery.reply ? (
                    <div className="bg-green-50 border border-green-100 p-4 rounded-xl">
                      <p className="text-sm text-green-800 font-medium">{selectedQuery.reply}</p>
                      <p className="text-xs text-green-600 mt-2 text-right">Status: Replied</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <textarea
                        className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-[#003366] outline-none"
                        placeholder="Type your reply here..."
                        rows="4"
                        id="replyInput" // localized access
                      ></textarea>
                      <button
                        onClick={async () => {
                           const replyText = document.getElementById("replyInput").value;
                           if(!replyText.trim()) return toast.error("Please enter a reply");
                           
                           try {
                             const response = await fetch(API.ADMIN.QUERY_REPLY(selectedQuery._id), {
                               method: "POST",
                               headers: { "Content-Type": "application/json" },
                               credentials: "include",
                               body: JSON.stringify({ reply: replyText })
                             });
                             const data = await response.json();
                             if(data.success) {
                               toast.success("Reply sent!");
                               // Update local state
                               setQueries(queries.map(q => q._id === selectedQuery._id ? data.query : q));
                               setSelectedQuery(data.query);
                             } else {
                               toast.error(data.message);
                             }
                           } catch (e) {
                             toast.error(`Failed to send reply : ${e}`);
                           }
                        }}
                        className="bg-[#003366] text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-900 transition-colors"
                      >
                        Send Reply
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="border-t border-gray-100 pt-4 flex justify-between items-center text-sm text-gray-500">
                  <span>Submitted: {new Date(selectedQuery.createdAt).toLocaleString()}</span>
                  <button
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this query?")) {
                        handleDeleteQuery(selectedQuery._id);
                      }
                    }}
                    className="text-red-500 hover:text-red-700 font-bold flex items-center gap-1"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
