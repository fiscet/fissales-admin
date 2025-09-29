// Base URL for the server API
const getServerUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';
  // Remove trailing slash to prevent double slashes in URLs
  return baseUrl.replace(/\/$/, '');
};

// Test WooCommerce connection via server API
export const testWooCommerceConnection = async (): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const serverUrl = getServerUrl();
    const response = await fetch(`${serverUrl}/api/woocommerce/test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    return {
      success: result.connected === true,
      error: result.connected === false ? result.message : undefined,
    };
  } catch (error) {
    console.error('Error testing WooCommerce connection:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

// Get store information from WooCommerce via server API
export const getStoreInfo = async (): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> => {
  try {
    const serverUrl = getServerUrl();
    const response = await fetch(`${serverUrl}/api/woocommerce/store`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    return {
      success: true,
      data: result.store,
    };
  } catch (error) {
    console.error('Error getting store info:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

// Get rate limit status from WooCommerce via server API
export const getRateLimitStatus = async (): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> => {
  try {
    const serverUrl = getServerUrl();
    const response = await fetch(`${serverUrl}/api/woocommerce/rate-limit-status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Error getting rate limit status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

// Get health check from WooCommerce via server API
export const getHealthCheck = async (): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> => {
  try {
    const serverUrl = getServerUrl();
    const response = await fetch(`${serverUrl}/api/woocommerce/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Error getting health check:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};
