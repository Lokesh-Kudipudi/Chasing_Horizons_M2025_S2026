import React from 'react';

export default function EmptyState({ message, subMessage, icon = "" }) {
  return (
    <div className="bg-gray-50 rounded-[2rem] p-12 text-center border-2 border-dashed border-gray-200">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">{icon}</div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{message}</h3>
      <p className="text-gray-500">
        {subMessage}
      </p>
    </div>
  );
}
