import axios from 'axios';
import { cookies } from 'next/headers';

const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const cookieStore = await cookies();
    const access = cookieStore.get('access');
    
    if (access) {
      config.headers.Authorization = `Bearer ${access.value}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error('Not authenticated.');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;