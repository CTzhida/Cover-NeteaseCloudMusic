import React, { forwardRef, ForwardRefRenderFunction, useImperativeHandle, useState, Fragment } from 'react';
import './Toast.scss';

export interface ToastHandles {
  show(): void;
  hide(): void;
}

interface ToastProps {
  message: string;
  mask: boolean;
}

const Toast: ForwardRefRenderFunction<ToastHandles, ToastProps> = (props, ref) => {
  const [ visiable, setVisiable ] = useState<boolean>(false);

  const show = () => {
    if (visiable === true) return;
    setVisiable(true);
  };

  const hide = () => {
    if (visiable === false) return;
    setVisiable(false);
  };

  useImperativeHandle(ref, () => ({
    show,
    hide
  }));

  if (!visiable) return null;
  
  return (
    <Fragment>
      { props.mask && <div className="ui-toast-mask"></div> }
      <div className="ui-toast-content">
        <div>{ props.message }</div>
      </div>
    </Fragment>
  );
};

export default forwardRef(Toast);