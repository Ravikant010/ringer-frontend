// export const API_BASE = {
//   auth: 'http://localhost:3001/api/v1/auth',
//   users: 'http://localhost:3001/api/v1/users', // user service routes
//   social: 'http://localhost:3004/api/v1', // social service routes (follow/unfollow, etc)
//   posts: 'http://localhost:3002/api/v1/posts',
//   comments: 'http://localhost:3006/api/v1/comments',
//   messages: 'http://localhost:3008/api/v1', // Add this
// };


// function getAuthToken(): string | null {
//   return localStorage.getItem('accessToken');
// }

// export function authHeaders(): HeadersInit {
//   const token = getAuthToken();
//   const headers: HeadersInit = {
//     'Content-Type': 'application/json',
//   };
//   if (token) {
//     headers.Authorization = `Bearer ${token}`;
//   }
//   return headers;
// }

// // Post API matching your backend
// export const PostAPI = {
//   async getFeed(limit = 20, cursor?: string) {
//     const url = new URL(`${API_BASE.posts}/feed`);
//     url.searchParams.set('limit', String(limit));
//     if (cursor) url.searchParams.set('cursor', cursor);

//     const res = await fetch(url.toString(), {
//       headers: authHeaders(),
//     });

//     if (!res.ok) {
//       throw new Error(`Failed to fetch feed: ${res.status}`);
//     }

//     const response = await res.json();

//     // Your backend returns: { success: true, data: items[] }
//     return {
//       items: response.data || [],
//       nextCursor: response.pagination?.nextCursor,
//       hasMore: response.pagination?.hasMore || false,
//     };
//   },

//   async create(content: string, mediaUrl?: string, visibility = 'public') {
//     const res = await fetch(API_BASE.posts, {
//       method: 'POST',
//       headers: authHeaders(),
//       body: JSON.stringify({ content, mediaUrl, visibility }),
//     });

//     if (!res.ok) {
//       const error = await res.json();
//       throw new Error(error.error || 'Failed to create post');
//     }

//     const response = await res.json();
//     return response.data;
//   },

//   async like(postId: string) {
//     const res = await fetch(`${API_BASE.posts}/${postId}/like`, {
//       method: 'POST',
//       headers: authHeaders(),
//     });

//     if (!res.ok) {
//       throw new Error('Failed to like post');
//     }

//     return res.json();
//   },

//   async unlike(postId: string) {
//     const res = await fetch(`${API_BASE.posts}/${postId}/like`, {
//       method: 'DELETE',
//       headers: authHeaders(),
//     });

//     if (!res.ok) {
//       throw new Error('Failed to unlike post');
//     }

//     return res.json();
//   },

//   async delete(postId: string) {
//     const res = await fetch(`${API_BASE.posts}/${postId}`, {
//       method: 'DELETE',
//       headers: authHeaders(),
//     });

//     if (!res.ok) {
//       throw new Error('Failed to delete post');
//     }

//     return res.json();
//   },
// };

// // Auth API
// export const AuthAPI = {
//   async login(email: string, password: string) {
//     const res = await fetch(`${API_BASE.auth}/login`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ email, password }),
//     });

//     if (!res.ok) {
//       const error = await res.json();
//       throw new Error(error.error || 'Login failed');
//     }

//     return res.json();
//   },

//   async register(data: {
//     username: string;
//     email: string;
//     password: string;
//     firstName: string;
//     lastName: string;
//   }) {
//     const res = await fetch(`${API_BASE.auth}/register`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(data),
//     });

//     if (!res.ok) {
//       const error = await res.json();
//       throw new Error(error.error || 'Registration failed');
//     }

//     return res.json();
//   },
// };

// // Comment API
// export const CommentAPI = {
//   async getByPost(postId: string, limit = 20, cursor?: string) {
//     const url = new URL(`${API_BASE.comments}`);
//     url.searchParams.set('postId', postId);
//     url.searchParams.set('limit', String(limit));
//     if (cursor) url.searchParams.set('cursor', cursor);

//     const res = await fetch(url.toString(), {
//       headers: authHeaders(),
//     });

//     if (!res.ok) throw new Error('Failed to fetch comments');

//     const response = await res.json();
//     return {
//       items: response.data || [],
//       nextCursor: response.pagination?.nextCursor,
//       hasMore: response.pagination?.hasMore || false,
//     };
//   },

