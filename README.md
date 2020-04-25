# Cover 网易云音乐H5
  - Typescript
  - React
  - Redux

## API来自
 - 网易云API(非常感谢)：https://github.com/Binaryify/NeteaseCloudMusicApi.git

## Preview Address
  - https://47.106.244.102

## Github
  - https://github.com/lz7git/Cover-NeteaseCloudMusic

## 前言

最近在学习 Typescript 与React，过了一遍文档后决定动手实践一下，个人比较喜欢音乐，于是就选了这个主题来尝试，接下来简单分享一些项目中用到代码片段，以及基本使用方法。<br >
<div style="text-align: right;">知识是宝库,但开启这个宝库的钥匙是实践 --- 托·富勒</div>

## 搜索防抖
<div style="text-align: center">
  <img src="http://47.106.244.102:9002/images/1.gif" style="height: 600px;"/>
</div>


```javascript
// 防抖Hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timeout);
    };
  },[value, delay]);

  return debouncedValue;
}



// 使用
function App () {
  const [value, setValue] = useState('');

  const debounceValue = useDebounce(value, 500);

  useEffect(() => {
    if (!debounceValue) return;
    console.log(debounceValue); // 500ms 后打印
  }, [debounceValue]);

  return (
    <div>
      <input onChange={event => setValue(event.target.value) }/>
    </div>
  );
}
```

## 关键字高亮
<div style="text-align: center">
  <img src="http://47.106.244.102:9002/images/5.jpg" style="height: 600px;"/>
</div>

```javascript
// 默认props, 自定义生成ReactNode节点的属性，这里给了一个className，样式自行去css添加
const initializeProps = {
  className: 'hightlight'
}
/**
 * 匹配关键词词添加包裹标签
 * @param contents 文本内容
 * @param keywords 匹配的词
 * @param tag 添加的标签
 * @param props 标签属性
 */
function highlightKeywords(contents, keywords = '', tag = 'span', props = initializeProps) {
  const regex = new RegExp(`(${keywords})`, 'gi');
  
  // 这是一个包含 纯字符串 和 createElement 方法返回的 ReactNode 数组
  const nodes = contents.split(regex).map((res, index) => {
    if (res === keywords) {
      return createElement(tag, { ...props, key: index}, res);
    }
    return res;
  });

  // 借助 JSX 存天然的使用方式，这里直接返回一个 ReactNode 对象
  return createElement(Fragment, null, nodes);
};



// 使用
function App () {
  return (
    <div>
      { highlightKeywords('蔡徐坤在美国的篮球队里打篮球', '蔡徐坤') }
    </div>
  )
}
```

## 拖拽条
<div style="text-align: center">
  <img src="http://47.106.244.102:9002/images/4.gif" style="height: 600px;"/>
</div>

```javascript
// 用来记录触摸条的状态
const touch = {
  width: 0, // 记录触摸条的宽度
  x: 0
}

function App () {
  const [drag, setDrag] = useState(false); // 触摸的状态

  const [positionX, setPositionX] = useState(0); // 拖动球的位置

  const barRef = useRef(null);

  // 更新触摸条的宽度
  useEffect(() => {
    if (barRef.current) {
      touch.width = barRef.current.offsetWidth;
    }
  }, []);

  // 触摸开始
  const handleTouchStart = function (event) {
    touch.x = event.targetTouches[0].pageX;
    setDrag(true);
  }

  // 触摸拖动
  const handleTouchMove = function (event) {
    if (drag === false) return;
    // 移动的位置
    const move = event.targetTouches[0].pageX - touch.x;
    // 触摸条宽度的百分比记录位置
    const newPositionX = Number((move / touch.x * 100).toFixed(1));
    // 为了避开JS浮点数精度问题，先乘10，相加完后，再除10
    let result = ((positionX * 10) + (newPositionX * 10)) / 10;
    // 避免超出滚动条，这里再做一下判断
    if (result < 0) {
      result = 0;
    } else if (result > 100) {
      result = 100;
    }
    // 判断，如果位置有改变，才更新state，规避多余的render执行
    if (result !== positionX) {
      setPositionX(result);
    }
    // 最后记录下移动的位置存储起来
    touch.x = event.targetTouches[0].pageX;
  }

  // 触摸结束
  const handleTouchEnd = function () {
    if (drag === false) return;
    setDrag(false);
  }

  return (
    <div class="bar" ref={ barRef }>
      <div
        className="ball"
        onTouchStart={ handleTouchStart }
        onTouchEnd={ handleTouchEnd }
        onTouchMove= { handleTouchMove }
      ></div>
    </div>
  )
}
```
【交互优化】为何摸得如此舒服？答案在下面的图片里...
<div style="text-align: center">
  <img src="http://47.106.244.102:9002/images/6.png" style="width: 600px;"/>
</div>

## 播放模块
考虑到播放模块在路由的任意位置都能访问到，所以用了单例模式
```javascript
// component/Player/index.js
import Player from './Player';
const player = new Player();
export default player;
```

播放器与 页面/组件 的解藕，这里借鉴了 redux 源码中的 subscribe 思想(发布订阅模式)，根据 订阅事件的类型 存放在对应类型的集合里，在事件触发后，通过遍历的方式执行使用者订阅的事件
```javascript
// 类
class Player {
  constructor () {
    this.audio.addEventListener('play', event => {
      this.handleListeners('play', event);
    });
  }
  // 用字典类型存放各种事件类型的集合 Map<EventType, Set<Handler>>
  listeners = new Map();
  // 订阅事件
  subscribe (eventType, handler) {
    let eventSet = this.listeners.get(eventType);
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
  unsubscribe (eventType, handler) {
    let eventSet = this.listeners.get(eventType);
    if (eventSet === undefined) return false;
    eventSet.delete(handler);
    return true;
  }
  // 执行订阅的事件
  private handleListeners (eventType, ...payload) {
    new Promise(resolve => resolve()).then(() => {
      const set = this.listeners.get(eventType);
      if (set) {
        set.forEach(handler => handler(...payload));
      }
    });
  }
}


// 页面
import player from 'component/Player';

function App () {
  const [playing, setPlaying] = useState(player.playing);

  useEffect(() => {
    // 订阅播放事件
    const unsubscribe = player.subscribe('play', () => {
      setPlaying(true);
    });
    return () => {
      unsubscribe(); // 在页面销毁前取消订阅
    }
  });

  return (
    <div>{ playing ? '播放中...' : '暂停' }</div>
  )
}
```

## 结语
上面的代码是经过删减的，重要的是思路，希望能帮助到大家。
项目的内容不多，贵在实践。
再次感谢 API 提供者 <a href="https://github.com/Binaryify">Binaryify</a> (PS: 开局一个API，字段全靠猜)，不过还是打从心里感谢！
<div style="text-align: center">
  <img src="http://47.106.244.102:9002/images/emoji01.png" style="width: 100px;"/>
</div>