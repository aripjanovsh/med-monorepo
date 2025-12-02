import { redirect } from "next/navigation";
import { ROUTES, url } from "@/constants/route.constants";

type PageProps = {
  params: Promise<{ id: string; visitId: string }>;
};

/**
 * Redirect to the main visit detail page at /cabinet/visits/[id]
 * This route is kept for backwards compatibility.
 */
export default async function PatientVisitDetailPage({ params }: PageProps) {
  const { visitId } = await params;
  redirect(url(ROUTES.VISIT_DETAIL, { id: visitId }));
}
