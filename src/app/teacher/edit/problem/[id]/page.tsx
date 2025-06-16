import { EditProblemClient } from "./EditProblemClient";
import { getCourses } from "../../../actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProblemPage({ params }: PageProps) {
  const { id } = await params;
  const problemId = parseInt(id);

  const coursesData = await getCourses();

  return (
    <EditProblemClient 
      problemId={problemId} 
      initialCourses={coursesData}
    />
  );
} 