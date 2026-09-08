import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary";
}

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...rest
}: ButtonProps) {
  const base = "rounded-full px-sm py-xs font-medium text-body transition-colors";

  const variants = {
    primary: "bg-accent-action text-white hover:opacity-90",
    secondary: "bg-transparent border border-divider text-text-primary hover:bg-background",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}