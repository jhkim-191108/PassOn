   // components/common/Button.tsx (임시)
   import type { ButtonHTMLAttributes } from 'react';
   export const Button = ({ variant: _v, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string }) => (
     <button {...props} />
   );
