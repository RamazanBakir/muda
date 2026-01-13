"use client";

import dynamic from "next/dynamic";
import React from "react";

const DevTools = dynamic(() => import("./index").then(m => m.DevTools), { ssr: false });

export function DevToolsWrapper() {
    return <DevTools />;
}
