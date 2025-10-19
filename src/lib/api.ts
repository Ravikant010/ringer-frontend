

export const API_BASE = {
    auth: 'http://localhost:3001/api/v1/auth',
    users: 'http://localhost:3001/api/v1/users',
    posts: 'http://localhost:3002/api/v1/posts',
    comments: 'http://localhost:3006/api/v1/comments',
};

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

// Post API matching your backend
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

        // Your backend returns: { success: true, data: items[] }
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

// Add to your existing src/lib/api.ts

// ========================================
// COMMENT API
// ========================================
export const CommentAPI = {
  /**
   * Get comments for a post
   */
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

  /**
   * Get replies for a comment
   */
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

  /**
   * Create a comment
   */
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

  /**
   * Like a comment
   */
  async like(commentId: string) {
    const res = await fetch(`${API_BASE.comments}/${commentId}/like`, {
      method: 'POST',
      headers: authHeaders(),
    });

    if (!res.ok) throw new Error('Failed to like comment');
    return res.json();
  },

  /**
   * Unlike a comment
   */
  async unlike(commentId: string) {
    const res = await fetch(`${API_BASE.comments}/${commentId}/like`, {
      method: 'DELETE',
      headers: authHeaders(),
    });

    if (!res.ok) throw new Error('Failed to unlike comment');
    return res.json();
  },

  /**
   * Delete a comment
   */
  async delete(commentId: string) {
    const res = await fetch(`${API_BASE.comments}/${commentId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });

    if (!res.ok) throw new Error('Failed to delete comment');
    return res.json();
  },
};
12