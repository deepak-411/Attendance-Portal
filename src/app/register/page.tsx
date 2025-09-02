"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import type { Staff } from "@/lib/types";
import { Home, UserPlus } from "lucide-react";
import Link from "next/link";

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
    },
  });

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
      };

      staffList.push(newStaff);
      localStorage.setItem("staffList", JSON.stringify(staffList));
      setNewStaffId(newStaff.id);

    } catch (error) {
      console.error("Registration error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not complete registration. Please try again.",
      });
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Button asChild variant="outline" className="absolute top-4 left-4">
          <Link href="/"><Home className="mr-2 h-4 w-4" /> Home</Link>
        </Button>
        <Card className="w-full max-w-md shadow-2xl">
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
