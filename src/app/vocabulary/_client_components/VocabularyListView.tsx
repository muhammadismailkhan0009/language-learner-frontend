"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { OutputHandle } from "@myriadcodelabs/uiflow";
import { Info as CircleInfo, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { playCardAudio, playTextAudio } from "@/lib/ttsGoogle";
import { PublicVocabularyListItem, ScreenMode, VocabularyListItem } from "../types";
import { sanitizeNotesHtml } from "../notesHtml";
import { filterVocabularyRows } from "./vocabularySearch";

export type VocabularyListViewOutput =
    | { type: "reload" }
    | { type: "clearError" }
    | { type: "clearClozeStatus" }
    | { type: "openCreate" }
    | { type: "generateClozeSentences" }
    | { type: "clearPublishStatus" }
    | { type: "setSelectedVocabulary"; vocabularyId: string }
    | { type: "openEdit"; vocabularyId: string }
    | { type: "addPublicToPrivate"; publicVocabularyId: string }
    | { type: "publishVocabulary"; vocabularyId: string; adminKey: string };

type VocabularyListViewProps = {
    input: {
        mode: ScreenMode;
        vocabularies: VocabularyListItem[];
        publicVocabularies: PublicVocabularyListItem[];
        selectedVocabularyId: string | null;
        error: string | null;
        isLoading: boolean;
        isPublishing: boolean;
        isGeneratingCloze: boolean;
        isAddingPublicToPrivate: boolean;
        clozeStatus: string | null;
        publishError: string | null;
        publishSuccess: string | null;
    };
    output: OutputHandle<VocabularyListViewOutput>;
};

async function sleep(ms: number, signal?: AbortSignal) {
    if (signal?.aborted) {
        return;
    }

    await new Promise<void>((resolve) => {
        const timeoutId = window.setTimeout(() => resolve(), ms);
        if (signal) {
            signal.addEventListener(
                "abort",
                () => {
                    window.clearTimeout(timeoutId);
                    resolve();
                },
                { once: true }
            );
        }
    });
}

function getSpokenTranslation(text: string) {
    return text.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
}

export default function VocabularyListView({ input, output }: VocabularyListViewProps) {
    const {
        mode,
        vocabularies,
        publicVocabularies,
        error,
        isLoading,
        isPublishing,
        isGeneratingCloze,
        isAddingPublicToPrivate,
        clozeStatus,
        publishError,
        publishSuccess,
    } = input;
    const [showPrivate, setShowPrivate] = useState(true);
    const [showPublic, setShowPublic] = useState(false);
    const [hasInitializedSelection, setHasInitializedSelection] = useState(false);
    const [isNotesVisible, setIsNotesVisible] = useState(false);
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [publishAdminKey, setPublishAdminKey] = useState("");
    const [selectedRowKey, setSelectedRowKey] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isListening, setIsListening] = useState(false);
    const listenControllerRef = useRef<AbortController | null>(null);

    const currentRows = useMemo(() => {
        const rows: Array<{
            key: string;
            source: "private" | "public";
            id: string;
            sourceVocabularyId?: string;
            surface: string;
            translation: string;
            notes: string;
            exampleSentences: { id?: string; sentence: string; translation: string }[];
            clozeSentence?: VocabularyListItem["clozeSentence"];
        }> = [];

        if (showPrivate) {
            rows.push(
                ...vocabularies.map((item) => ({
                    key: `private:${item.id}`,
                    source: "private" as const,
                    id: item.id,
                    surface: item.surface,
                    translation: item.translation,
                    notes: item.notes,
                    exampleSentences: item.exampleSentences,
                    clozeSentence: item.clozeSentence,
                }))
            );
        }

        if (showPublic) {
            rows.push(
                ...publicVocabularies.map((item) => ({
                    key: `public:${item.publicVocabularyId}`,
                    source: "public" as const,
                    id: item.publicVocabularyId,
                    sourceVocabularyId: item.sourceVocabularyId,
                    surface: item.surface,
                    translation: item.translation,
                    notes: item.notes,
                    exampleSentences: item.exampleSentences,
                }))
            );
        }

        return rows;
    }, [showPrivate, showPublic, vocabularies, publicVocabularies]);

    const visibleRows = useMemo(() => {
        return filterVocabularyRows(currentRows, searchQuery);
    }, [currentRows, searchQuery]);

    const selectedRow = visibleRows.find((row) => row.key === selectedRowKey) ?? visibleRows[0] ?? null;
    const selectedPrivateVocabulary = selectedRow?.source === "private" ? selectedRow : null;
    const selectedVocabulary = selectedRow;

    useEffect(() => {
        setIsNotesVisible(false);
        setIsPublishModalOpen(false);
        setPublishAdminKey("");
    }, [selectedRowKey, mode]);

    useEffect(() => {
        if (hasInitializedSelection) {
            return;
        }

        if (vocabularies.length > 0) {
            setShowPrivate(true);
            setShowPublic(false);
            setHasInitializedSelection(true);
            return;
        }

        if (publicVocabularies.length > 0) {
            setShowPrivate(false);
            setShowPublic(true);
            setHasInitializedSelection(true);
        }
    }, [hasInitializedSelection, vocabularies.length, publicVocabularies.length]);

    useEffect(() => {
        if (visibleRows.length === 0) {
            setSelectedRowKey(null);
            return;
        }

        const hasCurrent = !!selectedRowKey && visibleRows.some((row) => row.key === selectedRowKey);
        if (!hasCurrent) {
            setSelectedRowKey(visibleRows[0].key);
        }
    }, [visibleRows, selectedRowKey]);

    useEffect(() => {
        return () => {
            listenControllerRef.current?.abort();
        };
    }, []);

    if (mode !== "list") {
        return null;
    }

    const playbackLanguage = "de";
    const translationLanguage = "en";
    const emptyLabel = showPrivate && !showPublic
        ? "No vocabulary entries found."
        : showPublic && !showPrivate
            ? "No public vocabulary entries found."
            : "No vocabulary entries found for selected sources.";
    const noResultsLabel = searchQuery.trim() ? "No matches found." : emptyLabel;

    const handleListenAll = () => {
        if (isListening) {
            listenControllerRef.current?.abort();
            listenControllerRef.current = null;
            setIsListening(false);
            return;
        }

        if (visibleRows.length === 0) {
            return;
        }

        const controller = new AbortController();
        listenControllerRef.current?.abort();
        listenControllerRef.current = controller;
        setIsListening(true);

        const runPlayback = async () => {
            try {
                for (const row of visibleRows) {
                    if (controller.signal.aborted) {
                        return;
                    }

                    const surface = row.surface.trim();
                    const translation = getSpokenTranslation(row.translation);

                    if (surface) {
                        await playTextAudio(surface, playbackLanguage, 1, controller.signal);
                    }
                    await sleep(3000, controller.signal);

                    if (controller.signal.aborted) {
                        return;
                    }

                    if (translation) {
                        await playTextAudio(translation, translationLanguage, 1, controller.signal);
                    }
                    await sleep(2000, controller.signal);
                }
            } finally {
                if (listenControllerRef.current === controller) {
                    listenControllerRef.current = null;
                }
                setIsListening(false);
            }
        };

        void runPlayback();
    };

    const renderDetailsContent = (row: {
        key: string;
        source: "private" | "public";
        id: string;
        sourceVocabularyId?: string;
        surface: string;
        translation: string;
        notes: string;
        exampleSentences: { id?: string; sentence: string; translation: string }[];
        clozeSentence?: VocabularyListItem["clozeSentence"];
    }, compact: boolean) => {
        const isPrivateRow = row.source === "private";
        const isPublicRow = row.source === "public";
        const rowNotesHtml = sanitizeNotesHtml(row.notes);
        const isAlreadyPublished = isPrivateRow && publicVocabularies.some((item) => item.sourceVocabularyId === row.id);
        const isAlreadyPrivate = isPublicRow && row.sourceVocabularyId
            ? vocabularies.some((item) => item.id === row.sourceVocabularyId)
            : false;

        return (
            <div className={compact ? "space-y-3 rounded-md border bg-muted/30 p-3" : "space-y-4"}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className={compact ? "text-base font-semibold" : "text-xl font-semibold"}>{row.surface}</div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => void playCardAudio(row.id, row.surface, playbackLanguage)}
                                aria-label={`Play audio for ${row.surface}`}
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
                        <div className="text-sm text-muted-foreground">{row.translation}</div>
                    </div>

                {isPrivateRow ? (
                        <div className="flex w-full sm:w-auto flex-wrap items-center gap-2">
                            {!isAlreadyPublished ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size={compact ? "sm" : "default"}
                                    onClick={() => {
                                        output.emit({ type: "clearPublishStatus" });
                                        setIsPublishModalOpen(true);
                                    }}
                                >
                                    Publish
                                </Button>
                            ) : null}
                            <Button
                                type="button"
                                variant="outline"
                                size={compact ? "sm" : "default"}
                                onClick={() => output.emit({ type: "openEdit", vocabularyId: row.id })}
                            >
                                Edit Entry
                            </Button>
                        </div>
                    ) : null}
                {isPublicRow ? (
                        <div className="flex w-full sm:w-auto flex-wrap items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size={compact ? "sm" : "default"}
                                onClick={() => output.emit({ type: "addPublicToPrivate", publicVocabularyId: row.id })}
                                disabled={isAddingPublicToPrivate || isAlreadyPrivate}
                            >
                                {isAlreadyPrivate ? "In Private Vocabulary" : isAddingPublicToPrivate ? "Adding..." : "Add to Private"}
                            </Button>
                        </div>
                    ) : null}
                </div>

                {isPrivateRow && (publishError || publishSuccess) ? (
                    <div className="space-y-1">
                        {publishError ? <div className="text-sm text-red-600">{publishError}</div> : null}
                        {publishSuccess ? <div className="text-sm text-green-600">{publishSuccess}</div> : null}
                    </div>
                ) : null}

                {!compact ? <Separator /> : null}

                {isNotesVisible ? (
                    <div className="space-y-2">
                        <div className="text-sm font-medium">Notes</div>
                        {rowNotesHtml ? (
                            <div
                                className="max-w-none text-sm text-muted-foreground leading-relaxed [&_p]:my-0 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0"
                                dangerouslySetInnerHTML={{ __html: rowNotesHtml }}
                            />
                        ) : (
                            <p className="text-sm text-muted-foreground leading-relaxed">No notes.</p>
                        )}
                    </div>
                ) : null}

                <div className="space-y-2">
                    <div className="text-sm font-medium">Cloze Sentence</div>
                    {row.clozeSentence ? (
                        <div className="rounded-md border bg-background p-3 space-y-2">
                            <div className="text-sm leading-relaxed">{row.clozeSentence.clozeText}</div>
                            {row.clozeSentence.hint ? (
                                <div className="text-sm text-muted-foreground">Hint: {row.clozeSentence.hint}</div>
                            ) : null}
                            <div className="text-sm text-muted-foreground">
                                Answer: {row.clozeSentence.answerText}
                                {row.clozeSentence.answerTranslation ? ` (${row.clozeSentence.answerTranslation})` : ""}
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground">No cloze sentence generated yet.</div>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="text-sm font-medium">Example Sentences</div>
                    {row.exampleSentences.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No example sentences.</div>
                    ) : compact ? (
                        <div className="space-y-2">
                            {row.exampleSentences.map((sentence, index) => (
                                <div key={`${row.id}-sentence-mobile-${index}`} className="rounded-md border bg-background p-2 space-y-1">
                                    <div className="flex items-start gap-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 shrink-0 mt-0.5"
                                            onClick={() =>
                                                void playCardAudio(
                                                    sentence.id ?? `${row.id}-sentence-${index}`,
                                                    sentence.sentence,
                                                    playbackLanguage
                                                )
                                            }
                                            title="Play sentence audio"
                                            aria-label={`Play audio for sentence ${index + 1}`}
                                        >
                                            <Volume2 className="h-4 w-4" />
                                        </Button>
                                        <div className="text-sm leading-relaxed">{sentence.sentence}</div>
                                    </div>
                                    <div className="text-sm text-muted-foreground pl-8">{sentence.translation}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Sentence</TableHead>
                                    <TableHead>Translation</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {row.exampleSentences.map((sentence, index) => (
                                    <TableRow key={`${row.id}-sentence-${index}`}>
                                        <TableCell className="align-top">
                                            <div className="flex items-start gap-2">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 shrink-0 mt-0.5"
                                                    onClick={() =>
                                                        void playCardAudio(
                                                            sentence.id ?? `${row.id}-sentence-${index}`,
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
            </div>
        );
    };

    return (
        <div className="w-full min-h-screen py-6 px-4">
            <div className="max-w-6xl mx-auto space-y-4">
                <Card>
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <CardTitle>Vocabulary</CardTitle>
                        <div className="flex w-full sm:w-auto flex-wrap items-center gap-2">
                            <div className="w-full sm:w-64">
                                <Input
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    placeholder="Search vocabulary"
                                    aria-label="Search vocabulary"
                                />
                            </div>
                            <label
                                className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm ${
                                    showPrivate ? "border-primary bg-primary/10" : "border-input"
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={showPrivate}
                                    onChange={(event) => {
                                        const checked = event.target.checked;
                                        if (!checked && !showPublic) {
                                            return;
                                        }
                                        setShowPrivate(checked);
                                    }}
                                    className="h-4 w-4"
                                />
                                <span>Private</span>
                            </label>
                            <label
                                className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm ${
                                    showPublic ? "border-primary bg-primary/10" : "border-input"
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={showPublic}
                                    onChange={(event) => {
                                        const checked = event.target.checked;
                                        if (!checked && !showPrivate) {
                                            return;
                                        }
                                        setShowPublic(checked);
                                    }}
                                    className="h-4 w-4"
                                />
                                <span>Public</span>
                            </label>
                            <Button type="button" variant="outline" size="sm" onClick={() => output.emit({ type: "reload" })} disabled={isLoading}>
                                {isLoading ? "Refreshing..." : "Refresh"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => output.emit({ type: "generateClozeSentences" })}
                                disabled={isGeneratingCloze || vocabularies.length === 0}
                            >
                                {isGeneratingCloze ? "Generating..." : "Generate Cloze"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleListenAll}
                                disabled={visibleRows.length === 0}
                            >
                                {isListening ? "Stop" : "Listen"}
                            </Button>
                            {showPrivate ? (
                                <Button type="button" size="sm" onClick={() => output.emit({ type: "openCreate" })}>
                                    New Entry
                                </Button>
                            ) : null}
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

                        {clozeStatus ? (
                            <div className="flex flex-wrap items-center gap-2 text-sm text-green-600">
                                <span>{clozeStatus}</span>
                                <Button type="button" variant="outline" size="sm" onClick={() => output.emit({ type: "clearClozeStatus" })}>
                                    Dismiss
                                </Button>
                            </div>
                        ) : null}

                        {!error && (currentRows.length === 0 || visibleRows.length === 0) ? (
                            <div className="text-sm text-muted-foreground">
                                {isLoading ? "Loading vocabulary entries..." : noResultsLabel}
                            </div>
                        ) : null}

                        {visibleRows.length > 0 ? (
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
                                                {visibleRows.map((item) => {
                                                    const isSelected = selectedRowKey === item.key;
                                                    return (
                                                        <Fragment key={item.key}>
                                                            <TableRow
                                                                className={`cursor-pointer ${isSelected ? "bg-accent/80" : ""}`}
                                                                onClick={() => {
                                                                    output.emit({ type: "clearPublishStatus" });
                                                                    setSelectedRowKey(item.key);
                                                                    if (item.source === "private") {
                                                                        output.emit({ type: "setSelectedVocabulary", vocabularyId: item.id });
                                                                    } else {
                                                                        setIsPublishModalOpen(false);
                                                                    }
                                                                }}
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
                                                            {isSelected ? (
                                                                <TableRow className="lg:hidden bg-muted/20">
                                                                    <TableCell colSpan={2} className="p-3">
                                                                        {renderDetailsContent(item, true)}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ) : null}
                                                        </Fragment>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>

                                <div className="hidden lg:block rounded-md border p-4 space-y-4">
                                    {selectedVocabulary ? (
                                        renderDetailsContent(selectedVocabulary, false)
                                    ) : null}
                                </div>
                            </div>
                        ) : null}
                    </CardContent>
                </Card>
            </div>

            {isPublishModalOpen && selectedPrivateVocabulary ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-md border bg-background p-4 shadow-lg space-y-4">
                        <div className="space-y-1">
                            <div className="text-base font-semibold">Publish To Public Vocabulary</div>
                            <div className="text-sm text-muted-foreground">
                                {selectedPrivateVocabulary.surface} - {selectedPrivateVocabulary.translation}
                            </div>
                        </div>
                        <Input
                            type="password"
                            value={publishAdminKey}
                            onChange={(event) => setPublishAdminKey(event.target.value)}
                            placeholder="Enter admin key"
                            disabled={isPublishing}
                        />
                        {publishError ? <div className="text-sm text-red-600">{publishError}</div> : null}
                        <div className="flex items-center justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsPublishModalOpen(false);
                                    setPublishAdminKey("");
                                }}
                                disabled={isPublishing}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={() => {
                                    output.emit({
                                        type: "publishVocabulary",
                                        vocabularyId: selectedPrivateVocabulary.id,
                                        adminKey: publishAdminKey,
                                    });
                                }}
                                disabled={isPublishing}
                            >
                                {isPublishing ? "Publishing..." : "Publish"}
                            </Button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
