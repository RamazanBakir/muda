import { ReactNode } from "react";

export interface BaseProps {
    className?: string;
    children?: ReactNode;
}

export interface PropsWithChildren extends BaseProps {
    children: ReactNode;
}
