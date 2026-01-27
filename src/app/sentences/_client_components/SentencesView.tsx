"use client";

import { SentenceGroup } from "@/lib/types/responses/Sentence";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OutputHandle } from "@myriadcodelabs/uiflow";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import { playCardAudio } from "@/lib/ttsGoogle";

export type SentencesViewOutput =
    | { type: "setScenario"; scenario: string }
    | { type: "setFunction"; func: string };

type SentencesViewProps = {
    input: {
        scenarios: string[];
        functions: string[];
        selectedScenario: string;
        selectedFunction: string;
        filteredSentences: SentenceGroup[];
    };
    output: OutputHandle<SentencesViewOutput>;
};

export default function SentencesView({ input, output }: SentencesViewProps) {
    const {
        scenarios,
        functions,
        selectedScenario,
        selectedFunction,
        filteredSentences,
    } = input;

    return (
        <div className="w-full min-h-screen py-4 px-2 sm:py-6 sm:px-4">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 px-2 sm:px-0">Sentences</h1>

            {/* Filter Controls */}
            <div className="mb-6 px-2 sm:px-0">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    <div className="flex-1">
                        <Label htmlFor="scenario-select" className="mb-2 block text-sm font-medium">
                            Scenario
                        </Label>
                        <select
                            id="scenario-select"
                            value={selectedScenario}
                            onChange={(e) =>
                                output.emit({ type: "setScenario", scenario: e.target.value })
                            }
                            className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="all">All Scenarios</option>
                            {scenarios.map((scenario) => (
                                <option key={scenario} value={scenario}>
                                    {scenario}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1">
                        <Label htmlFor="function-select" className="mb-2 block text-sm font-medium">
                            Communication Function
                        </Label>
                        <select
                            id="function-select"
                            value={selectedFunction}
                            onChange={(e) => output.emit({ type: "setFunction", func: e.target.value })}
                            className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="all">All Functions</option>
                            {functions.map((func) => (
                                <option key={func} value={func}>
                                    {func}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {filteredSentences.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    No sentences found matching the selected filters.
                </div>
            ) : (
                <div className="space-y-4 sm:space-y-6">
                    {filteredSentences.map((group, groupIndex) => (
                        <Card key={groupIndex} className="w-full">
                            <CardHeader className="px-3 sm:px-6">
                                <CardTitle className="text-lg sm:text-xl break-words">{group.scenario}</CardTitle>
                            </CardHeader>
                            <CardContent className="px-3 sm:px-6">
                                <div className="space-y-4 sm:space-y-6">
                                    {group.functions.map((func, funcIndex) => (
                                        <div key={funcIndex} className="space-y-2 sm:space-y-3">
                                            <h3 className="text-base sm:text-lg font-semibold text-gray-700 break-words">
                                                {func.function}
                                            </h3>

                                            {/* Desktop: Table view with improved layout */}
                                            <div className="hidden md:block">
                                                <div className="w-full">
                                                    <Table className="w-full table-fixed">
                                                        <colgroup>
                                                            <col style={{ width: "50%" }} />
                                                            <col style={{ width: "50%" }} />
                                                        </colgroup>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead className="border-r">Sentence</TableHead>
                                                                <TableHead className="border-l">Translation</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {func.sentence.map((sentence, sentenceIndex) => (
                                                                <TableRow key={sentenceIndex}>
                                                                    <TableCell
                                                                        className="font-medium align-top pr-4 break-words border-r"
                                                                        style={{
                                                                            wordWrap: "break-word",
                                                                            overflowWrap: "break-word",
                                                                            whiteSpace: "normal",
                                                                            overflow: "hidden",
                                                                        }}
                                                                    >
                                                                        <div className="flex items-start gap-2">
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-6 w-6 shrink-0 mt-0.5"
                                                                                onClick={() =>
                                                                                    playCardAudio(
                                                                                        sentence.id,
                                                                                        sentence.sentence,
                                                                                        "de"
                                                                                    )
                                                                                }
                                                                                title="Play audio"
                                                                            >
                                                                                <Volume2 className="h-4 w-4" />
                                                                            </Button>
                                                                            <span className="flex-1">{sentence.sentence}</span>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell
                                                                        className="align-top pl-4 text-muted-foreground break-words border-l"
                                                                        style={{
                                                                            wordWrap: "break-word",
                                                                            overflowWrap: "break-word",
                                                                            whiteSpace: "normal",
                                                                            overflow: "hidden",
                                                                        }}
                                                                    >
                                                                        {sentence.translation}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </div>

                                            {/* Mobile: Card-based view */}
                                            <div className="md:hidden space-y-3">
                                                {func.sentence.map((sentence, sentenceIndex) => (
                                                    <Card key={sentenceIndex} className="border-l-4 border-l-primary">
                                                        <CardContent className="p-3 space-y-2">
                                                            <div>
                                                                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                                                                    Sentence
                                                                </div>
                                                                <div className="flex items-start gap-2">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-6 w-6 shrink-0 mt-0.5"
                                                                        onClick={() =>
                                                                            playCardAudio(
                                                                                sentence.id,
                                                                                sentence.sentence,
                                                                                "de"
                                                                            )
                                                                        }
                                                                        title="Play audio"
                                                                    >
                                                                        <Volume2 className="h-4 w-4" />
                                                                    </Button>
                                                                    <div className="text-sm font-medium leading-relaxed break-words flex-1">
                                                                        {sentence.sentence}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="border-t pt-2">
                                                                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                                                                    Translation
                                                                </div>
                                                                <div className="text-sm leading-relaxed break-words text-muted-foreground">
                                                                    {sentence.translation}
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
