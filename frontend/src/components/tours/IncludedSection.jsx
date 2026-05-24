import { FaCheckCircle } from "react-icons/fa";

const IncludedSection = ({ includes }) => {
  return (
    <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-[#003366] mb-6 border-b border-gray-100 pb-2">What is Included?</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {includes.map((item, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-green-50/50 rounded-lg hover:bg-green-50 transition-colors">
            <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
            <span className="text-gray-700 font-medium leading-relaxed">{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default IncludedSection;
