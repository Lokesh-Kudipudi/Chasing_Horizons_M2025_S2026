import  { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API } from '../../config/api';
import { UserContext } from '../../context/userContext';

function ContactForm({ onOpenInbox }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    reason: "demo",
    query: "",
  });
  const navigate = useNavigate();
  const { state } = useContext(UserContext);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if(!state.user){
      toast.error("Please login to contact us");
      return;
    }

    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.query
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    try {
      const response = await fetch(
        API.CONTACT,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Thank you! We'll contact you");
        navigate("/");
      } else {
        throw new Error(data.message || "Failed to submit form");
      }
    } catch (error) {
      toast.error(
        `Error: ${error.message}`
      );
      return;
    }

    setFormData({
      name: "",
      email: "",
      phone: "",
      reason: "demo",
      query: "",
    });
  };

  return (
    <div className="w-full md:w-3/5 p-8 flex flex-col justify-center relative">
      <div className="mt-6 mb-6 animate-slide-up flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-[#003366] mb-1">
            Get in Touch
          </h2>
          <p className="text-gray-600 text-sm">
            Need help? Want a demo? Our team is here for you.
          </p>
        </div>
        <button
          onClick={onOpenInbox}
          className="px-4 py-2 bg-blue-50 text-[#003366] rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors"
        >
           My Inbox
        </button>
      </div>

      <form className="w-full space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="animate-slide-up-delay" style={{animationDelay: '0.1s'}}>
              <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="name">
                Name
              </label>
              <input
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:border-[#003366] focus:ring-1 focus:ring-[#003366]/20 outline-none transition-all placeholder:text-gray-400 bg-white/50 text-sm"
                type="text"
                id="name"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="animate-slide-up-delay" style={{animationDelay: '0.2s'}}>
              <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="email">
                Work email
              </label>
              <input
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:border-[#003366] focus:ring-1 focus:ring-[#003366]/20 outline-none transition-all placeholder:text-gray-400 bg-white/50 text-sm"
                type="email"
                id="email"
                name="email"
                placeholder="Enter your work email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="animate-slide-up-delay" style={{animationDelay: '0.3s'}}>
              <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="phone">
                Mobile number (+91)
              </label>
              <input
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:border-[#003366] focus:ring-1 focus:ring-[#003366]/20 outline-none transition-all placeholder:text-gray-400 bg-white/50 text-sm"
                type="tel"
                id="phone"
                name="phone"
                placeholder="1234567890"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="animate-slide-up-delay" style={{animationDelay: '0.4s'}}>
              <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="reason">
                Reason for contact
              </label>
              <select
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:border-[#003366] focus:ring-1 focus:ring-[#003366]/20 outline-none transition-all bg-white/50 text-gray-700 text-sm"
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                required
              >
                <option value="demo">Booking Inquiries</option>
                <option value="technical">Special Requests</option>
                <option value="pricing">Local Attractions</option>
                <option value="support">Group Planning</option>
                <option value="other">Other</option>
              </select>
            </div>
        </div>

        <div className="animate-slide-up-delay" style={{animationDelay: '0.5s'}}>
          <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="query">
            Message
          </label>
          <textarea
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:border-[#003366] focus:ring-1 focus:ring-[#003366]/20 outline-none transition-all placeholder:text-gray-400 bg-white/50 resize-none h-28 text-sm"
            id="query"
            name="query"
            placeholder="Tell us how we can help you..."
            value={formData.query}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="animate-slide-up-delay" style={{animationDelay: '0.6s'}}>
            <button
                type="submit"
                className="w-full py-3 bg-[#003366] hover:bg-[#002244] text-white font-semibold rounded-lg shadow hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300 text-sm"
            >
                Send Message
            </button>
        </div>
      </form>
    </div>
  );
}

export default ContactForm;
