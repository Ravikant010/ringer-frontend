import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  isVerified: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
}

interface Post {
  id: string;
  authorId: string;
  content: string;
  mediaUrl: string | null;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  createdAt: string;
  author?: User;
}

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  userId: string;
  postId: string | null;
  read: boolean;
  content: string;
  createdAt: string;
  user?: User;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

interface PostStore {
  posts: Post[];
  setPosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  updatePost: (postId: string, updates: Partial<Post>) => void;
  removePost: (postId: string) => void;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifications: Notification[]) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
}


interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  isVerified: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  init: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      setUser: (user) => {
        if (user) {
          localStorage.setItem('accessToken', localStorage.getItem('accessToken') || '');
          localStorage.setItem('currentUserId', user.id);
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('currentUserId');
        }
        set({ user, isAuthenticated: !!user });
      },
      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('currentUserId');
        set({ user: null, isAuthenticated: false });
      },
      init: async () => {
        set({ loading: true });
        const token = localStorage.getItem('accessToken');
        if (!token) {
          set({ loading: false, user: null, isAuthenticated: false });
          return;
        }
        try {
          const res = await fetch('http://localhost:3001/api/v1/users/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          if (!res.ok) {
            throw new Error('Token invalid or expired');
          }
          const data = await res.json();
          if (!data?.success || !data?.data) {
            throw new Error('Invalid user data');
          }
          set({ user: data.data, isAuthenticated: true });
        } catch (error) {
          console.error('Auth init failed:', error);
          // Token invalid, logout
          get().logout();
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);


export const usePostStore = create<PostStore>((set) => ({
  posts: [],
  setPosts: (posts) => set({ posts }),
  addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
  updatePost: (postId, updates) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId ? { ...post, ...updates } : post
      )
    })),
  removePost: (postId) =>
    set((state) => ({
      posts: state.posts.filter((post) => post.id !== postId)
    }))
}));

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length
    }),
  markAsRead: (notificationId) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1)
    })),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0
    }))
}));
