/**
 * FormDatePicker Component
 * Reusable date/datetime input
 * 
 * @module components/forms/FormDatePicker
 */

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { AlertCircle, Calendar } from 'lucide-react';

interface FormDatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  showTime?: boolean;
}

const sizeClasses = {
  sm: 'py-2 text-sm',
  md: 'py-3 text-base',
  lg: 'py-4 text-lg',
} as const;

const FormDatePicker = forwardRef<HTMLInputElement, FormDatePickerProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      size = 'md',
      fullWidth = true,
      showTime = false,
      className = '',
      id,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? `datepicker-${label?.toLowerCase().replace(/\s+/g, '-')}`;
    const inputType = showTime ? 'datetime-local' : 'date';

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {leftIcon ?? <Calendar className="w-5 h-5" />}
          </div>

          <input
            ref={ref}
            type={inputType}
            id={inputId}
            disabled={disabled}
            required={required}
            className={`
              w-full border rounded-xl outline-none transition-all
              ${sizeClasses[size]}
              pl-10 pr-4
              ${error
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                : 'border-gray-200 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-100'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}
              ${className}
            `}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-2 text-sm text-red-500 flex items-center gap-1"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-2 text-sm text-gray-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

FormDatePicker.displayName = 'FormDatePicker';

export default FormDatePicker;