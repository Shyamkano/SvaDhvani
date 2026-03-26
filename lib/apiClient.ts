import { supabase } from './supabase'; // Your initialized Supabase client

// ✅ IMPORTANT: Replace with your computer's local IP address.
// On Windows, find it with `ipconfig`. On Mac, `ifconfig`.
const API_URL = 'http://10.221.93.91:5000';

/**
 * A centralized and secure client for making requests to your Flask API.
 * It automatically includes the Supabase JWT for authentication.
 */
const apiClient = {
  post: async (endpoint: string, body: object) => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("User is not authenticated.");
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API request failed');
      }

      return await response.json();

    } catch (error) {
      console.error(`API Error on POST ${endpoint}:`, error);
      throw error;
    }
  },
};

export default apiClient;