// flows/studyCounterFlow.ts
import { defineFlow } from "@/lib/custom_lib_ui/flow";
import { StudyCounterView } from "../_client_components/StudyCounterView";

export const studyCounterFlow = defineFlow({
    showCount: {
        input: (_, events) => ({
            count: events!.studiedCounter.get(),
        }),
        view: StudyCounterView,
        onOutput: () => { },
    },
}, {
    start: "showCount",
});
