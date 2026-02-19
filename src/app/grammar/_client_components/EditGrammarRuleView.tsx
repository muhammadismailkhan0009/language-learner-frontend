"use client";

import { useEffect, useState } from "react";
import { OutputHandle } from "@myriadcodelabs/uiflow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GrammarRuleForm from "./GrammarRuleForm";
import { isDraftValid } from "../flows/grammarRuleDraftOps";
import { GrammarRuleDraft, ScreenMode } from "../types";

export type EditGrammarRuleViewOutput =
    | { type: "cancel" }
    | { type: "submit"; draft: GrammarRuleDraft }
    | { type: "clearError" };

type EditGrammarRuleViewProps = {
    input: {
        mode: ScreenMode;
        selectedGrammarRuleId: string | null;
        selectedGrammarRuleName: string | null;
        draft: GrammarRuleDraft;
        fetchError: string | null;
        saveError: string | null;
        isLoading: boolean;
        isSaving: boolean;
        canSubmit: boolean;
    };
    output: OutputHandle<EditGrammarRuleViewOutput>;
};

export default function EditGrammarRuleView({ input, output }: EditGrammarRuleViewProps) {
    const { mode, selectedGrammarRuleId, selectedGrammarRuleName, draft, fetchError, saveError, isLoading, isSaving } = input;
    const [localDraft, setLocalDraft] = useState<GrammarRuleDraft>(draft);
    const localCanSubmit = isDraftValid(localDraft);

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
                        <CardTitle>{selectedGrammarRuleName ? `Edit Rule: ${selectedGrammarRuleName}` : "Edit Grammar Rule"}</CardTitle>
                        <Button type="button" variant="outline" onClick={() => output.emit({ type: "cancel" })}>
                            Back
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {!selectedGrammarRuleId ? <div className="text-sm text-muted-foreground">Select a grammar rule to edit.</div> : null}
                        {fetchError ? <div className="text-sm text-red-600">{fetchError}</div> : null}
                        {selectedGrammarRuleId && isLoading ? <div className="text-sm text-muted-foreground">Loading grammar rule...</div> : null}

                        {selectedGrammarRuleId && !isLoading && !fetchError ? (
                            <>
                                <GrammarRuleForm draft={localDraft} onChange={setLocalDraft} disabled={isSaving} />

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