//   async getReplies(parentId: string, limit = 20, cursor?: string) {
//     const url = new URL(`${API_BASE.comments}`);
//     url.searchParams.set('parentId', parentId);
//     url.searchParams.set('limit', String(limit));
//     if (cursor) url.searchParams.set('cursor', cursor);

//     const res = await fetch(url.toString(), {
//       headers: authHeaders(),
//     });

//     if (!res.ok) throw new Error('Failed to fetch replies');

//     const response = await res.json();
//     return {
//       items: response.data || [],
//       nextCursor: response.pagination?.nextCursor,
//       hasMore: response.pagination?.hasMore || false,
//     };
//   },

//   async create(postId: string, content: string, parentId?: string) {
//     const res = await fetch(API_BASE.comments, {
//       method: 'POST',
//       headers: authHeaders(),
//       body: JSON.stringify({ postId, content, parentId }),
//     });

//     if (!res.ok) {
//       const error = await res.json();
//       throw new Error(error.error || 'Failed to create comment');
//     }

//     const response = await res.json();
//     return response.data;
//   },

//   async like(commentId: string) {
//     const res = await fetch(`${API_BASE.comments}/${commentId}/like`, {
//       method: 'POST',
//       headers: authHeaders(),
//     });

//     if (!res.ok) throw new Error('Failed to like comment');
//     return res.json();
//   },

//   async unlike(commentId: string) {
//     const res = await fetch(`${API_BASE.comments}/${commentId}/like`, {
//       method: 'DELETE',
//       headers: authHeaders(),
//     });

//     if (!res.ok) throw new Error('Failed to unlike comment');
//     return res.json();
//   },

//   async delete(commentId: string) {
//     const res = await fetch(`${API_BASE.comments}/${commentId}`, {
//       method: 'DELETE',
//       headers: authHeaders(),
//     });

//     if (!res.ok) throw new Error('Failed to delete comment');
//     return res.json();
//   },
// };

// // User API for follow/unfollow as per your backend
// export const UserAPI = {
//   async follow(userId: string) {
//     const res = await fetch(`${API_BASE.social}/follow`, {
//       method: 'POST',
//       headers: authHeaders(),
//       body: JSON.stringify({ targetUserId: userId }),
//     });
//     if (!res.ok) {
//       const error = await res.json().catch(() => ({ error: 'Failed to follow user' }));
//       throw new Error(error.error);
//     }
//     return res.json();
//   },

//   async unfollow(userId: string) {
//     const res = await fetch(`${API_BASE.social}/follow/${userId}`, {
//       method: 'DELETE',
//       headers: authHeaders(),
//     });
//     if (!res.ok) {
//       const error = await res.json().catch(() => ({ error: 'Failed to unfollow user' }));
//       throw new Error(error.error);
//     }
//     return res.json();
//   },

//   async isFollowing(userId: string) {
//     const res = await fetch(`${API_BASE.social}/follow/${userId}`, {
//       method: 'GET',
//       headers: authHeaders(),
//     });
//     if (!res.ok) {
//       const error = await res.json().catch(() => ({ error: 'Failed to check follow status' }));
//       throw new Error(error.error);
//     }
//     const data = await res.json();
//     // Assume API returns { isFollowing: boolean }
//     return data;
//   },


//   async getFollowing(userId: string) {
//     const res = await fetch(`${API_BASE.social}/following/${userId}`, {
//       method: 'GET',
//       headers: authHeaders(),
//     });
//     if (!res.ok) {
//       throw new Error('Failed to fetch following users');
//     }
//     return res.json();
//   },
// };

// // Add new MessageAPI
// export const MessageAPI = {
//   async sendMessage(recipientId: string, content: string) {
//     const res = await fetch(`${API_BASE.messages}/messages`, {
//       method: 'POST',
//       headers: authHeaders(),
//       body: JSON.stringify({ recipientId, content }),
//     });
//     if (!res.ok) {
//       const error = await res.json().catch(() => ({ error: 'Failed to send message' }));
//       throw new Error(error.error);
//     }
//     return res.json();
//   },

