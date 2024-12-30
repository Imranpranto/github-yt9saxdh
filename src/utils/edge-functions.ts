import { supabase } from '../lib/supabase';

/**
 * Invokes a Supabase Edge Function with error handling and typing
 * @param functionName Name of the Edge Function to invoke
 * @param payload Request payload
 * @returns Response data
 */
export async function invokeEdgeFunction<T = any, P = any>(
  functionName: string,
  payload?: P
): Promise<T> {
  try {
    const { data, error } = await supabase.functions.invoke<T>(functionName, {
      body: payload
    });

    if (error) {
      console.error(`Edge Function Error (${functionName}):`, error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Failed to invoke ${functionName}:`, error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : `Failed to invoke ${functionName}`
    );
  }
}

/**
 * Validates the response from an Edge Function
 * @param response Response from Edge Function
 * @returns Validated response data
 */
export function validateEdgeResponse<T>(response: any): T {
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid response from Edge Function');
  }

  if (response.error) {
    throw new Error(response.error);
  }

  return response as T;
}