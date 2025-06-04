const API_URLS = {
  development: 'http://localhost:8000',
  production: 'https://taskflow-ru9t.onrender.com'
};

// Determine if we're in development or production
const isDevelopment = process.env.NODE_ENV === 'development';

// Export the appropriate API URL
export const API_URL = isDevelopment ? API_URLS.development : API_URLS.production;

// Export all URLs for reference
export const API_URLS_ALL = API_URLS; 