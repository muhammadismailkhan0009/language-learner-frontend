// ui/StudyCounterView.tsx
type Props = {
    input: {
        count: number;
    };
};

export function StudyCounterView({ input }: Props) {
    return (
        <div className="text-sm text-muted-foreground">
            Cards studied: <strong>{input.count}</strong>
        </div>
    );
}
