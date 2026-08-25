export function formatReadingDate(dateValue: string): string {
    if (!dateValue) return "-";
    const parsed = new Date(dateValue);
    return Number.isNaN(parsed.getTime()) ? dateValue : parsed.toLocaleString();
}
