"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { WordPracticeQueueResponse, WordPracticeResponse } from "@/lib/types/responses/WordPracticeQueueResponse";
import { CheckCircle2, CircleAlert, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { FormEvent } from "react";
import { OutputHandle } from "@myriadcodelabs/uiflow";

export type WordPracticeFeedback = {
    correct: boolean;
    submittedAnswer: string;
};

export type WordPracticeViewInput = {
    queue: WordPracticeQueueResponse | null;
    practice: WordPracticeResponse | null;
    answer: string;
    feedback: WordPracticeFeedback | null;
    isLoading: boolean;
    isGenerating: boolean;
    isSubmitting: boolean;
    error: string | null;
    info: string | null;
};

export type WordPracticeViewOutput =
    | { type: "updateAnswer"; answer: string }
    | { type: "submitAnswer" }
    | { type: "next" }
    | { type: "generate" }
    | { type: "reload" }
    | { type: "clearMessage" };

export function canGenerateWordPractices(queue: WordPracticeQueueResponse | null): boolean {
    return !!queue && queue.activeVocabularyCount + queue.generationVocabularyCount <= queue.maximumVocabularyCount;
}

export default function WordPracticeView({ input, output }: {
    input: WordPracticeViewInput;
    output: OutputHandle<WordPracticeViewOutput>;
}) {
    const { queue, practice, answer, feedback, isLoading, isGenerating, isSubmitting, error, info } = input;
    const generationAllowed = canGenerateWordPractices(queue);
    const generationReason = queue && !generationAllowed
        ? `Generation needs room for ${queue.generationVocabularyCount} words. Resolve practices until ${queue.activeVocabularyCount} active words drops to ${queue.maximumVocabularyCount - queue.generationVocabularyCount} or fewer.`
        : null;

    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (answer.trim() && !feedback && !isSubmitting) output.emit({ type: "submitAnswer" });
    };

    return (
        <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm font-medium text-primary">Focused vocabulary practice</p>
                    <h1 className="mt-1 text-3xl font-semibold tracking-tight">Word Practice</h1>
                    <p className="mt-2 text-sm text-muted-foreground">Answer each sentence in context. Correct answers leave the queue.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => output.emit({ type: "reload" })} disabled={isLoading}>
                    <RefreshCw className={isLoading ? "animate-spin" : ""} /> Refresh
                </Button>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Practice queue</CardTitle>
                    <CardDescription>
                        {queue ? `${queue.activeVocabularyCount} of ${queue.maximumVocabularyCount} vocabulary words active · ${queue.practices.length} exercises` : "Loading queue…"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Button onClick={() => output.emit({ type: "generate" })} disabled={!generationAllowed || isGenerating || isLoading}>
                        {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />}
                        {isGenerating ? "Requesting…" : "Generate 10 words"}
                    </Button>
                    {generationReason && <p className="text-sm text-muted-foreground">{generationReason}</p>}
                    {info && <button className="block text-left text-sm text-emerald-700 dark:text-emerald-400" onClick={() => output.emit({ type: "clearMessage" })}>{info}</button>}
                    {error && <button className="block text-left text-sm text-destructive" onClick={() => output.emit({ type: "clearMessage" })}>{error}</button>}
                </CardContent>
            </Card>

            {isLoading && !queue ? (
                <Card><CardContent className="flex items-center gap-2 text-muted-foreground"><Loader2 className="animate-spin" /> Loading practices…</CardContent></Card>
            ) : practice ? (
                <Card>
                    <CardHeader>
                        <CardDescription>{practice.direction === "GERMAN_TO_ENGLISH" ? "German → English" : "English → German"}</CardDescription>
                        <CardTitle className="text-xl leading-relaxed">{practice.clozeSentence}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="rounded-lg bg-muted/60 p-4">
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Context</p>
                            <p className="mt-1 leading-relaxed">{practice.sourceSentence}</p>
                        </div>
                        <form className="space-y-3" onSubmit={submit}>
                            <label htmlFor="word-practice-answer" className="text-sm font-medium">Your answer</label>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Input id="word-practice-answer" autoComplete="off" autoFocus value={answer}
                                    disabled={!!feedback || isSubmitting}
                                    onChange={(event) => output.emit({ type: "updateAnswer", answer: event.target.value })}
                                    placeholder="Type the missing word or phrase" />
                                <Button type="submit" disabled={!answer.trim() || !!feedback || isSubmitting}>
                                    {isSubmitting && <Loader2 className="animate-spin" />} Check
                                </Button>
                            </div>
                        </form>
                        {feedback && (
                            <div className={`rounded-lg border p-4 ${feedback.correct ? "border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100" : "border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100"}`}>
                                <div className="flex items-center gap-2 font-medium">
                                    {feedback.correct ? <CheckCircle2 /> : <CircleAlert />}
                                    {feedback.correct ? "Correct" : "Not quite — this stays in your queue"}
                                </div>
                                {!feedback.correct && <p className="mt-3 text-sm">Your answer: <span className="font-medium">{feedback.submittedAnswer}</span></p>}
                                <p className="mt-1 text-sm">Expected: <span className="font-medium">{practice.exactAnswer}</span></p>
                                <p className="mt-2 text-sm">{practice.completeSentence}</p>
                            </div>
                        )}
                    </CardContent>
                    {feedback && <CardFooter><Button onClick={() => output.emit({ type: "next" })}>Continue</Button></CardFooter>}
                </Card>
            ) : (
                <Card>
                    <CardHeader><CardTitle>Queue complete</CardTitle><CardDescription>No active word practices. Generate a batch when capacity allows.</CardDescription></CardHeader>
                </Card>
            )}
        </main>
    );
}
