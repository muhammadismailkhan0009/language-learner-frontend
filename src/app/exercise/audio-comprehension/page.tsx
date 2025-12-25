'use client'
import { FlowRunner } from "@/lib/custom_lib_ui/flow";
import { ExerciseMode } from "@/lib/types/requests/ExerciseMode";
import { exerciseAudioComprehension } from "./flows/exerciseAudioComprehension";

export default function AudioComprehensionExercise() {
    return (
        /**
         * we want single card on this page which we can listen to, and rate.
         */
        <div className="w-full min-h-screen py-6">
            <FlowRunner
                flow={exerciseAudioComprehension}
                initialData={{
                    mode: ExerciseMode.AUDIO_ONLY,
                    flowData: null
                }}
            />
        </div>
    )
}