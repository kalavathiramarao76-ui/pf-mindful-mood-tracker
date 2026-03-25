use client;

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { 
  getCommunityPosts, 
  createCommunityPost, 
  updateCommunityPost, 
  deleteCommunityPost, 
  createPostReaction, 
  getPostReactions, 
  createPostComment, 
  getPostComments 
} from '../lib/community';
import { useLocalStorage } from '../lib/localStorage';

export default function CommunityPage() {
  const pathname = usePathname();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [editingPost, setEditingPost] = useState(null);
  const [editedPostContent, setEditedPostContent] = useState('');
  const [user, setUser] = useLocalStorage('user', {});
  const [postReactions, setPostReactions] = useState({});
  const [postComments, setPostComments] = useState({});
  const [newComment, setNewComment] = useState({});

  useEffect(() => {
    const fetchPosts = async () => {
      const data = await getCommunityPosts();
      setPosts(data);
      const reactions = {};
      const comments = {};
      for (const post of data) {
        reactions[post.id] = await getPostReactions(post.id);
        comments[post.id] = await getPostComments(post.id);
      }
      setPostReactions(reactions);
      setPostComments(comments);
    };
    fetchPosts();
  }, []);

  const handleCreatePost = async () => {
    if (newPost.trim() !== '') {
      const post = { content: newPost, author: user.name };
      const data = await createCommunityPost(post);
      setPosts([data, ...posts]);
      setPostReactions({ ...postReactions, [data.id]: [] });
      setPostComments({ ...postComments, [data.id]: [] });
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
    const updatedReactions = { ...postReactions };
    delete updatedReactions[postId];
    setPostReactions(updatedReactions);
    const updatedComments = { ...postComments };
    delete updatedComments[postId];
    setPostComments(updatedComments);
  };

  const handleReactToPost = async (postId, reaction) => {
    const existingReaction = postReactions[postId].find((r) => r.user === user.name && r.reaction === reaction);
    if (existingReaction) {
      const updatedReactions = postReactions[postId].filter((r) => r.id !== existingReaction.id);
      setPostReactions({ ...postReactions, [postId]: updatedReactions });
      await deleteCommunityPostReaction(existingReaction.id);
    } else {
      const newReaction = { postId, user: user.name, reaction };
      const data = await createPostReaction(newReaction);
      setPostReactions({ ...postReactions, [postId]: [...postReactions[postId], data] });
    }
  };

  const handleCommentOnPost = async (postId) => {
    if (newComment[postId] && newComment[postId].trim() !== '') {
      const comment = { postId, content: newComment[postId], author: user.name };
      const data = await createPostComment(comment);
      setPostComments({ ...postComments, [postId]: [...postComments[postId], data] });
      setNewComment({ ...newComment, [postId]: '' });
    }
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
            <p>{post.content}</p>
            <div className="flex justify-between mb-2">
              <button
                onClick={() => handleReactToPost(post.id, 'like')}
                className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
              >
                Like ({postReactions[post.id].filter((r) => r.reaction === 'like').length})
              </button>
              <button
                onClick={() => handleReactToPost(post.id, 'dislike')}
                className="py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-700"
              >
                Dislike ({postReactions[post.id].filter((r) => r.reaction === 'dislike').length})
              </button>
            </div>
            <div className="mb-2">
              <textarea
                value={newComment[post.id] || ''}
                onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                className="w-full p-2 bg-gray-100 rounded-lg dark:bg-gray-700 dark:text-white"
                placeholder="Add a comment..."
              />
              <button
                onClick={() => handleCommentOnPost(post.id)}
                className="mt-2 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
              >
                Comment
              </button>
            </div>
            <div>
              {postComments[post.id].map((comment) => (
                <div key={comment.id} className="mb-2">
                  <h4 className="text-sm font-bold">{comment.author}</h4>
                  <p>{comment.content}</p>
                </div>
              ))}
            </div>
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
              </div>
            ) : (
              <div>
                <button
                  onClick={() => handleEditPost(post)}
                  className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeletePost(post.id)}
                  className="ml-2 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-700"
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