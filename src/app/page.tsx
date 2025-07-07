import { getActiveCourses, getArchivedCourses } from "./courses/actions";
import { HomeClient } from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [activeCourses, archivedCourses] = await Promise.all([
    getActiveCourses(),
    getArchivedCourses()
  ]);

  return (
    <HomeClient 
      activeCourses={activeCourses} 
      archivedCourses={archivedCourses}
    />
  );
}