//   async getConversationWithUser(otherUserId: string) {
//     const res = await fetch(`${API_BASE.messages}/conversations/user/${otherUserId}`, {
//       method: 'GET',
//       headers: authHeaders(),
//     });
//     if (!res.ok) throw new Error('Failed to fetch conversation');
//     return res.json();
//   },

//   async getMessages(conversationId: string) {
//     const res = await fetch(`${API_BASE.messages}/conversations/${conversationId}/messages`, {
//       method: 'GET',
//       headers: authHeaders(),
//     });
//     if (!res.ok) throw new Error('Failed to fetch messages');
//     return res.json();
//   },

//   async markAsRead(conversationId: string) {
//     const res = await fetch(`${API_BASE.messages}/conversations/${conversationId}/read`, {
//       method: 'PATCH',
//       headers: authHeaders(),
//     });
//     if (!res.ok) throw new Error('Failed to mark as read');
//     return res.json();
//   },



// };


// src/lib/api.ts
import io, { Socket } from 'socket.io-client';

export const API_BASE = {
  auth: 'http://localhost:3001/api/v1/auth',
  users: 'http://localhost:3001/api/v1/users',
  social: 'http://localhost:3004/api/v1',
  posts: 'http://localhost:3002/api/v1/posts',
  comments: 'http://localhost:3006/api/v1/comments',
  chat: 'http://localhost:3003/api/v1', // Chat service with Socket.IO
};

export const SOCKET_URL = 'http://localhost:3003'; // Socket.IO server

// Socket instance
let socket: Socket | null = null;

function getAuthToken(): string | null {
  return localStorage.getItem('accessToken');
}

export function authHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

// Post API
export const PostAPI = {
  async getFeed(limit = 20, cursor?: string) {
    const url = new URL(`${API_BASE.posts}/feed`);
    url.searchParams.set('limit', String(limit));
    if (cursor) url.searchParams.set('cursor', cursor);

    const res = await fetch(url.toString(), {
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch feed: ${res.status}`);
    }

    const response = await res.json();

    return {
      items: response.data || [],
      nextCursor: response.pagination?.nextCursor,
      hasMore: response.pagination?.hasMore || false,
    };
  },

  async create(content: string, mediaUrl?: string, visibility = 'public') {
    const res = await fetch(API_BASE.posts, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ content, mediaUrl, visibility }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to create post');
    }

    const response = await res.json();
    return response.data;
  },

  async like(postId: string) {
    const res = await fetch(`${API_BASE.posts}/${postId}/like`, {
      method: 'POST',
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error('Failed to like post');
    }

    return res.json();
  },

  async unlike(postId: string) {
    const res = await fetch(`${API_BASE.posts}/${postId}/like`, {
      method: 'DELETE',
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error('Failed to unlike post');
    }

    return res.json();
  },

  async delete(postId: string) {
    const res = await fetch(`${API_BASE.posts}/${postId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error('Failed to delete post');
    }

    return res.json();
  },
};

// Auth API
export const AuthAPI = {
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE.auth}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Login failed');
    }

    return res.json();
  },

  async register(data: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    const res = await fetch(`${API_BASE.auth}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Registration failed');
    }

    return res.json();
  },
};

// Comment API
export const CommentAPI = {
  async getByPost(postId: string, limit = 20, cursor?: string) {
    const url = new URL(`${API_BASE.comments}`);
    url.searchParams.set('postId', postId);
    url.searchParams.set('limit', String(limit));
    if (cursor) url.searchParams.set('cursor', cursor);

    const res = await fetch(url.toString(), {
      headers: authHeaders(),
    });

    if (!res.ok) throw new Error('Failed to fetch comments');

    const response = await res.json();
    return {
      items: response.data || [],
      nextCursor: response.pagination?.nextCursor,
      hasMore: response.pagination?.hasMore || false,
    };
  },

  async getReplies(parentId: string, limit = 20, cursor?: string) {
    const url = new URL(`${API_BASE.comments}`);
    url.searchParams.set('parentId', parentId);
    url.searchParams.set('limit', String(limit));
    if (cursor) url.searchParams.set('cursor', cursor);

    const res = await fetch(url.toString(), {
      headers: authHeaders(),
    });

    if (!res.ok) throw new Error('Failed to fetch replies');

    const response = await res.json();
    return {
      items: response.data || [],
      nextCursor: response.pagination?.nextCursor,
      hasMore: response.pagination?.hasMore || false,
    };
  },

  async create(postId: string, content: string, parentId?: string) {
    const res = await fetch(API_BASE.comments, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ postId, content, parentId }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to create comment');
    }

    const response = await res.json();
    return response.data;
  },

  async like(commentId: string) {
    const res = await fetch(`${API_BASE.comments}/${commentId}/like`, {
      method: 'POST',
      headers: authHeaders(),
    });

    if (!res.ok) throw new Error('Failed to like comment');
    return res.json();
  },

  async unlike(commentId: string) {
    const res = await fetch(`${API_BASE.comments}/${commentId}/like`, {
      method: 'DELETE',
      headers: authHeaders(),
    });

    if (!res.ok) throw new Error('Failed to unlike comment');
    return res.json();
  },

  async delete(commentId: string) {
    const res = await fetch(`${API_BASE.comments}/${commentId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });

    if (!res.ok) throw new Error('Failed to delete comment');
    return res.json();
  },
};

