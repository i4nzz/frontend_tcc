const rawBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5294';

export const SERVER_URL = rawBaseUrl.replace(/\/+$/, '');
export const API_BASE_URL = `${SERVER_URL}/api/v1`;
