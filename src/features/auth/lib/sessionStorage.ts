import { storage } from "@/shared/lib/storage";
import { UserSession } from "../model/types";

const SESSION_KEY = "muda_session_v1";

export const sessionStorage = {
    get: (): UserSession | null => {
        return storage.get<UserSession | null>(SESSION_KEY, null);
    },
    set: (session: UserSession) => {
        storage.set(SESSION_KEY, session);
    },
    clear: () => {
        if (typeof window !== 'undefined') {
            window.localStorage.removeItem(SESSION_KEY);
        }
    }
};
