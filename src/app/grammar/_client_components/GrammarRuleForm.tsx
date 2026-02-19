"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GrammarRuleDraft } from "../types";

type GrammarRuleFormProps = {
    draft: GrammarRuleDraft;
    onChange: (nextDraft: GrammarRuleDraft) => void;
    disabled?: boolean;
};

export default function GrammarRuleForm({ draft, onChange, disabled = false }: GrammarRuleFormProps) {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="grammar-rule-name">Rule Name</Label>
                    <Input
                        id="grammar-rule-name"
                        value={draft.name}
                        onChange={(e) => onChange({ ...draft, name: e.target.value })}
                        placeholder="Example: Perfekt with haben"
                        disabled={disabled}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="grammar-rule-admin-key">Admin Key</Label>
                    <Input
                        id="grammar-rule-admin-key"
                        value={draft.adminKey}
                        onChange={(e) => onChange({ ...draft, adminKey: e.target.value })}
                        placeholder="Required for create/edit"
                        type="password"
                        disabled={disabled}
                    />
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label>Explanation Paragraphs</Label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onChange({ ...draft, explanationParagraphs: [...draft.explanationParagraphs, ""] })}
                        disabled={disabled}
                    >
                        Add paragraph
                    </Button>
                </div>
                {draft.explanationParagraphs.map((paragraph, index) => (
                    <div key={`grammar-paragraph-${index}`} className="space-y-2">
                        <Textarea
                            value={paragraph}
                            onChange={(e) => {
                                const nextParagraphs = [...draft.explanationParagraphs];
                                nextParagraphs[index] = e.target.value;
                                onChange({ ...draft, explanationParagraphs: nextParagraphs });
                            }}
                            placeholder={`Explanation paragraph ${index + 1}`}
                            disabled={disabled}
                            rows={3}
                        />
                        <div className="flex justify-end">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    const filtered = draft.explanationParagraphs.filter((_, paragraphIndex) => paragraphIndex !== index);
                                    onChange({
                                        ...draft,
                                        explanationParagraphs: filtered.length > 0 ? filtered : [""],
                                    });
                                }}
                                disabled={disabled}
                            >
                                Remove paragraph
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="grammar-scenario-title">Scenario Title</Label>
                    <Input
                        id="grammar-scenario-title"
                        value={draft.scenario.title}
                        onChange={(e) =>
                            onChange({
                                ...draft,
                                scenario: { ...draft.scenario, title: e.target.value },
                            })
                        }
                        placeholder="Scenario heading"
                        disabled={disabled}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="grammar-scenario-target-language">Target Language</Label>
                    <Input
                        id="grammar-scenario-target-language"
                        value={draft.scenario.targetLanguage}
                        onChange={(e) =>
                            onChange({
                                ...draft,
                                scenario: { ...draft.scenario, targetLanguage: e.target.value },
                            })
                        }
                        placeholder="de"
                        disabled={disabled}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="grammar-scenario-description">Scenario Description</Label>
                <Textarea
                    id="grammar-scenario-description"
                    value={draft.scenario.description}
                    onChange={(e) =>
                        onChange({
                            ...draft,
                            scenario: { ...draft.scenario, description: e.target.value },
                        })
                    }
                    rows={3}
                    placeholder="What this scenario helps the learner practice"
                    disabled={disabled}
                />
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label>Scenario Sentences</Label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            onChange({
                                ...draft,
                                scenario: {
                                    ...draft.scenario,
                                    sentences: [...draft.scenario.sentences, { sentence: "", translation: "" }],
                                },
                            })
                        }
                        disabled={disabled}
                    >
                        Add sentence
                    </Button>
                </div>

                {draft.scenario.sentences.map((item, index) => (
                    <div key={`grammar-sentence-${index}`} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                        <Input
                            value={item.sentence}
                            onChange={(e) => {
                                const nextSentences = [...draft.scenario.sentences];
                                nextSentences[index] = { ...nextSentences[index], sentence: e.target.value };
                                onChange({
                                    ...draft,
                                    scenario: { ...draft.scenario, sentences: nextSentences },
                                });
                            }}
                            placeholder="Sentence"
                            disabled={disabled}
                        />
                        <Input
                            value={item.translation}
                            onChange={(e) => {
                                const nextSentences = [...draft.scenario.sentences];
                                nextSentences[index] = { ...nextSentences[index], translation: e.target.value };
                                onChange({
                                    ...draft,
                                    scenario: { ...draft.scenario, sentences: nextSentences },
                                });
                            }}
                            placeholder="Translation"
                            disabled={disabled}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                const filtered = draft.scenario.sentences.filter((_, sentenceIndex) => sentenceIndex !== index);
                                onChange({
                                    ...draft,
                                    scenario: {
                                        ...draft.scenario,
                                        sentences: filtered.length > 0 ? filtered : [{ sentence: "", translation: "" }],
                                    },
                                });
                            }}
                            disabled={disabled}
                        >
                            Remove
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}
