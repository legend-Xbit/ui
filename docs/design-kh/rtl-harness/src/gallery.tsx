import React from "react"
import { AlertCircle, Mail, Search, Star } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/registry/new-york-v4/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/registry/new-york-v4/ui/alert"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/registry/new-york-v4/ui/alert-dialog"
import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/registry/new-york-v4/ui/avatar"
import { Badge } from "@/registry/new-york-v4/ui/badge"
import { Button } from "@/registry/new-york-v4/ui/button"
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@/registry/new-york-v4/ui/button-group"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/registry/new-york-v4/ui/card"
import { Checkbox } from "@/registry/new-york-v4/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/registry/new-york-v4/ui/collapsible"
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut,
} from "@/registry/new-york-v4/ui/command"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/registry/new-york-v4/ui/dialog"
import {
  Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle,
} from "@/registry/new-york-v4/ui/drawer"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/registry/new-york-v4/ui/empty"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/registry/new-york-v4/ui/field"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/registry/new-york-v4/ui/hover-card"
import {
  InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea,
} from "@/registry/new-york-v4/ui/input-group"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/registry/new-york-v4/ui/input-otp"
import { Input } from "@/registry/new-york-v4/ui/input"
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/registry/new-york-v4/ui/item"
import { Kbd, KbdGroup } from "@/registry/new-york-v4/ui/kbd"
import { Label } from "@/registry/new-york-v4/ui/label"
import { NativeSelect, NativeSelectOption } from "@/registry/new-york-v4/ui/native-select"
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/registry/new-york-v4/ui/popover"
import { Progress } from "@/registry/new-york-v4/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/registry/new-york-v4/ui/radio-group"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/registry/new-york-v4/ui/resizable"
import { ScrollArea, ScrollBar } from "@/registry/new-york-v4/ui/scroll-area"
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from "@/registry/new-york-v4/ui/select"
import { Slider } from "@/registry/new-york-v4/ui/slider"
import { Switch } from "@/registry/new-york-v4/ui/switch"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/registry/new-york-v4/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/new-york-v4/ui/tabs"
import { Textarea } from "@/registry/new-york-v4/ui/textarea"
import { Toggle } from "@/registry/new-york-v4/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/registry/new-york-v4/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/registry/new-york-v4/ui/tooltip"

// Identical Arabic copy in LTR and RTL: only direction changes between the two renders,
// so any geometric difference that is not a mirror image comes from the components.
const A = { a: "الرئيسية", b: "المكوّنات", c: "التثبيت", d: "وصف قصير للعنصر بالعربية", e: "إلغاء", f: "حفظ", g: "اسم المستخدم", h: "ملاحظات" }
const W = "w-[420px]"

