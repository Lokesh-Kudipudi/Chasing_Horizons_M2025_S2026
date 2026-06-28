import { useState, useEffect, useCallback } from "react";
import { FaMapMarkerAlt, FaPlus, FaStar } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/shared/DashboardLayout";
import { hotelManagerSidebarItems } from "../../components/dashboard/hotelManager/hotelManagerSidebarItems.jsx";
import toast from "react-hot-toast";
import { API } from "../../config/api";

// Components
import RoomTabs from "../../components/hotelmanager/RoomTabs";
import RoomTypeForm from "../../components/hotelmanager/RoomTypeForm";
import RoomTypeList from "../../components/hotelmanager/RoomTypeList";
import PhysicalRoomList from "../../components/hotelmanager/PhysicalRoomList";
import PhysicalRoomModal from "../../components/hotelmanager/PhysicalRoomModal";

export default function HotelManagerRooms() {
  const [searchParams] = useSearchParams();
  const selectedHotelId = searchParams.get("hotelId");
  const withHotelQuery = useCallback(
    (url) =>
      selectedHotelId
        ? `${url}${url.includes("?") ? "&" : "?"}hotelId=${encodeURIComponent(selectedHotelId)}`
        : url,
    [selectedHotelId]
  );

  const [activeTab, setActiveTab] = useState("physical"); // 'types' or 'physical'
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [roomTypes, setRoomTypes] = useState([]);
  const [physicalRooms, setPhysicalRooms] = useState([]);
  const [currentHotel, setCurrentHotel] = useState(null);

  // Room Type Form State
  const [editingTypeId, setEditingTypeId] = useState(null);
  const defaultType = { title: "", price: "", rating: 4.5, features: [], image: "", description: "" };
  const [typeForm, setTypeForm] = useState(defaultType);
  const [submittingType, setSubmittingType] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // Physical Room Form State
  const [editingRoomId, setEditingRoomId] = useState(null);
  const defaultRoom = { roomNumber: "", roomTypeId: "", floorNumber: "", price: "", status: "available" };
  const [roomForm, setRoomForm] = useState(defaultRoom);
  const [submittingRoom, setSubmittingRoom] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);

  const fetchPhysicalRooms = useCallback(async () => {
    try {
      const res = await fetch(withHotelQuery(API.MANAGER.ROOMS), { credentials: "include" });
      const data = await res.json();
      if (data.status === "success") {
        setPhysicalRooms(data.data);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  }, [withHotelQuery]);

   const fetchInitialData = useCallback(async function () {
    try {
      setLoading(true);
      // Fetch Hotel Data (Room Types)
      const hotelRes = await fetch(withHotelQuery(API.MANAGER.MY_HOTEL), { credentials: "include" });
      const hotelData = await hotelRes.json();
      
      if (hotelData.status === "success" && hotelData.data) {
        setCurrentHotel(hotelData.data);
        setRoomTypes(hotelData.data.roomType || []);
        
        // Fetch Physical Rooms
        fetchPhysicalRooms();
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, [fetchPhysicalRooms, withHotelQuery]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);
  // --- ROOM TYPE FUNCTIONS ---
  function setTypeField(field, value) {
    setTypeForm((prev) => ({ ...prev, [field]: value }));
  }

  function setFeaturesFromString(str) {
    const arr = str.split(",").map((s) => s.trim()).filter(Boolean);
    setTypeField("features", arr);
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  }

  async function handleTypeSubmit(e) {
    e.preventDefault();
    if (!typeForm.title || !typeForm.price) return toast.error("Title and Price are required");
    
    setSubmittingType(true);
    try {
      let url = API.MANAGER.ROOM_TYPES;
      let method = "POST";
      if (editingTypeId) {
        url = API.MANAGER.ROOM_TYPE(editingTypeId);
        method = "PUT";
      }

      const formData = new FormData();
      formData.append("title", typeForm.title);
      formData.append("price", typeForm.price);
      formData.append("rating", typeForm.rating);
      formData.append("description", typeForm.description);
      formData.append("features", (typeForm.features || []).join(","));
      if (selectedFile) formData.append("image", selectedFile);
      else if (typeForm.image) formData.append("image", typeForm.image);

      const response = await fetch(withHotelQuery(url), { method, credentials: "include", body: formData });
      const data = await response.json();

      if (data.status === "success") {
        toast.success(editingTypeId ? "Room Type updated" : "Room Type added");
        fetchInitialData(); // Reload all
        resetTypeForm();
      } else {
        toast.error(data.message || "Failed.");
      }
    } catch (err) {
      toast.error(`Error saving room type : ${err}`);
    } finally {
      setSubmittingType(false);
    }
  }

  async function checkDeleteRoomType(typeId) {
      if (!window.confirm("Delete this room type?")) return;
        try {
        const response = await fetch(withHotelQuery(API.MANAGER.ROOM_TYPE(typeId)), {
            method: "DELETE",
            credentials: "include",
        });
        const data = await response.json();
        if (data.status === "success") {
            toast.success("Room type deleted");
            fetchInitialData();
        } else {
            toast.error(data.message);
        }
    } catch (error) { toast.error(`Error deleting room type : ${error}`); }
  }

  function editType(t) {
      setTypeForm({
          title: t.title,
          price: t.price,
          rating: t.rating,
          features: t.features,
          image: t.image,
          description: t.description
      });
      setEditingTypeId(t._id);
      setImagePreview(t.image);
      setSelectedFile(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetTypeForm() {
      setTypeForm(defaultType);
      setEditingTypeId(null);
      setSelectedFile(null);
      setImagePreview("");
  }


  // --- PHYSICAL ROOM FUNCTIONS ---
  function setRoomField(field, value) {
    setRoomForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleRoomSubmit(e) {
      e.preventDefault();
      if(!roomForm.roomNumber || !roomForm.roomTypeId) return toast.error("Room Number and Type are required");

      setSubmittingRoom(true);
      try {
        // Find room type name for snapshot
        const selectedType = roomTypes.find(t => t._id === roomForm.roomTypeId);
        const payload = {
            ...roomForm,
            roomType: selectedType ? selectedType.title : ""
        };

        let url = API.MANAGER.PHYSICAL_ROOMS;
        let method = "POST";
        if (editingRoomId) {
            url = API.MANAGER.PHYSICAL_ROOM(editingRoomId);
            method = "PUT";
        }

        const response = await fetch(withHotelQuery(url), {
            method,
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload)
        });
        const data = await response.json();

        if (data.status === "success") {
            toast.success(editingRoomId ? "Room updated" : "Room created");
            fetchPhysicalRooms();
            closeRoomModal();
        } else {
            toast.error(data.message || "Failed");
        }
      } catch (err) {
          toast.error(`Error processing room : ${err}`);
      } finally {
          setSubmittingRoom(false);
      }
  }

  async function checkDeleteRoom(roomId) {
      if(!window.confirm("Delete this physical room?")) return;
      try {
          const response = await fetch(withHotelQuery(API.MANAGER.PHYSICAL_ROOM(roomId)), {
              method: "DELETE",
              credentials: "include"
          });
          const data = await response.json();
          if (data.status === "success") {
              toast.success("Room deleted");
              fetchPhysicalRooms();
          } else {
              toast.error(data.message);
          }
      } catch (err) { toast.error(`Error deleting room : ${err}`); }
  }

  function editRoom(r) {
      setRoomForm({
          roomNumber: r.roomNumber,
          roomTypeId: r.roomTypeId,
          floorNumber: r.floorNumber || "",
          price: r.price || "",
          status: r.status
      });
      setEditingRoomId(r._id);
      setShowRoomModal(true);
  }

  function closeRoomModal() {
      setShowRoomModal(false);
      setRoomForm(defaultRoom);
      setEditingRoomId(null);
  }

  if (loading) {
    return (
      <DashboardLayout title="Room Inventory" sidebarItems={hotelManagerSidebarItems}>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-100 border-t-[#003366] rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Room Inventory" sidebarItems={hotelManagerSidebarItems}>
      <div className="p-8 space-y-8 animate-fade-in relative">
        
        {/* Header & Tabs */}
        <div>
           <div className="flex justify-between items-end mb-4">
              <div>
                <h1 className="text-4xl font-serif font-bold text-[#003366] mb-2 flex items-center gap-3">
                    <span className="bg-blue-50 p-2 rounded-xl text-3xl">️</span> Room Inventory
                </h1>
                <p className="text-gray-500 text-lg">Manage room types and individual units.</p>
              </div>
          </div>

          {currentHotel && (
            <div className="mb-5 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-[#003366]">{currentHotel.title}</h2>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <FaMapMarkerAlt className="text-gray-500" /> {currentHotel.location || "Location not set"}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    currentHotel.status === "active"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {currentHotel.status || "active"}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-5 text-sm text-gray-700">
                <span className="flex items-center gap-2">
                  <FaStar className="text-amber-500" /> Rating: {currentHotel.rating || "N/A"}
                </span>
                <span>Room Types: {roomTypes.length}</span>
                <span>Physical Rooms: {physicalRooms.length}</span>
              </div>
            </div>
          )}

          <RoomTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* --- PHYSICAL ROOMS TAB --- */}
        {activeTab === "physical" && (
            <div className="animate-fade-in space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">All Rooms ({physicalRooms.length})</h2>
                    <button 
                        onClick={() => setShowRoomModal(true)}
                        className="bg-[#003366] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-900 transition-all flex items-center gap-2"
                    >
                        <FaPlus /> Add Room
                    </button>
                </div>

                {/* Rooms Grid/Table */}
                <PhysicalRoomList 
                    physicalRooms={physicalRooms}
                    roomTypes={roomTypes}
                    onAddRoom={() => setShowRoomModal(true)}
                    onEditRoom={editRoom}
                    onDeleteRoom={checkDeleteRoom}
                />
            </div>
        )}

        {/* --- ROOM TYPES TAB --- */}
        {activeTab === "types" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
              <section className="lg:col-span-1">
                <RoomTypeForm 
                    typeForm={typeForm}
                    setTypeField={setTypeField}
                    setFeaturesFromString={setFeaturesFromString}
                    handleFileChange={handleFileChange}
                    handleTypeSubmit={handleTypeSubmit}
                    submittingType={submittingType}
                    editingTypeId={editingTypeId}
                    resetTypeForm={resetTypeForm}
                    imagePreview={imagePreview}
                    selectedFile={selectedFile}
                />
              </section>

              <section className="lg:col-span-2 space-y-6">
                 <RoomTypeList 
                    roomTypes={roomTypes}
                    onEdit={editType}
                    onDelete={checkDeleteRoomType}
                 />
              </section>
            </div>
        )}

        {/* --- PHYSICAL ROOM MODAL --- */}
        <PhysicalRoomModal 
            showRoomModal={showRoomModal}
            closeRoomModal={closeRoomModal}
            editingRoomId={editingRoomId}
            handleRoomSubmit={handleRoomSubmit}
            roomForm={roomForm}
            setRoomField={setRoomField}
            submittingRoom={submittingRoom}
            roomTypes={roomTypes}
        />

      </div>
    </DashboardLayout>
  );
}
