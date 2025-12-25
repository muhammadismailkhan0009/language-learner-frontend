import { Button } from "@/components/ui/button";

export default function ExercisePage() {
    const exercises = [
        {
            title: "Audio-Only Comprehension",
            route: "/exercise/audio-comprehension",
        },
    ];

    return (
        <div>
            {exercises.map((exercise) => (
                <div key={exercise.title}>
                    <div>{exercise.title}</div>
                    <Button asChild>
                        <a href={exercise.route}>Start Exercise</a>
                    </Button>
                </div>
            ))}
        </div>
    );
}

