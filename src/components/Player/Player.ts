import { 
  PlayerEventType,
  PlayerPlayOrder,
  PlayerEventHandler,
  PlayerUnSubscribeHandler,
  PlayerErrorType
} from './types';
import PlayerStorage from './Storage';
import Music from './Music';
import { shuffle } from 'scripts/utils';

const playerStorage = new PlayerStorage();

class Player {
  constructor () {
    // 生成audio元素
    const audio: HTMLAudioElement = document.createElement('audio');
    audio.autoplay = true;
    audio.preload = 'preload';
    this.audio = audio;
    document.body.appendChild(audio);
    
    // 绑定默认监听事件
    const audioEvents = [
      {
        eventType: 'play',
        handler: () => {
          this.handleListeners(PlayerEventType.PLAY);
        }
      },
      {
        eventType: 'pause',
        handler: () => {
          this.handleListeners(PlayerEventType.PAUSE);
        }
      },
      {
        eventType: 'timeupdate',
        handler: () => {
          this.handleListeners(PlayerEventType.TIMEUPDATE, audio.currentTime);
        }
      },
      {
        eventType: 'canplay', 
        handler: () => {
          this.handleListeners(PlayerEventType.CANPLAY);
        }
      },
      {
        eventType: 'error',
        handler: (event: Event) => {
          this.handleListeners(PlayerEventType.ERROR, {
            type: PlayerErrorType.AUDIO_ERROR,
            detail: event
          });
        }
      },
      {
        eventType: 'ended',
        handler: () => {
          if (this.playOrder !== PlayerPlayOrder.LOOP) {
            this.next();
          }
          this.handleListeners(PlayerEventType.ENDED);
        }
      }
    ];

    audioEvents.forEach(item => {
      audio.addEventListener(item.eventType, item.handler.bind(this));
    });
    
    if (playerStorage.list.length) {
      this.add(playerStorage.list.reverse());
      this.refreshRandomList();
    }
  }

  // 能否通过脚本自动播放音乐 (Chrome与Safari会要求用户触发点击事件后才能使用audio的autoplay)
  private canAutoplay: boolean = false;

  // Audio 实例
  audio: HTMLAudioElement;

  // 订阅列表
  private listeners: Map<PlayerEventType, Set<PlayerEventHandler>> = new Map();

  // 播放列表
  private list: Array<Music> = [];

  // 随机播放的列表
  private randomList: Array<number> = [];

  // 刷新随机播放的列表
  private refreshRandomList () {
    this.randomList = shuffle(this.list.map((music: Music) => music.id));
  }

  getList () {
    return [...this.list];
  }

  get currentTime () {
    return this.audio.currentTime;
  }

  get duration () {
    return this.audio.duration || 0;
  }

  // 是否正在播放
  get isPlaying (): boolean {
    return !this.audio.paused;
  }

  // 播放顺序
  playOrder: PlayerPlayOrder = playerStorage.playOrder || PlayerPlayOrder.LIST;

  // 设置播放顺序
  setPlayOrder (playOrder: PlayerPlayOrder) {
    this.playOrder = playOrder;
    if (playOrder === PlayerPlayOrder.LOOP) {
      this.audio.loop = true;
    } else if (this.audio.loop === true){
      this.audio.loop = false;
    }
    if (playOrder === PlayerPlayOrder.RANDOM) {
      this.refreshRandomList();
    }
    playerStorage.savePlayOrder(playOrder);
    this.handleListeners(PlayerEventType.PLAY_ORDER_UPDATE, this.playOrder);
  }

  // 当前播放音乐的ID
  currentId: number | null = null;

  // 当前音乐实例
  get current(): Music | null {
    if (this.currentId === null) {
      return null;
    } else {
      const music = this.list.find((music: Music) => music.id === this.currentId);
      return music || null;
    }
  }

  // 判断列表里是否有该音乐
  has (id: number): boolean {
    return this.list.findIndex((music: Music) => music.id === id) !== -1;
  }
  
  // 新增音乐
  add (ids: Array<number>) {
    const addIds = ids.filter((id: number) => !this.has(id));
    if (addIds.length === 0) return false;

    const musicList: Array<Music> = addIds.map((id: number) => {
      return new Music(id);
    }).reverse();

    this.list = [...musicList, ...this.list];

    Music.readyAll(this.list).then(() => {
      this.handleListeners(PlayerEventType.LIST_CHANGE);
    });

    this.refreshRandomList();

    playerStorage.saveList(this.list.map((music: Music) => music.id));
    
    this.handleListeners(PlayerEventType.LIST_CHANGE);
  }

  // 删除音乐
  remove (ids: Array<number>) {
    const rmIds = ids.filter((id: number) => this.has(id));
    if (rmIds.length === 0) return;
    rmIds.forEach((id: number) => {
      const rmIdx = this.list.findIndex((music: Music) => music.id === id);
      this.list.splice(rmIdx, 1);
    });
    this.refreshRandomList();
    playerStorage.saveList(this.list.map((music: Music) => music.id));
    this.handleListeners(PlayerEventType.LIST_CHANGE);
    if (this.currentId && rmIds.includes(this.currentId)) {
      this.list.length ? this.next(this.isPlaying) :  this.switch(null);
    }
  }

