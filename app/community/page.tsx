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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = posts.filter((post) => {
      const postContent = post.content.toLowerCase();
      const queryLower = query.toLowerCase();
      return postContent.includes(queryLower);
    });
    setFilteredPosts(filtered);
  };

  const handleFilter = (options: any) => {
    setFilterOptions(options);
    const filtered = posts.filter((post) => {
      const postCategory = post.category;
      const postTags = post.tags;
      const selectedCategory = options.categories;
      const selectedTags = options.tags;
      const searchQuery = options.searchQuery.toLowerCase();
      const sortBy = options.sortBy;
      const sortOrder = options.sortOrder;

      if (selectedCategory.length > 0 && !selectedCategory.includes(postCategory)) {
        return false;
      }

      if (selectedTags.length > 0 && !selectedTags.every((tag: string) => postTags.includes(tag))) {
        return false;
      }

      if (searchQuery !== '' && !post.content.toLowerCase().includes(searchQuery)) {
        return false;
      }

      return true;
    });

    if (options.sortBy === 'newest') {
      filtered.sort((a, b) => b.createdAt - a.createdAt);
    } else if (options.sortBy === 'oldest') {
      filtered.sort((a, b) => a.createdAt - b.createdAt);
    }

    if (options.sortOrder === 'desc') {
      filtered.reverse();
    }

    setFilteredPosts(filtered);
  };

  const handleSort = (sortBy: string, sortOrder: string) => {
    setSortOrder(sortBy);
    const sorted = filteredPosts.slice();
    if (sortBy === 'newest') {
      sorted.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sortBy === 'oldest') {
      sorted.sort((a, b) => a.createdAt - b.createdAt);
    }
    if (sortOrder === 'desc') {
      sorted.reverse();
    }
    setFilteredPosts(sorted);
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
        value={filterOptions.sortBy}
        onChange={(e) => handleSort(e.target.value, filterOptions.sortOrder)}
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
      </select>
      <select
        value={filterOptions.sortOrder}
        onChange={(e) => handleSort(filterOptions.sortBy, e.target.value)}
      >
        <option value="desc">Descending</option>
        <option value="asc">Ascending</option>
      </select>
      <button onClick={() => handleFilter({ ...filterOptions, categories: [] })}>
        Clear category filter
      </button>
      <button onClick={() => handleFilter({ ...filterOptions, tags: [] })}>
        Clear tag filter
      </button>
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