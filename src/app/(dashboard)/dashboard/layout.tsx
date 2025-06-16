import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { CustomTrigger } from "@/components/sidebar/custom-trigger";
import { SidebarClient } from "@/components/sidebar/sidebar-client";
import { dashboardConfig } from "@/config/dashboard";
import { requireAuth } from "@/lib/auth";
import { PageLayoutProps } from "@/types";

const DashboardLayout = async ({ children }: PageLayoutProps) => {
  const { profile } = await requireAuth();

  return (
    <SidebarClient>
      <AppSidebar
        mainItems={dashboardConfig.mainSidebarNav}
        supportItems={dashboardConfig.supportSidebarNav}
        userId={profile!.id}
      />

      <main className="flex w-full flex-1 overflow-hidden">
        <div className="p-1 md:p-2">
          <CustomTrigger />
        </div>
        <div className="container px-4 md:px-6 py-4 md:py-6 pr-4 md:pr-6">
          {children}
        </div>
      </main>
    </SidebarClient>
  );
};

export default DashboardLayout;
