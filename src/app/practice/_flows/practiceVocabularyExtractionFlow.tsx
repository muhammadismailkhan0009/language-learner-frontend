import { defineFlow } from "@myriadcodelabs/uiflow";
import extractPracticeVocabularyAction from "../_server_actions/extractPracticeVocabularyAction";
import PracticeVocabularyExtractionView, {
    PracticeVocabularyExtractionViewOutput,
} from "../_client_components/PracticeVocabularyExtractionView";

type DomainData = Record<string, never>;

type InternalData = {
    text: string;
    isRequesting: boolean;
    error: string | null;
    message: string | null;
};

function createInternalData(): InternalData {
    return {
        text: "",
        isRequesting: false,
        error: null,
        message: null,
    };
}

export const practiceVocabularyExtractionFlow = defineFlow<DomainData, InternalData>(
    {
        form: {
            input: (_domain, internal) => ({
                text: internal.text,
                isRequesting: internal.isRequesting,
                error: internal.error,
                message: internal.message,
            }),
            view: PracticeVocabularyExtractionView,
            onOutput: (_domain, internal, output: PracticeVocabularyExtractionViewOutput) => {
                if (output.type === "setText") {
                    internal.text = output.text;
                    internal.error = null;
                    internal.message = null;
                    return "form";
                }

                if (output.type === "request") {
                    if (!internal.text.trim()) {
                        internal.error = "Text is required.";
                        return "form";
                    }
                    return "request";
                }

                if (output.type === "reset") {
                    internal.text = "";
                    internal.error = null;
                    internal.message = null;
                    return "form";
                }
            },
        },

        request: {
            input: (_domain, internal) => ({ text: internal.text.trim() }),
            render: { mode: "preserve-previous" },
            action: async ({ text }: { text: string }, _domain, internal) => {
                internal.isRequesting = true;
                internal.error = null;
                internal.message = null;

                try {
                    const response = await extractPracticeVocabularyAction(text);
                    if (!response) {
                        throw new Error("Unable to request practice vocabulary extraction.");
                    }
                    internal.message = response.message;
                } catch (error) {
                    internal.error = error instanceof Error
                        ? error.message
                        : "Unable to request practice vocabulary extraction.";
                } finally {
                    internal.isRequesting = false;
                }

                return { ok: true };
            },
            onOutput: () => "form",
        },
    },
    {
        start: "form",
        createInternalData,
    },
);
