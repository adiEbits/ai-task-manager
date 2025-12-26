/**
 * FormRadioGroup Component
 * Reusable radio button group
 * 
 * @module components/forms/FormRadioGroup
 */

import { type InputHTMLAttributes, type JSX } from 'react';
import { AlertCircle } from 'lucide-react';

interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface FormRadioGroupProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  options: RadioOption[];
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
} as const;

export default function FormRadioGroup({
  label,
  error,
  hint,
  options,
  value,
  onChange,
  orientation = 'vertical',
  size = 'md',
  name,
  required,
  disabled,
}: FormRadioGroupProps): JSX.Element {
  const groupId = name ?? `radio-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div role="radiogroup" aria-labelledby={`${groupId}-label`}>
      {label && (
        <div id={`${groupId}-label`} className="text-sm font-medium text-gray-700 mb-3">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </div>
      )}

      <div
        className={`
          ${orientation === 'horizontal' ? 'flex flex-wrap gap-4' : 'space-y-3'}
        `}
      >
        {options.map((option) => {
          const optionId = `${groupId}-${option.value}`;
          const isChecked = value === option.value;
          const isDisabled = disabled || option.disabled;

          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className={`
                flex items-start gap-3
                ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              `}
            >
              <div className="relative flex-shrink-0 mt-0.5">
                <input
                  type="radio"
                  id={optionId}
                  name={groupId}
                  value={option.value}
                  checked={isChecked}
                  onChange={onChange}
                  disabled={isDisabled}
                  required={required}
                  className="sr-only peer"
                />
                <div
                  className={`
                    ${sizeClasses[size]}
                    border-2 rounded-full transition-all
                    peer-focus:ring-2 peer-focus:ring-purple-100
                    ${isChecked
                      ? 'border-purple-600'
                      : 'border-gray-300'
                    }
                    ${error ? 'border-red-500' : ''}
                  `}
                >
                  {isChecked && (
                    <div
                      className={`
                        absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        rounded-full bg-purple-600
                        ${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-2.5 h-2.5' : 'w-3 h-3'}
                      `}
                    />
                  )}
                </div>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-900">
                  {option.label}
                </span>
                {option.description && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    {option.description}
                  </p>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-500 flex items-center gap-1" role="alert">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </p>
      )}

      {hint && !error && (
        <p className="mt-2 text-sm text-gray-500">
          {hint}
        </p>
      )}
    </div>
  );
}