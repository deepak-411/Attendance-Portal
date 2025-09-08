
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export default function WelcomePage() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-600 animate-gradient-xy"></div>
         <Image
            src="https://www.edustoke.com/assets/uploads-new/916b0d49-5b7f-4d79-94c1-a45185516924.jpg"
            alt="Holy Writ School and Junior College building"
            data-ai-hint="school building"
            fill
            className="absolute inset-0 object-cover opacity-10"
            priority
        />
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center text-center text-white p-4">
        <style jsx global>{`
          @keyframes gradient-xy {
            0%, 100% {
              background-size: 400% 400%;
              background-position: 0% 50%;
            }
            50% {
              background-size: 200% 200%;
              background-position: 100% 50%;
            }
          }
          .animate-gradient-xy {
            animation: gradient-xy 15s ease infinite;
          }
        `}</style>

        <div className="bg-black/40 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/20">
             <Image 
                src="http://mychildmate.in/AdmissionForm/img/holywritlogo_512_512.png" 
                alt="Holy Writ School Logo" 
                width={80} 
                height={80}
                className="w-20 h-20 mx-auto mb-4"
            />
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Welcome to Holy Writ High School and Junior College
            </h1>
            <p className="mt-4 text-xl md:text-2xl text-white/90">
                Attendance Portal
            </p>

            <div className="mt-10">
                 <Button asChild size="lg" className="text-lg bg-white text-primary hover:bg-gray-200 transition-transform transform hover:scale-105">
                    <Link href="/home">
                        Start <ArrowRight className="ml-2" />
                    </Link>
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
