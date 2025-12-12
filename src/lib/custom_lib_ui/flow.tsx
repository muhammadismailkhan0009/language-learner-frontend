/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */

// src/flow.tsx
import React, { useEffect, useRef, useState } from "react";

// -----------------------------
// Core type definitions
// -----------------------------

/**
 * Shared mutable data for a flow instance.
 * You can refine this to a generic later, e.g. <D>.
 */
export type FlowData = Record<string, any>;

/**
 * Output handle given to UI components.
 * They call output.done(...) when they're finished.
 */
export interface OutputHandle<O = any> {
    emit: (output: O) => void;
}

/**
 * UI step:
 * - Prepares `input` from `data`
 * - Renders `view`
 * - Receives `output` from the component via output.done()
 * - `onOutput` decides next step and can mutate data
 */
export interface UiStep<D extends FlowData = FlowData, I = any, O = any> {
    input: (data: D) => I;
    view: React.ComponentType<{ input: I; output: OutputHandle<O> }>;
    onOutput: (data: D, output: O) => string | void | Promise<string | void>;
}

/**
 * Action (logic) step:
 * - Prepares `args` from `data`
 * - Executes `action` (sync/async)
 * - `onOutput` decides next step and can mutate data
 * - No UI
 */
export interface ActionStep<D extends FlowData = FlowData, I = any, O = any> {
    input: (data: D) => I;
    action: (input: I, data: D) => O | Promise<O>;
    onOutput: (data: D, output: O) => string | void | Promise<string | void>;
}

/**
 * A flow step is either:
 *  - a UI step (has `view`)
 *  - an action step (has `action`)
 * but never both at the same time by convention.
 */
export type FlowStep<D extends FlowData = FlowData> =
    | UiStep<D, any, any>
    | ActionStep<D, any, any>;

/**
 * Map of step names -> step definitions.
 */
export type FlowSteps<D extends FlowData = FlowData> = Record<
    string,
    FlowStep<D>
>;

/**
 * Flow definition object returned by defineFlow.
 */
export interface FlowDefinition<D extends FlowData = FlowData> {
    steps: FlowSteps<D>;
    start: string;
}

/**
 * Options when defining a flow.
 */
export interface DefineFlowOptions {
    start: string;
}

/**
 * Main entry point to define a flow.
 */
export function defineFlow<D extends FlowData = FlowData>(
    steps: FlowSteps<D>,
    options: DefineFlowOptions
): FlowDefinition<D> {
    if (!options.start || !steps[options.start]) {
        throw new Error(
            `defineFlow: 'start' must be provided and exist in steps. Got '${options.start}'.`
        );
    }
    return {
        steps,
        start: options.start,
    };
}




// -----------------------------
// FlowRunner component
// -----------------------------

export interface FlowRunnerProps<D extends FlowData = FlowData> {
    flow: FlowDefinition<D>;
    initialData: D;
}

/**
 * Internal state for the runner:
 * - current step name
 * - data (mutable but we keep it in React state for re-rendering)
 */
interface RunnerState<D extends FlowData> {
    currentStep: string;
    data: D;
}

/**
 * FlowRunner:
 * - drives the current step (UI or action)
 * - manages transitions
 * - renders UI steps
 */
export function FlowRunner<D extends FlowData = FlowData>(
    props: Readonly<FlowRunnerProps<D>>
) {
    const { flow, initialData } = props;

    // We keep data and currentStep in state so React re-renders on change.
    const [state, setState] = useState<RunnerState<D>>({
        currentStep: flow.start,
        data: { ...initialData },
    });

    const [busy, setBusy] = useState(false); // for action steps
    const isMountedRef = useRef(true);

    const { currentStep, data } = state;

    const applyTransition = (nextStepName?: string | void) => {
        if (!isMountedRef.current) return;

        if (nextStepName && flow.steps[nextStepName]) {
            setState((prev) => ({
                ...prev,
                currentStep: nextStepName,
                data: prev.data, // same object reference; but step changes will re-render
            }));
        } else {
            // no next step: just re-render with updated data if any
            setState((prev) => ({
                ...prev,
                data: prev.data,
            }));
        }
    };

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const step = flow.steps[currentStep];

    // If the step is an action (no view), run it in an effect.
    const isActionStep = (step as any).action && !(step as any).view;

    useEffect(() => {
        if (!isActionStep) return;

        const actionStep = step as ActionStep<D, any, any>;

        (async () => {
            try {
                setBusy(true);
                const input = actionStep.input(state.data);
                const output = await actionStep.action(input, state.data);
                const next = await actionStep.onOutput(state.data, output);
                applyTransition(next);
            } catch (e) {
                console.error("FlowRunner action step error:", e);
                // In a real lib, route to a dedicated error step or surface error up
            } finally {
                if (isMountedRef.current) setBusy(false);
            }
        })();
        // We only want to run this when step changes, not on arbitrary data changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStep]);



    if (!step) {
        // Fails fast if flow is misconfigured.
        return (
            <div>
                <strong>FlowRunner error:</strong> Unknown step "{currentStep}".
            </div>
        );
    }

    // Helper to apply a next step (if returned) and ensure React re-renders

    // -----------------------
    // ACTION STEP HANDLING
    // -----------------------



    // If it's an action step, show a simple placeholder or nothing.
    if (isActionStep) {
        // You can customize this: spinner, skeleton, etc.
        return <div>{busy ? "Processing..." : null}</div>;
    }

    // -----------------------
    // UI STEP HANDLING
    // -----------------------

    const uiStep = step as UiStep<D, any, any>;
    const ViewComponent = uiStep.view;
    const input = uiStep.input(data);

    const outputHandle: OutputHandle<any> = {
        emit: async (output) => {
            try {
                const next = await uiStep.onOutput(data, output);
                applyTransition(next);
            } catch (e) {
                console.error("FlowRunner UI step onOutput error:", e);
            }
        },
    };

    return <ViewComponent input={input} output={outputHandle} />;
}


