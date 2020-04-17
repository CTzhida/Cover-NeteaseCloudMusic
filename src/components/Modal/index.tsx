import React from 'react';
import ReactDOM from 'react-dom';
import Confirm, {  ConfirmOptions} from './Confirm';
import './Modal.scss';

const UI_MODAL_ID = 'ui-modal';


const removeElement = () => {
  let modal = document.getElementById(UI_MODAL_ID);
  if (modal !== null) {
    document.body.removeChild(modal);
  }
};

const createElement = () => {
  let oldModal = document.getElementById(UI_MODAL_ID);
  if (oldModal !== null) return oldModal;
  let modal = document.createElement('div');
  modal.id = UI_MODAL_ID;
  document.body.appendChild(modal);
  return modal;
};

const initConfirmOptions: ConfirmOptions = {
  confirmButtonText: '确定',
  cancelButtonText: '取消',
  showCancelButton: true,
  showConfirmButton: true
};

export default {
  confirm (message: string, options: ConfirmOptions = {}) {
    return new Promise((resolve, reject) => {
      options = Object.assign(initConfirmOptions, options);
      const div = createElement();
      const confirm = () => {
        resolve();
        removeElement();
      };
      const cancel = () => {
        reject();
        removeElement();
      };
      ReactDOM.render(
        <Confirm 
          message={message}
          options={options}
          confirm={confirm} 
          cancel={cancel} 
        />, 
        div
      );
    });
  }
};