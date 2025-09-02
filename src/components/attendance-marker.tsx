
"use client";

import type { Staff, AttendanceRecord } from "@/lib/types";
import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Loader2, MapPin, Camera, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import Image from "next/image";

type AttendanceMarkerProps = {
  staff: Staff;
};

type Step = "initial" | "locating" | "location_failed" | "camera" | "preview" | "submitting" | "done" | "already_marked";

export function AttendanceMarker({ staff }: AttendanceMarkerProps) {
  const [step, setStep] = useState<Step>("initial");
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const { toast } = useToast();

  const checkExistingAttendance = useCallback(() => {
    if (typeof window === "undefined") return;
    const attendanceList: AttendanceRecord[] = JSON.parse(localStorage.getItem("attendanceList") || "[]");
    const today = format(new Date(), "yyyy-MM-dd");
    const todaysRecord = attendanceList.find(rec => rec.staffId === staff.id && rec.date === today);
    if (todaysRecord) {
      setStep("already_marked");
      setSelfie(todaysRecord.selfieUrl);
    }
  }, [staff.id]);

  useEffect(() => {
    checkExistingAttendance();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [checkExistingAttendance, stream]);

  const handleGetLocation = () => {
    setStep("locating");
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setStep("location_failed");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setStep("camera");
      },
      () => {
        setLocationError("Unable to retrieve your location. Please enable location services.");
        setStep("location_failed");
      },
      { timeout: 10000 }
    );
  };

  const startCamera = async () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera: ", err);
      toast({ variant: "destructive", title: "Camera Error", description: "Could not access camera. Please grant permission." });
      setStep("location_failed"); // Go back to a state where they can retry
    }
  };

  useEffect(() => {
    if (step === "camera") {
      startCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);


  const takeSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (context) {
        context.translate(video.videoWidth, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setSelfie(dataUrl);
        setStep("preview");
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
        }
      }
    }
  };
  
  const retakeSelfie = () => {
    setSelfie(null);
    setStep("camera");
  };

  const handleSubmit = () => {
    setStep("submitting");
    if (!selfie) {
        toast({ variant: "destructive", title: "Error", description: "No selfie was taken." });
        setStep("camera");
        return;
    }
    try {
      const attendanceList: AttendanceRecord[] = JSON.parse(localStorage.getItem("attendanceList") || "[]");
      const newRecord: AttendanceRecord = {
        id: `${staff.id}-${Date.now()}`,
        staffId: staff.id,
        staffName: staff.fullName,
        staffRole: staff.role,
        date: format(new Date(), "yyyy-MM-dd"),
        time: format(new Date(), "HH:mm:ss"),
        location,
        selfieUrl: selfie,
      };
      attendanceList.unshift(newRecord);
      localStorage.setItem("attendanceList", JSON.stringify(attendanceList));
      setTimeout(() => {
        setStep("done");
        toast({ title: "Success", description: "Your attendance has been marked." });
      }, 1000);
    } catch (error) {
      setStep("preview");
      toast({ variant: "destructive", title: "Submission Failed", description: "Could not save your attendance." });
    }
  };

  switch (step) {
    case "initial":
      return <Button onClick={handleGetLocation} className="w-full text-lg p-6">Mark Today's Attendance</Button>;
    case "locating":
      return <div className="text-center p-4 flex items-center justify-center"><Loader2 className="animate-spin mr-2" /> Getting your location...</div>;
    case "location_failed":
      return (
        <div className="text-center p-4 space-y-4">
          <XCircle className="mx-auto text-destructive w-12 h-12" />
          <p className="font-semibold text-lg">Location Error</p>
          <p className="text-sm text-muted-foreground">{locationError}</p>
          <Button onClick={handleGetLocation} className="w-full">Try Again</Button>
        </div>
      );
    case "camera":
      return (
        <div className="space-y-4">
          <div className="text-sm text-center text-green-600 flex items-center justify-center gap-2 font-medium bg-green-50 p-2 rounded-md"><MapPin size={16}/> Location Captured Successfully</div>
          <div className="w-full aspect-square bg-muted rounded-md overflow-hidden relative">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <Button onClick={takeSelfie} className="w-full text-lg p-6"><Camera className="mr-2" /> Take Selfie</Button>
        </div>
      );
    case "preview":
      return (
        <div className="space-y-4">
          <p className="text-center font-semibold">Selfie Preview</p>
          {selfie && <Image src={selfie} alt="Selfie preview" width={400} height={400} className="rounded-md mx-auto" />}
          <div className="flex gap-2">
            <Button onClick={retakeSelfie} variant="outline" className="w-full"><RefreshCw className="mr-2" /> Retake</Button>
            <Button onClick={handleSubmit} className="w-full"><CheckCircle className="mr-2" /> Submit Attendance</Button>
          </div>
        </div>
      );
    case "submitting":
      return <div className="text-center p-4 flex items-center justify-center"><Loader2 className="animate-spin mr-2" /> Submitting...</div>;
    case "done":
      return (
        <div className="text-center p-4 space-y-4">
          <CheckCircle className="mx-auto text-green-500 w-12 h-12" />
          <p className="font-semibold text-lg">Attendance Marked Successfully!</p>
          <p className="text-sm text-muted-foreground">Your attendance for {format(new Date(), "PPP")} is recorded.</p>
        </div>
      );
    case "already_marked":
        return (
            <div className="text-center p-4 space-y-4">
              <CheckCircle className="mx-auto text-primary w-12 h-12" />
              <p className="font-semibold text-lg">Attendance Already Marked</p>
              <p className="text-sm text-muted-foreground">You have already marked your attendance for today.</p>
              {selfie && <Image src={selfie} alt="Today's selfie" width={150} height={150} className="rounded-full mx-auto shadow-lg" />}
            </div>
        );
    default:
      return null;
  }
}
