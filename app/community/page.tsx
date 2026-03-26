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
  }, [pageNumber, filterOptions]);

  const applyFilters = () => {
    const filtered = posts.filter((post) => {
      const categoryMatch = filterOptions.category === '' || post.category === filterOptions.category;
      const tagsMatch = filterOptions.tags.length === 0 || filterOptions.tags.every((tag) => post.tags.includes(tag));
      const searchQueryMatch = post.content.toLowerCase().includes(filterOptions.searchQuery.toLowerCase());
      return categoryMatch && tagsMatch && searchQueryMatch;
    });
    const sorted = filtered.sort((a, b) => {
      if (filterOptions.sortBy === 'newest') {
        return b.createdAt - a.createdAt;
      } else if (filterOptions.sortBy === 'oldest') {
        return a.createdAt - b.createdAt;
      } else if (filterOptions.sortBy === 'mostReactions') {
        return b.reactions.length - a.reactions.length;
      } else if (filterOptions.sortBy === 'mostComments') {
        return b.comments.length - a.comments.length;
      }
    });
    setFilteredPosts(sorted);
  };

  const handleSearchQueryChange = (e) => {
    setFilterOptions((prevOptions) => ({ ...prevOptions, searchQuery: e.target.value }));
  };

  const handleCategoryChange = (category) => {
    setFilterOptions((prevOptions) => ({ ...prevOptions, category }));
  };

  const handleTagsChange = (tags) => {
    setFilterOptions((prevOptions) => ({ ...prevOptions, tags }));
  };

  const handleSortByChange = (sortBy) => {
    setFilterOptions((prevOptions) => ({ ...prevOptions, sortBy }));
  };

  const handleSortOrderChange = (sortOrder) => {
    setFilterOptions((prevOptions) => ({ ...prevOptions, sortOrder }));
  };

  return (
    <div>
      <h1>Community Page</h1>
      <input
        type="text"
        value={filterOptions.searchQuery}
        onChange={handleSearchQueryChange}
        placeholder="Search..."
      />
      <select value={filterOptions.category} onChange={(e) => handleCategoryChange(e.target.value)}>
        <option value="">All Categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <select
        multiple
        value={filterOptions.tags}
        onChange={(e) => handleTagsChange(Array.from(e.target.selectedOptions, (option) => option.value))}
      >
        {tags.map((tag) => (
          <option key={tag} value={tag}>
            {tag}
          </option>
        ))}
      </select>
      <select value={filterOptions.sortBy} onChange={(e) => handleSortByChange(e.target.value)}>
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="mostReactions">Most Reactions</option>
        <option value="mostComments">Most Comments</option>
      </select>
      <select value={filterOptions.sortOrder} onChange={(e) => handleSortOrderChange(e.target.value)}>
        <option value="desc">Descending</option>
        <option value="asc">Ascending</option>
      </select>
      {filteredPosts.map((post) => (
        <div key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
          <p>Reactions: {post.reactions.length}</p>
          <p>Comments: {post.comments.length}</p>
        </div>
      ))}
    </div>
  );
}