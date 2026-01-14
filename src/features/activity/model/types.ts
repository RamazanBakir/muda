export type ActivityType = "issue_created" | "status_change" | "priority_change" | "assignment_change" | "note_added";

export interface ActivityEvent {
    id: string;
    type: ActivityType;
    issueId: string;
    issueTitle: string;
    actorName: string;
    actorRole: string; // "unit", "muhtar", "citizen"
    details: string; // e.g., "Status changed to In Progress"
    timestamp: string; // ISO

    // Scoping
    unitId?: string;       // Visibile to this unit
    neighborhoodId?: string; // Visible to this muhtar
    isPublic: boolean;     // Visible to citizen?
}
