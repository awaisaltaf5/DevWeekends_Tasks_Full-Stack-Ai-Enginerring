// StayNest hotel seed — run from the backend directory:
//   node src/seed/hotelSeed.js
require('dotenv').config();
const mongoose = require('mongoose');
const Hotel = require('../models/Hotel');

// Stable Unsplash hotel/travel photo IDs (pooled + rotated across hotels).
const IMG = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

const POOL = [
  '1566073771259-6a8506099945',
  '1582719508461-905c673771fd',
  '1551882547-ff40c63fe5fa',
  '1611892440504-42a792e24d32',
  '1520250497591-112f2f40a3f4',
  '1571003123894-1f0594d2b5d9',
  '1445019980597-93fa8acb246c',
  '1563911302283-d2bc129e7570',
  '1590490360182-c33d57733427',
  '1512918728675-ed5a9ecdebfd',
  '1564501049412-61c2a3083791',
  '1542314831-068cd1dbfeeb',
];

const WIFI = 'Free WiFi';
const PARK = 'Free Parking';
const POOL_A = 'Swimming Pool';
const GYM = 'Gym';
const REST = 'Restaurant';
const SPA = 'Spa';
const BREAK = 'Breakfast Included';
const SHUTTLE = 'Airport Shuttle';
const ROOM = 'Room Service';
const AC = 'Air Conditioning';

