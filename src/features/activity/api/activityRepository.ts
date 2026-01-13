import { storage } from "@/shared/lib/storage";
import { ActivityEvent } from "../model/types";
import { Issue } from "@/features/issue/model/types";
import { v4 as uuidv4 } from 'uuid';

const ACTIVITY_KEY = "muda_activities";

export const activityRepository = {
    getAll: async (): Promise<ActivityEvent[]> => {
        return storage.get<ActivityEvent[]>(ACTIVITY_KEY, []);
    },

    add: (event: Omit<ActivityEvent, "id" | "timestamp">) => {
        const activities = storage.get<ActivityEvent[]>(ACTIVITY_KEY, []);
        const newEvent: ActivityEvent = {
            ...event,
            id: uuidv4(),
            timestamp: new Date().toISOString()
        };
        // Keep last 100 activities
        const updated = [newEvent, ...activities].slice(0, 100);
        storage.set(ACTIVITY_KEY, updated);
        return newEvent;
    },

    // Helper to generate activity from issue changes
    logIssueChange: (issue: Issue, type: any, details: string, actor: { name: string, role: string }, isPublic = false) => {
        activityRepository.add({
            type,
            issueId: issue.id,
            issueTitle: issue.title,
            actorName: actor.name,
            actorRole: actor.role,
            details,
            unitId: issue.assignedUnit?.id,
            neighborhoodId: issue.location.neighborhood,
            isPublic
        });
    }
};
