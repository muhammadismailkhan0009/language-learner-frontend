"use client";

import { OutputHandle } from "@myriadcodelabs/uiflow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export type PracticeVocabularyExtractionViewOutput =
    | { type: "setText"; text: string }
    | { type: "request" }
    | { type: "reset" };

type Props = {
    input: {
        text: string;
        isRequesting: boolean;
        error: string | null;
        message: string | null;
    };
    output: OutputHandle<PracticeVocabularyExtractionViewOutput>;
};

export default function PracticeVocabularyExtractionView({ input, output }: Props) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Practice Vocabulary Extraction</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Paste text, request extraction, then run the vocabulary extraction tool through your MCP client.
                    </p>
                    <Textarea
                        value={input.text}
                        onChange={(event) => output.emit({ type: "setText", text: event.target.value })}
                        placeholder="Paste song lyrics or any text here..."
                        className="min-h-48"
                        disabled={input.isRequesting}
                    />
                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            onClick={() => output.emit({ type: "request" })}
                            disabled={input.isRequesting}
                        >
                            {input.isRequesting ? "Requesting..." : "Request Vocabulary Extraction"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => output.emit({ type: "reset" })}
                            disabled={input.isRequesting}
                        >
                            Reset
                        </Button>
                    </div>
                    {input.error ? <div role="alert" className="text-sm text-red-600">{input.error}</div> : null}
                </CardContent>
            </Card>

            {input.message ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Extraction Request</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div role="status" aria-live="polite" className="text-sm text-muted-foreground">
                            {input.message}
                        </div>
                    </CardContent>
                </Card>
            ) : null}
        </div>
    );
}
