import React, { useState, useEffect } from 'react';
import {
  TextField,
  InputAdornment,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Remove as StableIcon,
} from '@mui/icons-material';

interface PriceInputProps {
  value: number; // Price in cents
  onChange: (newPrice: number) => void;
  originalPrice?: number;
  label?: string;
  size?: 'small' | 'medium';
  disabled?: boolean;
}

export const PriceInput: React.FC<PriceInputProps> = ({
  value,
  onChange,
  originalPrice,
  label = 'Fiyat (₺)',
  size = 'small',
  disabled = false,
}) => {
  const [displayValue, setDisplayValue] = useState((value / 100).toFixed(2));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setDisplayValue((value / 100).toFixed(2));
    }
  }, [value, focused]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setDisplayValue(newValue);
    
    const numericValue = parseFloat(newValue);
    if (!isNaN(numericValue) && numericValue >= 0) {
      onChange(Math.round(numericValue * 100));
    }
  };

  const handleBlur = () => {
    setFocused(false);
    const numericValue = parseFloat(displayValue);
    if (!isNaN(numericValue) && numericValue >= 0) {
      setDisplayValue(numericValue.toFixed(2));
      onChange(Math.round(numericValue * 100));
    } else {
      setDisplayValue((value / 100).toFixed(2));
    }
  };

  const getPriceChangeInfo = () => {
    if (!originalPrice || originalPrice === value) {
      return null;
    }

    const difference = value - originalPrice;
    const percentageChange = ((difference / originalPrice) * 100);
    const isIncrease = difference > 0;

    return {
      difference: Math.abs(difference),
      percentage: Math.abs(percentageChange),
      isIncrease,
      icon: isIncrease ? <TrendingUpIcon /> : <TrendingDownIcon />,
      color: isIncrease ? 'success' : 'error',
    };
  };

  const priceChange = getPriceChangeInfo();

  return (
    <Box>
      <TextField
        label={label}
        type="number"
        value={displayValue}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        size={size}
        disabled={disabled}
        InputProps={{
          startAdornment: <InputAdornment position="start">₺</InputAdornment>,
          inputProps: { 
            min: 0, 
            step: 0.01,
            style: { textAlign: 'right' }
          }
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            bgcolor: priceChange ? (priceChange.isIncrease ? 'success.50' : 'error.50') : 'inherit',
            '&:hover': {
              bgcolor: priceChange ? (priceChange.isIncrease ? 'success.100' : 'error.100') : 'grey.50',
            },
          },
        }}
      />
      
      {priceChange && (
        <Box sx={{ mt: 1 }}>
          <Chip
            icon={priceChange.icon}
            label={`${priceChange.isIncrease ? '+' : '-'}₺${(priceChange.difference / 100).toFixed(2)} (${priceChange.percentage.toFixed(1)}%)`}
            color={priceChange.color}
            size="small"
            sx={{ fontSize: '0.75rem' }}
          />
        </Box>
      )}
    </Box>
  );
};