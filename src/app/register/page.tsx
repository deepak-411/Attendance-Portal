
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import type { Staff } from "@/lib/types";
import { Home, UserPlus } from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";

const staffRoles = [
  { value: "teaching", label: "Teaching Staff" },
  { value: "admin-staff", label: "Admin Staff" },
  { value: "group-c", label: "Group C Staff" },
  { value: "peon", label: "Peon Staff" },
  { value: "hostel-warden-male", label: "Hostel Staff (Warden Male)" },
  { value: "hostel-warden-female", label: "Hostel Staff (Warden Female)" },
  { value: "hostel-nurse", label: "Hostel Staff (Nurse)" },
];

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

const registrationSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  role: z.string({ required_error: "Please select a role" }),
  // Conditional fields for teaching staff
  educationQualification: z.string().optional(),
  post: z.string().optional(),
  teachingClasses: z.array(z.string()).optional(),
}).refine(data => {
    if (data.role === 'teaching') {
        return !!data.educationQualification && !!data.post && !!data.teachingClasses && data.teachingClasses.length > 0;
    }
    return true;
}, {
    message: "Education, post, and classes are required for teaching staff",
    path: ["educationQualification"], // You can choose which field to attach the error to
});


type RegistrationFormValues = z.infer<typeof registrationSchema>;

function generateUniqueId(role: string): string {
  const prefix = role.split('-')[0].substring(0, 5).toUpperCase();
  const timestamp = Date.now().toString().slice(-6);
  return `${prefix}-${timestamp}`;
}

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [newStaffId, setNewStaffId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const defaultRole = searchParams.get('role');

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      role: defaultRole && staffRoles.some(r => r.value === defaultRole) ? defaultRole : undefined,
      educationQualification: "",
      post: "",
      teachingClasses: [],
    },
  });

  const watchedRole = form.watch("role");

  const onSubmit: SubmitHandler<RegistrationFormValues> = (data) => {
    if (!isMounted) return;

    try {
      const staffList: Staff[] = JSON.parse(localStorage.getItem("staffList") || "[]");
      
      const emailExists = staffList.some(staff => staff.email === data.email);
      if (emailExists) {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: "An account with this email already exists.",
        });
        return;
      }
      
      const newStaff: Staff = {
        id: generateUniqueId(data.role),
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        registrationDate: new Date().toISOString(),
        ...(data.role === 'teaching' && {
            educationQualification: data.educationQualification,
            post: data.post,
            teachingClasses: data.teachingClasses,
        }),
      };

      staffList.push(newStaff);
      localStorage.setItem("staffList", JSON.stringify(staffList));
      setNewStaffId(newStaff.id);
      form.reset();

    } catch (error) {
      console.error("Registration error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not complete registration. Please try again.",
      });
    }
  };

  if (!isMounted) return null;

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Button asChild variant="outline" className="absolute top-4 left-4">
          <Link href="/home"><Home className="mr-2 h-4 w-4" /> Home</Link>
        </Button>
        <Card className="w-full max-w-lg shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl"><UserPlus /> Staff Registration</CardTitle>
            <CardDescription>Create your account to start marking attendance.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="john.doe@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role / Department</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {staffRoles.map(role => (
                            <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchedRole === 'teaching' && (
                    <>
                        <FormField
                            control={form.control}
                            name="educationQualification"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Education Qualification</FormLabel>
                                    <FormControl><Input placeholder="e.g., M.Sc. B.Ed." {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="post"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Post</FormLabel>
                                    <FormControl><Input placeholder="e.g., Assistant Teacher" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="teachingClasses"
                            render={() => (
                                <FormItem>
                                    <div className="mb-4">
                                        <FormLabel>Classes You Will Teach</FormLabel>
                                        <FormDescription>
                                            Select all applicable classes.
                                        </FormDescription>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {teachingClassesOptions.map((item) => (
                                        <FormField
                                            key={item.id}
                                            control={form.control}
                                            name="teachingClasses"
                                            render={({ field }) => {
                                                return (
                                                    <FormItem
                                                        key={item.id}
                                                        className="flex flex-row items-start space-x-3 space-y-0"
                                                    >
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.includes(item.id)}
                                                                onCheckedChange={(checked) => {
                                                                    return checked
                                                                        ? field.onChange([...(field.value || []), item.id])
                                                                        : field.onChange(
                                                                            field.value?.filter(
                                                                                (value) => value !== item.id
                                                                            )
                                                                        )
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">
                                                            {item.label}
                                                        </FormLabel>
                                                    </FormItem>
                                                )
                                            }}
                                        />
                                    ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </>
                )}
                
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Registering..." : "Register"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!newStaffId}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Registration Successful!</AlertDialogTitle>
            <AlertDialogDescription>
              Your registration is complete. Your unique Staff ID is:
              <br />
              <strong className="text-primary text-lg my-2 block text-center bg-muted p-2 rounded-md">{newStaffId}</strong>
              Please save this ID. You will need it to mark your attendance.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => router.push('/login')}>Proceed to Login</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

