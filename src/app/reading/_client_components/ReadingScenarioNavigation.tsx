"use client";

import { Button } from "@/components/ui/button";

type ReadingScenarioNavigationProps = {
    activeIndex: number;
    scenarioCount: number;
    onPrevious: () => void;
    onNext: () => void;
};

export default function ReadingScenarioNavigation({
    activeIndex, scenarioCount, onPrevious, onNext,
}: ReadingScenarioNavigationProps) {
    if (scenarioCount <= 1) return null;
    return (
        <div className="flex items-center justify-between gap-3 rounded-md border p-3">
            <Button type="button" variant="outline" size="sm" disabled={activeIndex === 0} onClick={onPrevious}>
                Previous scenario
            </Button>
            <span className="text-sm font-medium" aria-live="polite">
                Scenario {activeIndex + 1} of {scenarioCount}
            </span>
            <Button
                type="button" variant="outline" size="sm"
                disabled={activeIndex >= scenarioCount - 1} onClick={onNext}
            >
                Next scenario
            </Button>
        </div>
    );
}
