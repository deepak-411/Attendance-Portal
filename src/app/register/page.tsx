
import { Suspense } from "react";
import { RegisterPageContent } from "./content";
import { Skeleton } from "@/components/ui/skeleton";

function RegisterPageSkeleton() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-lg">
                <Skeleton className="h-[600px] w-full" />
            </div>
        </div>
    )
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<RegisterPageSkeleton />}>
            <RegisterPageContent />
        </Suspense>
    )
}
