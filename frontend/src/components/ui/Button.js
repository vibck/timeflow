import React from 'react';
import { Button as MuiButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

const StyledButton = styled(MuiButton)(({ theme }) => ({
  borderRadius: '12px',
  padding: '10px 24px',
  fontSize: '0.95rem',
  fontWeight: 600,
  letterSpacing: '0.5px',
  textTransform: 'none',
  boxShadow: 'none',
  position: 'relative',
  overflow: 'hidden',
  
  '&.MuiButton-contained': {
    background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
    color: '#fff',
    border: 'none',
    
    '&:hover': {
      background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
    },
    
    '&:active': {
      transform: 'scale(0.98)',
    },
  },
  
  '&.MuiButton-outlined': {
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#fff',
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
    },
    
    '&:active': {
      transform: 'scale(0.98)',
    },
  },
  
  '&.MuiButton-text': {
    color: '#fff',
    padding: '6px 12px',
    
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.1)',
    },
  },
  
  '&.Mui-disabled': {
    background: 'rgba(255, 255, 255, 0.12)',
    color: 'rgba(255, 255, 255, 0.3)',
  },
  
  // Größenvarianten
  '&.MuiButton-sizeLarge': {
    padding: '12px 32px',
    fontSize: '1rem',
  },
  
  '&.MuiButton-sizeSmall': {
    padding: '6px 16px',
    fontSize: '0.875rem',
  },
}));

const MotionButton = motion(StyledButton);

export const Button = React.forwardRef(({ 
  children, 
  variant = 'contained',
  animate = true,
  ...props 
}, ref) => {
  if (!animate) {
    return (
      <StyledButton
        ref={ref}
        variant={variant}
        {...props}
      >
        {children}
      </StyledButton>
    );
  }

  return (
    <MotionButton
      ref={ref}
      variant={variant}
      component={motion.button}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1],
      }}
      {...props}
    >
      {children}
    </MotionButton>
  );
}); 