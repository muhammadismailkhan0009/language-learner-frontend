"use client";

import { useMemo } from "react";
import { createFlowChannel, FlowRunner } from "@myriadcodelabs/uiflow";
import { ScreenMode } from "../types";
import { grammarRulesListFlow } from "../flows/grammarRulesListFlow";
import { addGrammarRuleFlow } from "../flows/addGrammarRuleFlow";
import { editGrammarRuleFlow } from "../flows/editGrammarRuleFlow";

export default function GrammarPageClient() {
    const screenMode = useMemo(() => createFlowChannel<ScreenMode>("list"), []);
    const selectedGrammarRuleId = useMemo(() => createFlowChannel<string | null>(null), []);
    const rulesRefresh = useMemo(() => createFlowChannel<number>(0), []);

    return (
        <>
            <FlowRunner
                initialData={{}}
                flow={grammarRulesListFlow}
                eventChannels={{ screenMode, selectedGrammarRuleId, rulesRefresh }}
            />
            <FlowRunner
                initialData={{}}
                flow={addGrammarRuleFlow}
                eventChannels={{ screenMode, selectedGrammarRuleId, rulesRefresh }}
            />
            <FlowRunner
                initialData={{}}
                flow={editGrammarRuleFlow}
                eventChannels={{ screenMode, selectedGrammarRuleId, rulesRefresh }}
            />
        </>
    );
}
