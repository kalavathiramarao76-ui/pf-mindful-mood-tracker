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
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

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
      const uniqueCategories = [...new Set(data.map((post) => post.category))];
      setCategories(uniqueCategories);
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    const filterPosts = () => {
      if (searchQuery.trim() === '' && selectedCategory === '') {
        setFilteredPosts(posts);
      } else {
        const filtered = posts.filter((post) => {
          const searchCondition = post.content.toLowerCase().includes(searchQuery.toLowerCase()) || post.author.toLowerCase().includes(searchQuery.toLowerCase());
          const categoryCondition = selectedCategory === '' || post.category === selectedCategory;
          return searchCondition && categoryCondition;
        });
        setFilteredPosts(filtered);
      }
    };
    filterPosts();
  }, [posts, searchQuery, selectedCategory]);

  const handleCreatePost = async () => {
    if (newPost.trim() !== '') {
      const post = { content: newPost, author: user.name, category: selectedCategory };
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
      const updatedPost = { id: editingPost.id, content: editedPostContent, author: editingPost.author, category: editingPost.category };
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

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  return (
    <div>
      <h1>Community Page</h1>
      <input
        type="text"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder="Search posts"
      />
      <select value={selectedCategory} onChange={handleCategoryChange}>
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>{category}</option>
        ))}
      </select>
      <button onClick={handleCreatePost}>Create Post</button>
      <ul>
        {filteredPosts.map((post) => (
          <li key={post.id}>
            <h2>{post.content}</h2>
            <p>Author: {post.author}</p>
            <p>Category: {post.category}</p>
            <button onClick={() => handleEditPost(post)}>Edit</button>
            <button onClick={() => handleDeletePost(post.id)}>Delete</button>
            <ul>
              {postReactions[post.id] && postReactions[post.id].map((reaction) => (
                <li key={reaction.id}>{reaction.type}</li>
              ))}
            </ul>
            <ul>
              {postComments[post.id] && postComments[post.id].map((comment) => (
                <li key={comment.id}>{comment.content}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      {editingPost && (
        <div>
          <input
            type="text"
            value={editedPostContent}
            onChange={(event) => setEditedPostContent(event.target.value)}
          />
          <button onClick={handleUpdatePost}>Update Post</button>
        </div>
      )}
    </div>
  );
}