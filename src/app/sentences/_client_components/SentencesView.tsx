"use client";

import { useState, useMemo } from "react";
import { SentenceGroup } from "@/lib/types/responses/Sentence";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OutputHandle } from "@/lib/custom_lib_ui/flow";
import { Label } from "@/components/ui/label";

type SentencesViewProps = {
    input: {
        sentences: SentenceGroup[];
    };
    output: OutputHandle<void>;
}

export default function SentencesView(props: SentencesViewProps) {
    const [selectedScenario, setSelectedScenario] = useState<string>("all");
    const [selectedFunction, setSelectedFunction] = useState<string>("all");

    // Extract unique scenarios and functions
    const scenarios = useMemo(() => {
        const unique = Array.from(new Set(props.input.sentences.map(g => g.scenario)));
        return unique.sort();
    }, [props.input.sentences]);

    const functions = useMemo(() => {
        const allFunctions = new Set<string>();
        props.input.sentences.forEach(group => {
            group.functions.forEach(func => {
                allFunctions.add(func.function);
            });
        });
        return Array.from(allFunctions).sort();
    }, [props.input.sentences]);

    // Filter sentences based on selections
    const filteredSentences = useMemo(() => {
        return props.input.sentences.filter(group => {
            if (selectedScenario !== "all" && group.scenario !== selectedScenario) {
                return false;
            }
            if (selectedFunction !== "all") {
                return group.functions.some(func => func.function === selectedFunction);
            }
            return true;
        }).map(group => {
            if (selectedFunction !== "all") {
                return {
                    ...group,
                    functions: group.functions.filter(func => func.function === selectedFunction)
                };
            }
            return group;
        });
    }, [props.input.sentences, selectedScenario, selectedFunction]);

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
                            onChange={(e) => {
                                setSelectedScenario(e.target.value);
                                setSelectedFunction("all"); // Reset function when scenario changes
                            }}
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
                            onChange={(e) => setSelectedFunction(e.target.value)}
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
                                                    <Table className="w-full">
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead className="w-[48%]">Sentence</TableHead>
                                                                <TableHead className="w-[48%]">Translation</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {func.sentence.map((sentence, sentenceIndex) => (
                                                                <TableRow key={sentenceIndex}>
                                                                    <TableCell className="font-medium align-top pr-4" style={{ 
                                                                        wordBreak: 'break-word', 
                                                                        overflowWrap: 'anywhere',
                                                                        maxWidth: 0,
                                                                        width: '48%'
                                                                    }}>
                                                                        {sentence.sentence}
                                                                    </TableCell>
                                                                    <TableCell className="align-top pl-4 text-muted-foreground" style={{ 
                                                                        wordBreak: 'break-word', 
                                                                        overflowWrap: 'anywhere',
                                                                        maxWidth: 0,
                                                                        width: '48%'
                                                                    }}>
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
                                                                <div className="text-sm font-medium leading-relaxed break-words">
                                                                    {sentence.sentence}
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

