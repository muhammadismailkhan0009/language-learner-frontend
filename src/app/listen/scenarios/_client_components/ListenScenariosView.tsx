"use client";

import { useEffect, useRef, useState } from "react";
import { OutputHandle } from "@myriadcodelabs/uiflow";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScenarioResponse } from "@/lib/types/responses/ScenarioResponse";
import { AudioSpeed, getPlaybackRate, playTextAudio } from "@/lib/ttsGoogle";

export type ListenScenariosViewOutput =
    | { type: "reload" }
    | { type: "clearError" };

type ListenScenariosViewProps = {
    input: {
        scenarios: ScenarioResponse[];
        isLoading: boolean;
        error: string | null;
    };
    output: OutputHandle<ListenScenariosViewOutput>;
};

async function sleep(ms: number, signal?: AbortSignal) {
    if (signal?.aborted) {
        return;
    }
    await new Promise<void>((resolve) => {
        const id = window.setTimeout(() => resolve(), ms);
        if (signal) {
            signal.addEventListener(
                "abort",
                () => {
                    window.clearTimeout(id);
                    resolve();
                },
                { once: true }
            );
        }
    });
}

async function playScenarioSequence(
    scenario: ScenarioResponse,
    signal: AbortSignal,
    delayAfterNext: boolean,
    playbackRate: number
) {
    await playTextAudio(scenario.nature, "en", playbackRate, signal);
    await sleep(2000, signal);

    for (const sentence of scenario.sentences ?? []) {
        if (signal.aborted) {
            return;
        }
        const cleaned = sentence.sentence.trim();
        if (!cleaned) {
            continue;
        }
        // play once to parse and understand
        await playTextAudio(cleaned, scenario.targetLanguage, playbackRate, signal);
        await sleep(3000, signal);

        // play twice to shadow speak
        await playTextAudio(cleaned, scenario.targetLanguage, playbackRate, signal);
        const wordCount = cleaned.split(/\s+/).filter(Boolean).length;
        const shadowSpeakPauseMs = wordCount * 0.8 * 1000;
        await sleep(shadowSpeakPauseMs, signal);
    }

    if (signal.aborted) {
        return;
    }

    await playTextAudio("Next", "en", playbackRate, signal);

    if (delayAfterNext) {
        await sleep(1000, signal);
    }
}

export default function ListenScenariosView({ input, output }: ListenScenariosViewProps) {
    const { scenarios, isLoading, error } = input;
    const [isPlayingAll, setIsPlayingAll] = useState(false);
    const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
    const [audioSpeed, setAudioSpeed] = useState<AudioSpeed>("normal");
    const controllerRef = useRef<AbortController | null>(null);

    const stopPlayback = () => {
        controllerRef.current?.abort();
        controllerRef.current = null;
        setIsPlayingAll(false);
        setActiveScenarioId(null);
    };

    useEffect(() => {
        return () => {
            controllerRef.current?.abort();
        };
    }, []);

    const handlePlayScenario = async (scenario: ScenarioResponse) => {
        stopPlayback();
        const controller = new AbortController();
        controllerRef.current = controller;
        setActiveScenarioId(scenario.id);
        const playbackRate = getPlaybackRate(audioSpeed);

        try {
            await playScenarioSequence(scenario, controller.signal, false, playbackRate);
        } finally {
            if (controllerRef.current === controller) {
                controllerRef.current = null;
                setActiveScenarioId(null);
            }
        }
    };

    const handlePlayAll = async () => {
        if (scenarios.length === 0) {
            return;
        }

        stopPlayback();
        const controller = new AbortController();
        controllerRef.current = controller;
        setIsPlayingAll(true);
        const playbackRate = getPlaybackRate(audioSpeed);

        try {
            for (let index = 0; index < scenarios.length; index += 1) {
                if (controller.signal.aborted) {
                    return;
                }
                const scenario = scenarios[index];
                setActiveScenarioId(scenario.id);
                await playScenarioSequence(scenario, controller.signal, index < scenarios.length - 1, playbackRate);
            }
        } finally {
            if (controllerRef.current === controller) {
                controllerRef.current = null;
                setIsPlayingAll(false);
                setActiveScenarioId(null);
            }
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Listen to Scenarios</CardTitle>
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
                        {isLoading ? "Refreshing..." : "Refresh"}
                    </Button>
                    {isPlayingAll ? (
                        <Button type="button" size="sm" variant="destructive" onClick={stopPlayback}>
                            Stop
                        </Button>
                    ) : (
                        <Button type="button" size="sm" onClick={handlePlayAll} disabled={scenarios.length === 0}>
                            Play all
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {isLoading ? (
                    <div className="text-sm text-muted-foreground">Loading scenarios...</div>
                ) : scenarios.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No scenarios available.</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Scenario</TableHead>
                                <TableHead className="text-right">Listen</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {scenarios.map((scenario) => (
                                <TableRow key={scenario.id} className={activeScenarioId === scenario.id ? "bg-accent/70" : ""}>
                                    <TableCell>
                                        <div className="font-medium">{scenario.nature}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {scenario.targetLanguage} • {scenario.sentences?.length ?? 0} sentences
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            title={`Play ${scenario.nature}`}
                                            onClick={() => {
                                                void handlePlayScenario(scenario);
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
                    <div className="flex items-center gap-2 text-sm text-red-600">
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
