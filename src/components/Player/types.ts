export enum PlayerEventType {
  PLAY = 'play', // 播放
  PAUSE = 'pause', // 暂停
  CANPLAY = 'canplay', // 歌曲加载到可播放的程度
  TIMEUPDATE = 'timeupdate', // 歌曲进度变化
  ERROR = 'error', // 播放错误
  ENDED = 'ENDED', // 播放结束
  LIST_CHANGE = 'listChange', // 歌曲列表更新
  MUSIC_INFO_UPDATE = 'musicInfoUpdate', // 歌曲信息更新
  PLAY_ORDER_UPDATE = 'playOrderUpdate', // 歌曲播放顺序更新
}

export enum PlayerErrorType {
  AUDIO_ERROR = 'audioError', // audio对象抛出来的
  SRC_NO_EXIST = 'srcNoExist', // 歌曲没有src
  CANNOT_AUTO_PLAY = 'cannotAutoPlay', // 禁止自动播放
}

export type PlayerError = {
  type: PlayerErrorType;
  detail: any;
}

export enum PlayerPlayOrder {
  LOOP = 'LOOP', // 单曲播放
  RANDOM = 'RANDOM', // 随机播放
  LIST = 'LIST', // 列表播放
}

export type PlayerEventHandler = Function;

export type PlayerUnSubscribeHandler = Function;