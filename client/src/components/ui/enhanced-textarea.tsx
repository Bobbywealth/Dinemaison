import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EnhancedTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  showCharCount?: boolean;
  maxCharCount?: number;
}

const EnhancedTextarea = React.forwardRef<HTMLTextAreaElement, EnhancedTextareaProps>(
  ({ 
    className, 
    label, 
    error, 
    success, 
    hint,
    showCharCount = false,
    maxCharCount,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [charCount, setCharCount] = React.useState(0);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      props.onChange?.(e);
    };

    const isNearLimit = maxCharCount && charCount > maxCharCount * 0.8;
    const isOverLimit = maxCharCount && charCount > maxCharCount;

    return (
      <div className="w-full">
        {label && (
          <motion.label
            className={cn(
              "block text-sm font-medium mb-2 transition-colors duration-200",
              isFocused ? "text-primary" : "text-foreground",
              error && "text-destructive"
            )}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </motion.label>
        )}
        
        <div className="relative">
          <motion.textarea
            className={cn(
              "flex w-full rounded-lg border border-input bg-background px-4 py-3 text-sm transition-all duration-200",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "resize-none",
              error && "border-destructive focus-visible:ring-destructive",
              success && "border-green-500 focus-visible:ring-green-500",
              isFocused && !error && "border-primary ring-2 ring-primary/20",
              isOverLimit && "border-destructive",
              className
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={handleChange}
            ref={ref}
            {...props}
          />

          {/* Focus indicator line */}
          <motion.div
            className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary to-amber-600"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isFocused ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ transformOrigin: "left" }}
          />
        </div>

        <div className="flex items-center justify-between mt-2">
          {/* Messages */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.p
                key="error"
                className="flex items-center gap-1 text-sm text-destructive"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <AlertCircle className="h-3 w-3" />
                {error}
              </motion.p>
            )}
            {success && !error && (
              <motion.p
                key="success"
                className="flex items-center gap-1 text-sm text-green-500"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Check className="h-3 w-3" />
                {success}
              </motion.p>
            )}
            {hint && !error && !success && (
              <motion.p
                key="hint"
                className="text-xs text-muted-foreground"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {hint}
              </motion.p>
            )}
            {!error && !success && !hint && <div />}
          </AnimatePresence>

          {/* Character count */}
          {showCharCount && (
            <motion.p
              className={cn(
                "text-xs transition-colors",
                isOverLimit ? "text-destructive font-semibold" : 
                isNearLimit ? "text-amber-500" : 
                "text-muted-foreground"
              )}
              animate={isOverLimit ? {
                scale: [1, 1.1, 1],
              } : {}}
              transition={{ duration: 0.3 }}
            >
              {charCount}{maxCharCount && `/${maxCharCount}`}
            </motion.p>
          )}
        </div>
      </div>
    );
  }
);
EnhancedTextarea.displayName = "EnhancedTextarea";

export { EnhancedTextarea };

