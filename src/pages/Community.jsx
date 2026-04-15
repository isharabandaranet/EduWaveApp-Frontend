import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UsersIcon, HeartIcon, HeartSolidIcon, CommentIcon, ShareIcon, FireIcon } from '../components/Icons';

function Community() {
  const navigate = useNavigate();

  // Mock Feed Data
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: 'Kasun Perera',
      avatar: 'K',
      time: '2 hours ago',
      type: 'note',
      content: 'Just finished my short notes for Data Structures! Focused mainly on Trees and Graphs. Hope this helps someone for the mid-terms. 🚀',
      attachment: { type: 'pdf', name: 'DS_Trees_Graphs_Summary.pdf', size: '2.4 MB' },
      likes: 45,
      isLiked: false,
      comments: 12
    },
    {
      id: 2,
      author: 'Nimeshi Silva',
      avatar: 'N',
      time: '5 hours ago',
      type: 'social',
      content: 'Late night grind! ☕ Working on the web dev assignment. Is anyone else stuck on the React state management part?',
      likes: 128,
      isLiked: true,
      comments: 34
    },
    {
      id: 3,
      author: 'EduWave Bot',
      avatar: '🤖',
      time: '1 day ago',
      type: 'announcement',
      content: '🔥 Trending Note: "Statistics Formulas Cheat Sheet" by Malith is currently the most downloaded note this week!',
      likes: 210,
      isLiked: false,
      comments: 5
    }
  ]);

  const [newPostContent, setNewPostContent] = useState('');

  const handleLike = (id) => {
    setPosts(posts.map(post => {
      if (post.id === id) {
        return { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 };
      }
      return post;
    }));
  };

  const handleCreatePost = () => {
    if (newPostContent.trim()) {
      const newPost = {
        id: Date.now(),
        author: 'You',
        avatar: 'Y',
        time: 'Just now',
        type: 'social',
        content: newPostContent,
        likes: 0,
        isLiked: false,
        comments: 0
      };
      setPosts([newPost, ...posts]);
      setNewPostContent('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full animation-fade-in">
        
        {/* Clean Header - Community.jsx */}
        <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h1 className="text-2xl font-extrabold text-gray-800">Community</h1>
          <p className="text-gray-500 text-sm mt-1">Connect, share, and learn with your batchmates.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Feed Column (Left/Center) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Create Post Box */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl flex-shrink-0">
                  Y
                </div>
                <div className="flex-grow">
                  <textarea 
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Share a thought, a photo, or an uploaded note..." 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white resize-none min-h-[100px] transition-all"
                  ></textarea>
                  <div className="flex justify-between items-center mt-3">
                    <div className="flex gap-2">
                      <button className="text-gray-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition" title="Add Photo">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </button>
                      <button className="text-gray-400 hover:text-green-600 p-2 rounded-lg hover:bg-green-50 transition" title="Attach Note">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                      </button>
                    </div>
                    <button onClick={handleCreatePost} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-md transition-all">
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Feed Posts */}
            <div className="space-y-6">
              {posts.map(post => (
                <div key={post.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                  {/* Post Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${post.type === 'announcement' ? 'bg-gradient-to-r from-orange-400 to-red-500' : 'bg-gray-800'}`}>
                        {post.avatar}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 flex items-center gap-2">
                          {post.author} 
                          {post.type === 'announcement' && <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-md">Admin</span>}
                        </h4>
                        <p className="text-xs text-gray-500">{post.time}</p>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" /></svg></button>
                  </div>
                  
                  {/* Post Content */}
                  <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.content}</p>

                  {/* Attachment (If any) */}
                  {post.attachment && (
                    <div className="mb-4 border border-gray-200 rounded-xl p-4 flex items-center gap-4 bg-gray-50 hover:bg-gray-100 transition cursor-pointer">
                      <div className="text-4xl">📄</div>
                      <div className="flex-grow">
                        <p className="font-bold text-gray-800 text-sm truncate">{post.attachment.name}</p>
                        <p className="text-xs text-gray-500">{post.attachment.size} • PDF Document</p>
                      </div>
                      <button className="bg-white border border-gray-300 text-gray-700 px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-gray-50 shadow-sm">Download</button>
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
                    <button onClick={() => handleLike(post.id)} className={`flex items-center gap-2 text-sm font-bold transition-colors ${post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}>
                      {post.isLiked ? <HeartSolidIcon /> : <HeartIcon />}
                      {post.likes}
                    </button>
                    <button className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-500 transition-colors">
                      <CommentIcon />
                      {post.comments}
                    </button>
                    <button className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-green-500 transition-colors ml-auto">
                      <ShareIcon /> Share
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Right Column (Leaderboard & Public Vault) */}
          <div className="space-y-6">
            
            {/* Module Visibility Toggle (Mockup) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <UsersIcon /> My Visibility
              </h3>
              <p className="text-sm text-gray-500 mb-4">Choose if your uploaded notes and summaries should be visible to your batchmates.</p>
              <div className="flex bg-gray-100 p-1.5 rounded-xl">
                <button className="flex-1 py-2 rounded-lg font-bold bg-white text-gray-800 shadow-sm text-sm">Private</button>
                <button className="flex-1 py-2 rounded-lg font-bold text-gray-500 hover:text-gray-700 text-sm">Public</button>
              </div>
            </div>

            {/* Trending Notes (Leaderboard) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-orange-500">
                <FireIcon /> Trending Notes
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-orange-100 text-orange-600 font-black flex items-center justify-center text-xs">#1</div>
                  <div className="flex-grow overflow-hidden">
                    <p className="text-sm font-bold text-gray-800 truncate cursor-pointer hover:text-blue-600 hover:underline">Stat Formulas</p>
                    <p className="text-xs text-gray-500">by Malith • 340 Upvotes</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-gray-100 text-gray-600 font-black flex items-center justify-center text-xs">#2</div>
                  <div className="flex-grow overflow-hidden">
                    <p className="text-sm font-bold text-gray-800 truncate cursor-pointer hover:text-blue-600 hover:underline">Logic Gates Diagram</p>
                    <p className="text-xs text-gray-500">by Kasun • 215 Upvotes</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-gray-100 text-gray-600 font-black flex items-center justify-center text-xs">#3</div>
                  <div className="flex-grow overflow-hidden">
                    <p className="text-sm font-bold text-gray-800 truncate cursor-pointer hover:text-blue-600 hover:underline">Past Paper 2023 Ans</p>
                    <p className="text-xs text-gray-500">by Nimeshi • 180 Upvotes</p>
                  </div>
                </div>
              </div>
              <button className="w-full mt-5 text-sm font-bold text-blue-600 hover:text-blue-800 transition">View All Public Notes →</button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

export default Community;