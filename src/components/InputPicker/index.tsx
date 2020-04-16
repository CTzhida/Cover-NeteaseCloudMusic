import React, { 
  FormEventHandler, 
  FocusEventHandler, 
  ChangeEventHandler, 
  MouseEventHandler, 
  ChangeEvent,
  FormEvent, 
  useRef,
  RefObject,
  FocusEvent
} from 'react';
import './InputPicker.scss';

interface IPickerProps {
  value: string;
  className?: string;
  placeholder?: string;
  onValueChange?: (value: string) => void;
  onFocus?: () => void;
  onSubmit?: (value: string) => void;
}

function InputPicker(props: IPickerProps) {
  
  const inputRef: RefObject<HTMLInputElement> = useRef<HTMLInputElement>(null);

  const handleFormSubmit: FormEventHandler = function (event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    props.onSubmit && props.onSubmit(props.value);
    inputRef?.current?.blur();
  };

  const handleInputFocus: FocusEventHandler = function (event: FocusEvent<HTMLInputElement>): void {
    props.onFocus && props.onFocus();
  };

  const handleInputChange: ChangeEventHandler = function (event: ChangeEvent<HTMLInputElement>): void {
    props.onValueChange && props.onValueChange(event.target.value);
  };

  const handleClearValue: MouseEventHandler = function (): void {
    clearValue();
    inputRef?.current?.focus();
  };

  const clearValue = function (): void {
    props.onValueChange && props.onValueChange('');
  };

  return (
    <div className={`input-picker ${props.className}`}>
      <label htmlFor="picker">
        <div className="placeholder">
          <i className="iconfont icon-search"/>
          { props.value === '' && props.placeholder }
        </div>
      </label>
      <form action="" onSubmit={handleFormSubmit}>
          <input 
            ref={inputRef}
            value={props.value}
            id="picker" 
            type="search" 
            autoComplete="false" 
            spellCheck="false"
            onFocus={handleInputFocus}
            onChange={handleInputChange}
          />
          {  props.value !== '' && <i className="iconfont icon-close-circle" onClick={handleClearValue}/> }
        </form>
    </div>
  );
};

export default InputPicker;