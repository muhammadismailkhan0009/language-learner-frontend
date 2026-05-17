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
    };
    output: OutputHandle<StudyViewOutput>;
};

export default function StudyView({ input, output }: Props) {
    const canCreate = !input.isCreating && !input.isSubmitting;
    const canSubmit = Boolean(input.session?.currentItem && input.answer.trim()) && !input.isSubmitting;

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
                                    <p className="text-lg leading-8">{input.session.currentItem.clozeSentence}</p>
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

                            {input.session.feedback ? (
                                <div className="rounded border p-3 text-sm">
                                    <div className="font-medium">Feedback</div>
                                    <div>{input.session.feedback}</div>
                                    {input.session.appliedRating ? (
                                        <div className="mt-2 text-muted-foreground">Applied rating: {input.session.appliedRating}</div>
                                    ) : null}
                                </div>
                            ) : null}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
