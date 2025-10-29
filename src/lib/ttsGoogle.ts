function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
    });
}

export async function getAudioUrlForCard(cardId: string, text: string, lang = "en") {
    const cacheKey = `tts_${lang}_${cardId}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) return cached;

    const response = await fetch(`/api/tts?q=${encodeURIComponent(text)}&lang=${lang}`);
    if (!response.ok) throw new Error("TTS fetch failed");

    const blob = await response.blob();
    const base64 = await blobToBase64(blob);
    localStorage.setItem(cacheKey, base64);
    return base64;
}

export async function playCardAudio(cardId: string, text: string, lang = "en") {
    const base64Url = await getAudioUrlForCard(cardId, text, lang);
    const audio = new Audio(base64Url);
    await audio.play();
}
