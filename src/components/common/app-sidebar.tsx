import {
    Sidebar,
    SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
    SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { BookOpenText, ChevronDown, Headphones, NotebookPen } from "lucide-react"

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarGroup>
                <SidebarGroupLabel>Application</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <a href="/vocabulary">
                                    <BookOpenText />
                                    <span>Vocabulary</span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <details className="group">
                                <SidebarMenuButton asChild>
                                    <summary className="list-none flex items-center gap-2">
                                        <BookOpenText />
                                        <span>Learn</span>
                                        <ChevronDown className="ml-auto size-4 transition-transform group-open:rotate-180" />
                                    </summary>
                                </SidebarMenuButton>
                                <SidebarMenuSub>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton asChild>
                                            <a href="/decks">Decks To Study</a>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton asChild>
                                            <a href="/revision">Decks To Revise</a>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                </SidebarMenuSub>
                            </details>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <details className="group">
                                <SidebarMenuButton asChild>
                                    <summary className="list-none flex items-center gap-2">
                                        <Headphones />
                                        <span>Listen</span>
                                        <ChevronDown className="ml-auto size-4 transition-transform group-open:rotate-180" />
                                    </summary>
                                </SidebarMenuButton>
                                <SidebarMenuSub>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton asChild>
                                            <a href="/listen/flashcards">Flashcards</a>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton asChild>
                                            <a href="/listen">Words</a>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                </SidebarMenuSub>
                            </details>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <a href="/scenarios">
                                    <NotebookPen />
                                    <span>Scenarios</span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <a href="/grammar">
                                    <NotebookPen />
                                    <span>Grammar</span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </Sidebar>
    )
}
