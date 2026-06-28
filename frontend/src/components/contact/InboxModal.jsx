import React from 'react';

function InboxModal({ isOpen, onClose, queries, loading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="bg-[#003366] p-6 flex justify-between items-center text-white sticky top-0">
          <h3 className="font-bold text-xl flex items-center gap-2"> My Inbox</h3>
          <button onClick={onClose} className="bg-white/10 p-2 rounded-full hover:bg-white/20">✕</button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="flex justify-center p-8">
               <div className="w-10 h-10 border-4 border-blue-100 border-t-[#003366] rounded-full animate-spin"></div>
            </div>
          ) : queries.length > 0 ? (
            queries.map((q) => (
              <div key={q._id} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                 <div className="flex justify-between items-start mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-[#003366] text-xs font-bold rounded-lg">{q.reason}</span>
                    <span className="text-xs text-gray-500">{new Date(q.createdAt).toLocaleDateString()}</span>
                 </div>
                 <p className="text-sm font-medium text-gray-800 mb-3">"{q.query}"</p>
                 
                 {q.reply ? (
                   <div className="bg-white p-3 rounded-lg border border-green-100 shadow-sm relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
                      <p className="text-xs font-bold text-green-600 mb-1">Admin Reply:</p>
                      <p className="text-sm text-gray-700">{q.reply}</p>
                   </div>
                 ) : (
                   <p className="text-xs text-gray-400 italic">No reply yet...</p>
                 )}
              </div>
            ))
          ) : (
             <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-3"></p>
                <p>No queries found.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InboxModal;
