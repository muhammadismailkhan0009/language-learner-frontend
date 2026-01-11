import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
    SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"

// Menu items.
const items = [
    {
        title: "All Sentences",
        url: "/sentences",
        icon: Inbox,
    },
    {
        title: "Decks To Study",
        url: "/decks",
        icon: Inbox,
    },
    {
        title: "Decks To Revise",
        url: "/revision",
        icon: Inbox,
    },
    {
        title: "Exercise",
        url: "/exercise",
        icon: Inbox,
    },
    
]
export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarGroup>
                <SidebarGroupLabel>Application</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        {items.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild>
                                    <a href={item.url}>
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </Sidebar>
    )
}