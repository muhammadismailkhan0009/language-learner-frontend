"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import extractPracticeVocabularyAction from "../_server_actions/extractPracticeVocabularyAction";
import { ExtractPracticeVocabularyResponse } from "@/lib/types/responses/ExtractPracticeVocabularyResponse";

export default function PracticePageClient() {
    const [text, setText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<ExtractPracticeVocabularyResponse | null>(null);

    const onExtract = async () => {
        const trimmed = text.trim();
        if (!trimmed) {
            setError("Text is required.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const response = await extractPracticeVocabularyAction(trimmed);
            if (!response) {
                setError("Unable to extract practice vocabulary.");
                return;
            }
            setResult(response);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen py-6 px-4">
            <div className="mx-auto max-w-4xl space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Practice Vocabulary Extraction</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Paste any text. Extraction runs in background to avoid long waits/timeouts.
                        </p>
                        <Textarea
                            value={text}
                            onChange={(event) => setText(event.target.value)}
                            placeholder="Paste song lyrics or any text here..."
                            className="min-h-48"
                        />
                        <div className="flex items-center gap-3">
                            <Button type="button" onClick={onExtract} disabled={isLoading}>
                                {isLoading ? "Extracting..." : "Extract Practice Vocabulary"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setText("");
                                    setResult(null);
                                    setError(null);
                                }}
                                disabled={isLoading}
                            >
                                Reset
                            </Button>
                        </div>
                        {error ? <div className="text-sm text-red-600">{error}</div> : null}
                    </CardContent>
                </Card>

                {result ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Extraction Request</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="text-sm text-muted-foreground">{result.message}</div>
                        </CardContent>
                    </Card>
                ) : null}
            </div>
        </div>
    );
}
