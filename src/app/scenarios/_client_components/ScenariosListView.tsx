"use client";

import { useState } from "react";
import { OutputHandle } from "@myriadcodelabs/uiflow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Volume2 } from "lucide-react";
import { AudioSpeed, getPlaybackRate, playCardAudio } from "@/lib/ttsGoogle";
import { ScenarioListItem, ScreenMode } from "../types";

export type ScenariosListViewOutput =
    | { type: "reload" }
    | { type: "clearError" }
    | { type: "openCreate" }
    | { type: "setSelectedScenario"; scenarioId: string }
    | { type: "openEdit"; scenarioId: string };

type ScenariosListViewProps = {
    input: {
        mode: ScreenMode;
        scenarios: ScenarioListItem[];
        selectedScenarioId: string | null;
        error: string | null;
        isLoading: boolean;
    };
    output: OutputHandle<ScenariosListViewOutput>;
};

export default function ScenariosListView({ input, output }: ScenariosListViewProps) {
    const { mode, scenarios, selectedScenarioId, error, isLoading } = input;
    const [audioSpeed, setAudioSpeed] = useState<AudioSpeed>("normal");

    if (mode !== "list") {
        return null;
    }

    const selectedScenario =
        scenarios.find((scenario) => scenario.id === selectedScenarioId) ??
        scenarios[0] ??
        null;

    return (
        <div className="w-full min-h-screen py-6 px-4">
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Your Scenarios</CardTitle>
                        <div className="flex items-center gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => output.emit({ type: "reload" })} disabled={isLoading}>
                                {isLoading ? "Refreshing..." : "Refresh"}
                            </Button>
                            <Button type="button" onClick={() => output.emit({ type: "openCreate" })}>
                                Add Scenario
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {error ? (
                            <div className="flex items-center gap-2 text-sm text-red-600">
                                <span>{error}</span>
                                <Button type="button" variant="outline" size="sm" onClick={() => output.emit({ type: "clearError" })}>
                                    Dismiss
                                </Button>
                            </div>
                        ) : null}

                        {!error && scenarios.length === 0 ? (
                            <div className="text-sm text-muted-foreground">{isLoading ? "Loading scenarios..." : "No scenarios available."}</div>
                        ) : null}

                        {scenarios.length > 0 ? (
                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <label htmlFor="scenario-select" className="text-sm font-medium">
                                        Select scenario
                                    </label>
                                    <select
                                        id="scenario-select"
                                        value={selectedScenario?.id ?? ""}
                                        onChange={(e) => output.emit({ type: "setSelectedScenario", scenarioId: e.target.value })}
                                        className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    >
                                        {scenarios.map((scenario) => (
                                            <option key={scenario.id} value={scenario.id}>
                                                {scenario.nature} ({scenario.targetLanguage})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="scenario-audio-speed-select" className="text-sm font-medium">
                                        Audio Speed
                                    </label>
                                    <select
                                        id="scenario-audio-speed-select"
                                        value={audioSpeed}
                                        onChange={(e) => setAudioSpeed(e.target.value as AudioSpeed)}
                                        className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    >
                                        <option value="slow">Slow</option>
                                        <option value="normal">Normal</option>
                                        <option value="fast">Fast</option>
                                    </select>
                                </div>

                                {selectedScenario ? (
                                    <div className="rounded-md border p-4 space-y-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <div className="font-semibold">{selectedScenario.nature}</div>
                                                <div className="text-sm text-muted-foreground">Target Language: {selectedScenario.targetLanguage}</div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => output.emit({ type: "openEdit", scenarioId: selectedScenario.id })}
                                            >
                                                Edit Scenario
                                            </Button>
                                        </div>

                                        {selectedScenario.sentences.length === 0 ? (
                                            <div className="text-sm text-muted-foreground">No sentences found for this scenario.</div>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="hidden md:block">
                                                    <Table className="w-full table-fixed">
                                                        <colgroup>
                                                            <col style={{ width: "50%" }} />
                                                            <col style={{ width: "50%" }} />
                                                        </colgroup>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead className="border-r">Sentence</TableHead>
                                                                <TableHead className="border-l">Translation</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {selectedScenario.sentences.map((sentence, index) => (
                                                                <TableRow key={`${sentence.id ?? "sentence"}-${index}`}>
                                                                    <TableCell
                                                                        className="font-medium align-top pr-4 break-words border-r"
                                                                        style={{
                                                                            wordWrap: "break-word",
                                                                            overflowWrap: "break-word",
                                                                            whiteSpace: "normal",
                                                                            overflow: "hidden",
                                                                        }}
                                                                    >
                                                                        <div className="flex items-start gap-2">
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-6 w-6 shrink-0 mt-0.5"
                                                                                onClick={() =>
                                                                                    playCardAudio(
                                                                                        sentence.id ?? `scenario-${index}`,
                                                                                        sentence.sentence,
                                                                                        selectedScenario.targetLanguage,
                                                                                        getPlaybackRate(audioSpeed)
                                                                                    )
                                                                                }
                                                                                title="Play audio"
                                                                            >
                                                                                <Volume2 className="h-4 w-4" />
                                                                            </Button>
                                                                            <span className="flex-1">{sentence.sentence}</span>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell
                                                                        className="align-top pl-4 text-muted-foreground break-words border-l"
                                                                        style={{
                                                                            wordWrap: "break-word",
                                                                            overflowWrap: "break-word",
                                                                            whiteSpace: "normal",
                                                                            overflow: "hidden",
                                                                        }}
                                                                    >
                                                                        {sentence.translation}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>

                                                <div className="md:hidden space-y-3">
                                                    {selectedScenario.sentences.map((sentence, index) => (
                                                        <Card key={`${sentence.id ?? "sentence"}-${index}`} className="border-l-4 border-l-primary">
                                                            <CardContent className="p-3 space-y-2">
                                                                <div>
                                                                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                                                                        Sentence
                                                                    </div>
                                                                    <div className="flex items-start gap-2">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-6 w-6 shrink-0 mt-0.5"
                                                                            onClick={() =>
                                                                                playCardAudio(
                                                                                    sentence.id ?? `scenario-${index}`,
                                                                                    sentence.sentence,
                                                                                    selectedScenario.targetLanguage,
                                                                                    getPlaybackRate(audioSpeed)
                                                                                )
                                                                            }
                                                                            title="Play audio"
                                                                        >
                                                                            <Volume2 className="h-4 w-4" />
                                                                        </Button>
                                                                        <div className="text-sm font-medium leading-relaxed break-words flex-1">
                                                                            {sentence.sentence}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="border-t pt-2">
                                                                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                                                                        Translation
                                                                    </div>
                                                                    <div className="text-sm leading-relaxed break-words text-muted-foreground">
                                                                        {sentence.translation}
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : null}
                            </div>
                        ) : null}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
