import { z } from "zod";

// --- Authentication Schemas ---

export const loginSchema = z.object({
    username: z.string().min(1, "Username is required").max(50, "Username is too long"),
    password: z.string().min(1, "Password is required").min(4, "Password must be at least 4 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// --- User Management Schemas ---

export const userRoleSchema = z.enum(["admin", "user"]);

export const createUserSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    username: z.string().min(3, "Username must be at least 3 characters").max(50),
    role: userRoleSchema,
    status: z.enum(["active", "inactive"]).default("active"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const updateUserSchema = createUserSchema.extend({
    password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

// --- Valuation Schemas ---

export const createValuationSchema = z.object({
    clientName: z.string().min(2, "Client name is required"),
    propertyAddress: z.string().min(5, "Property address is required"),
    valuationAmount: z.coerce.number().positive("Valuation amount must be greater than 0"),
    valuationDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format",
    }),
    notes: z.string().optional(),
});

export type CreateValuationFormValues = z.infer<typeof createValuationSchema>;
