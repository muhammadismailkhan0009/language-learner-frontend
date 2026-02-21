"use client";

import { useEffect, useState } from "react";
import { OutputHandle } from "@myriadcodelabs/uiflow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isVocabularyDraftValid } from "../flows/vocabularyDraftOps";
import { ScreenMode, VocabularyDraft } from "../types";
import VocabularyForm from "./VocabularyForm";

export type AddVocabularyViewOutput =
    | { type: "cancel" }
    | { type: "submit"; draft: VocabularyDraft }
    | { type: "clearError" };

type AddVocabularyViewProps = {
    input: {
        mode: ScreenMode;
        draft: VocabularyDraft;
        error: string | null;
        isSaving: boolean;
        canSubmit: boolean;
    };
    output: OutputHandle<AddVocabularyViewOutput>;
};

export default function AddVocabularyView({ input, output }: AddVocabularyViewProps) {
    const { mode, draft, error, isSaving } = input;
    const [localDraft, setLocalDraft] = useState<VocabularyDraft>(draft);
    const localCanSubmit = isVocabularyDraftValid(localDraft);

    useEffect(() => {
        if (mode === "create") {
            setLocalDraft(draft);
        }
    }, [mode, draft]);

    if (mode !== "create") {
        return null;
    }

    return (
        <div className="w-full min-h-screen py-6 px-4">
            <div className="max-w-5xl mx-auto">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Create Vocabulary Entry</CardTitle>
                        <Button type="button" variant="outline" onClick={() => output.emit({ type: "cancel" })}>
                            Back
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <VocabularyForm draft={localDraft} onChange={setLocalDraft} disabled={isSaving} />

                        <div className="flex flex-wrap items-center gap-3">
                            <Button type="button" onClick={() => output.emit({ type: "submit", draft: localDraft })} disabled={!localCanSubmit || isSaving}>
                                {isSaving ? "Creating..." : "Create entry"}
                            </Button>
                            {error ? (
                                <>
                                    <span className="text-sm text-red-600">{error}</span>
                                    <Button type="button" variant="outline" size="sm" onClick={() => output.emit({ type: "clearError" })}>
                                        Dismiss
                                    </Button>
                                </>
                            ) : null}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
