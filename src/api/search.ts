import axios from 'api';
import { AxiosRequestConfig } from 'axios';


interface IQuerySearchMusicParams {
  keywords: string;
  limit: number;
  offset: number;
  type?: number;
}

/**
 * 根据关键字搜索音乐
 * @param keywords 搜索关键字
 * @param limit 限制数目
 * @param offset 索引位置
 * @param type 搜索类型(详见文档)
 */
export const querySearchMusic = ({ keywords, limit, offset, type = 1 }: IQuerySearchMusicParams, meta?: AxiosRequestConfig) => axios({
  url: '/search',
  method: 'get',
  params: { keywords, limit, offset, type },
  ...meta
});

/**
 * 获取搜索建议
 * @param keywords 搜索关键字
 * @param meta Axios Config Object
 */
export const getSearchSuggest = (keywords: string, meta?: AxiosRequestConfig) => axios({
  url: '/search/suggest',
  method: 'get',
  params: {
    type: 'mobile',
    keywords
  },
  ...meta
});


/**
 * 获取默认搜索关键词
 */
export const getSearchDefault = () => axios({
  url: '/search/default',
  method: 'get'
});


/**
 * 获取热搜列表
 */
export const getSearchHotDetail = () => axios({
  url: '/search/hot/detail',
  method: 'get'
});