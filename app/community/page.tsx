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
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const data = await getCommunityPosts(pageNumber);
      if (data.length < 10) {
        setHasMorePosts(false);
      }
      setPosts((prevPosts) => [...prevPosts, ...data]);
      setFilteredPosts((prevPosts) => [...prevPosts, ...data]);
      const reactions = {};
      const comments = {};
      for (const post of data) {
        reactions[post.id] = await getPostReactions(post.id);
        comments[post.id] = await getPostComments(post.id);
      }
      setPostReactions((prevReactions) => ({ ...prevReactions, ...reactions }));
      setPostComments((prevComments) => ({ ...prevComments, ...comments }));
      const uniqueCategories = [...new Set(data.map((post) => post.category))];
      setCategories((prevCategories) => [...new Set([...prevCategories, ...uniqueCategories])]);
      const uniqueTags = [...new Set(data.flatMap((post) => post.tags || []))];
      setTags((prevTags) => [...new Set([...prevTags, ...uniqueTags])]);
    };
    fetchPosts();
  }, [pageNumber]);

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

  const handleScroll = () => {
    if (hasMorePosts && window.innerHeight + window.scrollY >= document.body.offsetHeight) {
      setPageNumber((prevPageNumber) => prevPageNumber + 1);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMorePosts]);

  return (
    // your JSX code here
  );
}