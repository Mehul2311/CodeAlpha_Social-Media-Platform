/**
 * Chaupal - API Client Module
 * Clean fetch wrapper for REST endpoints with error handling
 */

let authToken = localStorage.getItem('chaupal_token') || null;

export function setToken(token) {
  authToken = token;
  if (token) {
    localStorage.setItem('chaupal_token', token);
  } else {
    localStorage.removeItem('chaupal_token');
  }
}

export function getToken() {
  return authToken;
}

export async function apiRequest(endpoint, method = 'GET', data = null) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const config = {
    method,
    headers,
  };

  if (data && (method === 'POST' || method === 'PUT')) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(endpoint, config);
    const json = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = json.error || 'Kuch gadbad ho gayi, dobara try karo (Something went wrong)';
      const err = new Error(errorMsg);
      err.status = response.status;
      err.data = json;
      throw err;
    }

    return json;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Internet connection check karein (Network error)');
    }
    throw error;
  }
}

export const api = {
  // Auth
  signup: (payload) => apiRequest('/api/auth/signup', 'POST', payload),
  login: (payload) => apiRequest('/api/auth/login', 'POST', payload),
  logout: () => apiRequest('/api/auth/logout', 'POST'),
  getCurrentUser: () => apiRequest('/api/auth/me', 'GET'),

  // Feed & Posts
  getFeed: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/api/posts${query ? '?' + query : ''}`, 'GET');
  },
  getPost: (id) => apiRequest(`/api/posts/${id}`, 'GET'),
  createPost: (payload) => apiRequest('/api/posts', 'POST', payload),
  updatePost: (id, payload) => apiRequest(`/api/posts/${id}`, 'PUT', payload),
  deletePost: (id) => apiRequest(`/api/posts/${id}`, 'DELETE'),
  toggleLike: (id) => apiRequest(`/api/posts/${id}/like`, 'POST'),

  // Comments
  getComments: (postId) => apiRequest(`/api/comments/post/${postId}`, 'GET'),
  addComment: (postId, payload) => apiRequest(`/api/comments/post/${postId}`, 'POST', payload),
  deleteComment: (id) => apiRequest(`/api/comments/${id}`, 'DELETE'),

  // Users & Profiles
  getProfile: (username) => apiRequest(`/api/users/profile/${username}`, 'GET'),
  updateProfile: (payload) => apiRequest('/api/users/profile', 'PUT', payload),
  getUserPosts: (username) => apiRequest(`/api/users/posts/${username}`, 'GET'),
  getSuggestions: () => apiRequest('/api/users/suggestions', 'GET'),
  getFollowers: (username) => apiRequest(`/api/users/${username}/followers`, 'GET'),
  getFollowing: (username) => apiRequest(`/api/users/${username}/following`, 'GET'),
  toggleFollow: (userId) => apiRequest(`/api/follow/${userId}`, 'POST'),
};
