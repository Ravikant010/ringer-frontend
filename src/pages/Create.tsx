// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { mockPostAPI } from '../lib/api-mock';
// import { usePostStore, useAuthStore } from '../lib/store';
// import Sidebar from '../components/Sidebar';
// import { Image, Loader2 } from 'lucide-react';

// export default function Create() {
//   const [content, setContent] = useState('');
//   const [mediaUrl, setMediaUrl] = useState('');
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();
//   const addPost = usePostStore((state) => state.addPost);
//   const user = useAuthStore((state) => state.user);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!content.trim()) return;

//     setLoading(true);
//     try {
//       const newPost = await mockPostAPI.createPost(content, mediaUrl || undefined);
//       addPost(newPost);
//       navigate('/home');
//     } catch (error) {
//       console.error('Failed to create post:', error);
//       alert('Failed to create post');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const suggestedImages = [
//     'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
//     'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
//     'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800',
//     'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800'
//   ];

//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       <Sidebar />
//       <main className="flex-1 ml-64">
//         <div className="max-w-2xl mx-auto px-6 py-8">
//           <div className="mb-8">
//             <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Post</h1>
//             <p className="text-gray-600">Share your thoughts with the world</p>
//           </div>

//           <div className="bg-white border border-gray-200 rounded-2xl p-6">
//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div className="flex items-start gap-4">
//                 <img
//                   src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
//                   alt={user?.username}
//                   className="w-12 h-12 rounded-full flex-shrink-0"
//                 />
//                 <textarea
//                   value={content}
//                   onChange={(e) => setContent(e.target.value)}
//                   placeholder="What's on your mind?"
//                   className="flex-1 min-h-[150px] p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   <Image className="w-4 h-4 inline mr-2" />
//                   Add Image URL (optional)
//                 </label>
//                 <input
//                   type="url"
//                   value={mediaUrl}
//                   onChange={(e) => setMediaUrl(e.target.value)}
//                   placeholder="https://example.com/image.jpg"
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//                 />
//                 <div className="mt-4">
//                   <p className="text-sm text-gray-600 mb-2">Or choose from these:</p>
//                   <div className="grid grid-cols-4 gap-2">
//                     {suggestedImages.map((url, index) => (
//                       <button
//                         key={index}
//                         type="button"
//                         onClick={() => setMediaUrl(url)}
//                         className={`rounded-lg overflow-hidden border-2 transition ${
//                           mediaUrl === url ? 'border-blue-600' : 'border-gray-200 hover:border-gray-300'
//                         }`}
//                       >
//                         <img src={url} alt={`Option ${index + 1}`} className="w-full h-20 object-cover" />
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               </div>

//               {mediaUrl && (
//                 <div className="rounded-xl overflow-hidden border border-gray-200">
//                   <img src={mediaUrl} alt="Preview" className="w-full max-h-96 object-cover" />
//                 </div>
//               )}

//               <div className="flex gap-3 pt-4 border-t border-gray-200">
//                 <button
//                   type="button"
//                   onClick={() => navigate('/home')}
//                   className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={loading || !content.trim()}
//                   className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//                 >
//                   {loading && <Loader2 className="w-5 h-5 animate-spin" />}
//                   {loading ? 'Posting...' : 'Post'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }


import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePostStore, useAuthStore } from '../lib/store';
import Sidebar from '../components/Sidebar';
import { Image, Loader2, X, Upload } from 'lucide-react';

