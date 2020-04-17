import React from 'react';

export type ConfirmOptions = {
  confirmButtonText?: string; // 确认按钮文本
  cancelButtonText?: string; // 取消按钮文本
  showConfirmButton?: boolean; // 是否显示确认按钮
  showCancelButton?: boolean; // 是否显示取消按钮 
}

interface IConfirmProps {
  confirm (): void;
  cancel (): void;
  message: string;
  options: ConfirmOptions;
}
function Confirm (props: IConfirmProps) {

  const confirm = () => {
    props.confirm();
  };

  const cancel = () => {
    props.cancel();
  };

  return (
    <div className="ui-modal-confirm">
      <div className="message">{ props.message }</div>
      <div className="buttons">
        { props.options.showCancelButton && <div onClick={cancel}>{ props.options.cancelButtonText }</div> }
        { props.options.showConfirmButton && <div onClick={confirm}>{ props.options.confirmButtonText }</div> }
      </div>
    </div>
  );
}

export default Confirm;