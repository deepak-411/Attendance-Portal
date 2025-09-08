
"use client";

import { useEffect, useState } from "react";
import type { AttendanceRecord, Staff } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, UserPlus, Users, ClipboardList, CalendarDays, CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSunday } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";


const staffRoles = [
    { value: "teaching", label: "Teaching Staff" },
    { value: "admin-staff", label: "Admin Staff" },
    { value: "group-c", label: "Group C Staff" },
    { value: "peon", label: "Peon Staff" },
    { value: "hostel-warden-male", label: "Hostel Staff (Warden Male)" },
    { value: "hostel-warden-female", label: "Hostel Staff (Warden Female)" },
    { value: "hostel-nurse", label: "Hostel Staff (Nurse)" },
];

const registrationSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  role: z.string({ required_error: "Please select a role" }),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;
type DailyStatus = 'Present' | 'Absent' | 'Holiday';

function generateUniqueId(role: string): string {
    const prefix = role.split('-')[0].substring(0, 5).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}-${timestamp}`;
}

export default function AdminDashboardPage() {
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [isMounted, setIsMounted] = useState(false);
    const { toast } = useToast();

    const [dailyReport, setDailyReport] = useState<{ staff: Staff; status: DailyStatus; record?: AttendanceRecord }[]>([]);
    const [viewingStaffReport, setViewingStaffReport] = useState<Staff | null>(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date());


    const form = useForm<RegistrationFormValues>({
        resolver: zodResolver(registrationSchema),
        defaultValues: { fullName: "", email: "", role: "" },
    });
    
    useEffect(() => {
        setIsMounted(true);
        try {
            const attendanceData = JSON.parse(localStorage.getItem("attendanceList") || "[]");
            const staffData = JSON.parse(localStorage.getItem("staffList") || "[]");
            setAttendance(attendanceData);
            setStaffList(staffData);
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
            toast({ variant: "destructive", title: "Error loading data" });
        }
    }, []);

    const generateDailyReport = () => {
        const todayStr = format(new Date(), "yyyy-MM-dd");
        const report = staffList.map(staff => {
            const attendanceRecord = attendance.find(
                (rec) => rec.staffId === staff.id && rec.date === todayStr
            );
            return {
                staff,
                status: attendanceRecord ? 'Present' : 'Absent' as DailyStatus,
                record: attendanceRecord,
            };
        });
        setDailyReport(report);
    };

     useEffect(() => {
        if(isMounted) {
            generateDailyReport();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMounted, staffList, attendance]);


    const handleDownloadCSV = (dataToDownload, filename) => {
        if (dataToDownload.length === 0) {
            toast({ variant: "destructive", title: "No data to download" });
            return;
        }
        const headers = Object.keys(dataToDownload[0]);
        const csvRows = [
            headers.join(','),
            ...dataToDownload.map(row => 
                headers.map(header => `"${row[header] ?? 'N/A'}"`).join(',')
            )
        ];
        
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', `${filename}_${format(new Date(), "yyyy-MM-dd")}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast({ title: "Success", description: `${filename} downloaded.` });
    };

    const handleRegisterStaff: SubmitHandler<RegistrationFormValues> = (data) => {
        const currentStaffList: Staff[] = JSON.parse(localStorage.getItem("staffList") || "[]");
        if (currentStaffList.some(s => s.email === data.email)) {
            toast({ variant: "destructive", title: "Error", description: "Email already registered." });
            return;
        }
        const newStaff: Staff = {
            id: generateUniqueId(data.role),
            fullName: data.fullName,
            email: data.email,
            role: data.role,
            registrationDate: new Date().toISOString(),
        };
        const updatedStaffList = [...currentStaffList, newStaff];
        localStorage.setItem("staffList", JSON.stringify(updatedStaffList));
        setStaffList(updatedStaffList);
        toast({ title: "Success", description: `${data.fullName} has been registered with ID: ${newStaff.id}` });
        form.reset();
    };

    const renderStaffMonthlyReport = () => {
        if (!viewingStaffReport) return null;

        const monthStart = startOfMonth(selectedMonth);
        const monthEnd = endOfMonth(selectedMonth);
        const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

        const staffAttendance = attendance.filter(rec => rec.staffId === viewingStaffReport.id);
        
        const reportData = daysInMonth.map(day => {
            const dateStr = format(day, "yyyy-MM-dd");
            let status: DailyStatus = 'Absent';
            if (isSunday(day)) {
                status = 'Holiday';
            } else {
                 const record = staffAttendance.find(rec => rec.date === dateStr);
                 if (record) {
                     status = 'Present';
                 }
            }
            return { date: dateStr, status };
        });

        return (
            <Dialog open={!!viewingStaffReport} onOpenChange={() => setViewingStaffReport(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Monthly Report for {viewingStaffReport.fullName}</DialogTitle>
                        <DialogDescription>
                           Showing attendance for {format(selectedMonth, "MMMM yyyy")}
                        </DialogDescription>
                    </DialogHeader>
                     <div className="max-h-[60vh] overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reportData.map(({date, status}) => (
                                    <TableRow key={date}>
                                        <TableCell>{format(new Date(date), "PPP")}</TableCell>
                                        <TableCell>
                                             <Badge variant={status === 'Present' ? 'default' : status === 'Absent' ? 'destructive' : 'secondary'}>
                                                {status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setViewingStaffReport(null)} variant="outline">Close</Button>
                         <Button onClick={() => handleDownloadCSV(reportData, `${viewingStaffReport.fullName}_report`)}>
                            <Download className="mr-2 h-4 w-4" /> Download
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

    if (!isMounted) return <div className="flex h-full w-full items-center justify-center"><p>Loading dashboard...</p></div>;

    const today = format(new Date(), "yyyy-MM-dd");
    const todayAttendanceCount = attendance.filter(a => a.date === today).length;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{staffList.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Attendance Today</CardTitle>
                        <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{`${todayAttendanceCount} / ${staffList.length}`}</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="daily-report" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="daily-report">Daily Report</TabsTrigger>
                    <TabsTrigger value="monthly-view">Monthly View</TabsTrigger>
                    <TabsTrigger value="attendance">Attendance Log</TabsTrigger>
                    <TabsTrigger value="staff">Staff Management</TabsTrigger>
                </TabsList>

                <TabsContent value="daily-report">
                     <Card>
                        <CardHeader>
                            <CardTitle>Daily Attendance Report ({format(new Date(), "PPP")})</CardTitle>
                            <CardDescription>Automatically generated report of staff attendance for today.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Staff Name</TableHead>
                                        <TableHead>Staff ID</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Time In</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {dailyReport.length > 0 ? dailyReport.map(({ staff, status, record }) => (
                                        <TableRow key={staff.id}>
                                            <TableCell>{staff.fullName}</TableCell>
                                            <TableCell>{staff.id}</TableCell>
                                            <TableCell>{staffRoles.find(r => r.value === staff.role)?.label || staff.role}</TableCell>
                                            <TableCell>
                                                <Badge variant={status === 'Present' ? 'default' : 'destructive'}>
                                                    {status === 'Present' ? <CheckCircle className="mr-2 h-4 w-4" /> : <XCircle className="mr-2 h-4 w-4" />}
                                                    {status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{record ? record.time : "N/A"}</TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow><TableCell colSpan={5} className="text-center">No staff registered to generate a report.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="monthly-view">
                    <Card>
                        <CardHeader>
                             <CardTitle>Monthly Attendance View</CardTitle>
                             <CardDescription>Select a month to view the attendance calendar.</CardDescription>
                        </CardHeader>
                         <CardContent className="flex justify-center">
                            <Calendar
                                mode="single"
                                selected={selectedMonth}
                                onSelect={(day) => day && setSelectedMonth(day)}
                                className="rounded-md border"
                                components={{
                                    DayContent: ({ date }) => {
                                        const dateStr = format(date, "yyyy-MM-dd");
                                        const presentCount = attendance.filter(rec => rec.date === dateStr).length;
                                        const totalStaff = staffList.length;
                                        const isSun = isSunday(date);
                                        return (
                                            <div className="relative flex flex-col items-center justify-center h-full w-full">
                                                <span>{format(date, "d")}</span>
                                                {totalStaff > 0 && !isSun && (
                                                    <span className={`text-xs mt-1 ${presentCount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                        {presentCount}/{totalStaff}
                                                    </span>
                                                )}
                                                {isSun && <span className="text-xs mt-1 text-muted-foreground">Holiday</span>}
                                            </div>
                                        );
                                    }
                                }}
                                month={selectedMonth}
                                onMonthChange={setSelectedMonth}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="attendance">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Full Attendance Log</CardTitle>
                                <CardDescription>View all marked attendance records.</CardDescription>
                            </div>
                            <Button size="sm" onClick={() => handleDownloadCSV(attendance.map(rec => ({
                                staff_id: rec.staffId,
                                name: rec.staffName,
                                role: rec.staffRole,
                                date: rec.date,
                                time: rec.time,
                                lat: rec.location?.latitude,
                                long: rec.location?.longitude
                            })), 'full_attendance_log')}><Download className="mr-2 h-4 w-4" /> Download Full Log</Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Selfie</TableHead>
                                        <TableHead>Staff Name</TableHead>
                                        <TableHead>Staff ID</TableHead>
                                        <TableHead>Date & Time</TableHead>
                                        <TableHead>Role</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {attendance.length > 0 ? attendance.map(rec => (
                                        <TableRow key={rec.id}>
                                            <TableCell>
                                                <Image src={rec.selfieUrl} alt="selfie" width={40} height={40} className="rounded-full" />
                                            </TableCell>
                                            <TableCell>{rec.staffName}</TableCell>
                                            <TableCell>{rec.staffId}</TableCell>
                                            <TableCell>{rec.date} at {rec.time}</TableCell>
                                            <TableCell>{staffRoles.find(r => r.value === rec.staffRole)?.label || rec.staffRole}</TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center">No attendance records found.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="staff">
                    <div className="grid gap-6 md:grid-cols-2">
                         <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><UserPlus /> Register New Staff</CardTitle>
                                <CardDescription>Fill out the form to add a new staff member.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(handleRegisterStaff)} className="space-y-4">
                                        <FormField control={form.control} name="fullName" render={({ field }) => (
                                            <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="email" render={({ field }) => (
                                            <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="role" render={({ field }) => (
                                            <FormItem><FormLabel>Role</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger></FormControl><SelectContent>{staffRoles.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                                        )} />
                                        <Button type="submit" className="w-full">Register Staff</Button>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Registered Staff</CardTitle>
                                <CardDescription>List of all staff members.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                          <TableHead>Name</TableHead>
                                          <TableHead>Staff ID</TableHead>
                                          <TableHead>Role</TableHead>
                                          <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {staffList.length > 0 ? staffList.map(s => (
                                            <TableRow key={s.id}>
                                                <TableCell>{s.fullName}</TableCell>
                                                <TableCell>{s.id}</TableCell>
                                                <TableCell>{staffRoles.find(r => r.value === s.role)?.label || s.role}</TableCell>
                                                <TableCell>
                                                    <Button variant="outline" size="sm" onClick={() => setViewingStaffReport(s)}>
                                                        <CalendarDays className="mr-2 h-4 w-4" />
                                                        View Report
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow><TableCell colSpan={4} className="text-center">No staff registered yet.</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
            {renderStaffMonthlyReport()}
        </div>
    );
}
