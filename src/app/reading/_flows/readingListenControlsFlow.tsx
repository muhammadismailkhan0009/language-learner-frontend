import { defineFlow } from "@myriadcodelabs/uiflow";
import { AudioSpeed } from "@/lib/ttsGoogle";
import { ReadingPracticeParagraphResponse } from "@/lib/types/responses/ReadingPracticeParagraphResponse";
import ReadingListenControlsView, { ReadingListenControlsViewOutput } from "../_client_components/ReadingListenControlsView";

type ReadingListenControlsDomainData = {
    readingParagraphs: ReadingPracticeParagraphResponse[];
};

type ReadingListenControlsInternalData = {
    audioSpeed: AudioSpeed;
    pauseSeconds: number;
};

function createInternalData(): ReadingListenControlsInternalData {
    return {
        audioSpeed: "normal",
        pauseSeconds: 2,
    };
}

function createSentenceQueue(paragraphs: ReadingPracticeParagraphResponse[]): string[] {
    return paragraphs.flatMap((paragraph) =>
        (paragraph.sentences ?? [])
            .map((sentence) => sentence?.trim() ?? "")
            .filter((sentence) => sentence.length > 0)
    );
}

export const readingListenControlsFlow = defineFlow<ReadingListenControlsDomainData, ReadingListenControlsInternalData>(
    {
        showControls: {
            input: (domain, internal, events) => {
                const fullQueue = createSentenceQueue(domain.readingParagraphs);
                const selectedSentenceText = events?.selectedSentence?.get?.() ?? null;
                const queue = selectedSentenceText ? [selectedSentenceText] : fullQueue;

                return {
                    fullQueue,
                    queue,
                    selectedSentenceText,
                    selectedSentenceChannel: events?.selectedSentence,
                    sentenceCount: queue.length,
                    hasSentenceAudio: queue.length > 0,
                    audioSpeed: internal.audioSpeed,
                    pauseSeconds: internal.pauseSeconds,
                };
            },
            view: ReadingListenControlsView,
            onOutput: (_domain, internal, output: ReadingListenControlsViewOutput) => {
                if (output.type === "setAudioSpeed") {
                    internal.audioSpeed = output.speed;
                    return "showControls";
                }

                if (output.type === "setPauseSeconds") {
                    internal.pauseSeconds = Math.max(0, output.seconds);
                    return "showControls";
                }
            },
        },
    },
    {
        start: "showControls",
        createInternalData,
        channelTransitions: {
            selectedSentence: () => "showControls",
        },
    }
);
