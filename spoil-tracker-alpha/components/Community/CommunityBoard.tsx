/**
 * CommunityBoard Component
 *
 * This component renders the Community Board view, which displays:
 * - Popular Foods and Seasonal Produce sections (horizontal FlatLists)
 * - Featured Meal Plans (community grocery lists)
 * - Community Posts (paginated list of posts)
 *
 * It also provides modals for creating a new post and for viewing a grocery list in detail.
 * The component supports sorting, filtering, and pagination for posts and grocery lists.
 *
 * External services used:
 * - CommunityService: Functions to fetch community data, create posts, update likes, etc.
 * - AccountService: Functions to fetch account details and manage liked posts/lists.
 * - FoodGlobalService: Functions to fetch food items and determine popular/seasonal items.
 *
 */

import React, { useState, useEffect, useCallback, } from 'react';
import {
  SafeAreaView,
  SectionList,
  FlatList,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Pressable,
  TextInput,
  Dimensions,
  Image,
  Platform,
  ScrollView,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import ViewGroceryList from '@/components/GroceryList/ListUI_Community';
import {
  getCommunity,
  createPost,
  incrementPostLikes,
  decrementPostLikes,
  deletePost,
  incrementCopiedGroceryListLikes,
  removeCopiedGroceryList,
  addCommentToPost,
  fetchPopularFoods,
  fetchSeasonalFoods,
  decrementCopiedGroceryListLikes
} from './CommunityService';
import {
  getAccountByOwnerID,
  addLikedPost,
  removeLikedPost,
  addLikedCommunityGroceryList,
  removeLikedCommunityGroceryList,
  getAccountNameByID,
} from '../Account/AccountService';
import { useAuth } from '@/services/authContext';
import { getAllFoodGlobal, FoodGlobal } from '@/components/Food/FoodGlobalService';
import { getTotalTimesBought, getTotalTimesEaten, getTotalTimesTossed } from '../Food/FoodLeaderboardService';
import { useFocusEffect } from 'expo-router';

// ===== Type Definitions =====

// Comment and Post interfaces.
interface Comment {
  account_id: string;
  message: string;
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  likes: number;
  account_id: string;
  createdAt: string;
  comments: Comment[];
}

// GroceryListItem and GroceryList (full schema).
export interface GroceryListItem {
  id: string;
  food_name: string;
  food_global_id: string;
  measurement: string;
  quantity: number;
  isBought: boolean;
  description: string;
  imageUrl: string;
}

export interface GroceryList {
  account_id: string;
  id: string;
  createdAt: string;
  last_opened: string;
  grocerylist_name: string;
  description: string;
  grocery_list_items: GroceryListItem[];
  isFamily: boolean;
  isShared: boolean;
  isComplete: boolean;
  snapshotAt?: string;
}

// CommunityData interface.
interface CommunityData {
  posts: Post[];
  copiedGroceryLists: GroceryList[];
}

// Account interface.
interface Account {
  id: string;
  owner_id: string;
  likedPosts: string[];
  likedCommunityGroceryLists: string[];
  // ... other fields if needed
}

// SectionData interface for SectionList (each section has a title and a data array).
interface SectionData {
  title: string;
  data: any[]; // For food sections, this will be a dummy array with one item.
}

// Our union type for items in the SectionList.
type SectionItem = 
  | { bought: number; eaten: number; tossed: number }
  | FoodGlobal
  | GroceryList
  | Post;

interface CustomSection {
  title: string;
  data: SectionItem[];
}

const PostItem = React.memo(({ 
  item, 
  account,
  accountNames, 
  commentInput, 
  onToggleLike, 
  onDelete, 
  onSubmitComment, 
  onCommentChange 
}: {
  item: Post;
  account: Account | null;
  accountNames: Record<string,string>;
  commentInput: string;
  onToggleLike: (postId: string) => void;
  onDelete: (postId: string) => void;
  onSubmitComment: (postId: string) => void;
  onCommentChange: (postId: string, text: string) => void;
}) => {
  const formattedDate = new Date(item.createdAt).toLocaleString();
  const displayName = accountNames[item.account_id] || item.account_id;
  const isOwner = account?.id === item.account_id;
  const hasLiked = account?.likedPosts.includes(item.id);

  const [localComments, setLocalComments] = useState<Comment[]>(item.comments);

  // ── 2) When the parent ever *does* pass in new item.comments (e.g. on full reload),
  //       sync them in.  This keeps localComments up to date if you ever do a full refetch.
  useEffect(() => {
    setLocalComments(item.comments);
  }, [item.comments]);

  const handleAddComment = async () => {
    // you still call the API
    await onSubmitComment(item.id);
    // then locally append
    setLocalComments(c => [
      ...c,
      {
        account_id: account!.id,
        message: commentInput,
        createdAt: new Date().toISOString(),
      }
    ]);
    // and clear the input
    onCommentChange(item.id, '');
  };
  
  return (
    <View style={styles.postCard}>
      <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.postContent}>{item.content}</Text>
        <Text style={styles.postMeta}>
          By: {displayName} | Posted on: {formattedDate}
        </Text>
        <View style={styles.postActions}>
          {!isOwner && (
            <TouchableOpacity style={styles.actionButton} onPress={() => onToggleLike(item.id)}>
              <Text style={styles.actionButtonText}>{hasLiked ? 'Unlike' : 'Like'}</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.postMeta}>Likes: {item.likes}</Text>
          {isOwner && (
            <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => onDelete(item.id)}>
              <Text style={styles.actionButtonText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.commentInputRow}>
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment..."
            value={commentInput}
            onChangeText={(text) =>
              onCommentChange(item.id, text)
            }
          />
          <TouchableOpacity style={styles.commentSubmitButton} onPress={handleAddComment}>
            <Text style={styles.commentSubmitButtonText}>&gt;</Text>
          </TouchableOpacity>
        </View>
        {localComments.length > 0 && (
          <ScrollView
            style={styles.commentScroll}
            contentContainerStyle={styles.commentContainer}
            nestedScrollEnabled={true}       // for Android inner‑scroll
          >
            {localComments.map((comment, idx) => {
              const commenter = accountNames[comment.account_id] || comment.account_id;
              return (
                <Text key={idx} style={styles.commentText}>
                  {commenter}: {comment.message} (
                    {new Date(comment.createdAt).toLocaleDateString()}
                  )
                </Text>
              );
            })}
          </ScrollView>
        )}
    </View>
  );
});

const GroceryItem = React.memo(({
  item,
  account,
  onToggleLike,
  onDelete,
  onOpenModal
}: {
  item: GroceryList;
  account: Account | null;
  onToggleLike: (listId: string) => void;
  onDelete: (listId: string) => void;
  onOpenModal: (listId: string) => void;
}) => {
  const hasLiked = account?.likedCommunityGroceryLists.includes(item.id);
  const isOwner = account?.id === item.account_id;
  const likes = (item as any).likes || 0;
  
  return (
    <View style={styles.groceryCard}>
      <TouchableOpacity onPress={() => onOpenModal(item.id)} style={styles.cardContent}>
          <Text style={styles.groceryTitle}>{item.grocerylist_name}</Text>
          {item.description && (
            <Text style={styles.groceryDescription} numberOfLines={3} ellipsizeMode="tail">
              {item.description}
            </Text>
          )}
          {item.snapshotAt && (
            <Text style={styles.snapshotText}>
              Posted: {new Date(item.snapshotAt).toLocaleString()}
            </Text>
          )}
        </TouchableOpacity>
        <View style={styles.buttonRow}>
          {isOwner ? (
            <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => onDelete(item.id)}>
              <Text style={styles.actionButtonText}>Delete</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.actionButton} onPress={() => onToggleLike(item.id)}>
              <Text style={styles.actionButtonText}>{hasLiked ? 'Unlike' : 'Like'}</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.likeCounterContainer}>
          <Text style={styles.likeCounterText}>Likes: {likes}</Text>
        </View>
    </View>
  );
});

// ==============================

const CommunityBoard: React.FC = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width); // Store screen width
  const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height); // Store screen width

  // Community data and account state.
  const [communityData, setCommunityData] = useState<CommunityData | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Modal state for creating a new post.
  const [postModalVisible, setPostModalVisible] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newContent, setNewContent] = useState<string>('');

  // Comment inputs for posts (keyed by post ID).
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});

  // Modal state for viewing a grocery list.
  const [groceryModalVisible, setGroceryModalVisible] = useState<boolean>(false);
  const [selectedGroceryListId, setSelectedGroceryListId] = useState<string | null>(null);

  // Pagination state for posts.
  const [currentPostPage, setCurrentPostPage] = useState<number>(1);
  const postsPerPage = 5;

  // Search and sort state for posts.
  const [postSearchQuery, setPostSearchQuery] = useState('');
  const [postSortOption, setPostSortOption] = useState<'likes' | 'alphabetical' | 'date-asc' | 'date-desc'>('date-desc');

  // Search and sort state for grocery lists.
  const [grocerySearchQuery, setGrocerySearchQuery] = useState('');
  const [grocerySortOption, setGrocerySortOption] = useState<'likes' | 'alphabetical' | 'date-asc' | 'date-desc'>('date-desc');

  // <-- New: State for food sections.
  const [popularFoods, setPopularFoods] = useState<FoodGlobal[]>([]);
  const [seasonalProduce, setSeasonalProduce] = useState<FoodGlobal[]>([]);
  const [loadingFood, setLoadingFood] = useState<boolean>(true);

  const [accountNames, setAccountNames] = useState<Record<string,string>>({});

  const [totals, setTotals] = useState<{
    bought: number;
    eaten: number;
    tossed: number;
  } | null>(null);
  const [loadingTotals, setLoadingTotals] = useState(true);

  

  /**
   * fetchCommunityData
   *
   * Retrieves the community data from the backend and updates the state.
   */
  const fetchCommunityData = async (): Promise<void> => {
    try {
      const data: CommunityData = await getCommunity();
      setCommunityData(data);
    } catch (error) {
      console.error('Error fetching community feed: ', error);
    }
  };

  /**
   * fetchAccountData
   *
   * Retrieves the account data based on the current user.
   */
  const fetchAccountData = async (): Promise<void> => {
    if (user) {
      try {
        const acc = await getAccountByOwnerID(user.uid);
        setAccount(acc);
      } catch (error) {
        console.error('Error fetching account: ', error);
      }
    }
  };

  // Fetch account data when the user changes.
  useEffect(() => {
    fetchAccountData();
  }, [user]);


  /**
   * Fetch food details for the Popular Foods and Seasonal Produce sections.
   */
  useEffect(() => {
    const onChange = () => {
      setScreenWidth(Dimensions.get('window').width);
      setScreenHeight(Dimensions.get('window').height);
    };
    const dimensionsHandler = Dimensions.addEventListener('change', onChange);
    return () => dimensionsHandler.remove();
  }, []);

  // Fetch community data on focus
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      setInitialLoading(true);
      getCommunity()
        .then(data => { if (isActive) setCommunityData(data); })
        .catch(console.error)
        .finally(() => { if (isActive) setInitialLoading(false); });
      return () => { isActive = false; };
    }, [])
  );

  // Fetch food for sections
  useEffect(() => {
    (async () => {
      setLoadingFood(true);
      try {
        const allItems = await getAllFoodGlobal();
        const popIds = await fetchPopularFoods();
        const secIds = await fetchSeasonalFoods();
        setPopularFoods(allItems.filter((i: { id: any; }) => popIds.includes(i.id)));
        setSeasonalProduce(allItems.filter((i: { id: any; }) => secIds.includes(i.id)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingFood(false);
      }
    })();
  }, []);

  // Fetch totals
  useEffect(() => {
    (async () => {
      setLoadingTotals(true);
      try {
        const [b, e, t] = await Promise.all([
          getTotalTimesBought(),
          getTotalTimesEaten(),
          getTotalTimesTossed(),
        ]);
        setTotals({ bought: b, eaten: e, tossed: t });
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingTotals(false);
      }
    })();
  }, []);

  // Fetch missing account names
  useEffect(() => {
    if (!communityData) return;
    const ids = new Set<string>();
    communityData.posts.forEach(p => { ids.add(p.account_id); p.comments.forEach(c => ids.add(c.account_id)); });
    const toFetch = Array.from(ids).filter(id => !accountNames[id]);
    if (!toFetch.length) return;
    Promise.all(
      toFetch.map(id => getAccountNameByID(id).then(name => ({ id, name })).catch(() => null))
    ).then(results => {
      const upd: Record<string,string> = {};
      results.forEach(r => { if (r) upd[r.id] = r.name; });
      setAccountNames(prev => ({ ...prev, ...upd }));
    });
  }, [communityData]);

  const handleTogglePostLike = useCallback(async (postId: string) => {
    if (!account) return;
    const hasLiked = account.likedPosts.includes(postId);
    try {
      if (hasLiked) {
        await removeLikedPost(account.id, postId);
        await decrementPostLikes(postId);
      } else {
        await addLikedPost(account.id, postId);
        await incrementPostLikes(postId);
      }
      setAccount(acc => ({
        ...acc!,
        likedPosts: hasLiked ? acc!.likedPosts.filter(i => i !== postId) : [...acc!.likedPosts, postId]
      }));
      setCommunityData(cd => ({
        ...cd!,
        posts: cd!.posts.map(p => p.id === postId ? { ...p, likes: p.likes + (hasLiked ? -1 : 1) } : p)
      }));
    } catch (err) {
      console.error(err);
    }
  }, [account]);

  // Modal open/close functions for post creation.
  const openPostModal = (): void => setPostModalVisible(true);
  const closePostModal = (): void => {
    setPostModalVisible(false);
    setNewTitle('');
    setNewContent('');
  };

  /**
   * handleCreatePost
   *
   * Creates a new post by invoking the createPost service and refreshes the community data.
   */
  const handleCreatePost = async (): Promise<void> => {
    if (!newTitle || !newContent || !account) {
      alert('Please fill all fields and ensure your account is loaded.');
      return;
    }
    try {
      await createPost({ title: newTitle, content: newContent, account_id: account.id });
      await fetchCommunityData();
      closePostModal();
      setCurrentPostPage(1);
    } catch (error) {
      console.error('Error creating post: ', error);
    }
  };

  /**
   * handleSubmitComment
   *
   * Submits a comment for a specific post.
   *
   * @param postId - The ID of the post to comment on.
   */
  const handleSubmitComment = useCallback(async (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text || !account) return;
    try {
      await addCommentToPost(postId, account.id, text);
      setCommunityData(cd => {
        if (!cd) return cd;
        const newC = { account_id: account.id, message: text, createdAt: new Date().toISOString() };
        return {
          ...cd,
          posts: cd.posts.map(p => p.id === postId ? { ...p, comments: [...p.comments, newC] } : p)
        };
      });
      setCommentInputs(ci => ({ ...ci, [postId]: '' }));
    } catch (err) {
      console.error(err);
    }
  }, [account, commentInputs]);

  /**
   * handleToggleGroceryLike
   *
   * Toggles the like status for a community grocery list.
   *
   * @param groceryListId - The ID of the grocery list.
   */
  const handleToggleGroceryLike = useCallback(async (groceryListId: string) => {
    if (!account) return;
    try {
      if (account.likedCommunityGroceryLists.includes(groceryListId)) {
        await removeLikedCommunityGroceryList(account.id, groceryListId);
        await decrementCopiedGroceryListLikes(groceryListId);
      } else {
        await addLikedCommunityGroceryList(account.id, groceryListId);
        await incrementCopiedGroceryListLikes(groceryListId);
      }
      // refetch account & data
      const acc = await getAccountByOwnerID(account.id);
      setAccount(acc);
      const data = await getCommunity();
      setCommunityData(data);
    } catch (err) {
      console.error(err);
    }
  }, [account]);

  /**
   * handleDeletePost
   *
   * Deletes a community post.
   *
   * @param postId - The ID of the post to delete.
   */
  const handleDeletePost = useCallback(async (postId: string) => {
    try {
      await deletePost(postId);
      const data = await getCommunity();
      setCommunityData(data);
      setCurrentPostPage(1);
    } catch (err) {
      console.error(err);
    }
  }, []);

  /**
   * handleDeleteGroceryList
   *
   * Deletes a community grocery list.
   *
   * @param groceryListId - The ID of the grocery list to delete.
   */
  const handleDeleteGroceryList = useCallback(async (groceryListId: string) => {
    try {
      await removeCopiedGroceryList(groceryListId);
      const data = await getCommunity();
      setCommunityData(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Functions to open/close the grocery list modal.
  const openGroceryModal = (listId: string): void => {
    setSelectedGroceryListId(listId);
    setGroceryModalVisible(true);
  };

  const closeGroceryModal = (): void => {
    setGroceryModalVisible(false);
    setSelectedGroceryListId(null);
  };

  const renderItem = React.useCallback(
    ({ item, section }: { item: SectionItem; section: CustomSection }) => {
      if (section.title === 'Popular Foods' || section.title === 'Seasonal Produce') {
        return null;
      }
      switch (section.title) {
        case "Spoil Tracker Activity":
          if (loadingTotals || !totals) {
            return <ActivityIndicator size="small" color="#2196F3" />;
          }
          return (
            <View style={styles.totalsContainer}>
              <Text style={[styles.totalsText, {color: '#007bff'}]}>Products have been bought...</Text>
              <Text style={[styles.totalsText, {color: '#007bff', fontSize: 30}]}>{totals.bought} times </Text>
              <Text style={[styles.totalsText, {color: '#007bff'}]}>...from Spoil Tracker grocery lists.</Text>
              <View style={{marginVertical: 10}}></View>

              <Text style={[styles.totalsText, {color: '#39913b'}]}>Products have been eaten...</Text>
              <Text style={[styles.totalsText, {color: '#39913b', fontSize: 30}]}>{totals.eaten} times </Text>
              <Text style={[styles.totalsText, {color: '#39913b'}]}>...from Spoil Tracker pantries.</Text>
              <View style={{marginVertical: 10}}></View>

              <Text style={[styles.totalsText, {color: '#39913b'}]}>Products have been tossed...</Text>
              <Text style={[styles.totalsText, {color: '#39913b', fontSize: 30}]}>{totals.tossed} times </Text>
              <Text style={[styles.totalsText, {color: '#39913b'}]}>...from Spoil Tracker pantries.</Text>
              <View style={{marginVertical: 10}}></View>
            </View>
          );

        case "Featured Meal Plans":
          return (
            <GroceryItem
              item={item as GroceryList}
              account={account}
              onToggleLike={handleToggleGroceryLike}
              onDelete={handleDeleteGroceryList}
              onOpenModal={openGroceryModal}
            />
          );

        case "Community Posts":
          return (
            <PostItem
              item={item as Post}
              account={account}
              accountNames={accountNames}
              commentInput={commentInputs[(item as Post).id] || ""}
              onToggleLike={handleTogglePostLike}
              onDelete={handleDeletePost}
              onSubmitComment={handleSubmitComment}
              onCommentChange={(postId, text) =>
                setCommentInputs((prev) => ({ ...prev, [postId]: text }))
              }
            />
          );

        default:
          return null;
      }
    },
    [
      loadingTotals,
      totals,
      loadingFood,
      account,
      commentInputs,
      handleToggleGroceryLike,
      handleDeleteGroceryList,
      openGroceryModal,
      handleTogglePostLike,
      handleDeletePost,
      handleSubmitComment,
    ]
  );

  // ---- Compute Filtered and Sorted Data for Posts ----
  const postsArray: Post[] = Object.values(communityData ? communityData.posts : {});
  const filteredPosts = postsArray.filter((post) => {
    const q = postSearchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(q) ||
      post.account_id.toLowerCase().includes(q) ||
      post.content.toLowerCase().includes(q)
    );
  });
  const sortedPosts = [...filteredPosts];
  switch (postSortOption) {
    case 'likes':
      sortedPosts.sort((a, b) => b.likes - a.likes);
      break;
    case 'alphabetical':
      sortedPosts.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'date-asc':
      sortedPosts.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      break;
    case 'date-desc':
    default:
      sortedPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
  }

  // ---- Compute Filtered and Sorted Data for Grocery Lists ----
  const groceryLists = communityData ? communityData.copiedGroceryLists : [];
  const sortedGroceries = React.useMemo(() => {
    const filtered = groceryLists.filter((gl) => {
      const q = grocerySearchQuery.toLowerCase();
      return (
        gl.grocerylist_name.toLowerCase().includes(q) ||
        (gl.description && gl.description.toLowerCase().includes(q))
      );
    });
    let sorted = [...filtered];
    switch (grocerySortOption) {
      case 'likes':
        sorted.sort((a, b) => ((b as any).likes || 0) - ((a as any).likes || 0));
        break;
      case 'alphabetical':
        sorted.sort((a, b) => a.grocerylist_name.localeCompare(b.grocerylist_name));
        break;
      case 'date-asc':
        sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'date-desc':
      default:
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }
    return sorted;
  }, [groceryLists, grocerySearchQuery, grocerySortOption]);

  // ---- Pagination for Posts ----
  const paginatedPosts = sortedPosts.slice(
    (currentPostPage - 1) * postsPerPage,
    currentPostPage * postsPerPage
  );

  // ---- Combine Sections for SectionList ----
  const sectionsData = React.useMemo<CustomSection[]>(() => [
    {
      title: 'Spoil Tracker Activity',
      data: totals ? [totals] : [],
    },
    { 
      title: 'Popular Foods', 
      data: popularFoods
    },
    { 
      title: 'Seasonal Produce', 
      data: seasonalProduce
    },
    { 
      title: 'Featured Meal Plans', 
      data: sortedGroceries
    },
    { 
      title: 'Community Posts', 
      data: paginatedPosts
    },
  ], [totals, popularFoods, seasonalProduce, sortedGroceries, paginatedPosts]);

  // Display a loading indicator if data is being fetched.
  if (initialLoading || !communityData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#2196F3" />
      </SafeAreaView>
    );
  }

  // Find the selected grocery list object based on the selected ID.
  const selectedGroceryList =
    selectedGroceryListId &&
    communityData.copiedGroceryLists.find((gl) => gl.id === selectedGroceryListId);
  
  

  return (
    <SafeAreaView style={[styles.container, { height: screenHeight - 125 }]}>
      <SectionList
        sections={sectionsData}
        stickySectionHeadersEnabled={false}
        keyExtractor={(item) => {
          // for posts & grocery lists, use their id
          if ('id' in item) return item.id;
          // for other sections (totals, foods), fall back to title or index
          return JSON.stringify(item);
        }}
        showsHorizontalScrollIndicator={false}
        extraData={communityData}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionHeader}>{section.title}</Text>
            { (section.title === 'Popular Foods' || section.title === 'Seasonal Produce') && (
              <FlatList<FoodGlobal>
                horizontal
                data={section.data as FoodGlobal[]}
                keyExtractor={item => item.id}
                renderItem={({ item: foodItem }) => (
                  <View style={styles.foodCard}>
                    <View style={styles.foodTextContainer}>
                      <Text style={styles.foodName}>{foodItem.food_name}</Text>
                    </View>
                    <Image
                      source={{ uri: foodItem.food_picture_url }}
                      style={styles.foodImage}
                    />
                  </View>
                )}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalSection}
              />
            )}
            {section.title === 'Community Posts' && (
              <>
                <View style={styles.searchSortContainer}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search posts..."
                    value={postSearchQuery}
                    onChangeText={setPostSearchQuery}
                  />
                  <View style={styles.sortButtonsContainer}>
                    <TouchableOpacity onPress={() => setPostSortOption('likes')}>
                      <Text style={[styles.sortButton, postSortOption === 'likes' && styles.sortButtonActive]}>
                        Likes
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setPostSortOption('alphabetical')}>
                      <Text style={[styles.sortButton, postSortOption === 'alphabetical' && styles.sortButtonActive]}>
                        A-Z
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setPostSortOption('date-asc')}>
                      <Text style={[styles.sortButton, postSortOption === 'date-asc' && styles.sortButtonActive]}>
                        Date ↑
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setPostSortOption('date-desc')}>
                      <Text style={[styles.sortButton, postSortOption === 'date-desc' && styles.sortButtonActive]}>
                        Date ↓
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {/* New Post Button */}
                <TouchableOpacity style={styles.newPostButton} onPress={openPostModal}>
                  <Text style={styles.newPostButtonText}>+ New Post</Text>
                </TouchableOpacity>
              </>
            )}
            {section.title === 'Featured Meal Plans' && (
              <View style={styles.searchSortContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search meal plans..."
                  value={grocerySearchQuery}
                  onChangeText={setGrocerySearchQuery}
                />
                <View style={styles.sortButtonsContainer}>
                  <TouchableOpacity onPress={() => setGrocerySortOption('likes')}>
                    <Text style={[styles.sortButton, grocerySortOption === 'likes' && styles.sortButtonActive]}>
                      Likes
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setGrocerySortOption('alphabetical')}>
                    <Text style={[styles.sortButton, grocerySortOption === 'alphabetical' && styles.sortButtonActive]}>
                      A-Z
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setGrocerySortOption('date-asc')}>
                    <Text style={[styles.sortButton, grocerySortOption === 'date-asc' && styles.sortButtonActive]}>
                      Date ↑
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setGrocerySortOption('date-desc')}>
                    <Text style={[styles.sortButton, grocerySortOption === 'date-desc' && styles.sortButtonActive]}>
                      Date ↓
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
        renderSectionFooter={({ section }) =>
          section.title === 'Community Posts' ? (
            <View style={styles.paginationContainer}>
              <TouchableOpacity
                disabled={currentPostPage <= 1}
                onPress={() => setCurrentPostPage((prev) => Math.max(prev - 1, 1))}
              >
                <Text style={[styles.paginationButton, currentPostPage <= 1 && styles.paginationDisabled]}>
                  Previous
                </Text>
              </TouchableOpacity>
              <Text style={styles.paginationInfo}>Page {currentPostPage}</Text>
              <TouchableOpacity
                disabled={currentPostPage >= Math.ceil(sortedPosts.length / postsPerPage)}
                onPress={() =>
                  setCurrentPostPage((prev) =>
                    Math.min(prev + 1, Math.ceil(sortedPosts.length / postsPerPage))
                  )
                }
              >
                <Text
                  style={[
                    styles.paginationButton,
                    currentPostPage >= Math.ceil(sortedPosts.length / postsPerPage) && styles.paginationDisabled,
                  ]}
                >
                  Next
                </Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        renderItem={renderItem}
        ListHeaderComponent={
          <>
            <Text style={styles.header}>Community Board</Text>
          </>
        }
      />
        

      {/* Modal for creating a new post */}
      <Modal visible={postModalVisible} animationType="fade" onRequestClose={closePostModal} transparent>
        <View style={[styles.modalOverlay, styles.modalContainer]}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Create New Post</Text>
            <TextInput style={styles.input} placeholder="Title" value={newTitle} onChangeText={setNewTitle} />
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Content"
              value={newContent}
              onChangeText={setNewContent}
              multiline
            />
            <TouchableOpacity style={styles.submitButton} onPress={handleCreatePost}>
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
            <Pressable onPress={closePostModal} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal for viewing a grocery list */}
      <Modal visible={groceryModalVisible} animationType="fade" onRequestClose={closeGroceryModal} transparent>
        <View style={[styles.modalOverlay, styles.modalContainer]}>
          <View style={[styles.modalContent, { backgroundColor: colors.background}]}>
            {selectedGroceryList ? (
              <ViewGroceryList groceryList={selectedGroceryList} />
            ) : (
              <Text style={styles.errorText}>Grocery list not found.</Text>
            )}
            <Pressable onPress={closeGroceryModal} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, maxWidth: 320 },
  listContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  header: {
    fontSize: 32,
    fontFamily: 'inter-bold',
    color: '#2196F3',
    textAlign: 'center',
    marginVertical: 20,
  },
  sectionHeaderContainer: {
    marginTop: 15,
    marginBottom: 5,
  },
  sectionHeader: {
    fontSize: 24,
    fontFamily: 'inter-bold',
    color: '#007bff',
    marginBottom: 5,
  },
  searchSortContainer: {
    marginBottom: 10,
  },
  searchInput: {
    borderColor: '#ccc',
    backgroundColor: 'white',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 5,
  },
  sortButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  sortButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#007bff',
    backgroundColor: 'white',
    borderRadius: 8,
    marginHorizontal: 5,
    color: '#007bff',
  },
  sortButtonActive: {
    backgroundColor: '#007bff',
    color: '#fff',
  },
  newPostButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  newPostButtonText: { color: '#fff', fontSize: 18, fontFamily: 'inter-bold' },
  postCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  postTitle: { fontSize: 20, fontFamily: 'inter-bold', color: '#007bff' },
  postContent: { fontSize: 13, color: '#333', marginVertical: 10 },
  postMeta: { fontSize: 12, color: '#555' },
  postActions: { flexDirection: 'row', marginTop: 10, justifyContent: 'space-between' },
  actionButton: {
    backgroundColor: '#28a745',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  deleteButton: { backgroundColor: '#d9534f' },
  actionButtonText: { color: '#fff', fontSize: 14, fontFamily: 'inter-bold' },
  commentInputRow: { flexDirection: 'row', marginTop: 8, alignItems: 'center' },
  commentInput: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
    fontSize: 14,
    color: '#333',
  },
  commentSubmitButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  commentSubmitButtonText: { color: '#fff', fontSize: 16, fontFamily: 'inter-bold' },
  commentContainer: { marginTop: 10, padding: 5, borderRadius: 5 },
  commentText: { fontSize: 12, color: '#333',marginBottom: 2 },
  groceryCard: {
    marginHorizontal: 5,
    backgroundColor: '#f3f3f3',
    padding: 10,
    borderRadius: 8,
    width: 180,
    height: 200,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardContent: { width: '100%', alignItems: 'center' },
  groceryTitle: {
    fontSize: 18,
    fontFamily: 'inter-bold',
    color: '#007bff',
    textAlign: 'center',
  },
  groceryDescription: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
    width: '100%',
  },
  snapshotText: { fontSize: 12, color: '#555', marginTop: 5 },
  buttonRow: { flexDirection: 'row', marginTop: 10, width: '100%', justifyContent: 'center' },
  likeCounterContainer: { marginTop: 1 },
  likeCounterText: { fontSize: 12, color: '#555' },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  paginationButton: { fontSize: 16, color: '#007bff' },
  paginationDisabled: { color: '#ccc' },
  paginationInfo: { fontSize: 16, color: '#333' },
  modalContainer: { flex: 1 },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    width: '90%',
    alignItems: 'center',
    maxWidth: 450,
    minHeight: Platform.OS === 'web' ? 0 : 525,
  },
  modalHeader: { fontSize: 24, fontFamily: 'inter-bold', color: '#007bff', marginBottom: 20 },
  input: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    fontSize: 14,
  },
  multilineInput: { height: 100, textAlignVertical: 'top' },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginVertical: 10,
  },
  submitButtonText: { color: '#fff', fontSize: 18, fontFamily: 'inter-bold' },
  closeButton: {
    backgroundColor: '#d9534f',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: { color: '#fff', fontSize: 18, fontFamily: 'inter-bold' },
  errorText: {
    fontSize: 20,
    color: 'red',
    textAlign: 'center',
    marginTop: 50,
  },
  horizontalSection: {
    marginVertical: 15,
  },
  foodCard: {
    backgroundColor: '#eef',
    padding: 15,
    borderRadius: 8,
    marginRight: 10,
    width: 200,
    flexDirection: 'row',
    alignItems: 'center',       // Vertically centers content.
    justifyContent: 'space-between', // Spaces out text and image.
  },
  foodName: {
    fontSize: 18,
    fontFamily: 'inter-bold',
    color: '#005',
  },
  foodDescription: {
    fontSize: 14,
    color: '#333',
    marginTop: 5,
  },
  foodImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginLeft: 10,             // Adds spacing between text and image.
  },
  foodTextContainer: {
    flex: 1,
    alignItems: 'flex-start',   // Ensures text is left-aligned.
  },
  totalsContainer: {
    backgroundColor: '#eef2f5',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10
  },
  totalsText: {
    fontSize: 16,
    fontFamily: 'inter-bold',
    color: '#333',
    marginBottom: 5
  },
  commentScroll: {
    maxHeight: 80,      // adjust to whatever makes sense in your card
  },
});

export default CommunityBoard;
