"use client";

import { OutputHandle } from "@myriadcodelabs/uiflow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScenarioDraft, ScreenMode } from "../types";

export type EditScenarioViewOutput =
    | { type: "cancel" }
    | { type: "setNature"; value: string }
    | { type: "setTargetLanguage"; value: string }
    | { type: "setSentence"; index: number; field: "sentence" | "translation"; value: string }
    | { type: "addSentence" }
    | { type: "removeSentence"; index: number }
    | { type: "submit" }
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
    const { mode, selectedScenarioId, selectedScenarioNature, draft, fetchError, saveError, isLoading, isSaving, canSubmit } = input;

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
                                        <Input id="edit-scenario-nature" value={draft.nature} onChange={(e) => output.emit({ type: "setNature", value: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-scenario-language">Target Language</Label>
                                        <Input
                                            id="edit-scenario-language"
                                            value={draft.targetLanguage}
                                            onChange={(e) => output.emit({ type: "setTargetLanguage", value: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label>Sentences</Label>
                                        <Button type="button" variant="outline" size="sm" onClick={() => output.emit({ type: "addSentence" })}>
                                            Add sentence
                                        </Button>
                                    </div>
                                    {draft.sentences.map((item, index) => (
                                        <div key={`${item.id ?? "new"}-${index}`} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                                            <Input
                                                value={item.sentence}
                                                onChange={(e) => output.emit({ type: "setSentence", index, field: "sentence", value: e.target.value })}
                                                placeholder="Sentence"
                                            />
                                            <Input
                                                value={item.translation}
                                                onChange={(e) => output.emit({ type: "setSentence", index, field: "translation", value: e.target.value })}
                                                placeholder="Translation"
                                            />
                                            <Button type="button" variant="ghost" onClick={() => output.emit({ type: "removeSentence", index })}>
                                                Remove
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <Button type="button" onClick={() => output.emit({ type: "submit" })} disabled={!canSubmit || isSaving}>
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

