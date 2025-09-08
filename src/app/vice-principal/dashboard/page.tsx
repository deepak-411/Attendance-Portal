
"use client";

import { useEffect, useState } from "react";
import type { Staff, AttendanceRecord, Timetable } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { generateTimetable } from "@/ai/flows/timetable-flow";
import type { TimetableInput, TimetableOutput } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bot, Calendar, Loader2, Send } from "lucide-react";

const teachingClassesOptions = [
    { id: "1", label: "Class 1" },
    { id: "2", label: "Class 2" },
    { id: "3", label: "Class 3" },
    { id: "4", label: "Class 4" },
    { id: "5", label: "Class 5" },
    { id: "6", label: "Class 6" },
    { id: "7", label: "Class 7" },
    { id: "8", label: "Class 8" },
    { id: "9", label: "Class 9" },
    { id: "10", label: "Class 10" },
    { id: "11-science", label: "11th Science" },
    { id: "11-commerce", label: "11th Commerce" },
    { id: "12-science", label: "12th Science" },
    { id: "12-commerce", label: "12th Commerce" },
];

const timeSlots = [
    "08:40 AM - 09:20 AM", "09:20 AM - 10:00 AM", "10:00 AM - 10:40 AM",
    "10:40 AM - 11:20 AM", "11:20 AM - 12:00 PM", "12:00 PM - 12:40 PM",
    "12:40 PM - 01:20 PM", "01:20 PM - 02:00 PM", "02:00 PM - 02:20 PM",
    "02:20 PM - 03:00 PM", "03:00 PM - 03:40 PM"
];

