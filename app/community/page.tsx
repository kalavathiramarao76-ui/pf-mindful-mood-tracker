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
      setLoading(false);
    };
    fetchPosts();
  }, [pageNumber]);

  useEffect(() => {
    const filterPosts = () => {
      const filtered = posts.filter((post) => {
        const categoryMatch = filterOptions.category ? post.category === filterOptions.category : true;
        const tagsMatch = filterOptions.tags.length ? filterOptions.tags.every((tag) => post.tags.includes(tag)) : true;
        const searchQueryMatch = filterOptions.searchQuery ? post.content.toLowerCase().includes(filterOptions.searchQuery.toLowerCase()) : true;
        return categoryMatch && tagsMatch && searchQueryMatch;
      });
      const sorted = filtered.sort((a, b) => {
        if (filterOptions.sortBy === 'newest') {
          return filterOptions.sortOrder === 'desc' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt;
        } else if (filterOptions.sortBy === 'oldest') {
          return filterOptions.sortOrder === 'desc' ? a.createdAt - b.createdAt : b.createdAt - a.createdAt;
        } else if (filterOptions.sortBy === 'mostReactions') {
          return filterOptions.sortOrder === 'desc' ? postReactions[b.id].length - postReactions[a.id].length : postReactions[a.id].length - postReactions[b.id].length;
        } else if (filterOptions.sortBy === 'mostComments') {
          return filterOptions.sortOrder === 'desc' ? postComments[b.id].length - postComments[a.id].length : postComments[a.id].length - postComments[b.id].length;
        }
      });
      setFilteredPosts(sorted);
    };
    filterPosts();
  }, [posts, filterOptions]);

  const handleFilterChange = (key, value) => {
    setFilterOptions((prevOptions) => ({ ...prevOptions, [key]: value }));
  };

  const handleSortChange = (sortBy, sortOrder) => {
    setFilterOptions((prevOptions) => ({ ...prevOptions, sortBy, sortOrder }));
  };

  return (
    <div>
      <h1>Community Page</h1>
      <input
        type="text"
        value={filterOptions.searchQuery}
        onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
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
        value={filterOptions.sortBy}
        onChange={(e) => handleSortChange(e.target.value, filterOptions.sortOrder)}
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="mostReactions">Most reactions</option>
        <option value="mostComments">Most comments</option>
      </select>
      <select
        value={filterOptions.sortOrder}
        onChange={(e) => handleSortChange(filterOptions.sortBy, e.target.value)}
      >
        <option value="desc">Descending</option>
        <option value="asc">Ascending</option>
      </select>
      <ul>
        {filteredPosts.map((post) => (
          <li key={post.id}>
            <h2>{post.title}</h2>
            <p>{post.content}</p>
            <p>Reactions: {postReactions[post.id].length}</p>
            <p>Comments: {postComments[post.id].length}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}