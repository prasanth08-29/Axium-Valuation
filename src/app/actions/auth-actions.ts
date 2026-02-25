"use server";

import { verifyUser } from "./db-actions";
import { createSession, deleteSession, getSession } from "@/lib/session";
import { UserRole } from "@/lib/auth-context";
import { redirect } from "next/navigation";

export async function loginAction(username: string, password: string) {
    const validUser = await verifyUser(username, password);

    if (!validUser) {
        return { error: "Invalid username or password" };
    }

    await createSession(validUser.username, validUser.role as UserRole);
    return { success: true, user: { username: validUser.username, role: validUser.role as UserRole } };
}

export async function logoutAction() {
    await deleteSession();
    redirect("/login");
}

export async function getCurrentUser() {
    return await getSession();
}
