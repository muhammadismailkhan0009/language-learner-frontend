import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WritingStructuredFeedback } from "@/lib/types/responses/WritingPracticeSessionResponse";
import { ReactNode } from "react";

type Props = {
  feedback: WritingStructuredFeedback;
};

function TextBox({ children }: { children: ReactNode }) {
  return <div className="whitespace-pre-wrap rounded-md border bg-muted/20 p-4 text-sm leading-6">{children}</div>;
}

export default function WritingStructuredFeedbackView({ feedback }: Props) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Overall</CardTitle>
        </CardHeader>
        <CardContent>
          <TextBox>{feedback.overall}</TextBox>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Corrected Paragraph</CardTitle>
        </CardHeader>
        <CardContent>
          <TextBox>{feedback.correctedParagraph}</TextBox>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Fixes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {feedback.topFixes.length > 0 ? feedback.topFixes.map((fix, index) => (
            <div key={`${fix.title}-${index}`} className="rounded-md border p-4 text-sm leading-6">
              <div className="font-semibold">{index + 1}. {fix.title}</div>
              {fix.learnerText ? <div className="mt-2 text-muted-foreground">Your text: {fix.learnerText}</div> : null}
              {fix.correctedText ? <div className="mt-1">Better: {fix.correctedText}</div> : null}
              <div className="mt-2">{fix.explanation}</div>
            </div>
          )) : <div className="text-sm text-muted-foreground">No major fixes selected.</div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vocabulary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="mb-2 text-sm font-semibold">Good</div>
            {feedback.vocabulary.good.length > 0 ? (
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {feedback.vocabulary.good.map((item) => <li key={item}>{item}</li>)}
              </ul>
            ) : <div className="text-sm text-muted-foreground">No strong target vocabulary yet.</div>}
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold">Needs Practice</div>
            {feedback.vocabulary.needsPractice.length > 0 ? (
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {feedback.vocabulary.needsPractice.map((item) => <li key={item}>{item}</li>)}
              </ul>
            ) : <div className="text-sm text-muted-foreground">No target vocabulary flagged.</div>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sentence Corrections</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {feedback.sentenceCorrections.length > 0 ? feedback.sentenceCorrections.map((correction, index) => (
            <div key={`${correction.learnerSentence}-${index}`} className="rounded-md border p-4 text-sm leading-6">
              <div className="text-muted-foreground">Your sentence: {correction.learnerSentence}</div>
              <div className="mt-1">Better: {correction.correctedSentence}</div>
              <div className="mt-2">Why: {correction.explanation}</div>
            </div>
          )) : <div className="text-sm text-muted-foreground">No sentence-level corrections selected.</div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Micro-Practice</CardTitle>
        </CardHeader>
        <CardContent>
          {feedback.microPractice.length > 0 ? (
            <ol className="list-decimal space-y-3 pl-5 text-sm leading-6">
              {feedback.microPractice.map((item, index) => (
                <li key={`${item.prompt}-${index}`}>
                  <div>{item.prompt}</div>
                  {item.expectedAnswer ? <div className="text-muted-foreground">Answer: {item.expectedAnswer}</div> : null}
                </li>
              ))}
            </ol>
          ) : <div className="text-sm text-muted-foreground">No micro-practice generated.</div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next Focus</CardTitle>
        </CardHeader>
        <CardContent>
          <TextBox>{feedback.nextFocus}</TextBox>
        </CardContent>
      </Card>
    </div>
  );
}
