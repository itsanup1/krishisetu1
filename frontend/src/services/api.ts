import axios from 'axios';
import {
  User,
  Product,
  CartItem,
  Order,
  OrderItem,
  Equipment,
  AvailabilitySlot,
  BookingRequest,
  AdminStats,
  OrderStatus,
  EquipmentListing,
  RentalRecord,
  RentalPayment,
  RentalQueueEntry,
  AvailabilityCheck,
} from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Attach token to outgoing requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('krishi_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Client-side Database Initial State for Fallback / Offline Mode
const CATALOG_VERSION = 'v5_with_product_ids_24';
const STORAGE_KEYS = {
  USERS: 'krishi_mock_users_v5',
  PRODUCTS: 'krishi_mock_products_v5',
  EQUIPMENT: 'krishi_mock_equipment_v5',
  CART: 'krishi_mock_cart',
  ORDERS: 'krishi_mock_orders',
  BOOKINGS: 'krishi_mock_bookings_v5',
  AVAILABILITY: 'krishi_mock_availability',
  CONFIG: 'krishi_mock_config_version',
};

// Default seed data
const DEFAULT_USERS: User[] = [
  {
    id: 1,
    name: 'Ramesh Kumar (Farmer & Owner)',
    email: 'farmer@krishisetu.com',
    phone: '9876543210',
    role: 'FARMER',
    is_equipment_owner: true,
    location: 'Nashik, Maharashtra',
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Suresh Patil (Farmer & Owner)',
    email: 'farmer2@krishisetu.com',
    phone: '9876543211',
    role: 'FARMER',
    is_equipment_owner: true,
    location: 'Pune, Maharashtra',
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'AgriCorp Agro Chemicals',
    email: 'vendor@krishisetu.com',
    phone: '9876543220',
    role: 'VENDOR',
    is_equipment_owner: false,
    location: 'Nagpur, Maharashtra',
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    name: 'Krishisetu Administrator',
    email: 'admin@krishisetu.com',
    phone: '9876543230',
    role: 'ADMIN',
    is_equipment_owner: false,
    location: 'Mumbai, Maharashtra',
    created_at: new Date().toISOString(),
  },
  {
    id: 5,
    name: 'Kisan Krishi Seva Kendra',
    email: 'vendor2@krishisetu.com',
    phone: '9823114455',
    role: 'VENDOR',
    is_equipment_owner: false,
    location: 'Kolhapur, Maharashtra',
    created_at: new Date().toISOString(),
  },
  {
    id: 6,
    name: 'Godavari Irrigation & Farm Tech',
    email: 'vendor3@krishisetu.com',
    phone: '9850223344',
    role: 'VENDOR',
    is_equipment_owner: false,
    location: 'Ahmednagar, Maharashtra',
    created_at: new Date().toISOString(),
  },
  {
    id: 7,
    name: 'Vikram Deshmukh (Machinery Owner)',
    email: 'owner3@krishisetu.com',
    phone: '9890445566',
    role: 'FARMER',
    is_equipment_owner: true,
    location: 'Satara, Maharashtra',
    created_at: new Date().toISOString(),
  },
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 1,
    product_id: 'P001',
    vendor_id: 3,
    name: 'Certified Golden Wheat Seeds - HD 2967 (50kg Sack)',
    category: 'SEEDS',
    price: 1650,
    stock: 95,
    availability_status: 'IN_STOCK',
    description: 'ICAR-certified high-yield, yellow-rust resistant wheat seed variety suitable for irrigated and timely sown conditions across northern and central plains. Germination rate above 96%.',
    image_url: '/assets/images/wheat_seeds_sack_1791500903435.jpg',
    vendor_name: 'AgriCorp Agro Chemicals',
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    product_id: 'P002',
    vendor_id: 5,
    name: 'Royal Harvest Pusa-1121 Basmati Paddy Seeds (25kg)',
    category: 'SEEDS',
    price: 2150,
    stock: 64,
    availability_status: 'IN_STOCK',
    description: 'Extra-long slender grain aromatic Basmati paddy seeds with high market value, strong culm strength, and superior milling recovery. Ideal for Kharif transplanting.',
    image_url: '/assets/images/basmati_paddy_seeds_1791500920007.jpg',
    vendor_name: 'Kisan Krishi Seva Kendra',
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    product_id: 'P003',
    vendor_id: 3,
    name: 'Progeny F1 Hybrid Bt Cotton Seeds - ACT-777 (450g)',
    category: 'SEEDS',
    price: 860,
    stock: 120,
    availability_status: 'IN_STOCK',
    description: 'Cruiser-Plus systemic fungicide & insecticide treated F1 hybrid cotton seeds with big boll size, high ginning percentage, and tolerance against pink bollworm and jassids.',
    image_url: '/assets/images/hybrid_cotton_seeds_1791500931145.jpg',
    vendor_name: 'AgriCorp Agro Chemicals',
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    product_id: 'P004',
    vendor_id: 5,
    name: 'High-Yield Hybrid Maize & JS-9560 Soybean Combo (25kg)',
    category: 'SEEDS',
    price: 1920,
    stock: 48,
    availability_status: 'IN_STOCK',
    description: 'Certified bold-seeded yellow maize and high-oil JS-9560 soybean foundation seeds. Features drought tolerance, early maturity (95 days), and shatter-resistant pods.',
    image_url: '/assets/images/soybean_maize_seeds_1791500943314.jpg',
    vendor_name: 'Kisan Krishi Seva Kendra',
    created_at: new Date().toISOString(),
  },
  {
    id: 5,
    product_id: 'P005',
    vendor_id: 3,
    name: 'GrowMax NPK 19:19:19 100% Water Soluble Fertilizer (25kg)',
    category: 'FERTILIZER',
    price: 1850,
    stock: 72,
    availability_status: 'IN_STOCK',
    description: 'Free-flowing crystalline balanced macronutrient formula (19% N, 19% P, 19% K) for drip fertigation and foliar spray. Boosts vegetative branching, root vigor, and fruit setting.',
    image_url: '/assets/images/npk_fertilizer_bag_1791500953747.jpg',
    vendor_name: 'AgriCorp Agro Chemicals',
    created_at: new Date().toISOString(),
  },
  {
    id: 6,
    product_id: 'P006',
    vendor_id: 5,
    name: 'Krishi Neem Coated Urea 46% Nitrogen Fertilizer (45kg)',
    category: 'FERTILIZER',
    price: 268,
    stock: 310,
    availability_status: 'IN_STOCK',
    description: 'Government-grade prilled urea coated with natural neem oil to slow nitrification, prevent leaching loss, and deliver sustained nitrogen nutrition to cereal and cash crops.',
    image_url: '/assets/images/neem_coated_urea_1791500964626.jpg',
    vendor_name: 'Kisan Krishi Seva Kendra',
    created_at: new Date().toISOString(),
  },
  {
    id: 7,
    product_id: 'P007',
    vendor_id: 3,
    name: 'Granular DAP (18:46:0) & Zinc Sulphate 33% Combo Pack (50kg)',
    category: 'FERTILIZER',
    price: 1580,
    stock: 55,
    availability_status: 'IN_STOCK',
    description: 'Basal dose Di-Ammonium Phosphate paired with Zinc Sulphate Monohydrate 33% to eliminate Khaira disease in paddy and establish deep root architecture in wheat and sugarcane.',
    image_url: '/assets/images/dap_zinc_fertilizer_1791500980608.jpg',
    vendor_name: 'AgriCorp Agro Chemicals',
    created_at: new Date().toISOString(),
  },
  {
    id: 8,
    product_id: 'P008',
    vendor_id: 5,
    name: 'Eco-Gro Enriched Organic Vermicompost & Bio-Potash (50kg)',
    category: 'FERTILIZER',
    price: 540,
    stock: 140,
    availability_status: 'IN_STOCK',
    description: 'Earthworm-processed humus-rich organic manure blended with mobilized bio-potash granules and Trichoderma viride. Improves soil water retention, aeration, and microbial life.',
    image_url: '/assets/images/organic_vermicompost_potash_1791500991903.jpg',
    vendor_name: 'Kisan Krishi Seva Kendra',
    created_at: new Date().toISOString(),
  },
  {
    id: 9,
    product_id: 'P009',
    vendor_id: 3,
    name: 'Cold-Pressed Azadirachtin 10000 ppm Neem Oil Bio-Pesticide (5L)',
    category: 'PESTICIDE',
    price: 1120,
    stock: 68,
    availability_status: 'IN_STOCK',
    description: '100% organic botanical antifeedant and insect growth regulator effective against whiteflies, aphids, thrips, mites, and leaf miners without harming beneficial pollinators.',
    image_url: '/assets/images/neem_oil_biopesticide_1791501004700.jpg',
    vendor_name: 'AgriCorp Agro Chemicals',
    created_at: new Date().toISOString(),
  },
  {
    id: 10,
    product_id: 'P010',
    vendor_id: 3,
    name: 'CropShield Systemic Fungicide & Broad-Spectrum Insecticide Kit (1L)',
    category: 'PESTICIDE',
    price: 890,
    stock: 42,
    availability_status: 'IN_STOCK',
    description: 'Dual-action systemic crop protection pack containing Azoxystrobin + Tebuconazole fungicide and Thiamethoxam insecticide for rapid control of blight, rust, and stem borers.',
    image_url: '/assets/images/crop_fungicide_insecticide_1791501015614.jpg',
    vendor_name: 'AgriCorp Agro Chemicals',
    created_at: new Date().toISOString(),
  },
  {
    id: 11,
    product_id: 'P011',
    vendor_id: 6,
    name: 'DripLine 16mm Inline HDPE Irrigation Pipe Coil & Valve Kit (300m)',
    category: 'IRRIGATION',
    price: 3450,
    stock: 28,
    availability_status: 'IN_STOCK',
    description: 'UV-stabilized Virgin Grade PE-100 HDPE drip irrigation lateral coil with pre-fitted cylindrical emitters at 40cm spacing, PVC ball valves, and brass impact sprinkler heads.',
    image_url: '/assets/images/hdpe_irrigation_pipes_1791501025898.jpg',
    vendor_name: 'Godavari Irrigation & Farm Tech',
    created_at: new Date().toISOString(),
  },
  {
    id: 12,
    product_id: 'P012',
    vendor_id: 6,
    name: 'AgriFlow 110mm Quick-Connect PVC Sprinkler Pipes & Brass Rain Gun',
    category: 'IRRIGATION',
    price: 5800,
    stock: 19,
    availability_status: 'IN_STOCK',
    description: 'Heavy-duty ISI-marked 6 kg/cm² quick-coupled PVC portable irrigation pipes (6m lengths) with galvanized latch couplers and a 1.5-inch adjustable brass rain gun on tripod stand.',
    image_url: '/assets/images/rain_gun_sprinkler_pipes_1791501234370.jpg',
    vendor_name: 'Godavari Irrigation & Farm Tech',
    created_at: new Date().toISOString(),
  },
  {
    id: 13,
    product_id: 'P013',
    vendor_id: 6,
    name: 'FarmQuip 16L 12V-8Ah Li-Ion Battery Knapsack Sprayer with Brass Lance',
    category: 'SPRAYER',
    price: 2650,
    stock: 34,
    availability_status: 'IN_STOCK',
    description: 'High-pressure diaphragm pump rechargeable knapsack sprayer capable of spraying 18–20 tanks per charge. Includes telescopic brass lance, pressure regulator gauge, and 4-nozzle set.',
    image_url: '/assets/images/battery_knapsack_sprayer_1791501046903.jpg',
    vendor_name: 'Godavari Irrigation & Farm Tech',
    created_at: new Date().toISOString(),
  },
  {
    id: 14,
    product_id: 'P014',
    vendor_id: 6,
    name: 'Solo 435 Petrol Motorized Knapsack Mist Blower & Duster Sprayer (20L)',
    category: 'SPRAYER',
    price: 7400,
    stock: 8,
    availability_status: 'LOW_STOCK',
    description: '2-stroke 42cc petrol engine motorized orchard mist blower reaching up to 11 meters horizontal spray throw. Ideal for mango, pomegranate, vineyard, and tall field crops.',
    image_url: '/assets/images/power_mist_blower_sprayer_1791501245816.jpg',
    vendor_name: 'Godavari Irrigation & Farm Tech',
    created_at: new Date().toISOString(),
  },
];

