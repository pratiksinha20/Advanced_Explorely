const fs = require('fs');
const path = require('path');

const spotsPath = path.join(__dirname, 'public', 'data', 'spots.json');
const spots = JSON.parse(fs.readFileSync(spotsPath, 'utf8'));
console.log(`Original spots count: ${spots.length}`);

// Backup spots.json before updating
fs.writeFileSync(path.join(__dirname, 'public', 'data', 'spots.pre_add_backup.json'), JSON.stringify(spots));
console.log('Created backup: spots.pre_add_backup.json');

const newSpots = [
  // 1. Delhi - Dilli Haat (INA)
  {
    name: "Dilli Haat (INA)",
    city: "New Delhi",
    state: "Delhi",
    category: "Markets & Bazaars",
    description: "An open-air craft bazaar and food plaza showcasing rural handicrafts, regional art, textiles, and authentic cuisines from every corner of India.",
    image: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=800",
    mapLink: "https://www.google.com/maps?q=28.5732,77.2081",
    rating: 4.8,
    tags: ["Markets & Bazaars", "Handicrafts", "Food & Dining", "Must Visit", "Delhi Tourism"],
    lat: 28.5732,
    lng: 77.2081,
    tier: "most famous"
  },

  // 2. Agra - Taj Museum (Agra Museum)
  {
    name: "Taj Museum (Agra Museum)",
    city: "Agra",
    state: "Uttar Pradesh",
    category: "Museums & Culture",
    description: "Located within the Western Jal Mahal of the Taj Mahal complex, displaying rare Mughal miniature paintings, royal gold and silver coins, and architectural blueprints.",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800",
    mapLink: "https://www.google.com/maps?q=27.1750,78.0421",
    rating: 4.7,
    tags: ["Museums & Culture", "Historical & Heritage", "Mughal Art", "Must Visit"],
    lat: 27.1750,
    lng: 78.0421,
    tier: "most famous"
  },

  // 3. Jaipur - Raj Mandir Cinema
  {
    name: "Raj Mandir Cinema",
    city: "Jaipur",
    state: "Rajasthan",
    category: "Entertainment & Nightlife",
    description: "A world-famous opulent Art Deco movie palace celebrated as the 'Pride of Asia' with meringue-shaped ceilings, crystal chandeliers, and royal Rajasthani architecture.",
    image: "https://images.unsplash.com/photo-1477587458883-47145ed31fd8?w=800",
    mapLink: "https://www.google.com/maps?q=26.9176,75.8118",
    rating: 4.8,
    tags: ["Entertainment & Nightlife", "Historical & Heritage", "Art Deco", "Must Visit", "Jaipur Tourism"],
    lat: 26.9176,
    lng: 75.8118,
    tier: "most famous"
  },

  // 4. Udaipur - Eklingji Temple
  {
    name: "Eklingji Temple",
    city: "Udaipur",
    state: "Rajasthan",
    category: "Spiritual & Temples",
    description: "An ancient 8th-century temple complex featuring a stunning four-faced black marble idol of Lord Shiva (Eklingji), revered as the guardian deity of Mewar.",
    image: "https://images.unsplash.com/photo-1600100397608-f010f443b749?w=800",
    mapLink: "https://www.google.com/maps?q=24.7475,73.7226",
    rating: 4.9,
    tags: ["Spiritual & Temples", "Historical & Heritage", "Mewar Royalty", "Must Visit"],
    lat: 24.7475,
    lng: 73.7226,
    tier: "most famous"
  },

  // 5. Udaipur - Jaisamand Lake
  {
    name: "Jaisamand Lake (Dhebar Lake)",
    city: "Udaipur",
    state: "Rajasthan",
    category: "Lakes & Rivers",
    description: "India's second-largest artificial lake, built in 1685 by Maharana Jai Singh, featuring carved marble cenotaphs, island hills, and an adjoining wildlife sanctuary.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
    mapLink: "https://www.google.com/maps?q=24.2415,73.9678",
    rating: 4.8,
    tags: ["Lakes & Rivers", "Scenic", "Nature & Parks", "Must Visit", "Rajasthan Tourism"],
    lat: 24.2415,
    lng: 73.9678,
    tier: "most famous"
  },

  // 6. Varanasi - Tibetan Temple Sarnath
  {
    name: "Tibetan Temple (Sarnath)",
    city: "Varanasi",
    state: "Uttar Pradesh",
    category: "Spiritual & Temples",
    description: "A peaceful Tibetan Buddhist monastery near Sarnath decorated with intricate thangka tapestries, a statue of Shakyamuni Buddha, and meditative prayer wheels.",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800",
    mapLink: "https://www.google.com/maps?q=25.3789,83.0242",
    rating: 4.7,
    tags: ["Spiritual & Temples", "Buddhism", "Sarnath", "Peaceful"],
    lat: 25.3789,
    lng: 83.0242,
    tier: "famous"
  },

  // 7. Jaisalmer - Tazia Tower
  {
    name: "Tazia Tower",
    city: "Jaisalmer",
    state: "Rajasthan",
    category: "Historical & Heritage",
    description: "A striking 5-tiered pagoda-style tower within the Badal Palace complex, exquisitely sculpted from yellow sandstone by Muslim craftsmen in 1886.",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800",
    mapLink: "https://www.google.com/maps?q=26.9168,70.9123",
    rating: 4.8,
    tags: ["Historical & Heritage", "Architecture", "Must Visit", "Jaisalmer"],
    lat: 26.9168,
    lng: 70.9123,
    tier: "most famous"
  },

  // 8. Jaisalmer - Thar Heritage Museum
  {
    name: "Thar Heritage Museum",
    city: "Jaisalmer",
    state: "Rajasthan",
    category: "Museums & Culture",
    description: "A private folk heritage museum curated by historian LN Khatri, showcasing rare fossils, Rajasthani musical instruments, antique kitchenware, and desert artifacts.",
    image: "https://images.unsplash.com/photo-1600100397608-f010f443b749?w=800",
    mapLink: "https://www.google.com/maps?q=26.9145,70.9174",
    rating: 4.7,
    tags: ["Museums & Culture", "Folk Heritage", "Desert Culture", "Jaisalmer"],
    lat: 26.9145,
    lng: 70.9174,
    tier: "famous"
  },

  // 9. Gulmarg - Gulmarg Gondola
  {
    name: "Gulmarg Gondola",
    city: "Gulmarg",
    state: "Jammu & Kashmir",
    category: "Adventure & Trekking",
    description: "The world's second-highest operating cable car, transporting travelers up to Apharwat Peak at 13,780 feet for world-class skiing and breathtaking snow panoramas.",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800",
    mapLink: "https://www.google.com/maps?q=34.0531,74.3798",
    rating: 4.9,
    tags: ["Adventure & Trekking", "Snow & Skiing", "Cable Car", "Must Visit", "Kashmir Tourism"],
    lat: 34.0531,
    lng: 74.3798,
    tier: "most famous"
  },

  // 10. Gulmarg - Apharwat Peak
  {
    name: "Apharwat Peak",
    city: "Gulmarg",
    state: "Jammu & Kashmir",
    category: "Mountains & Viewpoints",
    description: "A towering snow-clad Himalayan mountain summit standing at 4,390 meters near the Line of Control, offering deep powder skiing and pristine alpine lake views.",
    image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800",
    mapLink: "https://www.google.com/maps?q=34.0245,74.3412",
    rating: 4.9,
    tags: ["Mountains & Viewpoints", "Snow & Skiing", "Alpine Lake", "Must Visit"],
    lat: 34.0245,
    lng: 74.3412,
    tier: "most famous"
  },

  // 11. Srinagar - Nigeen Lake
  {
    name: "Nigeen Lake (Nagin Lake)",
    city: "Srinagar",
    state: "Jammu & Kashmir",
    category: "Lakes & Rivers",
    description: "Known as the 'Jewel in the Ring', Nigeen Lake is a tranquil, willow-fringed freshwater body offering serene luxury houseboat stays and gentle shikara journeys.",
    image: "https://images.unsplash.com/photo-1598394244963-3a0b50bb5406?w=800",
    mapLink: "https://www.google.com/maps?q=34.1165,74.8322",
    rating: 4.8,
    tags: ["Lakes & Rivers", "Houseboats", "Shikara", "Scenic", "Kashmir Tourism"],
    lat: 34.1165,
    lng: 74.8322,
    tier: "most famous"
  },

  // 12. Srinagar - Pari Mahal
  {
    name: "Pari Mahal (Palace of Fairies)",
    city: "Srinagar",
    state: "Jammu & Kashmir",
    category: "Historical & Heritage",
    description: "A 7-tiered Mughal garden and former astrological observatory built by Prince Dara Shikoh in the mid-1600s, perched dramatically over Dal Lake on Zabarwan mountain.",
    image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800",
    mapLink: "https://www.google.com/maps?q=34.0812,74.8872",
    rating: 4.8,
    tags: ["Historical & Heritage", "Mughal Garden", "Viewpoints", "Must Visit"],
    lat: 34.0812,
    lng: 74.8872,
    tier: "most famous"
  },

  // 13. Srinagar - Shankaracharya Temple
  {
    name: "Shankaracharya Temple (Gopadri Hill)",
    city: "Srinagar",
    state: "Jammu & Kashmir",
    category: "Spiritual & Temples",
    description: "An ancient stone temple dedicated to Lord Shiva dating back to 200 BC, perched 1,100 feet above the valley on Gopadri Hill, providing 360-degree views of Srinagar and Dal Lake.",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800",
    mapLink: "https://www.google.com/maps?q=34.0725,74.8425",
    rating: 4.9,
    tags: ["Spiritual & Temples", "Historical & Heritage", "Panoramic Views", "Must Visit"],
    lat: 34.0725,
    lng: 74.8425,
    tier: "most famous"
  },

  // 14. Ladakh - Nubra Valley (Hunder Sand Dunes)
  {
    name: "Nubra Valley (Hunder Sand Dunes)",
    city: "Hunder",
    state: "Ladakh",
    category: "Scenic",
    description: "The high-altitude cold desert valley of Ladakh famed for its white sand dunes, double-humped shaggy Bactrian camels, and stark mountain walls.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    mapLink: "https://www.google.com/maps?q=34.5816,77.4725",
    rating: 4.9,
    tags: ["Scenic", "Desert", "Bactrian Camels", "Must Visit", "Ladakh Tourism"],
    lat: 34.5816,
    lng: 77.4725,
    tier: "most famous"
  },

  // 15. Ladakh - Pangong Tso (Pangong Lake)
  {
    name: "Pangong Tso (Pangong Lake)",
    city: "Pangong",
    state: "Ladakh",
    category: "Lakes & Rivers",
    description: "An endorheic saltwater lake at 14,270 feet extending from India into Tibet, world-famous for its crystal-clear waters that shift from turquoise to deep indigo.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
    mapLink: "https://www.google.com/maps?q=33.7595,78.6674",
    rating: 4.9,
    tags: ["Lakes & Rivers", "Scenic", "High Altitude", "Must Visit", "Ladakh Tourism"],
    lat: 33.7595,
    lng: 78.6674,
    tier: "most famous"
  },

  // 16. Ladakh - Khardung La Pass
  {
    name: "Khardung La Pass",
    city: "Khardung",
    state: "Ladakh",
    category: "Adventure & Trekking",
    description: "One of the world's highest motorable mountain passes at 17,582 ft (5,359 m), acting as the legendary gateway connecting the Indus Valley to Nubra and Siachen.",
    image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800",
    mapLink: "https://www.google.com/maps?q=34.2787,77.6047",
    rating: 4.9,
    tags: ["Adventure & Trekking", "Mountain Pass", "High Altitude", "Must Visit"],
    lat: 34.2787,
    lng: 77.6047,
    tier: "most famous"
  },

  // 17. Ladakh - Leh Palace
  {
    name: "Leh Palace",
    city: "Leh",
    state: "Ladakh",
    category: "Historical & Heritage",
    description: "A 17th-century nine-story Tibetan royal palace built by King Sengge Namgyal, offering museum galleries of Tibetan thangkas and panoramic vistas of Leh and Stok Kangri.",
    image: "https://images.unsplash.com/photo-1580458748802-ade1800f12af?w=800",
    mapLink: "https://www.google.com/maps?q=34.1642,77.5849",
    rating: 4.8,
    tags: ["Historical & Heritage", "Tibetan Architecture", "Must Visit", "Leh Tourism"],
    lat: 34.1642,
    lng: 77.5849,
    tier: "most famous"
  },

  // 18. Ladakh - Chadar Trek Route
  {
    name: "Chadar Trek (Frozen Zanskar River)",
    city: "Zanskar",
    state: "Ladakh",
    category: "Adventure & Trekking",
    description: "A legendary winter walking expedition across the frozen sheet of the Zanskar River beneath towering Himalayan gorges in sub-zero temperatures.",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800",
    mapLink: "https://www.google.com/maps?q=33.8562,76.9854",
    rating: 4.9,
    tags: ["Adventure & Trekking", "Winter Trek", "Frozen River", "Must Visit"],
    lat: 33.8562,
    lng: 76.9854,
    tier: "most famous"
  },

  // 19. Assam - Kakochang Waterfall
  {
    name: "Kakochang Waterfall",
    city: "Golaghat",
    state: "Assam",
    category: "Waterfalls",
    description: "A magnificent natural cascade tumbling through dense tropical greenery and coffee/rubber plantations near Bokakhat, close to Kaziranga National Park.",
    image: "https://images.unsplash.com/photo-1617898893024-1bc67e7e7d39?w=800",
    mapLink: "https://www.google.com/maps?q=26.5412,93.5824",
    rating: 4.7,
    tags: ["Waterfalls", "Nature & Parks", "Picnic Spot", "Assam Tourism"],
    lat: 26.5412,
    lng: 93.5824,
    tier: "most famous"
  },

  // 20. Assam - Nameri National Park
  {
    name: "Nameri National Park",
    city: "Tezpur",
    state: "Assam",
    category: "Wildlife & Safari",
    description: "Nestled in the foothills of the Eastern Himalayas, famous for river rafting on the crystal Jia Bhoroli River, Golden Mahseer fishing, and rare White-Winged Wood Ducks.",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800",
    mapLink: "https://www.google.com/maps?q=26.9287,92.8398",
    rating: 4.8,
    tags: ["Wildlife & Safari", "River Rafting", "Birdwatching", "Must Visit"],
    lat: 26.9287,
    lng: 92.8398,
    tier: "most famous"
  },

  // 21. Uttarakhand - Corbett Falls
  {
    name: "Corbett Falls",
    city: "Jim Corbett (Ramnagar)",
    state: "Uttarakhand",
    category: "Waterfalls",
    description: "A scenic 20-meter high waterfall surrounded by dense teak woods near Kaladhungi, offering soothing forest music, walking trails, and rich birdlife.",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800",
    mapLink: "https://www.google.com/maps?q=29.3241,79.2845",
    rating: 4.8,
    tags: ["Waterfalls", "Nature & Parks", "Corbett", "Must Visit"],
    lat: 29.3241,
    lng: 79.2845,
    tier: "most famous"
  },

  // 22. Uttarakhand - Ramganga Reservoir
  {
    name: "Ramganga Reservoir (Kalagarh Dam)",
    city: "Jim Corbett (Ramnagar)",
    state: "Uttarakhand",
    category: "Lakes & Rivers",
    description: "A sprawling emerald reservoir formed by the Ramganga Dam at Corbett's southwestern edge, attracting winter migratory waterbirds, marsh crocodiles, and wild elephant herds.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
    mapLink: "https://www.google.com/maps?q=29.5312,78.7654",
    rating: 4.7,
    tags: ["Lakes & Rivers", "Wildlife & Safari", "Corbett", "Birdwatching"],
    lat: 29.5312,
    lng: 78.7654,
    tier: "famous"
  },

  // 23. Nainital - Naina Peak (Cheena Peak)
  {
    name: "Naina Peak (Cheena Peak)",
    city: "Nainital",
    state: "Uttarakhand",
    category: "Mountains & Viewpoints",
    description: "The highest vantage point in Nainital at 2,615 meters, offering breathtaking views of the snow-clad Nanda Devi range, the Tibetan border peaks, and the valley below.",
    image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800",
    mapLink: "https://www.google.com/maps?q=29.4065,79.4452",
    rating: 4.9,
    tags: ["Mountains & Viewpoints", "Trekking", "Panoramic Views", "Must Visit"],
    lat: 29.4065,
    lng: 79.4452,
    tier: "most famous"
  },

  // 24. Nainital - Kainchi Dham Ashram
  {
    name: "Kainchi Dham (Neem Karoli Baba Ashram)",
    city: "Nainital",
    state: "Uttarakhand",
    category: "Spiritual & Temples",
    description: "A globally celebrated spiritual ashram nestled in a peaceful Kumaon valley, established by Neem Karoli Baba and visited by millions of devotees and global thinkers.",
    image: "https://images.unsplash.com/photo-1600100397608-f010f443b749?w=800",
    mapLink: "https://www.google.com/maps?q=29.4215,79.5168",
    rating: 4.9,
    tags: ["Spiritual & Temples", "Neem Karoli Baba", "Meditation", "Must Visit"],
    lat: 29.4215,
    lng: 79.5168,
    tier: "most famous"
  },

  // 25. Nainital - Sherwani Hilltop
  {
    name: "Sherwani Hilltop & View",
    city: "Nainital",
    state: "Uttarakhand",
    category: "Scenic",
    description: "A serene hilltop vantage point encircled by oak and pine forests, offering scenic walking trails and peaceful sunset perspectives above Nainital town.",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800",
    mapLink: "https://www.google.com/maps?q=29.3952,79.4532",
    rating: 4.7,
    tags: ["Scenic", "Viewpoints", "Nature & Parks"],
    lat: 29.3952,
    lng: 79.4532,
    tier: "famous"
  },

  // 26. Nainital - Aamod Nature Retreat & Trails
  {
    name: "Aamod Nature Walk & Adventure Point",
    city: "Nainital",
    state: "Uttarakhand",
    category: "Adventure & Trekking",
    description: "An eco-adventure destination nestled in the Kumaon hills, featuring Burma bridge walks, forest ziplining, camping, and mountain nature walks.",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800",
    mapLink: "https://www.google.com/maps?q=29.3512,79.5541",
    rating: 4.7,
    tags: ["Adventure & Trekking", "Nature & Parks", "Camping", "Eco Tourism"],
    lat: 29.3512,
    lng: 79.5541,
    tier: "famous"
  },

  // 27. Khajjiar - Pohlani Mata Temple
  {
    name: "Pohlani Mata Temple (Dainkund)",
    city: "Khajjiar",
    state: "Himachal Pradesh",
    category: "Spiritual & Temples",
    description: "A high-altitude Hindu shrine on Dainkund Peak offering panoramic 360-degree vistas of the Pir Panjal mountains and the Chenab river valley far below.",
    image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800",
    mapLink: "https://www.google.com/maps?q=32.5512,76.0592",
    rating: 4.8,
    tags: ["Spiritual & Temples", "Mountains & Viewpoints", "Trekking", "Himachal Tourism"],
    lat: 32.5512,
    lng: 76.0592,
    tier: "famous"
  },

  // 28. Chamba - Chamba Town Heritage (Chaugan)
  {
    name: "Chamba Town Heritage (Chaugan & Laxmi Narayan Temples)",
    city: "Chamba",
    state: "Himachal Pradesh",
    category: "Historical & Heritage",
    description: "An ancient Himalayan town founded in 920 AD on the banks of the Ravi River, famous for its historic grassy Chaugan esplanade and carved 10th-century shikhara temples.",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800",
    mapLink: "https://www.google.com/maps?q=32.5534,76.1258",
    rating: 4.8,
    tags: ["Historical & Heritage", "Ancient Temples", "Chamba Art", "Must Visit"],
    lat: 32.5534,
    lng: 76.1258,
    tier: "most famous"
  },

  // 29. Kolkata - Belur Math
  {
    name: "Belur Math",
    city: "Kolkata",
    state: "West Bengal",
    category: "Spiritual & Temples",
    description: "The global headquarters of the Ramakrishna Math and Mission, founded by Swami Vivekananda on the banks of the Hooghly River, harmonizing Hindu, Christian, and Islamic architecture.",
    image: "https://images.unsplash.com/photo-1558618047-f4e60e1a57f2?w=800",
    mapLink: "https://www.google.com/maps?q=22.6322,88.3562",
    rating: 4.9,
    tags: ["Spiritual & Temples", "Historical & Heritage", "Architecture", "Must Visit", "Kolkata Tourism"],
    lat: 22.6322,
    lng: 88.3562,
    tier: "most famous"
  },

  // 30. Kolkata - Fort William
  {
    name: "Fort William",
    city: "Kolkata",
    state: "West Bengal",
    category: "Historical & Heritage",
    description: "An immense British-era star-shaped military citadel constructed in 1781 overlooking the Hooghly River, named after King William III and surrounded by Kolkata's vast Maidan.",
    image: "https://images.unsplash.com/photo-1558618047-f4e60e1a57f2?w=800",
    mapLink: "https://www.google.com/maps?q=22.5548,88.3364",
    rating: 4.7,
    tags: ["Historical & Heritage", "Fortresses", "British Architecture", "Must Visit"],
    lat: 22.5548,
    lng: 88.3364,
    tier: "most famous"
  },

  // 31. Kolkata - Calcutta Botanical Garden
  {
    name: "Acharya Jagadish Chandra Bose Indian Botanic Garden (Calcutta Botanical Garden)",
    city: "Kolkata",
    state: "West Bengal",
    category: "Nature & Parks",
    description: "A historic 273-acre botanical haven founded in 1787 on the banks of the Hooghly, home to thousands of exotic plants and the famous 250-year-old Great Banyan Tree spanning over 3.5 acres.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    mapLink: "https://www.google.com/maps?q=22.5592,88.2912",
    rating: 4.8,
    tags: ["Nature & Parks", "Botanical Garden", "Great Banyan Tree", "Must Visit"],
    lat: 22.5592,
    lng: 88.2912,
    tier: "most famous"
  },

  // 32. Gujarat - Mandvi Beach
  {
    name: "Mandvi Beach",
    city: "Mandvi",
    state: "Gujarat",
    category: "Beaches",
    description: "A tranquil shoreline along the Gulf of Kutch famous for golden sands, camel and horse rides, coastal wind farms, and stunning sunset views over the Arabian Sea.",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800",
    mapLink: "https://www.google.com/maps?q=22.8258,69.3458",
    rating: 4.8,
    tags: ["Beaches", "Sunset View", "Coastal", "Must Visit", "Gujarat Tourism"],
    lat: 22.8258,
    lng: 69.3458,
    tier: "most famous"
  },

  // 33. Maharashtra - Ajanta & Ellora Ancient Rock-Cut Architecture
  {
    name: "Ajanta & Ellora Ancient Rock-Cut Architecture",
    city: "Aurangabad",
    state: "Maharashtra",
    category: "Historical & Heritage",
    description: "UNESCO World Heritage ancient rock-cut masterworks spanning 2nd century BCE to 10th century CE, featuring monumental Buddhist chaityas, Hindu shrines, and the monolithic Kailash Temple.",
    image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800",
    mapLink: "https://www.google.com/maps?q=20.0268,75.1792",
    rating: 4.9,
    tags: ["Historical & Heritage", "UNESCO World Heritage", "Ancient Rock-Cut", "Must Visit"],
    lat: 20.0268,
    lng: 75.1792,
    tier: "most famous"
  }
];

console.log(`Adding ${newSpots.length} verified missing attractions...`);

// Check if any of these are already in spots (prevent duplicate addition)
const added = [];
for (const spot of newSpots) {
  const existing = spots.find(s => s.name.toLowerCase() === spot.name.toLowerCase() && s.city.toLowerCase() === spot.city.toLowerCase());
  if (!existing) {
    spots.push(spot);
    added.push(spot.name);
  } else {
    console.log(`Already exists: ${spot.name}`);
  }
}

console.log(`Successfully added ${added.length} new attractions to spots.json!`);
console.log(`New total spots: ${spots.length}`);

// Save updated spots.json
fs.writeFileSync(spotsPath, JSON.stringify(spots, null, 2), 'utf8');
console.log('Saved updated spots.json successfully!');
