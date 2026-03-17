"use client";

import { useEffect, useRef } from "react";
import { OutputHandle } from "@myriadcodelabs/uiflow";
import { ReadingPracticeParagraphResponse } from "@/lib/types/responses/ReadingPracticeParagraphResponse";

export type ReadingSentenceSelectionViewOutput =
    | { type: "toggleSentenceSelection"; sentenceKey: string }
    | { type: "clearSentenceSelection" };

type ReadingSentenceSelectionViewProps = {
    input: {
        readingParagraphs: ReadingPracticeParagraphResponse[];
        fallbackReadingText: string;
        selectedSentenceKey: string | null;
    };
    output: OutputHandle<ReadingSentenceSelectionViewOutput>;
};

export default function ReadingSentenceSelectionView({ input, output }: ReadingSentenceSelectionViewProps) {
    const readingTextRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleDocumentPointerDown = (event: PointerEvent) => {
            if (!input.selectedSentenceKey) {
                return;
            }

            const target = event.target as HTMLElement | null;
            if (!target) {
                output.emit({ type: "clearSentenceSelection" });
                return;
            }

            if (target.closest("[data-reading-listen-control='true']")) {
                return;
            }

            const readingRoot = readingTextRef.current;
            if (!readingRoot?.contains(target)) {
                output.emit({ type: "clearSentenceSelection" });
                return;
            }

            if (!target.closest("[data-reading-sentence='true']")) {
                output.emit({ type: "clearSentenceSelection" });
            }
        };

        document.addEventListener("pointerdown", handleDocumentPointerDown);
        return () => {
            document.removeEventListener("pointerdown", handleDocumentPointerDown);
        };
    }, [input.selectedSentenceKey, output]);

    return (
        <div ref={readingTextRef} className="whitespace-pre-wrap rounded-md border p-4 text-sm leading-6">
            {input.readingParagraphs.length > 0 ? (
                <div className="space-y-4">
                    {input.readingParagraphs.map((paragraph, paragraphIndex) => {
                        const paragraphSentences = (paragraph.sentences ?? [])
                            .map((sentence, sentenceIndex) => ({
                                sentenceIndex,
                                text: sentence?.trim() ?? "",
                            }))
                            .filter((entry) => entry.text.length > 0);

                        if (paragraphSentences.length === 0) {
                            const cleanedParagraphText = paragraph.paragraphText?.trim();
                            if (!cleanedParagraphText) {
                                return null;
                            }

                            return <p key={`paragraph-text-${paragraphIndex}`}>{cleanedParagraphText}</p>;
                        }

                        return (
                            <p key={`paragraph-${paragraphIndex}`} className="leading-6">
                                {paragraphSentences.map((sentence) => {
                                    const sentenceKey = `${paragraphIndex}-${sentence.sentenceIndex}`;
                                    const isSelected = input.selectedSentenceKey === sentenceKey;

                                    return (
                                        <button
                                            key={sentenceKey}
                                            type="button"
                                            data-reading-sentence="true"
                                            onClick={() => output.emit({ type: "toggleSentenceSelection", sentenceKey })}
                                            className={`inline cursor-pointer rounded px-0.5 py-0 text-left text-inherit transition-colors ${
                                                isSelected ? "bg-primary/15 ring-1 ring-primary/40" : "hover:bg-muted/60"
                                            }`}
                                        >
                                            {sentence.text}{" "}
                                        </button>
                                    );
                                })}
                            </p>
                        );
                    })}
                </div>
            ) : (
                input.fallbackReadingText || "No reading text available yet."
            )}
        </div>
    );
}
