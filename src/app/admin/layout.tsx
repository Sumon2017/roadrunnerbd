import { AuthProvider } from "@/context/AuthContext";
import AdminGate from "@/components/Admin/AdminGate";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            <AdminGate>
                {children}
            </AdminGate>
        </AuthProvider>
    );
}
