import { NextResponse } from "next/server";
import googleTTS from "google-tts-api";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get("q") ?? "";
    const lang = searchParams.get("lang") ?? "en";
    const slow = searchParams.get("slow") === "true";

    try {
        // Get base64 audio data directly from Google
        const base64 = await googleTTS.getAudioBase64(text, {
            lang,
            slow,
            host: "https://translate.google.com",
            timeout: 10000,
        });

        // Convert to binary buffer
        const audioBuffer = Buffer.from(base64, "base64");

        return new NextResponse(audioBuffer, {
            headers: {
                "Content-Type": "audio/mpeg",
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "public, max-age=86400",
            },
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "TTS generation failed" }, { status: 500 });
    }
}
