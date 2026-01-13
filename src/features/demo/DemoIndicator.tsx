"use client";

import { useDemo } from "./DemoController";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Play, Pause } from "lucide-react";

export function DemoIndicator() {
    const { isDemoActive, toggleDemo } = useDemo();

    if (!isDemoActive) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[9999] animate-in slide-in-from-bottom">
            <div className="bg-stone-900/90 text-white backdrop-blur-md shadow-2xl rounded-full px-4 py-2 flex items-center gap-3 border border-stone-700">
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-xs font-bold tracking-wider uppercase">Demo Modu</span>
                <div className="h-4 w-px bg-white/20"></div>
                <button onClick={toggleDemo} className="hover:text-red-300 text-xs font-medium transition-colors">
                    Kapat
                </button>
            </div>
        </div>
    );
}

// Separate Toggle Button for Header/Admin
export function DemoToggle() {
    const { isDemoActive, toggleDemo } = useDemo();

    return (
        <Button
            variant={isDemoActive ? "destructive" : "outline"}
            size="sm"
            onClick={toggleDemo}
            className="text-xs gap-2"
        >
            {isDemoActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {isDemoActive ? "Demo Durdur" : "Demo Başlat"}
        </Button>
    )
}