const DEFAULT_EQUIPMENT: Equipment[] = [
  {
    id: 1,
    rental_id: 'R001',
    product_id: 'R001',
    owner_id: 1,
    owner_name: 'Ramesh Kumar',
    owner_phone: '9876543210',
    type: 'TRACTOR',
    name: 'Mahindra 575 DI XP Plus 50 HP 4WD Tractor',
    description: 'High-torque 4-cylinder ELS diesel tractor with ROPS canopy, power steering, and heavy-duty ADDC hydraulic lift. Well-maintained and ready for deep ploughing, puddling, and haulage.',
    specifications: '50 HP Engine | 4WD Front Axle | Dual Clutch | 1800 kg Hydraulic Lift | Oil Immersed Brakes',
    rate: 650,
    rate_unit: 'HOUR',
    location: 'Nashik, Maharashtra',
    stock_quantity: 2,
    availability_status: 'AVAILABLE',
    image_url: '/assets/images/mahindra_red_tractor_1791501058296.jpg',
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    rental_id: 'R002',
    product_id: 'R002',
    owner_id: 2,
    owner_name: 'Suresh Patil',
    owner_phone: '9876543211',
    type: 'TRACTOR',
    name: 'John Deere 5310 PowerTech 55 HP 4WD Utility Tractor',
    description: 'Turbocharged 55 HP 4-wheel-drive tractor featuring collar-shift gearbox, planetary gear reduction, and independent PTO for heavy-duty laser leveling and baler operations.',
    specifications: '55 HP @ 2400 RPM | 9F + 3R CollarShift | 2000 kg Lift Capacity | Dual-RPM PTO (540/540E)',
    rate: 780,
    rate_unit: 'HOUR',
    location: 'Pune, Maharashtra',
    stock_quantity: 1,
    availability_status: 'AVAILABLE',
    image_url: '/assets/images/john_deere_green_tractor_1791501071564.jpg',
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    rental_id: 'R003',
    product_id: 'R003',
    owner_id: 7,
    owner_name: 'Vikram Deshmukh',
    owner_phone: '9890445566',
    type: 'TRACTOR',
    name: 'New Holland 5500 Turbo Super 48 HP Tractor with Canopy',
    description: 'Fuel-efficient 3-cylinder tractor with sun canopy, front counterweight ballast, and synchromesh transmission. Ideal for inter-cultivation, rotavator tillage, and trolley transport.',
    specifications: '48 HP Engine | 8F + 2R Constant Mesh | 1700 kg Sensomatic24 Hydraulics | Power Steering',
    rate: 580,
    rate_unit: 'HOUR',
    location: 'Satara, Maharashtra',
    stock_quantity: 2,
    availability_status: 'AVAILABLE',
    image_url: '/assets/images/swaraj_blue_tractor_1791501084071.jpg',
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    rental_id: 'R004',
    product_id: 'R004',
    owner_id: 1,
    owner_name: 'Ramesh Kumar',
    owner_phone: '9876543210',
    type: 'ROTAVATOR',
    name: 'Maschio Gaspardo Virat Pro 7 Feet Heavy Duty Rotavator',
    description: 'Multi-speed gear-driven rotary tiller with boron steel curved L-blades that pulverizes clods, incorporates crop residue, and prepares a fine seedbed in a single pass.',
    specifications: '7 Feet Working Width | 48 Boron Steel L-Blades | Multi-Speed Gearbox (540/1000 RPM) | Side Gear Drive',
    rate: 420,
    rate_unit: 'HOUR',
    location: 'Nashik, Maharashtra',
    stock_quantity: 3,
    availability_status: 'AVAILABLE',
    image_url: '/assets/images/rotavator_rotary_tiller_1791501094685.jpg',
    created_at: new Date().toISOString(),
  },
  {
    id: 5,
    rental_id: 'R005',
    product_id: 'R005',
    owner_id: 2,
    owner_name: 'Suresh Patil',
    owner_phone: '9876543211',
    type: 'HARVESTER',
    name: 'John Deere W70 Self-Propelled Multi-Crop Combine Harvester',
    description: 'High-throughput self-propelled combine harvester with air-conditioned operator cabin, 14-foot header reel, and 6-straw-walker threshing system for wheat, soybean, and gram.',
    specifications: '100 HP Turbocharged Engine | 14 Ft Cutter Bar | 2700L Grain Tank | Posi-Torq Drive',
    rate: 1950,
    rate_unit: 'HOUR',
    location: 'Pune, Maharashtra',
    stock_quantity: 1,
    availability_status: 'HIGH_DEMAND',
    image_url: '/assets/images/combine_harvester_machine_1791501105447.jpg',
    created_at: new Date().toISOString(),
  },
  {
    id: 6,
    rental_id: 'R006',
    product_id: 'R006',
    owner_id: 7,
    owner_name: 'Vikram Deshmukh',
    owner_phone: '9890445566',
    type: 'HARVESTER',
    name: 'Yanmar YH600 Rubber-Track Paddy Combine Harvester',
    description: 'Specialized rubber-crawler combine harvester engineered for wet and muddy paddy fields. Delivers ultra-low grain breakage and high-speed harvesting without soil compaction.',
    specifications: '65 HP Diesel Engine | Rubber Crawler Tracks | 2.1m Reaping Width | Auto-Leveling Auger',
    rate: 1750,
    rate_unit: 'HOUR',
    location: 'Kolhapur, Maharashtra',
    stock_quantity: 1,
    availability_status: 'AVAILABLE',
    image_url: '/assets/images/paddy_combine_harvester_1791501270303.jpg',
    created_at: new Date().toISOString(),
  },
  {
    id: 7,
    rental_id: 'R007',
    product_id: 'R007',
    owner_id: 1,
    owner_name: 'Ramesh Kumar',
    owner_phone: '9876543210',
    type: 'CULTIVATOR',
    name: 'Fieldking 9-Tyne Spring Loaded Cultivator & Reversible MB Plough',
    description: 'Heavy-duty spring-loaded 9-tyne cultivator paired with a 2-bottom hydraulic reversible mould-board plough for breaking hardpan, aerating sub-soil, and uprooting stubborn weeds.',
    specifications: '9 Heavy Duty Tynes | Twin-Spring Overload Protection | Reversible High-Carbon Shares | Cat-II Hitch',
    rate: 320,
    rate_unit: 'HOUR',
    location: 'Nashik, Maharashtra',
    stock_quantity: 4,
    availability_status: 'AVAILABLE',
    image_url: '/assets/images/spring_tyne_cultivator_1791501117714.jpg',
    created_at: new Date().toISOString(),
  },
  {
    id: 8,
    rental_id: 'R008',
    product_id: 'R008',
    owner_id: 2,
    owner_name: 'Suresh Patil',
    owner_phone: '9876543211',
    type: 'SEED_DRILL',
    name: 'FarmPower 9-Row Zero-Till Multi-Crop Seed Cum Fertilizer Drill',
    description: 'Precision zero-tillage seed and fertilizer drill that sows wheat, soybean, maize, and pulses directly into crop stubble while banding basal fertilizer at calibrated depth.',
    specifications: '9 Rows | Inverted-T Furrow Openers | Dual Compartment Hopper | Ground-Wheel Chain Drive',
    rate: 400,
    rate_unit: 'HOUR',
    location: 'Ahmednagar, Maharashtra',
    stock_quantity: 2,
    availability_status: 'AVAILABLE',
    image_url: '/assets/images/seed_cum_fertilizer_drill_1791501128600.jpg',
    created_at: new Date().toISOString(),
  },
  {
    id: 9,
    rental_id: 'R009',
    product_id: 'R009',
    owner_id: 1,
    owner_name: 'Ramesh Kumar',
    owner_phone: '9876543210',
    type: 'SPRAYER',
    name: 'Aspee HTP 500L Tractor Mounted Hydraulic Boom Sprayer',
    description: 'High-volume tractor PTO-driven boom sprayer with a 40-foot foldable aluminum-steel truss boom and 28 anti-drift hollow-cone nozzles for rapid, uniform foliar application.',
    specifications: '500L UV-Stabilized Tank | 40 Ft Folding Boom | 3-Piston Brass HTP Pump | 540 PTO Drive',
    rate: 380,
    rate_unit: 'HOUR',
    location: 'Nashik, Maharashtra',
    stock_quantity: 2,
    availability_status: 'AVAILABLE',
    image_url: '/assets/images/tractor_boom_sprayer_1791501140854.jpg',
    created_at: new Date().toISOString(),
  },
  {
    id: 10,
    rental_id: 'R010',
    product_id: 'R010',
    owner_id: 7,
    owner_name: 'Vikram Deshmukh',
    owner_phone: '9890445566',
    type: 'PLOUGH_LEVELER',
    name: 'Apogee AP-20 Automatic Laser Guided Land Leveler Bucket',
    description: 'Precision laser-guided drag bucket leveler with rotary laser transmitter and mast receiver. Saves up to 35% irrigation water and ensures uniform crop stand across fields.',
    specifications: '7 Feet Scraper Bucket | 800m Laser Range | ±2mm Leveling Accuracy | 12V Solenoid Hydraulic Valve',
    rate: 550,
    rate_unit: 'HOUR',
    location: 'Satara, Maharashtra',
    stock_quantity: 1,
    availability_status: 'AVAILABLE',
    image_url: '/assets/images/laser_land_leveler_plough_1791501258441.jpg',
    created_at: new Date().toISOString(),
  },
];

