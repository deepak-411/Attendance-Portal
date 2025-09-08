"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import type { Staff, Timetable, TimetableEntry } from "@/lib/types";
import { AttendanceMarker } from "@/components/attendance-marker";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home, CalendarClock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

export default function MarkAttendancePage() {
  const router = useRouter();
  const [staff, setStaff] = useState<Staff | null>(null);
  const [isLoading, setIsLoading] =useState(true);
  const [schedule, setSchedule] = useState<[string, { teacher: string; subject: string; }][]>([]);

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
      if (currentStaff.role === 'teaching') {
        const today = format(new Date(), 'yyyy-MM-dd');
        const timetable: Timetable = JSON.parse(localStorage.getItem(`timetable_${today}`) || '{}');
        const personalSchedule = [];
        for (const className in timetable) {
          for (const timeSlot in timetable[className]) {
            if (timetable[className][timeSlot].teacher === currentStaff.fullName) {
              personalSchedule.push([timeSlot, { ...timetable[className][timeSlot], subject: `${timetable[className][timeSlot].subject} (${className})` }]);
            }
          }
        }
        // Sort schedule by time
        personalSchedule.sort((a, b) => a[0].localeCompare(b[0]));
        setSchedule(personalSchedule);
      }
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
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="shadow-2xl">
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

        {staff.role === 'teaching' && schedule.length > 0 && (
          <Card className="shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CalendarClock /> Your Schedule for Today</CardTitle>
              <CardDescription>Here is your teaching schedule for {format(new Date(), 'PPP')}.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Subject (Class)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedule.map(([time, details]) => (
                    <TableRow key={time}>
                      <TableCell>{time}</TableCell>
                      <TableCell>{details.subject}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
