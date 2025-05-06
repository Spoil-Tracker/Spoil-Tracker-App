import { Resolver, Query, Mutation, Arg, Field, ObjectType, ID, InputType, Int } from "type-graphql";
import { db } from "../firestore";
import { COLLECTIONS } from "./CollectionNames";
import { GroceryList } from "./GroceryList";
import { GraphQLISODateTime } from "type-graphql";
import { FoodGlobal } from "./FoodGlobal";

// ---------------------------
// Post Type & Input Types
// ---------------------------

@ObjectType()
class Comment {
  @Field()
  account_id!: string;

  @Field()
  message!: string;

  @Field(() => GraphQLISODateTime)
  createdAt!: Date;
}

@ObjectType()
export class Post {
  @Field()
  id!: string;

  @Field()
  title!: string;

  @Field()
  content!: string;

  @Field(() => Int)
  likes!: number;

  @Field()
  account_id!: string;

  @Field(() => GraphQLISODateTime)
  createdAt!: Date;

  @Field(() => [Comment])
  comments!: Comment[];
}

@InputType()
class PostInput {
  @Field()
  title!: string;

  @Field()
  content!: string;

  @Field()
  account_id!: string;
}

@InputType()
class UpdatePostInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  content?: string;
}

// ---------------------------
// Community Grocery List Type
// ---------------------------

@ObjectType()
export class CommunityGroceryList extends GroceryList {
  @Field(() => Int)
  likes!: number;

  @Field(() => GraphQLISODateTime)
  snapshotAt!: Date;
}

// ---------------------------
// Community Type
// ---------------------------

@ObjectType()
export class Community {
  @Field(() => [Post])
  posts!: Post[];

  @Field(() => [CommunityGroceryList])
  copiedGroceryLists!: CommunityGroceryList[];

  @Field(() => GraphQLISODateTime)
  updated!: Date;

  @Field(() => [String])
  popular_foods!: string[];

  @Field(() => [String])
  seasonal_foods!: string[];
}

// ---------------------------
// Community Resolver
// ---------------------------

// Helper function to safely convert a Firestore timestamp to a Date.
function convertTimestamp(value: unknown): Date {
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as any).toDate === "function"
  ) {
    return (value as any).toDate();
  }
  return new Date(value as any);
}

@Resolver(Community)
export class CommunityResolver {
  private communityDocId = "community";

  /**
   * Helper function to convert Firestore Timestamps to native Date objects.
   */
  private convertTimestamps(communityData: Community): Community {
    communityData.posts = communityData.posts.map((post) => {
      post.createdAt = convertTimestamp(post.createdAt);
      post.comments = post.comments.map((comment) => {
        comment.createdAt = convertTimestamp(comment.createdAt);
        return comment;
      });
      return post;
    });
  
    communityData.copiedGroceryLists = communityData.copiedGroceryLists.map((gl) => {
      if (gl.snapshotAt) {
        gl.snapshotAt = convertTimestamp(gl.snapshotAt);
      }
      return gl;
    });
  
    // Convert the updated field as well.
    communityData.updated = convertTimestamp(communityData.updated);
  
    return communityData;
  }
  

  /**
   * Retrieves (or initializes) the community document.
   */
  private async getCommunityData(): Promise<Community> {
    const commRef = db.collection(COLLECTIONS.COMMUNITY).doc(this.communityDocId);
    const commDoc = await commRef.get();
    let communityData: Community;
    if (!commDoc.exists) {
      const initialCommunity: Community = {
        posts: [],
        copiedGroceryLists: [],
        updated: new Date(0),
        popular_foods: [],
        seasonal_foods: []
      };
      await commRef.set(initialCommunity);
      communityData = initialCommunity;
    } else {
      communityData = commDoc.data() as Community;
    }
    communityData = this.convertTimestamps(communityData);
    return communityData;
  }

  /**
   * Query to retrieve the entire community feed.
   */
  @Query(() => Community)
  async getCommunity(): Promise<Community> {
    return await this.getCommunityData();
  }

  /**
   * Mutation to create a new post.
   */
  @Mutation(() => Community)
  async createPost(
    @Arg("input", () => PostInput) input: PostInput
  ): Promise<Community> {
    const commRef = db.collection(COLLECTIONS.COMMUNITY).doc(this.communityDocId);
    const communityData = await this.getCommunityData();

    const newPostId = db.collection(COLLECTIONS.COMMUNITY).doc().id;
    const newPost: Post = {
      id: newPostId,
      title: input.title,
      content: input.content,
      likes: 0,
      account_id: input.account_id,
      comments: [],
      createdAt: new Date(),
    };

    communityData.posts.push(newPost);
    await commRef.update({ posts: communityData.posts });
    return communityData;
  }

