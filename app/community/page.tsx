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
    };
    fetchPosts();
  }, [pageNumber]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = posts.filter((post) => {
      const title = post.title.toLowerCase();
      const content = post.content.toLowerCase();
      const category = post.category.toLowerCase();
      const tags = post.tags.map((tag) => tag.toLowerCase());
      return (
        title.includes(query.toLowerCase()) ||
        content.includes(query.toLowerCase()) ||
        category.includes(query.toLowerCase()) ||
        tags.some((tag) => tag.includes(query.toLowerCase()))
      );
    });
    setFilteredPosts(filtered);
  };

  const handleFilter = (options: any) => {
    setFilterOptions(options);
    const filtered = posts.filter((post) => {
      const category = post.category;
      const tags = post.tags;
      const title = post.title.toLowerCase();
      const content = post.content.toLowerCase();
      const query = options.searchQuery.toLowerCase();
      const categories = options.categories;
      const selectedTags = options.tags;
      const sortBy = options.sortBy;
      const sortOrder = options.sortOrder;

      let isValid = true;

      if (options.searchQuery) {
        isValid =
          title.includes(query) ||
          content.includes(query) ||
          category.includes(query) ||
          tags.some((tag) => tag.toLowerCase().includes(query));
      }

      if (options.categories.length > 0) {
        isValid = isValid && options.categories.includes(category);
      }

      if (options.tags.length > 0) {
        isValid = isValid && selectedTags.some((tag) => tags.includes(tag));
      }

      if (sortBy === 'newest') {
        const date = new Date(post.createdAt);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (sortOrder === 'desc') {
          isValid = isValid && days <= 30;
        } else {
          isValid = isValid && days >= 30;
        }
      }

      return isValid;
    });
    setFilteredPosts(filtered);
  };

  const handleSort = (sortOrder: string) => {
    setSortOrder(sortOrder);
    const sorted = filteredPosts.sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortOrder === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        return 0;
      }
    });
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
        value={sortOrder}
        onChange={(e) => handleSort(e.target.value)}
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
      </select>
      <button onClick={() => handleFilter(filterOptions)}>Filter</button>
      {filteredPosts.map((post) => (
        <div key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
          <p>Category: {post.category}</p>
          <p>Tags: {post.tags.join(', ')}</p>
        </div>
      ))}
    </div>
  );
}