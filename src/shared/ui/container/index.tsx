import { cn } from "@/shared/lib/cn";
import { BaseProps } from "@/shared/lib/types";

interface ContainerProps extends BaseProps {
    size?: "wide" | "narrow" | "full"
}

export function Container({ children, className, size = "wide" }: ContainerProps) {
    const sizes = {
        wide: "max-w-7xl",
        narrow: "max-w-3xl",
        full: "max-w-none"
    }

    return (
        <div className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", sizes[size], className)}>
            {children}
        </div>
    );
}
