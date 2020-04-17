import { getSongDetail, getSongUrl } from 'api/song';

export enum MusicStatus {
  PENDING = 'pending', // 等待加载
  LOADING = 'loading', // 正在加载
  FULFILLED = 'fulfilled',  // 加载成功
  REJECTED = 'rejected', // 加载失败
}

export enum MusicEventType {
  STATUS_CHANGE = 'statusChange'
}

export type MusicEventHandler = Function;

export type MusicUnSubscribeHandler = Function;

type MusicInfo = {
  id: number | null;
  name: string | null; // 歌曲名称
  picture: string | null; // 封面
  artists: string | null; // 作者
}

interface IData {
  data: MusicInfo,
  src: string;
}
const getData = (ids: Array<number>) => new Promise<Array<IData>>((resolve, reject) => {
  Promise.all([getSongDetail(ids)[0], getSongUrl(ids)[0]]).then(res => {
    const [songDetail, songUrl] = res;
    if (songDetail.data.code !== 200 || songUrl.data.code !== 200) return;
    const data: Array<MusicInfo> = songDetail.data.songs.map((e: any) => {
      const name = e.name;
      const picture = `${e.al.picUrl}?param=180y180`;
      const artists = e.ar.map((artist: { name: string }) => artist.name).join('/');
      const id = e.id;
      return { name, picture, artists, id };
    });
    const result = data.map((info: MusicInfo) => {
      const src = songUrl.data.data.find((e: {id: number}) => e.id === info.id).url || null;
      return {
        src,
        data: info
      };
    });
    resolve(result);
  }).catch(err => {
    reject(err);
  }); 
});

class Music {
  constructor (id: number) {
    this.id = id;
  }

  static readyAll (musicList: Array<Music>) {
    const list = musicList.filter((music: Music) => music.status === MusicStatus.PENDING);
    return new Promise((resolve, reject) => {
      const ids = list.map((music: Music) => {
        music.status = MusicStatus.LOADING;
        music.handleListeners(MusicEventType.STATUS_CHANGE, MusicStatus.LOADING);
        return music.id;
      });
      getData(ids).then(results => {
        list.forEach((music: Music, index: number) => {
          const res = results[index];
          music.data = res.data;
          music.src = res.src;
          music.status = MusicStatus.FULFILLED;
          music.handleListeners(MusicEventType.STATUS_CHANGE, MusicStatus.FULFILLED);
        });
        resolve(results);
      }).catch(err => {
        list.forEach((music: Music) => {
          music.reason = err;
          music.status = MusicStatus.REJECTED;
          music.handleListeners(MusicEventType.STATUS_CHANGE, MusicStatus.REJECTED);
        });
        reject(err);
      });
    });
  }

  ready () {
    return new Promise<Music>((resolve, reject) => {
      switch (this.status) {
        case MusicStatus.PENDING:
          this.status = MusicStatus.LOADING;
          this.handleListeners(MusicEventType.STATUS_CHANGE, MusicStatus.LOADING);
          getData([this.id]).then((results: Array<IData>) => {
            const [ result ] = results;
            this.data = result.data;
            this.src = result.src;
            this.status = MusicStatus.FULFILLED;
            this.handleListeners(MusicEventType.STATUS_CHANGE, MusicStatus.FULFILLED);
            resolve(this);
          }).catch(err => {
            this.reason = err;
            this.status = MusicStatus.REJECTED;
            this.handleListeners(MusicEventType.STATUS_CHANGE, MusicStatus.REJECTED);
            reject(this.reason);
          });
          break;
        case MusicStatus.FULFILLED:
          resolve(this);
          break;
        case MusicStatus.REJECTED:
          reject(this.reason);
          break;
        case MusicStatus.LOADING:
          const unsubscribe = this.subscribe(MusicEventType.STATUS_CHANGE, (status: MusicStatus) => {
            unsubscribe();
            if (status === MusicStatus.FULFILLED) {
              resolve(this);
            } else if (status === MusicStatus.REJECTED) {
              reject(this.reason);
            }
          });
          break;
      }
    });
  }

  // 歌曲ID
  id: number;

  // 实例状态
  status: MusicStatus = MusicStatus.PENDING;

  // 歌曲路径
  src: string | null = null;
   
  // 记载失败原因
  reason: Error | null = null;

  // 歌曲信息
  data: MusicInfo = {
    id: null,
    name: null,
    picture:  null,
    artists:  null 
  }

  // 订阅列表
  private listeners: Map<MusicEventType, Set<MusicEventHandler>> = new Map();

  // 订阅事件
  subscribe (eventType: MusicEventType, handler: MusicEventHandler): MusicUnSubscribeHandler {
    let eventSet: Set<MusicEventHandler> | undefined = this.listeners.get(eventType);
    if (eventSet === undefined) {
      eventSet = new Set();
      this.listeners.set(eventType, eventSet);
    }
    eventSet.add(handler);
    return () => {
      this.unsubscribe(eventType, handler);
    };
  }

  // 取消订阅
  unsubscribe (eventType: MusicEventType, handler: MusicEventHandler): boolean {
    let eventSet: Set<MusicEventHandler> | undefined = this.listeners.get(eventType);
    if (eventSet === undefined) return false;
    eventSet.delete(handler);
    return true;
  }

  // 执行事件订阅
  private handleListeners (eventType: MusicEventType, ...payload: Array<any>): void {
    const set = this.listeners.get(eventType);
    if (set) {
      set.forEach((handler: MusicEventHandler) => {
        handler(...payload);
      });
    }
  }
}

export default Music;