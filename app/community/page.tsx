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
  }, [pathname, pageNumber]);

  const handleScroll = () => {
    if (hasMorePosts && !loading) {
      const scrollPosition = window.scrollY + window.innerHeight;
      const documentHeight = document.body.offsetHeight;
      if (scrollPosition >= documentHeight * 0.8) {
        setIsFetching(true);
        setPageNumber((prevPageNumber) => prevPageNumber + 1);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMorePosts, loading]);

  useEffect(() => {
    if (isFetching) {
      const fetchMorePosts = async () => {
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
        setIsFetching(false);
      };
      fetchMorePosts();
    }
  }, [isFetching, pageNumber]);

  return (
    <div>
      {loading && <div>Loading...</div>}
      {filteredPosts.map((post) => (
        <div key={post.id}>{post.content}</div>
      ))}
      {isFetching && <div>Loading more posts...</div>}
    </div>
  );
}