  /**
   * Mutation to update a post's title or content.
   */
  @Mutation(() => Community)
  async updatePost(
    @Arg("post_id") post_id: string,
    @Arg("input", () => UpdatePostInput) input: UpdatePostInput
  ): Promise<Community> {
    const commRef = db.collection(COLLECTIONS.COMMUNITY).doc(this.communityDocId);
    const communityData = await this.getCommunityData();

    const postIndex = communityData.posts.findIndex((p) => p.id === post_id);
    if (postIndex === -1) {
      throw new Error(`Post with id ${post_id} does not exist.`);
    }

    if (input.title !== undefined) {
      communityData.posts[postIndex].title = input.title;
    }
    if (input.content !== undefined) {
      communityData.posts[postIndex].content = input.content;
    }

    await commRef.update({ posts: communityData.posts });
    return communityData;
  }

  /**
   * Mutation to increment the likes count of a post.
   */
  @Mutation(() => Community)
  async incrementPostLikes(
    @Arg("post_id") post_id: string
  ): Promise<Community> {
    const commRef = db.collection(COLLECTIONS.COMMUNITY).doc(this.communityDocId);
    const communityData = await this.getCommunityData();

    const postIndex = communityData.posts.findIndex((p) => p.id === post_id);
    if (postIndex === -1) {
      throw new Error(`Post with id ${post_id} does not exist.`);
    }

    communityData.posts[postIndex].likes += 1;
    await commRef.update({ posts: communityData.posts });
    return communityData;
  }

  /**
   * Mutation to decrement the likes of a post.
   */
  @Mutation(() => Community)
  async decrementPostLikes(
    @Arg("post_id") post_id: string
  ): Promise<Community> {
    const commRef = db.collection(COLLECTIONS.COMMUNITY).doc(this.communityDocId);
    const communityData = await this.getCommunityData();
    const postIndex = communityData.posts.findIndex((p) => p.id === post_id);
    if (postIndex === -1) {
      throw new Error(`Post with id ${post_id} does not exist.`);
    }
    if (communityData.posts[postIndex].likes > 0) {
      communityData.posts[postIndex].likes -= 1;
    }
    await commRef.update({ posts: communityData.posts });
    return communityData;
  }

  /**
   * Mutation to add a comment to a specific post.
   */
  @Mutation(() => Community)
  async addCommentToPost(
    @Arg("post_id") post_id: string,
    @Arg("account_id") account_id: string,
    @Arg("message") message: string
  ): Promise<Community> {
    const commRef = db.collection(COLLECTIONS.COMMUNITY).doc(this.communityDocId);
    const communityData = await this.getCommunityData();

    const postIndex = communityData.posts.findIndex((p) => p.id === post_id);
    if (postIndex === -1) {
      throw new Error(`Post with id ${post_id} does not exist.`);
    }

    const newComment: Comment = {
      account_id,
      message,
      createdAt: new Date(),
    };

    communityData.posts[postIndex].comments.push(newComment);
    await commRef.update({ posts: communityData.posts });
    return communityData;
  }

  /**
   * Mutation to delete a post.
   */
  @Mutation(() => Community)
  async deletePost(
    @Arg("post_id") post_id: string
  ): Promise<Community> {
    const commRef = db.collection(COLLECTIONS.COMMUNITY).doc(this.communityDocId);
    let communityData = await this.getCommunityData();

    communityData.posts = communityData.posts.filter((p) => p.id !== post_id);
    await commRef.update({ posts: communityData.posts });
    return communityData;
  }

