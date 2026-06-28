import { useState } from "react";
import { FaFilter, FaChevronDown, FaChevronUp, FaStar } from "react-icons/fa";

const TourFilters = ({
  onFilterChange,
  activeFilters,
  onClearFilters,
  onPriceChange,
  onRatingChange,
  onFavouritesToggle,
  priceRange = [0, 100000],
  selectedRating = 0,
  showFavouritesOnly = false,
}) => {
  const filterSections = [
    {
      title: "Duration",
      name: "duration",
      options: ["1-3 days", "4-7 days", "8+ days"],
    },
  ];

  const [expandedSections, setExpandedSections] = useState(() =>
    Object.fromEntries(filterSections.map((s) => [s.name, true]))
  );
  
  const [priceMin, setPriceMin] = useState(priceRange[0]);
  const [priceMax, setPriceMax] = useState(priceRange[1]);

  const toggleSection = (name) => {
    setExpandedSections((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handlePriceChange = (type, value) => {
    const numValue = parseInt(value);
    if (type === 'min') {
      setPriceMin(numValue);
      onPriceChange([numValue, priceMax]);
    } else {
      setPriceMax(numValue);
      onPriceChange([priceMin, numValue]);
    }
  };

  return (
    <aside className="w-full md:w-72 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-fit sticky top-24 transition-all duration-300">
      <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
        <h3 className="text-[#003366] font-bold text-lg flex items-center gap-2">
          <FaFilter className="text-blue-500" /> Filters
        </h3>
        <button
          onClick={() => {
            onClearFilters();
            setPriceMin(0);
            setPriceMax(100000);
          }}
          className="text-sm text-blue-500 hover:text-blue-700 font-semibold transition-colors"
        >
          Reset
        </button>
      </div>

      <div className="space-y-6">
        {/* Price Range Slider */}
        <div className="border-b border-gray-100 pb-6">
          <h4 className="font-semibold text-gray-800 mb-4">Price Range</h4>
          <div className="space-y-4">
            {/* Range Display */}
            <div className="flex justify-between text-sm font-medium text-[#003366]">
              <span>₹{priceMin.toLocaleString('en-IN')}</span>
              <span>₹{priceMax.toLocaleString('en-IN')}</span>
            </div>
            
            {/* Dual Range Slider */}
            <div className="relative h-2 bg-gray-200 rounded-full">
              <div 
                className="absolute h-2 bg-[#003366] rounded-full"
                style={{
                  left: `${(priceMin / 100000) * 100}%`,
                  right: `${100 - (priceMax / 100000) * 100}%`
                }}
              ></div>
              <input
                type="range"
                min="0"
                max="100000"
                step="1000"
                value={priceMin}
                onChange={(e) => handlePriceChange('min', e.target.value)}
                className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#003366] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#003366] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md"
              />
              <input
                type="range"
                min="0"
                max="100000"
                step="1000"
                value={priceMax}
                onChange={(e) => handlePriceChange('max', e.target.value)}
                className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#003366] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#003366] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md"
              />
            </div>
            
            {/* Input Fields */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">Min</label>
                <input
                  type="number"
                  min="0"
                  max="100000"
                  step="1000"
                  value={priceMin}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">Max</label>
                <input
                  type="number"
                  min="0"
                  max="100000"
                  step="1000"
                  value={priceMax}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Favourites Toggle */}
        <div className="border-b border-gray-100 pb-6">
          <button
            onClick={() => onFavouritesToggle(!showFavouritesOnly)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
              showFavouritesOnly
                ? 'bg-gradient-to-br from-[#003366] to-[#0055aa] text-white shadow-lg'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`text-xl ${showFavouritesOnly ? 'animate-pulse' : ''}`}>
                {showFavouritesOnly ? '️' : ''}
              </span>
              <span className="font-semibold">Show Favourites Only</span>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-all ${
              showFavouritesOnly ? 'bg-white/30' : 'bg-gray-300'
            }`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${
                showFavouritesOnly ? 'right-1 bg-white' : 'left-1 bg-white'
              }`}></div>
            </div>
          </button>
        </div>

        {/* Rating Filter */}
        <div className="border-b border-gray-100 pb-6">
          <h4 className="font-semibold text-gray-800 mb-4">Minimum Rating</h4>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() => onRatingChange(selectedRating === rating ? 0 : rating)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  selectedRating === rating
                    ? 'bg-blue-50 border-2 border-[#003366]'
                    : 'bg-gray-50 border-2 border-transparent hover:border-gray-200'
                }`}
              >
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={i < rating ? 'text-yellow-400' : 'text-gray-300'}
                      size={14}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">& up</span>
              </button>
            ))}
          </div>
        </div>

        {/* Other Filters */}
        {filterSections.map((section) => (
          <div key={section.name} className="border-b border-gray-100 pb-4 last:border-0">
            <button
              onClick={() => toggleSection(section.name)}
              className="flex justify-between items-center w-full text-left mb-3 group"
            >
              <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                {section.title}
              </h4>
              <span className="text-gray-400 text-xs">
                {expandedSections[section.name] ? <FaChevronUp /> : <FaChevronDown />}
              </span>
            </button>

            <div
              className={`space-y-2 transition-all duration-300 ease-in-out overflow-hidden ${
                expandedSections[section.name] ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              {section.options.map((option) => (
                <label
                  key={option}
                  className="flex items-center space-x-3 cursor-pointer group"
                >
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      value={option}
                      className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-300 shadow-sm transition-all checked:border-blue-600 checked:bg-blue-600 hover:border-blue-400 focus:ring-1 focus:ring-blue-200"
                      onChange={(e) =>
                        onFilterChange(
                          section.name,
                          option,
                          e.target.checked
                        )
                      }
                      checked={activeFilters[section.name]?.includes(option)}
                    />
                    <svg
                      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100"
                      width="10"
                      height="8"
                      viewBox="0 0 10 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 3.5L3.5 6L9 1"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="text-gray-600 text-sm group-hover:text-blue-600 transition-colors">
                    {option}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default TourFilters;
