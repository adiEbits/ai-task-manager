/**
 * FormSwitch Component
 * Reusable toggle switch
 * 
 * @module components/forms/FormSwitch
 */

import { forwardRef, type InputHTMLAttributes } from 'react';

interface FormSwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  description?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
}

const trackSizes = {
  sm: 'w-8 h-4',
  md: 'w-11 h-6',
  lg: 'w-14 h-7',
} as const;

const thumbSizes = {
  sm: 'w-3 h-3',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
} as const;

const thumbTranslate = {
  sm: 'translate-x-4',
  md: 'translate-x-5',
  lg: 'translate-x-7',
} as const;

const FormSwitch = forwardRef<HTMLInputElement, FormSwitchProps>(
  (
    {
      label,
      description,
      error,
      size = 'md',
      className = '',
      id,
      disabled,
      checked,
      ...props
    },
    ref
  ) => {
    const switchId = id ?? `switch-${label?.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div className={className}>
        <label
          htmlFor={switchId}
          className={`flex items-center justify-between gap-3 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        >
          <div>
            {label && (
              <span className="text-sm font-medium text-gray-900">
                {label}
              </span>
            )}
            {description && (
              <p className="text-sm text-gray-500 mt-0.5">
                {description}
              </p>
            )}
          </div>

          <div className="relative flex-shrink-0">
            <input
              ref={ref}
              type="checkbox"
              role="switch"
              id={switchId}
              disabled={disabled}
              checked={checked}
              className="sr-only peer"
              {...props}
            />
            <div
              className={`
                ${trackSizes[size]}
                rounded-full transition-colors
                peer-focus:ring-2 peer-focus:ring-purple-100 peer-focus:ring-offset-2
                ${checked ? 'bg-purple-600' : 'bg-gray-200'}
                ${error ? 'ring-2 ring-red-500' : ''}
              `}
            />
            <div
              className={`
                ${thumbSizes[size]}
                absolute top-1/2 -translate-y-1/2 left-0.5
                bg-white rounded-full shadow-sm transition-transform
                ${checked ? thumbTranslate[size] : 'translate-x-0'}
              `}
            />
          </div>
        </label>

        {error && (
          <p className="mt-2 text-sm text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormSwitch.displayName = 'FormSwitch';

export default FormSwitch;