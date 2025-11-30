import { ROUTES } from "@/constants/route.constants";
import { redirect } from "next/navigation";

export default function IndexPage() {
  redirect(ROUTES.DASHBOARD);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">datadoc.</h1>
    </div>
  );
}
