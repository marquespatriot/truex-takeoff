export const DEFAULT_SECTIONS = [
  {
    id: 'first_floor',
    name: 'FIRST FLOOR',
    isCustom: false,
    categories: [
      { id: 'ext_walls', name: 'Exterior Walls' },
      { id: 'int_walls', name: 'Interior Walls' },
      { id: 'ceiling', name: 'Ceiling' },
      { id: 'floor', name: 'Floor' }
    ]
  },
  {
    id: 'second_floor',
    name: 'SECOND FLOOR',
    isCustom: false,
    categories: [
      { id: 'ext_walls', name: 'Exterior Walls' },
      { id: 'int_walls', name: 'Interior Walls' },
      { id: 'ceiling', name: 'Ceiling' },
      { id: 'floor', name: 'Floor' }
    ]
  },
  {
    id: 'attic_roof',
    name: 'ATTIC / ROOF',
    isCustom: false,
    categories: [
      { id: 'under_side_of_roof', name: 'Under Side of Roof' },
      { id: 'slopes', name: 'Slopes' },
      { id: 'flat_ceiling', name: 'Flat Ceiling' },
      { id: 'attic_floor', name: 'Attic Floor' },
      { id: 'knee_walls', name: 'Knee Walls' },
      { id: 'gable_walls', name: 'Gable Walls' },
      { id: 'flat_roof', name: 'Flat Roof' },
      { id: 'overhang', name: 'Overhang' }
    ]
  },
  {
    id: 'basement',
    name: 'BASEMENT',
    isCustom: false,
    categories: [
      { id: 'basement_ceiling', name: 'Basement Ceiling' },
      { id: 'framed_walls', name: 'Framed Walls' },
      { id: 'concrete_walls', name: 'Concrete / Foundation Walls' },
      { id: 'rim_joist', name: 'Rim Joist' }
    ]
  },
  {
    id: 'garage',
    name: 'GARAGE',
    isCustom: false,
    categories: [
      { id: 'garage_walls', name: 'Garage Walls' },
      { id: 'garage_ceiling', name: 'Garage Ceiling' },
      { id: 'garage_attic', name: 'Garage Attic' }
    ]
  },
  {
    id: 'crawl_space',
    name: 'CRAWL SPACE',
    isCustom: false,
    categories: [
      { id: 'crawl_space', name: 'Crawl Space' },
      { id: 'crawl_ceiling', name: 'Crawl Ceiling' },
      { id: 'crawl_walls', name: 'Crawl Walls' }
    ]
  },
  {
    id: 'stairs',
    name: 'STAIRS',
    isCustom: false,
    categories: [
      { id: 'under_stairs', name: 'Under Stairs' },
      { id: 'stairway_walls', name: 'Stairway Walls' }
    ]
  },
  {
    id: 'unit_separation',
    name: 'UNIT SEPARATION',
    isCustom: false,
    categories: [
      { id: 'between_unit_walls', name: 'Between Unit Walls' },
      { id: 'between_unit_floor', name: 'Between Unit Floor' },
      { id: 'between_unit_ceiling', name: 'Between Unit Ceiling' }
    ]
  }
];

export const PROJECT_TEMPLATES = [
  { id: 'RESIDENTIAL', name: 'Residential Single-Family', desc: 'Standard residential floors, attic, basement & garage.' },
  { id: 'MULTIFAMILY', name: 'Multifamily / Townhouse', desc: 'Units, unit separation walls, floors, ceilings & sound attenuation.' },
  { id: 'COMMERCIAL', name: 'Commercial Building', desc: 'Flexible building sections, custom commercial areas & levels.' },
  { id: 'ATTIC_ONLY', name: 'Attic & Roof Only', desc: 'Attic floor, slopes, gable walls, knee walls & flat ceiling.' },
  { id: 'BASEMENT_ONLY', name: 'Basement & Crawlspace', desc: 'Basement walls, ceiling, rim joist & crawlspace.' }
];

export const FRAMING_OPTIONS = ['2x4', '2x6', '2x8', '2x10', '2x12', 'Custom'];

export const MATERIAL_OPTIONS = [
  'Closed Cell Spray Foam',
  'Open Cell Spray Foam',
  'Fiberglass Batt',
  'Blown-In Fiberglass',
  'Cellulose',
  'Sound Attenuation',
  'Hybrid',
  'Other / Custom'
];

export const THICKNESS_OPTIONS = ['1"', '2"', '3"', '3.5"', '5.5"', '7.25"', '10"', '12"', 'Custom'];

export const WASTE_FACTOR_OPTIONS = ['0%', '5%', '10%', '15%', 'Custom'];

export const PROJECT_CONDITIONS = [
  'New Construction',
  'Existing Home',
  'Remodel',
  'Addition',
  'Multifamily',
  'Commercial',
  'Other'
];

export const JOB_TYPES = [
  'Spray Foam',
  'Fiberglass',
  'Blown-In',
  'Hybrid',
  'Sound Attenuation',
  'Air Sealing',
  'Insulation Removal',
  'Other'
];

export const CEILING_HEIGHT_OPTIONS = ['8 ft', '9 ft', '10 ft', '12 ft', 'Custom'];