// Seed initial bookings to demonstrate FCFS Queue
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const dayAfter = new Date();
dayAfter.setDate(dayAfter.getDate() + 2);
const threeDays = new Date();
threeDays.setDate(threeDays.getDate() + 3);

const DEFAULT_BOOKINGS: BookingRequest[] = [
  {
    id: 1,
    equipment_id: 1,
    equipment_name: 'Mahindra 575 DI XP Plus 50 HP 4WD Tractor',
    equipment_type: 'TRACTOR',
    equipment_rate: 650,
    equipment_rate_unit: 'HOUR',
    equipment_location: 'Nashik, Maharashtra',
    farmer_id: 2,
    farmer_name: 'Suresh Patil (Farmer & Owner)',
    farmer_phone: '9876543211',
    start_date: tomorrow.toISOString().slice(0, 16),
    end_date: dayAfter.toISOString().slice(0, 16),
    status: 'CONFIRMATION_PENDING',
    queue_position: 1,
    confirmation_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
  {
    id: 2,
    equipment_id: 1,
    equipment_name: 'Mahindra 575 DI XP Plus 50 HP 4WD Tractor',
    equipment_type: 'TRACTOR',
    equipment_rate: 650,
    equipment_rate_unit: 'HOUR',
    equipment_location: 'Nashik, Maharashtra',
    farmer_id: 1,
    farmer_name: 'Ramesh Kumar',
    farmer_phone: '9876543210',
    start_date: tomorrow.toISOString().slice(0, 16),
    end_date: dayAfter.toISOString().slice(0, 16),
    status: 'QUEUED',
    queue_position: 2,
    confirmation_deadline: undefined,
    created_at: new Date(Date.now() - 1800 * 1000).toISOString(),
  },
];

// Helper to get or set local storage
function getStorage<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(raw);
  } catch (e) {
    return defaultVal;
  }
}

