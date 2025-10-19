// src/components/CommentSection.tsx
import { useState, useEffect } from 'react';
import { Heart, Reply, Trash2, Send, Loader2 } from 'lucide-react';
import { CommentAPI } from '../lib/api';

interface Author {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
}

interface Comment {
    id: string;
    postId: string;
    userId: string;
    content: string;
    likeCount: number;
    replyCount: number;
    parentCommentId: string | null;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    author?: Author; // ✅ Backend now provides this
}

interface CommentSectionProps {
    postId: string;
    onCommentCountChange?: (count: number) => void;
}

export default function CommentSection({ postId, onCommentCountChange }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');

    const currentUserId = localStorage.getItem('userId');

    useEffect(() => {
        loadComments();
    }, [postId]);

    const loadComments = async () => {
        setLoading(true);
        try {
            const response = await CommentAPI.getByPost(postId, 50);
            setComments(response.items); // ✅ Backend already enriched with author
            if (onCommentCountChange) {
                onCommentCountChange(response.items.length);
            }
        } catch (error) {
            console.error('Failed to load comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || submitting) return;

        setSubmitting(true);
        try {
            const comment = await CommentAPI.create(postId, newComment.trim());
            setComments(prev => [comment, ...prev]); // ✅ Backend returns enriched comment
            setNewComment('');
            if (onCommentCountChange) {
                onCommentCountChange(comments.length + 1);
            }
        } catch (error: any) {
            console.error('Failed to post comment:', error);
            alert(error.message || 'Failed to post comment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitReply = async (parentId: string) => {
        if (!replyContent.trim() || submitting) return;

        setSubmitting(true);
        try {
            const reply = await CommentAPI.create(postId, replyContent.trim(), parentId);
            setComments(prev => [reply, ...prev]); // ✅ Backend returns enriched reply
            setReplyContent('');
            setReplyingTo(null);
        } catch (error: any) {
            console.error('Failed to post reply:', error);
            alert(error.message || 'Failed to post reply');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!window.confirm('Delete this comment?')) return;

        try {
            await CommentAPI.delete(commentId);
            setComments(prev => prev.filter(c => c.id !== commentId));
            if (onCommentCountChange) {
                onCommentCountChange(comments.length - 1);
            }
        } catch (error) {
            console.error('Failed to delete comment:', error);
            alert('Failed to delete comment');
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">
                Comments ({comments.length})
            </h3>

            {/* New Comment Form */}
            <form onSubmit={handleSubmitComment} className="mb-6">
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={submitting}
                    />
                    <button
                        type="submit"
                        disabled={!newComment.trim() || submitting}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {submitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                Post
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Comments List */}
            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                </div>
            ) : comments.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                    No comments yet. Be the first to comment!
                </p>
            ) : (
                <div className="space-y-4">
                    {comments.map((comment) => {
                        // ✅ Use author data from backend
                        const displayName = comment.author
                            ? `${comment.author.firstName || ''} ${comment.author.lastName || ''}`.trim() || comment.author.username
                            : 'Anonymous User';

                        const username = comment.author?.username || 'unknown';
                        const avatarUrl = comment.author?.avatar ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

                        return (
                            <div key={comment.id} className="flex gap-3">
                                <img
                                    src={avatarUrl}
                                    alt={displayName}
                                    className="w-10 h-10 rounded-full"
                                />
                                <div className="flex-1">
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <div>
                                                <span className="font-semibold text-sm text-gray-900">
                                                    {displayName}
                                                </span>
                                                <span className="text-xs text-gray-500 ml-2">
                                                    @{username}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {formatDate(comment.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-gray-800 text-sm">{comment.content}</p>
                                    </div>

                                    {/* Comment Actions */}
                                    <div className="flex items-center gap-4 mt-2 text-sm">
                                        <button className="text-gray-500 hover:text-red-600 flex items-center gap-1">
                                            <Heart className="w-4 h-4" />
                                            <span>{comment.likeCount}</span>
                                        </button>
                                        <button
                                            onClick={() => setReplyingTo(comment.id)}
                                            className="text-gray-500 hover:text-blue-600 flex items-center gap-1"
                                        >
                                            <Reply className="w-4 h-4" />
                                            Reply
                                        </button>
                                        {currentUserId === comment.userId && (
                                            <button
                                                onClick={() => handleDeleteComment(comment.id)}
                                                className="text-gray-500 hover:text-red-600 flex items-center gap-1"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete
                                            </button>
                                        )}
                                    </div>

                                    {/* Reply Form */}
                                    {replyingTo === comment.id && (
                                        <div className="mt-3 flex gap-2">
                                            <input
                                                type="text"
                                                value={replyContent}
                                                onChange={(e) => setReplyContent(e.target.value)}
                                                placeholder="Write a reply..."
                                                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => handleSubmitReply(comment.id)}
                                                disabled={!replyContent.trim() || submitting}
                                                className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                Reply
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setReplyingTo(null);
                                                    setReplyContent('');
                                                }}
                                                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
