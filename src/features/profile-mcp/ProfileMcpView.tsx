"use client";

import { OutputHandle } from "@myriadcodelabs/uiflow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type ProfileMcpViewOutput = { type: "copy" };

type ProfileMcpViewProps = {
    input: {
        isCopying: boolean;
        message: string | null;
        error: string | null;
    };
    output: OutputHandle<ProfileMcpViewOutput>;
};

export default function ProfileMcpView({ input, output }: ProfileMcpViewProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>ChatGPT MCP</CardTitle>
                <CardDescription>
                    Copy your private MCP URL, then add it to ChatGPT to process content-generation requests.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => output.emit({ type: "copy" })}
                    disabled={input.isCopying}
                >
                    {input.isCopying ? "Copying..." : "Copy MCP URL"}
                </Button>
                {input.message ? <p className="text-sm text-muted-foreground" role="status">{input.message}</p> : null}
                {input.error ? <p className="text-sm text-destructive" role="alert">{input.error}</p> : null}
            </CardContent>
        </Card>
    );
}
