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

  const applyFilters = (posts) => {
    let filteredPosts = posts;
    if (filterOptions.category) {
      filteredPosts = filteredPosts.filter((post) => post.category === filterOptions.category);
    }
    if (filterOptions.tags.length > 0) {
      filteredPosts = filteredPosts.filter((post) => filterOptions.tags.every((tag) => post.tags.includes(tag)));
    }
    if (filterOptions.searchQuery) {
      filteredPosts = filteredPosts.filter((post) => post.content.toLowerCase().includes(filterOptions.searchQuery.toLowerCase()));
    }
    return filteredPosts;
  };

  const sortPosts = (posts) => {
    let sortedPosts = posts;
    if (filterOptions.sortBy === 'newest') {
      sortedPosts = sortedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (filterOptions.sortBy === 'oldest') {
      sortedPosts = sortedPosts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (filterOptions.sortBy === 'mostReactions') {
      sortedPosts = sortedPosts.sort((a, b) => postReactions[b.id].length - postReactions[a.id].length);
    } else if (filterOptions.sortBy === 'mostComments') {
      sortedPosts = sortedPosts.sort((a, b) => postComments[b.id].length - postComments[a.id].length);
    }
    if (filterOptions.sortOrder === 'desc') {
      sortedPosts = sortedPosts.reverse();
    }
    return sortedPosts;
  };

  useEffect(() => {
    const filteredAndSortedPosts = sortPosts(applyFilters(posts));
    setFilteredPosts(filteredAndSortedPosts);
  }, [posts, filterOptions]);

  const handleSearchQueryChange = (e) => {
    setSearchQuery(e.target.value);
    setFilterOptions((prevOptions) => ({ ...prevOptions, searchQuery: e.target.value }));
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setFilterOptions((prevOptions) => ({ ...prevOptions, category: e.target.value }));
  };

  const handleTagChange = (e) => {
    const selectedTags = Array.from(e.target.selectedOptions, (option) => option.value);
    setSelectedTags(selectedTags);
    setFilterOptions((prevOptions) => ({ ...prevOptions, tags: selectedTags }));
  };

  const handleSortByChange = (e) => {
    setSortOrder(e.target.value);
    setFilterOptions((prevOptions) => ({ ...prevOptions, sortBy: e.target.value }));
  };

  const handleSortOrderChange = (e) => {
    setFilterOptions((prevOptions) => ({ ...prevOptions, sortOrder: e.target.value }));
  };

  return (
    <div>
      <h1>Community Page</h1>
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearchQueryChange}
        placeholder="Search posts"
      />
      <select value={selectedCategory} onChange={handleCategoryChange}>
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <select multiple value={selectedTags} onChange={handleTagChange}>
        {tags.map((tag) => (
          <option key={tag} value={tag}>
            {tag}
          </option>
        ))}
      </select>
      <select value={sortOrder} onChange={handleSortByChange}>
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="mostReactions">Most reactions</option>
        <option value="mostComments">Most comments</option>
      </select>
      <select value={filterOptions.sortOrder} onChange={handleSortOrderChange}>
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
      {filteredPosts.map((post) => (
        <div key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
          <p>Category: {post.category}</p>
          <p>Tags: {post.tags.join(', ')}</p>
          <p>Reactions: {postReactions[post.id].length}</p>
          <p>Comments: {postComments[post.id].length}</p>
        </div>
      ))}
    </div>
  );
}