export default function Create() {
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const addPost = usePostStore((state) => state.addPost);
  const user = useAuthStore((state) => state.user);

  // ✅ Fetch current user data
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const res = await fetch('http://localhost:3001/api/v1/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          // Update auth store if needed
          console.log('Current user:', data.data || data);
        }
      } catch (error) {
        console.error('Failed to fetch current user:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  // ✅ Handle file upload to media service
  const handleFileUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('accessToken');
    const res = await fetch('http://localhost:3005/api/v1/media/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to upload media');
    }

    const data = await res.json();
    return data.data?.url || data.url;
  };

  // ✅ Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    const isUnder10MB = file.size <= 10 * 1024 * 1024;

    if (!isImage && !isVideo) {
      alert('Please upload images or videos only.');
      return;
    }

    if (!isUnder10MB) {
      alert('File size must be under 10MB.');
      return;
    }

    // Create preview
    setUploadedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setMediaUrl(''); // Clear URL input if file is uploaded
  };

  // ✅ Remove uploaded file
  const removeUploadedFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setUploadedFile(null);
    setPreviewUrl('');
  };

  // ✅ Handle post submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      alert('Please add some content to your post.');
      return;
    }

    if (content.length > 5000) {
      alert('Post content must be under 5000 characters.');
      return;
    }

    setLoading(true);

    try {
      let finalMediaUrl = mediaUrl;

      // Upload file if exists
      if (uploadedFile) {
        setUploading(true);
        try {
          finalMediaUrl = await handleFileUpload(uploadedFile);
        } catch (uploadError: any) {
          console.error('Media upload failed:', uploadError);
          alert(uploadError.message || 'Failed to upload media. Posting without media.');
          finalMediaUrl = '';
        } finally {
          setUploading(false);
        }
      }

      // ✅ Create post via backend API
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:3002/api/v1/posts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          mediaUrl: finalMediaUrl || undefined,
          visibility: 'public',
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create post');
      }

      const newPost = await res.json();
      console.log('Post created:', newPost);

      // Add to store (optional - for immediate UI update)
      addPost(newPost.data || newPost);

      alert('Post created successfully! 🎉');
      navigate('/home');
    } catch (error: any) {
      console.error('Failed to create post:', error);
      alert(error.message || 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const suggestedImages = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800',
    'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
  ];

  const remainingChars = 5000 - content.length;
  const isOverLimit = remainingChars < 0;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Post</h1>
            <p className="text-gray-600">Share your thoughts with the world</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-start gap-4">
                <img
                  src={
                    user?.avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`
                  }
                  alt={user?.username}
                  className="w-12 h-12 rounded-full flex-shrink-0"
                />
                <div className="flex-1">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full min-h-[150px] p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition"
                    required
                  />
                  {/* Character Count */}
                  <div className="flex justify-end mt-2">
                    <span
                      className={`text-sm ${isOverLimit
                        ? 'text-red-500 font-semibold'
                        : remainingChars < 100
                          ? 'text-orange-500'
                          : 'text-gray-500'
                        }`}
                    >
                      {remainingChars} characters remaining
                    </span>
                  </div>
                </div>
              </div>

              {/* File Upload Section */}


              {/* Preview URL Image */}
              {mediaUrl && !uploadedFile && (
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <img
                    src={mediaUrl}
                    alt="Preview"
                    className="w-full max-h-96 object-cover"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/home')}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || uploading || !content.trim() || isOverLimit}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading || uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {uploading ? 'Uploading...' : 'Posting...'}
                    </>
                  ) : (
                    'Post'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}




// <div>
//   <label className="block text-sm font-medium text-gray-700 mb-2">
//     <Upload className="w-4 h-4 inline mr-2" />
//     Upload Image or Video (optional)
//   </label>

//   {!uploadedFile && !previewUrl && (
//     <div
//       className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
//       onClick={() => document.getElementById('file-upload')?.click()}
//     >
//       <input
//         id="file-upload"
//         type="file"
//         className="hidden"
//         accept="image/*,video/*"
//         onChange={handleFileChange}
//         disabled={uploading}
//       />
//       {uploading ? (
//         <div className="flex flex-col items-center gap-2">
//           <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
//           <p className="text-sm text-gray-600">Uploading...</p>
//         </div>
//       ) : (
//         <div className="flex flex-col items-center gap-2">
//           <Upload className="h-8 w-8 text-gray-400" />
//           <p className="font-medium">Add photos or videos</p>
//           <p className="text-sm text-gray-500">
//             Click to browse (max 10MB)
//           </p>
//         </div>
//       )}
//     </div>
//   )}

//   {/* Preview Uploaded File */}
//   {previewUrl && (
//     <div className="relative rounded-xl overflow-hidden border border-gray-200 mt-4">
//       <img
//         src={previewUrl}
//         alt="Upload preview"
//         className="w-full max-h-96 object-cover"
//       />
//       <button
//         type="button"
//         onClick={removeUploadedFile}
//         className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
//       >
//         <X className="h-4 w-4" />
//       </button>
//     </div>
//   )}
// </div>

// {/* OR Divider */}
// {!uploadedFile && !previewUrl && (
//   <>
//     <div className="relative">
//       <div className="absolute inset-0 flex items-center">
//         <div className="w-full border-t border-gray-300"></div>
//       </div>
//       <div className="relative flex justify-center text-sm">
//         <span className="px-2 bg-white text-gray-500">OR</span>
//       </div>
//     </div>

//     {/* URL Input */}
//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-2">
//         <Image className="w-4 h-4 inline mr-2" />
//         Add Image URL
//       </label>
//       <input
//         type="url"
//         value={mediaUrl}
//         onChange={(e) => setMediaUrl(e.target.value)}
//         placeholder="https://example.com/image.jpg"
//         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//         disabled={!!uploadedFile}
//       />
//       <div className="mt-4">
//         <p className="text-sm text-gray-600 mb-2">Or choose from these:</p>
//         <div className="grid grid-cols-4 gap-2">
//           {suggestedImages.map((url, index) => (
//             <button
//               key={index}
//               type="button"
//               onClick={() => setMediaUrl(url)}
//               className={`rounded-lg overflow-hidden border-2 transition ${mediaUrl === url
//                   ? 'border-blue-600'
//                   : 'border-gray-200 hover:border-gray-300'
//                 }`}
//             >
//               <img
//                 src={url}
//                 alt={`Option ${index + 1}`}
//                 className="w-full h-20 object-cover"
//               />
//             </button>
//           ))}
//         </div>
//       </div>
//     </div>
//   </>
// )}