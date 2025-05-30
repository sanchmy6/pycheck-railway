import { getCategoriesByCourseId, getCourseById } from "../actions";
import { getProblemsByCategoryId } from "@/app/categories/actions";
import { CourseClientPage } from "./CourseClientPage";

export const dynamic = "force-dynamic";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function CoursePage({ params }: PageProps) {
    const { id } = await params;
    const course = await getCourseById(id);
    const categories = await getCategoriesByCourseId(id);

    const categoriesWithProblems = await Promise.all(
        categories.map(async (category) => {
            const problems = await getProblemsByCategoryId(category.id.toString());
            return { ...category, problems };
        })
    );

    if (!course) {
        return <div className="text-center text-red-500 mt-10">Course not found</div>;
    }

    return (
        <CourseClientPage
            course={{ name: course.name, description: course.description }}
            categoriesWithProblems={categoriesWithProblems}
        />
    );
}
