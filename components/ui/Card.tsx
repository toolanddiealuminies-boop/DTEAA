import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  highlighted?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', highlighted = false }) => {
  return (
    <div
      className={`
        bg-light-card rounded-xl shadow-sm border 
        ${highlighted ? 'border-primary ring-2 ring-primary/20' : 'border-light-border'}
        p-6 transition-all duration-200 hover:shadow-md
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
