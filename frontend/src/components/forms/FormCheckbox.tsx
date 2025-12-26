/**
 * FormCheckbox Component
 * Reusable checkbox with label support
 * 
 * @module components/forms/FormCheckbox
 */

import { forwardRef, type InputHTMLAttributes } from 'react';
import { Check } from 'lucide-react';

interface FormCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  description?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
} as const;

const checkSizes = {
  sm: 'w-3 h-3',
  md: 'w-3.5 h-3.5',
  lg: 'w-4 h-4',
} as const;

const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
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
    const checkboxId = id ?? `checkbox-${label?.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div className={className}>
        <label
          htmlFor={checkboxId}
          className={`flex items-start gap-3 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        >
          <div className="relative flex-shrink-0 mt-0.5">
            <input
              ref={ref}
              type="checkbox"
              id={checkboxId}
              disabled={disabled}
              checked={checked}
              className="sr-only peer"
              {...props}
            />
            <div
              className={`
                ${sizeClasses[size]}
                border-2 rounded-md transition-all
                peer-focus:ring-2 peer-focus:ring-purple-100
                ${checked
                  ? 'bg-purple-600 border-purple-600'
                  : 'border-gray-300 bg-white'
                }
                ${error ? 'border-red-500' : ''}
              `}
            >
              {checked && (
                <Check className={`${checkSizes[size]} text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`} />
              )}
            </div>
          </div>

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
        </label>

        {error && (
          <p className="mt-2 text-sm text-red-500 ml-8">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormCheckbox.displayName = 'FormCheckbox';

export default FormCheckbox;