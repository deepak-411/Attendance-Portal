
"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Wrench, Shield, Briefcase, Stethoscope, UserCheck, LogIn, UserCog } from "lucide-react";

const staffCategories = [
  { name: "Teaching Staff", icon: <User className="w-8 h-8 text-primary" />, href: "/register?role=teaching" },
  { name: "Admin Staff", icon: <Briefcase className="w-8 h-8 text-primary" />, href: "/register?role=admin-staff" },
  { name: "Group C Staff", icon: <Wrench className="w-8 h-8 text-primary" />, href: "/register?role=group-c" },
  { name: "Peon Staff", icon: <UserCheck className="w-8 h-8 text-primary" />, href: "/register?role=peon" },
  { name: "Hostel Staff", icon: <Stethoscope className="w-8 h-8 text-primary" />, href: "/register?role=hostel" },
];

export default function Home() {
  return (
    <div className="relative min-h-screen w-full bg-background text-foreground">
      <Image
        src="https://www.edustoke.com/assets/uploads-new/916b0d49-5b7f-4d79-94c1-a45185516924.jpg"
        alt="Holy Writ School and Junior College building"
        data-ai-hint="school building"
        fill
        className="absolute inset-0 object-cover opacity-10"
        priority
      />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 md:p-8">
        <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
             <Image 
              src="http://mychildmate.in/AdmissionForm/img/holywritlogo_512_512.png" 
              alt="Holy Writ School Logo" 
              width={40} 
              height={40}
              className="w-10 h-10"
            />
            <span className="text-xl font-bold tracking-tight">HolyWrit Attendance</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="bg-background/80 backdrop-blur-sm">
              <Link href="/vice-principal/login">
                <UserCog className="mr-2 h-4 w-4" /> Vice Principal Login
              </Link>
            </Button>
            <Button asChild variant="outline" className="bg-background/80 backdrop-blur-sm">
              <Link href="/admin/login">
                <Shield className="mr-2 h-4 w-4" /> Admin Login
              </Link>
            </Button>
          </div>
        </header>

        <main className="flex flex-col items-center justify-center text-center mt-20">
          <div className="bg-primary/90 px-6 py-3 rounded-lg shadow-lg">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary-foreground">
              Welcome to Holy Writ High School and Junior College
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/90 mt-2 font-semibold">
              Attendance Portal
            </p>
          </div>

          <div className="mt-12 w-full max-w-5xl">
            <Card className="bg-background/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-center text-2xl">Select Your Staff Category</CardTitle>
                <CardDescription>First-time users should register in their respective category.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {staffCategories.map((category) => (
                    <Link key={category.name} href={category.href} className="block group">
                      <Card className="text-center h-full transform hover:scale-105 hover:bg-primary/10 transition-transform duration-300 shadow-lg flex flex-col justify-between">
                        <CardHeader className="items-center p-6">
                          {category.icon}
                          <CardTitle className="mt-4 text-lg">{category.name}</CardTitle>
                        </CardHeader>
                         <CardContent>
                           <Button asChild className="w-full">
                                <span className="flex items-center">
                                    <LogIn className="mr-2 h-4 w-4" /> Register Here
                                </span>
                           </Button>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                  <Link href="/login" className="block group md:col-span-2 lg:col-span-3">
                     <Card className="text-center h-full transform hover:scale-105 hover:bg-primary/10 transition-transform duration-300 shadow-lg flex flex-col justify-center bg-primary/20 border-primary">
                        <CardHeader>
                            <CardTitle className="text-xl text-primary">Already Registered?</CardTitle>
                             <CardDescription>
                                If you have your Staff ID, you can mark your attendance here.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                           <Button variant="secondary" className="w-full max-w-xs mx-auto">
                               <span className="flex items-center">
                                    <UserCheck className="mr-2 h-4 w-4" /> Mark Attendance
                                </span>
                           </Button>
                        </CardContent>
                    </Card>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
