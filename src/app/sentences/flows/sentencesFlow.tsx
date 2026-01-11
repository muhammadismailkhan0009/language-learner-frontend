import { defineFlow } from "@/lib/custom_lib_ui/flow";
import { fetchSentences } from "@/lib/clientbackendApiCalls";
import { SentenceGroup } from "@/lib/types/responses/Sentence";
import SentencesView from "../_client_components/SentencesView";
import ErrorUI from "../_client_components/ErrorUI";

interface SentencesData {
    flowData: FlowDataHolder;
}

interface FlowDataHolder {
    sentences: SentenceGroup[];
    error: string | null;
}

export const sentencesFlow = defineFlow<SentencesData>({
    fetchSentences: {
        input: (data) => ({}),
        action: async (_, data) => {
            try {
                data.flowData.error = null;
                const response = await fetchSentences();
                if (response.status === 200) {
                    data.flowData.sentences = response.data.response;
                    return { ok: true };
                } else {
                    data.flowData.error = "Failed to fetch sentences";
                    return { ok: false };
                }
            } catch (err) {
                data.flowData.error = err instanceof Error ? err.message : "An error occurred";
                return { ok: false };
            }
        },
        onOutput: (data, output) => {
            if (!output.ok) {
                return "error";
            }
            return "displaySentences";
        }
    },

    error: {
        input: (data) => ({
            error: data.flowData.error || "An error occurred"
        }),
        view: ErrorUI,
        onOutput: () => { }
    },

    displaySentences: {
        input: (data) => ({
            sentences: data.flowData.sentences
        }),
        view: SentencesView,
        onOutput: () => { }
    },

}, { start: "fetchSentences" });

