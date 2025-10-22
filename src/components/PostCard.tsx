import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share, MoreVertical, Trash2 } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { useAuthStore } from '../lib/store';
import { PostAPI, UserAPI } from '../lib/api'; // Assuming UserAPI for follow/unfollow
import CommentSection from './comment-section';

interface PostCardProps {
  post: {
    id: string;
    authorId: string;
    content: string;
    mediaUrl: string | null;
    likeCount: number;
    commentCount: number;
    isLiked: boolean;
    createdAt: string;
    author?: {
      username: string;
      firstName?: string;
      lastName?: string;
      avatar: string | null;
      isVerified?: boolean;
      isFollowed?: boolean;
    };
  };
  onUpdate?: (postId: string, updates: any) => void;
  onDelete?: (postId: string) => void;
}

export default function PostCard({ post, onUpdate, onDelete }: PostCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);
  const currentUser = useAuthStore((state) => state.user);
  const isOwnPost = currentUser?.id === post.authorId;

  // Fetch initial following status on mount
  useEffect(() => {
    async function fetchFollowingStatus() {
      if (!post.authorId || isOwnPost) return;
      try {
        const res = await UserAPI.isFollowing(post.authorId);
        setIsFollowing(res.data.isFollowing);
      } catch (err) {
        console.error('Failed to fetch following status:', err);
      }
    }
    fetchFollowingStatus();
  }, [post.authorId, isOwnPost]);

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      if (post.isLiked) {
        await PostAPI.unlike(post.id);
      } else {
        await PostAPI.like(post.id);
      }
      if (onUpdate) {
        onUpdate(post.id, {
          isLiked: !post.isLiked,
          likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1,
        });
      }
    } catch (error: any) {
      console.error('Failed to toggle like:', error);
      alert(error.message || 'Failed to toggle like');
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }
    try {
      await PostAPI.delete(post.id);
      if (onDelete) {
        onDelete(post.id);
      }
      alert('Post deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete post:', error);
      alert(error.message || 'Failed to delete post');
    }
  };

  // Follow/unfollow toggle handler, updated with backend response
  const toggleFollow = async () => {
    if (isFollowingLoading) return;
    setIsFollowingLoading(true);

    try {
      // If currently following, call unfollow, else call follow
      const res = isFollowing
        ? await UserAPI.unfollow(post.authorId)
        : await UserAPI.follow(post.authorId);

      // Update local state with backend confirmed status
      if (res?.data?.isFollowing !== undefined) {
        setIsFollowing(res.data.isFollowing);
      } else {
        // If backend doesn't return state, toggle manually (fallback)
        setIsFollowing(!isFollowing);
      }
    } catch (error: any) {
      console.error('Failed to toggle follow:', error);
      alert(error.message || 'Failed to toggle follow');
    } finally {
      setIsFollowingLoading(false);
    }
  };


  const [showComments, setShowComments] = useState(false);

  const author = post.author;
  const displayName = author
    ? `${author.firstName || ''} ${author.lastName || ''}`.trim() || author.username
    : 'Unknown User';

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <img
            src={
              author?.avatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${author?.username}`
            }
            alt={author?.username}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{displayName}</span>
              {author?.isVerified && (
                <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>@{author?.username}</span>
              <span>•</span>
              <span>{formatDate(post.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isOwnPost && (
            <button
              onClick={toggleFollow}
              disabled={isFollowingLoading}
              className={`px-3 py-1 rounded-full text-sm font-semibold transition
                ${isFollowing ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}

          {isOwnPost && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <MoreVertical className="w-5 h-5 text-gray-500" />
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Post</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <p className="text-gray-900 mb-4 leading-relaxed whitespace-pre-wrap">{post.content}</p>

      {post.mediaUrl && (
        <img
          src={post.mediaUrl}
          alt="Post media"
          className="w-full rounded-xl mb-4 object-cover max-h-96"
        />
      )}

      <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`flex items-center gap-2 transition-colors ${post.isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
            }`}
        >
          <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
          <span className="font-medium">{post.likeCount}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium">{post.commentCount}</span>
        </button>

        <button className="flex items-center gap-2 text-gray-500 hover:text-green-600 transition-colors ml-auto">
          <Share className="w-5 h-5" />
        </button>
      </div>

      {showComments && (
        <CommentSection
          postId={post.id}
          onCommentCountChange={(count) => {
            if (onUpdate) {
              onUpdate(post.id, { commentCount: count });
            }
          }}
        />
      )}
    </div>
  );
}
