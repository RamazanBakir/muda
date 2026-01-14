export type IssueReportingMethod = "map" | "gps-photo" | "form";

export type IssueCategory = "water_sewer" | "transportation" | "parks" | "waste";
export type IssuePriority = "low" | "medium" | "high";
export type IssueStatus = "created" | "triaged" | "in_progress" | "resolved";

export interface IssueReporter {
    id: string;
    type: "citizen" | "mukhtar" | "unit" | "call_center";
    name: string;
    contactPhone?: string;
}

export interface IssueLocation {
    lat?: number;
    lng?: number;
    addressText?: string;
    district?: string;
    neighborhood?: string;
    street?: string;
}

export interface IssueTimelineItem {
    date: string;
    status: IssueStatus;
    note?: string;
    by: string; // Actor name
    isInternal?: boolean; // Visibility flag
}

export interface AssignedTo {
    type: "team" | "person";
    id: string;
    name: string;
}

export interface IssueMedia {
    photos: string[];
    videos?: string[];
}

export interface Issue {
    id: string;
    title: string;
    description: string;
    category: IssueCategory;
    status: IssueStatus;
    priority: IssuePriority;
    location: IssueLocation;
    reporter: IssueReporter;
    media: IssueMedia;
    createdAt: string;
    updatedAt: string;
    assignedUnit?: { id: string; name: string }; // Legacy field, keeping for compat or mapping to unit

    // Sprint 6 Extensions
    assignedTo?: AssignedTo | null;
    dueAt?: string; // ISO Dates
    tags?: string[];

    timeline: IssueTimelineItem[];
}

export interface IssueDraft {
    method: IssueReportingMethod;
    district?: string;
    neighborhood?: string;
    street?: string;
    description?: string;
    category?: IssueCategory; // Added potential category selection during creation
}
