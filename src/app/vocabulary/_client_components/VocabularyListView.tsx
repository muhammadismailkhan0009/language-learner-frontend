"use client";

import { useEffect, useState } from "react";
import { OutputHandle } from "@myriadcodelabs/uiflow";
import { Info as CircleInfo, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { playCardAudio } from "@/lib/ttsGoogle";
import { ScreenMode, VocabularyListItem } from "../types";
import { sanitizeNotesHtml } from "../notesHtml";

export type VocabularyListViewOutput =
    | { type: "reload" }
    | { type: "clearError" }
    | { type: "openCreate" }
    | { type: "setSelectedVocabulary"; vocabularyId: string }
    | { type: "openEdit"; vocabularyId: string };

type VocabularyListViewProps = {
    input: {
        mode: ScreenMode;
        vocabularies: VocabularyListItem[];
        selectedVocabularyId: string | null;
        error: string | null;
        isLoading: boolean;
    };
    output: OutputHandle<VocabularyListViewOutput>;
};

export default function VocabularyListView({ input, output }: VocabularyListViewProps) {
    const { mode, vocabularies, selectedVocabularyId, error, isLoading } = input;
    const [isNotesVisible, setIsNotesVisible] = useState(false);
    const selectedVocabulary = vocabularies.find((item) => item.id === selectedVocabularyId) ?? vocabularies[0] ?? null;
    const sanitizedNotesHtml = selectedVocabulary ? sanitizeNotesHtml(selectedVocabulary.notes) : "";

    useEffect(() => {
        setIsNotesVisible(false);
    }, [selectedVocabulary?.id, mode]);

    if (mode !== "list") {
        return null;
    }

    const playbackLanguage = "de";

    return (
        <div className="w-full min-h-screen py-6 px-4">
            <div className="max-w-6xl mx-auto space-y-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-2">
                        <CardTitle>Vocabulary</CardTitle>
                        <div className="flex items-center gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => output.emit({ type: "reload" })} disabled={isLoading}>
                                {isLoading ? "Refreshing..." : "Refresh"}
                            </Button>
                            <Button type="button" onClick={() => output.emit({ type: "openCreate" })}>
                                New Entry
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {error ? (
                            <div className="flex flex-wrap items-center gap-2 text-sm text-red-600">
                                <span>{error}</span>
                                <Button type="button" variant="outline" size="sm" onClick={() => output.emit({ type: "clearError" })}>
                                    Dismiss
                                </Button>
                            </div>
                        ) : null}

                        {!error && vocabularies.length === 0 ? (
                            <div className="text-sm text-muted-foreground">{isLoading ? "Loading vocabulary entries..." : "No vocabulary entries found."}</div>
                        ) : null}

                        {vocabularies.length > 0 ? (
                            <div className="grid gap-4 lg:grid-cols-[minmax(320px,420px)_1fr]">
                                <div className="rounded-md border overflow-hidden">
                                    <div className="max-h-[520px] overflow-auto">
                                        <Table>
                                            <TableHeader className="sticky top-0 bg-muted/50">
                                                <TableRow>
                                                    <TableHead>Word</TableHead>
                                                    <TableHead>Translation</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {vocabularies.map((item) => {
                                                    const isSelected = selectedVocabulary?.id === item.id;
                                                    return (
                                                        <TableRow
                                                            key={item.id}
                                                            className={`cursor-pointer ${isSelected ? "bg-accent/80" : ""}`}
                                                            onClick={() => output.emit({ type: "setSelectedVocabulary", vocabularyId: item.id })}
                                                        >
                                                            <TableCell className="font-medium">
                                                                <div className="flex items-center gap-2">
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-6 w-6"
                                                                        onClick={(event) => {
                                                                            event.stopPropagation();
                                                                            void playCardAudio(item.id, item.surface, playbackLanguage);
                                                                        }}
                                                                        title="Play word audio"
                                                                        aria-label={`Play audio for ${item.surface}`}
                                                                    >
                                                                        <Volume2 className="h-4 w-4" />
                                                                    </Button>
                                                                    <span className="truncate">{item.surface}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-muted-foreground">
                                                                <span className="truncate block">{item.translation}</span>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>

                                <div className="rounded-md border p-4 space-y-4">
                                    {selectedVocabulary ? (
                                        <>
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className="text-xl font-semibold">{selectedVocabulary.surface}</div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7"
                                                            onClick={() => void playCardAudio(selectedVocabulary.id, selectedVocabulary.surface, playbackLanguage)}
                                                            aria-label={`Play audio for ${selectedVocabulary.surface}`}
                                                            title="Play word audio"
                                                        >
                                                            <Volume2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7"
                                                            onClick={() => setIsNotesVisible((prev) => !prev)}
                                                            aria-label={isNotesVisible ? "Hide notes" : "Show notes"}
                                                            title={isNotesVisible ? "Hide notes" : "Show notes"}
                                                        >
                                                            <CircleInfo className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {selectedVocabulary.translation}
                                                    </div>
                                                </div>
                                                <Button type="button" variant="outline" onClick={() => output.emit({ type: "openEdit", vocabularyId: selectedVocabulary.id })}>
                                                    Edit Entry
                                                </Button>
                                            </div>

                                            <Separator />

                                            {isNotesVisible ? (
                                                <div className="space-y-2">
                                                    <div className="text-sm font-medium">Notes</div>
                                                    {sanitizedNotesHtml ? (
                                                        <div
                                                            className="prose prose-sm max-w-none text-muted-foreground"
                                                            dangerouslySetInnerHTML={{ __html: sanitizedNotesHtml }}
                                                        />
                                                    ) : (
                                                        <p className="text-sm text-muted-foreground leading-relaxed">No notes.</p>
                                                    )}
                                                </div>
                                            ) : null}

                                            <div className="space-y-2">
                                                <div className="text-sm font-medium">Example Sentences</div>
                                                {selectedVocabulary.exampleSentences.length === 0 ? (
                                                    <div className="text-sm text-muted-foreground">No example sentences.</div>
                                                ) : (
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Sentence</TableHead>
                                                                <TableHead>Translation</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {selectedVocabulary.exampleSentences.map((sentence, index) => (
                                                                <TableRow key={`${selectedVocabulary.id}-sentence-${index}`}>
                                                                    <TableCell className="align-top">
                                                                        <div className="flex items-start gap-2">
                                                                            <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-6 w-6 shrink-0 mt-0.5"
                                                                                onClick={() =>
                                                                                    void playCardAudio(
                                                                                        sentence.id ?? `${selectedVocabulary.id}-sentence-${index}`,
                                                                                        sentence.sentence,
                                                                                        playbackLanguage
                                                                                    )
                                                                                }
                                                                                title="Play sentence audio"
                                                                                aria-label={`Play audio for sentence ${index + 1}`}
                                                                            >
                                                                                <Volume2 className="h-4 w-4" />
                                                                            </Button>
                                                                            <span>{sentence.sentence}</span>
                                                                        </div>
                                                                    </TableCell>
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
