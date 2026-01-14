"use client";

import L from "leaflet";
import { IssueCategory, IssuePriority, IssueStatus } from "@/features/issue/model/types";
import { getCategoryColor, getPriorityColor } from "../lib/mockMapData";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CUSTOM MARKER ICON FACTORY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Creates a custom Leaflet DivIcon for category-based markers
 */
export function createCategoryIcon(
    category: IssueCategory,
    priority: IssuePriority,
    status: IssueStatus
): L.DivIcon {
    const categoryColor = getCategoryColor(category);
    const priorityColor = getPriorityColor(priority);
    
    // Icon SVGs for each category
    const iconSvgs: Record<IssueCategory, string> = {
        transportation: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17h14m-7-7v7m-5-7h10l-2-5H9z"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/></svg>`,
        water_sewer: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v6m0 0c-1.66 0-3 1.57-3 3.5S10.34 15 12 15s3-1.57 3-3.5S13.66 8 12 8z"/><path d="M12 15v5m-4-3h8"/></svg>`,
        parks: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-7m0 0c-4.5 0-6-4-6-6 0-3 2.5-6 6-6s6 3 6 6c0 2-1.5 6-6 6z"/></svg>`,
        waste: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`
    };

    const iconSvg = iconSvgs[category];
    const isResolved = status === "resolved";
    const isHighPriority = priority === "high";
    
    // Generate HTML for the marker
    const html = `
        <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
        ">
            <!-- Outer ring (priority indicator) -->
            ${isHighPriority ? `
                <div style="
                    position: absolute;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    border: 2px solid ${priorityColor};
                    animation: pulse 2s infinite;
                    opacity: 0.6;
                "></div>
            ` : ''}
            
            <!-- Main marker body -->
            <div style="
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: ${isResolved ? '#94a3b8' : categoryColor};
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.25);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                transition: transform 0.2s ease;
                ${isResolved ? 'opacity: 0.7;' : ''}
            ">
                <div style="width: 16px; height: 16px;">
                    ${iconSvg}
                </div>
            </div>
            
            <!-- Pointer triangle -->
            <div style="
                position: absolute;
                bottom: -6px;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 6px solid transparent;
                border-right: 6px solid transparent;
                border-top: 8px solid ${isResolved ? '#94a3b8' : categoryColor};
            "></div>
        </div>
    `;

    return L.divIcon({
        html,
        className: 'custom-category-marker',
        iconSize: [40, 46],
        iconAnchor: [20, 46],
        popupAnchor: [0, -40]
    });
}

/**
 * Creates a cluster icon for grouped markers
 */
export function createClusterIcon(count: number, dominantCategory?: IssueCategory): L.DivIcon {
    const color = dominantCategory ? getCategoryColor(dominantCategory) : '#6366f1';
    
    const size = count < 10 ? 36 : count < 50 ? 44 : 52;
    const fontSize = count < 10 ? 12 : count < 50 ? 14 : 16;
    
    const html = `
        <div style="
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%);
            border: 3px solid white;
            box-shadow: 0 3px 12px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
            font-size: ${fontSize}px;
            font-family: system-ui, -apple-system, sans-serif;
        ">
            ${count}
        </div>
    `;

    return L.divIcon({
        html,
        className: 'custom-cluster-marker',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
    });
}

/**
 * CSS for marker animations (inject into document)
 */
export const markerStyles = `
    @keyframes pulse {
        0% {
            transform: scale(1);
            opacity: 0.6;
        }
        50% {
            transform: scale(1.2);
            opacity: 0.3;
        }
        100% {
            transform: scale(1);
            opacity: 0.6;
        }
    }
    
    .custom-category-marker {
        background: transparent !important;
        border: none !important;
    }
    
    .custom-category-marker:hover > div > div:nth-child(2) {
        transform: scale(1.1);
    }
    
    .custom-cluster-marker {
        background: transparent !important;
        border: none !important;
    }
    
    .custom-cluster-marker:hover > div {
        transform: scale(1.1);
        transition: transform 0.2s ease;
    }
`;