// Each row: [name, description, city, country, pricePerNight, rating,
//            reviewCount, amenities, roomTypes, featured, lat, lon]
const RAW = [
    // Islamabad
  ['Grand Islamabad Hotel','Landmark 5-star with rooftop pool and Margalla views.','islamabad','Pakistan',14500,4.7,412,[WIFI,POOL_A,GYM,REST,SPA],['Standard Room','Deluxe Room','Executive Suite'],true,33.7056,73.0598],
  ['Serena Skyline Suites','Business suites near the diplomatic enclave.','islamabad','Pakistan',18000,4.6,388,[WIFI,GYM,REST,BREAK,AC],['Studio','Deluxe Suite','Skyline Suite'],false,33.726,73.0725],
  ['Margalla View Boutique','Cosy boutique stay beneath the Margalla Hills.','islamabad','Pakistan',9500,4.5,210,[WIFI,PARK,BREAK,AC],['Standard Room','Garden View Room'],false,33.716,73.055],
  ['Blue Area Executive Inn','Smart, affordable rooms in the business district.','islamabad','Pakistan',7000,4.3,175,[WIFI,PARK,BREAK,AC],['Standard Room','Executive Room'],false,33.712,73.063],
  ['Capital Residences Islamabad','Serviced apartments with kitchenettes near Centaurus Mall.','islamabad','Pakistan',11000,4.4,290,[WIFI,GYM,BREAK,AC,ROOM],['Studio Apartment','One Bedroom','Executive Suite'],false,33.701,73.068],
  ['F-7 Grand Guesthouse','Budget-friendly rooms in the heart of the city near F-7.','islamabad','Pakistan',5500,4.1,88,[WIFI,BREAK],['Standard Room','Twin Room'],false,33.705,73.046],
  ['Diplomatic Enclave Hotel','Premium stay minutes from the diplomatic enclave.','islamabad','Pakistan',13500,4.5,340,[WIFI,POOL_A,GYM,REST,AC],['Deluxe Room','Executive Suite'],false,33.697,73.045],
  // Lahore
  ['Gulberg Grand Hotel','Contemporary luxury with a skyline pool and café culture.','lahore','Pakistan',12500,4.6,502,[WIFI,POOL_A,GYM,REST,ROOM],['Standard Room','Deluxe Room','Family Room'],false,31.52,74.358],
  ['Regal Residency Lahore','Heritage-adjacent rooms on The Mall.','lahore','Pakistan',6500,4.4,265,[WIFI,BREAK,AC,ROOM],['Standard Room','Twin Room'],true,31.5605,74.3206],
  ['Badshahi Heritage Retreat','Boutique heritage hotel facing Badshahi Mosque.','lahore','Pakistan',21000,4.8,190,[WIFI,REST,BREAK,SPA],['Deluxe Room','Executive Suite','Presidential Suite'],false,31.588,74.312],
  ['Cantt Corporate Suites','Streamlined corporate stay with meeting-floor suites.','lahore','Pakistan',8000,4.2,148,[WIFI,GYM,BREAK,AC],['Executive Room','Studio','Family Suite'],false,31.496,74.335],
  ['Liberty Market Lodge','Charming mid-range hotel near Liberty Chowk.','lahore','Pakistan',7200,4.3,167,[WIFI,BREAK,GYM],['Standard Room','Deluxe Room'],false,31.556,74.329],
  ['Avenue View Hotel','Modern rooms along the historic Mall.','lahore','Pakistan',9800,4.4,230,[WIFI,REST,AC,BREAK],['Standard Room','Executive Room'],false,31.541,74.323],
    // Karachi
  ['Sea Breeze Marina Hotel','Ocean-facing rooms on the Clifton beachfront.','karachi','Pakistan',11000,4.5,320,[WIFI,POOL_A,BREAK,AC],['Standard Room','Sea View Room','Deluxe Room'],false,24.826,67.03],
  ['Clifton Royal Suites','Spacious suites near the Zamzama district.','karachi','Pakistan',9800,4.4,233,[WIFI,PARK,GYM,REST],['Studio','Executive Suite','Family Suite'],false,24.808,67.036],
  ['Port Grand Executive','Practical city-centre stay near the port.','karachi','Pakistan',6500,4.0,120,[WIFI,BREAK,AC],['Standard Room','Executive Room'],false,24.855,67.031],
  ['Bahadurabad Grand','Central hotel in the bustling Bahadurabad area.','karachi','Pakistan',7800,4.2,110,[WIFI,GYM,BREAK,AC],['Standard Room','Deluxe Room'],false,24.862,67.018],
  ['Saddar Plaza Hotel','Budget-friendly rooms in the old city centre.','karachi','Pakistan',4800,3.9,72,[WIFI,BREAK],['Standard Room','Twin Room'],false,24.871,67.022],
  // Murree
  ['Pine Ridge Resort Murree','Cosy hilltop resort with pine views and fireplaces.','murree','Pakistan',15000,4.6,178,[WIFI,BREAK,AC,REST],['Standard Room','Mountain View Room','Family Room'],true,33.906,73.392],
  ['Kashmir Point Lodge','Quiet lodge with dramatic valley panoramas.','murree','Pakistan',8500,4.3,95,[WIFI,PARK,BREAK],['Standard Room','Mountain View Room'],false,33.9,73.42],
  ['Cedar Crest Hotel Murree','Surrounded by cedars near Bhurban.','murree','Pakistan',12000,4.5,142,[WIFI,REST,BREAK,PARK],['Deluxe Room','Mountain View Room','Family Suite'],false,33.894,73.41],
  ['Patriata View Resort','Hill station resort with gondola access and gardens.','murree','Pakistan',9800,4.4,130,[WIFI,PARK,BREAK,AC],['Standard Room','Garden View Room'],false,33.902,73.401],
  // Hunza
  ['Hunza Peaks Boutique Hotel','Panoramic views of Rakaposhi and the Hunza Valley.','hunza','Pakistan',16500,4.9,220,[WIFI,REST,BREAK,PARK],['Standard Room','Valley View Room','Deluxe Suite'],true,36.32,74.669],
  ['Eagle Nest Hunza','High-altitude retreat at the Eagle Nest viewpoint.','hunza','Pakistan',13500,4.7,131,[WIFI,BREAK,PARK,AC],['Mountain View Room','Deluxe Room'],false,36.34,74.63],
  ['Karimabad Grand','Elegant stay in the historic Karimabad town.','hunza','Pakistan',11000,4.5,186,[WIFI,REST,BREAK,AC],['Deluxe Room','Garden View Room'],false,36.318,74.654],
  ['Attabad Lake View','Lakeside cabins with stunning turquoise waters.','hunza','Pakistan',9800,4.4,74,[WIFI,BREAK,AC],['Lake View Room','Standard Room'],false,36.359,74.638],
    // Dubai
  ['Marina Bay Hotel Dubai','Glamorous marina-front hotel with an infinity pool.','dubai','UAE',85000,4.7,1560,[WIFI,POOL_A,GYM,SPA,REST,SHUTTLE],['Standard Room','Marina View Room','Executive Suite','Presidential Suite'],true,25.1642,55.2036],
  ['Palm Vista Grand','Beachfront grandeur on Palm Jumeirah.','dubai','UAE',95000,4.6,1240,[WIFI,POOL_A,GYM,SPA,REST],['Deluxe Room','Sea View Room','Royal Suite'],false,25.117,55.133],
  ['City Centre Executive','Efficient stay with easy metro links.','dubai','UAE',55000,4.4,890,[WIFI,GYM,REST,BREAK,SHUTTLE],['Standard Room','Executive Room','Family Room'],false,25.262,55.296],
  ['Downtown Dubai Luxury','Luxury hotel steps from the Burj Khalifa.','dubai','UAE',72000,4.5,1120,[WIFI,POOL_A,GYM,SPA,BREAK],['Deluxe Room','City View Suite','Executive Suite'],false,25.197,55.274],
  ['JBR Beach Resort','Casual beachfront resort along The Walk.','dubai','UAE',62000,4.3,950,[WIFI,POOL_A,REST,BREAK],['Standard Room','Sea View Room'],false,25.076,55.161],
  ['Deira Old Souk Hotel','Traditional-style stay near the creek and souk.','dubai','UAE',48000,4.1,640,[WIFI,GYM,BREAK,AC],['Standard Room','Deluxe Room'],false,25.265,55.293],
    // Istanbul
  ['Bosphorus Palace Hotel','Ottoman-style palace near the Blue Mosque.','istanbul','Turkey',72000,4.8,1340,[WIFI,REST,SPA,BREAK,AC],['Standard Room','Deluxe Room','Ottoman Suite'],true,41.008,28.978],
  ['Galata Skyline Suites','Modern suites beneath the Galata Tower.','istanbul','Turkey',48000,4.5,760,[WIFI,BREAK,AC,GYM],['Studio','Deluxe Suite'],false,41.025,28.974],
  ['Sultanahmet Heritage Inn','Cozy inn in the historic peninsula near major sights.','istanbul','Turkey',39000,4.3,680,[WIFI,BREAK,AC],['Standard Room','Deluxe Room'],false,41.005,28.98],
  ['Kadiköy Design Hotel','Trendy design-led hotel on the Asian side.','istanbul','Turkey',44000,4.4,540,[WIFI,GYM,REST,BREAK],['Studio','Deluxe Room','Sea View Room'],false,41.014,29.035],
      ['Taksim Style Suites','Contemporary suites minutes from Taksim Square.','istanbul','Turkey',36000,4.2,410,[WIFI,GYM,BREAK,AC],['Studio','Executive Suite'],false,41.009,28.972],
  // Paris
  ['Eiffel View Hotel','Boutique hotel overlooking the Eiffel Tower.','paris','France',105000,4.8,1980,[WIFI,BREAK,AC,ROOM],['Classic Room','Deluxe Room','Eiffel View Suite'],true,48.858,2.295],
  ['Le Marais Charming Hotel','Design-led stay in the historic Marais district.','paris','France',76000,4.5,1430,[WIFI,BREAK,AC,ROOM],['Standard Room','Courtyard Room'],false,48.859,2.362],
  ['Champs-Élysées Grand','Luxury hotel on the famed avenue near the Arc de Triomphe.','paris','France',95000,4.7,1340,[WIFI,POOL_A,GYM,REST,BREAK],['Classic Room','Deluxe Room','Presidential Suite'],false,48.869,2.308],
  ['Latin Quarter Residences','Boutique apartments in the student quarter.','paris','France',68000,4.4,980,[WIFI,BREAK,AC],['Studio','One Bedroom','Deluxe Room'],false,48.853,2.34],
  ['Montmartre View Hotel','Charming stay with artistic flair in Montmartre.','paris','France',58000,4.3,760,[WIFI,REST,BREAK],['Standard Room','Artist Room'],false,48.885,2.34],
  // New York
  ['Manhattan Skyline Hotel','Contemporary hotel with sweeping city views.','new york','United States',22000,4.7,2400,[WIFI,POOL_A,GYM,REST,ROOM],['Standard Room','Skyline Room','Executive Suite'],true,40.753,-73.983],
  ['Midtown Central Suites','Modern suites in the heart of Times Square.','new york','United States',18500,4.5,1980,[WIFI,GYM,BREAK,AC],['Studio','Deluxe Room'],false,40.758,-73.986],
  ['Brooklyn Heights Inn','Boutique hotel across the river from Manhattan.','new york','United States',15200,4.4,1450,[WIFI,REST,BREAK,AC],['Standard Room','Park View Room'],false,40.706,-73.997],
  ['SoHo Design Hotel','Design-forward hotel in the trendy shopping district.','new york','United States',19800,4.6,1320,[WIFI,GYM,BREAK],['Loft Room','Deluxe Suite'],false,40.728,-74.001],
  ['Upper East Suites','Spacious suites near Central Park and museums.','new york','United States',17500,4.3,890,[WIFI,GYM,BREAK,AC],['Studio','One Bedroom'],false,40.774,-73.961],
    // London
  ['Westminster Grand Hotel','Refined West End classic near Parliament.','london','United Kingdom',98000,4.7,2210,[WIFI,GYM,REST,BREAK,ROOM],['Classic Room','Executive Room','Terrace Suite'],true,51.501,-0.128],
  ['Kensington Regency','Elegant boutique hotel in leafy Kensington.','london','United Kingdom',88000,4.6,1720,[WIFI,GYM,REST,SPA,BREAK],['Classic Room','Deluxe Room','Regency Suite'],false,51.5,-0.185],
  ['Covent Garden Boutique','Fashionable hotel in the theatre district.','london','United Kingdom',72000,4.5,1430,[WIFI,REST,BREAK,AC],['Classic Room','Deluxe Room','Garden Suite'],false,51.514,-0.123],
  ['Tower Bridge View Hotel','Modern hotel with iconic bridge views.','london','United Kingdom',82000,4.6,1180,[WIFI,GYM,REST,BREAK],['Classic Room','Tower View Suite'],false,51.505,-0.078],
  ['Southbank Central Suites','Spacious suites along the Thames waterfront.','london','United Kingdom',66000,4.3,890,[WIFI,GYM,BREAK,AC],['Studio','One Bedroom','Executive Suite'],false,51.506,-0.115],
      // Tokyo
  ['Tokyo Bay Grand Hotel','Modern hotel overlooking Tokyo Bay and Rainbow Bridge.','tokyo','Japan',16500,4.6,1780,[WIFI,POOL_A,GYM,REST,ROOM],['Standard Room','Bay View Room','Executive Suite'],true,35.654,139.742],
  ['Shinjuku Central Suites','Contemporary suites steps from Shinjuku Station.','tokyo','Japan',14200,4.4,1560,[WIFI,GYM,REST,BREAK,AC],['Studio','Deluxe Room','City View Suite'],false,35.694,139.704],
  ['Asakusa Heritage Inn','Traditional-style inn near Sensoji Temple.','tokyo','Japan',9800,4.2,980,[WIFI,BREAK,AC],['Standard Room','Garden Room'],false,35.715,139.797],
  ['Ginza Luxury Hotel','High-end hotel in the upscale shopping district.','tokyo','Japan',21000,4.7,1240,[WIFI,POOL_A,SPA,REST,BREAK],['Deluxe Room','Premium Suite','Presidential Suite'],false,35.672,139.761],
  ['Roppongi Hills View','Stylish hotel in the vibrant nightlife district.','tokyo','Japan',13500,4.3,1100,[WIFI,GYM,REST,BREAK],['Standard Room','Executive Room'],false,35.663,139.702],
  // Sydney
  ['Sydney Harbour Grand','Iconic hotel with harbour and Opera House views.','sydney','Australia',17500,4.7,1340,[WIFI,POOL_A,GYM,SPA,REST],['Standard Room','Harbour View Room','Executive Suite'],true,-33.865,151.209],
  ['Bondi Beach Resort','Relaxed resort a block from Bondi Beach.','sydney','Australia',14200,4.4,1120,[WIFI,POOL_A,REST,BREAK],['Standard Room','Ocean View Room','Family Suite'],false,-33.892,151.276],
  ['CBD Central Suites','Modern suites in the heart of the city centre.','sydney','Australia',11800,4.3,920,[WIFI,GYM,BREAK,AC],['Studio','Deluxe Room'],false,-33.869,151.207],
  ['Darling Harbour View','Contemporary hotel with marina and park views.','sydney','Australia',13500,4.5,860,[WIFI,GYM,REST,BREAK],['Standard Room','Harbour View Room'],false,-33.873,151.196],
  ['Newtown Bohemian Inn','Artsy hotel in the vibrant inner-west neighbourhood.','sydney','Australia',9200,4.1,620,[WIFI,BREAK,AC],['Standard Room','Artist Room'],false,-33.897,151.183],
  // Bangkok
  ['Bangkok Riverside Palace','Luxury hotel on the Chao Phraya riverfront.','bangkok','Thailand',11500,4.6,1560,[WIFI,POOL_A,GYM,SPA,REST],['Standard Room','River View Room','Executive Suite'],true,13.746,100.506],
  ['Siam Discovery Suites','Modern suites near the famous shopping district.','bangkok','Thailand',8800,4.3,1240,[WIFI,GYM,REST,BREAK,AC],['Studio','Deluxe Room'],false,13.737,100.523],
  ['Chatuchak Boutique','Charming hotel in the historic old city area.','bangkok','Thailand',6200,4.1,780,[WIFI,BREAK,AC],['Standard Room','Garden Room'],false,13.751,100.492],
  ['Sukhumvit Soi Stay','Trendy hotel along the bustling Sukhumvit road.','bangkok','Thailand',7500,4.2,920,[WIFI,GYM,REST,BREAK],['Standard Room','Executive Room'],false,13.737,100.538],
  ['Khao San Road Inn','Budget-friendly hostel-style hotel in the backpacker zone.','bangkok','Thailand',4200,3.8,560,[WIFI,BREAK,PARK],['Standard Room','Dormitory'],false,13.75,100.493],
  // Cape Town
  ['Cape Town Waterfront Grand','Premium hotel overlooking the V&A Waterfront.','cape town','South Africa',13500,4.7,890,[WIFI,POOL_A,GYM,SPA,REST],['Standard Room','Harbour View Room','Executive Suite'],true,-33.925,18.451],
  ['Table Mountain View','Scenic hotel with iconic flat-topped mountain views.','cape town','South Africa',11200,4.5,720,[WIFI,REST,BREAK,AC],['Deluxe Room','Mountain View Room'],false,-33.921,18.413],
  ['Bo-Kaap Boutique','Colourful boutique hotel in the historic Bo-Kaap neighbourhood.','cape town','South Africa',8200,4.3,480,[WIFI,BREAK,AC],['Standard Room','Courtyard Room'],false,-33.932,18.403],
  ['Gardens Luxury Suites','Spacious suites set against the leafy Gardens suburb.','cape town','South Africa',9800,4.4,640,[WIFI,GYM,BREAK,AC],['Studio','One Bedroom'],false,-33.917,18.429],
  ['Camps Bay Retreat','Relaxed beachfront hotel near Camps Bay.','cape town','South Africa',12500,4.6,560,[WIFI,POOL_A,REST,BREAK],['Standard Room','Sea View Room'],false,-33.931,18.378],
  // Bali
  ['Bali Beachfront Villa','Luxury villas on a pristine southern beach.','bali','Indonesia',9800,4.6,1340,[WIFI,POOL_A,SPA,REST,BREAK],['Beachfront Villa','Garden Villa','Family Suite'],true,-8.512,115.213],
  ['Ubud Jungle Retreat','Tranquil retreat nestled in the rice terraces.','bali','Indonesia',7500,4.4,1020,[WIFI,SPA,BREAK,AC],['Jungle View Room','Terrace Villa','Suite'],false,-8.493,115.261],
  ['Seminyak Central Suites','Contemporary suites in the trendy beach club district.','bali','Indonesia',8200,4.3,840,[WIFI,GYM,REST,BREAK],['Studio','Deluxe Room'],false,-8.692,115.178],
  ['Canggu Surf Resort','Laid-back resort popular with surfers and yogis.','bali','Indonesia',6800,4.1,760,[WIFI,POOL_A,REST,BREAK],['Standard Room','Surf View Room'],false,-8.654,115.181],
  ['Nusa Dua Grand','Elegant hotel on the golden sands of southern Bali.','bali','Indonesia',11000,4.5,680,[WIFI,POOL_A,GYM,SPA,REST,BREAK],['Deluxe Room','Ocean View Room','Executive Suite'],false,-8.783,115.211],
  ['Jimbaran Bay View','Seaside hotel famous for sunset seafood dinners.','bali','Indonesia',9500,4.4,540,[WIFI,REST,BREAK,AC],['Standard Room','Sea View Room'],false,-8.782,115.173],
  // New York
];

