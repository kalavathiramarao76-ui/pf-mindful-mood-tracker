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
    const filteredPosts = posts.filter((post) => {
      const categoryMatch = filterOptions.category ? post.category === filterOptions.category : true;
      const tagsMatch = filterOptions.tags.length ? filterOptions.tags.every((tag) => post.tags.includes(tag)) : true;
      const searchQueryMatch = filterOptions.searchQuery ? post.content.toLowerCase().includes(filterOptions.searchQuery.toLowerCase()) : true;
      return categoryMatch && tagsMatch && searchQueryMatch;
    });
    return filteredPosts;
  };

  const sortPosts = (posts) => {
    const sortedPosts = posts.sort((a, b) => {
      if (filterOptions.sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (filterOptions.sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (filterOptions.sortBy === 'mostReactions') {
        return b.reactions.length - a.reactions.length;
      } else if (filterOptions.sortBy === 'mostComments') {
        return b.comments.length - a.comments.length;
      }
    });
    return sortedPosts;
  };

  useEffect(() => {
    const filteredPosts = applyFilters(posts);
    const sortedPosts = sortPosts(filteredPosts);
    setFilteredPosts(sortedPosts);
  }, [posts, filterOptions]);

  const handleSearchQueryChange = (event) => {
    const searchQuery = event.target.value;
    setSearchQuery(searchQuery);
    setFilterOptions((prevFilterOptions) => ({ ...prevFilterOptions, searchQuery }));
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setFilterOptions((prevFilterOptions) => ({ ...prevFilterOptions, category }));
  };

  const handleTagChange = (tags) => {
    setSelectedTags(tags);
    setFilterOptions((prevFilterOptions) => ({ ...prevFilterOptions, tags }));
  };

  const handleSortByChange = (sortBy) => {
    setSortOrder(sortBy);
    setFilterOptions((prevFilterOptions) => ({ ...prevFilterOptions, sortBy }));
  };

  const handleSortOrderChange = (sortOrder) => {
    setSortOrder(sortOrder);
    setFilterOptions((prevFilterOptions) => ({ ...prevFilterOptions, sortOrder }));
  };

  return (
    <div>
      <h1>Community Page</h1>
      <input
        type="search"
        value={searchQuery}
        onChange={handleSearchQueryChange}
        placeholder="Search posts"
      />
      <select value={selectedCategory} onChange={(event) => handleCategoryChange(event.target.value)}>
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <select multiple value={selectedTags} onChange={(event) => handleTagChange(event.target.selectedOptions)}>
        {tags.map((tag) => (
          <option key={tag} value={tag}>
            {tag}
          </option>
        ))}
      </select>
      <select value={sortOrder} onChange={(event) => handleSortByChange(event.target.value)}>
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="mostReactions">Most reactions</option>
        <option value="mostComments">Most comments</option>
      </select>
      <select value={filterOptions.sortOrder} onChange={(event) => handleSortOrderChange(event.target.value)}>
        <option value="desc">Descending</option>
        <option value="asc">Ascending</option>
      </select>
      {filteredPosts.map((post) => (
        <div key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
          <p>Category: {post.category}</p>
          <p>Tags: {post.tags.join(', ')}</p>
          <p>Reactions: {post.reactions.length}</p>
          <p>Comments: {post.comments.length}</p>
        </div>
      ))}
    </div>
  );
}