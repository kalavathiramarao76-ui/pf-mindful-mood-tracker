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
import Autocomplete from '../components/Autocomplete';

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
  const [suggestions, setSuggestions] = useState([]);

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

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim() !== '') {
        const suggestions = posts.filter((post) => {
          return post.content.toLowerCase().includes(searchQuery.toLowerCase()) || post.author.toLowerCase().includes(searchQuery.toLowerCase());
        }).map((post) => post.content);
        setSuggestions(suggestions.slice(0, 5));
      } else {
        setSuggestions([]);
      }
    };
    fetchSuggestions();
  }, [searchQuery, posts]);

  const handleCreatePost = async () => {
    if (newPost.trim() !== '') {
      const post = { content: newPost, author: user.name, category: selectedCategory };
      const createdPost = await createCommunityPost(post);
      setPosts([...posts, createdPost]);
      setFilteredPosts([...posts, createdPost]);
      setNewPost('');
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <div>
      <Link href="/">
        <ArrowLeftIcon className="h-6 w-6" />
      </Link>
      <h1 className="text-3xl font-bold">Community</h1>
      <div className="flex flex-col">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search"
          className="p-2 border border-gray-400 rounded"
        />
        {suggestions.length > 0 && (
          <Autocomplete
            suggestions={suggestions}
            onSelect={(suggestion) => handleSearch(suggestion)}
          />
        )}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="p-2 border border-gray-400 rounded"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <div className="flex flex-wrap">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                if (selectedTags.includes(tag)) {
                  setSelectedTags(selectedTags.filter((t) => t !== tag));
                } else {
                  setSelectedTags([...selectedTags, tag]);
                }
              }}
              className={`p-2 border border-gray-400 rounded ${selectedTags.includes(tag) ? 'bg-blue-500 text-white' : ''}`}
            >
              {tag}
            </button>
          ))}
        </div>
        <button
          onClick={handleCreatePost}
          className="p-2 border border-gray-400 rounded bg-blue-500 text-white"
        >
          Create post
        </button>
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Write a post"
          className="p-2 border border-gray-400 rounded"
        />
        {filteredPosts.map((post) => (
          <div key={post.id}>
            <h2>{post.content}</h2>
            <p>Author: {post.author}</p>
            <p>Category: {post.category}</p>
            <p>Tags: {post.tags.join(', ')}</p>
            <button
              onClick={async () => {
                const reaction = await createPostReaction(post.id);
                setPostReactions({ ...postReactions, [post.id]: reaction });
              }}
              className="p-2 border border-gray-400 rounded bg-blue-500 text-white"
            >
              React
            </button>
            <button
              onClick={async () => {
                const comments = await getPostComments(post.id);
                setPostComments({ ...postComments, [post.id]: comments });
              }}
              className="p-2 border border-gray-400 rounded bg-blue-500 text-white"
            >
              View comments
            </button>
            <textarea
              value={newComment[post.id] || ''}
              onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
              placeholder="Write a comment"
              className="p-2 border border-gray-400 rounded"
            />
            <button
              onClick={async () => {
                const comment = await createPostComment(post.id, newComment[post.id]);
                setPostComments({ ...postComments, [post.id]: [...(postComments[post.id] || []), comment] });
                setNewComment({ ...newComment, [post.id]: '' });
              }}
              className="p-2 border border-gray-400 rounded bg-blue-500 text-white"
            >
              Comment
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}