// Service catalog. `price` is the admin-configured hourly rate for each sub-category.

export interface SubCategory {
  id: string
  name: string
  desc: string
  price: number
  tools: string[]
}

export interface Category {
  id: string
  name: string
  emoji: string
  tint: string
  subs: SubCategory[]
}

export const CATEGORIES: Category[] = [
  {
    id: 'plumbing', name: 'Plumbing', emoji: '💧', tint: '#DBEAFE',
    subs: [
      { id: 'pipe-repair', name: 'Pipe Repair', desc: 'Fix leaks and broken pipes', price: 1500, tools: ['Pipe wrench', 'Pipe cutter', 'Teflon tape'] },
      { id: 'bathroom-plumbing', name: 'Bathroom Plumbing', desc: 'Taps, showers, toilets', price: 1600, tools: ['Adjustable wrench', 'Plunger', 'Sealant gun'] },
      { id: 'tank-install', name: 'Water Tank Installation', desc: 'Install or replace tanks', price: 1800, tools: ['Drill', 'Pipe fittings kit', 'Spirit level'] },
      { id: 'drain-cleaning', name: 'Drain Cleaning', desc: 'Clear blocked drains', price: 1300, tools: ["Plumber's snake", 'Plunger'] },
    ],
  },
  {
    id: 'electrical', name: 'Electrical', emoji: '⚡', tint: '#FEF9C3',
    subs: [
      { id: 'wiring', name: 'Wiring', desc: 'Install or repair wiring', price: 2000, tools: ['Multimeter', 'Wire stripper', 'Voltage tester'] },
      { id: 'switch-socket', name: 'Switch & Socket', desc: 'Repair or install outlets', price: 1500, tools: ['Screwdriver set', 'Voltage tester'] },
      { id: 'fan-install', name: 'Fan Installation', desc: 'Ceiling & exhaust fans', price: 1400, tools: ['Drill', 'Ladder', 'Screwdriver set'] },
      { id: 'lighting', name: 'Lighting', desc: 'Install ceiling/wall lights', price: 1400, tools: ['Ladder', 'Wire stripper'] },
    ],
  },
  {
    id: 'gardening', name: 'Gardening', emoji: '🌱', tint: '#DCFCE7',
    subs: [
      { id: 'lawn', name: 'Lawn Maintenance', desc: 'Mowing, edging, trimming', price: 1200, tools: ['Lawn mower', 'Edger'] },
      { id: 'tree-trim', name: 'Tree Trimming', desc: 'Pruning and shaping trees', price: 1400, tools: ['Hedge trimmer', 'Pruning saw', 'Ladder'] },
      { id: 'garden-cleanup', name: 'Garden Cleanup', desc: 'Leaf clearing and tidying', price: 1000, tools: ['Rake', 'Leaf blower'] },
      { id: 'planting', name: 'Planting', desc: 'Plant installation and care', price: 1100, tools: ['Spade', 'Garden fork'] },
    ],
  },
  {
    id: 'cleaning', name: 'Cleaning', emoji: '🧹', tint: '#F3E8FF',
    subs: [
      { id: 'deep-clean', name: 'Deep Cleaning', desc: 'Full home deep clean', price: 1000, tools: ['Vacuum cleaner', 'Mop & bucket'] },
      { id: 'kitchen-clean', name: 'Kitchen Cleaning', desc: 'Appliances and surfaces', price: 800, tools: ['Degreaser', 'Scrubbers'] },
      { id: 'carpet-clean', name: 'Carpet Cleaning', desc: 'Steam clean carpets', price: 900, tools: ['Steam cleaner'] },
      { id: 'window-clean', name: 'Window Cleaning', desc: 'Glass inside & out', price: 850, tools: ['Squeegee', 'Extension pole'] },
    ],
  },
  {
    id: 'painting', name: 'Painting', emoji: '🎨', tint: '#FEE2E2',
    subs: [
      { id: 'wall-paint', name: 'Wall Painting', desc: 'Interior walls & ceilings', price: 1300, tools: ['Rollers & brushes', 'Ladder', 'Drop sheets'] },
      { id: 'exterior-paint', name: 'Exterior Painting', desc: 'Outer walls & gates', price: 1500, tools: ['Spray gun', 'Scaffold ladder'] },
      { id: 'touch-up', name: 'Touch-ups & Repair', desc: 'Patch cracks, repaint spots', price: 1100, tools: ['Putty knife', 'Brushes'] },
    ],
  },
  {
    id: 'carpentry', name: 'Carpentry', emoji: '🪚', tint: '#FEF3C7',
    subs: [
      { id: 'furniture-repair', name: 'Furniture Repair', desc: 'Fix chairs, tables, beds', price: 1400, tools: ['Hammer', 'Clamps', 'Wood glue'] },
      { id: 'door-fix', name: 'Door & Lock Fitting', desc: 'Hang doors, fit locks', price: 1500, tools: ['Chisel set', 'Drill'] },
      { id: 'assembly', name: 'Furniture Assembly', desc: 'Flat-pack assembly', price: 1200, tools: ['Allen keys', 'Screwdriver set'] },
    ],
  },
  {
    id: 'handyman', name: 'Handyman', emoji: '🔨', tint: '#E0F2FE',
    subs: [
      { id: 'mounting', name: 'TV & Shelf Mounting', desc: 'Wall mounting', price: 1200, tools: ['Drill', 'Stud finder', 'Spirit level'] },
      { id: 'odd-jobs', name: 'General Repairs', desc: 'Small fixes around the home', price: 1100, tools: ['Toolbox'] },
    ],
  },
  {
    id: 'ac', name: 'AC Service', emoji: '❄️', tint: '#CFFAFE',
    subs: [
      { id: 'ac-service', name: 'AC General Service', desc: 'Clean filters & coils', price: 1800, tools: ['Pressure washer', 'Gauge set'] },
      { id: 'ac-install', name: 'AC Installation', desc: 'Mount indoor & outdoor unit', price: 2500, tools: ['Drill', 'Vacuum pump', 'Gauge set'] },
    ],
  },
]

export function findCategory(id: string) {
  return CATEGORIES.find(c => c.id === id)
}

export function findSub(subId: string) {
  for (const c of CATEGORIES) {
    const s = c.subs.find(x => x.id === subId)
    if (s) return { category: c, sub: s }
  }
  return undefined
}

export const rs = (n: number) => `Rs ${Math.round(n).toLocaleString()}`