function setStorage<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error('Local storage set error', e);
  }
}

// Check date overlap rule:
// existing.start_date < requested.end_date AND existing.end_date > requested.start_date
export function checkDateOverlap(
  start1: string | Date,
  end1: string | Date,
  start2: string | Date,
  end2: string | Date
): boolean {
  const s1 = new Date(start1).getTime();
  const e1 = new Date(end1).getTime();
  const s2 = new Date(start2).getTime();
  const e2 = new Date(end2).getTime();
  return s1 < e2 && e1 > s2;
}

// Standalone Mock Engine Implementation for Frontend
class MockBackendEngine {
  private users: User[];
  private products: Product[];
  private equipmentList: Equipment[];
  private bookings: BookingRequest[];
  private cart: CartItem[];
  private orders: Order[];
  private bookingConfirmationHours: number = 24;

  constructor() {
    const savedVersion = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (savedVersion !== CATALOG_VERSION) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
      localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(DEFAULT_EQUIPMENT));
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(DEFAULT_BOOKINGS));
      localStorage.setItem(STORAGE_KEYS.CONFIG, CATALOG_VERSION);
    }
    this.users = getStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
    this.products = getStorage(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
    this.equipmentList = getStorage(STORAGE_KEYS.EQUIPMENT, DEFAULT_EQUIPMENT);
    this.bookings = getStorage(STORAGE_KEYS.BOOKINGS, DEFAULT_BOOKINGS);
    this.cart = getStorage(STORAGE_KEYS.CART, []);
    this.orders = getStorage(STORAGE_KEYS.ORDERS, []);
    this.checkAndPromoteExpiredBookings();
  }

  // Scheduler function to expire overdue confirmation pending bookings
  public checkAndPromoteExpiredBookings(): void {
    const now = new Date().getTime();
    let updated = false;

    for (const b of this.bookings) {
      if (b.status === 'CONFIRMATION_PENDING' && b.confirmation_deadline) {
        if (new Date(b.confirmation_deadline).getTime() < now) {
          b.status = 'EXPIRED';
          updated = true;

          // Promote the next eligible queued request
          this.promoteNextQueuedBooking(b.equipment_id, b.start_date, b.end_date);
        }
      }
    }

    if (updated) {
      setStorage(STORAGE_KEYS.BOOKINGS, this.bookings);
    }
  }

  private promoteNextQueuedBooking(equipmentId: number, startDate: string, endDate: string) {
    // Find queued requests for this equipment that overlap and sort by queue_position
    const queuedRequests = this.bookings
      .filter(
        (b) =>
          b.equipment_id === equipmentId &&
          b.status === 'QUEUED' &&
          checkDateOverlap(b.start_date, b.end_date, startDate, endDate)
      )
      .sort((a, b) => a.queue_position - b.queue_position);

    if (queuedRequests.length > 0) {
      const nextInLine = queuedRequests[0];
      nextInLine.status = 'CONFIRMATION_PENDING';
      const deadline = new Date();
      deadline.setHours(deadline.getHours() + this.bookingConfirmationHours);
      nextInLine.confirmation_deadline = deadline.toISOString();
    }
  }

  // AUTH
  public login(email: string): { access_token: string; token_type: string; user: User } {
    const user = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error('Invalid email or password. Use one of the pre-configured accounts or register.');
    }
    const token = `mock-jwt-token-for-${user.id}-${Date.now()}`;
    return { access_token: token, token_type: 'bearer', user };
  }

  public register(data: {
    name: string;
    email: string;
    phone: string;
    role: 'FARMER' | 'VENDOR' | 'ADMIN';
    is_equipment_owner?: boolean;
    location: string;
  }): { access_token: string; token_type: string; user: User } {
    const existing = this.users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      throw new Error('An account with this email already exists.');
    }
    const newUser: User = {
      id: this.users.length + 1,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      is_equipment_owner: !!data.is_equipment_owner,
      location: data.location,
      created_at: new Date().toISOString(),
    };
    this.users.push(newUser);
    setStorage(STORAGE_KEYS.USERS, this.users);
    return this.login(newUser.email);
  }

  public getMe(userId: number): User {
    const user = this.users.find((u) => u.id === userId);
    if (!user) throw new Error('User not found');
    return user;
  }

  // PRODUCTS
  public getProducts(category?: string, search?: string): Product[] {
    let result = [...this.products];
    if (category && category !== 'ALL') {
      result = result.filter((p) => p.category === category);
    }
    if (search) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.vendor_name && p.vendor_name.toLowerCase().includes(q))
      );
    }
    return result;
  }

  public getProductById(id: number): Product {
    const p = this.products.find((prod) => prod.id === id);
    if (!p) throw new Error('Product not found');
    return p;
  }

  public createProduct(data: Omit<Product, 'id' | 'created_at'>): Product {
    const newP: Product = {
      ...data,
      id: this.products.length ? Math.max(...this.products.map((p) => p.id)) + 1 : 1,
      created_at: new Date().toISOString(),
    };
    this.products.push(newP);
    setStorage(STORAGE_KEYS.PRODUCTS, this.products);
    return newP;
  }

  public updateProduct(id: number, data: Partial<Product>): Product {
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Product not found');
    this.products[idx] = { ...this.products[idx], ...data, updated_at: new Date().toISOString() };
    setStorage(STORAGE_KEYS.PRODUCTS, this.products);
    return this.products[idx];
  }

  public deleteProduct(id: number): boolean {
    this.products = this.products.filter((p) => p.id !== id);
    setStorage(STORAGE_KEYS.PRODUCTS, this.products);
    return true;
  }

  // CART
  public getCart(farmerId: number): CartItem[] {
    const userCart = this.cart.filter((c) => c.farmer_id === farmerId);
    return userCart.map((item) => ({
      ...item,
      product: this.products.find((p) => p.id === item.product_id),
    }));
  }

  public addToCart(farmerId: number, productId: number, quantity: number): CartItem {
    const existing = this.cart.find((c) => c.farmer_id === farmerId && c.product_id === productId);
    if (existing) {
      existing.quantity += quantity;
      setStorage(STORAGE_KEYS.CART, this.cart);
      return { ...existing, product: this.products.find((p) => p.id === productId) };
    }
    const newItem: CartItem = {
      id: this.cart.length ? Math.max(...this.cart.map((c) => c.id)) + 1 : 1,
      farmer_id: farmerId,
      product_id: productId,
      quantity,
    };
    this.cart.push(newItem);
    setStorage(STORAGE_KEYS.CART, this.cart);
    return { ...newItem, product: this.products.find((p) => p.id === productId) };
  }

  public updateCartItem(id: number, quantity: number): CartItem {
    const item = this.cart.find((c) => c.id === id || c.product_id === id);
    if (!item) throw new Error('Cart item not found');
    item.quantity = quantity;
    setStorage(STORAGE_KEYS.CART, this.cart);
    return { ...item, product: this.products.find((p) => p.id === item.product_id) };
  }

  public deleteCartItem(id: number): boolean {
    this.cart = this.cart.filter((c) => c.id !== id && c.product_id !== id);
    setStorage(STORAGE_KEYS.CART, this.cart);
    return true;
  }

  public clearCart(farmerId: number): void {
    this.cart = this.cart.filter((c) => c.farmer_id !== farmerId);
    setStorage(STORAGE_KEYS.CART, this.cart);
  }

  // ORDERS
  public saveOrder(order: Order): void {
    const existingIdx = this.orders.findIndex((o) => o.id === order.id);
    if (existingIdx >= 0) {
      this.orders[existingIdx] = { ...this.orders[existingIdx], ...order };
    } else {
      this.orders.unshift(order);
    }
    setStorage(STORAGE_KEYS.ORDERS, this.orders);
  }

  public createOrder(
    farmerId: number,
    razorpayOrderId?: string,
    razorpayPaymentId?: string,
    deliveryAddress?: string,
    items?: Array<{ product_id: number; quantity: number; price_at_purchase?: number }>
  ): Order {
    let orderItems: OrderItem[] = [];
    let total = 0;

    if (items && items.length > 0) {
      orderItems = items.map((it, idx) => {
        const prod = this.products.find((p) => p.id === it.product_id);
        const price = it.price_at_purchase !== undefined ? it.price_at_purchase : (prod ? prod.price : 0);
        total += price * it.quantity;
        if (prod) {
          prod.stock = Math.max(0, prod.stock - it.quantity);
        }
        return {
          id: idx + 1,
          order_id: 0,
          product_id: it.product_id,
          quantity: it.quantity,
          price_at_purchase: price,
          product: prod,
        };
      });
    } else {
      const cartItems = this.getCart(farmerId);
      if (!cartItems.length) {
        throw new Error('Cart is empty');
      }
      orderItems = cartItems.map((ci, idx) => {
        const price = ci.product ? ci.product.price : 0;
        total += price * ci.quantity;
        if (ci.product) {
          ci.product.stock = Math.max(0, ci.product.stock - ci.quantity);
        }
        return {
          id: idx + 1,
          order_id: 0,
          product_id: ci.product_id,
          quantity: ci.quantity,
          price_at_purchase: price,
          product: ci.product,
        };
      });
    }

    const farmer = this.users.find((u) => u.id === farmerId);
    const newOrder: Order = {
      id: this.orders.length ? Math.max(...this.orders.map((o) => o.id)) + 1 : 1,
      farmer_id: farmerId,
      farmer_name: farmer ? farmer.name : 'Farmer',
      status: 'PLACED',
      total_amount: total,
      delivery_address: deliveryAddress || farmer?.location || 'Nashik, Maharashtra',
      razorpay_order_id: razorpayOrderId || `order_test_${Date.now()}`,
      razorpay_payment_id: razorpayPaymentId,
      items: orderItems,
      created_at: new Date().toISOString(),
    };

    newOrder.items.forEach((item) => (item.order_id = newOrder.id));
    this.orders.unshift(newOrder);
    setStorage(STORAGE_KEYS.ORDERS, this.orders);
    setStorage(STORAGE_KEYS.PRODUCTS, this.products);
    this.clearCart(farmerId);
    return newOrder;
  }

  public getOrders(userId?: number, role?: string): Order[] {
    if (role === 'ADMIN') return this.orders;
    if (role === 'FARMER' && userId) {
      return this.orders.filter((o) => o.farmer_id === userId);
    }
    if (role === 'VENDOR' && userId) {
      // Return orders containing products owned by this vendor
      return this.orders.filter((o) =>
        o.items.some((item) => {
          const prod = this.products.find((p) => p.id === item.product_id);
          return prod && prod.vendor_id === userId;
        })
      );
    }
    return this.orders;
  }

  public getOrderById(id: number): Order {
    const o = this.orders.find((ord) => ord.id === id);
    if (!o) throw new Error('Order not found');
    return o;
  }

  public updateOrderStatus(orderId: number, status: OrderStatus, paymentId?: string): Order {
    let o = this.orders.find((ord) => ord.id === orderId);
    if (!o) {
      o = {
        id: orderId,
        farmer_id: 1,
        farmer_name: 'Farmer',
        status,
        total_amount: 0,
        razorpay_payment_id: paymentId,
        items: [],
        created_at: new Date().toISOString(),
      };
      this.orders.unshift(o);
    } else {
      o.status = status;
      if (paymentId) o.razorpay_payment_id = paymentId;
      o.updated_at = new Date().toISOString();
    }
    setStorage(STORAGE_KEYS.ORDERS, this.orders);
    return o;
  }

  // EQUIPMENT
  public getEquipment(type?: string, location?: string, search?: string): Equipment[] {
    let result = [...this.equipmentList];
    if (type && type !== 'ALL') {
      result = result.filter((e) => e.type === type);
    }
    if (location) {
      result = result.filter((e) => e.location.toLowerCase().includes(location.toLowerCase().trim()));
    }
    if (search) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.specifications.toLowerCase().includes(q) ||
          e.type.toLowerCase().replace('_', ' ').includes(q) ||
          (e.owner_name && e.owner_name.toLowerCase().includes(q))
      );
    }
    return result;
  }

  public getEquipmentById(id: number): Equipment {
    const eq = this.equipmentList.find((e) => e.id === id);
    if (!eq) throw new Error('Equipment not found');
    return eq;
  }

  public createEquipment(data: Omit<Equipment, 'id' | 'created_at'>): Equipment {
    const newEq: Equipment = {
      ...data,
      id: this.equipmentList.length ? Math.max(...this.equipmentList.map((e) => e.id)) + 1 : 1,
      created_at: new Date().toISOString(),
    };
    this.equipmentList.push(newEq);
    setStorage(STORAGE_KEYS.EQUIPMENT, this.equipmentList);
    return newEq;
  }

  public updateEquipment(id: number, data: Partial<Equipment>): Equipment {
    const idx = this.equipmentList.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error('Equipment not found');
    this.equipmentList[idx] = {
      ...this.equipmentList[idx],
      ...data,
      updated_at: new Date().toISOString(),
    };
    setStorage(STORAGE_KEYS.EQUIPMENT, this.equipmentList);
    return this.equipmentList[idx];
  }

  public deleteEquipment(id: number): boolean {
    this.equipmentList = this.equipmentList.filter((e) => e.id !== id);
    setStorage(STORAGE_KEYS.EQUIPMENT, this.equipmentList);
    return true;
  }

  // FCFS BOOKING QUEUE ENGINE
  public createBookingRequest(
    farmerId: number,
    equipmentId: number,
    startDate: string,
    endDate: string
  ): BookingRequest {
    this.checkAndPromoteExpiredBookings();

    const eq = this.getEquipmentById(equipmentId);
    const farmer = this.users.find((u) => u.id === farmerId);

    // Validate start and end dates
    const s = new Date(startDate).getTime();
    const e = new Date(endDate).getTime();
    if (isNaN(s) || isNaN(e) || e <= s) {
      throw new Error('End date must be strictly after start date.');
    }
    if (s < Date.now() - 5 * 60 * 1000) {
      throw new Error('Booking dates cannot be in the past.');
    }

    // Rule 1: Check for overlapping CONFIRMED bookings
    const overlappingConfirmed = this.bookings.find(
      (b) =>
        b.equipment_id === equipmentId &&
        b.status === 'CONFIRMED' &&
        checkDateOverlap(b.start_date, b.end_date, startDate, endDate)
    );

    if (overlappingConfirmed) {
      throw new Error(
        'Equipment is already CONFIRMED booked for this requested date range. Please select alternative dates.'
      );
    }

    // Rule 2: Check for existing CONFIRMATION_PENDING booking for overlapping dates
    const competingPending = this.bookings.find(
      (b) =>
        b.equipment_id === equipmentId &&
        b.status === 'CONFIRMATION_PENDING' &&
        checkDateOverlap(b.start_date, b.end_date, startDate, endDate)
    );

    let status: BookingRequest['status'] = 'CONFIRMATION_PENDING';
    let confirmationDeadline: string | undefined = undefined;
    let queuePos = 1;

    if (!competingPending) {
      // Direct confirmation opportunity!
      status = 'CONFIRMATION_PENDING';
      const deadline = new Date();
      deadline.setHours(deadline.getHours() + this.bookingConfirmationHours);
      confirmationDeadline = deadline.toISOString();
      queuePos = 1;
    } else {
      // Another farmer already has a competing confirmation opportunity: QUEUED
      status = 'QUEUED';
      // Calculate queue position: count all competing active queued requests + 1
      const existingQueued = this.bookings.filter(
        (b) =>
          b.equipment_id === equipmentId &&
          b.status === 'QUEUED' &&
          checkDateOverlap(b.start_date, b.end_date, startDate, endDate)
      );
      queuePos = existingQueued.length + 2; // +1 for the pending one, +1 for this one
    }

    const newBooking: BookingRequest = {
      id: this.bookings.length ? Math.max(...this.bookings.map((b) => b.id)) + 1 : 1,
      equipment_id: equipmentId,
      equipment_name: eq.name,
      equipment_type: eq.type,
      equipment_rate: eq.rate,
      equipment_rate_unit: eq.rate_unit,
      equipment_location: eq.location,
      farmer_id: farmerId,
      farmer_name: farmer ? farmer.name : 'Farmer',
      farmer_phone: farmer ? farmer.phone : '',
      start_date: startDate,
      end_date: endDate,
      status,
      queue_position: queuePos,
      confirmation_deadline: confirmationDeadline,
      created_at: new Date().toISOString(),
    };

    this.bookings.unshift(newBooking);
    setStorage(STORAGE_KEYS.BOOKINGS, this.bookings);
    return newBooking;
  }

  public confirmBooking(bookingId: number, farmerId: number): BookingRequest {
    this.checkAndPromoteExpiredBookings();
    const b = this.bookings.find((item) => item.id === bookingId);
    if (!b) throw new Error('Booking request not found');

    if (b.farmer_id !== farmerId) {
      throw new Error('Unauthorized to confirm this booking request.');
    }

    if (b.status !== 'CONFIRMATION_PENDING') {
      throw new Error(`Cannot confirm booking with status '${b.status}'. Only CONFIRMATION_PENDING can be confirmed.`);
    }

    // Check if deadline passed
    if (b.confirmation_deadline && new Date(b.confirmation_deadline).getTime() < Date.now()) {
      b.status = 'EXPIRED';
      setStorage(STORAGE_KEYS.BOOKINGS, this.bookings);
      this.promoteNextQueuedBooking(b.equipment_id, b.start_date, b.end_date);
      throw new Error('Confirmation window has expired for this booking.');
    }

    // Prevent overlapping confirmed bookings
    const conflict = this.bookings.find(
      (other) =>
        other.id !== b.id &&
        other.equipment_id === b.equipment_id &&
        other.status === 'CONFIRMED' &&
        checkDateOverlap(other.start_date, other.end_date, b.start_date, b.end_date)
    );

    if (conflict) {
      throw new Error('A conflicting booking was already confirmed for this time slot.');
    }

    b.status = 'CONFIRMED';
    b.confirmation_deadline = undefined;
    b.updated_at = new Date().toISOString();

    setStorage(STORAGE_KEYS.BOOKINGS, this.bookings);
    return b;
  }

  public cancelBooking(bookingId: number, farmerId: number): BookingRequest {
    const b = this.bookings.find((item) => item.id === bookingId);
    if (!b) throw new Error('Booking request not found');

    if (b.farmer_id !== farmerId && farmerId !== 4 /* Admin */) {
      throw new Error('Unauthorized to cancel this booking.');
    }

    const wasPending = b.status === 'CONFIRMATION_PENDING';
    b.status = 'CANCELLED';
    b.updated_at = new Date().toISOString();

    // If a pending booking was cancelled, promote next eligible queued request
    if (wasPending) {
      this.promoteNextQueuedBooking(b.equipment_id, b.start_date, b.end_date);
    }

    setStorage(STORAGE_KEYS.BOOKINGS, this.bookings);
    return b;
  }

  public getBookings(farmerId?: number, equipmentOwnerId?: number, role?: string): BookingRequest[] {
    this.checkAndPromoteExpiredBookings();

    if (role === 'ADMIN') return this.bookings;

    if (equipmentOwnerId) {
      // Find all equipment owned by this user
      const myEquipmentIds = this.equipmentList
        .filter((e) => e.owner_id === equipmentOwnerId)
        .map((e) => e.id);
      return this.bookings.filter((b) => myEquipmentIds.includes(b.equipment_id));
    }

    if (farmerId) {
      return this.bookings.filter((b) => b.farmer_id === farmerId);
    }

    return this.bookings;
  }

  public getBookingById(id: number): BookingRequest {
    this.checkAndPromoteExpiredBookings();
    const b = this.bookings.find((item) => item.id === id);
    if (!b) throw new Error('Booking not found');
    return b;
  }

  public getAdminStats(): AdminStats {
    const totalUsers = this.users.length;
    const farmers = this.users.filter((u) => u.role === 'FARMER').length;
    const vendors = this.users.filter((u) => u.role === 'VENDOR').length;
    const owners = this.users.filter((u) => u.is_equipment_owner).length;
    const revenue = this.orders.reduce((sum, o) => sum + o.total_amount, 0);

    return {
      total_users: totalUsers,
      total_farmers: farmers,
      total_vendors: vendors,
      total_equipment_owners: owners,
      total_products: this.products.length,
      total_equipment: this.equipmentList.length,
      total_orders: this.orders.length,
      total_bookings: this.bookings.length,
      total_revenue: revenue,
    };
  }
}

