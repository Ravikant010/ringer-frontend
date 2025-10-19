import { useEffect, useState } from 'react';
import { useAuthStore } from '../lib/store';
import Sidebar from '../components/Sidebar';
import PostCard from '../components/PostCard';
import { MapPin, Link as LinkIcon, Calendar, Loader2 } from 'lucide-react';
import { formatNumber } from '../lib/utils';

export default function Profile() {
  const user = useAuthStore((state) => state.user);
  const [profileData, setProfileData] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Not authenticated');
      }

      // ✅ STEP 1: Get current user ID from /me endpoint
      const meRes = await fetch('http://localhost:3001/api/v1/users/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!meRes.ok) {
        throw new Error(`Failed to get user info: ${meRes.status}`);
      }

      const meData = await meRes.json();
      console.log('Me response:', meData);

      if (!meData?.success || !meData?.data?.id) {
        throw new Error('Invalid user data');
      }

      const userId = meData.data.id;

      // ✅ STEP 2: Get user profile - FIXED ROUTE
      // Changed from /profile/:userId to /:userId (matches backend)
      const profileRes = await fetch(`http://localhost:3001/api/v1/users/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!profileRes.ok) {
        throw new Error(`Failed to load profile: ${profileRes.status}`);
      }

      const profileJson = await profileRes.json();
      console.log('Profile response:', profileJson);

      if (!profileJson?.success || !profileJson?.data) {
        throw new Error('Profile not available');
      }

      // ✅ STEP 3: Get user's posts
      const postsRes = await fetch(`http://localhost:3002/api/v1/posts?authorId=${userId}&limit=50`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!postsRes.ok) {
        throw new Error(`Failed to load posts: ${postsRes.status}`);
      }

      const postsJson = await postsRes.json();
      console.log('Posts response:', postsJson);

      // ✅ Normalize posts response
      let postsArray = [];
      if (Array.isArray(postsJson?.data)) {
        postsArray = postsJson.data;
      } else if (Array.isArray(postsJson?.items)) {
        postsArray = postsJson.items;
      } else if (postsJson?.data && Array.isArray(postsJson.data.items)) {
        postsArray = postsJson.data.items;
      }

      setProfileData(profileJson.data);
      setPosts(postsArray);
    } catch (error: any) {
      console.error('Failed to load profile:', error);
      alert(error.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const updatePost = (postId: string, updates: any) => {
    setPosts(posts.map((p) => (p.id === postId ? { ...p, ...updates } : p)));
  };

  const removePost = (postId: string) => {
    setPosts(posts.filter((p) => p.id !== postId));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 ml-64 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </main>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 ml-64 flex items-center justify-center">
          <p className="text-gray-500">Profile not found</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-8">
            <div className="h-48 bg-gradient-to-r from-blue-400 to-blue-600"></div>
            <div className="px-8 pb-8">
              <div className="flex items-end justify-between -mt-16 mb-6">
                <img
                  src={profileData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileData.username}`}
                  alt={profileData.username}
                  className="w-32 h-32 rounded-full border-4 border-white"
                />
                <button className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition">
                  Edit Profile
                </button>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profileData.firstName && profileData.lastName
                      ? `${profileData.firstName} ${profileData.lastName}`
                      : profileData.username}
                  </h1>
                  {profileData.isVerified && (
                    <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <p className="text-gray-500">@{profileData.username}</p>
              </div>

              {profileData.bio && (
                <p className="text-gray-700 mb-4">{profileData.bio}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
                {profileData.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{profileData.location}</span>
                  </div>
                )}
                {profileData.website && (
                  <div className="flex items-center gap-1">
                    <LinkIcon className="w-4 h-4" />
                    <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {profileData.website}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(profileData.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </div>
              </div>

              <div className="flex gap-6 text-sm">
                <div>
                  <span className="font-bold text-gray-900">{formatNumber(profileData.followingCount || 0)}</span>
                  <span className="text-gray-600 ml-1">Following</span>
                </div>
                <div>
                  <span className="font-bold text-gray-900">{formatNumber(profileData.followerCount || 0)}</span>
                  <span className="text-gray-600 ml-1">Followers</span>
                </div>
                <div>
                  <span className="font-bold text-gray-900">{formatNumber(profileData.postCount || posts.length)}</span>
                  <span className="text-gray-600 ml-1">Posts</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Posts</h2>
          </div>

          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className="text-center py-12 bg-white border border-gray-200 rounded-2xl">
                <p className="text-gray-500">No posts yet</p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={{ ...post, author: profileData }}
                  onUpdate={updatePost}
                  onDelete={removePost}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
