import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility-Funktion zum Zusammenführen von Klassennamen
 * Kombiniert clsx und tailwind-merge für optimale Klassen-Handhabung
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
} 