  // 设置进度条
  setCurrentTime (currentTime: number) {
    this.audio.currentTime = currentTime;
    this.handleListeners(PlayerEventType.TIMEUPDATE, this.audio.currentTime);
  }

  // 播放
  play () {
    if (this.isPlaying || !this.current?.src) return false;
    this.audio.play().then(() => {
      this.canAutoplay = true;
    }).catch((err) => {
      this.handleListeners(PlayerEventType.ERROR, {
        type: PlayerErrorType.CANNOT_AUTO_PLAY,
        detail: err.message
      });
    });
  }

  // 暂停
  pause () {
    if (this.audio.autoplay) this.audio.autoplay = false;
    if (!this.isPlaying) return false;
    this.audio.pause();
  }

  // 切换音乐
  switch (id: number | null) {
    if (this.isPlaying) {
      this.pause();
    }
    this.setCurrentTime(0);
    return new Promise((resolve, reject) => {
      if (id === null) {
        this.currentId = null;
        this.audio.src = '';
        this.handleListeners(PlayerEventType.MUSIC_INFO_UPDATE, null);
        resolve();
      } else {
        this.currentId = id;
        this.current?.ready().then((music: Music) => {
          if (music.src) {
            this.audio.src = music.src;
            this.handleListeners(PlayerEventType.MUSIC_INFO_UPDATE, music);
            resolve();
          } else {
            this.handleListeners(PlayerEventType.MUSIC_INFO_UPDATE, music);
            this.handleListeners(PlayerEventType.ERROR, {
              type: PlayerErrorType.SRC_NO_EXIST,
              detail: music.id
            });
            reject();
          }
        });
      }
    });
  }

  // 下一首
  next (play: boolean = true) {
    if (this.list.length === 0) return;
    if (this.list.length === 1 && this.currentId) {
      this.switch(this.currentId).then(() => {
        play && this.play();
      });
    };
    if (this.playOrder === PlayerPlayOrder.RANDOM) {
      const currentIdx = this.randomList.findIndex((id: number) => id === this.currentId);
      const nextIdx: number = currentIdx === this.list.length - 1 ? 0 : currentIdx + 1;
      const nextMusicId = this.randomList[nextIdx];
      this.switch(nextMusicId).then(() => {
        play && this.play();
      });
    } else {
      const currentIdx = this.list.findIndex((music: Music) => music.id === this.currentId);
      const nextIdx: number = currentIdx === this.list.length - 1 ? 0 : currentIdx + 1;
      const nextMusicId = this.list[nextIdx].id;
      this.switch(nextMusicId).then(() => {
        play && this.play();
      });
    }
  }

  // 上一首
  prev (play: boolean = true) {
    if (this.list.length === 0) return;
    if (this.list.length === 1 && this.currentId) {
      this.switch(this.currentId).then(() => {
        play && this.play();
      });
    }
    if (this.playOrder === PlayerPlayOrder.RANDOM) {
      const currentIdx = this.randomList.findIndex((id: number) => id === this.currentId);
      const prevIdx: number = currentIdx === 0 ? this.list.length - 1 : currentIdx - 1;
      const prevMusicId = this.randomList[prevIdx];
      this.switch(prevMusicId).then(() => {
        play && this.play();
      });
    } else {
      const currentIdx = this.list.findIndex((music: Music) => music.id === this.currentId);
      const prevIdx: number = currentIdx === 0 ? this.list.length - 1 : currentIdx - 1;
      const prevMusicId = this.list[prevIdx].id;
      this.switch(prevMusicId).then(() => {
        play && this.play();
      });
    }
  }

  // 预播放
  preplay () {
    if (this.canAutoplay) return;
    this.audio.play().catch(e => {
      console.log(e);
    });
  }

  // 订阅事件
  subscribe (eventType: PlayerEventType, handler: PlayerEventHandler): PlayerUnSubscribeHandler {
    let eventSet: Set<PlayerEventHandler> | undefined = this.listeners.get(eventType);
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
  unsubscribe (eventType: PlayerEventType, handler: PlayerEventHandler): boolean {
    let eventSet: Set<PlayerEventHandler> | undefined = this.listeners.get(eventType);
    if (eventSet === undefined) return false;
    eventSet.delete(handler);
    return true;
  }

  // 执行事件订阅
  private handleListeners (eventType: PlayerEventType, ...payload: Array<any>): void {
    new Promise(resolve => resolve()).then(() => {
      const set = this.listeners.get(eventType);
      if (set) {
        set.forEach((handler: PlayerEventHandler) => {
          handler(...payload);
        });
      }
    });
  }
}

export default Player;