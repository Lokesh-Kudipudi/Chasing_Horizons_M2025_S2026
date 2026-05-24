import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/dashboard/shared/DashboardLayout";
import { tourGuideSidebarItems } from "../../components/dashboard/tourGuide/tourGuideSidebarItems";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FaPlus, FaTrash, FaSave, FaTimes, FaMapMarkerAlt, FaDollarSign, FaClock, FaLanguage, FaImage, FaTag, FaCalendar, FaList, FaUsers } from "react-icons/fa";
import { API } from "../../config/api";

export default function TourGuideCreateTour() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: "",
    maxPeople: "",
    description: "",
    duration: "",
    startLocation: "",
    language: "",
    price: { amount: 0, currency: "INR", discount: 0 },
    mainImage: "",
    tags: "",
    availableMonths: "",
    includes: "",
    destinations: [],
    itinerary: [],
    bookingDetails: [],
  });

  const [mainImageFile, setMainImageFile] = useState(null);
  const [destinationFiles, setDestinationFiles] = useState({});

  const fetchTourDetails = useCallback(async () => {
    try {
      const response = await fetch(API.TOURS.DETAIL(id));
      const data = await response.json();
      if (data.status === "success") {
        const tour = data.tour;
        setFormData({
          ...tour,
          tags: tour.tags ? tour.tags.join(", ") : "",
          availableMonths: tour.availableMonths ? tour.availableMonths.join(", ") : "",
          includes: tour.includes ? tour.includes.join(", ") : "",
          destinations: tour.destinations || [],
          itinerary: tour.itinerary ? tour.itinerary.map(item => ({
            ...item,
            activities: item.activities ? item.activities.join(", ") : ""
          })) : [],
          bookingDetails: tour.bookingDetails
            ? tour.bookingDetails.map((detail) => ({
                ...detail,
                startDate: detail.startDate
                  ? new Date(detail.startDate).toISOString().split("T")[0]
                  : "",
                endDate: detail.endDate
                  ? new Date(detail.endDate).toISOString().split("T")[0]
                  : "",
              }))
            : [],
        });
      }
    } catch (error) {
      console.error("Error fetching tour details:", error);
      toast.error("Failed to fetch tour details");
    }
  }, [id]);

  useEffect(() => {
    if (isEditMode) {
      fetchTourDetails();
    }
  }, [isEditMode, fetchTourDetails]);

  

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("price.")) {
      const priceField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        price: { ...prev.price, [priceField]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddDestination = () => {
    setFormData(prev => ({
      ...prev,
      destinations: [...prev.destinations, { name: "", image: "" }]
    }));
  };

  const handleDestinationChange = (index, field, value) => {
    const newDestinations = [...formData.destinations];
    newDestinations[index][field] = value;
    setFormData(prev => ({ ...prev, destinations: newDestinations }));
  };

  const handleRemoveDestination = (index) => {
    const newDestinations = formData.destinations.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, destinations: newDestinations }));
  };

  const handleAddItineraryItem = () => {
    setFormData(prev => ({
      ...prev,
      itinerary: [...prev.itinerary, { day: "", location: "", activities: "" }]
    }));
  };

  const handleItineraryChange = (index, field, value) => {
    const newItinerary = [...formData.itinerary];
    newItinerary[index][field] = value;
    setFormData(prev => ({ ...prev, itinerary: newItinerary }));
  };

  const handleRemoveItineraryItem = (index) => {
    const newItinerary = formData.itinerary.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, itinerary: newItinerary }));
  };

  const handleAddBookingDetail = () => {
    setFormData(prev => ({
      ...prev,
      bookingDetails: [...prev.bookingDetails, { 
        startDate: "", startDay: "", endDate: "", endDay: "", status: "Available", discount: 0 
      }]
    }));
  };

  const handleBookingDetailChange = (index, field, value) => {
    const newBookingDetails = [...formData.bookingDetails];
    newBookingDetails[index][field] = value;

    if (field === "startDate" || field === "endDate") {
      if (value) {
        const date = new Date(value);
        const day = date.toLocaleDateString("en-IN", { weekday: "long" });
        const dayField = field === "startDate" ? "startDay" : "endDay";
        newBookingDetails[index][dayField] = day;
      }
    }

    setFormData(prev => ({ ...prev, bookingDetails: newBookingDetails }));
  };

  const handleRemoveBookingDetail = (index) => {
    const newBookingDetails = formData.bookingDetails.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, bookingDetails: newBookingDetails }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.bookingDetails.length === 0) {
      toast.error("Please add at least one booking detail");
      return;
    }

    if (formData.itinerary.length === 0) {
      toast.error("Please add at least one itinerary item");
      return;
    }

    if (formData.destinations.length === 0) {
      toast.error("Please add at least one place to visit");
      return;
    }

    const formDataToSend = new FormData();

    // Prepare arrays properly
    const tagsArray = formData.tags.split(",").map((tag) => tag.trim()).filter(Boolean);
    const monthsArray = formData.availableMonths.split(",").map((m) => m.trim()).filter(Boolean);
    const includesArray = formData.includes.split(",").map((i) => i.trim()).filter(Boolean);
    
    // Parse itinerary days just in case
    const itineraryArray = formData.itinerary.map(item => ({
        ...item,
        day: parseInt(item.day.toString().replace(/\D/g, "") || "0", 10),
        activities: item.activities.split(",").map(a => a.trim()).filter(Boolean)
      }));

    // Append simple fields
    formDataToSend.append("title", formData.title);
    formDataToSend.append("maxPeople", formData.maxPeople);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("duration", formData.duration);
    formDataToSend.append("startLocation", formData.startLocation);
    formDataToSend.append("language", formData.language);
    
    // Append JSON stringified fields
    formDataToSend.append("price", JSON.stringify(formData.price));
    formDataToSend.append("tags", JSON.stringify(tagsArray));
    formDataToSend.append("availableMonths", JSON.stringify(monthsArray));
    formDataToSend.append("includes", JSON.stringify(includesArray));
    formDataToSend.append("itinerary", JSON.stringify(itineraryArray));
    formDataToSend.append("destinations", JSON.stringify(formData.destinations)); // destination images will be merged in backend if files exist
    formDataToSend.append("bookingDetails", JSON.stringify(formData.bookingDetails));

    if (mainImageFile) {
      formDataToSend.append("mainImage", mainImageFile);
    } else {
      formDataToSend.append("mainImage", formData.mainImage);
    }

    // Append Destination Files
    Object.keys(destinationFiles).forEach(index => {
      formDataToSend.append(`destinationImage_${index}`, destinationFiles[index]);
    });

    try {
      const url = isEditMode
        ? API.TOURS.UPDATE(id)
        : API.TOURS.CREATE;
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        credentials: "include",
        body: formDataToSend, // Browser sets Content-Type to multipart/form-data
      });

      const responseData = await response.json();
      if (response.ok) {
        toast.success(
          responseData.message ||
            `Tour ${isEditMode ? "updated" : "created"} successfully`
        );
        navigate("/tour-guide/my-tours");
      } else {
        toast.error(responseData.message || "Failed to save tour");
      }
    } catch (error) {
      console.error("Error saving tour:", error);
      toast.error("Error saving tour");
    }
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainImageFile(file);
    }
  };

  const handleDestinationFileChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      setDestinationFiles(prev => ({ ...prev, [index]: file }));
    }
  };

  return (
    <DashboardLayout title={isEditMode ? "Edit Tour" : "Create Tour"} sidebarItems={tourGuideSidebarItems}>
      <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
        
        {/* Header */}
        <div className="border-b border-gray-100 pb-6">
          <h1 className="text-4xl font-serif font-bold text-[#003366] mb-2">
            {isEditMode ? "Edit Tour Package" : "Create New Tour Package"}
          </h1>
          <p className="text-gray-500 text-lg">Fill in the details to {isEditMode ? "update" : "create"} your tour package.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Basic Information */}
          <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/40 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
              <span className="bg-blue-50 p-2 rounded-xl text-[#003366]">📝</span> Basic Information
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tour Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Enter tour title..."
                  className="w-full border-2 border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="4"
                  placeholder="Describe your tour package..."
                  className="w-full border-2 border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <FaClock className="text-[#003366]" /> Duration *
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="e.g. 3 Days 2 Nights"
                    required
                    className="w-full border-2 border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <FaUsers className="text-[#003366]" /> Max Participants *
                  </label>
                  <input
                    type="number"
                    name="maxPeople"
                    value={formData.maxPeople || ""}
                    onChange={handleChange}
                    placeholder="e.g. 20"
                    required
                    className="w-full border-2 border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-[#003366]" /> Start Location *
                  </label>
                  <input
                    type="text"
                    name="startLocation"
                    value={formData.startLocation}
                    onChange={handleChange}
                    required
                    placeholder="City, State"
                    className="w-full border-2 border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <FaLanguage className="text-[#003366]" /> Language *
                  </label>
                  <input
                    type="text"
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    required
                    placeholder="e.g. English, Hindi"
                    className="w-full border-2 border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <FaDollarSign className="text-green-600" /> Price (INR) *
                  </label>
                  <input
                    type="number"
                    name="price.amount"
                    value={formData.price.amount}
                    onChange={handleChange}
                    required
                    placeholder="0"
                    className="w-full border-2 border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <FaImage className="text-[#003366]" /> Main Image *
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageChange}
                    className="hidden"
                    id="main-image-upload"
                  />
                  <label 
                    htmlFor="main-image-upload"
                    className="w-full block border-2 border-dashed border-[#003366] bg-blue-50 text-[#003366] rounded-xl p-4 text-center cursor-pointer hover:bg-blue-100 transition-all font-bold"
                  >
                    {mainImageFile ? mainImageFile.name : (formData.mainImage ? "Change Image" : "Upload Image")}
                  </label>
                </div>
                
                {(mainImageFile || formData.mainImage) && (
                  <div className="mt-3 rounded-xl overflow-hidden border-2 border-gray-200 relative group w-full h-64">
                    <img 
                      src={mainImageFile ? URL.createObjectURL(mainImageFile) : formData.mainImage} 
                      alt="Preview" 
                      className="w-full h-full object-cover" 
                      onError={(e) => e.target.style.display = 'none'} 
                    />
                     {mainImageFile && (
                        <button 
                          type="button"
                          onClick={() => setMainImageFile(null)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FaTimes />
                        </button>
                     )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/40 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
              <span className="bg-blue-50 p-2 rounded-xl text-[#003366]">🏷️</span> Additional Details
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <FaTag className="text-[#003366]" /> Tags (comma separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="Adventure, Hiking, Nature, Camping"
                  className="w-full border-2 border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <FaCalendar className="text-[#003366]" /> Available Months (comma separated)
                </label>
                <input
                  type="text"
                  name="availableMonths"
                  value={formData.availableMonths}
                  onChange={handleChange}
                  placeholder="January, February, March, October"
                  className="w-full border-2 border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <FaList className="text-[#003366]" /> What's Included (comma separated)
                </label>
                <textarea
                  name="includes"
                  value={formData.includes}
                  onChange={handleChange}
                  placeholder="Transport, Meals, Accommodation, Guide, Entry Tickets"
                  rows="3"
                  className="w-full border-2 border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/40 border border-gray-100">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="bg-blue-50 p-2 rounded-xl text-[#003366]">📅</span> Booking Dates
              </h2>
              <button
                type="button"
                onClick={handleAddBookingDetail}
                className="bg-[#003366] text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-900 transition-all shadow-lg flex items-center gap-2"
              >
                <FaPlus /> Add Date
              </button>
            </div>
            <div className="space-y-4">
              {formData.bookingDetails.map((detail, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2">Start Date</label>
                      <input
                        type="date"
                        value={detail.startDate}
                        onChange={(e) => handleBookingDetailChange(index, "startDate", e.target.value)}
                        className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2">End Date</label>
                      <input
                        type="date"
                        value={detail.endDate}
                        onChange={(e) => handleBookingDetailChange(index, "endDate", e.target.value)}
                        className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2">Status</label>
                      <select
                        value={detail.status}
                        onChange={(e) => handleBookingDetailChange(index, "status", e.target.value)}
                        className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none"
                      >
                        <option value="Available">Available</option>
                        <option value="Booked">Booked</option>
                        <option value="Full">Full</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2">Discount (%)</label>
                      <input
                        type="number"
                        value={detail.discount}
                        onChange={(e) => handleBookingDetailChange(index, "discount", e.target.value)}
                        className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveBookingDetail(index)}
                        className="w-full bg-red-50 text-red-600 px-4 py-3 rounded-xl font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                      >
                        <FaTrash /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {formData.bookingDetails.length === 0 && (
                <div className="text-center py-8 text-gray-400">No booking dates added yet.</div>
              )}
            </div>
          </div>

          {/* Places to Visit */}
          <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/40 border border-gray-100">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="bg-blue-50 p-2 rounded-xl text-[#003366]">📍</span> Places to Visit
              </h2>
              <button
                type="button"
                onClick={handleAddDestination}
                className="bg-[#003366] text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-900 transition-all shadow-lg flex items-center gap-2"
              >
                <FaPlus /> Add Place
              </button>
            </div>
            <div className="space-y-4">
              {formData.destinations.map((dest, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Place Name"
                      value={dest.name}
                      onChange={(e) => handleDestinationChange(index, "name", e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none"
                    />
                    <div className="flex gap-2 items-center">
                      <div className="flex-1">
                         <input
                            type="file"
                            accept="image/*"
                            id={`dest-image-${index}`}
                            className="hidden"
                            onChange={(e) => handleDestinationFileChange(index, e)}
                          />
                          <label 
                            htmlFor={`dest-image-${index}`}
                            className="w-full block border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 rounded-xl p-3 text-center cursor-pointer hover:bg-gray-100 text-sm truncate"
                          >
                           {destinationFiles[index] ? destinationFiles[index].name : (dest.image ? "Change Image" : "Upload Image")}
                          </label>
                      </div>
                      
                      {(destinationFiles[index] || dest.image) && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                          <img 
                            src={destinationFiles[index] ? URL.createObjectURL(destinationFiles[index]) : dest.image} 
                            alt="Dest" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveDestination(index)}
                        className="bg-red-50 text-red-600 px-4 py-3 rounded-xl hover:bg-red-100 transition-all"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {formData.destinations.length === 0 && (
                <div className="text-center py-8 text-gray-400">No destinations added yet.</div>
              )}
            </div>
          </div>

          {/* Itinerary */}
          <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/40 border border-gray-100">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="bg-blue-50 p-2 rounded-xl text-[#003366]">🗓️</span> Daily Itinerary
              </h2>
              <button
                type="button"
                onClick={handleAddItineraryItem}
                className="bg-[#003366] text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-900 transition-all shadow-lg flex items-center gap-2"
              >
                <FaPlus /> Add Day
              </button>
            </div>
            <div className="space-y-4">
              {formData.itinerary.map((item, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Day (e.g. 01)"
                      value={item.day}
                      onChange={(e) => handleItineraryChange(index, "day", e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Location"
                      value={item.location}
                      onChange={(e) => handleItineraryChange(index, "location", e.target.value)}
                      className="md:col-span-2 w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <textarea
                      placeholder="Activities (comma separated)"
                      value={item.activities}
                      onChange={(e) => handleItineraryChange(index, "activities", e.target.value)}
                      rows="2"
                      className="flex-1 w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none resize-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItineraryItem(index)}
                      className="bg-red-50 text-red-600 px-4 rounded-xl hover:bg-red-100 transition-all"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
              {formData.itinerary.length === 0 && (
                <div className="text-center py-8 text-gray-400">No itinerary items added yet.</div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/tour-guide/my-tours")}
              className="px-8 py-4 border-2 border-gray-200 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <FaTimes /> Cancel
            </button>
            <button
              type="submit"
              className="bg-[#003366] text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-900 transition-all shadow-xl shadow-blue-900/20 flex items-center gap-2"
            >
              <FaSave /> {isEditMode ? "Update Tour" : "Create Tour"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
