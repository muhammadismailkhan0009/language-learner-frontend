"use client";

import { useState } from "react";
import { Volume2 } from "lucide-react";
import { OutputHandle } from "@myriadcodelabs/uiflow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AudioSpeed, getPlaybackRate, playCardAudio } from "@/lib/ttsGoogle";
import { WordToListenToResponse } from "@/lib/types/responses/WordToListenToResponse";

export type WordsListViewOutput =
    | { type: "reload" }
    | { type: "clearError" };

type WordsListViewProps = {
    input: {
        words: WordToListenToResponse[];
        error: string | null;
        isLoading: boolean;
    };
    output: OutputHandle<WordsListViewOutput>;
};

export default function WordsListView({ input, output }: WordsListViewProps) {
    const { words, error, isLoading } = input;
    const [audioSpeed, setAudioSpeed] = useState<AudioSpeed>("normal");

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Words to Listen To</CardTitle>
                <div className="flex items-center gap-2">
                    <select
                        aria-label="Audio speed"
                        value={audioSpeed}
                        onChange={(e) => setAudioSpeed(e.target.value as AudioSpeed)}
                        className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                        <option value="slow">Slow</option>
                        <option value="normal">Normal</option>
                        <option value="fast">Fast</option>
                    </select>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => output.emit({ type: "reload" })}
                        disabled={isLoading}
                    >
                        Refresh
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="text-sm text-muted-foreground">Loading words...</div>
                ) : words.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No words found.</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Word</TableHead>
                                <TableHead className="text-right">Listen</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {words.map((item, index) => (
                                <TableRow key={`${item.word}-${index}`}>
                                    <TableCell>{item.word}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            title={`Play ${item.word}`}
                                            onClick={() => {
                                                void playCardAudio(item.word, item.word, "de", getPlaybackRate(audioSpeed));
                                            }}
                                        >
                                            <Volume2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}

                {error ? (
                    <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
                        <span>{error}</span>
                        <Button type="button" variant="outline" size="sm" onClick={() => output.emit({ type: "clearError" })}>
                            Dismiss
                        </Button>
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}
