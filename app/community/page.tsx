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

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length < 3) return;
      const data = await getCommunityPosts(1, searchQuery);
      setSuggestions(data.map((post) => post.title));
    };
    fetchSuggestions();
  }, [searchQuery]);

  const handleSearch = async () => {
    if (searchQuery.length < 3) return;
    const data = await getCommunityPosts(1, searchQuery);
    setSearchResults(data);
  };

  const handleFilter = async () => {
    const filteredData = posts.filter((post) => {
      const categoryMatch = filterOptions.category ? post.category === filterOptions.category : true;
      const tagsMatch = filterOptions.tags.length ? filterOptions.tags.every((tag) => post.tags.includes(tag)) : true;
      const searchQueryMatch = filterOptions.searchQuery ? post.title.includes(filterOptions.searchQuery) : true;
      return categoryMatch && tagsMatch && searchQueryMatch;
    });
    setFilteredPosts(filteredData);
  };

  const handleSort = async () => {
    const sortedData = filteredPosts.sort((a, b) => {
      if (filterOptions.sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (filterOptions.sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (filterOptions.sortBy === 'mostReactions') {
        return postReactions[b.id].length - postReactions[a.id].length;
      } else if (filterOptions.sortBy === 'mostComments') {
        return postComments[b.id].length - postComments[a.id].length;
      }
    });
    setFilteredPosts(sortedData);
  };

  const handleAutocompleteChange = (value) => {
    setSearchQuery(value);
  };

  return (
    <div>
      <input
        type="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search"
        list="suggestions"
      />
      <datalist id="suggestions">
        {suggestions.map((suggestion) => (
          <option key={suggestion} value={suggestion} />
        ))}
      </datalist>
      <Autocomplete
        value={searchQuery}
        onChange={handleAutocompleteChange}
        suggestions={suggestions}
      />
      <button onClick={handleSearch}>Search</button>
      <button onClick={handleFilter}>Filter</button>
      <button onClick={handleSort}>Sort</button>
      <select
        value={filterOptions.category}
        onChange={(e) => setFilterOptions({ ...filterOptions, category: e.target.value })}
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
        onChange={(e) => setFilterOptions({ ...filterOptions, tags: Array.from(e.target.selectedOptions, (option) => option.value) })}
      >
        {tags.map((tag) => (
          <option key={tag} value={tag}>
            {tag}
          </option>
        ))}
      </select>
      <select
        value={filterOptions.sortBy}
        onChange={(e) => setFilterOptions({ ...filterOptions, sortBy: e.target.value })}
      >
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
          <p>Tags: {post.tags.join(', ')}</p>
          <p>Reactions: {postReactions[post.id].length}</p>
          <p>Comments: {postComments[post.id].length}</p>
        </div>
      ))}
    </div>
  );
}