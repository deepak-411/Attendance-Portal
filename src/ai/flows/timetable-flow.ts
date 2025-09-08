
'use server';
/**
 * @fileOverview A timetable generation AI agent.
 *
 * - generateTimetable - A function that handles the timetable generation process.
 */

import { ai } from '@/ai/genkit';
import { TimetableInputSchema, TimetableOutputSchema, type TimetableInput, type TimetableOutput } from '@/lib/types';


export async function generateTimetable(input: TimetableInput): Promise<TimetableOutput> {
  return timetableFlow(input);
}

const prompt = ai.definePrompt({
  name: 'timetablePrompt',
  input: { schema: TimetableInputSchema },
  output: { schema: TimetableOutputSchema },
  prompt: `You are an expert school administrator responsible for creating the daily class schedule.
Your task is to generate a complete, conflict-free timetable for all classes based on the list of teachers who are present today.

**Constraints and Rules:**
1.  **School Hours:** The main school day runs from 8:40 AM to 2:20 PM.
2.  **Period Duration:** Each teaching period is exactly 40 minutes.
3.  **Time Slots:**
    - 08:40 AM - 09:20 AM
    - 09:20 AM - 10:00 AM
    - 10:00 AM - 10:40 AM
    - 10:40 AM - 11:20 AM
    - 11:20 AM - 12:00 PM
    - 12:00 PM - 12:40 PM
    - 01:20 PM - 02:00 PM
    - 02:00 PM - 02:20 PM (Note: This is a shorter 20-minute period, assign a core subject if possible.)
4.  **Lunch Break:** There is a mandatory lunch break from 12:40 PM to 01:20 PM for all classes and teachers. The output for this slot MUST be \`{ "teacher": "LUNCH", "subject": "LUNCH" }\`.
5.  **Remedial Classes:** There are two remedial class slots after the main school day: 02:20 PM - 03:00 PM and 03:00 PM - 03:40 PM. These should be assigned to teachers for specific classes, prioritizing core subjects like Maths, Science, and English for older classes (9th and above).
6.  **Teacher Assignments:**
    *   A teacher can only teach ONE class at a time. There must be no double-booking.
    *   Assign teachers to classes they are qualified for, as specified in their \`classes\` list.
    *   Assign teachers to subjects they teach, as specified in their \`subject\` field.
    *   Distribute teachers as evenly as possible. Avoid giving one teacher too many back-to-back classes if others are free.
    *   Every time slot (except lunch) for every class MUST be assigned a teacher. If there are not enough teachers, you must creatively and logically re-assign teachers to subjects they might be able to handle (e.g., a Physics teacher might take a general Science class for a younger grade) or assign a teacher for a 'library' or 'study hall' period. Do not leave any slot unassigned.

**Input Data:**
-   **Present Teachers:** A list of all teachers available for scheduling today, including their name, main subject, and the classes they can teach.
-   **All Classes:** A list of all classes in the school that require a full-day schedule.

**Your Task:**
Generate a JSON object where each key is a class name from the \`allClasses\` list. The value for each key must be a JSON object representing that class's full-day schedule, adhering to all the time slots and rules defined above.

**Present Teachers:**
\`\`\`json
{{{json presentTeachers}}}
\`\`\`

**All Classes to Schedule:**
\`\`\`json
{{{json allClasses}}}
\`\`\`
`,
});

const timetableFlow = ai.defineFlow(
  {
    name: 'timetableFlow',
    inputSchema: TimetableInputSchema,
    outputSchema: TimetableOutputSchema,
  },
  async (input) => {
    // Add a simple validation
    if (!input.presentTeachers || input.presentTeachers.length === 0) {
        throw new Error("Cannot generate a timetable without any present teachers.");
    }
    const { output } = await prompt(input);
    if (!output) {
        throw new Error("The AI model failed to generate a timetable.");
    }
    return output;
  }
);
