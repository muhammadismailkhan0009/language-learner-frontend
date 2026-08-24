"use client";

import { Button } from "@/components/ui/button";
import { ClozeAnswers, ClozeResults, ReadingParagraphClozeSession } from "@/flows/reading-paragraph-cloze/contracts";
import { ClozePracticeDetail } from "./ClozePracticeDetail";
import { ClozeSessionList } from "./ClozeSessionList";

export type ReadingParagraphClozeViewProps = {
    sessions: ReadingParagraphClozeSession[]; selectedSession: ReadingParagraphClozeSession | null;
    answers: ClozeAnswers; results: ClozeResults | null; limit: number; busy: string | null;
    error: string | null; canSubmit: boolean; setLimit(value: number): void;
    setAnswer(id: string, value: string): void; load(): void; open(id: string): void;
    create(): void; remove(id: string): void; submit(): void; back(): void; clearError(): void;
};

export function ReadingParagraphClozeView(props: ReadingParagraphClozeViewProps) {
    return <main className="min-h-screen px-4 py-6"><div className="mx-auto flex max-w-6xl flex-col gap-4">
        {props.error ? <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-destructive/50 p-3 text-sm text-destructive">
            <span>{props.error}</span><Button size="sm" variant="outline" onClick={props.clearError}>Dismiss</Button></div> : null}
        {props.selectedSession ? <ClozePracticeDetail session={props.selectedSession} answers={props.answers} results={props.results}
            canSubmit={props.canSubmit} busy={props.busy} onAnswer={props.setAnswer} onSubmit={props.submit} onBack={props.back}
            onDelete={() => props.remove(props.selectedSession!.sessionId)} />
            : <ClozeSessionList sessions={props.sessions} limit={props.limit} busy={props.busy} onLimit={props.setLimit}
                onRefresh={props.load} onCreate={props.create} onOpen={props.open} onDelete={props.remove} />}
    </div></main>;
}
