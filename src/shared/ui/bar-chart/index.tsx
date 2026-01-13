"use client";

import { cn } from "@/shared/lib/cn";

interface BarChartData {
    label: string;
    value: number;
}

interface BarChartProps {
    data: BarChartData[];
    height?: number;
    maxValue?: number;
    showTooltip?: boolean;
    tooltipFormatter?: (value: number) => string;
    className?: string;
}

export function BarChart({
    data,
    height = 200,
    maxValue,
    showTooltip = true,
    tooltipFormatter = (v) => `${v}`,
    className
}: BarChartProps) {
    const max = maxValue || Math.max(...data.map(d => d.value)) * 1.2;

    return (
        <div className={cn("flex items-end justify-between gap-2", className)} style={{ height }}>
            {data.map((item, i) => {
                const heightPercent = (item.value / max) * 100;

                return (
                    <div key={i} className="w-full flex flex-col justify-end group h-full relative">
                        <div
                            className="w-full bg-secondary hover:bg-primary/20 rounded-lg transition-all duration-300 relative cursor-pointer"
                            style={{ height: `${heightPercent}%` }}
                        >
                            <div className="h-full w-full bg-primary opacity-30 group-hover:opacity-100 transition-opacity rounded-md" />
                            {showTooltip && (
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-fg text-surface text-xs font-medium py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-10 pointer-events-none">
                                    {tooltipFormatter(item.value)}
                                </div>
                            )}
                        </div>
                        <div className="text-xs font-medium text-center text-muted-fg mt-2">
                            {item.label}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

