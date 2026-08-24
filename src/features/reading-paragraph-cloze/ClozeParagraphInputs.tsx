"use client";

import { Input } from "@/components/ui/input";
import { ClozeAnswers, ClozeParagraph, ClozeResults } from "@/flows/reading-paragraph-cloze/contracts";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";
import { ClozeAnswerDetails } from "./ClozeAnswerDetails";

type Props = { paragraph: ClozeParagraph; answers: ClozeAnswers; results: ClozeResults | null; onAnswer(id: string, value: string): void };

export function ClozeParagraphInputs({ paragraph, answers, results, onAnswer }: Props) {
    const blankByToken = new Map(paragraph.blanks.map((blank) => [blank.blankToken, blank]));
    const pattern = new RegExp(`(${paragraph.blanks.map((blank) => escapeRegExp(blank.blankToken)).join("|")})`, "g");
    const parts = paragraph.clozeParagraph.split(pattern);
    return <section aria-labelledby={`paragraph-${paragraph.paragraphId}`} className="flex flex-col gap-5">
        <div><p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Paragraph {paragraph.paragraphIndex + 1}</p>
            <h2 id={`paragraph-${paragraph.paragraphId}`} className="text-xl font-semibold">{paragraph.scenarioLabel}</h2></div>
        <p lang="de" className="text-lg leading-[3.25rem]">{parts.map((part, index) => {
            const blank = blankByToken.get(part); if (!blank) return <span key={`${part}-${index}`}>{part}</span>;
            const result = results?.[blank.blankId];
            return <span key={blank.blankId} className="mx-1 inline-flex align-middle">
                <label className="sr-only" htmlFor={`blank-${blank.blankId}`}>Answer {blank.blankIndex + 1} for {paragraph.scenarioLabel}</label>
                <Input id={`blank-${blank.blankId}`} value={answers[blank.blankId] ?? ""} aria-invalid={result === false}
                    aria-describedby={results ? `result-${blank.blankId}` : undefined}
                    className={cn("inline-block h-9 min-w-28 max-w-56 border-x-0 border-t-0 bg-transparent text-center shadow-none",
                        result === true && "border-primary", result === false && "border-destructive")}
                    onChange={(event) => onAnswer(blank.blankId, event.target.value)} />
            </span>;
        })}</p>
        {results ? <div className="flex flex-col gap-3">{paragraph.blanks.map((blank) => {
            const correct = results[blank.blankId]; return <div id={`result-${blank.blankId}`} key={blank.blankId}
                className={cn("flex flex-col gap-3 rounded-lg border p-4", correct ? "border-primary/40" : "border-destructive/50")}>
                <p className={cn("flex items-center gap-2 font-medium", correct ? "text-primary" : "text-destructive")}>
                    {correct ? <CheckCircle2 aria-hidden /> : <XCircle aria-hidden />}{correct ? "Correct" : "Try this one again"}</p>
                <ClozeAnswerDetails blank={blank} />
            </div>; })}</div> : null}
    </section>;
}
function escapeRegExp(value: string) { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
