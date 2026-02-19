"use client";

import { useEffect, useState } from "react";
import { OutputHandle } from "@myriadcodelabs/uiflow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GrammarRuleForm from "./GrammarRuleForm";
import { isDraftValid } from "../flows/grammarRuleDraftOps";
import { GrammarRuleDraft, ScreenMode } from "../types";

export type AddGrammarRuleViewOutput =
    | { type: "cancel" }
    | { type: "submit"; draft: GrammarRuleDraft }
    | { type: "clearError" };

type AddGrammarRuleViewProps = {
    input: {
        mode: ScreenMode;
        draft: GrammarRuleDraft;
        error: string | null;
        isSaving: boolean;
        canSubmit: boolean;
    };
    output: OutputHandle<AddGrammarRuleViewOutput>;
};

export default function AddGrammarRuleView({ input, output }: AddGrammarRuleViewProps) {
    const { mode, draft, error, isSaving } = input;
    const [localDraft, setLocalDraft] = useState<GrammarRuleDraft>(draft);
    const localCanSubmit = isDraftValid(localDraft);

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
                        <CardTitle>Create Grammar Rule</CardTitle>
                        <Button type="button" variant="outline" onClick={() => output.emit({ type: "cancel" })}>
                            Back
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <GrammarRuleForm draft={localDraft} onChange={setLocalDraft} disabled={isSaving} />

                        <div className="flex flex-wrap items-center gap-3">
                            <Button type="button" onClick={() => output.emit({ type: "submit", draft: localDraft })} disabled={!localCanSubmit || isSaving}>
                                {isSaving ? "Creating..." : "Create rule"}
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
