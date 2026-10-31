import {
  HeartHandshake,
  Sparkles,
  BookOpen,
  ClipboardCheck,
  Building2,
  Users,
  Heart,
  Brain,
  ShieldCheck,
  CalendarCheck,
  Activity,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  heart: Heart,
  sparkles: Sparkles,
  book: BookOpen,
  clipboard: ClipboardCheck,
  building: Building2,
  users: Users,
  brain: Brain,
  shield: ShieldCheck,
  calendar: CalendarCheck,
  activity: Activity,
  handshake: HeartHandshake,
};

export function DynamicIcon({
  name,
  className,
}: {
  name?: string | null;
  className?: string;
}) {
  const Icon = MAP[name ?? "heart"] ?? Heart;
  return <Icon className={className} />;
}
