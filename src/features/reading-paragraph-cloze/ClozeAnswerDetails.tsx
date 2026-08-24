import { ClozeBlank } from "@/flows/reading-paragraph-cloze/contracts";

export function ClozeAnswerDetails({ blank }: { blank: ClozeBlank }) {
    return <div className="flex flex-col gap-3 text-sm">
        <p><span className="font-medium">Correct form:</span> {blank.exactAnswer}</p>
        <p className="text-muted-foreground">{blank.answerExplanation}</p>
        {blank.vocabularyDetails ? <details className="rounded-md border p-3"><summary className="cursor-pointer font-medium">Vocabulary: {blank.vocabularyDetails.surface}</summary>
            <div className="mt-3 flex flex-col gap-2 text-muted-foreground"><p>{blank.vocabularyDetails.translation}</p>{blank.vocabularyDetails.notes ? <p>{blank.vocabularyDetails.notes}</p> : null}
                {blank.vocabularyDetails.exampleSentences.map((example) => <p key={`${example.sentence}-${example.translation}`}><span lang="de">{example.sentence}</span> — {example.translation}</p>)}</div></details> : null}
        {blank.grammarRuleDetails.map((rule) => <details key={rule.id} className="rounded-md border p-3"><summary className="cursor-pointer font-medium">Grammar: {rule.name} ({rule.level})</summary>
            <div className="mt-3 flex flex-col gap-2 text-muted-foreground">{rule.explanationParagraphs.map((text) => <p key={text}>{text}</p>)}
                {rule.explanationExamples.map((example) => <p key={`${example.sentence}-${example.translation}`}><span lang="de">{example.sentence}</span> — {example.translation}</p>)}</div></details>)}
    </div>;
}
