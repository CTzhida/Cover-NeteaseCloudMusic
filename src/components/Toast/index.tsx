import React, { createRef, RefObject } from 'react';
import ReactDOM from 'react-dom';
import Toast, { ToastHandles } from './Toast';

const UI_TOAST_ID = 'ui-toast';

const removeElement = () => {
  let toast = document.getElementById(UI_TOAST_ID);
  if (toast !== null) {
    document.body.removeChild(toast);
  }
};

const createElement = () => {
  let oldToast = document.getElementById(UI_TOAST_ID);
  if (oldToast !== null) return oldToast;
  let toast = document.createElement('div');
  toast.id = UI_TOAST_ID;
  document.body.appendChild(toast);
  return toast;
};

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
    const div = createElement();

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
    removeElement();
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