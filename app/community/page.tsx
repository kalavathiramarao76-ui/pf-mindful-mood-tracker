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

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    const filteredData = await filterPosts(query, filterOptions);
    setFilteredPosts(filteredData);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilterOptions((prevOptions) => ({ ...prevOptions, [key]: value }));
    const filteredData = filterPosts(searchQuery, { ...filterOptions, [key]: value });
    setFilteredPosts(filteredData);
  };

  const filterPosts = async (query: string, options: any) => {
    const filteredData = posts.filter((post) => {
      const categoryMatch = options.categories.length === 0 || options.categories.includes(post.category);
      const tagMatch = options.tags.length === 0 || post.tags.some((tag) => options.tags.includes(tag));
      const searchMatch = query === '' || post.content.toLowerCase().includes(query.toLowerCase());
      const sortByMatch = options.sortBy === 'newest' ? post.createdAt : post[options.sortBy];
      const sortOrderMatch = options.sortOrder === 'desc' ? sortByMatch >= options.sortBy : sortByMatch <= options.sortBy;
      return categoryMatch && tagMatch && searchMatch && sortOrderMatch;
    });
    return filteredData;
  };

  const handleSortChange = (sortBy: string) => {
    setSortOrder(sortBy);
    const sortedData = filteredPosts.sort((a, b) => {
      if (sortBy === 'newest') {
        return b.createdAt - a.createdAt;
      } else {
        return a[sortBy] - b[sortBy];
      }
    });
    setFilteredPosts(sortedData);
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
        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="mostReactions">Most Reactions</option>
        <option value="mostComments">Most Comments</option>
      </select>
      <select
        value={filterOptions.sortOrder}
        onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
      >
        <option value="desc">Descending</option>
        <option value="asc">Ascending</option>
      </select>
      <ul>
        {filteredPosts.map((post) => (
          <li key={post.id}>
            <h2>{post.title}</h2>
            <p>{post.content}</p>
            <p>Category: {post.category}</p>
            <p>Tags: {post.tags.join(', ')}</p>
            <p>Reactions: {postReactions[post.id].length}</p>
            <p>Comments: {postComments[post.id].length}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}