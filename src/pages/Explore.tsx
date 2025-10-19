import { useEffect, useState } from 'react';
import { mockPostAPI } from '../lib/api-mock';
import PostCard from '../components/PostCard';
import Sidebar from '../components/Sidebar';
import { Loader2, Search } from 'lucide-react';

export default function Explore() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadExplorePosts();
  }, []);

  const loadExplorePosts = async () => {
    setLoading(true);
    try {
      const explorePosts = await mockPostAPI.getExplorePosts();
      setPosts(explorePosts);
    } catch (error) {
      console.error('Failed to load explore posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter((post) =>
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author?.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updatePost = (postId: string, updates: any) => {
    setPosts(posts.map((p) => (p.id === postId ? { ...p, ...updates } : p)));
  };

  const removePost = (postId: string) => {
    setPosts(posts.filter((p) => p.id !== postId));
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Explore</h1>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search posts and people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPosts.length === 0 ? (
                <div className="col-span-full text-center py-12 bg-white border border-gray-200 rounded-2xl">
                  <p className="text-gray-500">
                    {searchQuery ? 'No posts found matching your search.' : 'No posts to explore yet.'}
                  </p>
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onUpdate={updatePost}
                    onDelete={removePost}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
