// Иконки Lucide (ISC, public/licenses/lucide.txt) для кнопок на миниатюрах.
import type { ComponentChildren } from 'preact';

const Svg = ({ children }: { children: ComponentChildren }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    {children}
  </svg>
);

export const RotateCw = () => (
  <Svg>
    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
  </Svg>
);

export const RotateCcw = () => (
  <Svg>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </Svg>
);

export const Trash = () => (
  <Svg>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </Svg>
);

export const Undo = () => (
  <Svg>
    <path d="M9 14 4 9l5-5" />
    <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
  </Svg>
);

export const ChevronLeft = () => (
  <Svg>
    <path d="m15 18-6-6 6-6" />
  </Svg>
);

export const ChevronRight = () => (
  <Svg>
    <path d="m9 18 6-6-6-6" />
  </Svg>
);

export const ChevronUp = () => (
  <Svg>
    <path d="m18 15-6-6-6 6" />
  </Svg>
);

export const ChevronDown = () => (
  <Svg>
    <path d="m6 9 6 6 6-6" />
  </Svg>
);

export const X = () => (
  <Svg>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </Svg>
);
