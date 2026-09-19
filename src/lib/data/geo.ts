import type { City, Country } from "@/lib/types";

export const COUNTRIES: Country[] = [
  { id: "jp", name: "Japan", nativeName: "日本", region: "asia", flag: "🇯🇵" },
  { id: "kr", name: "South Korea", nativeName: "대한민국", region: "asia", flag: "🇰🇷" },
  { id: "cn", name: "China", nativeName: "中国", region: "asia", flag: "🇨🇳" },
  { id: "tw", name: "Taiwan", nativeName: "臺灣", region: "asia", flag: "🇹🇼" },
  { id: "hk", name: "Hong Kong", nativeName: "香港", region: "asia", flag: "🇭🇰" },
  { id: "sg", name: "Singapore", nativeName: "Singapore", region: "asia", flag: "🇸🇬" },
  { id: "th", name: "Thailand", nativeName: "ประเทศไทย", region: "asia", flag: "🇹🇭" },
  { id: "vn", name: "Vietnam", nativeName: "Việt Nam", region: "asia", flag: "🇻🇳" },
  { id: "in", name: "India", nativeName: "भारत", region: "asia", flag: "🇮🇳" },
  { id: "ae", name: "United Arab Emirates", nativeName: "الإمارات", region: "asia", flag: "🇦🇪" },
  { id: "us", name: "United States", nativeName: "United States", region: "north-america", flag: "🇺🇸" },
  { id: "ca", name: "Canada", nativeName: "Canada", region: "north-america", flag: "🇨🇦" },
  { id: "mx", name: "Mexico", nativeName: "México", region: "north-america", flag: "🇲🇽" },
  { id: "br", name: "Brazil", nativeName: "Brasil", region: "south-america", flag: "🇧🇷" },
  { id: "ar", name: "Argentina", nativeName: "Argentina", region: "south-america", flag: "🇦🇷" },
  { id: "gb", name: "United Kingdom", nativeName: "United Kingdom", region: "europe", flag: "🇬🇧" },
  { id: "fr", name: "France", nativeName: "France", region: "europe", flag: "🇫🇷" },
  { id: "it", name: "Italy", nativeName: "Italia", region: "europe", flag: "🇮🇹" },
  { id: "de", name: "Germany", nativeName: "Deutschland", region: "europe", flag: "🇩🇪" },
  { id: "nl", name: "Netherlands", nativeName: "Nederland", region: "europe", flag: "🇳🇱" },
  { id: "se", name: "Sweden", nativeName: "Sverige", region: "europe", flag: "🇸🇪" },
  { id: "es", name: "Spain", nativeName: "España", region: "europe", flag: "🇪🇸" },
  { id: "au", name: "Australia", nativeName: "Australia", region: "oceania", flag: "🇦🇺" },
  { id: "nz", name: "New Zealand", nativeName: "New Zealand", region: "oceania", flag: "🇳🇿" },
  { id: "ng", name: "Nigeria", nativeName: "Nigeria", region: "africa", flag: "🇳🇬" },
  { id: "za", name: "South Africa", nativeName: "South Africa", region: "africa", flag: "🇿🇦" },
];

