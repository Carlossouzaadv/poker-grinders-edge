import React from 'react';

interface DealerButtonProps {
  size?: 'small' | 'medium' | 'large';
}

const DealerButton: React.FC<DealerButtonProps> = ({ size = 'medium' }) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          width: '20px',
          height: '20px',
          fontSize: '10px',
          borderWidth: '1px'
        };
      case 'large':
        return {
          width: '40px',
          height: '40px',
          fontSize: '16px',
          borderWidth: '3px'
        };
      default:
        return {
          width: '28px',
          height: '28px',
          fontSize: '12px',
          borderWidth: '2px'
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <div
      className="bg-white rounded-full flex items-center justify-center font-bold text-black shadow-lg cursor-default select-none"
      style={{
        ...sizeStyles,
        border: `${sizeStyles.borderWidth} solid #2D2D2D`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.5)'
      }}
      title="Dealer Button"
    >
      D
    </div>
  );
};

export default DealerButton;