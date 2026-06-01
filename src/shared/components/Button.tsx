import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={clsx(
        'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed',
        {
          'bg-brand-600 text-white hover:bg-brand-700 active:scale-95 shadow-sm':
            variant === 'primary',
          'bg-white text-brand-700 border border-brand-200 hover:bg-brand-50 active:scale-95':
            variant === 'secondary',
          'text-brand-600 hover:bg-brand-50 active:scale-95':
            variant === 'ghost',
          'bg-red-600 text-white hover:bg-red-700 active:scale-95':
            variant === 'danger',
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-5 py-2.5 text-base': size === 'md',
          'px-8 py-3.5 text-lg':  size === 'lg',
        },
        className,
      )}
    >
      {children}
    </button>
  );
}
