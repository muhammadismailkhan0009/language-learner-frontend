"use client";

import { useEffect, useState } from "react";
import { OutputHandle } from "@myriadcodelabs/uiflow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScenarioDraft, ScreenMode } from "../types";

export type EditScenarioViewOutput =
    | { type: "cancel" }
    | { type: "submit"; draft: ScenarioDraft }
    | { type: "clearError" };

type EditScenarioViewProps = {
    input: {
        mode: ScreenMode;
        selectedScenarioId: string | null;
        selectedScenarioNature: string | null;
        draft: ScenarioDraft;
        fetchError: string | null;
        saveError: string | null;
        isLoading: boolean;
        isSaving: boolean;
        canSubmit: boolean;
    };
    output: OutputHandle<EditScenarioViewOutput>;
};

export default function EditScenarioView({ input, output }: EditScenarioViewProps) {
    const { mode, selectedScenarioId, selectedScenarioNature, draft, fetchError, saveError, isLoading, isSaving } = input;
    const [localDraft, setLocalDraft] = useState<ScenarioDraft>(draft);

    useEffect(() => {
        if (mode === "edit" && !isLoading) {
            setLocalDraft(draft);
        }
    }, [mode, isLoading, draft]);

    const canSubmit =
        !!localDraft.nature.trim() &&
        localDraft.sentences.some((item) => item.sentence.trim() && item.translation.trim());

    if (mode !== "edit") {
        return null;
    }

    return (
        <div className="w-full min-h-screen py-6 px-4">
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{selectedScenarioNature ? `Edit Scenario: ${selectedScenarioNature}` : "Edit Scenario"}</CardTitle>
                        <Button type="button" variant="outline" onClick={() => output.emit({ type: "cancel" })}>
                            Back
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {!selectedScenarioId ? <div className="text-sm text-muted-foreground">Select a scenario to edit.</div> : null}
                        {fetchError ? <div className="text-sm text-red-600">{fetchError}</div> : null}
                        {selectedScenarioId && isLoading ? <div className="text-sm text-muted-foreground">Loading scenario...</div> : null}

                        {selectedScenarioId && !isLoading && !fetchError ? (
                            <>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-scenario-nature">Nature</Label>
                                        <Input
                                            id="edit-scenario-nature"
                                            value={localDraft.nature}
                                            onChange={(e) => setLocalDraft((prev) => ({ ...prev, nature: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-scenario-language">Target Language</Label>
                                        <Input id="edit-scenario-language" value="German" disabled />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label>Sentences</Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setLocalDraft((prev) => ({ ...prev, sentences: [...prev.sentences, { sentence: "", translation: "" }] }))}
                                        >
                                            Add sentence
                                        </Button>
                                    </div>
                                    {localDraft.sentences.map((item, index) => (
                                        <div key={`${item.id ?? "new"}-${index}`} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                                            <Input
                                                value={item.sentence}
                                                onChange={(e) =>
                                                    setLocalDraft((prev) => {
                                                        const next = [...prev.sentences];
                                                        next[index] = { ...next[index], sentence: e.target.value };
                                                        return { ...prev, sentences: next };
                                                    })
                                                }
                                                placeholder="Sentence"
                                            />
                                            <Input
                                                value={item.translation}
                                                onChange={(e) =>
                                                    setLocalDraft((prev) => {
                                                        const next = [...prev.sentences];
                                                        next[index] = { ...next[index], translation: e.target.value };
                                                        return { ...prev, sentences: next };
                                                    })
                                                }
                                                placeholder="Translation"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() =>
                                                    setLocalDraft((prev) => {
                                                        const filtered = prev.sentences.filter((_, sentenceIndex) => sentenceIndex !== index);
                                                        return {
                                                            ...prev,
                                                            sentences: filtered.length > 0 ? filtered : [{ sentence: "", translation: "" }],
                                                        };
                                                    })
                                                }
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <Button type="button" onClick={() => output.emit({ type: "submit", draft: localDraft })} disabled={!canSubmit || isSaving}>
                                        {isSaving ? "Saving..." : "Save changes"}
                                    </Button>
                                    {saveError ? (
                                        <>
                                            <span className="text-sm text-red-600">{saveError}</span>
                                            <Button type="button" variant="outline" size="sm" onClick={() => output.emit({ type: "clearError" })}>
                                                Dismiss
                                            </Button>
                                        </>
                                    ) : null}
                                </div>
                            </>
                        ) : null}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
