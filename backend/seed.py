import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from datetime import datetime, timedelta
from backend.database import SessionLocal, engine, Base
from backend.models import (
    User,
    UserRole,
    Product,
    ProductCategory,
    Equipment,
    EquipmentType,
    RateUnit,
    BookingRequest,
    BookingStatus,
)
from backend.auth import get_password_hash

def seed():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        print("[Krishisetu DB] Seeding full agricultural catalog...")

        # 1. Ensure Users exist
        def get_or_create_user(email, name, role, is_owner, phone, location, password):
            u = db.query(User).filter(User.email == email).first()
            if not u:
                u = User(
                    name=name,
                    email=email,
                    hashed_password=get_password_hash(password),
                    phone=phone,
                    role=role,
                    is_equipment_owner=is_owner,
                    location=location,
                )
                db.add(u)
                db.commit()
                db.refresh(u)
            return u

        farmer1 = get_or_create_user(
            "farmer@krishisetu.com", "Ramesh Kumar (Farmer & Owner)",
            UserRole.FARMER, True, "9876543210", "Nashik, Maharashtra", "farmer123"
        )
        farmer2 = get_or_create_user(
            "farmer2@krishisetu.com", "Suresh Patil (Farmer & Owner)",
            UserRole.FARMER, True, "9876543211", "Pune, Maharashtra", "farmer123"
        )
        vendor1 = get_or_create_user(
            "vendor@krishisetu.com", "AgriCorp Agro Chemicals",
            UserRole.VENDOR, False, "9876543220", "Nagpur, Maharashtra", "vendor123"
        )
        admin1 = get_or_create_user(
            "admin@krishisetu.com", "Krishisetu Administrator",
            UserRole.ADMIN, False, "9876543230", "Mumbai, Maharashtra", "admin123"
        )
        vendor2 = get_or_create_user(
            "vendor2@krishisetu.com", "Kisan Krishi Seva Kendra",
            UserRole.VENDOR, False, "9823114455", "Kolhapur, Maharashtra", "vendor123"
        )
        vendor3 = get_or_create_user(
            "vendor3@krishisetu.com", "Godavari Irrigation & Farm Tech",
            UserRole.VENDOR, False, "9850223344", "Ahmednagar, Maharashtra", "vendor123"
        )
        owner3 = get_or_create_user(
            "owner3@krishisetu.com", "Vikram Deshmukh (Machinery Owner)",
            UserRole.FARMER, True, "9890445566", "Satara, Maharashtra", "farmer123"
        )

        # 2. Seed All 14 Full Products
        products_data = [
            {
                "product_id": "P001",
                "vendor_id": vendor1.id,
                "name": "Certified Golden Wheat Seeds - HD 2967 (50kg Sack)",
                "category": ProductCategory.SEEDS,
                "price": 1650.0,
                "stock": 95,
                "description": "ICAR-certified high-yield, yellow-rust resistant wheat seed variety suitable for irrigated and timely sown conditions across northern and central plains. Germination rate above 96%.",
                "image_url": "/src/assets/images/wheat_seeds_sack_1791500903435.jpg",
            },
            {
                "product_id": "P002",
                "vendor_id": vendor2.id,
                "name": "Royal Harvest Pusa-1121 Basmati Paddy Seeds (25kg)",
                "category": ProductCategory.SEEDS,
                "price": 2150.0,
                "stock": 64,
                "description": "Extra-long slender grain aromatic Basmati paddy seeds with high market value, strong culm strength, and superior milling recovery. Ideal for Kharif transplanting.",
                "image_url": "/src/assets/images/basmati_paddy_seeds_1791500920007.jpg",
            },
            {
                "product_id": "P003",
                "vendor_id": vendor1.id,
                "name": "Progeny F1 Hybrid Bt Cotton Seeds - ACT-777 (450g)",
                "category": ProductCategory.SEEDS,
                "price": 860.0,
                "stock": 120,
                "description": "Cruiser-Plus systemic fungicide & insecticide treated F1 hybrid cotton seeds with big boll size, high ginning percentage, and tolerance against pink bollworm and jassids.",
                "image_url": "/src/assets/images/hybrid_cotton_seeds_1791500931145.jpg",
            },
            {
                "product_id": "P004",
                "vendor_id": vendor2.id,
                "name": "High-Yield Hybrid Maize & JS-9560 Soybean Combo (25kg)",
                "category": ProductCategory.SEEDS,
                "price": 1920.0,
                "stock": 48,
                "description": "Certified bold-seeded yellow maize and high-oil JS-9560 soybean foundation seeds. Features drought tolerance, early maturity (95 days), and shatter-resistant pods.",
                "image_url": "/src/assets/images/soybean_maize_seeds_1791500943314.jpg",
            },
            {
                "product_id": "P005",
                "vendor_id": vendor1.id,
                "name": "GrowMax NPK 19:19:19 100% Water Soluble Fertilizer (25kg)",
                "category": ProductCategory.FERTILIZER,
                "price": 1850.0,
                "stock": 72,
                "description": "Free-flowing crystalline balanced macronutrient formula (19% N, 19% P, 19% K) for drip fertigation and foliar spray. Boosts vegetative branching, root vigor, and fruit setting.",
                "image_url": "/src/assets/images/npk_fertilizer_bag_1791500953747.jpg",
            },
            {
                "product_id": "P006",
                "vendor_id": vendor2.id,
                "name": "Krishi Neem Coated Urea 46% Nitrogen Fertilizer (45kg)",
                "category": ProductCategory.FERTILIZER,
                "price": 268.0,
                "stock": 310,
                "description": "Government-grade prilled urea coated with natural neem oil to slow nitrification, prevent leaching loss, and deliver sustained nitrogen nutrition to cereal and cash crops.",
                "image_url": "/src/assets/images/neem_coated_urea_1791500964626.jpg",
            },
            {
                "product_id": "P007",
                "vendor_id": vendor1.id,
                "name": "Granular DAP (18:46:0) & Zinc Sulphate 33% Combo Pack (50kg)",
                "category": ProductCategory.FERTILIZER,
                "price": 1580.0,
                "stock": 55,
                "description": "Basal dose Di-Ammonium Phosphate paired with Zinc Sulphate Monohydrate 33% to eliminate Khaira disease in paddy and establish deep root architecture in wheat and sugarcane.",
                "image_url": "/src/assets/images/dap_zinc_fertilizer_1791500980608.jpg",
            },
            {
                "product_id": "P008",
                "vendor_id": vendor2.id,
                "name": "Eco-Gro Enriched Organic Vermicompost & Bio-Potash (50kg)",
                "category": ProductCategory.FERTILIZER,
                "price": 540.0,
                "stock": 140,
                "description": "Earthworm-processed humus-rich organic manure blended with mobilized bio-potash granules and Trichoderma viride. Improves soil water retention, aeration, and microbial life.",
                "image_url": "/src/assets/images/organic_vermicompost_potash_1791500991903.jpg",
            },
            {
                "product_id": "P009",
                "vendor_id": vendor1.id,
                "name": "Cold-Pressed Azadirachtin 10000 ppm Neem Oil Bio-Pesticide (5L)",
                "category": ProductCategory.PESTICIDE,
                "price": 1120.0,
                "stock": 68,
                "description": "100% organic botanical antifeedant and insect growth regulator effective against whiteflies, aphids, thrips, mites, and leaf miners without harming beneficial pollinators.",
                "image_url": "/src/assets/images/neem_oil_biopesticide_1791501004700.jpg",
            },
            {
                "product_id": "P010",
                "vendor_id": vendor1.id,
                "name": "CropShield Systemic Fungicide & Broad-Spectrum Insecticide Kit (1L)",
                "category": ProductCategory.PESTICIDE,
                "price": 890.0,
                "stock": 42,
                "description": "Dual-action systemic crop protection pack containing Azoxystrobin + Tebuconazole fungicide and Thiamethoxam insecticide for rapid control of blight, rust, and stem borers.",
                "image_url": "/src/assets/images/crop_fungicide_insecticide_1791501015614.jpg",
            },
            {
                "product_id": "P011",
                "vendor_id": vendor3.id,
                "name": "DripLine 16mm Inline HDPE Irrigation Pipe Coil & Valve Kit (300m)",
                "category": ProductCategory.IRRIGATION,
                "price": 3450.0,
                "stock": 28,
                "description": "UV-stabilized Virgin Grade PE-100 HDPE drip irrigation lateral coil with pre-fitted cylindrical emitters at 40cm spacing, PVC ball valves, and brass impact sprinkler heads.",
                "image_url": "/src/assets/images/hdpe_irrigation_pipes_1791501025898.jpg",
            },
            {
                "product_id": "P012",
                "vendor_id": vendor3.id,
                "name": "AgriFlow 110mm Quick-Connect PVC Sprinkler Pipes & Brass Rain Gun",
                "category": ProductCategory.IRRIGATION,
                "price": 5800.0,
                "stock": 19,
                "description": "Heavy-duty ISI-marked 6 kg/cm² quick-coupled PVC portable irrigation pipes (6m lengths) with galvanized latch couplers and a 1.5-inch adjustable brass rain gun on tripod stand.",
                "image_url": "/src/assets/images/rain_gun_sprinkler_pipes_1791501234370.jpg",
            },
            {
                "product_id": "P013",
                "vendor_id": vendor3.id,
                "name": "FarmQuip 16L 12V-8Ah Li-Ion Battery Knapsack Sprayer with Brass Lance",
                "category": ProductCategory.SPRAYER,
                "price": 2650.0,
                "stock": 34,
                "description": "High-pressure diaphragm pump rechargeable knapsack sprayer capable of spraying 18–20 tanks per charge. Includes telescopic brass lance, pressure regulator gauge, and 4-nozzle set.",
                "image_url": "/src/assets/images/battery_knapsack_sprayer_1791501046903.jpg",
            },
            {
                "product_id": "P014",
                "vendor_id": vendor3.id,
                "name": "Solo 435 Petrol Motorized Knapsack Mist Blower & Duster Sprayer (20L)",
                "category": ProductCategory.SPRAYER,
                "price": 7400.0,
                "stock": 8,
                "description": "2-stroke 42cc petrol engine motorized orchard mist blower reaching up to 11 meters horizontal spray throw. Ideal for mango, pomegranate, vineyard, and tall field crops.",
                "image_url": "/src/assets/images/power_mist_blower_sprayer_1791501245816.jpg",
            },
        ]

        # Upsert products
        for pdata in products_data:
            existing = db.query(Product).filter(Product.name == pdata["name"]).first()
            if not existing:
                db.add(Product(**pdata))
        db.commit()

        # 3. Seed All 10 Full Machinery Units
        equipment_data = [
            {
                "rental_id": "R001",
                "owner_id": farmer1.id,
                "name": "Mahindra 575 DI XP Plus 50 HP 4WD Tractor",
                "type": EquipmentType.TRACTOR,
                "description": "High-torque 4-cylinder ELS diesel tractor with ROPS canopy, power steering, and heavy-duty ADDC hydraulic lift. Well-maintained and ready for deep ploughing, puddling, and haulage.",
                "specifications": "50 HP Engine | 4WD Front Axle | Dual Clutch | 1800 kg Hydraulic Lift | Oil Immersed Brakes",
                "rate": 650.0,
                "rate_unit": RateUnit.HOUR,
                "location": "Nashik, Maharashtra",
                "image_url": "/src/assets/images/mahindra_red_tractor_1791501058296.jpg",
            },
            {
                "rental_id": "R002",
                "owner_id": farmer2.id,
                "name": "John Deere 5310 PowerTech 55 HP 4WD Utility Tractor",
                "type": EquipmentType.TRACTOR,
                "description": "Turbocharged 55 HP 4-wheel-drive tractor featuring collar-shift gearbox, planetary gear reduction, and independent PTO for heavy-duty laser leveling and baler operations.",
                "specifications": "55 HP @ 2400 RPM | 9F + 3R CollarShift | 2000 kg Lift Capacity | Dual-RPM PTO (540/540E)",
                "rate": 780.0,
                "rate_unit": RateUnit.HOUR,
                "location": "Pune, Maharashtra",
                "image_url": "/src/assets/images/john_deere_green_tractor_1791501071564.jpg",
            },
            {
                "rental_id": "R003",
                "owner_id": owner3.id,
                "name": "New Holland 5500 Turbo Super 48 HP Tractor with Canopy",
                "type": EquipmentType.TRACTOR,
                "description": "Fuel-efficient 3-cylinder tractor with sun canopy, front counterweight ballast, and synchromesh transmission. Ideal for inter-cultivation, rotavator tillage, and trolley transport.",
                "specifications": "48 HP Engine | 8F + 2R Constant Mesh | 1700 kg Sensomatic24 Hydraulics | Power Steering",
                "rate": 580.0,
                "rate_unit": RateUnit.HOUR,
                "location": "Satara, Maharashtra",
                "image_url": "/src/assets/images/swaraj_blue_tractor_1791501084071.jpg",
            },
            {
                "rental_id": "R004",
                "owner_id": farmer1.id,
                "name": "Maschio Gaspardo Virat Pro 7 Feet Heavy Duty Rotavator",
                "type": EquipmentType.ROTAVATOR,
                "description": "Multi-speed gear-driven rotary tiller with boron steel curved L-blades that pulverizes clods, incorporates crop residue, and prepares a fine seedbed in a single pass.",
                "specifications": "7 Feet Working Width | 48 Boron Steel L-Blades | Multi-Speed Gearbox (540/1000 RPM) | Side Gear Drive",
                "rate": 420.0,
                "rate_unit": RateUnit.HOUR,
                "location": "Nashik, Maharashtra",
                "image_url": "/src/assets/images/rotavator_rotary_tiller_1791501094685.jpg",
            },
            {
                "rental_id": "R005",
                "owner_id": farmer2.id,
                "name": "John Deere W70 Self-Propelled Multi-Crop Combine Harvester",
                "type": EquipmentType.HARVESTER,
                "description": "High-throughput self-propelled combine harvester with air-conditioned operator cabin, 14-foot header reel, and 6-straw-walker threshing system for wheat, soybean, and gram.",
                "specifications": "100 HP Turbocharged Engine | 14 Ft Cutter Bar | 2700L Grain Tank | Posi-Torq Drive",
                "rate": 1950.0,
                "rate_unit": RateUnit.HOUR,
                "location": "Pune, Maharashtra",
                "image_url": "/src/assets/images/combine_harvester_machine_1791501105447.jpg",
            },
            {
                "rental_id": "R006",
                "owner_id": owner3.id,
                "name": "Yanmar YH600 Rubber-Track Paddy Combine Harvester",
                "type": EquipmentType.HARVESTER,
                "description": "Specialized rubber-crawler combine harvester engineered for wet and muddy paddy fields. Delivers ultra-low grain breakage and high-speed harvesting without soil compaction.",
                "specifications": "65 HP Diesel Engine | Rubber Crawler Tracks | 2.1m Reaping Width | Auto-Leveling Auger",
                "rate": 1750.0,
                "rate_unit": RateUnit.HOUR,
                "location": "Kolhapur, Maharashtra",
                "image_url": "/src/assets/images/paddy_combine_harvester_1791501270303.jpg",
            },
            {
                "rental_id": "R007",
                "owner_id": farmer1.id,
                "name": "Fieldking 9-Tyne Spring Loaded Cultivator & Reversible MB Plough",
                "type": EquipmentType.CULTIVATOR,
                "description": "Heavy-duty spring-loaded 9-tyne cultivator paired with a 2-bottom hydraulic reversible mould-board plough for breaking hardpan, aerating sub-soil, and uprooting stubborn weeds.",
                "specifications": "9 Heavy Duty Tynes | Twin-Spring Overload Protection | Reversible High-Carbon Shares | Cat-II Hitch",
                "rate": 320.0,
                "rate_unit": RateUnit.HOUR,
                "location": "Nashik, Maharashtra",
                "image_url": "/src/assets/images/spring_tyne_cultivator_1791501117714.jpg",
            },
            {
                "rental_id": "R008",
                "owner_id": farmer2.id,
                "name": "FarmPower 9-Row Zero-Till Multi-Crop Seed Cum Fertilizer Drill",
                "type": EquipmentType.SEED_DRILL,
                "description": "Precision zero-tillage seed and fertilizer drill that sows wheat, soybean, maize, and pulses directly into crop stubble while banding basal fertilizer at calibrated depth.",
                "specifications": "9 Rows | Inverted-T Furrow Openers | Dual Compartment Hopper | Ground-Wheel Chain Drive",
                "rate": 400.0,
                "rate_unit": RateUnit.HOUR,
                "location": "Ahmednagar, Maharashtra",
                "image_url": "/src/assets/images/seed_cum_fertilizer_drill_1791501128600.jpg",
            },
            {
                "rental_id": "R009",
                "owner_id": farmer1.id,
                "name": "Aspee HTP 500L Tractor Mounted Hydraulic Boom Sprayer",
                "type": EquipmentType.SPRAYER,
                "description": "High-volume tractor PTO-driven boom sprayer with a 40-foot foldable aluminum-steel truss boom and 28 anti-drift hollow-cone nozzles for rapid, uniform foliar application.",
                "specifications": "500L UV-Stabilized Tank | 40 Ft Folding Boom | 3-Piston Brass HTP Pump | 540 PTO Drive",
                "rate": 380.0,
                "rate_unit": RateUnit.HOUR,
                "location": "Nashik, Maharashtra",
                "image_url": "/src/assets/images/tractor_boom_sprayer_1791501140854.jpg",
            },
            {
                "rental_id": "R010",
                "owner_id": owner3.id,
                "name": "Apogee AP-20 Automatic Laser Guided Land Leveler Bucket",
                "type": EquipmentType.PLOUGH_LEVELER,
                "description": "Precision laser-guided drag bucket leveler with rotary laser transmitter and mast receiver. Saves up to 35% irrigation water and ensures uniform crop stand across fields.",
                "specifications": "7 Feet Scraper Bucket | 800m Laser Range | ±2mm Leveling Accuracy | 12V Solenoid Hydraulic Valve",
                "rate": 550.0,
                "rate_unit": RateUnit.HOUR,
                "location": "Satara, Maharashtra",
                "image_url": "/src/assets/images/laser_land_leveler_plough_1791501258441.jpg",
            },
        ]

        for eq in equipment_data:
            existing = db.query(Equipment).filter(Equipment.name == eq["name"]).first()
            if not existing:
                db.add(Equipment(**eq))
        db.commit()

        # 4. FCFS Bookings Demo
        eq1 = db.query(Equipment).first()
        if eq1 and db.query(BookingRequest).count() == 0:
            now = datetime.utcnow()
            b1 = BookingRequest(
                farmer_id=farmer1.id,
                equipment_id=eq1.id,
                start_date=now + timedelta(days=2),
                end_date=now + timedelta(days=4),
                status=BookingStatus.CONFIRMATION_PENDING,
                confirmation_deadline=now + timedelta(hours=24),
                queue_position=None,
            )
            b2 = BookingRequest(
                farmer_id=farmer2.id,
                equipment_id=eq1.id,
                start_date=now + timedelta(days=3),
                end_date=now + timedelta(days=5),
                status=BookingStatus.QUEUED,
                queue_position=1,
                confirmation_deadline=None,
            )
            db.add_all([b1, b2])
            db.commit()

        total_prods = db.query(Product).count()
        total_equip = db.query(Equipment).count()
        print(f"[Krishisetu DB] Seed complete! Total Products in DB: {total_prods}, Total Equipment in DB: {total_equip}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()

