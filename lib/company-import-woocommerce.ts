import { CompanyInfo } from '../types';

// Base URL for the server API
const getServerUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';
  // Remove trailing slash to prevent double slashes in URLs
  return baseUrl.replace(/\/$/, '');
};

// Import company info from WooCommerce via server API
export const importCompanyFromWooCommerce = async (): Promise<{
  success: boolean;
  data?: CompanyInfo;
  error?: string;
}> => {
  try {
    const serverUrl = getServerUrl();
    const response = await fetch(`${serverUrl}/api/woocommerce/import-company`, {
      method: 'POST',
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
      data: result.company,
    };
  } catch (error) {
    console.error('Error importing company info from WooCommerce:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

// Get current company info from server
export const getCompanyInfo = async (): Promise<{
  success: boolean;
  data?: CompanyInfo;
  error?: string;
}> => {
  try {
    const serverUrl = getServerUrl();
    const response = await fetch(`${serverUrl}/api/woocommerce/company`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: true,
          data: undefined, // No company info found
        };
      }
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    return {
      success: true,
      data: result.company,
    };
  } catch (error) {
    console.error('Error getting company info:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

// Format company info for display
export const formatCompanyInfo = (company: CompanyInfo) => {
  return {
    name: company.name,
    description: company.description,
    email: company.contactInfo?.email || 'Not provided',
    phone: company.contactInfo?.phone || 'Not provided',
    address: formatAddress(company.contactInfo?.address),
    policies: company.policies?.length || 0,
    lastUpdated: company.updatedAt ? new Date(company.updatedAt).toLocaleString() : 'Never',
  };
};

// Format address for display
const formatAddress = (address: any) => {
  if (!address) return 'Not provided';

  const parts = [
    address.address1,
    address.address2,
    address.city,
    address.province,
    address.country,
    address.zip,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(', ') : 'Not provided';
};
