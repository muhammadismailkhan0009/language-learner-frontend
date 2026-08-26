import {
  WritingPracticeScenarioResponse,
  WritingPracticeSessionResponse,
} from "@/lib/types/responses/WritingPracticeSessionResponse";

export function activeWritingScenario(
  session: WritingPracticeSessionResponse | null,
  activeIndex: number,
): WritingPracticeScenarioResponse | null {
  if (!session?.scenarios.length) return null;
  return session.scenarios[activeIndex] ?? session.scenarios[0] ?? null;
}

export function nextWritingScenarioIndex(current: number, count: number, offset: number): number {
  if (count <= 0) return 0;
  return Math.min(Math.max(current + offset, 0), count - 1);
}
