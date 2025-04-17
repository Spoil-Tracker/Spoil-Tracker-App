import { getAllFoodGlobal } from '@/components/Food/FoodGlobalService';

/**
 * OpenAI
 *
 * A helper class that wraps calls to the OpenAI API. This file specifically is not used,
 * but openAI is still utilised and present elsewhere in the application. Still kept
 * for now since some functions in here will be used for other use cases in the app.
 */
export class OpenAI {
  private apiKey: string | undefined;

  /**
   * Creates a new instance of the OpenAI class.
   *
   * @param config - An object containing configuration options.
   * @param config.apiKey - Your OpenAI API key.
   */
  constructor(config: { apiKey: string | undefined }) {
    this.apiKey = config.apiKey;
  }

  /**
   * responses
   *
   * A property containing helper methods for creating generic responses via the OpenAI API.
   * The create method sends a prompt to the API and returns the generated message.
   */
  responses = {
    /**
     * Creates a generic response using the OpenAI chat completions API.
     *
     * @param options - An object containing model, instructions, and input for the API call.
     * @param options.model - The OpenAI model to use (e.g., 'gpt-3.5-turbo').
     * @param options.instructions - System instructions to guide the model's behavior.
     * @param options.input - The user's input prompt.
     * @returns A promise that resolves to an object containing the model used and the generated message.
     */
    create: async (options: {
      model: string;
      instructions: string;
      input: string;
    }): Promise<any> => {
      const url = 'https://api.openai.com/v1/chat/completions';
      const body = {
        model: options.model,
        messages: [
          { role: 'system', content: options.instructions },
          { role: 'user', content: options.input },
        ],
        temperature: 0.7,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      return data.choices && data.choices.length > 0
        ? { model: options.model, message: data.choices[0].message.content }
        : { model: options.model, message: 'No response received.' };
    },
  };

  /**
   * pricingAnalysis
   *
   * Uses the OpenAI API to generate a cost summary for a given grocery list prompt. The API response
   * should include a rough estimate for each of the specified stores (e.g., Walmart, Target).
   *
   * @param prompt - A string representing the grocery list details to analyze.
   * @returns A promise that resolves to the pricing analysis as a string.
   */
  async pricingAnalysis(prompt: string): Promise<string> {
    const url = 'https://api.openai.com/v1/chat/completions';
    const body = {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Provide a cost summary for the given grocery list with prices for Walmart, Target, Albertsons, and Vons.' },
        { role: 'system', content: 'Just give me a rough estimate of the total grocery list value for each respective store, with your latest data on each item from each store. Figure out how much each item costs and format it like so: Walmart: $20.34 (Total list price, do not show individual prices at any point), and then the next store is separated by a newline.' },
        { role: 'system', content: 'Only give me what I said to give, do not write any extra sentences. If you can\'t provide what I asked for, then respond with nothing.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content;
      }
      return 'No response received.';
    } catch (error) {
      console.error('Error in pricingAnalysis:', error);
      return 'Error calculating value.';
    }
  }

  /**
   * getClosestItemIds
   *
   * Finds the items whose names are closest to the provided search term using Levenshtein distance.
   * Returns the IDs of the top N closest items.
   *
   * @param searchName - The search term to compare against item names.
   * @param items - An array of objects containing `id` and `name` properties.
   * @param topN - (Optional) The number of closest items to return. Defaults to 3.
   * @returns A promise that resolves to an array of item IDs.
   */
  async getClosestItemIds(
    searchName: string,
    items: Array<{ id: string; name: string }>,
    topN: number = 3
  ): Promise<string[]> {
    try {
      // Map items to include their computed distance from the search name.
      const itemsWithDistance = items.map(item => ({
        id: item.id,
        name: item.name,
        distance: this.levenshteinDistance(item.name.toLowerCase(), searchName.toLowerCase())
      }));

      // Sort items by distance (lower distance means a closer match).
      itemsWithDistance.sort((a, b) => a.distance - b.distance);

      // Return the IDs of the top N closest items.
      return itemsWithDistance.slice(0, topN).map(item => item.id);
    } catch (error) {
      console.error('Error processing items:', error);
      return [];
    }
  }

  /**
   * getPopularItemIds
   *
   * Uses the OpenAI API to analyze global food items and determine which ones are currently popular.
   * The API prompt is constructed from a JSON representation of all global food items.
   *
   * @returns A promise that resolves to an array of popular food item IDs.
   */
  async getPopularItemIds(): Promise<string[]> {
    try {
      // Fetch all global food items.
      const items = await getAllFoodGlobal();
      const dataStr = JSON.stringify(items, null, 2);
      const prompt = `Given the following JSON data of food items:
${dataStr}

Please identify and return only the IDs of the items that are currently trending or popular worldwide as of right now. Output the IDs as a comma-separated list without any additional text. Do not add any extra sentences.`;

      // Build the messages for the API call.
      const messages = [
        { role: 'system', content: 'Filter the provided JSON data and return the IDs of items that are popular worldwide as a comma-separated list. Sort the list so that the most popular food ID is listed first. Do not add any extra sentences. Maximum limit of 5 IDs.' },
        { role: 'system', content: 'Consider recent / current social media or political trends when determining popularity.' },
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
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.choices && data.choices.length > 0) {
        const output = data.choices[0].message.content;
        console.log(output);
        return output.split(',')
          .map((id: string) => id.trim())
          .filter((id: string) => id.length > 0);
      }
      return [];
    } catch (error) {
      console.error('Error in getPopularItemIds:', error);
      return [];
    }
  }

  /**
   * getSeasonalProduce
   *
   * Uses the OpenAI API to determine which produce items (fruits and vegetables)
   * in the provided dataset are currently in season.
   *
   * @returns A promise that resolves to an array of IDs for in-season produce items.
   */
  async getSeasonalProduce(): Promise<string[]> {
    try {
      // Fetch all global food items.
      const items = await getAllFoodGlobal();
      const dataStr = JSON.stringify(items, null, 2);
      const prompt = `Given the following JSON data of food items:
${dataStr}

Please identify and return only the IDs of the produce (fruits and vegetables) items that are currently in season. Do not include anything that is not a fruit or vegetable. Output the IDs as a comma-separated list without any additional text.`;

      // Build the messages for the API call.
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
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.choices && data.choices.length > 0) {
        const output = data.choices[0].message.content;
        console.log(output);
        return output.split(',')
          .map((id: string) => id.trim())
          .filter((id: string) => id.length > 0);
      }
      return [];
    } catch (error) {
      console.error('Error in getSeasonalProduce:', error);
      return [];
    }
  }

  /**
   * levenshteinDistance
   *
   * Computes the Levenshtein distance between two strings, which is a measure of how many single-character
   * edits (insertions, deletions, or substitutions) are required to change one string into the other.
   *
   * @param a - The first string.
   * @param b - The second string.
   * @returns The Levenshtein distance between the two strings.
   */
  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    // Initialize the first row and column of the matrix.
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    // Populate the rest of the matrix.
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }
}
