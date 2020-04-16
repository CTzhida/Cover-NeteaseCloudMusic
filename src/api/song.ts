import axios from 'api';

// 获取歌曲详情
export const getSongDetail = (ids: Array<number>) => axios({
  url: '/song/detail',
  method: 'get',
  params: {
    ids: ids.join(',')
  }
});

// 获取歌曲url
export const getSongUrl = (ids: Array<number>) => axios({
  url: '/song/url',
  method: 'get',
  params: {
    id: ids.join(',')
  }
});

// 推荐歌单
export const getPersonalized = (limit: number) => axios({
  url: '/personalized',
  method: 'get',
  params: {
    limit
  }
});

// 推荐音乐
export const getNewSong = () => axios({
  url: '/personalized/newsong',
  method: 'get'
});

// 歌单详情
export const getPlaylistDetail = (id: number) => axios({
  url: '/playlist/detail',
  method: 'get',
  params: {
    id
  }
});