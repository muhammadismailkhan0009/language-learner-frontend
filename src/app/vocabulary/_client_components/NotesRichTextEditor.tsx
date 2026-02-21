"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bold, Italic, List, ListOrdered, Underline } from "lucide-react";
import { Button } from "@/components/ui/button";
import { normalizeNotesHtml } from "../notesHtml";

type NotesRichTextEditorProps = {
    value: string;
    onChange: (nextValue: string) => void;
    disabled?: boolean;
    placeholder?: string;
};

function hasVisibleText(html: string): boolean {
    return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, "").trim().length > 0;
}

export default function NotesRichTextEditor({
    value,
    onChange,
    disabled = false,
    placeholder = "Add notes...",
}: NotesRichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    const normalizedValue = useMemo(() => normalizeNotesHtml(value), [value]);
    const showPlaceholder = !isFocused && !hasVisibleText(normalizedValue);

    useEffect(() => {
        document.execCommand("styleWithCSS", false, "false");

        const editor = editorRef.current;
        if (!editor) {
            return;
        }

        if (editor.innerHTML !== normalizedValue) {
            editor.innerHTML = normalizedValue;
        }
    }, [normalizedValue]);

    const syncEditorValue = () => {
        const editor = editorRef.current;
        if (!editor) {
            return;
        }
        onChange(normalizeNotesHtml(editor.innerHTML));
    };

    const runCommand = (command: string) => {
        if (disabled) {
            return;
        }
        const editor = editorRef.current;
        if (!editor) {
            return;
        }

        editor.focus();
        document.execCommand(command);
        syncEditorValue();
    };

    const toolbarButtonClass = "h-8 w-8";

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-1 rounded-md border p-1">
                <Button type="button" variant="ghost" size="icon" className={toolbarButtonClass} onClick={() => runCommand("bold")} disabled={disabled} title="Bold">
                    <Bold className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={toolbarButtonClass}
                    onClick={() => runCommand("italic")}
                    disabled={disabled}
                    title="Italic"
                >
                    <Italic className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={toolbarButtonClass}
                    onClick={() => runCommand("underline")}
                    disabled={disabled}
                    title="Underline"
                >
                    <Underline className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={toolbarButtonClass}
                    onClick={() => runCommand("insertUnorderedList")}
                    disabled={disabled}
                    title="Bulleted list"
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={toolbarButtonClass}
                    onClick={() => runCommand("insertOrderedList")}
                    disabled={disabled}
                    title="Numbered list"
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>
            </div>

            <div className="relative">
                {showPlaceholder ? <div className="pointer-events-none absolute left-3 top-2 text-sm text-muted-foreground">{placeholder}</div> : null}
                <div
                    id="vocabulary-notes"
                    ref={editorRef}
                    contentEditable={!disabled}
                    suppressContentEditableWarning
                    className="min-h-[120px] rounded-md border px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-1 focus:ring-ring"
                    onInput={syncEditorValue}
                    onBlur={() => {
                        setIsFocused(false);
                        syncEditorValue();
                    }}
                    onFocus={() => setIsFocused(true)}
                />
            </div>
        </div>
    );
}
