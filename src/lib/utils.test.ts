import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("Utility Functions", () => {
    describe("cn (Tailwind Class Merger)", () => {
        it("should merge basic tailwind classes", () => {
            const result = cn("text-red-500", "bg-white");
            expect(result).toBe("text-red-500 bg-white");
        });

        it("should handle conditional truthy classes", () => {
            const isActive = true;
            const result = cn("base-class", isActive && "active-class");
            expect(result).toBe("base-class active-class");
        });

        it("should handle conditional falsy classes", () => {
            const isActive = false;
            const result = cn("base-class", isActive && "active-class", "other-class");
            expect(result).toBe("base-class other-class");
        });

        it("should correctly merge tailwind conflicts", () => {
            // tailwind-merge should resolve px-2 and px-4 to just px-4
            const result = cn("px-2 py-1", "px-4");
            expect(result).toBe("py-1 px-4");
        });

        it("should handle undefined and null values gracefully", () => {
            const result = cn("text-sm", undefined, null, "font-bold");
            expect(result).toBe("text-sm font-bold");
        });
    });
});
