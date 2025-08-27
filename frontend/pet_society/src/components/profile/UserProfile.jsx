import { useEffect, useState } from "react";
import { Edit, Mail, MapPin, Calendar, Users, Heart, MessageCircle, UserPlus, UserMinus } from "lucide-react";
import Navbar from "../Navbar";
import { Link, useParams } from "react-router-dom";
import { authAPI, postsAPI } from "../../services/api";
import UserPostCard from "./UserPostCard";
import { useAuth } from "../../context/AuthContext";

export function UserProfile() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsPage, setPostsPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await authAPI.getUserProfile(username);
        setUser(response.data);
        setIsFollowing(response.data.is_following || false);
        setFollowersCount(response.data.followers_count || 0);
      } catch (e) {
        console.error("Error fetching user profile:", e);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [username]);

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        setPostsLoading(true);
        const response = await postsAPI.getUserPosts(username, postsPage);
        if (response.data.results) {
          setPosts(response.data.results);
          setHasMorePosts(!!response.data.next);
        } else {
          setPosts(response.data);
          setHasMorePosts(false);
        }
      } catch (e) {
        console.error("Error fetching user posts:", e);
        setPosts([]);
        setHasMorePosts(false);
      } finally {
        setPostsLoading(false);
      }
    };

    if (username) {
      fetchUserPosts();
    }
  }, [username, postsPage]);

  const handleDeletePost = (postId) => {
    setPosts(posts.filter(post => post.id !== postId));
  };

  const handleFollow = async () => {
    if (followLoading) return;

    setFollowLoading(true);
    try {
      const response = await authAPI.followUser(username);
      setIsFollowing(true);
      setFollowersCount(response.data.followers_count);
    } catch (error) {
      console.error("Error following user:", error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (followLoading) return;

    setFollowLoading(true);
    try {
      const response = await authAPI.unfollowUser(username);
      setIsFollowing(false);
      setFollowersCount(response.data.followers_count);
    } catch (error) {
      console.error("Error unfollowing user:", error);
    } finally {
      setFollowLoading(false);
    }
  };

  // fallback if no user
  const fallbackUser = {
    name: "John Doe",
    bio: "Passionate about building scalable applications and exploring AI. Love spending time with my pets and sharing their adventures with the community.",
    email: "john.doe@example.com",
    location: "San Francisco, CA",
    image: "https://i.pravatar.cc/150?img=3",
    joined: "January 2024",
    posts_count: posts.length,
    followers_count: 128,
    following_count: 89,
  };

  const profile = user || fallbackUser;

  // Update posts count from actual posts data
  if (profile) {
    profile.posts_count = posts.length;
  }

  if (loading) {
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
          {/* Cover Photo Section */}
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 h-48 rounded-t-3xl overflow-hidden">
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            <div className="absolute bottom-4 left-6 text-white">
              <h1 className="text-2xl font-bold">Welcome to {profile.name || profile.username}'s Profile</h1>
            </div>
          </div>

          {/* Main Profile Card */}
          <div className="bg-white rounded-b-3xl shadow-2xl relative">
            {/* Profile Picture */}
            <div className="absolute -top-16 left-6">
              {profile.image ? (
                <img
                  src={profile.image}
                  alt={(profile.username?.[0] || profile.first_name?.[0] || "U").toUpperCase()}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white text-3xl border-4 border-white shadow-lg">
                  {(profile.username?.[0] || profile.first_name?.[0] || "U").toUpperCase()}
                </div>
              )}
            </div>

            <div className="pt-20 pb-8 px-6">
              {/* Profile Header */}
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {profile.name || profile.username}
                  </h2>

                  {profile.bio && (
                    <p className="text-gray-600 text-lg leading-relaxed mb-4 max-w-2xl">
                      {profile.bio}
                    </p>
                  )}

                  {/* Profile Stats */}
                  <div className="flex flex-wrap gap-6 mb-6">
                    <div className="flex items-center space-x-2 text-gray-700">
                      <Heart className="w-5 h-5 text-red-500" />
                      <span className="font-semibold">{profile.posts_count || 0}</span>
                      <span className="text-sm">Posts</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-700">
                      <Users className="w-5 h-5 text-blue-500" />
                      <span className="font-semibold">{followersCount}</span>
                      <span className="text-sm">Followers</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-700">
                      <Users className="w-5 h-5 text-green-500" />
                      <span className="font-semibold">{profile.following_count || 0}</span>
                      <span className="text-sm">Following</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
                  {currentUser?.username === username ? (
                    // Own profile - show edit button
                    <Link to={`/profile/${username}/update`}>
                      <button className="flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                        <Edit size={18} className="mr-2" />
                        Edit Profile
                      </button>
                    </Link>
                  ) : (
                    // Other user's profile - show follow/unfollow button
                    <button
                      onClick={isFollowing ? handleUnfollow : handleFollow}
                      disabled={followLoading}
                      className={`flex items-center justify-center px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                        isFollowing
                          ? "bg-gray-500 hover:bg-gray-600 text-white"
                          : "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      }`}
                    >
                      {followLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      ) : isFollowing ? (
                        <UserMinus size={18} className="mr-2" />
                      ) : (
                        <UserPlus size={18} className="mr-2" />
                      )}
                      {followLoading ? "Loading..." : isFollowing ? "Unfollow" : "Follow"}
                    </button>
                  )}

                  <button className="flex items-center justify-center border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
                    <MessageCircle size={18} className="mr-2" />
                    Message
                  </button>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.email && (
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{profile.email}</p>
                    </div>
                  </div>
                )}

                {profile.location && (
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <MapPin className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium text-gray-900">{profile.location}</p>
                    </div>
                  </div>
                )}

                {profile.joined && (
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Joined</p>
                      <p className="font-medium text-gray-900">{profile.joined}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Posts Section */}
          <div className="mt-8 bg-white rounded-3xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Posts ({profile.posts_count || 0})
              </h3>
              {posts.length > 0 && (
                <div className="text-sm text-gray-500">
                  Showing latest posts
                </div>
              )}
            </div>

            {postsLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <UserPostCard
                    key={post.id}
                    post={post}
                    currentUser={currentUser}
                    onDelete={handleDeletePost}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">No posts yet</p>
                <p className="text-gray-400 text-sm mt-2">
                  {currentUser?.username === username
                    ? "Share your first post with the community!"
                    : `${profile.first_name || profile.username} hasn't shared any posts yet`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
