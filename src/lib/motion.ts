import type { Transition, Variants } from "framer-motion";

/**
 * ClearSight motion language (DESIGN-SYSTEM.md §4).
 * Motion confirms cause -> effect. Enter expo-out, exit faster ease-in.
 * Wrap non-essential motion in useReducedMotion(); CSS already collapses
 * durations under prefers-reduced-motion.
 */

export const ease = {
  out: [0.16, 1, 0.3, 1] as const,
  in: [0.4, 0, 1, 1] as const,
  inout: [0.65, 0, 0.35, 1] as const,
};

export const spring: Transition = {
  type: "spring",
  stiffness: 320,
  damping: 30,
  mass: 0.9,
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.24, ease: ease.out } },
};

export const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.36, ease: ease.out } },
};

export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { delayChildren: 0.05, staggerChildren: 0.06 } },
};

export const routeTransition: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.24, ease: ease.out } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15, ease: ease.in } },
};

export const cardHover = {
  whileHover: {
    y: -3,
    boxShadow: "var(--shadow-md)",
    transition: { duration: 0.15, ease: ease.out },
  },
  whileTap: { y: 0, scale: 0.99 },
};

export const pressable = { whileTap: { scale: 0.97, transition: spring } };

/** Emergency banner only. Static under reduced motion (CSS handles that). */
export const pulseUrgent: Variants = {
  show: {
    opacity: [1, 0.6, 1],
    transition: { duration: 1.6, repeat: Infinity, ease: ease.inout },
  },
};
