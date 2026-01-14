"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { X, WifiOff, AlertTriangle, Bug, Sparkles } from "lucide-react";
import { Button } from "@/shared/ui/button";

// Simple state manager for dev settings
interface DevSettings {
    latency: number; // ms
    errorRate: number; // 0-1
    slowNetwork: boolean;
    aiErrorRate: number; // 0-1 - simulates AI analysis failures
}

const DEFAULT_SETTINGS: DevSettings = {
    latency: 0,
    errorRate: 0,
    slowNetwork: false,
    aiErrorRate: 0
};

declare global {
    interface Window {
        MudaDevTools?: {
            settings: DevSettings;
            update: (s: Partial<DevSettings>) => void;
        }
    }
}

export function DevTools() {
    const searchParams = useSearchParams();
    const isDev = searchParams.get("dev") === "1";

    // Internal state mainly for UI, actual logic hooks into repository later via window global or direct import if we refactor repo to use context
    // For now, we attach to window so Repository can read it.
    const [settings, setSettings] = useState<DevSettings>(DEFAULT_SETTINGS);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        // Initialize global
        window.MudaDevTools = {
            settings,
            update: (s) => setSettings(prev => ({ ...prev, ...s }))
        };
    }, [settings]);

    if (!isDev) return null;

    if (!open) {
        return (
            <div className="fixed bottom-4 left-4 z-[9999]">
                <Button
                    variant="destructive"
                    size="sm"
                    className="rounded-full shadow-xl w-10 h-10 p-0"
                    onClick={() => setOpen(true)}
                    title="DevTools"
                >
                    <Bug className="w-5 h-5" />
                </Button>
            </div>
        )
    }

    return (
        <div className="fixed bottom-4 left-4 z-[9999] bg-zinc-900 text-zinc-100 p-4 rounded-xl shadow-2xl border border-zinc-800 w-[280px]">
            <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-2">
                <span className="font-bold flex items-center gap-2"><Bug className="w-4 h-4" /> DevTools</span>
                <button onClick={() => setOpen(false)}><X className="w-4 h-4 hover:text-white text-zinc-400" /></button>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs text-zinc-400 uppercase font-bold tracking-wider flex justify-between">
                        Latency: {settings.latency}ms
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="3000"
                        step="100"
                        className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                        value={settings.latency}
                        onChange={(e) => setSettings({ ...settings, latency: parseInt(e.target.value) })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs text-zinc-400 uppercase font-bold tracking-wider flex justify-between">
                        API Error Rate: {(settings.errorRate * 100).toFixed(0)}%
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                        value={settings.errorRate}
                        onChange={(e) => setSettings({ ...settings, errorRate: parseFloat(e.target.value) })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs text-zinc-400 uppercase font-bold tracking-wider flex justify-between items-center">
                        <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> AI Error Rate: {(settings.aiErrorRate * 100).toFixed(0)}%
                        </span>
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="0.3"
                        step="0.05"
                        className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                        value={settings.aiErrorRate}
                        onChange={(e) => setSettings({ ...settings, aiErrorRate: parseFloat(e.target.value) })}
                    />
                    <p className="text-[10px] text-zinc-500">Simulates AI analysis failures (max 30%)</p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
                    <input
                        type="checkbox"
                        id="slowNet"
                        checked={settings.slowNetwork}
                        onChange={(e) => setSettings({ ...settings, slowNetwork: e.target.checked })}
                        className="rounded bg-zinc-700 border-zinc-600"
                    />
                    <label htmlFor="slowNet" className="text-sm cursor-pointer select-none">Slow Network Mode</label>
                </div>

                {settings.slowNetwork && (
                    <div className="text-xs text-amber-500 flex gap-1 items-center bg-amber-950/30 p-2 rounded">
                        <WifiOff className="w-3 h-3" /> Simulating 3G...
                    </div>
                )}
                {settings.errorRate > 0 && (
                    <div className="text-xs text-red-400 flex gap-1 items-center bg-red-950/30 p-2 rounded">
                        <AlertTriangle className="w-3 h-3" /> API may fail randomly
                    </div>
                )}
                {settings.aiErrorRate > 0 && (
                    <div className="text-xs text-blue-400 flex gap-1 items-center bg-blue-950/30 p-2 rounded">
                        <Sparkles className="w-3 h-3" /> AI analysis may fail ({(settings.aiErrorRate * 100).toFixed(0)}%)
                    </div>
                )}
            </div>
        </div>
    );
}
