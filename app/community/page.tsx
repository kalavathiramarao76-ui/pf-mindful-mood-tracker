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
      setPageNumber((prevPageNumber) => prevPageNumber + 1);
      setLoading(false);
      setIsFetching(false);
    };

    if (isFetching) {
      fetchPosts();
    }
  }, [isFetching, pageNumber, loading]);

  return (
    <div>
      {posts.map((post) => (
        <div key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </div>
      ))}
      {loading && (
        <div>
          <p>Loading...</p>
        </div>
      )}
      {hasMorePosts && !loading && (
        <div>
          <p>Scroll to load more...</p>
        </div>
      )}
    </div>
  );
}