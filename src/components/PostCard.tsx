// import { useState } from 'react';
// import { Heart, MessageCircle, Share, MoreVertical, Trash2 } from 'lucide-react';
// import { formatDate, formatNumber } from '../lib/utils';
// import { useAuthStore } from '../lib/store';
// import { mockPostAPI } from '../lib/api-mock';

// interface PostCardProps {
//   post: {
//     id: string;
//     authorId: string;
//     content: string;
//     mediaUrl: string | null;
//     likeCount: number;
//     commentCount: number;
//     isLiked: boolean;
//     createdAt: string;
//     author?: {
//       username: string;
//       firstName?: string;
//       lastName?: string;
//       avatar: string | null;
//       isVerified?: boolean;
//     };
//   };
//   onUpdate?: (postId: string, updates: any) => void;
//   onDelete?: (postId: string) => void;
// }

// export default function PostCard({ post, onUpdate, onDelete }: PostCardProps) {
//   const [showMenu, setShowMenu] = useState(false);
//   const currentUser = useAuthStore((state) => state.user);
//   const isOwnPost = currentUser?.id === post.authorId;

//   const handleLike = async () => {
//     const updatedPost = await mockPostAPI.toggleLike(post.id);
//     if (updatedPost && onUpdate) {
//       onUpdate(post.id, {
//         isLiked: updatedPost.isLiked,
//         likeCount: updatedPost.likeCount
//       });
//     }
//   };

//   const handleDelete = async () => {
//     if (window.confirm('Are you sure you want to delete this post?')) {
//       await mockPostAPI.deletePost(post.id);
//       if (onDelete) {
//         onDelete(post.id);
//       }
//     }
//   };

//   const author = post.author;
//   const displayName = author
//     ? `${author.firstName || ''} ${author.lastName || ''}`.trim() || author.username
//     : 'Unknown User';

//   return (
//     <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition">
//       <div className="flex items-start justify-between mb-4">
//         <div className="flex items-center gap-3">
//           <img
//             src={author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${author?.username}`}
//             alt={author?.username}
//             className="w-12 h-12 rounded-full"
//           />
//           <div>
//             <div className="flex items-center gap-2">
//               <span className="font-semibold text-gray-900">{displayName}</span>
//               {author?.isVerified && (
//                 <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
//                   <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//               )}
//             </div>
//             <div className="flex items-center gap-2 text-sm text-gray-500">
//               <span>@{author?.username}</span>
//               <span>•</span>
//               <span>{formatDate(post.createdAt)}</span>
//             </div>
//           </div>
//         </div>
//         {isOwnPost && (
//           <div className="relative">
//             <button
//               onClick={() => setShowMenu(!showMenu)}
//               className="p-2 hover:bg-gray-100 rounded-full transition"
//             >
//               <MoreVertical className="w-5 h-5 text-gray-500" />
//             </button>
//             {showMenu && (
//               <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
//                 <button
//                   onClick={handleDelete}
//                   className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition"
//                 >
//                   <Trash2 className="w-4 h-4" />
//                   <span>Delete Post</span>
//                 </button>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       <p className="text-gray-900 mb-4 leading-relaxed">{post.content}</p>

//       {post.mediaUrl && (
//         <img
//           src={post.mediaUrl}
//           alt="Post media"
//           className="w-full rounded-xl mb-4 object-cover max-h-96"
//         />
//       )}

//       <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
//         <button
//           onClick={handleLike}
//           className={`flex items-center gap-2 transition ${
//             post.isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
//           }`}
//         >
//           <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
//           <span className="font-medium">{formatNumber(post.likeCount)}</span>
//         </button>
//         <button className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition">
//           <MessageCircle className="w-5 h-5" />
//           <span className="font-medium">{formatNumber(post.commentCount)}</span>
//         </button>
//         <button className="flex items-center gap-2 text-gray-500 hover:text-green-600 transition ml-auto">
//           <Share className="w-5 h-5" />
//         </button>
//       </div>
//     </div>
//   );
// }


import { useState } from 'react';
import { Heart, MessageCircle, Share, MoreVertical, Trash2 } from 'lucide-react';
import { formatDate, formatNumber } from '../lib/utils';
import { useAuthStore } from '../lib/store';
import { PostAPI } from '../lib/api'; // ✅ Import your real API
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
    };
  };
  onUpdate?: (postId: string, updates: any) => void;
  onDelete?: (postId: string) => void;
}

export default function PostCard({ post, onUpdate, onDelete }: PostCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const currentUser = useAuthStore((state) => state.user);
  const isOwnPost = currentUser?.id === post.authorId;

  // ✅ Use your PostAPI for like/unlike
  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);

    try {
      // Call your API methods
      if (post.isLiked) {
        await PostAPI.unlike(post.id);
      } else {
        await PostAPI.like(post.id);
      }

      // Update local state optimistically
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

  // ✅ Use your PostAPI for delete
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

  const [showComments, setShowComments] = useState(false); // ✅ Add state


  // Handle comment (navigate or open modal)
  const handleComment = () => {
    // TODO: Navigate to post detail or open comment modal
    console.log('Comment on post:', post.id);
    alert('Comment feature coming soon!');
  };

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

        {/* ✅ Comment button with toggle */}
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

      {/* ✅ Comment Section (conditionally rendered) */}
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