export const GALLERY: Record<string, React.ReactElement> = {
  accordion: (
    <Accordion type="single" collapsible defaultValue="a" className={W}>
      <AccordionItem value="a"><AccordionTrigger>{A.a}</AccordionTrigger><AccordionContent>{A.d}</AccordionContent></AccordionItem>
      <AccordionItem value="b"><AccordionTrigger>{A.b}</AccordionTrigger><AccordionContent>{A.d}</AccordionContent></AccordionItem>
    </Accordion>
  ),
  alert: (
    <Alert className={W}><AlertCircle /><AlertTitle>{A.a}</AlertTitle><AlertDescription>{A.d}</AlertDescription></Alert>
  ),
  "alert-dialog": (
    <AlertDialog defaultOpen>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>{A.a}</AlertDialogTitle><AlertDialogDescription>{A.d}</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel>{A.e}</AlertDialogCancel><AlertDialogAction>{A.f}</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  avatar: (
    <div className="flex items-center gap-4">
      <Avatar><AvatarFallback>م</AvatarFallback><AvatarBadge /></Avatar>
      <AvatarGroup><Avatar><AvatarFallback>أ</AvatarFallback></Avatar><Avatar><AvatarFallback>ب</AvatarFallback></Avatar><AvatarGroupCount>+3</AvatarGroupCount></AvatarGroup>
    </div>
  ),
  badge: <div className="flex gap-2"><Badge><Star />{A.a}</Badge><Badge variant="outline">{A.b}</Badge></div>,
  "button-group": (
    <ButtonGroup><Button variant="outline">{A.a}</Button><Button variant="outline">{A.b}</Button><ButtonGroupSeparator /><ButtonGroupText>{A.c}</ButtonGroupText></ButtonGroup>
  ),
  button: <div className="flex gap-2"><Button><Mail />{A.a}</Button><Button variant="outline">{A.b}<Mail /></Button></div>,
  card: (
    <Card className={W}>
      <CardHeader><CardTitle>{A.a}</CardTitle><CardDescription>{A.d}</CardDescription><CardAction><Button size="sm" variant="outline">{A.f}</Button></CardAction></CardHeader>
      <CardContent>{A.d}</CardContent>
      <CardFooter className="justify-between"><Button variant="ghost">{A.e}</Button><Button>{A.f}</Button></CardFooter>
    </Card>
  ),
  checkbox: <div className="flex items-center gap-2"><Checkbox id="c1" defaultChecked /><Label htmlFor="c1">{A.a}</Label></div>,
  collapsible: (
    <Collapsible defaultOpen className={W}><CollapsibleTrigger asChild><Button variant="outline">{A.a}</Button></CollapsibleTrigger><CollapsibleContent className="pt-2">{A.d}</CollapsibleContent></Collapsible>
  ),
  command: (
    <Command className={`${W} border`}>
      <CommandInput placeholder={A.a} />
      <CommandList>
        <CommandEmpty>{A.d}</CommandEmpty>
        <CommandGroup heading={A.b}><CommandItem><Mail />{A.a}<CommandShortcut>⌘K</CommandShortcut></CommandItem><CommandItem>{A.c}</CommandItem></CommandGroup>
        <CommandSeparator />
      </CommandList>
    </Command>
  ),
  dialog: (
    <Dialog defaultOpen>
      <DialogContent>
        <DialogHeader><DialogTitle>{A.a}</DialogTitle><DialogDescription>{A.d}</DialogDescription></DialogHeader>
        <DialogFooter><Button variant="outline">{A.e}</Button><Button>{A.f}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  drawer: (
    <Drawer defaultOpen>
      <DrawerContent>
        <DrawerHeader><DrawerTitle>{A.a}</DrawerTitle><DrawerDescription>{A.d}</DrawerDescription></DrawerHeader>
        <DrawerFooter><Button>{A.f}</Button><Button variant="outline">{A.e}</Button></DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
  empty: (
    <Empty className={W}><EmptyHeader><EmptyMedia variant="icon"><Search /></EmptyMedia><EmptyTitle>{A.a}</EmptyTitle><EmptyDescription>{A.d}</EmptyDescription></EmptyHeader></Empty>
  ),
  field: (
    <FieldGroup className={W}>
      <Field><FieldLabel htmlFor="f1">{A.g}</FieldLabel><Input id="f1" defaultValue={A.a} /><FieldDescription>{A.d}</FieldDescription></Field>
      <Field orientation="horizontal"><Checkbox id="f2" /><FieldLabel htmlFor="f2">{A.h}</FieldLabel></Field>
    </FieldGroup>
  ),
  "hover-card": (
    <HoverCard defaultOpen><HoverCardTrigger asChild><Button variant="link">{A.a}</Button></HoverCardTrigger><HoverCardContent>{A.d}</HoverCardContent></HoverCard>
  ),
  "input-group": (
    <div className={`${W} space-y-4`}>
      <InputGroup><InputGroupAddon><Search /></InputGroupAddon><InputGroupInput placeholder={A.a} /><InputGroupAddon align="inline-end"><InputGroupText>12</InputGroupText></InputGroupAddon></InputGroup>
      <InputGroup><InputGroupInput defaultValue={A.b} /><InputGroupAddon align="inline-end"><InputGroupButton>{A.f}</InputGroupButton></InputGroupAddon></InputGroup>
      <InputGroup><InputGroupTextarea placeholder={A.h} /><InputGroupAddon align="block-end"><InputGroupButton>{A.f}</InputGroupButton></InputGroupAddon></InputGroup>
    </div>
  ),
  "input-otp": (
    <InputOTP maxLength={6} defaultValue="123456"><InputOTPGroup><InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} /></InputOTPGroup><InputOTPSeparator /><InputOTPGroup><InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} /></InputOTPGroup></InputOTP>
  ),
  input: <div className={`${W} space-y-3`}><Input defaultValue={A.a} /><Input type="file" /></div>,
  item: (
    <Item variant="outline" className={W}><ItemMedia variant="icon"><Mail /></ItemMedia><ItemContent><ItemTitle>{A.a}</ItemTitle><ItemDescription>{A.d}</ItemDescription></ItemContent><ItemActions><Button size="sm">{A.f}</Button></ItemActions></Item>
  ),
  kbd: <KbdGroup><Kbd>⌘</Kbd><Kbd>K</Kbd></KbdGroup>,
  label: <Label>{A.g}</Label>,
  "native-select": (
    <NativeSelect className={W}><NativeSelectOption value="a">{A.a}</NativeSelectOption><NativeSelectOption value="b">{A.b}</NativeSelectOption></NativeSelect>
  ),
  popover: (
    <Popover defaultOpen><PopoverTrigger asChild><Button variant="outline">{A.a}</Button></PopoverTrigger><PopoverContent><PopoverHeader><PopoverTitle>{A.a}</PopoverTitle><PopoverDescription>{A.d}</PopoverDescription></PopoverHeader></PopoverContent></Popover>
  ),
  progress: <Progress value={30} className={W} />,
  "radio-group": (
    <RadioGroup defaultValue="a">{["a", "b"].map((v) => (<div key={v} className="flex items-center gap-2"><RadioGroupItem value={v} id={`r-${v}`} /><Label htmlFor={`r-${v}`}>{v === "a" ? A.a : A.b}</Label></div>))}</RadioGroup>
  ),
  resizable: (
    <ResizablePanelGroup direction="horizontal" className={`${W} h-32 rounded border`}>
      <ResizablePanel defaultSize={30}><div className="p-2">{A.a}</div></ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={70}><div className="p-2">{A.b}</div></ResizablePanel>
    </ResizablePanelGroup>
  ),
  "scroll-area": (
    <ScrollArea className={`${W} h-32 rounded border`}><div className="w-[600px] space-y-2 p-3">{Array.from({ length: 12 }, (_, i) => <div key={i}>{A.d} {i}</div>)}</div><ScrollBar orientation="horizontal" /></ScrollArea>
  ),
  select: (
    <Select defaultOpen defaultValue="a">
      <SelectTrigger className="w-[260px]"><SelectValue /></SelectTrigger>
      <SelectContent><SelectGroup><SelectLabel>{A.b}</SelectLabel><SelectItem value="a">{A.a}</SelectItem><SelectItem value="b">{A.b}</SelectItem></SelectGroup></SelectContent>
    </Select>
  ),
  slider: <Slider defaultValue={[30]} max={100} className={W} />,
  switch: <div className="flex items-center gap-2"><Switch id="s1" defaultChecked /><Label htmlFor="s1">{A.a}</Label><Switch id="s2" /></div>,
  table: (
    <Table className={W}><TableCaption>{A.d}</TableCaption><TableHeader><TableRow><TableHead>{A.a}</TableHead><TableHead className="text-end">{A.b}</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>{A.c}</TableCell><TableCell className="text-end">42</TableCell></TableRow></TableBody></Table>
  ),
  tabs: (
    <Tabs defaultValue="a" className={W}><TabsList><TabsTrigger value="a">{A.a}</TabsTrigger><TabsTrigger value="b">{A.b}</TabsTrigger><TabsTrigger value="c">{A.c}</TabsTrigger></TabsList><TabsContent value="a">{A.d}</TabsContent></Tabs>
  ),
  textarea: <Textarea className={W} defaultValue={A.d} />,
  toggle: <Toggle variant="outline"><Star />{A.a}</Toggle>,
  "toggle-group": (
    <ToggleGroup type="single" variant="outline" defaultValue="a"><ToggleGroupItem value="a">{A.a}</ToggleGroupItem><ToggleGroupItem value="b">{A.b}</ToggleGroupItem><ToggleGroupItem value="c">{A.c}</ToggleGroupItem></ToggleGroup>
  ),
  tooltip: (
    <TooltipProvider><Tooltip defaultOpen><TooltipTrigger asChild><Button variant="outline">{A.a}</Button></TooltipTrigger><TooltipContent>{A.d}</TooltipContent></Tooltip></TooltipProvider>
  ),
}
