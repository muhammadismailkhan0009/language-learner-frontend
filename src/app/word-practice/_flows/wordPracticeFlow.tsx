import { defineFlow } from "@myriadcodelabs/uiflow";
import { normalizeGermanTransliteration } from "@/lib/germanInputNormalize";
import { WordPracticeQueueResponse } from "@/lib/types/responses/WordPracticeQueueResponse";
import getWordPracticeQueueAction from "../_server_actions/getWordPracticeQueueAction";
import requestWordPracticeGenerationAction from "../_server_actions/requestWordPracticeGenerationAction";
import submitWordPracticeAnswerAction from "../_server_actions/submitWordPracticeAnswerAction";
import WordPracticeView, { WordPracticeFeedback, WordPracticeViewOutput } from "../_client_components/WordPracticeView";

type Domain = Record<string, never>;

type Internal = {
    queue: WordPracticeQueueResponse | null;
    activeIndex: number;
    answer: string;
    feedback: WordPracticeFeedback | null;
    isLoading: boolean;
    isGenerating: boolean;
    isSubmitting: boolean;
    error: string | null;
    info: string | null;
};

function createInternalData(): Internal {
    return { queue: null, activeIndex: 0, answer: "", feedback: null, isLoading: false, isGenerating: false, isSubmitting: false, error: null, info: null };
}

function activePractice(internal: Internal) {
    return internal.queue?.practices[internal.activeIndex] ?? null;
}

function removeAnsweredPractice(internal: Internal) {
    if (!internal.queue) return;
    internal.queue.practices.splice(internal.activeIndex, 1);
    internal.queue.activeVocabularyCount = new Set(internal.queue.practices.map((practice) => practice.vocabularyId)).size;
    if (internal.activeIndex >= internal.queue.practices.length) internal.activeIndex = 0;
}

export const wordPracticeFlow = defineFlow<Domain, Internal>({
    load: {
        input: () => ({}),
        render: { mode: "preserve-previous" },
        action: async (_input, _domain, internal) => {
            internal.isLoading = true;
            internal.error = null;
            try {
                internal.queue = await getWordPracticeQueueAction();
                internal.activeIndex = 0;
                internal.answer = "";
                internal.feedback = null;
            } catch (error) {
                internal.error = error instanceof Error ? error.message : "Failed to load word practices";
            } finally {
                internal.isLoading = false;
            }
            return { ok: true };
        },
        onOutput: () => "show",
    },
    generate: {
        input: () => ({}),
        render: { mode: "preserve-previous" },
        action: async (_input, _domain, internal) => {
            internal.isGenerating = true;
            internal.error = null;
            internal.info = null;
            try {
                internal.info = await requestWordPracticeGenerationAction();
            } catch (error) {
                internal.error = error instanceof Error ? error.message : "Failed to request word-practice generation";
            } finally {
                internal.isGenerating = false;
            }
            return { ok: true };
        },
        onOutput: () => "show",
    },
    submit: {
        input: (_domain, internal) => ({
            practiceId: activePractice(internal)?.id ?? null,
            answer: normalizeGermanTransliteration(
                internal.answer.trim(),
                activePractice(internal)?.exactAnswer ?? "",
            ),
        }),
        render: { mode: "preserve-previous" },
        action: async ({ practiceId, answer }, _domain, internal) => {
            if (!practiceId || !answer) return { ok: false };
            internal.isSubmitting = true;
            internal.error = null;
            try {
                const result = await submitWordPracticeAnswerAction(practiceId, answer);
                internal.feedback = { ...result, submittedAnswer: answer };
            } catch (error) {
                internal.error = error instanceof Error ? error.message : "Failed to check answer";
            } finally {
                internal.isSubmitting = false;
            }
            return { ok: true };
        },
        onOutput: () => "show",
    },
    show: {
        input: (_domain, internal) => ({
            queue: internal.queue,
            practice: activePractice(internal),
            answer: internal.answer,
            feedback: internal.feedback,
            isLoading: internal.isLoading,
            isGenerating: internal.isGenerating,
            isSubmitting: internal.isSubmitting,
            error: internal.error,
            info: internal.info,
        }),
        view: WordPracticeView,
        onOutput: (_domain, internal, output: WordPracticeViewOutput) => {
            if (output.type === "reload") return "load";
            if (output.type === "generate") return "generate";
            if (output.type === "submitAnswer") return "submit";
            if (output.type === "updateAnswer") {
                internal.answer = output.answer;
                return "show";
            }
            if (output.type === "skip") {
                if (internal.queue?.practices.length) internal.activeIndex = (internal.activeIndex + 1) % internal.queue.practices.length;
                internal.answer = "";
                internal.feedback = null;
                return "show";
            }
            if (output.type === "next") {
                if (internal.feedback?.correct) removeAnsweredPractice(internal);
                else if (internal.queue?.practices.length) internal.activeIndex = (internal.activeIndex + 1) % internal.queue.practices.length;
                internal.answer = "";
                internal.feedback = null;
                return "show";
            }
            if (output.type === "clearMessage") {
                internal.error = null;
                internal.info = null;
                return "show";
            }
        },
    },
}, { start: "load", createInternalData });
