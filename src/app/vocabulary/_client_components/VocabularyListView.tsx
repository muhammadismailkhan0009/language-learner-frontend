"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { OutputHandle } from "@myriadcodelabs/uiflow";
import { Info as CircleInfo, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { playCardAudio } from "@/lib/ttsGoogle";
import { PublicVocabularyListItem, ScreenMode, VocabularyListItem } from "../types";
import { sanitizeNotesHtml } from "../notesHtml";

export type VocabularyListViewOutput =
    | { type: "reload" }
    | { type: "clearError" }
    | { type: "openCreate" }
    | { type: "clearPublishStatus" }
    | { type: "setSelectedVocabulary"; vocabularyId: string }
    | { type: "openEdit"; vocabularyId: string }
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
        publishError: string | null;
        publishSuccess: string | null;
    };
    output: OutputHandle<VocabularyListViewOutput>;
};

export default function VocabularyListView({ input, output }: VocabularyListViewProps) {
    const { mode, vocabularies, publicVocabularies, error, isLoading, isPublishing, publishError, publishSuccess } = input;
    const [showPrivate, setShowPrivate] = useState(true);
    const [showPublic, setShowPublic] = useState(false);
    const [hasInitializedSelection, setHasInitializedSelection] = useState(false);
    const [isNotesVisible, setIsNotesVisible] = useState(false);
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [publishAdminKey, setPublishAdminKey] = useState("");
    const [selectedRowKey, setSelectedRowKey] = useState<string | null>(null);

    const currentRows = useMemo(() => {
        const rows: Array<{
            key: string;
            source: "private" | "public";
            id: string;
            surface: string;
            translation: string;
            notes: string;
            exampleSentences: { id?: string; sentence: string; translation: string }[];
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
                }))
            );
        }

        if (showPublic) {
            rows.push(
                ...publicVocabularies.map((item) => ({
                    key: `public:${item.publicVocabularyId}`,
                    source: "public" as const,
                    id: item.publicVocabularyId,
                    surface: item.surface,
                    translation: item.translation,
                    notes: item.notes,
                    exampleSentences: item.exampleSentences,
                }))
            );
        }

        return rows;
    }, [showPrivate, showPublic, vocabularies, publicVocabularies]);

    const selectedRow = currentRows.find((row) => row.key === selectedRowKey) ?? currentRows[0] ?? null;
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
        if (currentRows.length === 0) {
            setSelectedRowKey(null);
            return;
        }

        const hasCurrent = !!selectedRowKey && currentRows.some((row) => row.key === selectedRowKey);
        if (!hasCurrent) {
            setSelectedRowKey(currentRows[0].key);
        }
    }, [currentRows, selectedRowKey]);

    if (mode !== "list") {
        return null;
    }

    const playbackLanguage = "de";
    const emptyLabel = showPrivate && !showPublic
        ? "No vocabulary entries found."
        : showPublic && !showPrivate
            ? "No public vocabulary entries found."
            : "No vocabulary entries found for selected sources.";

    const renderDetailsContent = (row: {
        key: string;
        source: "private" | "public";
        id: string;
        surface: string;
        translation: string;
        notes: string;
        exampleSentences: { id?: string; sentence: string; translation: string }[];
    }, compact: boolean) => {
        const isPrivateRow = row.source === "private";
        const rowNotesHtml = sanitizeNotesHtml(row.notes);
        const isAlreadyPublished = isPrivateRow && publicVocabularies.some((item) => item.sourceVocabularyId === row.id);

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
                            <Button
                                type="button"
                                variant="outline"
                                size={compact ? "sm" : "default"}
                                onClick={() => {
                                    output.emit({ type: "clearPublishStatus" });
                                    setIsPublishModalOpen(true);
                                }}
                                disabled={isAlreadyPublished}
                            >
                                {isAlreadyPublished ? "Published" : "Publish"}
                            </Button>
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

                        {!error && currentRows.length === 0 ? (
                            <div className="text-sm text-muted-foreground">{isLoading ? "Loading vocabulary entries..." : emptyLabel}</div>
                        ) : null}

                        {currentRows.length > 0 ? (
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
                                                {currentRows.map((item) => {
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
