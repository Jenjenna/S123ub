import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * cn — merge Tailwind classes safely.
 * Combines clsx (conditional classes) with tailwind-merge (conflict resolution).
 * Example: cn('px-2 py-1', condition && 'bg-red', 'px-4') → 'py-1 bg-red px-4'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
