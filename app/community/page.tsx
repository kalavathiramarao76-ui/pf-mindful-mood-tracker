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
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

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
      const uniqueTags = [...new Set(data.flatMap((post) => post.tags || []))];
      setTags(uniqueTags);
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    const filterPosts = () => {
      if (searchQuery.trim() === '' && selectedCategory === '' && selectedTags.length === 0) {
        setFilteredPosts(posts);
      } else {
        const filtered = posts.filter((post) => {
          const searchCondition = post.content.toLowerCase().includes(searchQuery.toLowerCase()) || post.author.toLowerCase().includes(searchQuery.toLowerCase());
          const categoryCondition = selectedCategory === '' || post.category === selectedCategory;
          const tagsCondition = selectedTags.length === 0 || (post.tags || []).some((tag) => selectedTags.includes(tag));
          return searchCondition && categoryCondition && tagsCondition;
        });
        setFilteredPosts(filtered);
      }
    };
    filterPosts();
  }, [posts, searchQuery, selectedCategory, selectedTags]);

  const handleCreatePost = async () => {
    if (newPost.trim() !== '') {
      const post = { content: newPost, author: user.name, category: selectedCategory, tags: selectedTags };
      const data = await createCommunityPost(post);
      setPosts([data, ...posts]);
      setPostReactions({ ...postReactions, [data.id]: [] });
      setPostComments({ ...postComments, [data.id]: [] });
      setNewPost('');
      setSelectedTags([]);
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setEditedPostContent(post.content);
  };

  const handleUpdatePost = async () => {
    if (editingPost) {
      const post = { ...editingPost, content: editedPostContent, category: selectedCategory, tags: selectedTags };
      const data = await updateCommunityPost(post);
      setPosts(posts.map((p) => p.id === data.id ? data : p));
      setEditingPost(null);
      setEditedPostContent('');
      setSelectedTags([]);
    }
  };

  const handleDeletePost = async (post) => {
    await deleteCommunityPost(post.id);
    setPosts(posts.filter((p) => p.id !== post.id));
  };

  const handleCreateReaction = async (post, reaction) => {
    const data = await createPostReaction(post.id, reaction);
    setPostReactions({ ...postReactions, [post.id]: [...(postReactions[post.id] || []), data] });
  };

  const handleCreateComment = async (post, comment) => {
    const data = await createPostComment(post.id, comment);
    setPostComments({ ...postComments, [post.id]: [...(postComments[post.id] || []), data] });
  };

  const handleTagChange = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <div>
      <h1>Community Page</h1>
      <input type="text" value={newPost} onChange={(e) => setNewPost(e.target.value)} placeholder="Create a new post" />
      <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
        <option value="">Select a category</option>
        {categories.map((category) => (
          <option key={category} value={category}>{category}</option>
        ))}
      </select>
      <div>
        {tags.map((tag) => (
          <span key={tag} style={{ backgroundColor: selectedTags.includes(tag) ? 'blue' : 'gray', color: 'white', padding: '5px', margin: '5px', borderRadius: '5px' }} onClick={() => handleTagChange(tag)}>{tag}</span>
        ))}
      </div>
      <button onClick={handleCreatePost}>Create Post</button>
      {filteredPosts.map((post) => (
        <div key={post.id}>
          <h2>{post.content}</h2>
          <p>Author: {post.author}</p>
          <p>Category: {post.category}</p>
          <p>Tags: {post.tags && post.tags.join(', ')}</p>
          <button onClick={() => handleEditPost(post)}>Edit Post</button>
          <button onClick={() => handleDeletePost(post)}>Delete Post</button>
          <input type="text" value={editedPostContent} onChange={(e) => setEditedPostContent(e.target.value)} placeholder="Edit post content" />
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <div>
            {tags.map((tag) => (
              <span key={tag} style={{ backgroundColor: selectedTags.includes(tag) ? 'blue' : 'gray', color: 'white', padding: '5px', margin: '5px', borderRadius: '5px' }} onClick={() => handleTagChange(tag)}>{tag}</span>
            ))}
          </div>
          <button onClick={handleUpdatePost}>Update Post</button>
          <h3>Reactions:</h3>
          <ul>
            {postReactions[post.id] && postReactions[post.id].map((reaction) => (
              <li key={reaction.id}>{reaction.type}</li>
            ))}
          </ul>
          <button onClick={() => handleCreateReaction(post, 'like')}>Like</button>
          <button onClick={() => handleCreateReaction(post, 'dislike')}>Dislike</button>
          <h3>Comments:</h3>
          <ul>
            {postComments[post.id] && postComments[post.id].map((comment) => (
              <li key={comment.id}>{comment.content}</li>
            ))}
          </ul>
          <input type="text" value={newComment[post.id]} onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })} placeholder="Create a new comment" />
          <button onClick={() => handleCreateComment(post, newComment[post.id])}>Create Comment</button>
        </div>
      ))}
    </div>
  );
}