import React, { createRef, RefObject } from 'react';
import ReactDOM from 'react-dom';
import Toast, { ToastHandles } from './Toast';

let div: HTMLElement | null = document.getElementById('ui-toast');
if (div === null) {
  div = document.createElement('div');
  div.id = 'ui-toast';
  document.body.appendChild(div);
}

type ConfigOptions = {
  duration?: number;
  mask?: boolean
}

const config = {
  duration: 2000,
  mask: false
};

type Notification = {
  instance: RefObject<ToastHandles> | null;
  visiable: boolean;
  timer: NodeJS.Timeout | null;
  notice (message: string, duration: number, mask: boolean): void;
  hide (): void;
}

const notification: Notification = {
  instance: null,
  visiable: false,
  timer: null,
  notice (message: string, duration: number, mask: boolean) {
    this.instance = createRef();
    ReactDOM.render(<Toast ref={this.instance} message={message} mask={mask} />, div, () => {
      if (this.timer !== null) {
        clearTimeout(this.timer);
      };

      this.timer = setTimeout(() => {
        this.hide();
      }, duration);

      this.instance?.current?.show();

      this.visiable = true;
    });
  },
  hide () {
    if (this.visiable === false) return;
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    };
    if (this.instance) this.instance.current?.hide();
    this.visiable = false;
  }
};

export default {
  info (message: string, duration: number = config.duration, onClose?: Function, mask: boolean = config.mask) {
    notification.notice(message, duration, mask);
  },
  hide () {
    notification.hide();
  },
  config (options: ConfigOptions) {
    config.duration = options.duration || config.duration;
    config.mask = options.mask || config.mask;
  }
};