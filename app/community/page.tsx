use client;

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { getCommunityPosts, createCommunityPost, updateCommunityPost, deleteCommunityPost } from '../lib/community';
import { useLocalStorage } from '../lib/localStorage';

export default function CommunityPage() {
  const pathname = usePathname();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [editingPost, setEditingPost] = useState(null);
  const [editedPostContent, setEditedPostContent] = useState('');
  const [user, setUser] = useLocalStorage('user', {});

  useEffect(() => {
    const fetchPosts = async () => {
      const data = await getCommunityPosts();
      setPosts(data);
    };
    fetchPosts();
  }, []);

  const handleCreatePost = async () => {
    if (newPost.trim() !== '') {
      const post = { content: newPost, author: user.name };
      const data = await createCommunityPost(post);
      setPosts([data, ...posts]);
      setNewPost('');
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setEditedPostContent(post.content);
  };

  const handleUpdatePost = async () => {
    if (editingPost && editedPostContent.trim() !== '') {
      const updatedPost = { id: editingPost.id, content: editedPostContent, author: editingPost.author };
      const data = await updateCommunityPost(updatedPost);
      setPosts(posts.map((post) => (post.id === data.id ? data : post)));
      setEditingPost(null);
      setEditedPostContent('');
    }
  };

  const handleDeletePost = async (postId) => {
    await deleteCommunityPost(postId);
    setPosts(posts.filter((post) => post.id !== postId));
  };

  return (
    <div className="flex flex-col items-center py-12">
      <h1 className="text-3xl font-bold mb-4">Community Forum</h1>
      <Link href="/" className="flex items-center mb-4">
        <ArrowLeftIcon className="w-5 h-5 mr-2" />
        Back to Dashboard
      </Link>
      <div className="w-full max-w-md p-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h2 className="text-xl font-bold mb-2">Create a new post</h2>
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          className="w-full p-2 bg-gray-100 rounded-lg dark:bg-gray-700 dark:text-white"
          placeholder="Share your thoughts..."
        />
        <button
          onClick={handleCreatePost}
          className="mt-2 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
        >
          Post
        </button>
      </div>
      <div className="w-full max-w-md p-4 mt-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h2 className="text-xl font-bold mb-2">Community Posts</h2>
        {posts.map((post) => (
          <div key={post.id} className="mb-4">
            <h3 className="text-lg font-bold">{post.author}</h3>
            {editingPost && editingPost.id === post.id ? (
              <div>
                <textarea
                  value={editedPostContent}
                  onChange={(e) => setEditedPostContent(e.target.value)}
                  className="w-full p-2 bg-gray-100 rounded-lg dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={handleUpdatePost}
                  className="mt-2 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
                >
                  Update
                </button>
                <button
                  onClick={() => setEditingPost(null)}
                  className="mt-2 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-700 ml-2"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-300">{post.content}</p>
            )}
            {user.name === post.author && (
              <div className="mt-2">
                <button
                  onClick={() => handleEditPost(post)}
                  className="py-2 px-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-700 mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeletePost(post.id)}
                  className="py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}