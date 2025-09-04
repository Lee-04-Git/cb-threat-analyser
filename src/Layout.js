
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Shield, BarChart3, FileSearch, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Analyzer",
    url: createPageUrl("Analyzer"),
    icon: Shield,
  },
  {
    title: "Analytics",
    url: createPageUrl("Analytics"),
    icon: BarChart3,
  },
  {
    title: "History",
    url: createPageUrl("History"),
    icon: FileSearch,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
        <Sidebar className="border-r border-slate-200/60 bg-white/80 backdrop-blur-sm transition-all duration-300">
          <SidebarHeader className="border-b border-slate-200/60 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="overflow-hidden">
                <h2 className="font-semibold text-slate-900 text-lg whitespace-nowrap">ThreatGuard</h2>
                <p className="text-xs text-slate-500 font-medium whitespace-nowrap">Misinformation Analyzer</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-3">
                Analysis Tools
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-xl mb-1 ${
                          location.pathname === item.url 
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm border border-blue-100' 
                            : 'hover:shadow-sm'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-4 h-4" />
                          <span className="font-medium whitespace-nowrap">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200/60 p-4 bg-gradient-to-r from-slate-50/50 to-blue-50/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-slate-300 to-slate-400 rounded-full flex items-center justify-center">
                <span className="text-slate-700 font-semibold text-sm">U</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm truncate">Security Analyst</p>
                <p className="text-xs text-slate-500 truncate">Threat Detection Active</p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col transition-all duration-300">
          <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-6 py-4 flex items-center gap-4">
            <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200" />
            <h1 className="text-xl font-semibold text-slate-900">ThreatGuard</h1>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
