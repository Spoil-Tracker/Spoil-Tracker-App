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



}
