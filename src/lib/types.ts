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

export interface TimetableEntry {
  class: string;
  time: string;
  subject: string;
  teacher: string;
}

export interface Timetable {
  [className: string]: {
      [timeSlot: string]: {
          teacher: string;
          subject: string;
      };
  };
}