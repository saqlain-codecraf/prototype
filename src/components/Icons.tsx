type IconProps = { className?: string; size?: number }

const ic = (path: string, vb = '0 0 24 24') =>
  ({ className = '', size = 20 }: IconProps) => (
    <svg width={size} height={size} viewBox={vb} fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d={path} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )

export const HomeIcon    = ic('M3 9.5L12 3l9 6.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z M9 22V12h6v10')
export const BriefcaseIcon = ic('M20 7H4a2 2 0 00-2 2v11a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2')
export const MessageIcon = ic('M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z')
export const BarChartIcon = ic('M18 20V10 M12 20V4 M6 20v-6')
export const UserIcon    = ic('M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z')
export const MapPinIcon  = ic('M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 10a1 1 0 100-2 1 1 0 000 2z')
export const ClockIcon   = ic('M12 22a10 10 0 100-20 10 10 0 000 20z M12 6v6l4 2')
export const StarIcon    = ic('M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z')
export const ChevronRight = ic('M9 18l6-6-6-6')
export const ChevronLeft  = ic('M15 18l-6-6 6-6')
export const ChevronDown  = ic('M6 9l6 6 6-6')
export const ChevronUp    = ic('M18 15l-6-6-6 6')
export const PlusIcon    = ic('M12 5v14 M5 12h14')
export const XIcon       = ic('M18 6L6 18 M6 6l12 12')
export const CheckIcon   = ic('M20 6L9 17l-5-5')
export const CheckCircle = ic('M22 11.08V12a10 10 0 11-5.93-9.14 M22 4L12 14.01l-3-3')
export const SearchIcon  = ic('M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z')
export const CameraIcon  = ic('M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z M12 17a4 4 0 100-8 4 4 0 000 8z')
export const UploadIcon  = ic('M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M17 8l-5-5-5 5 M12 3v12')
export const ToolIcon    = ic('M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z')
export const ShieldIcon  = ic('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z')
export const BellIcon    = ic('M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0')
export const NavigateIcon = ic('M3 11l19-9-9 19-2-8-8-2z')
export const PhoneIcon   = ic('M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z')
export const AlertCircle = ic('M12 22a10 10 0 100-20 10 10 0 000 20z M12 8v4 M12 16h.01')
export const RefreshIcon = ic('M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15')
export const DollarIcon  = ic('M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6')
export const ArrowUpIcon = ic('M12 19V5 M5 12l7-7 7 7')
export const SlidersIcon = ic('M4 21v-7 M4 10V3 M12 21v-9 M12 8V3 M20 21v-5 M20 12V3 M1 14h6 M9 8h6 M17 16h6')
export const ActivityIcon = ic('M22 12h-4l-3 9L9 3l-3 9H2')
export const EditIcon    = ic('M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z')
export const InfoIcon    = ic('M12 22a10 10 0 100-20 10 10 0 000 20z M12 16v-4 M12 8h.01')

export function StarFilled({ size = 14, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

export function OnlineIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" stroke={active ? '#10B981' : '#9CA3AF'} strokeWidth="1.5" />
      <circle cx="10" cy="10" r="4" fill={active ? '#10B981' : '#9CA3AF'} />
    </svg>
  )
}
