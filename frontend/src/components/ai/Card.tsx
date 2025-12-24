/**
 * Card Component
 * Reusable card container with variants
 */

import { type ReactNode, type HTMLAttributes, type JSX } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

const variantStyles = {
  default: 'bg-white border border-gray-200 shadow-sm',
  elevated: 'bg-white border border-gray-100 shadow-lg',
  outlined: 'bg-transparent border-2 border-gray-200',
  ghost: 'bg-gray-50 border border-transparent',
};

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({
  children,
  variant = 'default',
  hover = false,
  padding = 'none',
  className = '',
  ...props
}: CardProps): JSX.Element {
  return (
    <div
      className={`
        rounded-xl transition-all duration-200
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${hover ? 'hover:shadow-lg hover:-translate-y-0.5 cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = '',
  action,
}: CardHeaderProps): JSX.Element {
  return (
    <div
      className={`
        flex items-center justify-between
        px-6 py-4 border-b border-gray-100
        ${className}
      `}
    >
      <div className="font-semibold text-gray-900">{children}</div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardBody({
  children,
  className = '',
}: CardBodyProps): JSX.Element {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

export function CardFooter({
  children,
  className = '',
}: CardFooterProps): JSX.Element {
  return (
    <div
      className={`
        px-6 py-4 border-t border-gray-100
        bg-gray-50 rounded-b-xl
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export default Card;
export type { CardProps, CardHeaderProps, CardBodyProps, CardFooterProps };