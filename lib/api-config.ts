// Get the API server type from environment variable
export const getApiServerType = (): 'shopify' | 'woocommerce' => {
  const serverType = process.env.API_SERVER_TYPE;

  // Default to woocommerce if not set or invalid value
  if (serverType === 'shopify') {
    return 'shopify';
  }

  return 'woocommerce';
};

// Get the appropriate import functions based on server type
export const getImportFunctions = (serverType?: 'shopify' | 'woocommerce') => {
  const type = serverType || getApiServerType();

  if (type === 'shopify') {
    return {
      importAllProducts: () => import('./product-import-shopify').then(m => m.importAllProductsFromShopify),
      getAllProducts: () => import('./product-import-shopify').then(m => m.getAllProducts),
      syncAllProductsToQdrant: () => import('./product-import-shopify').then(m => m.syncAllProductsToQdrant),
      getProductStats: () => import('./product-import-shopify').then(m => m.getProductStats),
      importCompany: () => import('./company-import-shopify').then(m => m.importCompanyFromShopify),
      getCompanyInfo: () => import('./company-import-shopify').then(m => m.getCompanyInfo),
      testConnection: () => import('./shopify-utils-shopify').then(m => m.testShopifyConnection),
      getStoreInfo: () => import('./shopify-utils-shopify').then(m => m.getShopInfo),
    };
  } else {
    return {
      importAllProducts: () => import('./product-import-woocommerce').then(m => m.importAllProductsFromWooCommerce),
      getAllProducts: () => import('./product-import-woocommerce').then(m => m.getAllProducts),
      syncAllProductsToQdrant: () => import('./product-import-woocommerce').then(m => m.syncAllProductsToQdrant),
      getProductStats: () => import('./product-import-woocommerce').then(m => m.getProductStats),
      importCompany: () => import('./company-import-woocommerce').then(m => m.importCompanyFromWooCommerce),
      getCompanyInfo: () => import('./company-import-woocommerce').then(m => m.getCompanyInfo),
      testConnection: () => import('./woocommerce-utils').then(m => m.testWooCommerceConnection),
      getStoreInfo: () => import('./woocommerce-utils').then(m => m.getStoreInfo),
    };
  }
};

// Get the server type for display purposes
export const getServerTypeDisplay = (): string => {
  const serverType = getApiServerType();
  return serverType === 'shopify' ? 'Shopify' : 'WooCommerce';
};
