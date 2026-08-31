"use client";

import { OutputHandle } from "@myriadcodelabs/uiflow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LANGUAGE_LEVELS, LanguageLevel } from "@/lib/types/LanguageLevel";

export type DifficultyLevelSelectorViewOutput =
    | { type: "setLevel"; levelKind: "general" | "reading" | "writing"; difficultyLevel: LanguageLevel }
    | { type: "save" }
    | { type: "reload" }
    | { type: "clearError" };

type DifficultyLevelSelectorViewProps = {
    input: {
        difficultyLevel: LanguageLevel;
        readingDifficultyLevel: LanguageLevel;
        writingDifficultyLevel: LanguageLevel;
        savedDifficultyLevel: LanguageLevel | null;
        savedReadingDifficultyLevel: LanguageLevel | null;
        savedWritingDifficultyLevel: LanguageLevel | null;
        isLoading: boolean;
        isSaving: boolean;
        error: string | null;
        message: string | null;
    };
    output: OutputHandle<DifficultyLevelSelectorViewOutput>;
};

export default function DifficultyLevelSelectorView({ input, output }: DifficultyLevelSelectorViewProps) {
    const hasChanges = input.savedDifficultyLevel !== null && (
        input.savedDifficultyLevel !== input.difficultyLevel
        || input.savedReadingDifficultyLevel !== input.readingDifficultyLevel
        || input.savedWritingDifficultyLevel !== input.writingDifficultyLevel
    );
    const disabled = input.isLoading || input.isSaving;

    const levelSelector = (id: string, label: string, levelKind: "general" | "reading" | "writing", value: LanguageLevel) => (
        <div className="flex flex-col gap-2">
            <Label htmlFor={id}>{label}</Label>
            <select
                id={id}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={value}
                disabled={disabled}
                onChange={(event) => output.emit({ type: "setLevel", levelKind, difficultyLevel: event.target.value as LanguageLevel })}
            >
                {LANGUAGE_LEVELS.map((level) => <option key={level} value={level}>{level}</option>)}
            </select>
        </div>
    );

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
                <CardTitle>Profile</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={() => output.emit({ type: "reload" })} disabled={input.isLoading || input.isSaving}>
                    {input.isLoading ? "Refreshing..." : "Refresh"}
                </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                {levelSelector("difficulty-level", "General difficulty level", "general", input.difficultyLevel)}
                <p className="text-sm text-muted-foreground">Used for cloze exercises and other level-based features.</p>
                {levelSelector("reading-difficulty-level", "Reading difficulty level", "reading", input.readingDifficultyLevel)}
                {levelSelector("writing-difficulty-level", "Writing difficulty level", "writing", input.writingDifficultyLevel)}
                <p className="text-sm text-muted-foreground">Reading and writing levels affect newly generated exercises. Changing levels does not reset progress.</p>

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
                    {input.isSaving ? "Saving..." : "Save levels"}
                </Button>
            </CardContent>
        </Card>
    );
}
