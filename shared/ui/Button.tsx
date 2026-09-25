import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Spinner } from "./Spinner";

type ButtonVariant = "primary" | "secondary" | "restore" | "forbidden";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-white hover:bg-accent/90 focus-visible:outline-accent',
  secondary:
    'border border-line bg-surface text-ink hover:bg-(--accent-color) hover:text-white focus-visible:outline-ink',
  restore:
    'text-muted bg-(--succes-bg) hover:bg-(--succes-color) hover:text-white focus-visible:outline-ink',
  forbidden:
    'border border-accent/40 text-accent hover:bg-accent/10 focus-visible:outline-accent',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	isLoading?: boolean;
	children: ReactNode;
}

export function Button({
	variant = "primary",
	isLoading = false,
	disabled,
	className = "",
	children,
	type = "button",
	...rest
}: ButtonProps) {
	return (
		<button
  {...rest}
  type={type}
  disabled={disabled || isLoading}
  aria-busy={isLoading}
  className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${VARIANTS[variant]} ${className}`}
		>
			{isLoading ? <Spinner /> : null}
			{children}
		</button>
	);
}
