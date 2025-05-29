import { TeacherOverviewClient } from "./TeacherOverviewClient";
import { getCoursesWithStats } from "../actions";

export const dynamic = "force-dynamic";

export default async function TeacherOverviewPage() {
  // Pre-fetch all courses to improve performance
  const courses = await getCoursesWithStats();
  
  return <TeacherOverviewClient initialCourses={courses} />;
} 