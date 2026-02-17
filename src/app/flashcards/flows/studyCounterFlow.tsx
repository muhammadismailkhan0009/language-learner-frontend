// flows/studyCounterFlow.ts
import { defineFlow } from "@myriadcodelabs/uiflow";
import { StudyCounterView } from "../_client_components/StudyCounterView";

export const studyCounterFlow = defineFlow({
    showCount: {
        input: (_domain, _internal, events) => ({
            count: events!.studiedCounter.get(),
        }),
        view: StudyCounterView,
        onOutput: () => { },
    },
}, {
    start: "showCount",
});
