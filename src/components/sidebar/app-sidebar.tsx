import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { DashboardNavProps } from "@/types";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export async function AppSidebar({
  mainItems,
  supportItems,
  userId,
}: DashboardNavProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link href={"/localabo"} className="flex items-center">
          <Image
            src="/icon.svg"
            alt="icon"
            width="50"
            height="50"
            className="shrink-0"
          />
          <span className="font-bold inline-block pl-1 text-4xl my-auto group-data-[collapsible=icon]:hidden">
            LocaLabo
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton tooltip={item.title} asChild>
                    <a
                      href={`${item.href}/${userId}`}
                      className="text-sm font-medium"
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Support</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {supportItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton tooltip={item.title} asChild>
                    <a href={item.href} className="text-sm font-medium">
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <UserButton />
      </SidebarFooter>
    </Sidebar>
  );
}
