"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WritingPracticeSessionSummaryResponse } from "@/lib/types/responses/WritingPracticeSessionSummaryResponse";

type WritingSessionsListProps = {
    sessions: WritingPracticeSessionSummaryResponse[];
    activeSessionId: string | null;
    isLoadingSessions: boolean;
    isLoadingSessionDetail: boolean;
    isCreatingSession: boolean;
    isDeletingSession: boolean;
    onReload: () => void;
    onCreate: () => void;
    onOpen: (sessionId: string) => void;
};

function formatDate(dateValue: string): string {
    if (!dateValue) {
        return "-";
    }

    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) {
        return dateValue;
    }

    return parsed.toLocaleString();
}

export default function WritingSessionsList({
    sessions,
    activeSessionId,
    isLoadingSessions,
    isLoadingSessionDetail,
    isCreatingSession,
    isDeletingSession,
    onReload,
    onCreate,
    onOpen,
}: WritingSessionsListProps) {
    return (
        <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Writing Practice</CardTitle>
                <div className="flex w-full gap-2 sm:w-auto sm:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onReload}
                        disabled={isLoadingSessions || isCreatingSession || isDeletingSession}
                        className="flex-1 sm:flex-none"
                    >
                        {isLoadingSessions ? "Refreshing..." : "Refresh"}
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        onClick={onCreate}
                        disabled={isCreatingSession || isLoadingSessions || isDeletingSession}
                        className="flex-1 sm:flex-none"
                    >
                        {isCreatingSession ? "Creating..." : "Create session"}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {sessions.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                        {isLoadingSessions ? "Loading sessions..." : "No writing sessions yet."}
                    </div>
                ) : (
                    <>
                        <div className="space-y-3 md:hidden">
                            {sessions.map((session) => {
                                const isBusy = activeSessionId === session.sessionId && (isLoadingSessionDetail || isDeletingSession);

                                return (
                                    <div key={session.sessionId} className="space-y-3 rounded-lg border p-4">
                                        <div className="space-y-1">
                                            <p className="break-words font-medium leading-tight">{session.topic}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {session.vocabCount} card{session.vocabCount === 1 ? "" : "s"} to review
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {session.submitted ? "Submitted" : "Draft"}
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="secondary"
                                            className="w-full"
                                            disabled={isBusy || isCreatingSession}
                                            onClick={() => onOpen(session.sessionId)}
                                        >
                                            {isLoadingSessionDetail && activeSessionId === session.sessionId ? "Opening..." : "Open Session"}
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="hidden md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Topic</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Cards</TableHead>
                                        <TableHead>Preview</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sessions.map((session) => {
                                        const isBusy = activeSessionId === session.sessionId && (isLoadingSessionDetail || isDeletingSession);

                                        return (
                                            <TableRow key={session.sessionId}>
                                                <TableCell className="font-medium">{session.topic}</TableCell>
                                                <TableCell>{formatDate(session.createdAt)}</TableCell>
                                                <TableCell>{session.submitted ? "Submitted" : "Draft"}</TableCell>
                                                <TableCell>{session.vocabCount}</TableCell>
                                                <TableCell className="max-w-[20rem] truncate">{session.englishParagraphPreview}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="secondary"
                                                        disabled={isBusy || isCreatingSession}
                                                        onClick={() => onOpen(session.sessionId)}
                                                    >
                                                        {isLoadingSessionDetail && activeSessionId === session.sessionId ? "Opening..." : "Open"}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
