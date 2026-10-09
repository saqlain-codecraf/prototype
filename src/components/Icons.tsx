// App icon set: Lucide line icons (24×24 grid, 2px stroke, round caps/joins, no fill).
// Names are kept stable so screens don't need to know which library backs them.
import type { ComponentType } from 'react'
import {
  House, BriefcaseBusiness, MessageCircle, ChartColumn, User, MapPin, Clock, Star, ChevronRight as LChevronRight, ChevronLeft as LChevronLeft,
  ChevronDown as LChevronDown, ChevronUp as LChevronUp, Plus, X, Check, CircleCheck, Search, Camera, Upload, Wrench, ShieldCheck, Bell,
  Navigation, Phone, CircleAlert, RefreshCw, Banknote, ArrowUp, SlidersHorizontal, Activity, Pencil, Info,
  Undo2, Timer, Hourglass, Sun, TriangleAlert, Zap, Snowflake, Sunrise, Sunset, Sprout, TreeDeciduous, Leaf,
  CookingPot, PartyPopper, PaintRoller, Target, Flag, Building2, Landmark, Store, Hand, Users, Wallet, Droplets,
  CreditCard, FileText, CalendarDays, ClipboardList, ScrollText, Megaphone, Smartphone, Hammer, FolderOpen, Moon,
  Rocket, Car, LogOut, Ban, Footprints, Bath, ShoppingBag, LifeBuoy, Handshake, Toolbox, SprayCan, IdCard, Image, Circle, CircleDot,
  type LucideProps,
} from 'lucide-react'

type IconProps = { className?: string; size?: number; strokeWidth?: number }
const wrap = (I: ComponentType<LucideProps>) =>
  ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => <I size={size} className={className} strokeWidth={strokeWidth} absoluteStrokeWidth={false}/>

export const HomeIcon      = wrap(House)
export const BriefcaseIcon = wrap(BriefcaseBusiness)
export const MessageIcon   = wrap(MessageCircle)
export const BarChartIcon  = wrap(ChartColumn)
export const UserIcon      = wrap(User)
export const MapPinIcon    = wrap(MapPin)
export const ClockIcon     = wrap(Clock)
export const StarIcon      = wrap(Star)
export const ChevronRight  = wrap(LChevronRight)
export const ChevronLeft   = wrap(LChevronLeft)
export const ChevronDown   = wrap(LChevronDown)
export const ChevronUp     = wrap(LChevronUp)
export const PlusIcon      = wrap(Plus)
export const XIcon         = wrap(X)
export const CheckIcon     = wrap(Check)
export const CheckCircle   = wrap(CircleCheck)
export const SearchIcon    = wrap(Search)
export const CameraIcon    = wrap(Camera)
export const UploadIcon    = wrap(Upload)
export const ToolIcon      = wrap(Wrench)
export const ShieldIcon    = wrap(ShieldCheck)
export const BellIcon      = wrap(Bell)
export const NavigateIcon  = wrap(Navigation)
export const PhoneIcon     = wrap(Phone)
export const AlertCircle   = wrap(CircleAlert)
export const RefreshIcon   = wrap(RefreshCw)
export const DollarIcon    = wrap(Banknote)
export const ArrowUpIcon   = wrap(ArrowUp)
export const SlidersIcon   = wrap(SlidersHorizontal)
export const ActivityIcon  = wrap(Activity)
export const EditIcon      = wrap(Pencil)
export const InfoIcon      = wrap(Info)

/** Filled star for ratings (the one intentional fill, so ratings read at a glance). */
export function StarFilled({ size = 14, className = '' }: { size?: number; className?: string }) {
  return <Star size={size} className={className} fill="currentColor" strokeWidth={1.5}/>
}

export function OnlineIcon({ active }: { active: boolean }) {
  return (
    <span className={`inline-block w-3 h-3 rounded-full ring-4 ${active ? 'bg-success ring-success/20' : 'bg-subtle ring-line'}`}/>
  )
}

// Emoji keys used in data (categories, places, toasts, activity…) → line icons.
const GLYPHS: Record<string, ComponentType<LucideProps>> = {
  '💧': Droplets, '⚡': Zap, '🌱': Sprout, '🧹': SprayCan, '🎨': PaintRoller, '🪚': Hammer, '🔨': Toolbox, '❄️': Snowflake,
  '🏠': House, '🏡': House, '🏢': Building2, '👪': Users, '📍': MapPin, '🏬': Store, '🛒': ShoppingBag,
  '💵': Banknote, '💸': Banknote, '📱': Smartphone, '💚': Wallet, '💳': CreditCard, '💰': Wallet, '🏦': Landmark,
  '🌿': Leaf, '🍂': Leaf, '🌳': TreeDeciduous, '🚰': Droplets, '🛁': Bath, '🍳': CookingPot,
  '🌅': Sunrise, '☀️': Sun, '🌇': Sunset, '😴': Moon,
  '🧰': Toolbox, '🔧': Wrench, '🛠️': Wrench, '🛡️': ShieldCheck, '💬': MessageCircle, '⭐': Star, '✅': CircleCheck,
  '📊': ChartColumn, '🎉': PartyPopper, '🤝': Handshake, '🚶': Footprints, '📣': Megaphone, '🚫': Ban, '🛟': LifeBuoy,
  '📝': FileText, '📄': FileText, '📜': ScrollText, '🪪': IdCard, '🚗': Car, '👋': Hand, '⏳': Hourglass, '⏱': Timer,
  '🎯': Target, '📅': CalendarDays, '🗓️': CalendarDays, '🔍': Search, '📋': ClipboardList, '🏁': Flag, '🗂️': FolderOpen,
  '🔔': Bell, '↩️': Undo2, '🚀': Rocket, '⚠️': TriangleAlert, '📷': Camera, '🚪': LogOut, '🟢': CircleDot, '⚪': Circle,
}

/** Renders the line icon for an emoji key; sizes to the surrounding font-size unless `size` is given. */
export function Glyph({ e, size = '1.15em', className = '', strokeWidth = 2 }: { e?: string; size?: number | string; className?: string; strokeWidth?: number }) {
  const I = (e && GLYPHS[e]) || (e && e.startsWith('blob:') ? null : Image)
  if (!I) return null
  return <I size={size} className={`inline-block flex-shrink-0 ${className}`} strokeWidth={strokeWidth} aria-hidden/>
}
