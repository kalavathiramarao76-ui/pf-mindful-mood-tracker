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
      const { category, tags, searchQuery, sortBy, sortOrder } = options;
      let match = true;
      if (category && postCategory !== category) {
        match = false;
      }
      if (tags.length > 0 && !tags.every((tag: string) => postTags.includes(tag))) {
        match = false;
      }
      if (searchQuery && !post.content.toLowerCase().includes(searchQuery.toLowerCase())) {
        match = false;
      }
      return match;
    });
    const sorted = filtered.sort((a: any, b: any) => {
      if (options.sortBy === 'newest') {
        return b.createdAt - a.createdAt;
      } else if (options.sortBy === 'oldest') {
        return a.createdAt - b.createdAt;
      } else if (options.sortBy === 'mostReactions') {
        return b.reactions.length - a.reactions.length;
      } else if (options.sortBy === 'mostComments') {
        return b.comments.length - a.comments.length;
      }
      return 0;
    });
    setFilteredPosts(sorted);
  };

  const handleSort = (sort: string) => {
    setSortOrder(sort);
    const sorted = filteredPosts.sort((a: any, b: any) => {
      if (sort === 'newest') {
        return b.createdAt - a.createdAt;
      } else if (sort === 'oldest') {
        return a.createdAt - b.createdAt;
      } else if (sort === 'mostReactions') {
        return b.reactions.length - a.reactions.length;
      } else if (sort === 'mostComments') {
        return b.comments.length - a.comments.length;
      }
      return 0;
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
        value={filterOptions.category}
        onChange={(e) => handleFilter({ ...filterOptions, category: e.target.value })}
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
        onChange={(e) => handleFilter({ ...filterOptions, tags: Array.from(e.target.selectedOptions, (option) => option.value) })}
      >
        {tags.map((tag) => (
          <option key={tag} value={tag}>
            {tag}
          </option>
        ))}
      </select>
      <button onClick={() => handleSort('newest')}>Newest</button>
      <button onClick={() => handleSort('oldest')}>Oldest</button>
      <button onClick={() => handleSort('mostReactions')}>Most Reactions</button>
      <button onClick={() => handleSort('mostComments')}>Most Comments</button>
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