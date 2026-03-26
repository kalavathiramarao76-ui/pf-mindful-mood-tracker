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
      if (filterOptions.searchQuery.trim() === '' && filterOptions.category === '' && filterOptions.tags.length === 0) {
        setFilteredPosts(posts);
      } else {
        const filtered = posts.filter((post) => {
          const categoryMatch = filterOptions.category === '' || post.category === filterOptions.category;
          const tagsMatch = filterOptions.tags.length === 0 || filterOptions.tags.some((tag) => post.tags?.includes(tag));
          const searchQueryMatch = filterOptions.searchQuery.trim() === '' || post.content.toLowerCase().includes(filterOptions.searchQuery.toLowerCase());
          return categoryMatch && tagsMatch && searchQueryMatch;
        });
        setFilteredPosts(filtered);
      }
    };
    filterPosts();
  }, [posts, filterOptions]);

  const handleSearchQueryChange = (e) => {
    setFilterOptions((prevOptions) => ({ ...prevOptions, searchQuery: e.target.value }));
  };

  const handleCategoryChange = (category) => {
    setFilterOptions((prevOptions) => ({ ...prevOptions, category }));
  };

  const handleTagsChange = (tags) => {
    setFilterOptions((prevOptions) => ({ ...prevOptions, tags }));
  };

  const handleSortOrderChange = (sortOrder) => {
    setSortOrder(sortOrder);
    const sortedPosts = filteredPosts.sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortOrder === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortOrder === 'mostReactions') {
        return postReactions[b.id].length - postReactions[a.id].length;
      } else if (sortOrder === 'mostComments') {
        return postComments[b.id].length - postComments[a.id].length;
      }
    });
    setFilteredPosts(sortedPosts);
  };

  return (
    <div>
      <h1>Community Page</h1>
      <input
        type="search"
        value={filterOptions.searchQuery}
        onChange={handleSearchQueryChange}
        placeholder="Search posts"
      />
      <select value={filterOptions.category} onChange={(e) => handleCategoryChange(e.target.value)}>
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>{category}</option>
        ))}
      </select>
      <select multiple value={filterOptions.tags} onChange={(e) => handleTagsChange(Array.from(e.target.selectedOptions, (option) => option.value))}>
        {tags.map((tag) => (
          <option key={tag} value={tag}>{tag}</option>
        ))}
      </select>
      <select value={sortOrder} onChange={(e) => handleSortOrderChange(e.target.value)}>
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="mostReactions">Most reactions</option>
        <option value="mostComments">Most comments</option>
      </select>
      {filteredPosts.map((post) => (
        <div key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
          <p>Category: {post.category}</p>
          <p>Tags: {post.tags?.join(', ')}</p>
          <p>Reactions: {postReactions[post.id].length}</p>
          <p>Comments: {postComments[post.id].length}</p>
        </div>
      ))}
    </div>
  );
}