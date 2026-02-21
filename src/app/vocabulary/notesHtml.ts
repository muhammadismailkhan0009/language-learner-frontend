const ALLOWED_TAGS = new Set([
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "ul",
    "ol",
    "li",
    "blockquote",
]);

const BLOCKED_TAGS = new Set(["script", "style", "iframe", "object", "embed"]);

function stripHtml(html: string): string {
    return html
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

export function normalizeNotesHtml(html: string): string {
    const compact = html.trim();
    if (!compact) {
        return "";
    }

    if (stripHtml(compact).length === 0) {
        return "";
    }

    return compact;
}

export function sanitizeNotesHtml(rawHtml: string): string {
    const normalized = normalizeNotesHtml(rawHtml);
    if (!normalized) {
        return "";
    }

    if (typeof window === "undefined" || typeof DOMParser === "undefined") {
        return normalized
            .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
            .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "");
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${normalized}</div>`, "text/html");
    const root = doc.body.firstElementChild as HTMLElement | null;
    if (!root) {
        return "";
    }

    const clean = (node: Element) => {
        const tagName = node.tagName.toLowerCase();

        if (BLOCKED_TAGS.has(tagName)) {
            node.remove();
            return;
        }

        const children = Array.from(node.children);
        children.forEach(clean);

        if (!ALLOWED_TAGS.has(tagName) && node !== root) {
            const parent = node.parentNode;
            if (!parent) {
                node.remove();
                return;
            }

            while (node.firstChild) {
                parent.insertBefore(node.firstChild, node);
            }
            parent.removeChild(node);
            return;
        }

        Array.from(node.attributes).forEach((attr) => {
            node.removeAttribute(attr.name);
        });
    };

    Array.from(root.children).forEach(clean);
    const result = root.innerHTML.trim();
    return normalizeNotesHtml(result);
}
