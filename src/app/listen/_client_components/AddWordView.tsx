"use client";

import { OutputHandle } from "@myriadcodelabs/uiflow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type AddWordViewOutput =
    | { type: "setDraft"; value: string }
    | { type: "submit" }
    | { type: "clearError" };

type AddWordViewProps = {
    input: {
        draft: string;
        error: string | null;
        successMessage: string | null;
        isSaving: boolean;
    };
    output: OutputHandle<AddWordViewOutput>;
};

export default function AddWordView({ input, output }: AddWordViewProps) {
    const { draft, error, successMessage, isSaving } = input;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Add Word to Listen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <Label htmlFor="listen-word">Word</Label>
                <div className="flex gap-2">
                    <Input
                        id="listen-word"
                        value={draft}
                        onChange={(e) => output.emit({ type: "setDraft", value: e.target.value })}
                        placeholder="Enter a German word"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                output.emit({ type: "submit" });
                            }
                        }}
                    />
                    <Button onClick={() => output.emit({ type: "submit" })} disabled={isSaving || !draft.trim()}>
                        {isSaving ? "Adding..." : "Add"}
                    </Button>
                </div>

                <div className="min-h-8">
                    {error ? (
                        <div className="flex items-center gap-2 text-sm text-red-600">
                            <span>{error}</span>
                            <Button type="button" variant="outline" size="sm" onClick={() => output.emit({ type: "clearError" })}>
                                Dismiss
                            </Button>
                        </div>
                    ) : null}

                    {!error && successMessage ? (
                        <div className="text-sm text-green-700">{successMessage}</div>
                    ) : null}
                </div>
            </CardContent>
        </Card>
    );
}
