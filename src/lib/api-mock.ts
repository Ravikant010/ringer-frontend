interface User {
  id: string;
  username: string;
  email: string;
  password: string;
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
  createdAt: string;
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
}

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  userId: string;
  postId: string | null;
  read: boolean;
  content: string;
  createdAt: string;
}

let usersData: User[] = [];
let postsData: Post[] = [];
let notificationsData: Notification[] = [];

async function loadData() {
  if (usersData.length === 0) {
    const [users, posts, notifications] = await Promise.all([
      fetch('/data/users.json').then(r => r.json()),
      fetch('/data/posts.json').then(r => r.json()),
      fetch('/data/notifications.json').then(r => r.json())
    ]);
    usersData = users.users;
    postsData = posts.posts;
    notificationsData = notifications.notifications;
  }
}

export const mockAuthAPI = {
  login: async (username: string, password: string) => {
    await loadData();
    const user = usersData.find(u => u.username === username && u.password === password);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token: 'mock-token-' + user.id };
  },

  register: async (data: { username: string; email: string; password: string; firstName?: string; lastName?: string }) => {
    await loadData();
    const existing = usersData.find(u => u.username === data.username || u.email === data.email);
    if (existing) {
      throw new Error('User already exists');
    }
    const newUser: User = {
      id: String(usersData.length + 1),
      username: data.username,
      email: data.email,
      password: data.password,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
      bio: null,
      location: null,
      website: null,
      isVerified: false,
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      createdAt: new Date().toISOString()
    };
    usersData.push(newUser);
    const { password: _, ...userWithoutPassword } = newUser;
    return { user: userWithoutPassword, token: 'mock-token-' + newUser.id };
  }
};

export const mockPostAPI = {
  getFeed: async () => {
    await loadData();
    return postsData.map(post => ({
      ...post,
      author: usersData.find(u => u.id === post.authorId)
    }));
  },

  getExplorePosts: async () => {
    await loadData();
    return postsData.map(post => ({
      ...post,
      author: usersData.find(u => u.id === post.authorId)
    }));
  },

  createPost: async (content: string, mediaUrl?: string) => {
    await loadData();
    const currentUserId = localStorage.getItem('currentUserId') || '1';
    const newPost: Post = {
      id: String(postsData.length + 1),
      authorId: currentUserId,
      content,
      mediaUrl: mediaUrl || null,
      likeCount: 0,
      commentCount: 0,
      isLiked: false,
      createdAt: new Date().toISOString()
    };
    postsData.unshift(newPost);
    return {
      ...newPost,
      author: usersData.find(u => u.id === currentUserId)
    };
  },

  toggleLike: async (postId: string) => {
    await loadData();
    const post = postsData.find(p => p.id === postId);
    if (post) {
      post.isLiked = !post.isLiked;
      post.likeCount += post.isLiked ? 1 : -1;
    }
    return post;
  },

  deletePost: async (postId: string) => {
    await loadData();
    const index = postsData.findIndex(p => p.id === postId);
    if (index > -1) {
      postsData.splice(index, 1);
    }
  }
};

export const mockUserAPI = {
  getProfile: async (userId: string) => {
    await loadData();
    const user = usersData.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    const { password: _, ...userWithoutPassword } = user;
    const userPosts = postsData.filter(p => p.authorId === userId);
    return {
      ...userWithoutPassword,
      posts: userPosts
    };
  },

  getCurrentUser: async () => {
    await loadData();
    const userId = localStorage.getItem('currentUserId') || '1';
    const user = usersData.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
};

export const mockNotificationAPI = {
  getNotifications: async () => {
    await loadData();
    return notificationsData.map(notif => ({
      ...notif,
      user: usersData.find(u => u.id === notif.userId)
    }));
  },

  markAsRead: async (notificationId: string) => {
    await loadData();
    const notif = notificationsData.find(n => n.id === notificationId);
    if (notif) {
      notif.read = true;
    }
  },

  markAllAsRead: async () => {
    await loadData();
    notificationsData.forEach(n => n.read = true);
  }
};
