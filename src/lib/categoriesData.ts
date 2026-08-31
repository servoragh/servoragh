import {
  Car,
  Home,
  Smartphone,
  Laptop,
  Shirt,
  Sparkles,
  Wrench,
  HardHat,
  Briefcase,
  Tractor,
  Dog,
  Wheat,
  Activity,
  Baby,
  Building2,
  FileText,
  Boxes,
  LucideIcon,
} from "lucide-react";

export interface SubCategoryDefinition {
  name: string;
  slug: string;
  description?: string;
}

export interface CategoryDefinition {
  name: string;
  slug: string;
  iconName: string;
  icon: LucideIcon;
  description: string;
  color: string;
  gradient: string;
  adsCountText: string;
  adsCount?: number;
  subcategories: SubCategoryDefinition[];
}

export const CLASSIFIED_CATEGORIES: CategoryDefinition[] = [
  {
    name: "Vehicles",
    slug: "vehicles",
    iconName: "Car",
    icon: Car,
    description: "Cars, motorbikes, buses, auto parts & heavy machinery",
    color: "text-blue-500 border-blue-500/30 bg-blue-500/10",
    gradient: "from-blue-600 to-indigo-600",
    adsCountText: "0 ads",
    subcategories: [
      { name: "Cars", slug: "cars" },
      { name: "Buses & Microbuses", slug: "buses-microbuses" },
      { name: "Trucks & Trailers", slug: "trucks-trailers" },
      { name: "Motorcycles & Scooters", slug: "motorcycles-scooters" },
      { name: "Auto Parts & Accessories", slug: "auto-parts-accessories" },
      { name: "Heavy Equipment & Construction", slug: "heavy-equipment" },
      { name: "Watercraft & Boats", slug: "watercraft-boats" },
      { name: "Vehicle Services & Rentals", slug: "vehicle-services-rentals" },
    ],
  },
  {
    name: "Property",
    slug: "property",
    iconName: "Home",
    icon: Home,
    description: "Houses, apartments, plots of land & commercial spaces",
    color: "text-emerald-500 border-emerald-500/30 bg-emerald-500/10",
    gradient: "from-emerald-600 to-teal-600",
    adsCountText: "0 ads",
    subcategories: [
      { name: "Houses & Apartments for Rent", slug: "houses-apartments-for-rent" },
      { name: "Houses & Apartments for Sale", slug: "houses-apartments-for-sale" },
      { name: "Land & Plots for Sale", slug: "land-plots-for-sale" },
      { name: "Commercial Property for Rent", slug: "commercial-property-for-rent" },
      { name: "Commercial Property for Sale", slug: "commercial-property-for-sale" },
      { name: "Short Let Property & Guest Houses", slug: "short-let-property" },
      { name: "Event Centres & Venues", slug: "event-centres-venues" },
      { name: "Land & Plots for Rent", slug: "land-plots-for-rent" },
    ],
  },
  {
    name: "Phones & Tablets",
    slug: "phones-tablets",
    iconName: "Smartphone",
    icon: Smartphone,
    description: "Smartphones, iPads, Android tablets & accessories",
    color: "text-purple-500 border-purple-500/30 bg-purple-500/10",
    gradient: "from-purple-600 to-pink-600",
    adsCountText: "0 ads",
    subcategories: [
      { name: "Mobile Phones", slug: "mobile-phones" },
      { name: "Tablets", slug: "tablets" },
      { name: "Smart Watches & Trackers", slug: "smart-watches-trackers" },
      { name: "Accessories for Phones & Tablets", slug: "phone-tablet-accessories" },
      { name: "Mobile Phone Repair Parts & Tools", slug: "phone-repair-parts" },
    ],
  },
  {
    name: "Electronics",
    slug: "electronics",
    iconName: "Laptop",
    icon: Laptop,
    description: "Laptops, TVs, audio systems, cameras & video gaming",
    color: "text-indigo-500 border-indigo-500/30 bg-indigo-500/10",
    gradient: "from-indigo-600 to-blue-600",
    adsCountText: "0 ads",
    subcategories: [
      { name: "Laptops & Computers", slug: "laptops-computers" },
      { name: "TV & DVD Equipment", slug: "tv-dvd-equipment" },
      { name: "Audio & Music Equipment", slug: "audio-music-equipment" },
      { name: "Computer Accessories", slug: "computer-accessories" },
      { name: "Photo & Video Cameras", slug: "photo-video-cameras" },
      { name: "Computer Hardware & Components", slug: "computer-hardware" },
      { name: "Video Games & Consoles", slug: "video-games-consoles" },
      { name: "Security & Surveillance Systems", slug: "security-surveillance" },
      { name: "Networking Products & Routers", slug: "networking-products" },
    ],
  },
  {
    name: "Home, Furniture & Appliances",
    slug: "home-furniture-appliances",
    iconName: "Home",
    icon: Home,
    description: "Furniture, lighting, kitchenware, fridges & home decor",
    color: "text-amber-500 border-amber-500/30 bg-amber-500/10",
    gradient: "from-amber-500 to-orange-600",
    adsCountText: "0 ads",
    subcategories: [
      { name: "Furniture", slug: "furniture" },
      { name: "Lighting & Ceiling Fans", slug: "lighting-fans" },
      { name: "Storage & Organization", slug: "storage-organization" },
      { name: "Home Accessories & Decor", slug: "home-accessories" },
      { name: "Home Appliances (AC, Fans, Washing Machines)", slug: "home-appliances" },
      { name: "Kitchen Appliances (Microwaves, Fridges)", slug: "kitchen-appliances" },
      { name: "Kitchenware & Cookware", slug: "kitchenware-cookware" },
      { name: "Household Chemicals & Cleaning", slug: "household-chemicals" },
      { name: "Garden Supplies & Outdoor", slug: "garden-supplies" },
    ],
  },
  {
    name: "Fashion",
    slug: "fashion",
    iconName: "Shirt",
    icon: Shirt,
    description: "Clothing, shoes, Northern Fugu wear, bags, watches & jewelry",
    color: "text-pink-500 border-pink-500/30 bg-pink-500/10",
    gradient: "from-pink-600 to-rose-600",
    adsCountText: "0 ads",
    subcategories: [
      { name: "Women's Clothing", slug: "womens-clothing" },
      { name: "Men's Clothing", slug: "mens-clothing" },
      { name: "Fugu & Traditional Northern Wear", slug: "fugu-traditional-wear" },
      { name: "Shoes & Footwear", slug: "shoes-footwear" },
      { name: "Bags & Luggage", slug: "bags-luggage" },
      { name: "Watches", slug: "watches" },
      { name: "Jewelry", slug: "jewelry" },
      { name: "Wedding Wear & Accessories", slug: "wedding-wear" },
      { name: "Fashion Accessories", slug: "fashion-accessories" },
    ],
  },
  {
    name: "Beauty & Personal Care",
    slug: "beauty-personal-care",
    iconName: "Sparkles",
    icon: Sparkles,
    description: "Perfumes, cosmetics, hair care, skincare & hygiene",
    color: "text-rose-500 border-rose-500/30 bg-rose-500/10",
    gradient: "from-rose-500 to-red-600",
    adsCountText: "0 ads",
    subcategories: [
      { name: "Fragrances & Perfumes", slug: "fragrances-perfumes" },
      { name: "Makeup & Cosmetics", slug: "makeup-cosmetics" },
      { name: "Hair Beauty & Extensions", slug: "hair-beauty-extensions" },
      { name: "Skincare", slug: "skincare" },
      { name: "Personal Care & Hygiene", slug: "personal-care-hygiene" },
      { name: "Beauty Tools & Accessories", slug: "beauty-tools" },
      { name: "Health Care & Supplements", slug: "healthcare-supplements" },
    ],
  },
  {
    name: "Services",
    slug: "services",
    iconName: "Wrench",
    icon: Wrench,
    description: "Artisans, drivers, cleaning, events & business services",
    color: "text-teal-500 border-teal-500/30 bg-teal-500/10",
    gradient: "from-teal-600 to-emerald-600",
    adsCountText: "0 ads",
    subcategories: [
      { name: "Building & Trade Services (Plumbing, Masonry)", slug: "building-trade-services" },
      { name: "Repair Services (Appliance, Auto, Tech)", slug: "repair-services" },
      { name: "Chauffeur, Driver & Transport Services", slug: "driver-transport-services" },
      { name: "Cleaning & Janitorial Services", slug: "cleaning-janitorial-services" },
      { name: "Event Planning, Catering & Photography", slug: "event-planning-catering" },
      { name: "Printing & Graphic Design Services", slug: "printing-graphic-design" },
      { name: "Travel, Visa & Tour Services", slug: "travel-tour-services" },
      { name: "Health & Beauty Services", slug: "health-beauty-services" },
      { name: "Legal, Accounting & Tax Services", slug: "legal-accounting-tax" },
    ],
  },
  {
    name: "Repair & Construction",
    slug: "repair-construction",
    iconName: "HardHat",
    icon: HardHat,
    description: "Building materials, electrical wiring, solar, tools & plumbing",
    color: "text-amber-600 border-amber-600/30 bg-amber-600/10",
    gradient: "from-amber-600 to-yellow-600",
    adsCountText: "0 ads",
    subcategories: [
      { name: "Building Materials (Cement, Blocks, Steel)", slug: "building-materials" },
      { name: "Doors & Windows", slug: "doors-windows" },
      { name: "Plumbing & Water Supply Equipment", slug: "plumbing-water-supply" },
      { name: "Electrical Equipment & Wiring", slug: "electrical-equipment-wiring" },
      { name: "Hand Tools", slug: "hand-tools" },
      { name: "Power Tools & Heavy Machinery", slug: "power-tools-machinery" },
      { name: "Solar Panels, Inverters & Energy", slug: "solar-inverters-energy" },
      { name: "Roofing Materials", slug: "roofing-materials" },
      { name: "Tiles, Flooring & Wall Treatments", slug: "tiles-flooring-walls" },
      { name: "Paints & Finishes", slug: "paints-finishes" },
    ],
  },
  {
    name: "Commercial Equipment & Tools",
    slug: "commercial-equipment-tools",
    iconName: "Boxes",
    icon: Boxes,
    description: "Industrial machinery, restaurant gear, salon equipment & office",
    color: "text-cyan-500 border-cyan-500/30 bg-cyan-500/10",
    gradient: "from-cyan-600 to-blue-600",
    adsCountText: "0 ads",
    subcategories: [
      { name: "Industrial Machinery & Heavy Equipment", slug: "industrial-machinery" },
      { name: "Restaurant & Catering Equipment", slug: "restaurant-catering-equipment" },
      { name: "Medical Equipment & Supplies", slug: "medical-equipment" },
      { name: "Store & Supermarket Fixtures", slug: "store-fixtures" },
      { name: "Salon & Barber Equipment", slug: "salon-barber-equipment" },
      { name: "Office Equipment & Furniture", slug: "office-equipment" },
      { name: "Manufacturing & Processing Tools", slug: "manufacturing-tools" },
    ],
  },
  {
    name: "Leisure & Activities",
    slug: "leisure-activities",
    iconName: "Activity",
    icon: Activity,
    description: "Gym gear, musical instruments, books, camping & crafts",
    color: "text-violet-500 border-violet-500/30 bg-violet-500/10",
    gradient: "from-violet-600 to-purple-600",
    adsCountText: "0 ads",
    subcategories: [
      { name: "Sports & Fitness Equipment", slug: "sports-fitness" },
      { name: "Musical Instruments & Gear", slug: "musical-instruments" },
      { name: "Books, Media & Magazines", slug: "books-media" },
      { name: "Outdoor, Camping & Hunting", slug: "outdoor-camping" },
      { name: "Board Games & Hobbies", slug: "board-games-hobbies" },
      { name: "Art, Crafts & Collectibles", slug: "art-crafts-collectibles" },
    ],
  },
  {
    name: "Babies & Kids",
    slug: "babies-kids",
    iconName: "Baby",
    icon: Baby,
    description: "Children's clothing, toys, strollers, nursery & feeding gear",
    color: "text-sky-500 border-sky-500/30 bg-sky-500/10",
    gradient: "from-sky-500 to-blue-500",
    adsCountText: "0 ads",
    subcategories: [
      { name: "Children's Clothing", slug: "childrens-clothing" },
      { name: "Children's Shoes", slug: "childrens-shoes" },
      { name: "Toys, Games & Bikes", slug: "toys-games-bikes" },
      { name: "Prams, Strollers & Car Seats", slug: "strollers-car-seats" },
      { name: "Feeding & Nursing Gear", slug: "feeding-nursing" },
      { name: "Baby Furniture & Bedding", slug: "baby-furniture" },
    ],
  },
  {
    name: "Food, Agriculture & Farming",
    slug: "food-agriculture-farming",
    iconName: "Wheat",
    icon: Wheat,
    description: "Crops, livestock, seeds, farm machinery & fresh food produce",
    color: "text-lime-500 border-lime-500/30 bg-lime-500/10",
    gradient: "from-lime-600 to-emerald-600",
    adsCountText: "0 ads",
    subcategories: [
      { name: "Agricultural Produce & Crops", slug: "agricultural-produce" },
      { name: "Farm Livestock & Poultry", slug: "farm-livestock-poultry" },
      { name: "Feeds, Fertilizers & Agro-Chemicals", slug: "feeds-fertilizers" },
      { name: "Seeds & Seedlings", slug: "seeds-seedlings" },
      { name: "Farm Machinery, Tractors & Implements", slug: "farm-machinery-tractors" },
      { name: "Fresh Food, Groceries & Beverages", slug: "fresh-food-groceries" },
    ],
  },
  {
    name: "Animals & Pets",
    slug: "animals-pets",
    iconName: "Dog",
    icon: Dog,
    description: "Dogs, cats, birds, fish aquariums & pet accessories",
    color: "text-orange-500 border-orange-500/30 bg-orange-500/10",
    gradient: "from-orange-500 to-amber-600",
    adsCountText: "0 ads",
    subcategories: [
      { name: "Dogs & Puppies", slug: "dogs-puppies" },
      { name: "Cats & Kittens", slug: "cats-kittens" },
      { name: "Birds & Poultry Pets", slug: "birds-poultry" },
      { name: "Fish & Aquariums", slug: "fish-aquariums" },
      { name: "Pet Food, Accessories & Healthcare", slug: "pet-food-accessories" },
    ],
  },
  {
    name: "Jobs",
    slug: "jobs",
    iconName: "Briefcase",
    icon: Briefcase,
    description: "Job vacancies for skilled labor, sales, drivers, IT & admin",
    color: "text-emerald-600 border-emerald-600/30 bg-emerald-600/10",
    gradient: "from-emerald-600 to-teal-700",
    adsCountText: "0 ads",
    subcategories: [
      { name: "Artisan & Skilled Labor Jobs", slug: "artisan-skilled-jobs" },
      { name: "Sales & Marketing Jobs", slug: "sales-marketing-jobs" },
      { name: "Accounting & Finance Jobs", slug: "accounting-finance-jobs" },
      { name: "Driver & Logistics Jobs", slug: "driver-logistics-jobs" },
      { name: "Customer Service & Admin Jobs", slug: "customer-service-admin-jobs" },
      { name: "Teaching & Education Jobs", slug: "teaching-education-jobs" },
      { name: "IT, Software & Tech Jobs", slug: "it-tech-jobs" },
    ],
  },
  {
    name: "Seeking Work - CVs",
    slug: "seeking-work-cvs",
    iconName: "FileText",
    icon: FileText,
    description: "Resumes & CVs of artisans, drivers, technicians & professionals",
    color: "text-blue-600 border-blue-600/30 bg-blue-600/10",
    gradient: "from-blue-600 to-sky-700",
    adsCountText: "0 ads",
    subcategories: [
      { name: "Skilled Trade & Artisan CVs", slug: "artisan-cvs" },
      { name: "Drivers & Delivery CVs", slug: "driver-cvs" },
      { name: "Sales & Marketing CVs", slug: "sales-cvs" },
      { name: "Administrative & Office CVs", slug: "admin-cvs" },
      { name: "Hospitality & Cleaning CVs", slug: "hospitality-cvs" },
      { name: "IT & Engineering CVs", slug: "it-engineering-cvs" },
    ],
  },
  {
    name: "Business & Industry",
    slug: "business-industry",
    iconName: "Building2",
    icon: Building2,
    description: "Businesses for sale, franchises, industrial materials & licensing",
    color: "text-slate-500 border-slate-500/30 bg-slate-500/10",
    gradient: "from-slate-700 to-stone-800",
    adsCountText: "0 ads",
    subcategories: [
      { name: "Businesses for Sale", slug: "businesses-for-sale" },
      { name: "Business Franchises & Partnerships", slug: "franchises-partnerships" },
      { name: "Industrial Raw Materials", slug: "industrial-raw-materials" },
      { name: "Licensing & Consultancy Services", slug: "licensing-consultancy" },
    ],
  },
];

