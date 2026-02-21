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

    const wrapChildren = (node: Element, tagName: "strong" | "em" | "u") => {
        const wrapper = doc.createElement(tagName);
        while (node.firstChild) {
            wrapper.appendChild(node.firstChild);
        }
        node.parentNode?.replaceChild(wrapper, node);
        return wrapper;
    };

    const clean = (node: Element) => {
        const tagName = node.tagName.toLowerCase();

        if (BLOCKED_TAGS.has(tagName)) {
            node.remove();
            return;
        }

        const children = Array.from(node.children);
        children.forEach(clean);

        if (tagName === "div" && node !== root) {
            const paragraph = doc.createElement("p");
            while (node.firstChild) {
                paragraph.appendChild(node.firstChild);
            }
            node.parentNode?.replaceChild(paragraph, node);
            return;
        }

        if (tagName === "span") {
            const style = (node.getAttribute("style") ?? "").toLowerCase();
            const isBold = /font-weight\s*:\s*(bold|[6-9]00)/.test(style);
            const isItalic = /font-style\s*:\s*italic/.test(style);
            const isUnderline = /text-decoration[^;]*:\s*[^;]*underline/.test(style);

            let currentNode: Element | null = node;
            if (isBold) {
                currentNode = wrapChildren(currentNode, "strong");
            }
            if (isItalic) {
                currentNode = wrapChildren(currentNode, "em");
            }
            if (isUnderline) {
                currentNode = wrapChildren(currentNode, "u");
            }

            if (currentNode) {
                Array.from(currentNode.attributes).forEach((attr) => {
                    currentNode?.removeAttribute(attr.name);
                });
            }

            if (!isBold && !isItalic && !isUnderline) {
                const parent = node.parentNode;
                if (!parent) {
                    node.remove();
                    return;
                }
                while (node.firstChild) {
                    parent.insertBefore(node.firstChild, node);
                }
                parent.removeChild(node);
            }
            return;
        }

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
