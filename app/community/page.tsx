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
    };
    fetchPosts();
  }, [pageNumber]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    const filteredData = await filterPosts(query, filterOptions);
    setFilteredPosts(filteredData);
  };

  const handleFilterChange = (filter: string, value: any) => {
    setFilterOptions((prevFilters) => ({ ...prevFilters, [filter]: value }));
    const filteredData = filterPosts(searchQuery, { ...filterOptions, [filter]: value });
    setFilteredPosts(filteredData);
  };

  const filterPosts = async (query: string, filters: any) => {
    const data = await getCommunityPosts(pageNumber);
    const filteredData = data.filter((post) => {
      const categoryMatch = filters.category ? post.category === filters.category : true;
      const tagMatch = filters.tags.length ? filters.tags.some((tag) => post.tags.includes(tag)) : true;
      const searchMatch = query ? post.content.toLowerCase().includes(query.toLowerCase()) : true;
      return categoryMatch && tagMatch && searchMatch;
    });
    if (filters.sortBy === 'newest') {
      filteredData.sort((a, b) => b.createdAt - a.createdAt);
    } else if (filters.sortBy === 'oldest') {
      filteredData.sort((a, b) => a.createdAt - b.createdAt);
    }
    return filteredData;
  };

  const handleSortChange = (sortOrder: string) => {
    setSortOrder(sortOrder);
    const sortedData = [...filteredPosts];
    if (sortOrder === 'newest') {
      sortedData.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sortOrder === 'oldest') {
      sortedData.sort((a, b) => a.createdAt - b.createdAt);
    }
    setFilteredPosts(sortedData);
  };

  return (
    <div>
      <input
        type="search"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search posts"
      />
      <select
        value={filterOptions.category}
        onChange={(e) => handleFilterChange('category', e.target.value)}
      >
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <select
        multiple
        value={filterOptions.tags}
        onChange={(e) => handleFilterChange('tags', Array.from(e.target.selectedOptions, (option) => option.value))}
      >
        {tags.map((tag) => (
          <option key={tag} value={tag}>
            {tag}
          </option>
        ))}
      </select>
      <button onClick={() => handleSortChange('newest')}>Newest</button>
      <button onClick={() => handleSortChange('oldest')}>Oldest</button>
      {filteredPosts.map((post) => (
        <div key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </div>
      ))}
    </div>
  );
}