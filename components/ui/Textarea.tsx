import { TextareaHTMLAttributes, forwardRef } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-sm font-medium text-foreground">
            {label}
            {props.required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full rounded-xl border bg-card text-card-foreground px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-muted-foreground ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
              : 'border-border focus:border-primary focus:ring-primary/20'
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-muted-foreground">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
