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
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [editingPost, setEditingPost] = useState(null);
  const [editedPostContent, setEditedPostContent] = useState('');
  const [user, setUser] = useLocalStorage('user', {});
  const [postReactions, setPostReactions] = useState({});
  const [postComments, setPostComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      const data = await getCommunityPosts();
      setPosts(data);
      setFilteredPosts(data);
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

  useEffect(() => {
    const filterPosts = () => {
      if (searchQuery.trim() === '') {
        setFilteredPosts(posts);
      } else {
        const filtered = posts.filter((post) => post.content.toLowerCase().includes(searchQuery.toLowerCase()) || post.author.toLowerCase().includes(searchQuery.toLowerCase()));
        setFilteredPosts(filtered);
      }
    };
    filterPosts();
  }, [posts, searchQuery]);

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
    } else {
      const newReaction = { user: user.name, reaction };
      const data = await createPostReaction(newReaction, postId);
      setPostReactions({ ...postReactions, [postId]: [...postReactions[postId], data] });
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div>
      <input type="search" value={searchQuery} onChange={handleSearch} placeholder="Search posts" />
      {filteredPosts.map((post) => (
        <div key={post.id}>
          <h2>{post.author}</h2>
          <p>{post.content}</p>
          <button onClick={() => handleReactToPost(post.id, 'like')}>Like</button>
          <button onClick={() => handleReactToPost(post.id, 'dislike')}>Dislike</button>
          <button onClick={() => handleEditPost(post)}>Edit</button>
          <button onClick={() => handleDeletePost(post.id)}>Delete</button>
          {editingPost && editingPost.id === post.id ? (
            <div>
              <input type="text" value={editedPostContent} onChange={(e) => setEditedPostContent(e.target.value)} />
              <button onClick={handleUpdatePost}>Update</button>
            </div>
          ) : null}
        </div>
      ))}
      <input type="text" value={newPost} onChange={(e) => setNewPost(e.target.value)} />
      <button onClick={handleCreatePost}>Create Post</button>
    </div>
  );
}