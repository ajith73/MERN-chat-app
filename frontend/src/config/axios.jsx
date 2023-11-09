// axiosConfig.js

import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/', // Your base URL here
});

export default axiosInstance;