  /**
   * Mutation to add a copied grocery list to the community.
   */
  @Mutation(() => Community)
  async addCopiedGroceryList(
    @Arg("grocery_list_id") grocery_list_id: string
  ): Promise<Community> {
    const groceryListDoc = await db.collection(COLLECTIONS.GROCERYLIST).doc(grocery_list_id).get();
    if (!groceryListDoc.exists) {
      throw new Error(`Grocery list with id ${grocery_list_id} does not exist.`);
    }
    
    const original = groceryListDoc.data() as GroceryList;
    
    const snapshotGroceryList: GroceryList & { snapshotAt: Date } = {
      id: original.id,
      account_id: original.account_id,
      createdAt: typeof original.createdAt === "string" ? original.createdAt : new Date((original.createdAt as any).toDate()).toISOString(),
      last_opened: typeof original.last_opened === "string" ? original.last_opened : new Date((original.last_opened as any).toDate()).toISOString(),
      grocerylist_name: original.grocerylist_name,
      description: original.description,
      grocery_list_items: original.grocery_list_items.map(item => ({ ...item })),
      isFamily: original.isFamily,
      isShared: original.isShared,
      isComplete: original.isComplete,
      snapshotAt: new Date(),
    };
  
    const communityGroceryList: CommunityGroceryList & { snapshotAt: Date } = {
      ...snapshotGroceryList,
      likes: 0,
    };
  
    const commRef = db.collection(COLLECTIONS.COMMUNITY).doc(this.communityDocId);
    const communityData = await this.getCommunityData();
  
    const alreadyCopied = communityData.copiedGroceryLists.some(gl => gl.id === communityGroceryList.id);
    if (alreadyCopied) {
      throw new Error(`Grocery list with id ${grocery_list_id} is already copied.`);
    }
  
    communityData.copiedGroceryLists.push(communityGroceryList);
    await commRef.update({ copiedGroceryLists: communityData.copiedGroceryLists });
    return communityData;
  }

  /**
   * Mutation to increment the likes of a copied grocery list.
   */
  @Mutation(() => Community)
  async incrementCopiedGroceryListLikes(
    @Arg("grocery_list_id") grocery_list_id: string
  ): Promise<Community> {
    const commRef = db.collection(COLLECTIONS.COMMUNITY).doc(this.communityDocId);
    const communityData = await this.getCommunityData();

    const listIndex = communityData.copiedGroceryLists.findIndex(
      (gl) => gl.id === grocery_list_id
    );
    if (listIndex === -1) {
      throw new Error(`Copied grocery list with id ${grocery_list_id} does not exist.`);
    }

    communityData.copiedGroceryLists[listIndex].likes += 1;
    await commRef.update({ copiedGroceryLists: communityData.copiedGroceryLists });
    return communityData;
  }

  /**
   * Mutation to decrement the likes of a copied grocery list.
   */
  @Mutation(() => Community)
  async decrementCopiedGroceryListLikes(
    @Arg("grocery_list_id") grocery_list_id: string
  ): Promise<Community> {
    const commRef = db.collection(COLLECTIONS.COMMUNITY).doc(this.communityDocId);
    const communityData = await this.getCommunityData();

    const listIndex = communityData.copiedGroceryLists.findIndex(
      (gl) => gl.id === grocery_list_id
    );
    if (listIndex === -1) {
      throw new Error(`Copied grocery list with id ${grocery_list_id} does not exist.`);
    }

    // Decrement likes if above zero.
    if (communityData.copiedGroceryLists[listIndex].likes > 0) {
      communityData.copiedGroceryLists[listIndex].likes -= 1;
    }

    await commRef.update({ copiedGroceryLists: communityData.copiedGroceryLists });
    return communityData;
  }

  /**
   * Mutation to remove a copied grocery list from the community.
   */
  @Mutation(() => Community)
  async removeCopiedGroceryList(
    @Arg("grocery_list_id") grocery_list_id: string
  ): Promise<Community> {
    const commRef = db.collection(COLLECTIONS.COMMUNITY).doc(this.communityDocId);
    const communityData = await this.getCommunityData();

    communityData.copiedGroceryLists = communityData.copiedGroceryLists.filter(
      (gl) => gl.id !== grocery_list_id
    );
    await commRef.update({ copiedGroceryLists: communityData.copiedGroceryLists });
    return communityData;
  }

  /**
   * Helper to fetch popular food IDs using OpenAI's API logic.
   */
  private async fetchPopularItemIds(apiKey: string): Promise<string[]> { 
    try {
      const foodSnapshot = await db.collection(COLLECTIONS.FOOD_GLOBAL).get();
      const items = foodSnapshot.docs.map(doc => doc.data() as FoodGlobal);
      const dataStr = JSON.stringify(items, null, 2);
      const prompt = `Given the following JSON data of food items:
${dataStr}

Please identify and return only the IDs of the items that are currently trending or popular worldwide as of right now. Output the IDs as a comma-separated list without any additional text. Do not add any extra sentences.`;

      const messages = [
        { role: 'system', content: 'Filter the provided JSON data and return the IDs of items that are popular worldwide as a comma-separated list. Sort the list so that the most popular food ID is listed first. Do not add any extra sentences. Maximum limit of 5 IDs.' },
        { role: 'system', content: 'Consider recent/current social media or political trends when determining popularity.' },
        { role: 'user', content: prompt }
      ];

      const url = 'https://api.openai.com/v1/chat/completions';
      const body = {
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.4,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.choices && data.choices.length > 0) {
        const output = data.choices[0].message.content;
        console.log("Popular Foods Output:", output);
        return output.split(',')
          .map((id: string) => id.trim())
          .filter((id: string) => id.length > 0);
      }
      return [];
    } catch (error) {
      console.error('Error in fetchPopularItemIds:', error);
      return [];
    }
  }

