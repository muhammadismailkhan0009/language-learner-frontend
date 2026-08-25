import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
    test: { environment: "jsdom", setupFiles: ["./vitest.setup.ts"] },
    resolve: {
        alias: {
            "@myriadcodelabs/uiflow": path.resolve(import.meta.dirname, "./node_modules/@myriadcodelabs/uiflow/dist/flow.js"),
            "@": path.resolve(import.meta.dirname, "./src"),
        },
    },
});
