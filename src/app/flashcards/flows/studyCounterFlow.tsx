// flows/studyCounterFlow.ts
import { defineFlow } from "@myriadcodelabs/uiflow";
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
