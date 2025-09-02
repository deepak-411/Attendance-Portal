"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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

const classOptions = [
    { id: 'std-1', label: 'Standard 1' },
    { id: 'std-2', label: 'Standard 2' },
    { id: 'std-3', label: 'Standard 3' },
    { id: 'std-4', label: 'Standard 4' },
    { id: 'std-5', label: 'Standard 5' },
    { id: 'std-6', label: 'Standard 6' },
    { id: 'std-7', label: 'Standard 7' },
    { id: 'std-8', label: 'Standard 8' },
    { id: 'std-9', label: 'Standard 9' },
    { id: 'std-10', label: 'Standard 10' },
    { id: '11-sci', label: '11th Science' },
    { id: '11-com', label: '11th Commerce' },
    { id: '12-sci', label: '12th Science' },
    { id: '12-com', label: '12th Commerce' },
];

const baseSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  role: z.string({ required_error: "Please select a role" }),
});

const teachingStaffSchema = baseSchema.extend({
    educationQualification: z.string().min(2, "Education qualification is required"),
    post: z.string().min(2, "Post is required"),
    teachingClasses: z.array(z.string()).refine(value => value.some(item => item), {
        message: "You have to select at least one class.",
    }),
});

const registrationSchema = z.discriminatedUnion("role", [
    teachingStaffSchema.extend({ role: z.literal("teaching") }),
    baseSchema.extend({ role: z.literal("admin-staff") }),
    baseSchema.extend({ role: z.literal("group-c") }),
    baseSchema.extend({ role: z.literal("peon") }),
    baseSchema.extend({ role: z.literal("hostel-warden-male") }),
    baseSchema.extend({ role: z.literal("hostel-warden-female") }),
    baseSchema.extend({ role: z.literal("hostel-nurse") }),
]);


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

  const defaultRole = searchParams.get('role');

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      role: defaultRole && staffRoles.some(r => r.value === defaultRole) ? defaultRole : undefined,
      // Ensure all possible fields have a default value to avoid uncontrolled to controlled error
      educationQualification: "",
      post: "",
      teachingClasses: [],
    },
  });
  
  useEffect(() => {
    setIsMounted(true);
    // Reset fields when role changes if you want to clear them
    const subscription = form.watch((value, { name }) => {
      if (name === 'role' && value.role !== 'teaching') {
        form.setValue('educationQualification', '');
        form.setValue('post', '');
        form.setValue('teachingClasses', []);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const selectedRole = form.watch("role");

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
        ...('educationQualification' in data && { educationQualification: data.educationQualification }),
        ...('post' in data && { post: data.post }),
        ...('teachingClasses' in data && { teachingClasses: data.teachingClasses }),
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

                {selectedRole === 'teaching' && (
                  <>
                    <FormField
                      control={form.control}
                      name="educationQualification"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Education Qualification</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., M.Sc, B.Ed" {...field} />
                          </FormControl>
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
                          <FormControl>
                            <Input placeholder="e.g., Assistant Teacher" {...field} />
                          </FormControl>
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
                                <div className="grid grid-cols-2 gap-2">
                                {classOptions.map((item) => (
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