const CITY_ADDR = {
  islamabad: 'Sector F-7/2, Islamabad',
  lahore: 'Main Boulevard, Gulberg, Lahore',
  karachi: 'Clifton, Karachi',
  murree: 'Mall Road, Murree',
  hunza: 'Karimabad, Hunza',
  dubai: 'Dubai Marina, Dubai',
  istanbul: 'Sultanahmet, Istanbul',
  london: 'Westminster, London',
  paris: '7th Arrondissement, Paris',
  'new york': 'Midtown Manhattan, New York',
  tokyo: 'Shinjuku, Tokyo',
  sydney: 'Central Business District, Sydney',
  bangkok: 'Sukhumvit, Bangkok',
  'cape town': 'City Bowl, Cape Town',
  bali: 'Seminyak, Bali',
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${mongoose.connection.host}`);

    await Hotel.deleteMany({});
    const hotels = RAW.map((row, i) => {
      const [name, desc, city, country, price, rating, reviews, amen, rooms, featured, lat, lon] = row;
      const a = IMG(POOL[i % POOL.length]);
      const b = IMG(POOL[(i + 3) % POOL.length]);
      const c = IMG(POOL[(i + 5) % POOL.length]);
      return {
        name,
        description: desc,
        city,
        country,
        address: CITY_ADDR[city] || `${city.charAt(0).toUpperCase() + city.slice(1)}, ${country}`,
        latitude: lat,
        longitude: lon,
        pricePerNight: price,
        rating,
        reviewCount: reviews,
        amenities: amen,
        roomTypes: rooms,
        featured,
        isActive: true,
        images: [a, b, c],
        thumbnail: a,
      };
    });

    const inserted = await Hotel.insertMany(hotels);
    const cityCount = new Set(inserted.map((h) => h.city)).size;
    console.log(`Seeded ${inserted.length} hotels across ${cityCount} cities.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
}

seed();