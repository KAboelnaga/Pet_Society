import { useEffect, useState } from "react";
import { Edit, Mail, MapPin } from "lucide-react";
import Navbar from "../Navbar";
import { Link, useParams } from "react-router-dom";
import { authAPI } from "../../services/api";

export function UserProfile() {
  const { username } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authAPI.getUserProfile(username);
        setUser(response.data);
      } catch (e) {
        console.error("Error fetching user profile:", e);
        setUser(null);
      }
    };

    fetchUser();
  }, [username]);

  // fallback if no user
  const fallbackUser = {
    name: "John Doe",
    bio: "Passionate about building scalable applications and exploring AI.",
    email: "john.doe@example.com",
    location: "San Francisco, CA",
    image: "https://i.pravatar.cc/150?img=3",
  };

  const profile = user || fallbackUser;

  return (
    <>
      <Navbar />

      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="max-w-md w-full shadow-xl rounded-2xl bg-white">
          <div className="flex flex-col items-center p-6">
            {profile.image && (<img
                      src={profile.image}
                      alt={(profile.username?.[0] || profile.first_name?.[0] || "U").toUpperCase()}
                      className="w-32 h-32 rounded-full object-cover bg-transparent"
                    />)}
          {!profile.image &&(<div className="w-32 h-32 rounded-full bg-gray-400 flex items-center justify-center font-bold text-white">

            {!profile.image && ((profile.username?.[0] || profile.first_name?.[0] || "U").toUpperCase())}
          </div>)}

            <h2 className="text-2xl font-semibold mt-4">
              {profile.name || profile.username}
            </h2>
            <p className="text-center text-gray-500 mt-3">{profile.bio}</p>

            <div className="mt-5 w-full space-y-2 text-gray-700">
              <div className="flex items-center justify-center space-x-2">
                <Mail size={18} />
                <span>{profile.email}</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <MapPin size={18} />
                <span>{profile.location}</span>
              </div>
            </div>

            <div className="mt-6 flex space-x-4">
              <Link to={`/profile/${username}/update`}>
                <button className="flex items-center rounded-xl bg-blue-600 text-white px-6 py-2 shadow hover:bg-blue-700 transition">
                  <Edit size={16} className="mr-2" />
                  Edit Profile
                </button>
              </Link>
              <button className="flex items-center rounded-xl border px-6 py-2 hover:bg-gray-50 transition">
                Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
