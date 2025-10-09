import { useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export const useApi = () => {
  const [loading, setLoading] = useState(false);

  const request = useCallback(async (config) => {
    try {
      setLoading(true);
      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      const message = error.response?.data?.message || 'An error occurred';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback((url, config = {}) => {
    return request({ ...config, method: 'GET', url });
  }, [request]);

  const post = useCallback((url, data, config = {}) => {
    return request({ ...config, method: 'POST', url, data });
  }, [request]);

  const put = useCallback((url, data, config = {}) => {
    return request({ ...config, method: 'PUT', url, data });
  }, [request]);

  const del = useCallback((url, config = {}) => {
    return request({ ...config, method: 'DELETE', url });
  }, [request]);

  return {
    loading,
    request,
    get,
    post,
    put,
    delete: del
  };
};