export const CITIES: City[] = [
  { id: "tokyo", name: "Tokyo", countryId: "jp", region: "asia", lat: 35.6762, lng: 139.6503, tagline: "J-beauty craft meets street-level experimentation.", scenes: ["makeup", "skincare", "hair", "beauty-tech"] },
  { id: "osaka", name: "Osaka", countryId: "jp", region: "asia", lat: 34.6937, lng: 135.5023, tagline: "Fast-moving indie makeup and nail culture.", scenes: ["nail", "makeup", "fashion"] },
  { id: "fukuoka", name: "Fukuoka", countryId: "jp", region: "asia", lat: 33.5904, lng: 130.4017, tagline: "Asia's gateway city for young beauty founders.", scenes: ["skincare", "marketing", "beauty-tech"] },
  { id: "seoul", name: "Seoul", countryId: "kr", region: "asia", lat: 37.5665, lng: 126.978, tagline: "The world's fastest product-to-market beauty scene.", scenes: ["skincare", "makeup", "beauty-tech", "video"] },
  { id: "busan", name: "Busan", countryId: "kr", region: "asia", lat: 35.1796, lng: 129.0756, tagline: "Coastal editorial shoots and emerging hair studios.", scenes: ["hair", "photography", "fashion"] },
  { id: "shanghai", name: "Shanghai", countryId: "cn", region: "asia", lat: 31.2304, lng: 121.4737, tagline: "Where global brands test their next launch.", scenes: ["marketing", "skincare", "fashion", "video"] },
  { id: "beijing", name: "Beijing", countryId: "cn", region: "asia", lat: 39.9042, lng: 116.4074, tagline: "Heritage ingredients, modern formulation labs.", scenes: ["skincare", "beauty-tech", "design"] },
  { id: "taipei", name: "Taipei", countryId: "tw", region: "asia", lat: 25.033, lng: 121.5654, tagline: "Small-batch skincare and a warm creator community.", scenes: ["skincare", "design", "video"] },
  { id: "hongkong", name: "Hong Kong", countryId: "hk", region: "asia", lat: 22.3193, lng: 114.1694, tagline: "The retail and distribution hinge of Asian beauty.", scenes: ["marketing", "fashion", "photography"] },
  { id: "singapore", name: "Singapore", countryId: "sg", region: "asia", lat: 1.3521, lng: 103.8198, tagline: "Multilingual teams building for all of Southeast Asia.", scenes: ["beauty-tech", "marketing", "skincare"] },
  { id: "bangkok", name: "Bangkok", countryId: "th", region: "asia", lat: 13.7563, lng: 100.5018, tagline: "Colour-forward makeup and a huge creator economy.", scenes: ["makeup", "video", "photography"] },
  { id: "hochiminh", name: "Ho Chi Minh City", countryId: "vn", region: "asia", lat: 10.8231, lng: 106.6297, tagline: "New manufacturing plus a young founder wave.", scenes: ["skincare", "marketing", "design"] },
  { id: "mumbai", name: "Mumbai", countryId: "in", region: "asia", lat: 19.076, lng: 72.8777, tagline: "Bridal artistry at a scale nowhere else matches.", scenes: ["makeup", "hair", "photography"] },
  { id: "dubai", name: "Dubai", countryId: "ae", region: "asia", lat: 25.2048, lng: 55.2708, tagline: "Luxury fragrance, prestige retail, global talent.", scenes: ["fashion", "marketing", "makeup"] },
  { id: "newyork", name: "New York", countryId: "us", region: "north-america", lat: 40.7128, lng: -74.006, tagline: "Editorial, agencies and the indie brand pipeline.", scenes: ["makeup", "photography", "marketing", "fashion"] },
  { id: "losangeles", name: "Los Angeles", countryId: "us", region: "north-america", lat: 34.0522, lng: -118.2437, tagline: "Creator-led brands and full-scale content studios.", scenes: ["video", "makeup", "hair", "marketing"] },
  { id: "sanfrancisco", name: "San Francisco", countryId: "us", region: "north-america", lat: 37.7749, lng: -122.4194, tagline: "Beauty tech, AI diagnostics, and commerce tooling.", scenes: ["beauty-tech", "design", "marketing"] },
  { id: "toronto", name: "Toronto", countryId: "ca", region: "north-america", lat: 43.6532, lng: -79.3832, tagline: "One of the most multicultural casting pools anywhere.", scenes: ["makeup", "photography", "hair"] },
  { id: "mexicocity", name: "Mexico City", countryId: "mx", region: "north-america", lat: 19.4326, lng: -99.1332, tagline: "Design-led packaging and a booming clean-beauty wave.", scenes: ["design", "skincare", "fashion"] },
  { id: "saopaulo", name: "São Paulo", countryId: "br", region: "south-america", lat: -23.5505, lng: -46.6333, tagline: "Latin America's largest hair and body care market.", scenes: ["hair", "skincare", "marketing"] },
  { id: "riodejaneiro", name: "Rio de Janeiro", countryId: "br", region: "south-america", lat: -22.9068, lng: -43.1729, tagline: "Sun-and-skin storytelling, shot on location.", scenes: ["photography", "video", "skincare"] },
  { id: "buenosaires", name: "Buenos Aires", countryId: "ar", region: "south-america", lat: -34.6037, lng: -58.3816, tagline: "Strong design studios serving brands worldwide.", scenes: ["design", "fashion", "marketing"] },
  { id: "london", name: "London", countryId: "gb", region: "europe", lat: 51.5074, lng: -0.1278, tagline: "Where editorial beauty and indie retail collide.", scenes: ["makeup", "fashion", "photography", "marketing"] },
  { id: "paris", name: "Paris", countryId: "fr", region: "europe", lat: 48.8566, lng: 2.3522, tagline: "The centre of gravity for prestige beauty.", scenes: ["fashion", "skincare", "makeup", "design"] },
  { id: "milan", name: "Milan", countryId: "it", region: "europe", lat: 45.4642, lng: 9.19, tagline: "Runway hair and makeup at the highest level.", scenes: ["hair", "makeup", "fashion"] },
  { id: "berlin", name: "Berlin", countryId: "de", region: "europe", lat: 52.52, lng: 13.405, tagline: "Independent, experimental, unapologetically weird.", scenes: ["design", "video", "makeup"] },
  { id: "amsterdam", name: "Amsterdam", countryId: "nl", region: "europe", lat: 52.3676, lng: 4.9041, tagline: "Sustainability-first formulation and packaging.", scenes: ["skincare", "design", "beauty-tech"] },
  { id: "stockholm", name: "Stockholm", countryId: "se", region: "europe", lat: 59.3293, lng: 18.0686, tagline: "Minimal branding that travels globally.", scenes: ["design", "skincare", "marketing"] },
  { id: "barcelona", name: "Barcelona", countryId: "es", region: "europe", lat: 41.3851, lng: 2.1734, tagline: "A production hub for shoots across Europe.", scenes: ["photography", "video", "fashion"] },
  { id: "sydney", name: "Sydney", countryId: "au", region: "oceania", lat: -33.8688, lng: 151.2093, tagline: "Suncare science and outdoor-first beauty.", scenes: ["skincare", "photography", "marketing"] },
  { id: "melbourne", name: "Melbourne", countryId: "au", region: "oceania", lat: -37.8136, lng: 144.9631, tagline: "Salon culture with a serious creative streak.", scenes: ["hair", "nail", "design"] },
  { id: "auckland", name: "Auckland", countryId: "nz", region: "oceania", lat: -36.8485, lng: 174.7633, tagline: "Natural ingredients and a tight-knit maker scene.", scenes: ["skincare", "design"] },
  { id: "lagos", name: "Lagos", countryId: "ng", region: "africa", lat: 6.5244, lng: 3.3792, tagline: "The most exciting new beauty market on earth.", scenes: ["makeup", "hair", "video"] },
  { id: "capetown", name: "Cape Town", countryId: "za", region: "africa", lat: -33.9249, lng: 18.4241, tagline: "World-class production value at half the cost.", scenes: ["photography", "video", "fashion"] },
];

export const CITY_BY_ID = new Map(CITIES.map((c) => [c.id, c]));
export const COUNTRY_BY_ID = new Map(COUNTRIES.map((c) => [c.id, c]));

export function cityLabel(cityId: string): string {
  return CITY_BY_ID.get(cityId)?.name ?? cityId;
}

export function countryOfCity(cityId: string): Country | undefined {
  const city = CITY_BY_ID.get(cityId);
  return city ? COUNTRY_BY_ID.get(city.countryId) : undefined;
}
