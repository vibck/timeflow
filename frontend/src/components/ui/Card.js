import React from 'react';
import { Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

const StyledCard = styled(Paper)(({ theme }) => ({
  borderRadius: '16px',
  background: 'rgba(20, 20, 40, 0.8)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: '#fff',
  padding: '24px',
  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
  position: 'relative',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%)',
  },
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 40px rgba(0, 0, 0, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    
    '&::before': {
      background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)',
    },
  },
  
  transition: 'all 0.3s ease-in-out',
}));

const MotionCard = motion(StyledCard);

export const Card = React.forwardRef(({ 
  children,
  animate = true,
  hover = true,
  ...props 
}, ref) => {
  if (!animate) {
    return (
      <StyledCard
        ref={ref}
        elevation={0}
        {...props}
      >
        {children}
      </StyledCard>
    );
  }

  return (
    <MotionCard
      ref={ref}
      component={motion.div}
      elevation={0}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      }}
      whileHover={hover ? {
        y: -5,
        transition: { duration: 0.2 }
      } : undefined}
      {...props}
    >
      {children}
    </MotionCard>
  );
});

// Card.Header Komponente
export const CardHeader = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '20px',
  
  '& h2': {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 600,
    color: '#fff',
  },
});

// Card.Content Komponente
export const CardContent = styled('div')({
  '& p': {
    margin: '0 0 16px 0',
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 1.6,
  },
  
  '&:last-child': {
    marginBottom: 0,
  },
});

// Card.Footer Komponente
export const CardFooter = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  marginTop: '24px',
  gap: '12px',
}); 