import { redirect } from "next/navigation";
import { TeacherOverviewClient } from "./TeacherOverviewClient";
import { getCoursesWithStats } from "../actions";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function TeacherOverviewPage() {
  const headersList = await headers();
  const authToken = headersList.get("x-teacher-token");
  const courses = await getCoursesWithStats();
  
  return <TeacherOverviewClient initialCourses={courses} />;
} 