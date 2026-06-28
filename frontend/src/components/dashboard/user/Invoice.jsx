import { useRef } from "react";
import { createPortal } from "react-dom";
import { useReactToPrint } from "react-to-print";

const Invoice = ({ booking, onClose }) => {
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Invoice_${booking._id}`,
  });


  if (!booking) return null;

  const { itemId, bookingDetails, userId } = booking;
  const isTour = booking.type === "Tour";
  
  // Calculate totals
  const price = bookingDetails?.price || itemId?.price?.amount || 0;
  const totalAmount = bookingDetails?.totalPrice || price;
  
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:p-0 print:static print:bg-white">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto print:shadow-none print:max-w-none print:max-h-none print:overflow-visible">
        
        {/* Print Content Container */}
        <div ref={componentRef} className="p-8 print:p-8">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b border-gray-100 pb-8 mb-8">
            <div>
              <h1 className="text-5xl font-extrabold text-[#003366] mb-2 tracking-tight">INVOICE</h1>
              <p className="text-gray-400 font-mono text-sm">#{booking._id.slice(-8).toUpperCase()}</p>
              <div className="mt-4">
                  <span className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase ${
                        bookingDetails?.status === "complete" || bookingDetails?.status === "checkedIn" || bookingDetails?.status === "booked"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-50 text-yellow-700 border border-yellow-100"
                    }`}>
                      {bookingDetails?.status?.toUpperCase() || "PENDING"}
                  </span>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-serif font-bold text-[#003366]">Chasing Horizons</h2>
              <p className="text-gray-500 mt-2 text-sm">123 Adventure Lane</p>
              <p className="text-gray-500 text-sm">Wanderlust City, WL 54321</p>
              <p className="text-gray-500 text-sm mt-1">support@chasinghorizons.com</p>
            </div>
          </div>

          {/* Bill To & Date Info */}
          <div className="flex justify-between mb-12">
            <div>
              <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">Billed To</h3>
              <p className="font-bold text-gray-900 text-lg">{userId?.fullName || "Valued Customer"}</p>
              <p className="text-gray-600">{userId?.email}</p>
              <p className="text-gray-600">{userId?.phone}</p>
              <p className="text-gray-600 max-w-xs">{userId?.address}</p>
            </div>
            <div className="text-right">
              <div className="mb-2">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mr-4">Date Issued:</span>
                <span className="font-bold text-gray-900">{formatDate(new Date())}</span>
              </div>
              <div className="mb-2">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mr-4">Booking Date:</span>
                <span className="font-bold text-gray-900">{formatDate(booking.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Booking Details Table */}
          <div className="mb-10">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Booking Details</h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Item Description</th>
                  <th className="py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Details</th>
                  <th className="py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-50">
                  <td className="py-6">
                    <p className="font-bold text-[#003366] text-lg mb-1">{itemId?.title || (isTour ? "Tour Package" : "Hotel Stay")}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1"> {itemId?.location || itemId?.startLocation}</p>
                  </td>
                  <td className="py-6 text-right text-gray-600 space-y-1">
                    {isTour ? (
                       <>
                        <p className="text-sm"><span className="font-medium text-gray-900">Start Date:</span> {formatDate(bookingDetails?.startDate)}</p> 
                        <p className="text-sm"><span className="font-medium text-gray-900">Travelers:</span> {bookingDetails?.numGuests || 1} Guests</p>
                       </>
                    ) : (
                        <>
                        <p className="text-sm"><span className="font-medium text-gray-900">Check-in:</span> {formatDate(bookingDetails?.checkIn)}</p>
                        <p className="text-sm"><span className="font-medium text-gray-900">Check-out:</span> {formatDate(bookingDetails?.checkOut)}</p>
                        <p className="text-sm"><span className="font-medium text-gray-900">Rooms:</span> {bookingDetails?.rooms || 1}</p>
                        </>
                    )}
                  </td>
                  <td className="py-6 text-right font-bold text-gray-900 text-lg align-top">
                    ₹{totalAmount.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="flex justify-end border-t border-gray-100 pt-8">
            <div className="w-72">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-bold text-gray-900">₹{totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-600">Tax (0%)</span>
                <span className="font-bold text-gray-900">₹0</span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-100 pt-6">
                <span className="text-2xl font-bold text-[#003366]">Total</span>
                <span className="text-2xl font-bold text-[#003366]">₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
           {/* Footer */}
           <div className="mt-16 text-center text-gray-500 text-sm print:mt-8">
               <p>Thank you for choosing Chasing Horizons for your travel needs!</p>
               <p className="mt-2">This is a computer-generated invoice and does not require a signature.</p>
           </div>

        </div>

        {/* Action Buttons - Hidden when printing */}
        <div className="bg-gray-50 px-8 py-4 flex justify-end gap-4 border-t print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Invoice
          </button>
        </div>
      </div>
    


    </div>
  );

  return createPortal(modalContent, document.body);
};

export default Invoice;
