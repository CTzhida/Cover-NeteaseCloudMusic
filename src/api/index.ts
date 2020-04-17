import Axios, { AxiosRequestConfig, Canceler, AxiosPromise } from 'axios';

const axios = Axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? process.env.REACT_APP_API_HOST : '',
});

// 添加请求拦截器
axios.interceptors.request.use(
  config => {
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 添加响应拦截器
axios.interceptors.response.use(
  response => {
    return response;
  }, 
  error => {
    return Promise.reject(error);
  }
);

export default (options: AxiosRequestConfig): [AxiosPromise, Canceler | null] => {
  let canceler: Canceler | null = null;
  options.cancelToken = new Axios.CancelToken((cancel: Canceler) => {
    canceler = cancel;
  });  
  return [ axios(options), canceler ];
};