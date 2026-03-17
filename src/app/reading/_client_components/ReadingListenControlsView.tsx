"use client";

import { useEffect, useRef, useState } from "react";
import { OutputHandle } from "@myriadcodelabs/uiflow";
import { Button } from "@/components/ui/button";
import { AudioSpeed, getPlaybackRate, playTextAudio } from "@/lib/ttsGoogle";

export type ReadingListenControlsViewOutput =
    | { type: "setAudioSpeed"; speed: AudioSpeed }
    | { type: "setPauseSeconds"; seconds: number };

type ReadingListenControlsViewProps = {
    input: {
        fullQueue: string[];
        queue: string[];
        selectedSentenceText: string | null;
        selectedSentenceChannel?: {
            get: () => string | null;
        };
        sentenceCount: number;
        hasSentenceAudio: boolean;
        audioSpeed: AudioSpeed;
        pauseSeconds: number;
    };
    output: OutputHandle<ReadingListenControlsViewOutput>;
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

export default function ReadingListenControlsView({ input, output }: ReadingListenControlsViewProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const controllerRef = useRef<AbortController | null>(null);

    const stopPlayback = () => {
        controllerRef.current?.abort();
        controllerRef.current = null;
        setIsPlaying(false);
    };

    useEffect(() => {
        return () => {
            controllerRef.current?.abort();
        };
    }, []);

    const handlePlayReading = async () => {
        const liveSelectedSentenceText = input.selectedSentenceChannel?.get() ?? input.selectedSentenceText;
        const queue = liveSelectedSentenceText ? [liveSelectedSentenceText] : input.fullQueue;

        if (queue.length === 0) {
            return;
        }

        stopPlayback();
        const controller = new AbortController();
        controllerRef.current = controller;
        setIsPlaying(true);

        const playbackRate = getPlaybackRate(input.audioSpeed);
        const pauseMs = Math.max(0, input.pauseSeconds) * 1000;

        try {
            for (const sentence of queue) {
                if (controller.signal.aborted) {
                    return;
                }

                const cleaned = sentence.trim();
                if (!cleaned) {
                    continue;
                }

                await playTextAudio(cleaned, "de", playbackRate, controller.signal);
                if (pauseMs > 0) {
                    await sleep(pauseMs, controller.signal);
                }
            }
        } finally {
            if (controllerRef.current === controller) {
                controllerRef.current = null;
                setIsPlaying(false);
            }
        }
    };

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/40 px-3 py-2">
            <div className="text-xs text-muted-foreground">
                {input.hasSentenceAudio ? (
                    input.selectedSentenceText ? (
                        "Selected sentence only"
                    ) : (
                        `${input.sentenceCount} sentence${input.sentenceCount === 1 ? "" : "s"}`
                    )
                ) : (
                    "No sentence audio available"
                )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <select
                    aria-label="Audio speed"
                    value={input.audioSpeed}
                    onChange={(event) => output.emit({ type: "setAudioSpeed", speed: event.target.value as AudioSpeed })}
                    className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    disabled={!input.hasSentenceAudio || isPlaying}
                >
                    <option value="slow">Slow</option>
                    <option value="normal">Normal</option>
                    <option value="fast">Fast</option>
                </select>
                <select
                    aria-label="Pause duration"
                    value={input.pauseSeconds}
                    onChange={(event) => output.emit({ type: "setPauseSeconds", seconds: Number(event.target.value) })}
                    className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    disabled={!input.hasSentenceAudio || isPlaying}
                >
                    <option value={0}>No pause</option>
                    <option value={1}>1s pause</option>
                    <option value={2}>2s pause</option>
                    <option value={3}>3s pause</option>
                    <option value={5}>5s pause</option>
                </select>
                {isPlaying ? (
                    <Button type="button" size="sm" variant="destructive" onClick={stopPlayback}>
                        Stop audio
                    </Button>
                ) : (
                    <Button
                        type="button"
                        size="sm"
                        data-reading-listen-control="true"
                        onClick={handlePlayReading}
                        disabled={!input.hasSentenceAudio}
                        title={input.hasSentenceAudio ? "Listen to reading text" : "Audio unavailable (no sentences)"}
                    >
                        Listen
                    </Button>
                )}
            </div>
        </div>
    );
}
