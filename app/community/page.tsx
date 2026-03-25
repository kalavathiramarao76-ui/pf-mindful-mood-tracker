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
  const [searchResults, setSearchResults] = useState([]);

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
        });
        setSuggestions(suggestions.slice(0, 5));
      } else {
        setSuggestions([]);
      }
    };
    fetchSuggestions();
  }, [searchQuery, posts]);

  const handleSearch = async (query) => {
    if (query.trim() !== '') {
      const results = posts.filter((post) => {
        return post.content.toLowerCase().includes(query.toLowerCase()) || post.author.toLowerCase().includes(query.toLowerCase());
      });
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleAutocompleteChange = (value) => {
    setSearchQuery(value);
  };

  return (
    <div>
      <h1>Community Page</h1>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => handleAutocompleteChange(e.target.value)}
        placeholder="Search..."
      />
      <Autocomplete
        suggestions={suggestions}
        handleSearch={handleSearch}
        handleAutocompleteChange={handleAutocompleteChange}
      />
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
      >
        <option value="">All Categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <div>
        {tags.map((tag) => (
          <span key={tag}>
            <input
              type="checkbox"
              checked={selectedTags.includes(tag)}
              onChange={() => {
                if (selectedTags.includes(tag)) {
                  setSelectedTags(selectedTags.filter((t) => t !== tag));
                } else {
                  setSelectedTags([...selectedTags, tag]);
                }
              }}
            />
            {tag}
          </span>
        ))}
      </div>
      <ul>
        {filteredPosts.map((post) => (
          <li key={post.id}>
            <h2>{post.content}</h2>
            <p>Author: {post.author}</p>
            <p>Category: {post.category}</p>
            <p>Tags: {post.tags.join(', ')}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}