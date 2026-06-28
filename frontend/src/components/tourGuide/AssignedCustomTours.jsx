import { useState, useEffect } from "react";
import { FaMapMarkerAlt, FaCalendar, FaUsers, FaMoneyBillWave, FaPaperPlane } from "react-icons/fa";
import toast from "react-hot-toast";
import { API } from "../../config/api";

const AssignedCustomTours = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quoteData, setQuoteData] = useState({});
  const [showQuoteModal, setShowQuoteModal] = useState(null);

  useEffect(() => {
    fetchAssignedRequests();
  }, []);

  const fetchAssignedRequests = async () => {
    try {
      const response = await fetch(API.GUIDE.CUSTOM_TOURS, {
        credentials: "include",
      });
      const data = await response.json();
      console.log("Tour Guide Dashboard received data:", data); // Debug log
      
      if (data.status === "success") {
        console.log("Setting requests:", data.data);
        setRequests(data.data || []);
      } else {
        console.warn("Fetch status not success:", data.status);
      }
    } catch (error) {
      console.error("Error fetching assigned requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuote = async (requestId) => {
    const quote = quoteData[requestId];
    if (!quote?.amount || !quote?.message) {
      toast.error("Please fill in all quote details");
      return;
    }

    const isUpdate = requests.find(r => r._id === requestId).quotes.some(q => q.tourGuideId);
    
    try {
      const response = await fetch(
        API.GUIDE.QUOTE(requestId),
        {
          method: isUpdate ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            amount: Number(quote.amount),
            message: quote.message,
            itinerary: quote.itinerary || "",
          }),
        }
      );

      const data = await response.json();
      if (data.status === "success") {
        toast.success(isUpdate ? "Quote updated successfully!" : "Quote submitted successfully!");
        setShowQuoteModal(null);
        setQuoteData({ ...quoteData, [requestId]: {} });
        fetchAssignedRequests();
      } else {
        toast.error(data.message || "Failed to submit quote");
      }
    } catch (error) {
      toast.error(`Failed to submit quote: ${error.message}`);
    }
  };

  const openQuoteModal = (request) => {
    const existingQuote = request.quotes?.find(q => q.tourGuideId) || {};
    if (existingQuote.amount) {
      setQuoteData({
        ...quoteData,
        [request._id]: {
          amount: existingQuote.amount,
          message: existingQuote.message,
          itinerary: existingQuote.itinerary
        }
      });
    }
    setShowQuoteModal(request._id);
  };


  const getStatusColor = (status) => {
    const colors = {
      assigned: "bg-blue-100 text-blue-700 border-blue-300",
      quoted: "bg-purple-100 text-purple-700 border-purple-300",
      bargaining: "bg-orange-100 text-orange-700 border-orange-300",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-2xl font-bold text-[#003366] mb-6">Assigned Custom Tours</h2>

      {requests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No assigned custom tour requests yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request._id}
              className="border-2 border-gray-100 rounded-xl p-5 hover:border-[#003366] transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800 mb-1">{request.title}</h3>
                  <p className="text-sm text-gray-500">
                    Client: {request.userId?.fullName || "Unknown"}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(request.status)}`}>
                  {request.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <FaMapMarkerAlt className="text-[#003366]" />
                  {request.places?.join(", ") || "No places"}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FaUsers className="text-[#003366]" />
                  {request.numPeople} travelers
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FaMoneyBillWave className="text-[#003366]" />
                  Budget: ₹{request.budget?.toLocaleString() || 0}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FaCalendar className="text-[#003366]" />
                  {request.travelDates?.startDate && request.travelDates?.endDate ? (
                    <span>
                      {new Date(request.travelDates.startDate).toLocaleDateString()} - {new Date(request.travelDates.endDate).toLocaleDateString()}
                      <span className="text-xs text-gray-400 block">
                        ({Math.ceil((new Date(request.travelDates.endDate) - new Date(request.travelDates.startDate)) / (1000 * 60 * 60 * 24))} days)
                      </span>
                    </span>
                  ) : "Date N/A"}
                </div>
              </div>

              {/* Hotel Requirements */}
              <div className="mb-4 bg-gray-50 p-3 rounded-lg text-sm">
                 <p className="font-semibold text-gray-700 mb-1">Accommodation:</p>
                 <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-white border border-gray-200 rounded text-xs uppercase font-bold text-gray-600">
                      {request.hotelRequirements?.type || "Standard"}
                    </span>
                    <span className="text-gray-600">
                      {request.hotelRequirements?.preferences || "No specific preferences"}
                    </span>
                 </div>
              </div>

              {/* Latest Bargain from User */}
              {request.status === "bargaining" && request.bargains?.length > 0 && (
                <div className="mb-4 bg-orange-50 border border-orange-200 p-4 rounded-xl animate-pulse">
                  <p className="text-orange-800 font-bold text-sm mb-2"> Client's Counter Offer:</p>
                  <p className="text-2xl font-bold text-orange-700">
                    ₹{request.bargains[request.bargains.length - 1].amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-orange-800 italic mt-1">
                    "{request.bargains[request.bargains.length - 1].message}"
                  </p>
                </div>
              )}

              {request.status === "assigned" && (
                <button
                  onClick={() => openQuoteModal(request)}
                  className="mt-4 px-6 py-3 bg-gradient-to-r from-[#003366] to-[#0055aa] text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <FaPaperPlane /> Submit Quote
                </button>
              )}

              {(request.status === "quoted" || request.status === "bargaining") && request.quotes?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-semibold text-gray-700">Your Quote:</p>
                    <button 
                      onClick={() => openQuoteModal(request)}
                      className="text-xs text-[#003366] font-bold hover:underline"
                    >
                      Edit Quote
                    </button>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <p className="text-xl font-bold text-[#003366]">₹{request.quotes.find(q => q.tourGuideId)?.amount?.toLocaleString()}</p>
                    <p className="text-sm text-gray-600 mt-1">{request.quotes.find(q => q.tourGuideId)?.message}</p>
                    {request.quotes.find(q => q.tourGuideId)?.itinerary && (
                      <p className="text-xs text-gray-500 mt-2 italic border-t border-blue-200 pt-1">
                        "{request.quotes.find(q => q.tourGuideId)?.itinerary}"
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quote Modal */}
      {showQuoteModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowQuoteModal(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "slideUp 0.3s ease-out" }}
          >
            <h3 className="text-2xl font-bold text-[#003366] mb-4">Submit Your Quote</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price (INR) *
                </label>
                <input
                  type="number"
                  placeholder="Enter your quote amount"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#003366] outline-none"
                  value={quoteData[showQuoteModal]?.amount || ""}
                  onChange={(e) =>
                    setQuoteData({
                      ...quoteData,
                      [showQuoteModal]: { ...quoteData[showQuoteModal], amount: e.target.value },
                    })
                  }
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message to Client *
                </label>
                <textarea
                  placeholder="Explain what's included in your quote..."
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#003366] outline-none resize-none"
                  rows="4"
                  value={quoteData[showQuoteModal]?.message || ""}
                  onChange={(e) =>
                    setQuoteData({
                      ...quoteData,
                      [showQuoteModal]: { ...quoteData[showQuoteModal], message: e.target.value },
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Itinerary Details (Optional)
                </label>
                <textarea
                  placeholder="Brief itinerary or tour highlights..."
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#003366] outline-none resize-none"
                  rows="3"
                  value={quoteData[showQuoteModal]?.itinerary || ""}
                  onChange={(e) =>
                    setQuoteData({
                      ...quoteData,
                      [showQuoteModal]: { ...quoteData[showQuoteModal], itinerary: e.target.value },
                    })
                  }
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowQuoteModal(null)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmitQuote(showQuoteModal)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#003366] to-[#0055aa] hover:from-[#002244] hover:to-[#003366] text-white rounded-xl font-semibold transition-all"
              >
                Submit Quote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignedCustomTours;
