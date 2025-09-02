
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { Staff } from "@/lib/types";
import { Home, LogIn } from "lucide-react";
import Link from "next/link";

const loginSchema = z.object({
  staffId: z.string().min(1, "Staff ID is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      staffId: "",
    },
  });

  const onSubmit: SubmitHandler<LoginFormValues> = (data) => {
    if (!isMounted) return;

    try {
      const staffList: Staff[] = JSON.parse(localStorage.getItem("staffList") || "[]");
      const staffId = data.staffId.trim();
      const staffMember = staffList.find(staff => staff.id.toLowerCase() === staffId.toLowerCase());

      if (staffMember) {
        sessionStorage.setItem("staffId", staffMember.id);
        toast({
          title: "Login Successful",
          description: `Welcome, ${staffMember.fullName}!`,
        });
        router.push("/mark-attendance");
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Invalid Staff ID. Please check and try again.",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not log in. Please try again.",
      });
    }
  };
  
  if (!isMounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
       <Button asChild variant="outline" className="absolute top-4 left-4">
          <Link href="/"><Home className="mr-2 h-4 w-4" /> Home</Link>
        </Button>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl"><LogIn /> Staff Attendance Login</CardTitle>
          <CardDescription>Enter your unique Staff ID to mark your attendance.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="staffId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unique Staff ID</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., TEACH-123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Verifying..." : "Proceed to Mark Attendance"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
