import { defineFlow } from "@myriadcodelabs/uiflow";
import { fetchWordsToListenTo } from "@/lib/clientbackendApiCalls";
import { WordToListenToResponse } from "@/lib/types/responses/WordToListenToResponse";
import WordsListView, { WordsListViewOutput } from "../_client_components/WordsListView";

type WordsListDomainData = Record<string, never>;

interface WordsListInternalData {
    flowData: {
        words: WordToListenToResponse[];
        ui: {
            fetchWords: {
                isLoading: boolean;
            };
            displayWords: {
                error: string | null;
            };
        };
    };
}

function createWordsListInternalData(): WordsListInternalData {
    return {
        flowData: {
            words: [],
            ui: {
                fetchWords: {
                    isLoading: false,
                },
                displayWords: {
                    error: null,
                },
            },
        },
    };
}

export const wordsListFlow = defineFlow<WordsListDomainData, WordsListInternalData>({
    fetchWords: {
        input: () => ({}),
        action: async (_, _domain, internal) => {
            const fetchUi = internal.flowData.ui.fetchWords;
            const displayUi = internal.flowData.ui.displayWords;

            fetchUi.isLoading = true;
            displayUi.error = null;

            try {
                const response = await fetchWordsToListenTo();
                if (response.status !== 200) {
                    throw new Error("Failed to load words");
                }
                internal.flowData.words = response.data.response ?? [];
            } catch (err) {
                displayUi.error = err instanceof Error ? err.message : "Failed to load words";
            } finally {
                fetchUi.isLoading = false;
            }

            return { ok: true };
        },
        onOutput: () => "displayWords",
    },

    displayWords: {
        input: (_domain, internal) => ({
            words: internal.flowData.words,
            error: internal.flowData.ui.displayWords.error,
            isLoading: internal.flowData.ui.fetchWords.isLoading,
        }),
        view: WordsListView,
        onOutput: (_domain, internal, output: WordsListViewOutput) => {
            if (output.type === "reload") {
                return "fetchWords";
            }

            if (output.type === "clearError") {
                internal.flowData.ui.displayWords.error = null;
                return "displayWords";
            }
        },
    },
}, {
    start: "fetchWords",
    channelTransitions: {
        wordsRefresh: () => "fetchWords",
    },
    createInternalData: createWordsListInternalData,
});
