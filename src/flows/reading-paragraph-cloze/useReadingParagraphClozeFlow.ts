"use client";

import { useCallback, useEffect, useState } from "react";
import { allBlanksAnswered, evaluateClozeAnswers } from "./answerEvaluation";
import { ClozeAnswers, ClozeResults, ReadingParagraphClozeSession } from "./contracts";
import { ReadingParagraphClozeBackendPort } from "./ports/ReadingParagraphClozeBackendPort";

export function useReadingParagraphClozeFlow(port: ReadingParagraphClozeBackendPort) {
    const [sessions, setSessions] = useState<ReadingParagraphClozeSession[]>([]);
    const [selectedSession, setSelectedSession] = useState<ReadingParagraphClozeSession | null>(null);
    const [answers, setAnswers] = useState<ClozeAnswers>({});
    const [results, setResults] = useState<ClozeResults | null>(null);
    const [limit, setLimit] = useState(50);
    const [busy, setBusy] = useState<"list" | "create" | "open" | "delete" | null>("list");
    const [error, setError] = useState<string | null>(null);
    const [generationStatus, setGenerationStatus] = useState<string | null>(null);

    const load = useCallback(async () => {
        setBusy("list"); setError(null);
        try { setSessions(await port.list()); }
        catch (cause) { setError(message(cause, "Could not load cloze sessions")); }
        finally { setBusy(null); }
    }, [port]);

    useEffect(() => { void load(); }, [load]);

    const open = async (sessionId: string) => {
        setBusy("open"); setError(null);
        try { setSelectedSession(await port.get(sessionId)); setAnswers({}); setResults(null); }
        catch (cause) { setError(message(cause, "Could not open cloze session")); }
        finally { setBusy(null); }
    };
    const create = async () => {
        setBusy("create"); setError(null); setGenerationStatus(null);
        try { setGenerationStatus(await port.create(limit)); setBusy(null); }
        catch (cause) { setError(message(cause, "Could not create cloze session")); setBusy(null); }
    };
    const remove = async (sessionId: string) => {
        setBusy("delete"); setError(null);
        try { await port.delete(sessionId); setSelectedSession(null); setAnswers({}); setResults(null); await load(); }
        catch (cause) { setError(message(cause, "Could not delete cloze session")); setBusy(null); }
    };
    const submit = async () => {
        if (!selectedSession || !allBlanksAnswered(selectedSession, answers)) return;
        const evaluation = evaluateClozeAnswers(selectedSession, answers);
        setResults(evaluation.results);
        if (evaluation.allCorrect) await remove(selectedSession.sessionId);
    };

    return { sessions, selectedSession, answers, results, limit, busy, error, generationStatus,
        canSubmit: selectedSession ? allBlanksAnswered(selectedSession, answers) : false,
        setLimit: (value: number) => setLimit(Math.max(1, Math.min(300, value))),
        setAnswer: (blankId: string, value: string) => { setAnswers((old) => ({ ...old, [blankId]: value })); setResults(null); },
        load, open, create, remove, submit,
        back: () => { setSelectedSession(null); setAnswers({}); setResults(null); setError(null); },
        clearError: () => setError(null) };
}

function message(cause: unknown, fallback: string) { return cause instanceof Error ? cause.message : fallback; }
