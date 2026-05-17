"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { OutputHandle } from "@myriadcodelabs/uiflow";
import { StudySessionResponse } from "@/lib/types/responses/StudySessionResponse";

export type StudyViewOutput =
    | { type: "createSession" }
    | { type: "updateAnswer"; answer: string }
    | { type: "submitAnswer" }
    | { type: "clearError" };

type Props = {
    input: {
        session: StudySessionResponse | null;
        answer: string;
        isCreating: boolean;
        isSubmitting: boolean;
        error: string | null;
        lastReviewedCloze: string | null;
        lastReviewedExpected: string | null;
    };
    output: OutputHandle<StudyViewOutput>;
};

export default function StudyView({ input, output }: Props) {
    const canCreate = !input.isCreating && !input.isSubmitting;
    const canSubmit = Boolean(input.session?.currentItem && input.answer.trim()) && !input.isSubmitting;
    const currentItem = input.session?.currentItem ?? null;

    const showPendingFilledSentence = input.isSubmitting && currentItem;
    const showFeedbackBlock = Boolean(input.session?.feedback);

    return (
        <div className="w-full min-h-screen py-6 px-4">
            <div className="mx-auto max-w-4xl space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Study</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Button type="button" onClick={() => output.emit({ type: "createSession" })} disabled={!canCreate}>
                                {input.isCreating ? "Creating..." : "Get Next Card"}
                            </Button>
                        </div>

                        {input.error ? (
                            <div className="flex items-center gap-2 text-sm text-red-600">
                                <span>{input.error}</span>
                                <Button type="button" size="sm" variant="outline" onClick={() => output.emit({ type: "clearError" })}>
                                    Dismiss
                                </Button>
                            </div>
                        ) : null}
                    </CardContent>
                </Card>

                                {!input.session ? (
                    <Card>
                        <CardContent className="py-6 text-sm text-muted-foreground">Click "Get Next Card" to start study.</CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Fill In The Blank</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-sm text-muted-foreground">
                                Status: {input.session.status} | Rated: {input.session.ratedCount}/{input.session.totalCount}
                            </div>

                            {input.session.currentItem ? (
                                <>
                                    <div className="text-lg leading-8">
                                        {showPendingFilledSentence ? (
                                            <FilledClozeSentence
                                                clozeSentence={input.session.currentItem.clozeSentence}
                                                expectedAnswer={input.session.currentItem.expectedAnswer}
                                            />
                                        ) : (
                                            <span>{input.session.currentItem.clozeSentence}</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">Hint: {input.session.currentItem.hint}</p>
                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <Input
                                            value={input.answer}
                                            onChange={(event) => output.emit({ type: "updateAnswer", answer: event.target.value })}
                                            placeholder="Type your answer"
                                            disabled={input.isSubmitting}
                                        />
                                        <Button type="button" onClick={() => output.emit({ type: "submitAnswer" })} disabled={!canSubmit}>
                                            {input.isSubmitting ? "Checking..." : "Submit"}
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-sm text-muted-foreground">Session completed. Create a new session to continue.</div>
                            )}

                            {showFeedbackBlock ? (
                                <div className="grid gap-3 rounded border p-3 text-sm md:grid-cols-2">
                                    <div>
                                        <div className="font-medium mb-1">Correct Sentence</div>
                                        {input.lastReviewedCloze && input.lastReviewedExpected ? (
                                            <div className="leading-7">
                                                <FilledClozeSentence
                                                    clozeSentence={input.lastReviewedCloze}
                                                    expectedAnswer={input.lastReviewedExpected}
                                                />
                                            </div>
                                        ) : (
                                            <div className="text-muted-foreground">No sentence snapshot available.</div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-medium mb-1">Feedback</div>
                                        <div>{input.session?.feedback}</div>
                                        {input.session?.appliedRating ? (
                                            <div className="mt-2 text-muted-foreground">Applied rating: {input.session.appliedRating}</div>
                                        ) : null}
                                    </div>
                                </div>
                            ) : null}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

function FilledClozeSentence({ clozeSentence, expectedAnswer }: { clozeSentence: string; expectedAnswer: string }) {
    const answerWords = expectedAnswer.trim().split(/\s+/).filter(Boolean);
    let answerIndex = 0;
    const parts = clozeSentence.split(/(____)/g);

    return (
        <>
            {parts.map((part, index) => {
                if (part !== "____") {
                    return <span key={`text-${index}`}>{part}</span>;
                }
                const replacement = answerWords[answerIndex] ?? answerWords[answerWords.length - 1] ?? expectedAnswer;
                answerIndex += 1;
                return (
                    <u key={`blank-${index}`} className="underline-offset-4">
                        {replacement}
                    </u>
                );
            })}
        </>
    );
}
