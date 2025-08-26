import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {authAPI} from "../../services/api"
import { useNavigate } from "react-router-dom";

export default function UserProfileEdit() {
  const { user, updateUser } = useAuth();   // ✅ use useAuth() not useContext(AuthContext)
    const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: user?.username || "",
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    bio: user?.bio || "",
    location: user?.location || "",
    image: user?.image || "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) {
        formDataToSend.append(key, formData[key]);
      }
    });

    await authAPI.updateProfile(formData.username, formDataToSend);
    alert("Profile updated successfully!");
    console.log("Updated profile:", formData);
    await
    updateUser(formData); // Refresh user data in context
    navigate(`/profile/${formData.username}`);
  } catch (error) {
    console.error("Error updating profile:", error);
  }
};


  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded shadow w-50 d-flex flex-column justify-center mt-10">
        <input type="file" name="image" src={formData.image} onChange={(e) =>
    setFormData({ ...formData, image: e.target.files[0] }) // store File object
  } className="border rounded p-2 w-50"></input>
        <label htmlFor="username">Username</label>
      <input type="text" name="username" value={formData.username} onChange={handleChange} className="border rounded p-2 " />
        <label htmlFor="first_name">First Name</label>
      <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="border rounded p-2 " />
        <label htmlFor="last_name">Last Name</label>
      <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="border rounded p-2 " />
        <label htmlFor="bio">Bio</label>
      <textarea name="bio" value={formData.bio} onChange={handleChange} className="border rounded p-2 " />
        <label htmlFor="location">Location</label>
      <input type="text" name="location" value={formData.location} onChange={handleChange} className="border rounded p-2 " />
      {/* <input type="text" name="image" value={formData.image} onChange={handleChange} className="border rounded p-2 " /> */}

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Save
      </button>
    </form>
  );
}
