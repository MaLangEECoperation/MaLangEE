import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

/**
 * Button 컴포넌트의 스타일 변형을 정의합니다.
 *
 * @variant default - 기본 primary 스타일 버튼 (둥근 모서리)
 * @variant outline - 테두리만 있는 버튼
 * @variant ghost - 배경 없는 텍스트 버튼
 * @variant brand - 브랜드 색상의 완전히 둥근 버튼 (랜딩 페이지용)
 * @variant brand-outline - 브랜드 색상 테두리의 완전히 둥근 버튼 (랜딩 페이지용)
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-md",
        outline: "border border-border bg-background hover:bg-accent rounded-md",
        ghost: "hover:bg-accent hover:text-accent-foreground rounded-md",
        brand: "bg-brand text-brand-foreground hover:bg-brand/90 rounded-full",
        "brand-outline":
          "border-2 border-brand bg-background text-brand hover:bg-brand-muted rounded-full",
      },
      size: {
        default: "h-10 px-4 py-2 text-sm",
        sm: "h-9 px-3 text-sm",
        lg: "h-11 px-8 text-base",
        xl: "h-14 px-6 py-4 text-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
