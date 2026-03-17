import { defineFlow } from "@myriadcodelabs/uiflow";
import { ReadingPracticeParagraphResponse } from "@/lib/types/responses/ReadingPracticeParagraphResponse";
import ReadingSentenceSelectionView, { ReadingSentenceSelectionViewOutput } from "../_client_components/ReadingSentenceSelectionView";

type ReadingSentenceSelectionDomainData = {
    readingParagraphs: ReadingPracticeParagraphResponse[];
    fallbackReadingText: string;
};

type SentenceEntry = {
    key: string;
    text: string;
};

type ReadingSentenceSelectionInternalData = {
    selectedSentenceKey: string | null;
};

function createInternalData(): ReadingSentenceSelectionInternalData {
    return {
        selectedSentenceKey: null,
    };
}

function createSentenceEntries(paragraphs: ReadingPracticeParagraphResponse[]): SentenceEntry[] {
    return paragraphs.flatMap((paragraph, paragraphIndex) =>
        (paragraph.sentences ?? [])
            .map((sentence, sentenceIndex) => ({
                key: `${paragraphIndex}-${sentenceIndex}`,
                text: sentence?.trim() ?? "",
            }))
            .filter((entry) => entry.text.length > 0)
    );
}

export const readingSentenceSelectionFlow = defineFlow<ReadingSentenceSelectionDomainData, ReadingSentenceSelectionInternalData>(
    {
        showText: {
            input: (domain, internal) => ({
                readingParagraphs: domain.readingParagraphs,
                fallbackReadingText: domain.fallbackReadingText,
                selectedSentenceKey: internal.selectedSentenceKey,
            }),
            view: ReadingSentenceSelectionView,
            onOutput: (domain, internal, output: ReadingSentenceSelectionViewOutput, events) => {
                if (output.type === "toggleSentenceSelection") {
                    internal.selectedSentenceKey =
                        internal.selectedSentenceKey === output.sentenceKey ? null : output.sentenceKey;

                    const sentenceEntries = createSentenceEntries(domain.readingParagraphs);
                    const selectedSentence = internal.selectedSentenceKey
                        ? sentenceEntries.find((entry) => entry.key === internal.selectedSentenceKey) ?? null
                        : null;
                    events?.selectedSentence?.emit(selectedSentence?.text ?? null);
                    return "showText";
                }

                if (output.type === "clearSentenceSelection") {
                    internal.selectedSentenceKey = null;
                    events?.selectedSentence?.emit(null);
                    return "showText";
                }
            },
        },
    },
    {
        start: "showText",
        createInternalData,
    }
);
