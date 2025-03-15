import type { FC } from 'react';

interface LabelInputProps {
  className?: string;
  name?: string;
  label: string;
  mandatory?: boolean;
}

const LabelInput: FC<LabelInputProps> = ({
  className,
  name,
  label,
  mandatory,
}) => {
  return (
    <label htmlFor={name} className={`mb-1 flex gap-1 font-bold ${className}`}>
      {label}
      {mandatory ? <p className='text-red-600'>*</p> : ''}
    </label>
  );
};
export default LabelInput;
