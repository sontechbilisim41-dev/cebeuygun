import React, { useState, useEffect } from 'react';
import {
  TextField,
  Box,
  Typography,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

interface StockInputProps {
  value: number;
  onChange: (newStock: number) => void;
  originalStock?: number;
  label?: string;
  size?: 'small' | 'medium';
  disabled?: boolean;
  showQuickButtons?: boolean;
}

export const StockInput: React.FC<StockInputProps> = ({
  value,
  onChange,
  originalStock,
  label = 'Stok Adedi',
  size = 'small',
  disabled = false,
  showQuickButtons = true,
}) => {
  const [displayValue, setDisplayValue] = useState(value.toString());
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setDisplayValue(value.toString());
    }
  }, [value, focused]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setDisplayValue(newValue);
    
    const numericValue = parseInt(newValue);
    if (!isNaN(numericValue) && numericValue >= 0) {
      onChange(numericValue);
    }
  };

  const handleBlur = () => {
    setFocused(false);
    const numericValue = parseInt(displayValue);
    if (!isNaN(numericValue) && numericValue >= 0) {
      setDisplayValue(numericValue.toString());
      onChange(numericValue);
    } else {
      setDisplayValue(value.toString());
    }
  };

  const handleQuickAdjust = (adjustment: number) => {
    const newValue = Math.max(0, value + adjustment);
    onChange(newValue);
  };

  const getStockChangeInfo = () => {
    if (originalStock === undefined || originalStock === value) {
      return null;
    }

    const difference = value - originalStock;
    const isIncrease = difference > 0;

    return {
      difference: Math.abs(difference),
      isIncrease,
      color: isIncrease ? 'success' : 'error',
    };
  };

  const stockChange = getStockChangeInfo();
  const isLowStock = value > 0 && value < 10;
  const isOutOfStock = value === 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
            inputProps: { 
              min: 0, 
              step: 1,
              style: { textAlign: 'right' }
            }
          }}
          sx={{
            flex: 1,
            '& .MuiOutlinedInput-root': {
              bgcolor: stockChange ? (stockChange.isIncrease ? 'success.50' : 'error.50') : 'inherit',
            },
          }}
        />
        
        {showQuickButtons && !disabled && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => handleQuickAdjust(10)}
              sx={{ 
                bgcolor: 'success.100',
                '&:hover': { bgcolor: 'success.200' },
                width: 32,
                height: 32,
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleQuickAdjust(-10)}
              disabled={value < 10}
              sx={{ 
                bgcolor: 'error.100',
                '&:hover': { bgcolor: 'error.200' },
                width: 32,
                height: 32,
              }}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>
      
      {/* Stock Change Indicator */}
      {stockChange && (
        <Box sx={{ mt: 1 }}>
          <Chip
            label={`${stockChange.isIncrease ? '+' : '-'}${stockChange.difference} adet`}
            color={stockChange.color}
            size="small"
            sx={{ fontSize: '0.75rem' }}
          />
        </Box>
      )}
      
      {/* Stock Warning */}
      {(isLowStock || isOutOfStock) && (
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <WarningIcon 
            color={isOutOfStock ? 'error' : 'warning'} 
            sx={{ fontSize: 16 }} 
          />
          <Typography 
            variant="caption" 
            color={isOutOfStock ? 'error.main' : 'warning.main'}
            fontWeight="600"
          >
            {isOutOfStock ? 'Stok tükendi!' : 'Az stok kaldı!'}
          </Typography>
        </Box>
      )}
    </Box>
  );
};