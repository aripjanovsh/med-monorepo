import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SidebarPanel } from "@/components/sidebar-panel/sidebar-panel";

function CleanCabinet({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <SidebarPanel />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}

export default CleanCabinet;
