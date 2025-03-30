import React from 'react';
import { TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'all 0.2s ease-in-out',
    
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.08)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    
    '&.Mui-focused': {
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(33, 150, 243, 0.5)',
      boxShadow: '0 0 0 2px rgba(33, 150, 243, 0.2)',
    },
  },
  
  '& .MuiInputBase-input': {
    color: '#fff',
    padding: '12px 16px',
    fontSize: '0.95rem',
    
    '&::placeholder': {
      color: 'rgba(255, 255, 255, 0.5)',
      opacity: 1,
    },
  },
  
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.95rem',
    
    '&.Mui-focused': {
      color: '#2196f3',
    },
  },
  
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
  
  '& .MuiFormHelperText-root': {
    color: 'rgba(255, 255, 255, 0.5)',
    marginLeft: '4px',
    
    '&.Mui-error': {
      color: '#f44336',
    },
  },
  
  // Error-Zustand
  '& .Mui-error': {
    '& .MuiInputBase-root': {
      border: '1px solid #f44336',
      background: 'rgba(244, 67, 54, 0.08)',
      
      '&:hover': {
        border: '1px solid #d32f2f',
      },
      
      '&.Mui-focused': {
        boxShadow: '0 0 0 2px rgba(244, 67, 54, 0.2)',
      },
    },
    
    '& .MuiInputLabel-root': {
      color: '#f44336',
    },
  },
  
  // Disabled-Zustand
  '& .Mui-disabled': {
    '& .MuiInputBase-root': {
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: 'rgba(255, 255, 255, 0.3)',
    },
    
    '& .MuiInputLabel-root': {
      color: 'rgba(255, 255, 255, 0.3)',
    },
  },
}));

const MotionTextField = motion(StyledTextField);

export const Input = React.forwardRef(({ 
  animate = true,
  ...props 
}, ref) => {
  if (!animate) {
    return <StyledTextField ref={ref} {...props} />;
  }

  return (
    <MotionTextField
      ref={ref}
      component={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1],
      }}
      {...props}
    />
  );
}); 