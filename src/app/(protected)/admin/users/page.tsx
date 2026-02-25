"use client";

import { useAuth } from "@/lib/auth-context";
import { CheckCircle2, Edit, Key, Shield, Trash2, UserPlus, Users, X, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getUsers, createUser, updateUser, deleteUser } from "@/app/actions/db-actions";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema, updateUserSchema, CreateUserFormValues, UpdateUserFormValues } from "@/lib/schemas";

import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { motion, AnimatePresence } from "framer-motion";

type UserType = {
    id: string;
    name: string;
    username: string;
    role: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
};

export default function AdminUsersPage() {
    const { user, isAuthenticated } = useAuth();
    const [mounted, setMounted] = useState(false);

    const [usersList, setUsersList] = useState<UserType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateUserFormValues | UpdateUserFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(isEditing ? updateUserSchema : createUserSchema) as any,
        defaultValues: {
            name: "",
            username: "",
            password: "",
            role: "user",
            status: "active"
        }
    });

    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        setMounted(true);
        if (isAuthenticated && user?.role === "admin") {
            const delayDebounceFn = setTimeout(() => {
                fetchUsers(searchTerm);
            }, 500);
            return () => clearTimeout(delayDebounceFn);
        }
    }, [isAuthenticated, user, searchTerm]);

    const fetchUsers = async (search = "") => {
        setIsLoading(true);
        try {
            const data = await getUsers(search);
            setUsersList(data as UserType[]);
        } catch {
            toast.error("Failed to fetch users");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (userToEdit?: UserType) => {
        if (userToEdit) {
            setIsEditing(true);
            setSelectedUserId(userToEdit.id);
            reset({
                name: userToEdit.name,
                username: userToEdit.username,
                password: "", // Leave blank, only update if typed
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                role: userToEdit.role as any,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                status: userToEdit.status as any,
            });
        } else {
            setIsEditing(false);
            setSelectedUserId(null);
            reset({
                name: "",
                username: "",
                password: "",
                role: "user",
                status: "active"
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUserId(null);
        setShowPassword(false);
        reset();
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onSubmit = async (data: any) => {
        try {
            if (isEditing && selectedUserId) {
                await updateUser(selectedUserId, data);
                toast.success("User updated successfully");
            } else {
                await createUser(data);
                toast.success("User created successfully");
            }
            await fetchUsers();
            handleCloseModal();
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while saving the user.");
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete user ${name}?`)) {
            try {
                await deleteUser(id);
                toast.success("User deleted successfully");
                await fetchUsers();
            } catch {
                toast.error("An error occurred while deleting the user.");
            }
        }
    };

    if (!mounted || !user) {
        return null;
    }

    return (
        <PageWrapper className="space-y-6 relative">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">User Management</h1>
                    <p className="text-slate-500 mt-1">Manage system access and roles</p>
                </div>
                <div className="flex items-center gap-4">
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                    />
                    <button
                        onClick={() => handleOpenModal()}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shadow-indigo-500/20"
                    >
                        <UserPlus className="w-4 h-4" />
                        Add User
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Users</p>
                            <h3 className="text-2xl font-bold text-slate-900">{usersList.length}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Admins</p>
                            <h3 className="text-2xl font-bold text-slate-900">
                                {usersList.filter(u => u.role === "admin").length}
                            </h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                            <Key className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Active Accounts</p>
                            <h3 className="text-2xl font-bold text-slate-900">
                                {usersList.filter(u => u.status === "active").length}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                    <h2 className="text-lg font-semibold text-slate-900">System Users</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 bg-slate-50/50 uppercase border-b border-slate-200">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-medium">Name</th>
                                <th scope="col" className="px-6 py-4 font-medium">Username</th>
                                <th scope="col" className="px-6 py-4 font-medium">Role</th>
                                <th scope="col" className="px-6 py-4 font-medium">Status</th>
                                <th scope="col" className="px-6 py-4 font-medium">Joined</th>
                                <th scope="col" className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={`skeleton-${i}`}>
                                        <td className="px-6 py-4"><div className="flex items-center gap-3"><Skeleton className="h-8 w-8 rounded-full" /><Skeleton className="h-4 w-24" /></div></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                                        <td className="px-6 py-4 text-right"><Skeleton className="h-6 w-16 ml-auto" /></td>
                                    </tr>
                                ))
                            ) : usersList.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8">
                                        <EmptyState
                                            title="No users found"
                                            description={searchTerm ? "We couldn't find any users matching your search." : "Get started by adding a new user to the system."}
                                            icon={<Users className="w-6 h-6 text-indigo-400" />}
                                            className="border-none bg-transparent py-8"
                                            action={
                                                !searchTerm && (
                                                    <button
                                                        onClick={() => handleOpenModal()}
                                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
                                                    >
                                                        Add your first user &rarr;
                                                    </button>
                                                )
                                            }
                                        />
                                    </td>
                                </tr>
                            ) : (
                                usersList.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-medium text-xs">
                                                    {u.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-slate-900">{u.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                                            {u.username}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={cn(
                                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                                                u.role === "admin" ? "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20" : "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-600/20"
                                            )}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <div className={cn(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    u.status === "active" ? "bg-emerald-500" : "bg-slate-300"
                                                )} />
                                                <span className="text-slate-600 capitalize">{u.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleOpenModal(u)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4 transition-colors p-1 rounded hover:bg-indigo-50"
                                                title="Edit User"
                                            >
                                                <Edit className="w-4 h-4 inline" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(u.id, u.name)}
                                                className="text-red-600 hover:text-red-900 transition-colors p-1 rounded hover:bg-red-50"
                                                title="Delete User"
                                                disabled={u.username === user.username} // Prevent self-deletion
                                            >
                                                <Trash2 className={cn("w-4 h-4 inline", u.username === user.username && "opacity-50")} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden ring-1 ring-slate-200"
                        >
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-900">
                                    {isEditing ? "Edit User" : "Add New User"}
                                </h3>
                                <button type="button" onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        {...register("name")}
                                        className={cn("w-full rounded-lg border text-slate-900 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500", errors.name ? "border-red-500" : "border-slate-300")}
                                    />
                                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message as string}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                                    <input
                                        type="text"
                                        {...register("username")}
                                        className={cn("w-full rounded-lg border text-slate-900 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500", errors.username ? "border-red-500" : "border-slate-300")}
                                    />
                                    {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username.message as string}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Password {isEditing && <span className="text-slate-400 font-normal">(Leave blank to keep current)</span>}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            {...register("password")}
                                            className={cn("w-full rounded-lg border text-slate-900 bg-white px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500", errors.password ? "border-red-500" : "border-slate-300")}
                                            placeholder={isEditing ? "••••••••" : ""}
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                            onClick={() => setShowPassword(!showPassword)}
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message as string}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                                        <select
                                            {...register("role")}
                                            className="w-full rounded-lg border border-slate-300 text-slate-900 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                        <select
                                            {...register("status")}
                                            className="w-full rounded-lg border border-slate-300 text-slate-900 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {isSubmitting ? "Saving..." : "Save User"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </PageWrapper>
    );
}
