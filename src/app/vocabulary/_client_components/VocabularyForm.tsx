"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VocabularyEntryKind } from "@/lib/types/requests/AddVocabularyRequest";
import { VocabularyDraft } from "../types";
import NotesRichTextEditor from "./NotesRichTextEditor";

type VocabularyFormProps = {
    draft: VocabularyDraft;
    onChange: (nextDraft: VocabularyDraft) => void;
    disabled?: boolean;
};

export default function VocabularyForm({ draft, onChange, disabled = false }: VocabularyFormProps) {
    const setEntryKind = (entryKind: VocabularyEntryKind) => onChange({ ...draft, entryKind });

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="vocabulary-surface">Surface</Label>
                    <Input
                        id="vocabulary-surface"
                        value={draft.surface}
                        onChange={(e) => onChange({ ...draft, surface: e.target.value })}
                        placeholder="gehen"
                        disabled={disabled}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="vocabulary-translation">Translation</Label>
                    <Input
                        id="vocabulary-translation"
                        value={draft.translation}
                        onChange={(e) => onChange({ ...draft, translation: e.target.value })}
                        placeholder="to go"
                        disabled={disabled}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Entry Kind</Label>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant={draft.entryKind === "WORD" ? "default" : "outline"}
                        onClick={() => setEntryKind("WORD")}
                        disabled={disabled}
                    >
                        Word
                    </Button>
                    <Button
                        type="button"
                        variant={draft.entryKind === "CHUNK" ? "default" : "outline"}
                        onClick={() => setEntryKind("CHUNK")}
                        disabled={disabled}
                    >
                        Chunk
                    </Button>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="vocabulary-notes">Notes</Label>
                <NotesRichTextEditor
                    value={draft.notes}
                    onChange={(notes) => onChange({ ...draft, notes })}
                    placeholder="Usage notes, gender, mnemonic..."
                    disabled={disabled}
                />
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label>Example Sentences</Label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            onChange({
                                ...draft,
                                exampleSentences: [...draft.exampleSentences, { sentence: "", translation: "" }],
                            })
                        }
                        disabled={disabled}
                    >
                        Add sentence
                    </Button>
                </div>

                {draft.exampleSentences.map((item, index) => (
                    <div key={`vocabulary-sentence-${index}`} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                        <Input
                            value={item.sentence}
                            onChange={(e) => {
                                const nextSentences = [...draft.exampleSentences];
                                nextSentences[index] = { ...nextSentences[index], sentence: e.target.value };
                                onChange({ ...draft, exampleSentences: nextSentences });
                            }}
                            placeholder="Sentence"
                            disabled={disabled}
                        />
                        <Input
                            value={item.translation}
                            onChange={(e) => {
                                const nextSentences = [...draft.exampleSentences];
                                nextSentences[index] = { ...nextSentences[index], translation: e.target.value };
                                onChange({ ...draft, exampleSentences: nextSentences });
                            }}
                            placeholder="Translation"
                            disabled={disabled}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                const filtered = draft.exampleSentences.filter((_, sentenceIndex) => sentenceIndex !== index);
                                onChange({
                                    ...draft,
                                    exampleSentences: filtered.length > 0 ? filtered : [{ sentence: "", translation: "" }],
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
