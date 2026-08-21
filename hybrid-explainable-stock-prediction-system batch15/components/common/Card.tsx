
import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] ${className}`}>
      {title && <h3 className="text-xl font-semibold text-gray-200 mb-4">{title}</h3>}
      {children}
    </div>
  );
};

export default Card;
