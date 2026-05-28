"use client";

import { OutputHandle } from "@myriadcodelabs/uiflow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GeneratedGrammarRuleDraft, GrammarRuleListItem, ScreenMode } from "../types";

export type GrammarRulesListViewOutput =
    | { type: "reload" }
    | { type: "clearError" }
    | { type: "openCreate" }
    | { type: "setSelectedRule"; grammarRuleId: string }
    | { type: "openEdit"; grammarRuleId: string }
    | { type: "toggleDrafts" }
    | { type: "setDraftAdminKey"; adminKey: string }
    | { type: "reloadDrafts" }
    | { type: "generateDraftDetails"; draftId: string };

type GrammarRulesListViewProps = {
    input: {
        mode: ScreenMode;
        rules: GrammarRuleListItem[];
        drafts: GeneratedGrammarRuleDraft[];
        selectedGrammarRuleId: string | null;
        error: string | null;
        isLoading: boolean;
        isLoadingDrafts: boolean;
        isGeneratingDetails: boolean;
        showDrafts: boolean;
        draftAdminKey: string;
    };
    output: OutputHandle<GrammarRulesListViewOutput>;
};

export default function GrammarRulesListView({ input, output }: GrammarRulesListViewProps) {
    const { mode, rules, drafts, selectedGrammarRuleId, error, isLoading, isLoadingDrafts, isGeneratingDetails, showDrafts, draftAdminKey } = input;

    if (mode !== "list") {
        return null;
    }

    const selectedRule = rules.find((rule) => rule.id === selectedGrammarRuleId) ?? rules[0] ?? null;
    const visibleExplanationParagraphs = selectedRule
        ? selectedRule.explanationParagraphs
            .map((paragraph) => paragraph.trim())
            .filter((paragraph) => paragraph.length > 0)
        : [];

    return (
        <div className="w-full min-h-screen py-6 px-4">
            <div className="max-w-6xl mx-auto space-y-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-2">
                        <CardTitle>Grammar Rules</CardTitle>
                        <div className="flex items-center gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => output.emit({ type: "reload" })} disabled={isLoading}>
                                {isLoading ? "Refreshing..." : "Refresh"}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => output.emit({ type: "toggleDrafts" })}>
                                {showDrafts ? "Hide Drafts" : "Show Drafts"}
                            </Button>
                            <Button type="button" onClick={() => output.emit({ type: "openCreate" })}>
                                New Rule
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {showDrafts ? (
                            <div className="rounded-md border p-3 space-y-3">
                                <div className="text-sm font-medium">Draft Queue</div>
                                <div className="flex gap-2">
                                    <Input
                                        value={draftAdminKey}
                                        type="password"
                                        placeholder="Admin key"
                                        onChange={(e) => output.emit({ type: "setDraftAdminKey", adminKey: e.target.value })}
                                    />
                                    <Button type="button" variant="outline" onClick={() => output.emit({ type: "reloadDrafts" })} disabled={isLoadingDrafts}>
                                        {isLoadingDrafts ? "Loading..." : "Load Drafts"}
                                    </Button>
                                </div>
                                {drafts.length === 0 ? (
                                    <div className="text-sm text-muted-foreground">No drafts found.</div>
                                ) : (
                                    <div className="space-y-2">
                                        {drafts.map((draft) => (
                                            <div key={draft.id} className="flex items-center justify-between gap-2 rounded border p-2">
                                                <div>
                                                    <div className="font-medium text-sm">{draft.name}</div>
                                                    <div className="text-xs text-muted-foreground">{draft.identifier} • {draft.level}</div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={isGeneratingDetails}
                                                    onClick={() => output.emit({ type: "generateDraftDetails", draftId: draft.id })}
                                                >
                                                    {isGeneratingDetails ? "Generating..." : "Generate Details"}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : null}

                        {error ? (
                            <div className="flex flex-wrap items-center gap-2 text-sm text-red-600">
                                <span>{error}</span>
                                <Button type="button" variant="outline" size="sm" onClick={() => output.emit({ type: "clearError" })}>
                                    Dismiss
                                </Button>
                            </div>
                        ) : null}

                        {!error && rules.length === 0 ? (
                            <div className="text-sm text-muted-foreground">{isLoading ? "Loading grammar rules..." : "No grammar rules found."}</div>
                        ) : null}

                        {rules.length > 0 ? (
                            <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
                                <div className="rounded-md border overflow-hidden">
                                    <div className="max-h-[520px] overflow-auto">
                                        {rules.map((rule) => {
                                            const isSelected = selectedRule?.id === rule.id;
                                            return (
                                                <button
                                                    key={rule.id}
                                                    type="button"
                                                    className={`w-full text-left p-3 border-b transition-colors ${
                                                        isSelected ? "bg-accent" : "hover:bg-muted/60"
                                                    }`}
                                                    onClick={() => output.emit({ type: "setSelectedRule", grammarRuleId: rule.id })}
                                                >
                                                    <div className="font-medium truncate">{rule.name}</div>
                                                    <div className="text-xs text-muted-foreground truncate">{rule.scenarioTitle || "Untitled scenario"}</div>
                                                    <div className="text-xs text-muted-foreground mt-1">{rule.sentenceCount} sentence(s)</div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="rounded-md border p-4 space-y-4">
                                    {selectedRule ? (
                                        <>
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div className="space-y-1">
                                                    <div className="text-xl font-semibold">{selectedRule.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {selectedRule.scenarioTitle} • {selectedRule.targetLanguage.toUpperCase()} • {selectedRule.isFixed ? "Fixed" : "Editable"}
                                                    </div>
                                                </div>
                                                <Button type="button" variant="outline" onClick={() => output.emit({ type: "openEdit", grammarRuleId: selectedRule.id })}>
                                                    Edit Rule
                                                </Button>
                                            </div>

                                            <Separator />

                                            <div className="space-y-2">
                                                <div className="text-sm font-medium">Explanation</div>
                                                {visibleExplanationParagraphs.length === 0 ? (
                                                    <div className="text-sm text-muted-foreground">No explanation paragraphs available.</div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {visibleExplanationParagraphs.map((paragraph, index) => (
                                                            <p
                                                                key={`${selectedRule.id}-explanation-${index}`}
                                                                className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line"
                                                            >
                                                                {paragraph}
                                                            </p>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <div className="text-sm font-medium">Scenario Description</div>
                                                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                                                    {selectedRule.scenarioDescription || "No scenario description."}
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="text-sm font-medium">Practice Sentences</div>
                                                {selectedRule.sentences.length === 0 ? (
                                                    <div className="text-sm text-muted-foreground">No sentences attached to this rule.</div>
                                                ) : (
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Sentence</TableHead>
                                                                <TableHead>Translation</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {selectedRule.sentences.map((sentence, index) => (
                                                                <TableRow key={`${selectedRule.id}-sentence-${index}`}>
                                                                    <TableCell className="align-top">{sentence.sentence}</TableCell>
                                                                    <TableCell className="align-top text-muted-foreground">{sentence.translation}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                )}
                                            </div>
                                        </>
                                    ) : null}
                                </div>
                            </div>
                        ) : null}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
