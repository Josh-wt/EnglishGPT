import React from 'react';
import { motion } from 'framer-motion';

/**
 * Card component with animations and various styles
 * @param {Object} props - Component props
 * @param {string} props.variant - Card variant (default, elevated, outlined, gradient)
 * @param {boolean} props.hoverable - Whether card should have hover effects
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.children - Card content
 * @param {Object} props...rest - Other props
 */
export const Card = ({
  variant = 'default',
  hoverable = false,
  className = '',
  children,
  ...rest
}) => {
  const baseClasses = 'rounded-2xl transition-all duration-300';
  
  const variantClasses = {
    default: 'bg-white shadow-lg',
    elevated: 'bg-white shadow-xl',
    outlined: 'bg-white border-2 border-gray-200',
    gradient: 'bg-gradient-to-br from-white to-gray-50 shadow-lg',
    dark: 'bg-gray-800 text-white shadow-lg',
  };
  
  const hoverClasses = hoverable ? 'hover:shadow-2xl hover:scale-105 cursor-pointer' : '';
  
  const classes = [
    baseClasses,
    variantClasses[variant],
    hoverClasses,
    className,
  ].filter(Boolean).join(' ');

  const MotionComponent = hoverable ? motion.div : 'div';

  return (
    <MotionComponent
      className={classes}
      whileHover={hoverable ? { y: -5 } : {}}
      transition={{ type: "spring", stiffness: 300 }}
      {...rest}
    >
      {children}
    </MotionComponent>
  );
};

/**
 * Card Header component
 * @param {Object} props - Component props
 * @param {string} props.title - Header title
 * @param {string} props.subtitle - Header subtitle
 * @param {Object} props.children - Header content
 * @param {string} props.className - Additional CSS classes
 */
export const CardHeader = ({
  title,
  subtitle,
  children,
  className = '',
}) => {
  return (
    <div className={`p-6 border-b border-gray-200 ${className}`}>
      {title && (
        <h3 className="text-lg font-fredoka font-bold text-gray-900 mb-1">
          {title}
        </h3>
      )}
      {subtitle && (
        <p className="text-sm text-gray-600 mb-2">
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
};

/**
 * Card Body component
 * @param {Object} props - Component props
 * @param {Object} props.children - Body content
 * @param {string} props.className - Additional CSS classes
 */
export const CardBody = ({
  children,
  className = '',
}) => {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
};

/**
 * Card Footer component
 * @param {Object} props - Component props
 * @param {Object} props.children - Footer content
 * @param {string} props.className - Additional CSS classes
 */
export const CardFooter = ({
  children,
  className = '',
}) => {
  return (
    <div className={`p-6 border-t border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

/**
 * Stat Card component for displaying statistics
 * @param {Object} props - Component props
 * @param {string} props.title - Stat title
 * @param {string|number} props.value - Stat value
 * @param {string} props.subtitle - Stat subtitle
 * @param {string} props.icon - Stat icon
 * @param {string} props.color - Stat color theme
 * @param {boolean} props.trending - Whether to show trending indicator
 * @param {string} props.trendDirection - Trend direction (up, down)
 * @param {string} props.className - Additional CSS classes
 */
export const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  color = 'purple',
  trending = false,
  trendDirection = 'up',
  className = '',
}) => {
  const colorClasses = {
    purple: 'from-purple-500 to-pink-500',
    blue: 'from-blue-500 to-indigo-500',
    green: 'from-green-500 to-emerald-500',
    red: 'from-red-500 to-pink-500',
    yellow: 'from-yellow-500 to-orange-500',
    indigo: 'from-indigo-500 to-purple-500',
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
  };

  return (
    <Card variant="elevated" hoverable className={className}>
      <CardBody>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">
              {title}
            </p>
            <div className="flex items-baseline">
              <p className="text-2xl font-fredoka font-bold text-gray-900">
                {value}
              </p>
              {trending && (
                <span className={`ml-2 text-sm font-medium ${trendColors[trendDirection]}`}>
                  {trendDirection === 'up' ? '↗' : '↘'}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {icon && (
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${colorClasses[color]} flex items-center justify-center`}>
              <span className="text-white text-xl">
                {icon}
              </span>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default Card;