export const mockBackend = new MockBackendEngine();

// Centralized API Service interface
export const api = {
  // Check if live FastAPI backend is reachable
  async checkBackendHealth(): Promise<boolean> {
    try {
      const res = await apiClient.get('/health', { timeout: 5000 });
      return res.status === 200;
    } catch {
      return false;
    }
  },

  // Auth APIs
  async login(email: string, password?: string) {
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      return res.data;
    } catch (err: any) {
      // Fallback to mock backend for live demo
      return mockBackend.login(email);
    }
  },

  async register(data: {
    name: string;
    email: string;
    password?: string;
    phone: string;
    role: 'FARMER' | 'VENDOR' | 'ADMIN';
    is_equipment_owner?: boolean;
    location: string;
  }) {
    try {
      const res = await apiClient.post('/auth/register', data);
      return res.data;
    } catch {
      return mockBackend.register(data);
    }
  },

  async getMe() {
    try {
      const res = await apiClient.get('/auth/me');
      return res.data;
    } catch {
      const userStr = localStorage.getItem('krishi_user');
      if (userStr) {
        const u = JSON.parse(userStr);
        return mockBackend.getMe(u.id);
      }
      throw new Error('Not authenticated');
    }
  },

  async updateProfile(data: Partial<User> & { password?: string }): Promise<User> {
    try {
      const res = await apiClient.put('/auth/me', data);
      return res.data;
    } catch {
      const userStr = localStorage.getItem('krishi_user');
      if (userStr) {
        const u = JSON.parse(userStr);
        const updated = { ...u, ...data };
        delete (updated as any).password;
        localStorage.setItem('krishi_user', JSON.stringify(updated));
        return updated;
      }
      throw new Error('User not found');
    }
  },

  // Products
  async getProducts(category?: string, search?: string): Promise<Product[]> {
    try {
      const params: any = {};
      if (category && category !== 'ALL') params.category = category;
      if (search) params.search = search;
      const res = await apiClient.get('/products', { params });
      return res.data;
    } catch {
      return mockBackend.getProducts(category, search);
    }
  },

  async getProduct(id: number): Promise<Product> {
    try {
      const res = await apiClient.get(`/products/${id}`);
      return res.data;
    } catch {
      return mockBackend.getProductById(id);
    }
  },

  async createProduct(data: any): Promise<Product> {
    try {
      const res = await apiClient.post('/products', data);
      return res.data;
    } catch (err) {
      console.error('Failed to create product on backend:', err);
      throw err;
    }
  },

  async updateProduct(id: number, data: any): Promise<Product> {
    try {
      const res = await apiClient.put(`/products/${id}`, data);
      return res.data;
    } catch (err) {
      console.error('Failed to update product on backend:', err);
      throw err;
    }
  },

  async deleteProduct(id: number): Promise<boolean> {
    try {
      await apiClient.delete(`/products/${id}`);
      return true;
    } catch (err) {
      console.error('Failed to delete product on backend:', err);
      throw err;
    }
  },

  async getMyVendorProducts(): Promise<Product[]> {
    try {
      const res = await apiClient.get('/products/my');
      return res.data;
    } catch {
      const userStr = localStorage.getItem('krishi_user');
      const user = userStr ? JSON.parse(userStr) : null;
      const all = mockBackend.getProducts();
      if (!user) return all;
      return all.filter((p) => p.vendor_id === user.id);
    }
  },

  // Cart
  async getCart(): Promise<CartItem[]> {
    try {
      const res = await apiClient.get('/cart');
      return res.data;
    } catch {
      const userStr = localStorage.getItem('krishi_user');
      const farmerId = userStr ? JSON.parse(userStr).id : 1;
      return mockBackend.getCart(farmerId);
    }
  },

  async addToCart(productId: number, quantity: number = 1): Promise<CartItem> {
    try {
      const res = await apiClient.post('/cart', { product_id: productId, quantity });
      return res.data;
    } catch {
      const userStr = localStorage.getItem('krishi_user');
      const farmerId = userStr ? JSON.parse(userStr).id : 1;
      return mockBackend.addToCart(farmerId, productId, quantity);
    }
  },

  async updateCartItem(id: number, quantity: number): Promise<CartItem> {
    try {
      const res = await apiClient.put(`/cart/${id}`, { quantity });
      return res.data;
    } catch {
      return mockBackend.updateCartItem(id, quantity);
    }
  },

  async deleteCartItem(id: number): Promise<boolean> {
    try {
      await apiClient.delete(`/cart/${id}`);
      return true;
    } catch {
      return mockBackend.deleteCartItem(id);
    }
  },

  async clearCart(): Promise<boolean> {
    try {
      await apiClient.delete('/cart');
      const userStr = localStorage.getItem('krishi_user');
      const farmerId = userStr ? JSON.parse(userStr).id : 1;
      mockBackend.clearCart(farmerId);
      return true;
    } catch {
      const userStr = localStorage.getItem('krishi_user');
      const farmerId = userStr ? JSON.parse(userStr).id : 1;
      mockBackend.clearCart(farmerId);
      return true;
    }
  },

  // Orders & Payment
  async createRazorpayOrder(amount: number) {
    try {
      const res = await apiClient.post('/payments/create-order', { amount });
      return res.data;
    } catch {
      return {
        id: `order_test_${Date.now()}`,
        amount: amount * 100,
        currency: 'INR',
        key_id: 'rzp_test_KRISHISETU12345',
      };
    }
  },

  async createOrder(dataOrRazorpayOrderId?: any, razorpayPaymentId?: string): Promise<Order> {
    const payload = typeof dataOrRazorpayOrderId === 'object'
      ? dataOrRazorpayOrderId
      : { razorpay_order_id: dataOrRazorpayOrderId, razorpay_payment_id: razorpayPaymentId };
    try {
      const res = await apiClient.post('/orders', payload);
      if (res.data) {
        mockBackend.saveOrder(res.data);
      }
      return res.data;
    } catch {
      const userStr = localStorage.getItem('krishi_user');
      const farmerId = userStr ? JSON.parse(userStr).id : 1;
      const rzpOrderId = typeof dataOrRazorpayOrderId === 'object' ? dataOrRazorpayOrderId?.razorpay_order_id : dataOrRazorpayOrderId;
      const deliveryAddress = typeof dataOrRazorpayOrderId === 'object' ? dataOrRazorpayOrderId?.delivery_address : undefined;
      const items = typeof dataOrRazorpayOrderId === 'object' ? dataOrRazorpayOrderId?.items : undefined;
      return mockBackend.createOrder(farmerId, rzpOrderId, razorpayPaymentId, deliveryAddress, items);
    }
  },

  async verifyPayment(data: {
    order_id: number;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<boolean> {
    try {
      await apiClient.post('/payments/verify', data);
      mockBackend.updateOrderStatus(data.order_id, 'CONFIRMED', data.razorpay_payment_id);
      return true;
    } catch {
      // Backend unavailable or order created in mock
      mockBackend.updateOrderStatus(data.order_id, 'CONFIRMED', data.razorpay_payment_id);
      return true;
    }
  },

  async getMyOrders(): Promise<Order[]> {
    const userStr = localStorage.getItem('krishi_user');
    const user = userStr ? JSON.parse(userStr) : null;
    try {
      const res = await apiClient.get('/orders/my');
      const orders: Order[] = res.data || [];
      for (const ord of orders) {
        mockBackend.saveOrder(ord);
      }
      return orders;
    } catch {
      return mockBackend.getOrders(user?.id, user?.role);
    }
  },

  async getOrder(id: number): Promise<Order> {
    try {
      const res = await apiClient.get(`/orders/${id}`);
      if (res.data) {
        mockBackend.saveOrder(res.data);
      }
      return res.data;
    } catch {
      return mockBackend.getOrderById(id);
    }
  },

  async updateOrderStatus(id: number, status: OrderStatus): Promise<Order> {
    try {
      const res = await apiClient.put(`/orders/${id}/status`, { status });
      if (res.data) {
        mockBackend.saveOrder(res.data);
      }
      return res.data;
    } catch {
      return mockBackend.updateOrderStatus(id, status);
    }
  },

  // Equipment
  async getEquipment(type?: string, location?: string, search?: string): Promise<Equipment[]> {
    try {
      const params: any = {};
      if (type && type !== 'ALL') params.type = type;
      if (location) params.location = location;
      if (search) params.search = search;
      const res = await apiClient.get('/equipment', { params });
      return res.data;
    } catch {
      return mockBackend.getEquipment(type, location, search);
    }
  },

  async getEquipmentById(id: number): Promise<Equipment> {
    try {
      const res = await apiClient.get(`/equipment/${id}`);
      return res.data;
    } catch {
      return mockBackend.getEquipmentById(id);
    }
  },

  async createEquipment(data: any): Promise<Equipment> {
    try {
      const res = await apiClient.post('/equipment', data);
      return res.data;
    } catch (err) {
      console.error('Failed to create equipment on backend:', err);
      throw err;
    }
  },

  async updateEquipment(id: number, data: any): Promise<Equipment> {
    try {
      const res = await apiClient.put(`/equipment/${id}`, data);
      return res.data;
    } catch (err) {
      console.error('Failed to update equipment on backend:', err);
      throw err;
    }
  },

  async deleteEquipment(id: number): Promise<boolean> {
    try {
      await apiClient.delete(`/equipment/${id}`);
      return true;
    } catch (err) {
      console.error('Failed to delete equipment on backend:', err);
      throw err;
    }
  },

  async getMyListedEquipment(): Promise<Equipment[]> {
    try {
      const res = await apiClient.get('/equipment/my');
      return res.data;
    } catch {
      const userStr = localStorage.getItem('krishi_user');
      const user = userStr ? JSON.parse(userStr) : null;
      const all = mockBackend.getEquipment();
      if (!user) return all;
      return all.filter((eq) => eq.owner_id === user.id);
    }
  },

  async getEquipmentBookings(equipmentId: number): Promise<BookingRequest[]> {
    try {
      const res = await apiClient.get(`/equipment/${equipmentId}/bookings`);
      return res.data;
    } catch {
      const all = mockBackend.getBookings();
      return all.filter((b) => b.equipment_id === equipmentId);
    }
  },

  // Bookings
  async createBooking(data: {
    equipment_id: number;
    start_date: string;
    end_date: string;
  }): Promise<BookingRequest> {
    try {
      const res = await apiClient.post('/bookings', data);
      return res.data;
    } catch {
      const userStr = localStorage.getItem('krishi_user');
      const farmerId = userStr ? JSON.parse(userStr).id : 1;
      return mockBackend.createBookingRequest(farmerId, data.equipment_id, data.start_date, data.end_date);
    }
  },

  async getMyBookings(): Promise<BookingRequest[]> {
    try {
      const res = await apiClient.get('/bookings/my');
      return res.data;
    } catch {
      const userStr = localStorage.getItem('krishi_user');
      const user = userStr ? JSON.parse(userStr) : null;
      return mockBackend.getBookings(user?.id, undefined, user?.role);
    }
  },

  async getOwnerBookings(): Promise<BookingRequest[]> {
    try {
      const res = await apiClient.get('/bookings/owner');
      return res.data;
    } catch {
      const userStr = localStorage.getItem('krishi_user');
      const user = userStr ? JSON.parse(userStr) : null;
      return mockBackend.getBookings(undefined, user?.id, user?.role);
    }
  },

  async getBooking(id: number): Promise<BookingRequest> {
    try {
      const res = await apiClient.get(`/bookings/${id}`);
      return res.data;
    } catch {
      return mockBackend.getBookingById(id);
    }
  },

  async confirmBooking(id: number): Promise<BookingRequest> {
    try {
      const res = await apiClient.post(`/bookings/${id}/confirm`);
      return res.data;
    } catch {
      const userStr = localStorage.getItem('krishi_user');
      const farmerId = userStr ? JSON.parse(userStr).id : 1;
      return mockBackend.confirmBooking(id, farmerId);
    }
  },

  async cancelBooking(id: number): Promise<BookingRequest> {
    try {
      const res = await apiClient.post(`/bookings/${id}/cancel`);
      return res.data;
    } catch {
      const userStr = localStorage.getItem('krishi_user');
      const farmerId = userStr ? JSON.parse(userStr).id : 1;
      return mockBackend.cancelBooking(id, farmerId);
    }
  },

  // Admin APIs
  async getAdminStats(): Promise<AdminStats> {
    try {
      const res = await apiClient.get('/admin/stats');
      return res.data;
    } catch {
      return mockBackend.getAdminStats();
    }
  },

  async getAllUsers(): Promise<User[]> {
    try {
      const res = await apiClient.get('/admin/users');
      return res.data;
    } catch {
      return getStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
    }
  },

  async getAdminUsers(): Promise<User[]> {
    return this.getAllUsers();
  },

  async getAdminOrders(): Promise<Order[]> {
    return this.getAllOrders();
  },

  async getAllOrders(): Promise<Order[]> {
    try {
      const res = await apiClient.get('/admin/orders');
      return res.data;
    } catch {
      return mockBackend.getOrders(undefined, 'ADMIN');
    }
  },

  async getAllBookings(): Promise<BookingRequest[]> {
    try {
      const res = await apiClient.get('/admin/bookings');
      return res.data;
    } catch {
      return mockBackend.getBookings(undefined, undefined, 'ADMIN');
    }
  },

  // ====================================================================
  // SEMESTER PROJECT: 4-TABLE RENTAL MODULE API CLIENT
  // ====================================================================

  // Table 1: Equipment Listings
  async getEquipmentListings(params?: {
    category?: string;
    location?: string;
    search?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<EquipmentListing[]> {
    const res = await apiClient.get('/rentals/listings', { params });
    return res.data;
  },

  async getEquipmentListingDetail(id: number, startDate?: string, endDate?: string): Promise<EquipmentListing> {
    const params = (startDate && endDate) ? { start_date: startDate, end_date: endDate } : undefined;
    const res = await apiClient.get(`/rentals/listings/${id}`, { params });
    return res.data;
  },

  async createEquipmentListing(data: Partial<EquipmentListing>): Promise<EquipmentListing> {
    const res = await apiClient.post('/rentals/listings', data);
    return res.data;
  },

  async updateEquipmentListing(id: number, data: Partial<EquipmentListing>): Promise<EquipmentListing> {
    const res = await apiClient.put(`/rentals/listings/${id}`, data);
    return res.data;
  },

  async deleteEquipmentListing(id: number): Promise<{ status: string; message: string }> {
    const res = await apiClient.delete(`/rentals/listings/${id}`);
    return res.data;
  },

  async getMyEquipmentListings(): Promise<EquipmentListing[]> {
    const res = await apiClient.get('/rentals/my-listings');
    return res.data;
  },

  // Dynamic Availability
  async checkEquipmentAvailability(listingId: number, startDate: string, endDate: string): Promise<AvailabilityCheck> {
    const res = await apiClient.get(`/rentals/listings/${listingId}/availability`, {
      params: { start_date: startDate, end_date: endDate }
    });
    return res.data;
  },

  // Table 2: Rental Records
  async requestRental(data: {
    listing_id: number;
    quantity_rented: number;
    rental_start_date: string;
    rental_end_date: string;
  }): Promise<RentalRecord> {
    const res = await apiClient.post('/rentals/records', data);
    return res.data;
  },

  async getMyRentals(): Promise<RentalRecord[]> {
    const res = await apiClient.get('/rentals/my-rentals');
    return res.data;
  },

  async getOwnerRentalRequests(): Promise<RentalRecord[]> {
    const res = await apiClient.get('/rentals/owner-requests');
    return res.data;
  },

  async updateRentalStatus(rentalId: number, status: string): Promise<RentalRecord> {
    const res = await apiClient.patch(`/rentals/records/${rentalId}/status`, {
      rental_status: status
    });
    return res.data;
  },

  // Table 3: Rental Payments
  async createRentalPayment(data: {
    rental_id: number;
    amount: number;
    payment_method?: string;
    transaction_reference?: string;
  }): Promise<RentalPayment> {
    const res = await apiClient.post('/rentals/payments', data);
    return res.data;
  },

  async getRentalPayments(rentalId: number): Promise<RentalPayment[]> {
    const res = await apiClient.get(`/rentals/records/${rentalId}/payments`);
    return res.data;
  },

  // Table 4: Rental Queue
  async joinRentalQueue(data: {
    listing_id: number;
    requested_quantity: number;
    requested_start_date: string;
    requested_end_date: string;
  }): Promise<RentalQueueEntry> {
    const res = await apiClient.post('/rentals/queue', data);
    return res.data;
  },

  async getMyQueueEntries(): Promise<RentalQueueEntry[]> {
    const res = await apiClient.get('/rentals/my-queue');
    return res.data;
  },

  async leaveRentalQueue(queueId: number): Promise<{ status: string; message: string }> {
    const res = await apiClient.delete(`/rentals/queue/${queueId}`);
    return res.data;
  },

  async getListingQueue(listingId: number): Promise<RentalQueueEntry[]> {
    const res = await apiClient.get(`/rentals/listings/${listingId}/queue`);
    return res.data;
  },
};
