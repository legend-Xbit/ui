import React from "react"
import { createRoot } from "react-dom/client"
import { Direction } from "radix-ui"
import "./index.css"
import { GALLERY } from "./gallery"

import { Button } from "@/registry/new-york-v4/ui/button"
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger,
} from "@/registry/new-york-v4/ui/sheet"
import {
  Sidebar, SidebarContent, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarProvider, SidebarRail, SidebarTrigger,
} from "@/registry/new-york-v4/ui/sidebar"
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from "@/registry/new-york-v4/ui/pagination"
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/registry/new-york-v4/ui/breadcrumb"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubContent,
  DropdownMenuSubTrigger, DropdownMenuTrigger,
} from "@/registry/new-york-v4/ui/dropdown-menu"
import {
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger,
} from "@/registry/new-york-v4/ui/context-menu"
import {
  Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger,
} from "@/registry/new-york-v4/ui/menubar"
import { Calendar } from "@/registry/new-york-v4/ui/calendar"
import {
  Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious,
} from "@/registry/new-york-v4/ui/carousel"
import {
  NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger,
} from "@/registry/new-york-v4/ui/navigation-menu"

const q = new URLSearchParams(location.search)
const dir = (q.get("dir") ?? "rtl") as "rtl" | "ltr"
const scenario = q.get("scenario") ?? "icons"
const side = (q.get("side") ?? "left") as "left" | "right"
document.documentElement.dir = dir
document.documentElement.lang = dir === "rtl" ? "ar" : "en"

const t = dir === "rtl"
  ? { open: "فتح", title: "لوحة جانبية", desc: "وصف اللوحة بالعربية", home: "الرئيسية", docs: "التوثيق", cur: "الصفحة الحالية", more: "المزيد", sub: "قائمة فرعية", item: "عنصر", slide: "شريحة", a: "البداية", b: "المكوّنات", c: "التثبيت" }
  : { open: "Open", title: "Side panel", desc: "Panel description", home: "Home", docs: "Docs", cur: "Current page", more: "More", sub: "Submenu", item: "Item", slide: "Slide", a: "Start", b: "Components", c: "Install" }

function SheetScenario() {
  return (
    <div className="flex gap-4 p-6">
      {(["right", "left"] as const).map((s) => (
        <Sheet key={s}>
          <SheetTrigger asChild><Button data-testid={`open-${s}`}>{t.open} {s}</Button></SheetTrigger>
          <SheetContent side={s} data-testid={`sheet-${s}`}>
            <SheetHeader><SheetTitle>{t.title}</SheetTitle><SheetDescription>{t.desc}</SheetDescription></SheetHeader>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  )
}

function SidebarScenario() {
  return (
    <SidebarProvider>
      <Sidebar side={side} collapsible="offcanvas">
        <SidebarContent>
          <SidebarMenu>
            {[t.home, t.docs, t.more].map((x) => (
              <SidebarMenuItem key={x}><SidebarMenuButton>{x}</SidebarMenuButton></SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 items-center gap-2 border-b px-3"><SidebarTrigger /> <span>{t.cur}</span></header>
        <div className="p-4">{t.desc}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function IconsScenario() {
  return (
    <div className="space-y-6 p-6">
      <Breadcrumb data-testid="breadcrumb">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="#">{t.home}</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink href="#">{t.docs}</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>{t.cur}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Pagination data-testid="pagination">
        <PaginationContent>
          <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
          <PaginationItem><PaginationLink href="#" isActive>1</PaginationLink></PaginationItem>
          <PaginationItem><PaginationLink href="#">2</PaginationLink></PaginationItem>
          <PaginationItem><PaginationNext href="#" /></PaginationItem>
        </PaginationContent>
      </Pagination>
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild><Button variant="outline">{t.more}</Button></DropdownMenuTrigger>
        <DropdownMenuContent data-testid="dd">
          <DropdownMenuItem>{t.item}</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger data-testid="dd-sub">{t.sub}</DropdownMenuSubTrigger>
            <DropdownMenuSubContent><DropdownMenuItem>{t.item}</DropdownMenuItem></DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
      <Calendar mode="single" dir={dir} data-testid="calendar" defaultMonth={new Date(2026, 9, 1)} />
    </div>
  )
}

function MenusScenario() {
  return (
    <div className="space-y-8 p-6">
      <ContextMenu>
        <ContextMenuTrigger data-testid="ctx-area" className="flex h-24 w-64 items-center justify-center rounded border">{t.more}</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>{t.item}</ContextMenuItem>
          <ContextMenuSub><ContextMenuSubTrigger>{t.sub}</ContextMenuSubTrigger>
            <ContextMenuSubContent><ContextMenuItem>{t.item}</ContextMenuItem></ContextMenuSubContent></ContextMenuSub>
        </ContextMenuContent>
      </ContextMenu>
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger data-testid="mb-trigger">{t.more}</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>{t.item}</MenubarItem>
            <MenubarSub><MenubarSubTrigger>{t.sub}</MenubarSubTrigger>
              <MenubarSubContent><MenubarItem>{t.item}</MenubarItem></MenubarSubContent></MenubarSub>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  )
}

function CarouselScenario() {
  const slides = [1, 2, 3, 4]
  return (
    <div className="flex gap-24 p-16">
      <div className="w-64" data-testid="carousel-h-wrap">
        <Carousel opts={{ direction: dir }} data-testid="carousel-h">
          <CarouselContent>
            {slides.map((n) => (
              <CarouselItem key={n}><div className="flex h-24 items-center justify-center rounded border text-2xl" data-slide={n}>{t.slide} {n}</div></CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious /><CarouselNext />
        </Carousel>
      </div>
      <div className="w-48" data-testid="carousel-v-wrap">
        <Carousel orientation="vertical" opts={{ direction: dir }} data-testid="carousel-v">
          <CarouselContent className="h-32">
            {slides.map((n) => (
              <CarouselItem key={n}><div className="flex h-24 items-center justify-center rounded border">{t.slide} {n}</div></CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious /><CarouselNext />
        </Carousel>
      </div>
    </div>
  )
}

function NavScenario() {
  return (
    <div className="p-6">
      <NavigationMenu>
        <NavigationMenuList>
          {[t.a, t.b, t.c].map((x, i) => (
            <NavigationMenuItem key={x}>
              <NavigationMenuTrigger data-testid={`nav-${i}`}>{x}</NavigationMenuTrigger>
              <NavigationMenuContent><div className="h-24 w-72 p-4">{x} — {t.desc}</div></NavigationMenuContent>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
}

const scenarios: Record<string, React.ReactElement> = {
  sheet: <SheetScenario />, sidebar: <SidebarScenario />, icons: <IconsScenario />,
  carousel: <CarouselScenario />, menus: <MenusScenario />, nav: <NavScenario />,
}

const gallery = scenario.startsWith("g:") ? GALLERY[scenario.slice(2)] : undefined
;(window as unknown as { __GALLERY__: string[] }).__GALLERY__ = Object.keys(GALLERY)
if (gallery) document.body.style.overflow = "hidden"

createRoot(document.getElementById("root")!).render(
  <Direction.DirectionProvider dir={dir}>
    {gallery ? <div className="w-full px-6 pt-6">{gallery}</div> : scenarios[scenario]}
  </Direction.DirectionProvider>
)
