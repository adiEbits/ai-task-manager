/**
 * FormTextarea Component
 * Reusable textarea with label and error support
 * 
 * @module components/forms/FormTextarea
 */

import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { AlertCircle } from 'lucide-react';

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
  showCharCount?: boolean;
  maxLength?: number;
}

const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    {
      label,
      error,
      hint,
      fullWidth = true,
      showCharCount = false,
      maxLength,
      className = '',
      id,
      required,
      disabled,
      value,
      ...props
    },
    ref
  ) => {
    const textareaId = id ?? `textarea-${label?.toLowerCase().replace(/\s+/g, '-')}`;
    const charCount = typeof value === 'string' ? value.length : 0;

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          value={value}
          className={`
            w-full px-4 py-3 border rounded-xl outline-none transition-all resize-none
            ${error
              ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
              : 'border-gray-200 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-100'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}
            ${className}
          `}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
          {...props}
        />

        <div className="flex justify-between mt-2">
          <div>
            {error && (
              <p
                id={`${textareaId}-error`}
                className="text-sm text-red-500 flex items-center gap-1"
                role="alert"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </p>
            )}

            {hint && !error && (
              <p id={`${textareaId}-hint`} className="text-sm text-gray-500">
                {hint}
              </p>
            )}
          </div>

          {showCharCount && maxLength && (
            <p className={`text-sm ${charCount >= maxLength ? 'text-red-500' : 'text-gray-400'}`}>
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

FormTextarea.displayName = 'FormTextarea';

export default FormTextarea;