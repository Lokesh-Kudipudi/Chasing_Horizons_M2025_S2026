import React, { useState } from "react";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaSave, FaTimes, FaTrash, FaCamera, FaCheckCircle, FaShieldAlt, FaBell, FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";
import { API } from "../../../config/api";

const Settings = ({
  profile,
  onInputChange,
  onPhotoChange,
  onSaveProfile,
  onDeleteAccount,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState("profile");
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordVisibility, setPasswordVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  console.log(profile);
  

  // Password validation function
  const validatePassword = (password) => {
    const errors = {};
    
    if (password.length < 8) {
      errors.length = "Password must be at least 8 characters long";
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.uppercase = "Password must contain at least one uppercase letter";
    }
    
    if (!/[a-z]/.test(password)) {
      errors.lowercase = "Password must contain at least one lowercase letter";
    }
    
    if (!/[0-9]/.test(password)) {
      errors.digit = "Password must contain at least one digit";
    }
    
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      errors.special = "Password must contain at least one special character";
    }
    
    return errors;
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate new password in real-time
    if (name === "newPassword") {
      const errors = validatePassword(value);
      setPasswordErrors(errors);
    } else {
      setPasswordErrors({});
    }
  };

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    // Validation checks
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("All fields are required");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    // Validate password strength
    const errors = validatePassword(passwordData.newPassword);
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      toast.error("Password does not meet the requirements");
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const response = await fetch(API.AUTH.UPDATE_PASSWORD, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.status === 200) {
        toast.success("Password updated successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setPasswordErrors({});
      } else {
        throw new Error(data.message || "Failed to update password");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-4xl font-serif font-bold text-[#003366] mb-3 flex items-center gap-3">
            <span className="bg-blue-50 p-2 rounded-xl text-3xl">️</span> Account Settings
          </h1>
          <p className="text-gray-500 text-lg">Manage your profile and security settings.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab("profile")}
          className={`px-6 py-3 font-bold text-sm transition-all relative ${activeTab === "profile" ? "text-[#003366]" : "text-gray-400 hover:text-gray-600"}`}
        >
          Profile Information
          {activeTab === "profile" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#003366]"></div>}
        </button>
        <button 
          onClick={() => setActiveTab("security")}
          className={`px-6 py-3 font-bold text-sm transition-all relative ${activeTab === "security" ? "text-[#003366]" : "text-gray-400 hover:text-gray-600"}`}
        >
          Security
          {activeTab === "security" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#003366]"></div>}
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Profile Picture Section */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100 text-center sticky top-24">
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden shadow-xl mx-auto border-4 border-white ring-2 ring-gray-100">
                  {profile.photoPreview ? (
                    <img src={profile.photoPreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : profile.photo ? (
                    <img src={profile.photo} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="bg-gradient-to-br from-[#003366] to-[#0055aa] w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                       {profile.fullName?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                <label htmlFor="photo-upload" className="absolute bottom-0 right-0 bg-white p-3 rounded-full shadow-lg border-2 border-gray-100 hover:bg-gray-50 transition-all cursor-pointer group">
                  <FaCamera className="text-[#003366] group-hover:scale-110 transition-transform" />
                  <input 
                    type="file" 
                    id="photo-upload" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={onPhotoChange}
                  />
                </label>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{profile.fullName || "User"}</h3>
              <p className="text-sm text-gray-500 mb-6">{profile.email}</p>
              
              <div className="space-y-3 text-left border-t border-gray-100 pt-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Member Since</span>
                  <span className="font-bold text-gray-800">{new Date(profile.createdAt).toLocaleDateString("en-US", {year: "numeric", month: "long", day: "numeric"})}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100 space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h3>
            
            {/* Full Name */}
            <div className="group">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <FaUser className="text-gray-400" /> Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={profile.fullName}
                onChange={onInputChange}
                className="w-full border-2 border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none transition-all bg-gray-50 group-hover:bg-white"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email (Read-only) */}
            <div className="group">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <FaEnvelope className="text-gray-400" /> Email Address
              </label>
              <input
                type="email"
                name="email"
                disabled={true}
                value={profile.email}
                className="w-full border-2 border-gray-200 rounded-xl p-4 bg-gray-100 cursor-not-allowed text-gray-500"
                placeholder="email@example.com"
              />
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <FaShieldAlt /> Email cannot be changed for security reasons
              </p>
            </div>

            {/* Phone */}
            <div className="group">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <FaPhone className="text-gray-400" /> Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={onInputChange}
                className="w-full border-2 border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none transition-all bg-gray-50 group-hover:bg-white"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>

            {/* Address */}
            <div className="group">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <FaMapMarkerAlt className="text-gray-400" /> Address
              </label>
              <textarea
                name="address"
                value={profile.address}
                onChange={onInputChange}
                rows="3"
                className="w-full border-2 border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none transition-all bg-gray-50 group-hover:bg-white resize-none"
                placeholder="Enter your complete address"
              ></textarea>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-100">
              <button
                onClick={onSaveProfile}
                disabled={isLoading}
                className="flex-1 bg-[#003366] text-white px-6 py-4 rounded-xl font-bold hover:bg-blue-900 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave /> Save Changes
                  </>
                )}
              </button>
              <button
                disabled={isLoading}
                className="px-6 py-4 border-2 border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2"
              >
                <FaTimes /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="space-y-8 max-w-3xl">
          
          {/* Change Password */}
          <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FaShieldAlt className="text-[#003366]" /> Change Password
            </h3>
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              {/* Current Password */}
              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={passwordVisibility.currentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full border-2 border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none transition-all bg-gray-50 group-hover:bg-white pr-12"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("currentPassword")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#003366] transition-colors"
                  >
                    {passwordVisibility.currentPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={passwordVisibility.newPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full border-2 border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none transition-all bg-gray-50 group-hover:bg-white pr-12"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("newPassword")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#003366] transition-colors"
                  >
                    {passwordVisibility.newPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                
                {/* Password Strength Indicators */}
                {passwordData.newPassword && (
                  <div className="mt-4 space-y-2 bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs font-bold text-gray-600 mb-3">Password Requirements:</p>
                    <div className="space-y-2">
                      <div className={`flex items-center gap-2 text-xs ${passwordData.newPassword.length >= 8 ? "text-green-600" : "text-gray-400"}`}>
                        <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${passwordData.newPassword.length >= 8 ? "bg-green-600 border-green-600" : "border-gray-300"}`}>
                          {passwordData.newPassword.length >= 8 && <span className="text-white text-xs">✓</span>}
                        </span>
                        At least 8 characters
                      </div>
                      <div className={`flex items-center gap-2 text-xs ${/[A-Z]/.test(passwordData.newPassword) ? "text-green-600" : "text-gray-400"}`}>
                        <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${/[A-Z]/.test(passwordData.newPassword) ? "bg-green-600 border-green-600" : "border-gray-300"}`}>
                          {/[A-Z]/.test(passwordData.newPassword) && <span className="text-white text-xs">✓</span>}
                        </span>
                        One uppercase letter
                      </div>
                      <div className={`flex items-center gap-2 text-xs ${/[a-z]/.test(passwordData.newPassword) ? "text-green-600" : "text-gray-400"}`}>
                        <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${/[a-z]/.test(passwordData.newPassword) ? "bg-green-600 border-green-600" : "border-gray-300"}`}>
                          {/[a-z]/.test(passwordData.newPassword) && <span className="text-white text-xs">✓</span>}
                        </span>
                        One lowercase letter
                      </div>
                      <div className={`flex items-center gap-2 text-xs ${/[0-9]/.test(passwordData.newPassword) ? "text-green-600" : "text-gray-400"}`}>
                        <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${/[0-9]/.test(passwordData.newPassword) ? "bg-green-600 border-green-600" : "border-gray-300"}`}>
                          {/[0-9]/.test(passwordData.newPassword) && <span className="text-white text-xs">✓</span>}
                        </span>
                        One number
                      </div>
                      <div className={`flex items-center gap-2 text-xs ${/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(passwordData.newPassword) ? "text-green-600" : "text-gray-400"}`}>
                        <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(passwordData.newPassword) ? "bg-green-600 border-green-600" : "border-gray-300"}`}>
                          {/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(passwordData.newPassword) && <span className="text-white text-xs">✓</span>}
                        </span>
                        One special character
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-2">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={passwordVisibility.confirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`w-full border-2 rounded-xl p-4 outline-none transition-all bg-gray-50 group-hover:bg-white pr-12 ${
                      passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword
                        ? "border-green-500 focus:ring-2 focus:ring-green-500"
                        : passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword
                        ? "border-red-500 focus:ring-2 focus:ring-red-500"
                        : "border-gray-200 focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
                    }`}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("confirmPassword")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#003366] transition-colors"
                  >
                    {passwordVisibility.confirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                  <p className="text-red-500 text-sm mt-2">Passwords do not match</p>
                )}
                {passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword && (
                  <p className="text-green-600 text-sm mt-2 flex items-center gap-1"><FaCheckCircle /> Passwords match</p>
                )}
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={isUpdatingPassword || Object.keys(passwordErrors).length > 0}
                className="w-full bg-[#003366] text-white px-6 py-4 rounded-xl font-bold hover:bg-blue-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                {isUpdatingPassword ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <FaShieldAlt /> Update Password
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 p-8 rounded-[2rem] shadow-xl shadow-red-200/40 border-2 border-red-100">
            <h3 className="text-2xl font-bold text-red-600 mb-3 flex items-center gap-2">
              <FaTrash /> Danger Zone
            </h3>
            <p className="text-gray-700 mb-6">
              Deleting your account is <strong>irreversible</strong>. All your data, bookings, and preferences will be permanently removed from our system.
            </p>
            <button
              onClick={onDeleteAccount}
              disabled={isLoading}
              className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <FaTrash /> Delete My Account
                </>
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Settings;
