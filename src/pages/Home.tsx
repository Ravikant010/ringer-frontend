// src/pages/Home.tsx
import { useEffect, useState } from 'react';
import { PostAPI } from '../lib/api';
import PostCard from '../components/PostCard';
import Sidebar from '../components/Sidebar';
import { Loader2, RefreshCw } from 'lucide-react';
import { useAuthStore, useNotificationStore } from '../lib/store';

interface Post {
  id: string;
  authorId: string;
  content: string;
  mediaUrl: string | null;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  createdAt: string;
  author?: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar: string | null;
    isVerified?: boolean;
  };
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await PostAPI.getFeed(50); // Load 50 posts
      console.log('Feed response:', response);
      setPosts(response.items || []);
    } catch (err: any) {
      console.error('Failed to load posts:', err);
      setError(err.message || 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await PostAPI.getFeed(50);
      setPosts(response.items || []);
    } catch (err: any) {
      console.error('Failed to refresh:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const updatePost = (postId: string, updates: Partial<Post>) => {
    setPosts(prevPosts =>
      prevPosts.map(p => (p.id === postId ? { ...p, ...updates } : p))
    );
  };

  const removePost = (postId: string) => {
    setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
  };


  const setNotifications = useNotificationStore(state => state.setNotifications);
  const user = useAuthStore(state => state.user);
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    async function fetchNotifications() {
      if (!user || !token) return;

      try {
        const response = await fetch('http://localhost:3007/api/v1/notifications?limit=50', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
          },
        });

        if (!response.ok) {
          console.error('Failed to fetch notifications:', response.status);
          return;
        }

        const data = await response.json();
        if (data?.success && Array.isArray(data.data)) {
          setNotifications(data.data);
        } else {
          console.error('Unexpected notifications format:', data);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    }

    fetchNotifications();
  }, [user, token, setNotifications]);


  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64">
        <div className="max-w-2xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Home Feed</h1>
              <p className="text-gray-600">Latest posts from everyone</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Refresh feed"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600">Loading your feed...</p>
            </div>
          ) : error ? (
            /* Error State */
            <div className="text-center py-12 bg-white border border-red-200 rounded-2xl">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={loadPosts}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : posts.length === 0 ? (
            /* Empty State */
            <div className="text-center py-12 bg-white border border-gray-200 rounded-2xl">
              <p className="text-gray-500 mb-4">No posts yet!</p>
              <p className="text-sm text-gray-400">Be the first to share something.</p>
            </div>
          ) : (
            /* Posts Feed */
            <div className="space-y-6">
              {posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onUpdate={updatePost}
                  onDelete={removePost}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
