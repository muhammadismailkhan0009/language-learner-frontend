"use client";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ClozeAnswers, ClozeResults, ReadingParagraphClozeSession } from "@/flows/reading-paragraph-cloze/contracts";
import { ArrowLeft, CheckCheck, Trash2 } from "lucide-react";
import { ClozeParagraphInputs } from "./ClozeParagraphInputs";
import { useEffect } from "react";

type Props = { session: ReadingParagraphClozeSession; answers: ClozeAnswers; results: ClozeResults | null;
    canSubmit: boolean; busy: string | null; onAnswer(id: string, value: string): void;
    onSubmit(): void; onBack(): void; onDelete(): void };

export function ClozePracticeDetail(props: Props) {
    const { session, answers, results, canSubmit, busy, onAnswer, onSubmit, onBack, onDelete } = props;
    useEffect(() => {
        if (results && Object.values(results).some((correct) => !correct)) {
            document.querySelector<HTMLInputElement>('input[aria-invalid="true"]')?.focus();
        }
    }, [results]);
    return <Card onKeyDown={(event) => {
        if (event.key === "Enter" && canSubmit && busy === null) { event.preventDefault(); onSubmit(); }
    }}>
        <CardHeader>
            <CardTitle>Complete every missing form</CardTitle>
            <CardDescription>Level {session.learnerLevel} · Write all answers, then check them together.</CardDescription>
            <CardAction className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onBack} disabled={busy !== null}><ArrowLeft data-icon="inline-start" />Back to sessions</Button>
                <Button variant="destructive" size="sm" onClick={onDelete} disabled={busy !== null}><Trash2 data-icon="inline-start" />{busy === "delete" ? "Deleting…" : "Delete"}</Button>
            </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-8">
            {session.paragraphs.map((paragraph, index) => <div key={paragraph.paragraphId} className="flex flex-col gap-8">
                {index > 0 ? <Separator /> : null}<ClozeParagraphInputs paragraph={paragraph} answers={answers} results={results} onAnswer={onAnswer} />
            </div>)}
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-2 border-t sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">Capitalization and punctuation remain part of the answer.</p>
            <Button onClick={onSubmit} disabled={!canSubmit || busy !== null}><CheckCheck data-icon="inline-start" />Check all answers</Button>
        </CardFooter>
    </Card>;
}