// User API
export const UserAPI = {
  async follow(userId: string) {
    const res = await fetch(`${API_BASE.social}/follow`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ targetUserId: userId }),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Failed to follow user' }));
      throw new Error(error.error);
    }
    return res.json();
  },

  async unfollow(userId: string) {
    const res = await fetch(`${API_BASE.social}/follow/${userId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Failed to unfollow user' }));
      throw new Error(error.error);
    }
    return res.json();
  },

  async isFollowing(userId: string) {
    const res = await fetch(`${API_BASE.social}/follow/${userId}`, {
      method: 'GET',
      headers: authHeaders(),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Failed to check follow status' }));
      throw new Error(error.error);
    }
    return res.json();
  },

  async getFollowing(userId: string) {
    const res = await fetch(`${API_BASE.social}/following/${userId}`, {
      method: 'GET',
      headers: authHeaders(),
    });
    if (!res.ok) {
      throw new Error('Failed to fetch following users');
    }
    return res.json();
  },
};

// Chat API with Socket.IO Real-Time Support
export const ChatAPI = {
  // Socket.IO Connection Management
  connectSocket(token: string): Socket {
    if (socket?.connected) return socket;

    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket?.id);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
    });

    return socket;
  },

  disconnectSocket() {
    if (socket) {
      socket.disconnect();
      socket = null;
      console.log('Socket disconnected');
    }
  },

  getSocket() {
    return socket;
  },

  // REST API Methods
  async createOrGetRoom(participantIds: string[]) {
    const res = await fetch(`${API_BASE.chat}/rooms`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ participantIds }),
    });
    if (!res.ok) throw new Error('Failed to create room');
    return res.json();
  },

  async getUserRooms() {
    const res = await fetch(`${API_BASE.chat}/rooms`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch rooms');
    return res.json();
  },

  async getRoomMessages(roomId: string, limit = 50, offset = 0) {
    const url = new URL(`${API_BASE.chat}/rooms/${roomId}/messages`);
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('offset', String(offset));

    const res = await fetch(url.toString(), {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch messages');
    return res.json();
  },

  async sendMessage(roomId: string, content: string) {
    const res = await fetch(`${API_BASE.chat}/rooms/${roomId}/messages`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
  },

  // Socket.IO Event Helpers
  joinRoom(roomId: string) {
    socket?.emit('join_room', roomId);
    console.log('📥 Joined room:', roomId);
  },

  leaveRoom(roomId: string) {
    socket?.emit('leave_room', roomId);
    console.log('📤 Left room:', roomId);
  },

  onNewMessage(callback: (message: any) => void) {
    socket?.on('new_message', callback);
  },

  onTyping(callback: (data: { userId: string; roomId: string }) => void) {
    socket?.on('user_typing', callback);
  },

  onUserOnline(callback: (userId: string) => void) {
    socket?.on('user_online', callback);
  },

  onUserOffline(callback: (userId: string) => void) {
    socket?.on('user_offline', callback);
  },

  emitTyping(roomId: string) {
    socket?.emit('typing', roomId);
  },

  offNewMessage() {
    socket?.off('new_message');
  },

  offTyping() {
    socket?.off('user_typing');
  },

  offUserOnline() {
    socket?.off('user_online');
  },

  offUserOffline() {
    socket?.off('user_offline');
  },
};
