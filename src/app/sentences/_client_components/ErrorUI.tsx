"use client";

import { OutputHandle } from "@/lib/custom_lib_ui/flow";

type ErrorUIProps = {
    input: {
        error: string;
    };
    output: OutputHandle<void>;
}

export default function ErrorUI(props: ErrorUIProps) {
    return (
        <div className="w-full min-h-screen py-6 px-4">
            <div className="text-center text-red-500">Error: {props.input.error}</div>
        </div>
    );
}




