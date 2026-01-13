"use client";

import { useEffect, useState, createContext, useContext, ReactNode } from "react";
import { issueRepository } from "@/features/issue";
import { activityRepository } from "@/features/activity";
// import { toast } from "sonner"; // Removed

import { IssueStatus, IssuePriority, IssueCategory } from "@/features/issue/model/types";
import { UNIT_DIRECTORY } from "@/features/unit/config";

// --- Types ---
interface DemoContextType {
    isDemoActive: boolean;
    toggleDemo: () => void;
    simulationSpeed: number; // ms
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const useDemo = () => {
    const context = useContext(DemoContext);
    if (!context) throw new Error("useDemo must be used within DemoProvider");
    return context;
};

// --- Provider ---
export function DemoProvider({ children }: { children: ReactNode }) {
    const [isDemoActive, setDemoActive] = useState(false);
    const [simulationSpeed, setSimulationSpeed] = useState(5000); // 5s loop

    // Initialize from URL or Storage
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("demo") === "1") {
            setDemoActive(true);
        }
    }, []);

    const toggleDemo = () => setDemoActive(prev => !prev);

    return (
        <DemoContext.Provider value={{ isDemoActive, toggleDemo, simulationSpeed }}>
            {children}
            {isDemoActive && <DemoEngine speed={simulationSpeed} />}
        </DemoContext.Provider>
    );
}

// --- Engine (The Brain) ---
function DemoEngine({ speed }: { speed: number }) {
    useEffect(() => {
        const interval = setInterval(async () => {
            const actionType = Math.random();

            // 40% Chance: Create New Issue
            if (actionType < 0.4) {
                await createRandomIssue();
            }
            // 30% Chance: Triage/Assign an existing unassigned issue
            else if (actionType < 0.7) {
                await processUnassignedIssue();
            }
            // 30% Chance: Resolve or Progress an issue
            else {
                await progressIssue();
            }

        }, speed);

        return () => clearInterval(interval);
    }, [speed]);

    return null; // Headless
}

// --- Scenario Logic ---

async function createRandomIssue() {
    const categories: IssueCategory[] = ['transportation', 'water_sewer', 'parks', 'waste'];
    const neighborhoods = ['Merkez', 'Yalı', 'Cumhuriyet', 'Sanayi', 'Liman'];
    const titles = [
        "Sokak lambası yanmıyor", "Çukur oluştu", "Su borusu patladı", "Park bankı kırık",
        "Çöp konteyneri dolu", "Kaldırım taşı yerinden oynamış", "Trafik levhası eğilmiş", "Rögar kapağı ses yapıyor"
    ];

    const randomCat = categories[Math.floor(Math.random() * categories.length)];
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];
    const randomDistrict = neighborhoods[Math.floor(Math.random() * neighborhoods.length)];

    // MUG_CENTER approx
    const lat = 37.215 + (Math.random() * 0.05 - 0.025);
    const lng = 28.363 + (Math.random() * 0.05 - 0.025);

    try {
        await issueRepository.createIssue(
            {
                title: `${randomTitle} (${Math.floor(Math.random() * 100)})`,
                description: "Otomatik oluşturulan demo kaydı.",
                location: {
                    district: "Menteşe",
                    neighborhood: randomDistrict,
                    addressText: "Demo Adresi Mah. No:1",
                    lat, lng
                },
                category: randomCat,
                priority: Math.random() > 0.7 ? 'high' : 'medium',
                reporter: { id: "demo-user", name: "Demo Vatandaş", contactPhone: "5550000000", type: "citizen" }


            }
        );
        console.log("DEMO: Created issue");
    } catch (e) {
        console.error("DEMO Error:", e);
    }
}

async function processUnassignedIssue() {
    const issues = await issueRepository.getIssues({ role: 'call_center' });

    const triagable = issues.filter(i => i.status === 'created' || (i.status === 'triaged' && !i.assignedTo));

    if (triagable.length === 0) return;

    const target = triagable[Math.floor(Math.random() * triagable.length)];

    // Assign to a random team from config
    const teams = UNIT_DIRECTORY.teams;
    const team = teams[Math.floor(Math.random() * teams.length)];

    await issueRepository.updateIssue(
        target.id,
        {
            status: 'in_progress',
            assignedTo: { type: 'team', id: team.id, name: team.name },
            priority: Math.random() > 0.5 ? 'high' : 'medium'
        },
        { name: "Demo Operatör", role: "call_center" }
    );
    console.log(`DEMO: Assigned ${target.id} to ${team.name}`);
}

async function progressIssue() {
    const issues = await issueRepository.getIssues({ role: 'call_center' });

    const inProgress = issues.filter(i => i.status === 'in_progress');

    if (inProgress.length === 0) return;

    const target = inProgress[Math.floor(Math.random() * inProgress.length)];

    // 50% chance to resolve
    if (Math.random() > 0.5) {
        await issueRepository.updateIssue(
            target.id,
            { status: 'resolved' },
            { name: "Demo Ekip", role: "unit" }
        );
        console.log(`DEMO: Resolved ${target.id}`);
    } else {
        // Just add a note
        await issueRepository.addNote(
            target.id,
            "Ekip olay yerine ulaştı, çalışma devam ediyor.",
            true,
            { name: "Saha Ekibi", role: "unit" }
        );
        console.log(`DEMO: Note added to ${target.id}`);
    }
}
