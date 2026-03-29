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
      const data = await getCommunityPosts(pageNumber, filterOptions);
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
  }, [pageNumber, filterOptions]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilterOptions((prevOptions) => ({ ...prevOptions, searchQuery: query }));
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setFilterOptions((prevOptions) => ({ ...prevOptions, categories: [category] }));
  };

  const handleTagChange = (tags: string[]) => {
    setSelectedTags(tags);
    setFilterOptions((prevOptions) => ({ ...prevOptions, tags }));
  };

  const handleSortChange = (sortBy: string, sortOrder: string) => {
    setSortOrder(sortBy);
    setFilterOptions((prevOptions) => ({ ...prevOptions, sortBy, sortOrder }));
  };

  const applyFilters = () => {
    const filteredPosts = posts.filter((post) => {
      const categoryMatch = filterOptions.categories.length === 0 || filterOptions.categories.includes(post.category);
      const tagMatch = filterOptions.tags.length === 0 || filterOptions.tags.some((tag) => post.tags.includes(tag));
      const searchMatch = post.content.toLowerCase().includes(filterOptions.searchQuery.toLowerCase());
      return categoryMatch && tagMatch && searchMatch;
    });
    setFilteredPosts(filteredPosts);
  };

  useEffect(() => {
    applyFilters();
  }, [posts, filterOptions]);

  const sortedPosts = filteredPosts.sort((a, b) => {
    if (filterOptions.sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (filterOptions.sortBy === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (filterOptions.sortBy === 'mostReactions') {
      return postReactions[b.id].length - postReactions[a.id].length;
    } else if (filterOptions.sortBy === 'mostComments') {
      return postComments[b.id].length - postComments[a.id].length;
    }
  });

  return (
    <div>
      <h1>Community Page</h1>
      <input
        type="search"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search posts"
      />
      <select value={selectedCategory} onChange={(e) => handleCategoryChange(e.target.value)}>
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <select multiple value={selectedTags} onChange={(e) => handleTagChange(Array.from(e.target.selectedOptions, (option) => option.value))}>
        {tags.map((tag) => (
          <option key={tag} value={tag}>
            {tag}
          </option>
        ))}
      </select>
      <select value={sortOrder} onChange={(e) => handleSortChange(e.target.value, filterOptions.sortOrder)}>
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="mostReactions">Most reactions</option>
        <option value="mostComments">Most comments</option>
      </select>
      <button onClick={() => applyFilters()}>Apply filters</button>
      {sortedPosts.map((post) => (
        <div key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
          <p>Reactions: {postReactions[post.id].length}</p>
          <p>Comments: {postComments[post.id].length}</p>
        </div>
      ))}
    </div>
  );
}