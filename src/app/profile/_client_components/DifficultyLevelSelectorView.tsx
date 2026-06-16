"use client";

import { OutputHandle } from "@myriadcodelabs/uiflow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LANGUAGE_LEVELS, LanguageLevel } from "@/lib/types/LanguageLevel";

export type DifficultyLevelSelectorViewOutput =
    | { type: "setLevel"; difficultyLevel: LanguageLevel }
    | { type: "save" }
    | { type: "reload" }
    | { type: "clearError" };

type DifficultyLevelSelectorViewProps = {
    input: {
        difficultyLevel: LanguageLevel;
        savedDifficultyLevel: LanguageLevel | null;
        isLoading: boolean;
        isSaving: boolean;
        error: string | null;
        message: string | null;
    };
    output: OutputHandle<DifficultyLevelSelectorViewOutput>;
};

export default function DifficultyLevelSelectorView({ input, output }: DifficultyLevelSelectorViewProps) {
    const hasChanges = input.savedDifficultyLevel !== null && input.savedDifficultyLevel !== input.difficultyLevel;

    return (
        <div className="w-full min-h-screen py-6 px-4">
            <div className="max-w-3xl mx-auto">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-3">
                        <CardTitle>Profile</CardTitle>
                        <Button type="button" variant="outline" size="sm" onClick={() => output.emit({ type: "reload" })} disabled={input.isLoading || input.isSaving}>
                            {input.isLoading ? "Refreshing..." : "Refresh"}
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="difficulty-level">Difficulty level</Label>
                            <select
                                id="difficulty-level"
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                value={input.difficultyLevel}
                                disabled={input.isLoading || input.isSaving}
                                onChange={(event) => output.emit({ type: "setLevel", difficultyLevel: event.target.value as LanguageLevel })}
                            >
                                {LANGUAGE_LEVELS.map((level) => (
                                    <option key={level} value={level}>
                                        {level}
                                    </option>
                                ))}
                            </select>
                            <p className="text-sm text-muted-foreground">
                                Changing difficulty affects newly generated reading, writing, and cloze exercises. It does not reset your progress.
                            </p>
                        </div>

                        {input.message ? <div className="text-sm text-blue-700">{input.message}</div> : null}

                        {input.error ? (
                            <div className="flex flex-wrap items-center gap-2 text-sm text-red-600">
                                <span>{input.error}</span>
                                <Button type="button" variant="outline" size="sm" onClick={() => output.emit({ type: "clearError" })}>
                                    Dismiss
                                </Button>
                            </div>
                        ) : null}

                        <Button type="button" onClick={() => output.emit({ type: "save" })} disabled={input.isLoading || input.isSaving || !hasChanges}>
                            {input.isSaving ? "Saving..." : "Save level"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
