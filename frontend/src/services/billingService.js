/**
 * Comprehensive Billing Service Module
 * Handles all billing-related API calls including addons, brands, customers,
 * subscriptions, payments, refunds, and more.
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Helper function for API calls
const makeApiCall = async (method, endpoint, data = null, options = {}) => {
  const url = `${API_URL}/api/billing${endpoint}`;
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (data && method !== 'GET') {
    config.body = JSON.stringify(data);
  }

  if (method === 'GET' && data) {
    const params = new URLSearchParams(data);
    url += `?${params}`;
  }

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// ============== ADDON SERVICES ==============

export const addonService = {
  create: async (addonData) => {
    return makeApiCall('POST', '/addons', addonData);
  },

  get: async (addonId) => {
    return makeApiCall('GET', `/addons/${addonId}`);
  },

  list: async (limit = 10, offset = 0) => {
    return makeApiCall('GET', '/addons', { limit, offset });
  },

  update: async (addonId, updateData) => {
    return makeApiCall('PATCH', `/addons/${addonId}`, updateData);
  },

  updateImages: async (addonId, images) => {
    const formData = new FormData();
    images.forEach(image => formData.append('images', image));
    return makeApiCall('PUT', `/addons/${addonId}/images`, null, {
      body: formData,
      headers: {},
    });
  },
};

// ============== BRAND SERVICES ==============

export const brandService = {
  create: async (brandData) => {
    return makeApiCall('POST', '/brands', brandData);
  },

  get: async (brandId) => {
    return makeApiCall('GET', `/brands/${brandId}`);
  },

  list: async (limit = 10, offset = 0) => {
    return makeApiCall('GET', '/brands', { limit, offset });
  },

  update: async (brandId, updateData) => {
    return makeApiCall('PATCH', `/brands/${brandId}`, updateData);
  },

  updateImages: async (brandId, logo = null, favicon = null) => {
    const formData = new FormData();
    if (logo) formData.append('logo', logo);
    if (favicon) formData.append('favicon', favicon);
    return makeApiCall('PUT', `/brands/${brandId}/images`, null, {
      body: formData,
      headers: {},
    });
  },
};

// ============== CHECKOUT SERVICES ==============

export const checkoutService = {
  createSession: async (checkoutData) => {
    return makeApiCall('POST', '/checkout-sessions', checkoutData);
  },
};

// ============== CUSTOMER SERVICES ==============

export const customerService = {
  create: async (customerData) => {
    return makeApiCall('POST', '/customers', customerData);
  },

  list: async (params = {}) => {
    const { limit = 10, offset = 0, email } = params;
    return makeApiCall('GET', '/customers', { limit, offset, ...(email && { email }) });
  },

  get: async (customerId) => {
    return makeApiCall('GET', `/customers/${customerId}`);
  },

  update: async (customerId, updateData) => {
    return makeApiCall('PATCH', `/customers/${customerId}`, updateData);
  },

  createPortalSession: async (customerId, returnUrl) => {
    return makeApiCall('POST', `/customers/${customerId}/portal-session?return_url=${encodeURIComponent(returnUrl)}`);
  },
};

// ============== DISCOUNT SERVICES ==============

export const discountService = {
  create: async (discountData) => {
    return makeApiCall('POST', '/discounts', discountData);
  },

  list: async (params = {}) => {
    const { limit = 10, offset = 0, activeOnly = false } = params;
    return makeApiCall('GET', '/discounts', { limit, offset, active_only: activeOnly });
  },

  get: async (discountId) => {
    return makeApiCall('GET', `/discounts/${discountId}`);
  },

  update: async (discountId, updateData) => {
    return makeApiCall('PATCH', `/discounts/${discountId}`, updateData);
  },

  delete: async (discountId) => {
    return makeApiCall('DELETE', `/discounts/${discountId}`);
  },

  validate: async (code, productId = null) => {
    return makeApiCall('POST', '/discounts/validate', { code, ...(productId && { product_id: productId }) });
  },
};

// ============== DISPUTE SERVICES ==============

export const disputeService = {
  list: async (params = {}) => {
    const { limit = 10, offset = 0, status } = params;
    return makeApiCall('GET', '/disputes', { limit, offset, ...(status && { status }) });
  },

  get: async (disputeId) => {
    return makeApiCall('GET', `/disputes/${disputeId}`);
  },
};

// ============== LICENSE SERVICES ==============

export const licenseService = {
  create: async (licenseData) => {
    return makeApiCall('POST', '/licenses', licenseData);
  },

  activate: async (licenseKey, machineId, metadata = {}) => {
    return makeApiCall('POST', '/licenses/activate', { license_key: licenseKey, machine_id: machineId, metadata });
  },

  deactivate: async (licenseKey, machineId) => {
    return makeApiCall('POST', `/licenses/${licenseKey}/deactivate`, { machine_id: machineId });
  },

  get: async (licenseKey) => {
    return makeApiCall('GET', `/licenses/${licenseKey}`);
  },

  list: async (params = {}) => {
    const { customerId, productId, limit = 10, offset = 0 } = params;
    return makeApiCall('GET', '/licenses', {
      limit,
      offset,
      ...(customerId && { customer_id: customerId }),
      ...(productId && { product_id: productId }),
    });
  },

  update: async (licenseKey, updateData) => {
    return makeApiCall('PATCH', `/licenses/${licenseKey}`, updateData);
  },

  validate: async (licenseKey, machineId = null) => {
    return makeApiCall('POST', '/licenses/validate', {
      license_key: licenseKey,
      ...(machineId && { machine_id: machineId }),
    });
  },
};

// ============== PAYMENT SERVICES ==============

export const paymentService = {
  list: async (params = {}) => {
    const { customerId, subscriptionId, status, limit = 10, offset = 0 } = params;
    return makeApiCall('GET', '/payments', {
      limit,
      offset,
      ...(customerId && { customer_id: customerId }),
      ...(subscriptionId && { subscription_id: subscriptionId }),
      ...(status && { status }),
    });
  },

  get: async (paymentId) => {
    return makeApiCall('GET', `/payments/${paymentId}`);
  },

  getInvoice: async (paymentId) => {
    return makeApiCall('GET', `/payments/${paymentId}/invoice`);
  },

  createOneTime: async (paymentData) => {
    return makeApiCall('POST', '/payments/one-time', paymentData);
  },

  getLineItems: async (paymentId) => {
    return makeApiCall('GET', `/payments/${paymentId}/line-items`);
  },
};

// ============== PAYOUT SERVICES ==============

export const payoutService = {
  list: async (params = {}) => {
    const { limit = 10, offset = 0, status } = params;
    return makeApiCall('GET', '/payouts', { limit, offset, ...(status && { status }) });
  },
};

// ============== PRODUCT SERVICES ==============

export const productService = {
  create: async (productData) => {
    return makeApiCall('POST', '/products', productData);
  },

  list: async (params = {}) => {
    const { active, limit = 10, offset = 0 } = params;
    return makeApiCall('GET', '/products', {
      limit,
      offset,
      ...(active !== undefined && { active }),
    });
  },

  get: async (productId) => {
    return makeApiCall('GET', `/products/${productId}`);
  },

  update: async (productId, updateData) => {
    return makeApiCall('PATCH', `/products/${productId}`, updateData);
  },

  archive: async (productId) => {
    return makeApiCall('POST', `/products/${productId}/archive`);
  },

  unarchive: async (productId) => {
    return makeApiCall('POST', `/products/${productId}/unarchive`);
  },

  updateImages: async (productId, images) => {
    const formData = new FormData();
    images.forEach(image => formData.append('images', image));
    return makeApiCall('PUT', `/products/${productId}/images`, null, {
      body: formData,
      headers: {},
    });
  },

  updateFiles: async (productId, files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return makeApiCall('PUT', `/products/${productId}/files`, null, {
      body: formData,
      headers: {},
    });
  },
};

// ============== REFUND SERVICES ==============

export const refundService = {
  create: async (refundData) => {
    return makeApiCall('POST', '/refunds', refundData);
  },

  list: async (params = {}) => {
    const { paymentId, limit = 10, offset = 0 } = params;
    return makeApiCall('GET', '/refunds', {
      limit,
      offset,
      ...(paymentId && { payment_id: paymentId }),
    });
  },

  get: async (refundId) => {
    return makeApiCall('GET', `/refunds/${refundId}`);
  },
};

// ============== SUBSCRIPTION SERVICES ==============

export const subscriptionService = {
  create: async (subscriptionData) => {
    return makeApiCall('POST', '/subscriptions', subscriptionData);
  },

  list: async (params = {}) => {
    const { customerId, status, limit = 10, offset = 0 } = params;
    return makeApiCall('GET', '/subscriptions', {
      limit,
      offset,
      ...(customerId && { customer_id: customerId }),
      ...(status && { status }),
    });
  },

  get: async (subscriptionId) => {
    return makeApiCall('GET', `/subscriptions/${subscriptionId}`);
  },

  update: async (subscriptionId, updateData) => {
    return makeApiCall('PATCH', `/subscriptions/${subscriptionId}`, updateData);
  },

  changePlan: async (subscriptionId, newPriceId, prorate = true) => {
    return makeApiCall('POST', '/subscriptions/change-plan', {
      subscription_id: subscriptionId,
      new_price_id: newPriceId,
      prorate,
    });
  },

  createCharge: async (subscriptionId, amount, description) => {
    return makeApiCall('POST', `/subscriptions/${subscriptionId}/charge`, {
      amount,
      description,
    });
  },

  chargeNow: async (subscriptionId) => {
    return makeApiCall('POST', `/subscriptions/${subscriptionId}/charge-now`);
  },
};

// ============== WEBHOOK SERVICES ==============

export const webhookService = {
  create: async (webhookData) => {
    return makeApiCall('POST', '/webhooks', webhookData);
  },

  list: async (limit = 10, offset = 0) => {
    return makeApiCall('GET', '/webhooks', { limit, offset });
  },

  get: async (webhookId) => {
    return makeApiCall('GET', `/webhooks/${webhookId}`);
  },

  update: async (webhookId, updateData) => {
    return makeApiCall('PATCH', `/webhooks/${webhookId}`, updateData);
  },

  delete: async (webhookId) => {
    return makeApiCall('DELETE', `/webhooks/${webhookId}`);
  },

  getHeaders: async (webhookId) => {
    return makeApiCall('GET', `/webhooks/${webhookId}/headers`);
  },

  updateHeaders: async (webhookId, headers) => {
    return makeApiCall('PUT', `/webhooks/${webhookId}/headers`, headers);
  },

  getSigningKey: async (webhookId) => {
    return makeApiCall('GET', `/webhooks/${webhookId}/signing-key`);
  },
};

// ============== MISCELLANEOUS SERVICES ==============

export const miscService = {
  getSupportedCountries: async () => {
    return makeApiCall('GET', '/supported-countries');
  },
};

// ============== UTILITY FUNCTIONS ==============

export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount / 100);
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getStatusColor = (status) => {
  const statusColors = {
    active: 'green',
    succeeded: 'green',
    completed: 'green',
    pending: 'yellow',
    trialing: 'blue',
    processing: 'blue',
    canceled: 'red',
    failed: 'red',
    past_due: 'orange',
    paused: 'gray',
  };
  return statusColors[status.toLowerCase()] || 'gray';
};

export const getStatusBadgeClass = (status) => {
  const color = getStatusColor(status);
  const colorClasses = {
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    blue: 'bg-blue-100 text-blue-800',
    red: 'bg-red-100 text-red-800',
    orange: 'bg-orange-100 text-orange-800',
    gray: 'bg-gray-100 text-gray-800',
  };
  return colorClasses[color];
};

// Export all services as default
export default {
  addon: addonService,
  brand: brandService,
  checkout: checkoutService,
  customer: customerService,
  discount: discountService,
  dispute: disputeService,
  license: licenseService,
  payment: paymentService,
  payout: payoutService,
  product: productService,
  refund: refundService,
  subscription: subscriptionService,
  webhook: webhookService,
  misc: miscService,
  // Utility functions
  formatCurrency,
  formatDate,
  formatDateTime,
  getStatusColor,
  getStatusBadgeClass,
};