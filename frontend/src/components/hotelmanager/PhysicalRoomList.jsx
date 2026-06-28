import React from 'react';
import { FaPlus, FaTrash, FaLayerGroup, FaSortNumericDown, FaRupeeSign, FaInfoCircle } from "react-icons/fa";

export default function PhysicalRoomList({ physicalRooms, roomTypes, onAddRoom, onEditRoom, onDeleteRoom }) {
  if (physicalRooms.length === 0) {
      return (
        <div className="bg-gray-50 rounded-[2rem] p-12 text-center border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl"></div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No physical rooms found</h3>
            <p className="text-gray-500 mb-6">Add rooms to generate inventory for bookings.</p>
            <button onClick={onAddRoom} className="text-[#003366] font-bold hover:underline">Create your first room</button>
        </div>
      );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {physicalRooms.map(room => {
            const rType = roomTypes.find(t => t._id === room.roomTypeId);
            const statusColors = {
                "available": "bg-green-100 text-green-700",
                "occupied": "bg-blue-100 text-blue-700",
                "maintenance": "bg-red-100 text-red-700"
            };

            return (
                <div key={room._id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl transition-all relative group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-gray-100 px-4 py-2 rounded-lg font-bold text-xl text-gray-800">
                            {room.roomNumber}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColors[room.status] || "bg-gray-100"}`}>
                            {room.status}
                        </span>
                    </div>
                    <div className="space-y-2 mb-6">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400 flex items-center gap-2"><FaLayerGroup /> Type</span>
                            <span className="font-bold text-gray-700">{rType?.title || room.roomType || "Unknown"}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400 flex items-center gap-2"><FaSortNumericDown /> Floor</span>
                            <span className="font-bold text-gray-700">{room.floorNumber || "G"}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400 flex items-center gap-2"><FaRupeeSign /> Price</span>
                            <span className="font-bold text-gray-700">{room.price ? `₹${room.price}` : "Standard"}</span>
                        </div>
                        {room.currentBookingId && (
                            <div className="flex items-center justify-between text-sm mt-3 pt-3 border-t border-gray-100">
                                <span className="text-blue-500 font-bold flex items-center gap-2"><FaInfoCircle /> Occupied</span>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => onEditRoom(room)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-xl font-bold text-sm transition-colors">Edit</button>
                        <button onClick={() => onDeleteRoom(room._id)} className="px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-sm transition-colors"><FaTrash /></button>
                    </div>
                </div>
            );
        })}
    </div>
  );
}
