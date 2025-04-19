import type { FC } from 'react';

import { Calendar, CalendarPropsSingle } from 'primereact/calendar';
import LabelInput from '../labelInput/LabelInput';


export interface SingleCalendarInputProps extends CalendarPropsSingle {
  className?: string;
  name: string;
  label: string;
  showIcon?: boolean;
  readOnlyInput?: boolean;
  mandatory?: boolean;
  error?: string;
}

const SingleCalendarInput: FC<SingleCalendarInputProps> = ({
  className,
  name,
  label,
  error,
  value,
  showIcon,
  readOnlyInput,
  mandatory = false,
  ...props
}) => {
  return (
    <section className={`p-fluid flex flex-col ${className}`}>
      <LabelInput
        className='leading-4'
        name={name}
        label={label}
        mandatory={mandatory}
      />

      <Calendar
        name={name}
        value={value}
        showIcon={showIcon}
        readOnlyInput={readOnlyInput}
        {...props}
      />

      <small className='p-error'>{error}</small>
    </section>
  );
};

export default SingleCalendarInput;
