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

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    const filteredData = await getCommunityPosts(1, query, selectedCategory, selectedTags);
    setFilteredPosts(filteredData);
    setHasMorePosts(true);
    setPageNumber(1);
  };

  const handleFilterChange = (category: string, tags: string[]) => {
    setSelectedCategory(category);
    setSelectedTags(tags);
    const filteredData = posts.filter((post) => {
      const categoryMatch = category === '' || post.category === category;
      const tagsMatch = tags.length === 0 || tags.some((tag) => post.tags.includes(tag));
      return categoryMatch && tagsMatch;
    });
    setFilteredPosts(filteredData);
  };

  const handleSortChange = (sortBy: string, sortOrder: string) => {
    setSortOrder(sortBy);
    const sortedData = filteredPosts.sort((a, b) => {
      if (sortBy === 'newest') {
        return sortOrder === 'desc' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt;
      } else if (sortBy === 'oldest') {
        return sortOrder === 'desc' ? a.createdAt - b.createdAt : b.createdAt - a.createdAt;
      } else if (sortBy === 'mostReactions') {
        return sortOrder === 'desc' ? b.reactions.length - a.reactions.length : a.reactions.length - b.reactions.length;
      } else if (sortBy === 'leastReactions') {
        return sortOrder === 'desc' ? a.reactions.length - b.reactions.length : b.reactions.length - a.reactions.length;
      }
      return 0;
    });
    setFilteredPosts(sortedData);
  };

  return (
    <div>
      <h1>Community Page</h1>
      <input
        type="search"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search posts"
      />
      <select value={selectedCategory} onChange={(e) => handleFilterChange(e.target.value, selectedTags)}>
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <select multiple value={selectedTags} onChange={(e) => handleFilterChange(selectedCategory, Array.from(e.target.selectedOptions, (option) => option.value))}>
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
        <option value="leastReactions">Least reactions</option>
      </select>
      <select value={filterOptions.sortOrder} onChange={(e) => handleSortChange(sortOrder, e.target.value)}>
        <option value="desc">Descending</option>
        <option value="asc">Ascending</option>
      </select>
      {filteredPosts.map((post) => (
        <div key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
          <p>Reactions: {postReactions[post.id]?.length}</p>
          <p>Comments: {postComments[post.id]?.length}</p>
        </div>
      ))}
    </div>
  );
}