import { TeacherOverviewClient } from "./TeacherOverviewClient";
import { getCoursesWithStats } from "../actions";

export const dynamic = "force-dynamic";

export default async function TeacherOverviewPage() {
  // Pre-fetch all courses with full stats server-side
  const courses = await getCoursesWithStats();
  
  return <TeacherOverviewClient initialCourses={courses} />;
} 