export function getCategoryBySlug(slug: string): CategoryDefinition | undefined {
  if (!slug) return undefined;
  const norm = slug.toLowerCase().trim();
  return CLASSIFIED_CATEGORIES.find(
    (c) => c.slug === norm || c.name.toLowerCase() === norm
  );
}

export function getSubcategoriesForCategory(categoryNameOrSlug: string): SubCategoryDefinition[] {
  const cat = getCategoryBySlug(categoryNameOrSlug);
  return cat ? cat.subcategories : [];
}

export function formatAdsCount(count: number): string {
  if (count <= 0) return "0 ads";
  if (count === 1) return "1 ad";
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M+ ads`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k+ ads`;
  return `${count} ads`;
}

export function computeCategoryCountsFromList(products: any[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const p of products) {
    if (p.category) {
      const catKey = p.category.trim().toLowerCase();
      counts[catKey] = (counts[catKey] || 0) + 1;
    }
  }
  return counts;
}

export function getDynamicCategories(countsMap?: Record<string, number>): CategoryDefinition[] {
  if (!countsMap) return CLASSIFIED_CATEGORIES;

  return CLASSIFIED_CATEGORIES.map((cat) => {
    const catKey = cat.name.toLowerCase();
    let totalCount = 0;
    for (const [key, count] of Object.entries(countsMap)) {
      if (key.includes(catKey) || catKey.includes(key)) {
        totalCount += count;
      }
    }
    return {
      ...cat,
      adsCount: totalCount,
      adsCountText: formatAdsCount(totalCount),
    };
  });
}
