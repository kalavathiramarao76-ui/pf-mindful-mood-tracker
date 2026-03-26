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
      const uniqueTags = [...new Set(data.flatMap((post) => post.tags))];
      setTags((prevTags) => [...new Set([...prevTags, ...uniqueTags])]);
      setLoading(false);
    };
    fetchPosts();
  }, [pageNumber]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchQuery) return;
      const data = await getCommunityPosts(1, searchQuery);
      const suggestions = data.map((post) => post.title);
      setSuggestions(suggestions);
    };
    fetchSuggestions();
  }, [searchQuery]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    const data = await getCommunityPosts(1, query);
    setSearchResults(data);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const filteredPosts = posts.filter((post) => post.category === category);
    setFilteredPosts(filteredPosts);
  };

  const handleTagChange = (tag: string) => {
    const isSelected = selectedTags.includes(tag);
    if (isSelected) {
      const newTags = selectedTags.filter((t) => t !== tag);
      setSelectedTags(newTags);
      const filteredPosts = posts.filter((post) => post.tags.some((t) => newTags.includes(t)));
      setFilteredPosts(filteredPosts);
    } else {
      const newTags = [...selectedTags, tag];
      setSelectedTags(newTags);
      const filteredPosts = posts.filter((post) => post.tags.some((t) => newTags.includes(t)));
      setFilteredPosts(filteredPosts);
    }
  };

  const handleFilterChange = (filter: string, value: string | string[]) => {
    setFilterOptions((prevFilter) => ({ ...prevFilter, [filter]: value }));
    const filteredPosts = posts.filter((post) => {
      if (filter === 'category') return post.category === value;
      if (filter === 'tags') return post.tags.some((t) => value.includes(t));
      if (filter === 'searchQuery') return post.title.includes(value);
      return true;
    });
    setFilteredPosts(filteredPosts);
  };

  return (
    <div>
      <input
        type="search"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search posts"
      />
      <Autocomplete
        suggestions={suggestions}
        onSuggestionClick={(suggestion) => handleSearch(suggestion)}
      />
      <select value={selectedCategory} onChange={(e) => handleCategoryChange(e.target.value)}>
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <div>
        {tags.map((tag) => (
          <button key={tag} onClick={() => handleTagChange(tag)}>
            {tag}
          </button>
        ))}
      </div>
      <button onClick={() => handleFilterChange('category', selectedCategory)}>Filter by category</button>
      <button onClick={() => handleFilterChange('tags', selectedTags)}>Filter by tags</button>
      <button onClick={() => handleFilterChange('searchQuery', searchQuery)}>Filter by search query</button>
      {filteredPosts.map((post) => (
        <div key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </div>
      ))}
    </div>
  );
}