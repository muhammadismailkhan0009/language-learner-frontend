"use client";

import { useEffect, useState } from "react";
import { OutputHandle } from "@myriadcodelabs/uiflow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isVocabularyDraftValid } from "../flows/vocabularyDraftOps";
import { ScreenMode, VocabularyDraft } from "../types";
import VocabularyForm from "./VocabularyForm";

export type EditVocabularyViewOutput =
    | { type: "cancel" }
    | { type: "submit"; draft: VocabularyDraft }
    | { type: "clearError" };

type EditVocabularyViewProps = {
    input: {
        mode: ScreenMode;
        selectedVocabularyId: string | null;
        selectedVocabularyLabel: string | null;
        draft: VocabularyDraft;
        fetchError: string | null;
        saveError: string | null;
        isLoading: boolean;
        isSaving: boolean;
        canSubmit: boolean;
    };
    output: OutputHandle<EditVocabularyViewOutput>;
};

export default function EditVocabularyView({ input, output }: EditVocabularyViewProps) {
    const { mode, selectedVocabularyId, selectedVocabularyLabel, draft, fetchError, saveError, isLoading, isSaving } = input;
    const [localDraft, setLocalDraft] = useState<VocabularyDraft>(draft);
    const localCanSubmit = isVocabularyDraftValid(localDraft);

    useEffect(() => {
        if (mode === "edit" && !isLoading) {
            setLocalDraft(draft);
        }
    }, [mode, isLoading, draft]);

    if (mode !== "edit") {
        return null;
    }

    return (
        <div className="w-full min-h-screen py-6 px-4">
            <div className="max-w-5xl mx-auto">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{selectedVocabularyLabel ? `Edit Entry: ${selectedVocabularyLabel}` : "Edit Vocabulary Entry"}</CardTitle>
                        <Button type="button" variant="outline" onClick={() => output.emit({ type: "cancel" })}>
                            Back
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {!selectedVocabularyId ? <div className="text-sm text-muted-foreground">Select a vocabulary entry to edit.</div> : null}
                        {fetchError ? <div className="text-sm text-red-600">{fetchError}</div> : null}
                        {selectedVocabularyId && isLoading ? <div className="text-sm text-muted-foreground">Loading vocabulary entry...</div> : null}

                        {selectedVocabularyId && !isLoading && !fetchError ? (
                            <>
                                <VocabularyForm draft={localDraft} onChange={setLocalDraft} disabled={isSaving} />

                                <div className="flex flex-wrap items-center gap-3">
                                    <Button
                                        type="button"
                                        onClick={() => output.emit({ type: "submit", draft: localDraft })}
                                        disabled={!localCanSubmit || isSaving}
                                    >
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
