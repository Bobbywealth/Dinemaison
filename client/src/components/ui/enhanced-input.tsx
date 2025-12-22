import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, AlertCircle, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EnhancedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  showValidation?: boolean;
  isValid?: boolean;
  icon?: React.ReactNode;
  onIconClick?: () => void;
}

const EnhancedInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ 
    className, 
    type = "text", 
    label, 
    error, 
    success, 
    hint,
    showValidation = false,
    isValid = false,
    icon,
    onIconClick,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);

    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0);
      props.onChange?.(e);
    };

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
          {/* Icon on left */}
          {icon && !isPassword && (
            <div 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              onClick={onIconClick}
            >
              {icon}
            </div>
          )}

          <input
            type={inputType}
            className={cn(
              "flex w-full rounded-lg border border-input bg-background px-4 py-3 text-sm transition-all duration-200",
              "file:border-0 file:bg-transparent file:text-sm file:font-medium",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              icon && !isPassword && "pl-10",
              (isPassword || (showValidation && (isValid || error))) && "pr-10",
              error && "border-destructive focus-visible:ring-destructive",
              success && "border-green-500 focus-visible:ring-green-500",
              isFocused && !error && "border-primary ring-2 ring-primary/20",
              className
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={handleChange}
            ref={ref}
            {...props}
          />

          {/* Password toggle */}
          {isPassword && (
            <motion.button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowPassword(!showPassword)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </motion.button>
          )}

          {/* Validation icon */}
          {showValidation && !isPassword && hasValue && (
            <motion.div
              className="absolute right-3 top-1/2 -translate-y-1/2"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              {error ? (
                <X className="h-5 w-5 text-destructive" />
              ) : isValid ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : null}
            </motion.div>
          )}

          {/* Focus indicator line */}
          <motion.div
            className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary to-amber-600"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isFocused ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ transformOrigin: "left" }}
          />
        </div>

        {/* Messages */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              key="error"
              className="flex items-center gap-1 text-sm text-destructive mt-2"
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
              className="flex items-center gap-1 text-sm text-green-500 mt-2"
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
              className="text-xs text-muted-foreground mt-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {hint}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);
EnhancedInput.displayName = "EnhancedInput";

export { EnhancedInput };