export default function VicePrincipalDashboardPage() {
    const [isMounted, setIsMounted] = useState(false);
    const [presentTeachers, setPresentTeachers] = useState<any[]>([]);
    const [timetable, setTimetable] = useState<TimetableOutput | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isScheduling, setIsScheduling] = useState(false);
    const [isScheduled, setIsScheduled] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setIsMounted(true);
        try {
            const today = format(new Date(), "yyyy-MM-dd");
            const attendanceData: AttendanceRecord[] = JSON.parse(localStorage.getItem("attendanceList") || "[]");
            const staffData: Staff[] = JSON.parse(localStorage.getItem("staffList") || "[]");

            const presentTeachingStaff = attendanceData
                .filter(a => a.date === today && a.staffRole === 'teaching')
                .map(a => {
                    const staffDetails = staffData.find(s => s.id === a.staffId);
                    return {
                        id: staffDetails?.id,
                        fullName: staffDetails?.fullName,
                        subject: staffDetails?.post, // Assuming post is the subject
                        classes: staffDetails?.teachingClasses
                    };
                })
                .filter(t => t.id && t.fullName && t.subject && t.classes);

            setPresentTeachers(presentTeachingStaff);

            const savedTimetable = localStorage.getItem(`timetable_${today}`);
             if (savedTimetable) {
                setTimetable(JSON.parse(savedTimetable));
                setIsScheduled(true);
            }

        } catch (error) {
            console.error("Failed to load data from localStorage", error);
            toast({ variant: "destructive", title: "Error loading data" });
        }
    }, [toast]);
    
    const handleGenerateTimetable = async () => {
        if(presentTeachers.length === 0) {
            toast({ variant: "destructive", title: "Cannot Generate", description: "No teaching staff have marked attendance yet."});
            return;
        }

        setIsGenerating(true);
        setTimetable(null);
        try {
            const input: TimetableInput = {
                presentTeachers: presentTeachers,
                allClasses: teachingClassesOptions.map(c => c.label)
            };
            const result = await generateTimetable(input);
            setTimetable(result);
            toast({ title: "Success", description: "AI has generated the timetable. Review and schedule it." });
        } catch (error) {
            console.error("AI Generation Error:", error);
            toast({ variant: "destructive", title: "AI Error", description: "Could not generate the timetable." });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleScheduleTimetable = () => {
        if (!timetable) {
            toast({ variant: "destructive", title: "Error", description: "No timetable to schedule." });
            return;
        }
        setIsScheduling(true);
        try {
            const today = format(new Date(), "yyyy-MM-dd");
            localStorage.setItem(`timetable_${today}`, JSON.stringify(timetable));
            setTimeout(() => {
                setIsScheduled(true);
                setIsScheduling(false);
                toast({ title: "Scheduled!", description: "Timetable has been published to all relevant staff." });
            }, 1000);
        } catch (error) {
            console.error("Scheduling Error:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not save the schedule." });
            setIsScheduling(false);
        }
    };
    
    if (!isMounted) return <div className="flex h-full w-full items-center justify-center"><p>Loading dashboard...</p></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                 <div>
                    <h1 className="text-3xl font-bold">Timetable Dashboard</h1>
                    <p className="text-muted-foreground">Welcome, Vice Principal Vikash Dalal.</p>
                 </div>
                 <div className="flex gap-2">
                    <Button onClick={handleGenerateTimetable} disabled={isGenerating || presentTeachers.length === 0}>
                        {isGenerating ? <Loader2 className="mr-2 animate-spin" /> : <Bot className="mr-2" />}
                        {timetable ? 'Re-generate Timetable' : 'Generate Timetable'}
                    </Button>
                    {timetable && (
                        <Button onClick={handleScheduleTimetable} disabled={isScheduling || isScheduled}>
                            {isScheduling ? <Loader2 className="mr-2 animate-spin" /> : <Send className="mr-2" />}
                            {isScheduled ? 'Scheduled' : 'Schedule to Staff'}
                        </Button>
                    )}
                 </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Present Teaching Staff</CardTitle>
                    <CardDescription>
                        Today, {format(new Date(), 'PPP')}, {presentTeachers.length} teaching staff members are present and available for scheduling.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {presentTeachers.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {presentTeachers.map(t => (
                                <span key={t.id} className="bg-primary/10 text-primary font-medium px-3 py-1 rounded-full text-sm">{t.fullName}</span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No teachers have marked their attendance yet.</p>
                    )}
                </CardContent>
            </Card>

            {isGenerating && (
                <div className="text-center p-8 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="animate-spin text-primary h-12 w-12" />
                    <p className="font-semibold text-lg">AI is generating the timetable...</p>
                    <p className="text-muted-foreground">This may take a moment. Please wait.</p>
                </div>
            )}
            
            {timetable && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Calendar /> Generated Timetable</CardTitle>
                        <CardDescription>Review the generated schedule below. If it looks good, press the "Schedule to Staff" button above.</CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <Table className="border">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-bold border-r">Time Slot</TableHead>
                                    {teachingClassesOptions.map(c => <TableHead key={c.id} className="font-bold">{c.label}</TableHead>)}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {timeSlots.map(time => (
                                    <TableRow key={time}>
                                        <TableHead className="font-medium border-r">{time}</TableHead>
                                        {teachingClassesOptions.map(c => {
                                            const entry = timetable[c.label]?.[time];
                                            return (
                                                <TableCell key={c.id} className={`border-l ${entry?.subject === 'LUNCH' ? 'bg-muted font-bold' : ''}`}>
                                                    {entry ? (
                                                        entry.subject === 'LUNCH' ? (
                                                            'LUNCH'
                                                        ) : (
                                                            <div>
                                                                <p className="font-bold">{entry.subject}</p>
                                                                <p className="text-xs text-muted-foreground">{entry.teacher}</p>
                                                            </div>
                                                        )
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                            )
                                        })}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {!isGenerating && !timetable && (
                 <Alert>
                    <Bot className="h-4 w-4" />
                    <AlertTitle>Waiting for Action</AlertTitle>
                    <AlertDescription>
                        Press the "Generate Timetable" button to ask the AI to create a schedule based on the currently present teachers.
                    </AlertDescription>
                </Alert>
            )}

        </div>
    );
}
