"use client";

import { useEffect, useState } from "react";
import { OutputHandle } from "@myriadcodelabs/uiflow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GrammarDraftRequest, GeneratedGrammarRuleDraft, ScreenMode } from "../types";
import { isGrammarDraftRequestValid } from "../_flows/grammarRuleDraftOps";

export type AddGrammarRuleViewOutput =
    | { type: "cancel" }
    | { type: "setRequest"; request: GrammarDraftRequest }
    | { type: "submit"; request: GrammarDraftRequest }
    | { type: "clearError" };

type AddGrammarRuleViewProps = {
    input: {
        mode: ScreenMode;
        request: GrammarDraftRequest;
        generatedDrafts: GeneratedGrammarRuleDraft[];
        error: string | null;
        isGenerating: boolean;
        canSubmit: boolean;
    };
    output: OutputHandle<AddGrammarRuleViewOutput>;
};

export default function AddGrammarRuleView({ input, output }: AddGrammarRuleViewProps) {
    const { mode, request, generatedDrafts, error, isGenerating } = input;
    const [localRequest, setLocalRequest] = useState<GrammarDraftRequest>(request);
    const localCanSubmit = isGrammarDraftRequestValid(localRequest);

    useEffect(() => {
        if (mode === "create") {
            setLocalRequest(request);
        }
    }, [mode, request]);

    if (mode !== "create") {
        return null;
    }

    return (
        <div className="w-full min-h-screen py-6 px-4">
            <div className="max-w-5xl mx-auto">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Generate Grammar Drafts</CardTitle>
                        <Button type="button" variant="outline" onClick={() => output.emit({ type: "cancel" })}>
                            Back
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="grammar-draft-level">CEFR Level</Label>
                                <Input
                                    id="grammar-draft-level"
                                    value={localRequest.level}
                                    onChange={(e) => {
                                        const next = { ...localRequest, level: e.target.value };
                                        setLocalRequest(next);
                                        output.emit({ type: "setRequest", request: next });
                                    }}
                                    placeholder="A1"
                                    disabled={isGenerating}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="grammar-draft-admin-key">Admin Key</Label>
                                <Input
                                    id="grammar-draft-admin-key"
                                    value={localRequest.adminKey}
                                    onChange={(e) => {
                                        const next = { ...localRequest, adminKey: e.target.value };
                                        setLocalRequest(next);
                                        output.emit({ type: "setRequest", request: next });
                                    }}
                                    placeholder="Required"
                                    type="password"
                                    disabled={isGenerating}
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <Button
                                type="button"
                                onClick={() => output.emit({ type: "submit", request: localRequest })}
                                disabled={!localCanSubmit || isGenerating}
                            >
                                {isGenerating ? "Generating..." : "Generate drafts"}
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

                        <div className="space-y-3">
                            <div className="text-sm font-medium">Generated Drafts</div>
                            {generatedDrafts.length === 0 ? (
                                <div className="text-sm text-muted-foreground">No drafts generated yet.</div>
                            ) : (
                                <div className="space-y-2">
                                    {generatedDrafts.map((draft) => (
                                        <div key={draft.identifier} className="rounded-md border p-3">
                                            <div className="font-medium">{draft.name}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {draft.identifier} • {draft.level} • {draft.targetLanguage}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
