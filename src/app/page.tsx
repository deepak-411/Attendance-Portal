import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { School, User, Wrench, Shield, Briefcase, Stethoscope, UserCheck, LogIn } from "lucide-react";

const staffCategories = [
  { name: "Teaching Staff", icon: <User className="w-8 h-8 text-primary" />, role: "teaching" },
  { name: "Admin Staff", icon: <Briefcase className="w-8 h-8 text-primary" />, role: "admin-staff" },
  { name: "Group C Staff", icon: <Wrench className="w-8 h-8 text-primary" />, role: "group-c" },
  { name: "Peon Staff", icon: <UserCheck className="w-8 h-8 text-primary" />, role: "peon" },
  { name: "Hostel Staff", icon: <Stethoscope className="w-8 h-8 text-primary" />, role: "hostel" },
];

export default function Home() {
  return (
    <div className="relative min-h-screen w-full bg-background text-foreground">
      <Image
        src="https://picsum.photos/1920/1080"
        alt="Holy Writ High School campus"
        data-ai-hint="school building"
        fill
        className="absolute inset-0 object-cover opacity-10"
        priority
      />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 md:p-8">
        <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <School className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold tracking-tight">HolyWrit Attendance</span>
          </div>
          <Button asChild variant="outline" className="bg-background/80 backdrop-blur-sm">
            <Link href="/admin/login">
              <Shield className="mr-2 h-4 w-4" /> Admin Login
            </Link>
          </Button>
        </header>

        <main className="flex flex-col items-center justify-center text-center mt-20 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-primary-foreground bg-primary/90 px-4 py-2 rounded-lg shadow-lg">
            Welcome to Holy Writ High School and Junior College
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mt-4 font-semibold">
            Attendance Portal
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl">
            {staffCategories.map((category, index) => (
              <Card 
                key={category.name} 
                className="w-full max-w-sm transform hover:scale-105 transition-transform duration-300 shadow-lg animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="items-center p-6">
                  {category.icon}
                  <CardTitle className="mt-4 text-center">{category.name}</CardTitle>
                </CardHeader>
                <div className="p-6 pt-0 flex flex-col gap-4">
                  <Button asChild className="w-full">
                    <Link href={`/register?role=${category.role}`}>
                      <UserCheck className="mr-2 h-4 w-4" /> Register
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" className="w-full">
                    <Link href="/login">
                      <LogIn className="mr-2 h-4 w-4" /> Mark Attendance
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
