
"use client";

import { useEffect, useState } from "react";
import type { AttendanceRecord, Staff } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, UserPlus, Users, ClipboardList } from "lucide-react";
import Image from "next/image";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

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

    const form = useForm<RegistrationFormValues>({
        resolver: zodResolver(registrationSchema),
        defaultValues: { fullName: "", email: "", role: "" },
    });

    const loadData = () => {
        try {
            const attendanceData = JSON.parse(localStorage.getItem("attendanceList") || "[]");
            const staffData = JSON.parse(localStorage.getItem("staffList") || "[]");
            setAttendance(attendanceData);
            setStaffList(staffData);
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
            toast({ variant: "destructive", title: "Error loading data" });
        }
    };

    useEffect(() => {
        setIsMounted(true);
        loadData();
    }, []);

    const handleDownloadCSV = () => {
        if (attendance.length === 0) {
            toast({ variant: "destructive", title: "No data to download" });
            return;
        }
        const headers = ["Staff ID", "Name", "Role", "Date", "Time", "Latitude", "Longitude"];
        const csvRows = [
            headers.join(','),
            ...attendance.map(rec => [
                rec.staffId,
                `"${rec.staffName}"`,
                rec.staffRole,
                rec.date,
                rec.time,
                rec.location?.latitude ?? "N/A",
                rec.location?.longitude ?? "N/A"
            ].join(','))
        ];
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', `attendance_records_${format(new Date(), "yyyy-MM-dd")}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast({ title: "Success", description: "Attendance records downloaded." });
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
                        <div className="text-2xl font-bold">{todayAttendanceCount}</div>
                    </CardContent>
                </Card>
            </div>


            <Tabs defaultValue="attendance" className="w-full">
                <TabsList>
                    <TabsTrigger value="attendance">Attendance Log</TabsTrigger>
                    <TabsTrigger value="staff">Staff Management</TabsTrigger>
                </TabsList>
                <TabsContent value="attendance">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Attendance Records</CardTitle>
                                <CardDescription>View all marked attendance records.</CardDescription>
                            </div>
                            <Button size="sm" onClick={handleDownloadCSV}><Download className="mr-2 h-4 w-4" /> Download CSV</Button>
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
                                          <TableHead>Email</TableHead>
                                          <TableHead>Reg. Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {staffList.length > 0 ? staffList.map(s => (
                                            <TableRow key={s.id}>
                                                <TableCell>{s.fullName}</TableCell>
                                                <TableCell>{s.id}</TableCell>
                                                <TableCell>{staffRoles.find(r => r.value === s.role)?.label || s.role}</TableCell>
                                                <TableCell>{s.email}</TableCell>
                                                <TableCell>{format(new Date(s.registrationDate), "PPP")}</TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow><TableCell colSpan={5} className="text-center">No staff registered yet.</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
