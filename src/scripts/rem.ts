let designWidth: number = 750; // 设计图宽度
let devicePixelWidth: number = window.screen.width; // 设备宽度独立像素
let docEl: HTMLElement = document.documentElement;

let width: number = devicePixelWidth > designWidth ? designWidth : devicePixelWidth; // 计算宽度
let fontSize: number = width / designWidth * 100;

docEl.style.fontSize = `${fontSize}px`;
document.body.style.fontSize = '0.28rem';

export default {};