  /**
   * Helper to fetch seasonal produce IDs using OpenAI's API logic.
   */
  private async fetchSeasonalProduceIds(apiKey: string): Promise<string[]> {
    try {
      const foodSnapshot = await db.collection(COLLECTIONS.FOOD_GLOBAL).get();
      const items = foodSnapshot.docs.map(doc => doc.data() as FoodGlobal);
      const dataStr = JSON.stringify(items, null, 2);
      const prompt = `Given the following JSON data of food items:
${dataStr}

Please identify and return only the IDs of the produce (fruits and vegetables) items that are currently in season. Do not include anything that is not a fruit or vegetable. Output the IDs as a comma-separated list without any additional text.`;

      const messages = [
        { role: 'system', content: 'Filter the provided JSON data and return the IDs of the produce items that are in season as a comma-separated list.' },
        { role: 'system', content: 'Do not include an ID of an item that is not a fruit or vegetable. (Ex. cereal is not a vegetable or fruit, beef is not a vegetable or fruit because it\'s a meat, etc. Peanut butter is not a seasonal item either since it is not a fruit or vegetable. Consider the item itself rather than the products that compose it.)' },
        { role: 'system', content: 'If fruit and vegetables are in season, they are being produced in the area and are available and ready to eat.' },
        { role: 'user', content: prompt }
      ];

      const url = 'https://api.openai.com/v1/chat/completions';
      const body = {
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.choices && data.choices.length > 0) {
        const output = data.choices[0].message.content;
        console.log("Seasonal Produce Output:", output);
        return output.split(',')
          .map((id: string) => id.trim())
          .filter((id: string) => id.length > 0);
      }
      return [];
    } catch (error) {
      console.error('Error in fetchSeasonalProduceIds:', error);
      return [];
    }
  }

  /**
   * Refreshes the popular_foods and seasonal_foods if the last update was over a week ago.
   */
  private async refreshFoodFieldsIfStale(communityData: Community, apiKey: string): Promise<Community> {
    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    const now = new Date();
    if (!communityData.updated || now.getTime() - communityData.updated.getTime() >= ONE_WEEK_MS) {
      const [newPopularFoods, newSeasonalFoods] = await Promise.all([
        this.fetchPopularItemIds(apiKey),
        this.fetchSeasonalProduceIds(apiKey)
      ]);
      communityData.popular_foods = newPopularFoods;
      communityData.seasonal_foods = newSeasonalFoods;
      const newUpdatedDate = new Date();
      communityData.updated = newUpdatedDate;
      const commRef = db.collection(COLLECTIONS.COMMUNITY).doc(this.communityDocId);
      await commRef.update({
        popular_foods: newPopularFoods,
        seasonal_foods: newSeasonalFoods,
        updated: newUpdatedDate
      });
    }
    return communityData;
  }

  /**
   * Query to get popular_foods.
   * If the "updated" timestamp is at least 1 week old, refreshes both popular_foods and seasonal_foods.
   */
  @Query(() => [String])
  async getPopularFoods( 
    @Arg("apiKey") apiKey: string
  ): Promise<string[]> {
    let communityData = await this.getCommunityData();
    communityData = await this.refreshFoodFieldsIfStale(communityData, apiKey);
    return communityData.popular_foods;
  }

  /**
   * Query to get seasonal_foods.
   * If the "updated" timestamp is at least 1 week old, refreshes both popular_foods and seasonal_foods.
   */
  @Query(() => [String])
  async getSeasonalFoods(
    @Arg("apiKey") apiKey: string
  ): Promise<string[]> {
    let communityData = await this.getCommunityData();
    communityData = await this.refreshFoodFieldsIfStale(communityData, apiKey);
    return communityData.seasonal_foods;
  }


}
