"use client";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReadingParagraphClozeSession } from "@/flows/reading-paragraph-cloze/contracts";
import { ArrowRight, BookOpenText, RefreshCw, Sparkles, Trash2 } from "lucide-react";

type Props = { sessions: ReadingParagraphClozeSession[]; limit: number; busy: string | null;
    generationStatus: string | null;
    onLimit(value: number): void; onRefresh(): void; onCreate(): void; onOpen(id: string): void; onDelete(id: string): void };

export function ClozeSessionList({ sessions, limit, busy, generationStatus, onLimit, onRefresh, onCreate, onOpen, onDelete }: Props) {
    return <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><BookOpenText /> Cloze practice</CardTitle>
            <CardDescription>Choose an unfinished workbook page or generate a fresh one.</CardDescription>
            <CardAction className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onRefresh} disabled={busy !== null}>
                    <RefreshCw data-icon="inline-start" />{busy === "list" ? "Refreshing…" : "Refresh"}
                </Button>
                <Button size="sm" onClick={onCreate} disabled={busy !== null}>
                    <Sparkles data-icon="inline-start" />{busy === "create" ? "Creating…" : "Create session"}
                </Button>
            </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
            {generationStatus ? <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm" role="status">
                {generationStatus}
            </p> : null}
            <div className="flex max-w-52 flex-col gap-2">
                <Label htmlFor="cloze-word-limit">Vocabulary limit</Label>
                <Input id="cloze-word-limit" type="number" min={1} max={300} value={limit}
                    onChange={(event) => onLimit(Number(event.target.value) || 1)} />
            </div>
            {sessions.length === 0 ? <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                {busy === "list" ? "Loading practice sessions…" : "No unfinished cloze sessions. Create one to begin."}
            </div> : <>
                <div className="flex flex-col gap-3 md:hidden">{sessions.map((session) =>
                    <SessionCard key={session.sessionId} session={session} busy={busy} onOpen={onOpen} onDelete={onDelete} />)}</div>
                <div className="hidden md:block"><SessionTable sessions={sessions} busy={busy} onOpen={onOpen} onDelete={onDelete} /></div>
            </>}
        </CardContent>
    </Card>;
}

function stats(session: ReadingParagraphClozeSession) {
    return { blanks: session.paragraphs.reduce((sum, paragraph) => sum + paragraph.blanks.length, 0),
        preview: session.paragraphs[0]?.clozeParagraph.replace(/\{\{[^}]+}}/g, "____") ?? "" };
}
function SessionCard({ session, busy, onOpen, onDelete }: { session: ReadingParagraphClozeSession; busy: string | null; onOpen(id: string): void; onDelete(id: string): void }) {
    const info = stats(session); return <Card><CardHeader><CardTitle>{session.paragraphs[0]?.scenarioLabel ?? "Cloze session"}</CardTitle>
        <CardDescription>{new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(session.createdAt))} · {session.learnerLevel} · {session.paragraphs.length} paragraph(s) · {info.blanks} blanks</CardDescription></CardHeader>
        <CardContent className="flex flex-col gap-3"><p className="line-clamp-2 text-sm text-muted-foreground">{info.preview}</p>
            <div className="flex gap-2"><Button className="flex-1" variant="secondary" onClick={() => onOpen(session.sessionId)} disabled={busy !== null}>Open session<ArrowRight data-icon="inline-end" /></Button>
                <Button variant="outline" size="icon" aria-label="Delete session" onClick={() => onDelete(session.sessionId)} disabled={busy !== null}><Trash2 /></Button></div></CardContent></Card>;
}
function SessionTable({ sessions, busy, onOpen, onDelete }: { sessions: ReadingParagraphClozeSession[]; busy: string | null; onOpen(id: string): void; onDelete(id: string): void }) {
    return <Table><TableHeader><TableRow><TableHead>Scenario</TableHead><TableHead>Created</TableHead><TableHead>Level</TableHead><TableHead>Practice</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
        <TableBody>{sessions.map((session) => { const info = stats(session); return <TableRow key={session.sessionId}>
            <TableCell className="max-w-80"><p className="font-medium">{session.paragraphs[0]?.scenarioLabel ?? "Cloze session"}</p><p className="truncate text-xs text-muted-foreground">{info.preview}</p></TableCell>
            <TableCell>{new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(session.createdAt))}</TableCell>
            <TableCell>{session.learnerLevel}</TableCell><TableCell>{session.paragraphs.length} paragraph(s) · {info.blanks} blanks</TableCell>
            <TableCell className="text-right"><div className="flex justify-end gap-2"><Button size="sm" variant="secondary" onClick={() => onOpen(session.sessionId)} disabled={busy !== null}>Open</Button>
                <Button size="icon-sm" variant="ghost" aria-label="Delete session" onClick={() => onDelete(session.sessionId)} disabled={busy !== null}><Trash2 /></Button></div></TableCell>
        </TableRow>; })}</TableBody></Table>;
}
