export const displaySeconds = (duration: number): string => {
  duration = Math.floor(duration);
  let minute = Math.floor(duration / 60);
  let seconds = duration % 60;
  return `${minute < 10 ? `0${minute}` : minute}:${seconds < 10 ? `0${seconds}` : seconds}`;
};

export const shuffle: <T> (arr: Array<T>) => Array<T> = arr => {
  for (let i = arr.length - 1; i >= 0; i--) {
    let rIndex: number = Math.floor(Math.random() * (i+1));
    let temp = arr[rIndex];
    arr[rIndex] = arr[i];
    arr[i] = temp;
  }
  return arr;
};

export const getPercent = (current: number, total: number): number => {
  if (current === 0) return 0;
  return parseFloat((current / total * 100).toFixed(2));
};

export const displayPlayCount = (playCount: number): string => {
  return parseFloat((playCount / 10000).toFixed(2)) + '万';
};