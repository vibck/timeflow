import React, { useState, createContext, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * @typedef {Object} LinkItem
 * @property {string} label - Beschriftung des Links
 * @property {string} href - Ziel des Links
 * @property {React.ReactNode} icon - Icon für den Link
 */

// Sidebar Context für das State-Management
const SidebarContext = createContext();

/**
 * Hook zum Zugriff auf den Sidebar-Kontext
 */
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar muss innerhalb eines SidebarProviders verwendet werden');
  }
  return context;
};

/**
 * SidebarProvider - Verwaltet den Zustand der Sidebar
 */
export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

/**
 * Sidebar - Hauptkomponente für die animierte Seitenleiste
 */
export const Sidebar = ({
  children,
  open,
  setOpen,
  animate
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

/**
 * SidebarBody - Container für Desktop- und Mobile-Sidebar
 */
export const SidebarBody = props => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...props} />
    </>
  );
};

/**
 * DesktopSidebar - Sidebar für Desktop-Ansicht mit Hover-Animation
 */
export const DesktopSidebar = ({
  className,
  children,
  ...props
}) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
      className={cn(
        'h-full px-4 py-4 hidden md:flex md:flex-col bg-neutral-100/80 dark-bg-neutral-800/70 backdrop-blur-sm w-[320px] flex-shrink-0 border-r-0 shadow-sm',
        className
      )}
      animate={{
        width: animate ? (open ? '320px' : '70px') : '320px'
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * MobileSidebar - Sidebar für Mobile-Ansicht mit Slide-Animation
 */
export const MobileSidebar = ({
  className,
  children,
  ...props
}) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          'h-10 px-4 py-4 flex flex-row md:hidden items-center justify-between bg-neutral-100/90 dark-bg-neutral-800/90 backdrop-blur-sm w-full shadow-sm'
        )}
        {...props}
      >
        <div className="flex justify-end z-20 w-full">
          <Menu
            className="text-neutral-800 dark-text-neutral-200 cursor-pointer"
            onClick={() => setOpen(!open)}
          />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: 'easeInOut'
              }}
              className={cn(
                'fixed h-full w-full inset-0 bg-white/90 dark-bg-neutral-900/90 backdrop-blur-md p-10 z-[100] flex flex-col justify-between',
                className
              )}
            >
              <div
                className="absolute right-10 top-10 z-50 text-neutral-800 dark-text-neutral-200 cursor-pointer hover:bg-neutral-200/50 dark-hover-bg-neutral-700/50 p-2 rounded-full transition-all duration-200"
                onClick={() => setOpen(!open)}
              >
                <X />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

/**
 * SidebarLink - Animierter Link für die Sidebar
 */
export const SidebarLink = ({
  link,
  className,
  ...props
}) => {
  const { open, animate } = useSidebar();
  
  // Klon des Icons mit zusätzlichen Klassen
  const iconElement = React.cloneElement(link.icon, {
    className: cn(
      link.icon.props.className,
      'transition-all duration-200'
    )
  });
  
  return (
    <Link
      to={link.href}
      className={cn(
        'flex items-center justify-start gap-3 group/sidebar py-3 px-3 rounded-md hover:bg-primary/10 dark-hover-bg-primary/20 transition-all duration-200 border-0',
        className
      )}
      {...props}
    >
      {iconElement}
      <motion.span
        animate={{
          display: animate ? (open ? 'inline-block' : 'none') : 'inline-block',
          opacity: animate ? (open ? 1 : 0) : 1
        }}
        className="text-neutral-700 dark-text-neutral-200 text-base group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
      >
        {link.label}
      </motion.span>
    </Link>
  );
}; 