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
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [sortOrder, setSortOrder] = useState('newest');
  const [filterOptions, setFilterOptions] = useState({
    category: '',
    tags: [],
    searchQuery: '',
    sortBy: 'newest',
    sortOrder: 'desc',
  });

  useEffect(() => {
    const fetchPosts = async () => {
      if (loading) return;
      setLoading(true);
      const data = await getCommunityPosts(pageNumber);
      if (data.length < 10) {
        setHasMorePosts(false);
      }
      setPosts((prevPosts) => [...prevPosts, ...data]);
      setFilteredPosts((prevPosts) => [...prevPosts, ...data]);
      const postIds = data.map((post) => post.id);
      const reactions = await Promise.all(postIds.map((id) => getPostReactions(id)));
      const comments = await Promise.all(postIds.map((id) => getPostComments(id)));
      const reactionsMap = {};
      const commentsMap = {};
      postIds.forEach((id, index) => {
        reactionsMap[id] = reactions[index];
        commentsMap[id] = comments[index];
      });
      setPostReactions((prevReactions) => ({ ...prevReactions, ...reactionsMap }));
      setPostComments((prevComments) => ({ ...prevComments, ...commentsMap }));
      const uniqueCategories = [...new Set(data.map((post) => post.category))];
      setCategories((prevCategories) => [...new Set([...prevCategories, ...uniqueCategories])]);
      applyFilters();
    };
    fetchPosts();
  }, [pageNumber]);

  useEffect(() => {
    applyFilters();
  }, [filterOptions, posts]);

  const applyFilters = () => {
    const filteredPosts = posts.filter((post) => {
      const categoryMatch = filterOptions.category === '' || post.category === filterOptions.category;
      const tagsMatch = filterOptions.tags.length === 0 || filterOptions.tags.every((tag) => post.tags.includes(tag));
      const searchQueryMatch = post.content.toLowerCase().includes(filterOptions.searchQuery.toLowerCase());
      return categoryMatch && tagsMatch && searchQueryMatch;
    });

    const sortedPosts = filteredPosts.sort((a, b) => {
      switch (filterOptions.sortBy) {
        case 'newest':
          return filterOptions.sortOrder === 'desc' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt;
        case 'oldest':
          return filterOptions.sortOrder === 'desc' ? a.createdAt - b.createdAt : b.createdAt - a.createdAt;
        case 'mostReactions':
          return filterOptions.sortOrder === 'desc' ? postReactions[b.id].length - postReactions[a.id].length : postReactions[a.id].length - postReactions[b.id].length;
        case 'mostComments':
          return filterOptions.sortOrder === 'desc' ? postComments[b.id].length - postComments[a.id].length : postComments[a.id].length - postComments[b.id].length;
        default:
          return 0;
      }
    });

    setFilteredPosts(sortedPosts);
  };

  const handleFilterChange = (key, value) => {
    setFilterOptions((prevFilterOptions) => ({ ...prevFilterOptions, [key]: value }));
  };

  const handleSortChange = (sortBy, sortOrder) => {
    setFilterOptions((prevFilterOptions) => ({ ...prevFilterOptions, sortBy, sortOrder }));
  };

  return (
    // existing JSX code
  );
}