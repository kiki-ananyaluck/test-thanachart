'use client';

import { useState } from 'react';

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void | Promise<void>;
  min?: number;
  max: number;
  disabled?: boolean;
}

const QuantitySelector = ({ 
  value, 
  onChange, 
  min = 1, 
  max,
  disabled = false
}: QuantitySelectorProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDecrease = async () => {
    if (value > min && !isProcessing && !disabled) {
      setIsProcessing(true);
      try {
        await onChange(value - 1);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleIncrease = async () => {
    if (value < max && !isProcessing && !disabled) {
      setIsProcessing(true);
      try {
        await onChange(value + 1);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isProcessing || disabled) return;
    
    const newValue = parseInt(e.target.value) || min;
    const clampedValue = Math.max(min, Math.min(max, newValue));
    
    if (clampedValue !== value) {
      setIsProcessing(true);
      try {
        await onChange(clampedValue);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="join">
        <button
          type="button"
          className="btn btn-outline join-item"
          onClick={handleDecrease}
          disabled={value <= min || isProcessing || disabled}
        >
          {isProcessing ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            '-'
          )}
        </button>
        
        <input
          type="number"
          className="input input-bordered join-item w-20 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          value={value}
          onChange={handleInputChange}
          min={min}
          max={max}
          disabled={isProcessing || disabled}
        />
        
        <button
          type="button"
          className="btn btn-outline join-item"
          onClick={handleIncrease}
          disabled={value >= max || isProcessing || disabled}
        >
          {isProcessing ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            '+'
          )}
        </button>
      </div>
    </div>
  );
};

export default QuantitySelector;
