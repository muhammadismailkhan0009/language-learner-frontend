"use client";

import { SentenceGroup } from "@/lib/types/responses/Sentence";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OutputHandle } from "@/lib/custom_lib_ui/flow";

type SentencesViewProps = {
    input: {
        sentences: SentenceGroup[];
    };
    output: OutputHandle<void>;
}

export default function SentencesView(props: SentencesViewProps) {
    return (
        <div className="w-full min-h-screen py-4 px-2 sm:py-6 sm:px-4">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 px-2 sm:px-0">Sentences</h1>
            <div className="space-y-4 sm:space-y-6">
                {props.input.sentences.map((group, groupIndex) => (
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
                                        
                                        {/* Desktop: Table view */}
                                        <div className="hidden md:block">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-1/2">Sentence</TableHead>
                                                        <TableHead className="w-1/2">Translation</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {func.sentence.map((sentence, sentenceIndex) => (
                                                        <TableRow key={sentenceIndex}>
                                                            <TableCell className="font-medium">
                                                                {sentence.sentence}
                                                            </TableCell>
                                                            <TableCell>
                                                                {sentence.translation}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
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
        </div>
    );
}

