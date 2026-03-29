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
    categories: [],
    tags: [],
    searchQuery: '',
    sortBy: 'newest',
    sortOrder: 'desc',
  });

  const handleScroll = () => {
    const scrollPosition = window.scrollY + window.innerHeight;
    const documentHeight = document.body.offsetHeight;
    if (scrollPosition >= documentHeight * 0.9 && hasMorePosts && !loading) {
      setIsFetching(true);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMorePosts, loading]);

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
      setPostReactions(reactionsMap);
      setPostComments(commentsMap);
      setLoading(false);
      setIsFetching(false);
    };
    fetchPosts();
  }, [pageNumber, loading]);

  const handleFilterChange = (key, value) => {
    setFilterOptions((prevOptions) => ({ ...prevOptions, [key]: value }));
    applyFilters();
  };

  const applyFilters = () => {
    const filteredPosts = posts.filter((post) => {
      const categoryMatch = filterOptions.categories.length === 0 || filterOptions.categories.includes(post.category);
      const tagMatch = filterOptions.tags.length === 0 || filterOptions.tags.some((tag) => post.tags.includes(tag));
      const searchMatch = filterOptions.searchQuery === '' || post.content.toLowerCase().includes(filterOptions.searchQuery.toLowerCase());
      return categoryMatch && tagMatch && searchMatch;
    });
    setFilteredPosts(filteredPosts);
  };

  const handleCategoryChange = (category) => {
    if (filterOptions.categories.includes(category)) {
      setFilterOptions((prevOptions) => ({ ...prevOptions, categories: prevOptions.categories.filter((c) => c !== category) }));
    } else {
      setFilterOptions((prevOptions) => ({ ...prevOptions, categories: [...prevOptions.categories, category] }));
    }
    applyFilters();
  };

  const handleTagChange = (tag) => {
    if (filterOptions.tags.includes(tag)) {
      setFilterOptions((prevOptions) => ({ ...prevOptions, tags: prevOptions.tags.filter((t) => t !== tag) }));
    } else {
      setFilterOptions((prevOptions) => ({ ...prevOptions, tags: [...prevOptions.tags, tag] }));
    }
    applyFilters();
  };

  const handleSearchQueryChange = (query) => {
    setFilterOptions((prevOptions) => ({ ...prevOptions, searchQuery: query }));
    applyFilters();
  };

  return (
    <div>
      <h1>Community Page</h1>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => handleSearchQueryChange(e.target.value)}
        placeholder="Search posts"
      />
      <select
        value={selectedCategory}
        onChange={(e) => handleCategoryChange(e.target.value)}
      >
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <div>
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => handleTagChange(tag)}
            style={{
              backgroundColor: filterOptions.tags.includes(tag) ? 'blue' : 'gray',
              color: 'white',
            }}
          >
            {tag}
          </button>
        ))}
      </div>
      <button onClick={() => handleFilterChange('sortBy', 'newest')}>Newest</button>
      <button onClick={() => handleFilterChange('sortBy', 'oldest')}>Oldest</button>
      <ul>
        {filteredPosts.map((post) => (
          <li key={post.id}>
            <h2>{post.title}</h2>
            <p>{post.content}</p>
            <p>Category: {post.category}</p>
            <p>Tags: {post.tags.join(', ')}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}