export const OPENING_PRESETS = [
  { label: 'Standard Door (3x7)', length: 3, height: 7, sqft: 21 },
  { label: 'Standard Window (4x5)', length: 4, height: 5, sqft: 20 },
  { label: 'Attic Access Hatch (2x3)', length: 2, height: 3, sqft: 6 },
  { label: 'Mechanical Duct Opening', length: 3, height: 3, sqft: 9 },
  { label: 'Custom Opening', length: 0, height: 0, sqft: 0 }
];

export const ROOM_PRESETS = [
  'Living Room',
  'Kitchen',
  'Master Bedroom',
  'Bedroom 1',
  'Bedroom 2',
  'Hallway',
  'Mechanical Room',
  'Garage',
  'Bathroom',
  'Attic Area',
  'Basement Area'
];

export const PRESET_NOTES = [
  "Existing insulation",
  "Existing insulation needs removal",
  "Difficult access",
  "Need lift / scaffolding",
  "Fire blocking required",
  "Moisture concern",
  "HVAC in area",
  "Electrical wiring",
  "Plumbing in area",
  "Limited attic access",
  "Existing fiberglass",
  "Existing cellulose",
  "Existing spray foam",
  "New construction",
  "Remodel"
];

export const SAMPLE_PROJECT = {
  id: 'proj_sample_01',
  template: 'MULTIFAMILY',
  info: {
    customerName: 'John Smith',
    customerEmail: 'john.smith@example.com',
    customerPhone: '(617) 555-0192',
    address: '123 Main Street, Quincy, MA 02169',
    salesRep: 'Mike Johnson',
    estimator: 'Mike Johnson',
    date: '2026-10-07',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'Measuring',
    projectCondition: 'Multifamily',
    jobTypes: ['Spray Foam', 'Sound Attenuation'],
    ceilingHeight: '9 ft',
    notes: 'Multifamily 2-Unit structure. Needs thermal insulation and sound attenuation between units.',
    photos: []
  },
  settings: {
    wasteFactor: '10%',
    displayMode: 'net',
    favorites: ['attic_roof:under_side_of_roof', 'unit_separation:between_unit_walls', 'first_floor:ext_walls']
  },
  measurements: {
    'first_floor:ext_walls': {
      items: [
        { id: 'm1', length: 30, height: 10, shape: 'RECTANGLE', unit: 'SQ_FT', type: 'addition', label: 'Front Wall', sqft: 300, room: 'Living Room', comment: '2x6 studs 16 O.C.' },
        { id: 'm2', length: 25, height: 10, shape: 'RECTANGLE', unit: 'SQ_FT', type: 'addition', label: 'Rear Wall', sqft: 250, room: 'Kitchen', comment: '' },
        { id: 'm3', length: 3, height: 7, shape: 'RECTANGLE', unit: 'SQ_FT', type: 'subtraction', label: 'Front Door Subtraction', sqft: -21, room: 'Living Room', comment: '' }
      ],
      framing: '2x6',
      material: 'Closed Cell Spray Foam',
      thickness: '3"',
      notes: '2x6 exterior studs, 16" O.C.',
      photos: []
    },
    'attic_roof:gable_walls': {
      items: [
        { id: 'm4', length: 18, height: 8, shape: 'TRIANGLE', unit: 'SQ_FT', type: 'addition', label: 'East Gable Triangle Wall', sqft: 72, room: 'Attic Area', comment: 'Base 18 ft, Height 8 ft' },
        { id: 'm5', length: 12, height: 6, shape: 'TRIANGLE', unit: 'SQ_FT', type: 'addition', label: 'West Gable Triangle Wall', sqft: 36, room: 'Attic Area', comment: 'Base 12 ft, Height 6 ft' }
      ],
      framing: '2x4',
      material: 'Open Cell Spray Foam',
      thickness: '5.5"',
      notes: 'Gable wall triangular framing',
      photos: []
    },
    'unit_separation:between_unit_walls': {
      items: [
        { id: 'm6', length: 16, height: 9, shape: 'RECTANGLE', unit: 'SQ_FT', type: 'addition', label: 'Unit 1 / Unit 2 Separation Wall A', sqft: 144, room: 'Party Wall', comment: 'Acoustic batt required' },
        { id: 'm7', length: 20, height: 9, shape: 'RECTANGLE', unit: 'SQ_FT', type: 'addition', label: 'Unit 1 / Unit 2 Separation Wall B', sqft: 180, room: 'Party Wall', comment: '' }
      ],
      framing: '2x4',
      material: 'Sound Attenuation',
      thickness: '3.5"',
      notes: 'Sound attenuation acoustic batt specified between units.',
      photos: []
    },
    'basement:rim_joist': {
      items: [
        { id: 'm8', length: 110, height: 1, shape: 'RECTANGLE', unit: 'LINEAR_FT', type: 'addition', label: 'Perimeter Rim Joist', sqft: 110, room: 'Basement', comment: 'Linear feet measurement' }
      ],
      framing: '2x10',
      material: 'Closed Cell Spray Foam',
      thickness: '2"',
      notes: 'Linear feet perimeter spray',
      photos: []
    }
  },
  buildings: [],
  units: [],
  customSections: [],
  auditLog: [
    { id: 'a1', user: 'Mike Johnson', action: 'Created project takeoff', timestamp: new Date().toISOString() },
    { id: 'a2', user: 'Mike Johnson', action: 'Added Gable Wall triangle measurement', timestamp: new Date().toISOString() }
  ]
};
