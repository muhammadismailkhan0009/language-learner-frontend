import { ReadingParagraphClozeSession } from "../contracts";

export interface ReadingParagraphClozeBackendPort {
    list(): Promise<ReadingParagraphClozeSession[]>;
    get(sessionId: string): Promise<ReadingParagraphClozeSession>;
    create(limit: number): Promise<ReadingParagraphClozeSession>;
    delete(sessionId: string): Promise<void>;
}
