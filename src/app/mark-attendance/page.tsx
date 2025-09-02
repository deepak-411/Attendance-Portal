"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Staff } from "@/lib/types";
import { AttendanceMarker } from "@/components/attendance-marker";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home } from "lucide-react";

export default function MarkAttendancePage() {
  const router = useRouter();
  const [staff, setStaff] = useState<Staff | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const staffId = sessionStorage.getItem("staffId");
    if (!staffId) {
      router.replace("/login");
      return;
    }

    const staffList: Staff[] = JSON.parse(localStorage.getItem("staffList") || "[]");
    const currentStaff = staffList.find(s => s.id === staffId);

    if (currentStaff) {
      setStaff(currentStaff);
    } else {
      // Staff ID in session is invalid, clear it and redirect
      sessionStorage.removeItem("staffId");
      router.replace("/login");
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!staff) {
    return null; // or a more specific error message page
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <Button asChild variant="outline" className="absolute top-4 left-4">
        <Link href="/"><Home className="mr-2 h-4 w-4" /> Home</Link>
      </Button>
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader>
          <CardTitle>Mark Your Attendance</CardTitle>
          <CardDescription>
            Welcome, <span className="font-bold text-primary">{staff.fullName}</span>! Complete the steps below to mark your attendance for today.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AttendanceMarker staff={staff} />
        </CardContent>
      </Card>
    </div>
  );
}
