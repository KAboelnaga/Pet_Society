import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { Camera, User, Mail, MapPin, FileText, ArrowLeft, Save, X } from "lucide-react";
import Navbar from "../Navbar";

export default function UserProfileEdit() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Redirect if no user is logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    username: user?.username || "",
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    bio: user?.bio || "",
    location: user?.location || "",
    image: user?.image || "",
  });

  const [imagePreview, setImagePreview] = useState(user?.image || null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        bio: user.bio || "",
        location: user.location || "",
        image: user.image || "",
      });
      setImagePreview(user.image || null);
    }
  }, [user]);

  // Track changes to form data
  useEffect(() => {
    const originalData = {
      username: user?.username || "",
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      bio: user?.bio || "",
      location: user?.location || "",
      image: user?.image || "",
    };

    const hasChanges = Object.keys(formData).some(key => {
      if (key === 'image' && typeof formData[key] === 'object') {
        return formData[key] !== null; // New file selected
      }
      return formData[key] !== originalData[key];
    });

    setHasUnsavedChanges(hasChanges);
  }, [formData, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image: "" });
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleNavigation = (path) => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm(
        "You have unsaved changes. Are you sure you want to leave? Your changes will be lost."
      );
      if (confirmLeave) {
        navigate(path);
      }
    } else {
      navigate(path);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = "Bio must be less than 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();

      // Add all form fields to FormData, including empty strings for optional fields
      Object.keys(formData).forEach((key) => {
        const value = formData[key];

        // Handle image file separately
        if (key === 'image') {
          if (value && typeof value === 'object' && value instanceof File) {
            formDataToSend.append(key, value);
          } else if (value === "" || value === null) {
            // Don't append image if it's empty (keeps existing image)
            return;
          } else if (typeof value === 'string' && value.startsWith('http')) {
            // Don't append if it's an existing URL
            return;
          }
        } else {
          // For other fields, append even if empty (to clear the field)
          formDataToSend.append(key, value || "");
        }
      });

      console.log("Sending form data:", Object.fromEntries(formDataToSend));

      const response = await authAPI.updateProfile(formData.username, formDataToSend);

      console.log("Update response:", response.data);

      // Update user context with new data from server response
      if (response.data) {
        updateUser(response.data);
      }

      // Show success message
      alert("Profile updated successfully!");

      // Navigate back to profile
      navigate(`/profile/${formData.username}`);

    } catch (error) {
      console.error("Error updating profile:", error);

      // Handle specific error cases
      if (error.response?.data) {
        const serverErrors = error.response.data;
        console.log("Server errors:", serverErrors);
        setErrors(serverErrors);
      } else {
        setErrors({ general: "Failed to update profile. Please try again." });
      }
    } finally {
      setIsLoading(false);
    }
  };


  // Show loading if user data is not available yet
  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => handleNavigation(`/profile/${user?.username}`)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mb-4"
            >
              <ArrowLeft size={20} />
              <span>Back to Profile</span>
            </button>

            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 h-32 rounded-t-3xl relative">
              <div className="absolute inset-0 bg-black bg-opacity-20 rounded-t-3xl"></div>
              <div className="absolute bottom-4 left-6 text-white">
                <h1 className="text-2xl font-bold">Edit Profile</h1>
                <p className="text-blue-100">
                  Update your information
                  {hasUnsavedChanges && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-500 text-yellow-900">
                      Unsaved changes
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Main Form Card */}
          <div className="bg-white rounded-b-3xl shadow-2xl p-8">
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Profile Picture Section */}
              <div className="text-center">
                <div className="relative inline-block">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile preview"
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white text-3xl border-4 border-white shadow-lg">
                      {(formData.first_name?.[0] || formData.username?.[0] || "U").toUpperCase()}
                    </div>
                  )}

                  {/* Camera Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                  >
                    <Camera size={16} />
                  </button>

                  {/* Remove Image Button */}
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-0 right-0 bg-red-600 text-white p-1 rounded-full shadow-lg hover:bg-red-700 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />

                <p className="text-sm text-gray-500 mt-3">
                  Click the camera icon to change your profile picture
                </p>
              </div>

              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Username */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <User size={16} />
                    <span>Username</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.username ? "border-red-300 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="Enter your username"
                  />
                  {errors.username && (
                    <p className="text-red-500 text-sm">{errors.username}</p>
                  )}
                </div>

                {/* Email (Read-only) */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <Mail size={16} />
                    <span>Email</span>
                  </label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500"
                    placeholder="Email cannot be changed"
                  />
                </div>

                {/* First Name */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <User size={16} />
                    <span>First Name</span>
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.first_name ? "border-red-300 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="Enter your first name"
                  />
                  {errors.first_name && (
                    <p className="text-red-500 text-sm">{errors.first_name}</p>
                  )}
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <User size={16} />
                    <span>Last Name</span>
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.last_name ? "border-red-300 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="Enter your last name"
                  />
                  {errors.last_name && (
                    <p className="text-red-500 text-sm">{errors.last_name}</p>
                  )}
                </div>

                {/* Location */}
                <div className="space-y-2 md:col-span-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <MapPin size={16} />
                    <span>Location</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Where are you located?"
                  />
                </div>
              </div>

              {/* Bio Section */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <FileText size={16} />
                  <span>Bio</span>
                  <span className="text-xs text-gray-400">
                    ({formData.bio.length}/500)
                  </span>
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  maxLength={500}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                    errors.bio ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="Tell us about yourself and your pets..."
                />
                {errors.bio && (
                  <p className="text-red-500 text-sm">{errors.bio}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => handleNavigation(`/profile/${user?.username}`)}
                  className="flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} className="mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
