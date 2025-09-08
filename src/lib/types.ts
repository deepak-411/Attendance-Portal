import { z } from 'zod';

export interface Staff {
  id: string; // Unique ID, e.g., TEACH-123456
  fullName: string;
  email: string;
  role: string; // 'teaching', 'admin-staff', etc.
  registrationDate: string;

  // Fields for teaching staff
  educationQualification?: string;
  post?: string;
  teachingClasses?: string[];

  // Other fields can be added here for other roles
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  staffRole: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
  location: {
    latitude: number;
    longitude: number;
  } | null;
  selfieUrl: string; // data:image/jpeg;base64,...
}


// Schemas for Timetable Generation
const PresentTeacherSchema = z.object({
    id: z.string(),
    fullName: z.string(),
    subject: z.string().describe("The primary subject the teacher teaches, e.g., 'Maths', 'Physics', 'English'."),
    classes: z.array(z.string()).describe("A list of classes the teacher is qualified to teach, e.g., ['Class 9', 'Class 10'].")
});

export const TimetableInputSchema = z.object({
  presentTeachers: z.array(PresentTeacherSchema).describe("A list of teachers who are present today and available for scheduling."),
  allClasses: z.array(z.string()).describe("A list of all classes that need a schedule, e.g., ['Class 1', 'Class 10', '11th Science']."),
});
export type TimetableInput = z.infer<typeof TimetableInputSchema>;


const TimeSlotSchema = z.object({
  teacher: z.string().describe("Full name of the assigned teacher."),
  subject: z.string().describe("The subject being taught in this slot."),
});

// Dynamically create a schema for a class's daily schedule
const DailyClassScheduleSchema = z.object({
    "08:40 AM - 09:20 AM": TimeSlotSchema,
    "09:20 AM - 10:00 AM": TimeSlotSchema,
    "10:00 AM - 10:40 AM": TimeSlotSchema,
    "10:40 AM - 11:20 AM": TimeSlotSchema,
    "11:20 AM - 12:00 PM": TimeSlotSchema,
    "12:00 PM - 12:40 PM": TimeSlotSchema,
    "12:40 PM - 01:20 PM": z.object({ teacher: z.literal("LUNCH"), subject: z.literal("LUNCH") }),
    "01:20 PM - 02:00 PM": TimeSlotSchema,
    "02:00 PM - 02:20 PM": TimeSlotSchema.describe("Last period of the main school day"),
    "02:20 PM - 03:00 PM": TimeSlotSchema.describe("First remedial class slot."),
    "03:00 PM - 03:40 PM": TimeSlotSchema.describe("Second remedial class slot."),
});

// The final output schema is a map from class name to its schedule
export const TimetableOutputSchema = z.record(z.string(), DailyClassScheduleSchema);
export type TimetableOutput = z.infer<typeof TimetableOutputSchema>;


export interface Timetable {
  [className: string]: {
      [timeSlot: string]: {
          teacher: string;
          subject: string;
      };
  };
}
