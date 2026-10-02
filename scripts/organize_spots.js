/**
 * scripts/organize_spots.js
 * 
 * Organizes each tourist place in every city in India by fame, popularity, and importance.
 * Places the absolute best and most famous spots FIRST so tourists see top attractions immediately.
 * 
 * - Preserves all 21,614 spots (no data loss, no deletions).
 * - Calibrates 'tier' ('most famous', 'famous', 'hidden') and 'rating' (5.0 down to 3.8).
 * - Sorts authentic landmarks to the top, relegates generic template spots to the bottom.
 * - Physically organizes spots.json grouped by State -> City -> Famous Rank!
 */

const fs = require('fs');
const path = require('path');

const SPOTS_FILE = path.join(__dirname, '../public/data/spots.json');
const BACKUP_FILE = path.join(__dirname, '../public/data/backups/spots.before_fame_org.json');

// Ensure backups directory exists
const backupDir = path.dirname(BACKUP_FILE);
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

// 1. Template Suffixes that were generated and should always sit below real landmarks
const TEMPLATE_PATTERNS = [
    /Grand Clock Tower & Square$/i,
    /Sunset Point & Ridge$/i,
    /Hanuman Hill Shrine$/i,
    /Riverside Ghat & Walkway$/i,
    /Craft Village & Art Center$/i,
    /Nature Reserve & Forest Walk$/i,
    /Royal Haveli & Courtyard$/i,
    /Sun Viewpoint$/i,
    /Memorial Museum$/i,
    /Old Fort Ruins$/i,
    /Cascade Waterfalls$/i,
    /Peace Lake & Promenade$/i,
    /Wildlife Sanctuary Gate$/i,
    /Shiva Ashram & Meditation Spot$/i,
    /Trekker Trailhead$/i
];

function isTemplateSpot(name) {
    if (!name) return false;
    return TEMPLATE_PATTERNS.some(p => p.test(name.trim()));
}

// 2. Curated Landmark Priorities for major Indian cities
// These represent the undisputed, top-tier attractions that every tourist wants to visit first.
const CITY_LANDMARK_PRIORITIES = {
    // Punjab & Chandigarh
    'Chandigarh': [
        'Rock Garden',
        'Sukhna Lake',
        'Zakir Hussain Rose Garden',
        'Rose Garden',
        'Capitol Complex',
        'Open Hand Monument',
        'Elante Mall',
        'Sector 17 Plaza',
        'Government Museum and Art Gallery',
        'Le Corbusier Centre',
        'Japanese Garden',
        'Nada Sahib Gurudwara',
        'International Dolls Museum',
        'Garden of Fragrance'
    ],
    'Amritsar': [
        'Golden Temple',
        'Harmandir Sahib',
        'Wagah Border',
        'Jallianwala Bagh',
        'Gobindgarh Fort',
        'Durgiana Temple',
        'Maharaja Ranjit Singh Museum',
        'Akal Takht',
        'Hall Bazaar',
        'Central Sikh Museum',
        'Tarn Taran Sahib',
        'Ram Bagh Gardens'
    ],
    'Ludhiana': [
        'Lodhi Fort',
        'Punjab Agricultural University Museum',
        'Nehru Rose Garden',
        'Hardy World',
        'Gurudwara Manji Sahib'
    ],
    'Patiala': [
        'Qila Mubarak',
        'Sheesh Mahal',
        'Moti Bagh Palace',
        'Baradari Garden',
        'Gurudwara Dukh Niwaran Sahib',
        'Bahadurgarh Fort'
    ],
    'Bathinda': [
        'Qila Mubarak Bathinda',
        'Bathinda Lake',
        'Rose Garden Bathinda',
        'Damdama Sahib',
        'Chetak Park'
    ],
    'Kapurthala': [
        'Jagatjit Palace',
        'Moorish Mosque',
        'Elysee Palace',
        'Shalimar Gardens Kapurthala'
    ],

    // Delhi
    'New Delhi': [
        'India Gate',
        'Qutub Minar',
        'Humayun\'s Tomb',
        'Lotus Temple',
        'Swaminarayan Akshardham',
        'Akshardham Temple',
        'Rashtrapati Bhavan',
        'Gurudwara Bangla Sahib',
        'National Museum',
        'Dilli Haat',
        'Lodhi Garden',
        'Jantar Mantar',
        'Agrasen Ki Baoli',
        'Safdarjung Tomb'
    ],
    'South Delhi': [
        'Qutub Minar',
        'Lotus Temple',
        'Hauz Khas Village',
        'Hauz Khas Fort',
        'Mehrauli Archaeological Park',
        'Tughlaqabad Fort',
        'Chattarpur Temple',
        'Chhatarpur Mandir',
        'Garden of Five Senses'
    ],
    'Old Delhi': [
        'Red Fort',
        'Jama Masjid',
        'Chandni Chowk',
        'Raj Ghat',
        'Fatehpuri Masjid',
        'Khari Baoli'
    ],
    'Central Delhi': [
        'India Gate',
        'Rashtrapati Bhavan',
        'National War Memorial',
        'National Gallery of Modern Art',
        'Sacred Heart Cathedral'
    ],
    'Connaught Place': [
        'Connaught Place',
        'Gurudwara Bangla Sahib',
        'Jantar Mantar',
        'Janpath Market',
        'Madame Tussauds',
        'Palika Bazaar'
    ],

    // Rajasthan
    'Jaipur': [
        'Hawa Mahal',
        'Amber Fort',
        'Amer Fort',
        'City Palace',
        'Jal Mahal',
        'Jantar Mantar',
        'Nahargarh Fort',
        'Jaigarh Fort',
        'Albert Hall Museum',
        'Birla Mandir',
        'Chokhi Dhani',
        'Galta Ji Temple',
        'Govind Dev Ji Temple',
        'Bapu Bazaar',
        'Raj Mandir Cinema'
    ],
    'Udaipur': [
        'City Palace',
        'Lake Pichola',
        'Lake Palace',
        'Jag Mandir',
        'Saheliyon-ki-Bari',
        'Fateh Sagar Lake',
        'Sajjangarh Palace',
        'Monsoon Palace',
        'Bagore Ki Haveli',
        'Jagdish Temple',
        'Karni Mata Ropeway',
        'Ambrai Ghat',
        'Shilpgram'
    ],
    'Jodhpur': [
        'Mehrangarh Fort',
        'Umaid Bhawan Palace',
        'Jaswant Thada',
        'Mandore Gardens',
        'Clock Tower Jodhpur',
        'Sardar Market',
        'Rao Jodha Desert Rock Park',
        'Kaylana Lake',
        'Toorji Ka Jhalra'
    ],
    'Jaisalmer': [
        'Jaisalmer Fort',
        'Sonar Qila',
        'Sam Sand Dunes',
        'Patwon Ki Haveli',
        'Gadisar Lake',
        'Kuldhara',
        'Salim Singh Ki Haveli',
        'Bada Bagh',
        'Nathmal Ki Haveli',
        'Desert National Park'
    ],
    'Pushkar': [
        'Brahma Temple',
        'Pushkar Lake',
        'Savitri Temple',
        'Varaha Temple',
        'Desert Camp Pushkar'
    ],
    'Ajmer': [
        'Ajmer Sharif Dargah',
        'Ana Sagar Lake',
        'Adhai Din Ka Jhonpra',
        'Taragarh Fort',
        'Akbar\'s Palace & Museum',
        'Nareli Jain Temple'
    ],
    'Mount Abu': [
        'Dilwara Temples',
        'Nakki Lake',
        'Guru Shikhar',
        'Sunset Point Mount Abu',
        'Achalgarh Fort',
        'Toad Rock'
    ],
    'Chittorgarh': [
        'Chittorgarh Fort',
        'Vijay Stambha',
        'Kirti Stambha',
        'Rana Kumbha Palace',
        'Padmini Palace',
        'Meera Temple'
    ],
    'Bikaner': [
        'Junagarh Fort',
        'Karni Mata Temple',
        'Lalgarh Palace',
        'National Research Centre on Camel',
        'Gajner Palace',
        'Rampuria Havelis'
    ],

    // Uttar Pradesh
    'Agra': [
        'Taj Mahal',
        'Agra Fort',
        'Fatehpur Sikri',
        'Akbar\'s Tomb, Sikandra',
        'Tomb of Itimad-ud-Daulah',
        'Baby Taj',
        'Mehtab Bagh',
        'Taj Museum',
        'Jama Masjid Agra',
        'Chini Ka Rauza'
    ],
    'Varanasi': [
        'Kashi Vishwanath Temple',
        'Dashashwamedh Ghat',
        'Assi Ghat',
        'Manikarnika Ghat',
        'Sarnath Dhamek Stupa',
        'Sarnath',
        'New Vishwanath Temple',
        'Sankat Mochan Hanuman Temple',
        'Ramnagar Fort',
        'Tulsi Manas Mandir',
        'Durga Temple'
    ],
    'Ayodhya': [
        'Shri Ram Janmabhoomi Mandir',
        'Ram Janmabhoomi Temple',
        'Hanuman Garhi',
        'Hanumangarhi',
        'Kanak Bhawan',
        'Nageshwarnath Temple',
        'Ram Ki Paidi',
        'Sarayu River Ghats',
        'Dashrath Mahal',
        'Sita Ki Rasoi',
        'Surya Kund',
        'Gulab Bari',
        'Bharat Kund',
        'Mani Parbat'
    ],
    'Lucknow': [
        'Bara Imambara',
        'Bhool Bhulaiya',
        'Chota Imambara',
        'Chhota Imambara',
        'Rumi Darwaza',
        'The Residency',
        'British Residency',
        'Hazratganj',
        'Ambedkar Memorial Park',
        'Husainabad Clock Tower',
        'Dilkusha Kothi',
        'Lucknow Zoo',
        'Janeshwar Mishra Park',
        'State Museum Lucknow'
    ],
    'Prayagraj': [
        'Triveni Sangam',
        'Allahabad Fort',
        'Anand Bhavan',
        'Khusro Bagh',
        'All Saints Cathedral',
        'Alopi Devi Mandir',
        'Bade Hanuman Ji Temple',
        'Chandra Shekhar Azad Park',
        'Swaraj Bhavan'
    ],
    'Mathura': [
        'Krishna Janmasthan Temple',
        'Shri Krishna Janmabhoomi',
        'Dwarkadhish Temple',
        'Vishram Ghat',
        'Gita Mandir',
        'Kans Qila',
        'Potara Kund',
        'Govardhan Hill'
    ],
    'Vrindavan': [
        'Banke Bihari Temple',
        'Prem Mandir',
        'ISKCON Vrindavan',
        'Nidhivan',
        'Radha Raman Temple',
        'Rangji Temple',
        'Katyayani Peeth'
    ],

    // Maharashtra
    'Mumbai': [
        'Gateway of India',
        'Marine Drive',
        'Chhatrapati Shivaji Maharaj Terminus',
        'CST',
        'Elephanta Caves',
        'Bandra-Worli Sea Link',
        'Siddhivinayak Temple',
        'Haji Ali Dargah',
        'Juhu Beach',
        'Colaba Causeway',
        'Sanjay Gandhi National Park',
        'Kanheri Caves',
        'Bandra Fort',
        'Mount Mary Church',
        'Crawford Market',
        'Chor Bazaar',
        'Hanging Gardens'
    ],
    'Pune': [
        'Shaniwar Wada',
        'Aga Khan Palace',
        'Sinhagad Fort',
        'Dagdusheth Halwai Ganpati Temple',
        'Raja Dinkar Kelkar Museum',
        'Osho Ashram',
        'Parvati Hill',
        'Vetal Tekdi',
        'Pataleshwar Cave Temple'
    ],
    'Aurangabad': [
        'Ajanta Caves',
        'Ellora Caves',
        'Bibi Ka Maqbara',
        'Daulatabad Fort',
        'Grishneshwar Jyotirlinga Temple',
        'Panchakki',
        'Aurangabad Caves'
    ],
    'Nashik': [
        'Trimbakeshwar Shiva Temple',
        'Panchavati',
        'Sula Vineyards',
        'Pandavleni Caves',
        'Muktidham Temple',
        'Kalaram Temple',
        'Ramkund'
    ],
    'Shirdi': [
        'Sai Baba Sansthan Temple',
        'Dwarkamai',
        'Chavadi',
        'Khandoba Temple',
        'Lendi Baug',
        'Dixit Wada Museum'
    ],
    'Lonavala': [
        'Tiger\'s Leap',
        'Bhushi Dam',
        'Karla Caves',
        'Bhaja Caves',
        'Lonavala Lake',
        'Lohagad Fort',
        'Rajmachi Point',
        'Kune Falls'
    ],
    'Mahabaleshwar': [
        'Arthur\'s Seat',
        'Venna Lake',
        'Elephant\'s Head Point',
        'Mahabaleshwar Temple',
        'Pratapgad Fort',
        'Mapro Garden',
        'Lingmala Waterfall',
        'Wilson Point'
    ],

    // West Bengal
    'Kolkata': [
        'Victoria Memorial',
        'Howrah Bridge',
        'Dakshineswar Kali Temple',
        'Belur Math',
        'Indian Museum',
        'Eden Gardens',
        'St. Paul\'s Cathedral',
        'Science City',
        'Marble Palace',
        'Kalighat Kali Temple',
        'Princep Ghat',
        'Kumartuli',
        'Eco Park',
        'Birla Planetarium',
        'Alipore Zoo',
        'College Street Boi Para'
    ],
    'Darjeeling': [
        'Tiger Hill',
        'Darjeeling Himalayan Railway',
        'Batasia Loop',
        'Happy Valley Tea Estate',
        'Peace Pagoda',
        'Japanese Peace Pagoda',
        'Padmaja Naidu Himalayan Zoological Park',
        'Himalayan Mountaineering Institute',
        'Ghoom Monastery',
        'Rock Garden Darjeeling'
    ],
    'Kalimpong': [
        'Deolo Hill',
        'Durpin Dara Hill',
        'Zang Dhok Palri Phodang',
        'Cactus Nursery Kalimpong',
        'Morgan House'
    ],

    // Karnataka
    'Bengaluru': [
        'Bangalore Palace',
        'Lalbagh Botanical Garden',
        'Cubbon Park',
        'Bannerghatta National Park',
        'ISKCON Temple Bangalore',
        'Vidhana Soudha',
        'Visvesvaraya Science Museum',
        'HAL Aerospace Museum',
        'Tipu Sultan\'s Summer Palace',
        'Bull Temple Basavanagudi',
        'Commercial Street',
        'Ulsoor Lake'
    ],
    'Mysuru': [
        'Mysore Palace',
        'Chamundeshwari Temple',
        'Brindavan Gardens',
        'Mysore Zoo',
        'St. Philomena\'s Cathedral',
        'Jaganmohan Palace',
        'Karanji Lake',
        'Lalitha Mahal',
        'Railway Museum Mysore'
    ],
    'Mysore': [
        'Mysore Palace',
        'Chamundeshwari Temple',
        'Brindavan Gardens',
        'Mysore Zoo',
        'St. Philomena\'s Cathedral',
        'Jaganmohan Palace',
        'Karanji Lake',
        'Lalitha Mahal'
    ],
    'Hampi': [
        'Virupaksha Temple',
        'Vijaya Vittala Temple',
        'Stone Chariot',
        'Lotus Mahal',
        'Elephant Stables',
        'Matanga Hill',
        'Achyutaraya Temple',
        'Queen\'s Bath',
        'Tungabhadra River'
    ],
    'Coorg (Madikeri)': [
        'Abbey Falls',
        'Raja\'s Seat',
        'Madikeri Fort',
        'Dubare Elephant Camp',
        'Namdroling Monastery (Golden Temple)',
        'Talakaveri',
        'Tadiandamol Peak',
        'Iruppu Falls'
    ],
    'Gokarna': [
        'Om Beach',
        'Mahabaleshwar Temple Gokarna',
        'Kudle Beach',
        'Half Moon Beach',
        'Paradise Beach Gokarna',
        'Mirjan Fort'
    ],
    'Halebidu': [
        'Hoysaleswara Temple',
        'Kedareshwara Temple Halebidu'
    ],
    'Belur': [
        'Chennakeshava Temple Belur'
    ],
    'Badami': [
        'Badami Cave Temples',
        'Agastya Lake',
        'Bhutanatha Temples',
        'Badami Fort'
    ],
    'Pattadakal': [
        'Virupaksha Temple Pattadakal',
        'Mallikarjuna Temple Pattadakal',
        'Papanatha Temple'
    ],

    // Tamil Nadu
    'Chennai': [
        'Marina Beach',
        'Kapaleeshwarar Temple',
        'San Thome Basilica',
        'Fort St. George',
        'Government Museum Chennai',
        'Guindy National Park',
        'Elliot\'s Beach',
        'Besant Nagar Beach',
        'Valluvar Kottam',
        'DakshinaChitra',
        'Arignar Anna Zoological Park'
    ],
    'Madurai': [
        'Meenakshi Amman Temple',
        'Thirumalai Nayakkar Mahal',
        'Gandhi Memorial Museum',
        'Alagar Kovil',
        'Koodal Azhagar Temple',
        'Vandiyur Mariamman Teppakulam'
    ],
    'Rameshwaram': [
        'Ramanathaswamy Temple',
        'Agni Theertham',
        'Dhanushkodi Beach',
        'Pamban Bridge',
        'APJ Abdul Kalam Memorial',
        'Kothandaramaswamy Temple',
        'Ariyaman Beach'
    ],
    'Kanyakumari': [
        'Vivekananda Rock Memorial',
        'Thiruvalluvar Statue',
        'Kanyakumari Bhagavathi Amman Temple',
        'Sunset View Point Kanyakumari',
        'Gandhi Memorial Mandapam',
        'Our Lady of Ransom Church',
        'Padmanabhapuram Palace'
    ],
    'Ooty': [
        'Nilgiri Mountain Railway',
        'Toy Train',
        'Ooty Botanical Gardens',
        'Ooty Lake',
        'Doddabetta Peak',
        'Rose Garden Ooty',
        'Pykara Lake',
        'Pykara Waterfalls',
        'Avalanche Lake',
        'Emerald Lake',
        'Tea Museum Ooty'
    ],
    'Kodaikanal': [
        'Kodaikanal Lake',
        'Coaker\'s Walk',
        'Bryant Park',
        'Pillar Rocks',
        'Silver Cascade Falls',
        'Pine Forest Kodaikanal',
        'Bear Shola Falls',
        'Dolphin\'s Nose Kodaikanal'
    ],
    'Mahabalipuram': [
        'Shore Temple',
        'Pancha Rathas',
        'Descent of the Ganges (Arjuna\'s Penance)',
        'Krishna\'s Butterball',
        'Mahabalipuram Beach',
        'Tiger Cave'
    ],
    'Thanjavur': [
        'Brihadeeswarar Temple',
        'Thanjavur Royal Palace',
        'Saraswathi Mahal Library',
        'Thanjavur Art Gallery',
        'Schwartz Church'
    ],

    // Kerala
    'Kochi (Cochin)': [
        'Chinese Fishing Nets',
        'Fort Kochi',
        'Mattancherry Palace',
        'Dutch Palace',
        'Jewish Synagogue',
        'Paradesi Synagogue',
        'Santa Cruz Cathedral Basilica',
        'St Francis Church',
        'Marine Drive',
        'Cherai Beach',
        'Hill Palace Museum',
        'Bolgatty Palace',
        'Lulu Mall'
    ],
    'Munnar': [
        'Eravikulam National Park',
        'Mattupetty Dam',
        'Tea Museum Munnar',
        'Tata Tea Museum',
        'Anamudi Peak',
        'Top Station Munnar',
        'Kundala Lake',
        'Attukad Waterfalls',
        'Echo Point Munnar',
        'Pothamedu View Point'
    ],
    'Alleppey': [
        'Alleppey Backwaters',
        'Alappuzha Beach',
        'Vembanad Lake',
        'Marari Beach',
        'Alleppey Lighthouse',
        'Kuttanad Backwaters',
        'Pathiramanal Island'
    ],
    'Alappuzha': [
        'Alleppey Backwaters',
        'Alappuzha Beach',
        'Vembanad Lake',
        'Marari Beach',
        'Alleppey Lighthouse',
        'Kuttanad Backwaters'
    ],
    'Thiruvananthapuram': [
        'Padmanabhaswamy Temple',
        'Kovalam Beach',
        'Napier Museum',
        'Kanakakkunnu Palace',
        'Shanghumukham Beach',
        'Poovar Island',
        'Attukal Bhagavathy Temple'
    ],
    'Varkala': [
        'Varkala Cliff',
        'Varkala Beach',
        'Janardhanaswamy Temple',
        'Sivagiri Mutt',
        'Kapil Lake & Beach',
        'Anjengo Fort'
    ],
    'Wayanad': [
        'Edakkal Caves',
        'Banasura Sagar Dam',
        'Chembra Peak',
        'Soochipara Falls',
        'Muthanga Wildlife Sanctuary',
        'Pookode Lake',
        'Kuruva Island',
        'Thirunelli Temple'
    ],
    'Thekkady': [
        'Periyar National Park',
        'Periyar Lake Boating',
        'Periyar Tiger Reserve',
        'Elephant Junction',
        'Spice Plantations Thekkady',
        'Chellarkovil Viewpoint'
    ],

    // Telangana & Andhra Pradesh
    'Hyderabad': [
        'Charminar',
        'Golconda Fort',
        'Ramoji Film City',
        'Salar Jung Museum',
        'Hussain Sagar Lake',
        'Buddha Statue',
        'Chowmahalla Palace',
        'Birla Mandir',
        'Qutb Shahi Tombs',
        'Nehru Zoological Park',
        'Lumbini Park',
        'KBR National Park'
    ],
    'Warangal': [
        'Thousand Pillar Temple',
        'Warangal Fort',
        'Bhadrakali Temple',
        'Kakatiya Rock Garden',
        'Pakhal Lake'
    ],
    'Tirupati': [
        'Sri Venkateswara Swamy Temple',
        'Tirumala Balaji',
        'Sri Padmavathi Ammavari Temple',
        'Kapila Theertham',
        'Sri Govindaraja Swamy Temple',
        'Silathoranam',
        'Chandragiri Fort'
    ],
    'Visakhapatnam': [
        'Rishikonda Beach',
        'Submarine Museum',
        'INS Kursura',
        'Kailasagiri Hill Park',
        'Ramakrishna Beach',
        'RK Beach',
        'Araku Valley',
        'Borra Caves',
        'Simhachalam Temple',
        'Yarada Beach',
        'Dolphin\'s Nose Vizag'
    ],

    // Gujarat
    'Ahmedabad': [
        'Sabarmati Ashram',
        'Gandhi Ashram',
        'Adalaj Stepwell',
        'Sidi Saiyyed Mosque',
        'Akshardham Temple Gandhinagar',
        'Kankaria Lake',
        'Hutheesing Jain Temple',
        'Sabarmati Riverfront',
        'Calico Museum of Textiles',
        'Sarkhej Roza',
        'Science City Ahmedabad'
    ],
    'Vadodara': [
        'Laxmi Vilas Palace',
        'Sayaji Baug',
        'Baroda Museum & Picture Gallery',
        'Champaner-Pavagadh Archaeological Park',
        'Kirti Mandir Vadodara',
        'Sursagar Lake',
        'Tambekar Wada'
    ],
    'Surat': [
        'Surat Castle',
        'Dumas Beach',
        'Dutch Gardens Surat',
        'Sardar Patel Museum',
        'Gopi Talav',
        'Jagdishchandra Bose Aquarium'
    ],
    'Kutch': [
        'Great Rann of Kutch',
        'White Desert',
        'Kala Dungar',
        'Vijay Vilas Palace',
        'Mandvi Beach',
        'Aina Mahal',
        'Prag Mahal',
        'Kutch Museum',
        'Dholavira'
    ],
    'Somnath': [
        'Somnath Temple',
        'Bhalka Tirth',
        'Triveni Sangam Somnath',
        'Somnath Beach',
        'Prabhas Patan Museum'
    ],
    'Dwarka': [
        'Dwarkadhish Temple',
        'Bet Dwarka',
        'Nageshwar Jyotirlinga',
        'Rukmini Devi Temple',
        'Gomti Ghat',
        'Dwarka Beach & Lighthouse',
        'Shivrajpur Beach'
    ],
    'Junagadh': [
        'Girnar Mountain',
        'Uparkot Fort',
        'Mahabat Maqbara',
        'Sakkarbaug Zoological Garden',
        'Gir National Park',
        'Damodar Kund'
    ],

    // Himachal Pradesh & Uttarakhand
    'Shimla': [
        'The Ridge',
        'Mall Road Shimla',
        'Jakhu Temple',
        'Kalka-Shimla Toy Train',
        'Christ Church Shimla',
        'Viceregal Lodge',
        'Rashtrapati Niwas',
        'Tara Devi Temple',
        'Kali Bari Temple Shimla',
        'Annandale Army Museum',
        'Scandal Point',
        'Chadwick Falls',
        'Kufri'
    ],
    'Manali': [
        'Hadimba Temple',
        'Solang Valley',
        'Rohtang Pass',
        'Jogini Waterfalls',
        'Vashisht Hot Springs',
        'Old Manali',
        'Manu Temple',
        'Van Vihar',
        'Nehru Kund',
        'Gulaba Viewpoint',
        'Club House Manali'
    ],
    'Dharamshala': [
        'Namgyal Monastery',
        'Dalai Lama Temple Complex',
        'Bhagsunag Waterfall',
        'Bhagsu Temple',
        'HPCA Cricket Stadium Dharamshala',
        'Triund Hill Trek',
        'St. John in the Wilderness Church',
        'Dal Lake Dharamshala',
        'Norbulingka Institute'
    ],
    'Rishikesh': [
        'Laxman Jhula',
        'Ram Jhula',
        'Triveni Ghat',
        'Parmarth Niketan',
        'Beatles Ashram',
        'Chaurasi Kutia',
        'Neer Garh Waterfall',
        'Kunjapuri Devi Temple',
        'Tera Manzil Temple',
        'Vashishta Gufa',
        'Shivpuri River Rafting'
    ],
    'Haridwar': [
        'Har Ki Pauri',
        'Ganga Aarti Har Ki Pauri',
        'Mansa Devi Temple',
        'Chandi Devi Temple',
        'Maya Devi Temple',
        'Daksh Mahadev Temple',
        'Shanti Kunj',
        'Pawan Dham',
        'Bharat Mata Mandir'
    ],
    'Nainital': [
        'Naini Lake',
        'Naina Devi Temple',
        'Snow View Point',
        'Mall Road Nainital',
        'Tiffin Top',
        'Dorothy\'s Seat',
        'Nainital Zoo',
        'High Altitude Zoo',
        'Eco Cave Gardens',
        'Pangot & Kilbury Bird Sanctuary',
        'Bhimtal Lake'
    ],
    'Mussoorie': [
        'Kempty Falls',
        'Mall Road Mussoorie',
        'Gun Hill',
        'Lal Tibba',
        'Company Garden',
        'Camel\'s Back Road',
        'George Everest\'s House',
        'Cloud\'s End',
        'Jharipani Falls',
        'Bhatta Falls'
    ],

    // Jammu & Kashmir & Ladakh
    'Srinagar': [
        'Dal Lake',
        'Shikara Ride & Houseboats',
        'Shalimar Bagh',
        'Nishat Bagh',
        'Shankaracharya Temple',
        'Indira Gandhi Memorial Tulip Garden',
        'Tulip Garden',
        'Nigeen Lake',
        'Pari Mahal',
        'Chashme Shahi',
        'Hazratbal Shrine',
        'Hari Parbat Fort',
        'Jamia Masjid Srinagar'
    ],
    'Gulmarg': [
        'Gulmarg Gondola Cable Car',
        'Apharwat Peak',
        'Gulmarg Golf Course',
        'St. Mary\'s Church Gulmarg',
        'Maharani Temple',
        'Khilanmarg',
        'Strawberry Valley'
    ],
    'Pahalgam': [
        'Betaab Valley',
        'Aru Valley',
        'Baisaran Valley',
        'Chandanwari',
        'Lidder River',
        'Mamaleshwar Temple'
    ],
    'Katra': [
        'Vaishno Devi Temple',
        'Bhairon Ghati Temple',
        'Ardhkuwari Cave',
        'Banganga Temple',
        'Charan Paduka'
    ],
    'Leh': [
        'Pangong Lake',
        'Pangong Tso',
        'Shanti Stupa',
        'Leh Palace',
        'Nubra Valley',
        'Khardung La Pass',
        'Magnetic Hill',
        'Thiksey Monastery',
        'Hemis Monastery',
        'Hall of Fame Museum',
        'Shey Palace',
        'Diskit Monastery',
        'Spituk Gompa',
        'Gurudwara Pathar Sahib'
    ],

    // Odisha, Bihar, Jharkhand
    'Puri': [
        'Shree Jagannath Temple',
        'Jagannath Temple',
        'Puri Beach',
        'Golden Beach Puri',
        'Gundicha Temple',
        'Narendra Pokhari',
        'Lokanath Temple',
        'Raghurajpur Heritage Crafts Village',
        'Swargadwar Beach'
    ],
    'Konark': [
        'Sun Temple Konark',
        'Chandrabhaga Beach',
        'Konark Museum',
        'Ramachandi Temple & Beach'
    ],
    'Bhubaneswar': [
        'Lingaraj Temple',
        'Udayagiri and Khandagiri Caves',
        'Rajarani Temple',
        'Mukteshwar Temple',
        'Dhauli Giri Shanti Stupa',
        'Nandankanan Zoological Park',
        'Odisha State Museum',
        'Ekamra Kanan'
    ],
    'Bodh Gaya': [
        'Mahabodhi Temple',
        'Bodhi Tree',
        'Great Buddha Statue',
        'Thai Monastery Bodh Gaya',
        'Royal Bhutan Monastery',
        'Japanese Temple Bodh Gaya',
        'Dungeshwari Cave Temples',
        'Muchalinda Lake'
    ],
    'Patna': [
        'Golghar',
        'Takht Sri Patna Sahib',
        'Patna Museum',
        'Bihar Museum',
        'Gandhi Ghat (Ganga Aarti)',
        'Kumhrar Archaeological Remains',
        'Sanjay Gandhi Biological Park',
        'Nalanda Mahavihara'
    ],

    // Northeast
    'Gangtok': [
        'MG Marg Gangtok',
        'Rumtek Monastery',
        'Nathula Pass',
        'Tsomgo Lake',
        'Changu Lake',
        'Baba Harbhajan Singh Mandir',
        'Enchey Monastery',
        'Tashi Viewpoint',
        'Banjhakri Falls',
        'Ganesh Tok',
        'Hanuman Tok',
        'Do Drul Chorten',
        'Namgyal Institute of Tibetology'
    ],
    'Guwahati': [
        'Kamakhya Temple',
        'Umananda Temple',
        'Peacock Island',
        'Assam State Zoo',
        'Brahmaputra River Cruise',
        'Navagraha Temple',
        'Srimanta Sankaradeva Kalakshetra',
        'Basistha Ashram',
        'Deepor Beel'
    ],
    'Shillong': [
        'Umiam Lake',
        'Elephant Falls',
        'Shillong Peak',
        'Don Bosco Museum',
        'Ward\'s Lake',
        'Police Bazar',
        'Laitlum Canyons',
        'Lady Hydari Park',
        'All Saints Cathedral Shillong'
    ],
    'Kaziranga': [
        'Kaziranga National Park',
        'Kaziranga Elephant Safari',
        'Kaziranga Jeep Safari',
        'Orchid & Biodiversity Park'
    ],

    // Goa
    'Panaji': [
        'Basilica of Bom Jesus',
        'Se Cathedral',
        'Church of Our Lady of the Immaculate Conception',
        'Fontainhas Latin Quarter',
        'Miramar Beach',
        'Dona Paula Viewpoint',
        'Goa State Museum',
        'Mandovi River Cruise',
        'Reis Magos Fort'
    ],
    'Calangute': [
        'Calangute Beach',
        'Baga Beach',
        'Tito\'s Lane',
        'St. Alex Church',
        'Aguada Fort'
    ],
    'Candolim': [
        'Fort Aguada',
        'Aguada Lighthouse',
        'Candolim Beach',
        'Sinquerim Beach',
        'Reis Magos Fort'
    ],
    'Anjuna': [
        'Anjuna Beach',
        'Vagator Beach',
        'Chapora Fort',
        'Anjuna Flea Market',
        'Curlies Beach Shack'
    ]
};

// 3. Algorithmic Prominence Scoring for any spot
function calculateProminenceScore(spot) {
    const name = spot.name || '';
    const city = spot.city || '';
    const desc = spot.description || '';
    const tags = Array.isArray(spot.tags) ? spot.tags.join(' ') : '';
    const category = spot.category || '';

    // If it's a generic template spot, penalize immediately
    if (isTemplateSpot(name)) {
        return -200;
    }

    let score = 50; // baseline for genuine unique spot

    // A. City-specific curated landmark priority
    const priorities = CITY_LANDMARK_PRIORITIES[city];
    if (priorities) {
        for (let i = 0; i < priorities.length; i++) {
            const landmark = priorities[i].toLowerCase();
            if (name.toLowerCase().includes(landmark)) {
                // Higher rank in curated list = highest priority
                score += (2000 - i * 50);
                break;
            }
        }
    }

    // B. Global / UNESCO / National Heritage Keywords in Name or Desc
    if (/UNESCO|World Heritage|National Monument|ASI Monument/i.test(name + ' ' + desc)) {
        score += 80;
    }

    // C. Major Heritage & Forts
    if (/Fort|Palace|Mahal|Qila|Garh|Citadel|Castle|Caves|Stupa|Tomb|Minar|Gate|Haveli|Ruins/i.test(name)) {
        score += 40;
    }

    // D. Sacred & World-Famous Religious Sites
    if (/Golden Temple|Harmandir|Jyotirlinga|Dham|Gurudwara|Cathedral|Basilica|Monastery|Gompa|Akshardham|Math|Temple|Mandir|Ashram|Dargah|Ghat/i.test(name)) {
        score += 35;
    }

    // E. Major Natural Highlights & National Parks
    if (/National Park|Wildlife Sanctuary|Tiger Reserve|Biosphere/i.test(name + ' ' + category)) {
        score += 45;
    }
    if (/Lake|Waterfall|Falls|Beach|Valley|Pass|Peak|Hill Station|Island/i.test(name)) {
        score += 35;
    }

    // F. Key Cultural & Civic Landmarks
    if (/Museum|Art Gallery|Planetarium|Botanical Garden|Zoological Park|Zoo|Promenade|Mall Road/i.test(name)) {
        score += 30;
    }

    // G. Description Richness & Quality
    if (desc && desc.length > 80) score += 10;
    if (spot.imageSource === 'Wikipedia' || (spot.image && spot.image.includes('cloudinary'))) score += 10;

    return score;
}

// Main execution function
function organizeAllSpots() {
    console.log('Loading spots from:', SPOTS_FILE);
    const rawData = fs.readFileSync(SPOTS_FILE, 'utf8');
    const spots = JSON.parse(rawData);
    console.log(`Loaded ${spots.length} spots.`);

    // 1. Save Backup
    console.log('Creating backup at:', BACKUP_FILE);
    fs.writeFileSync(BACKUP_FILE, rawData, 'utf8');
    console.log('Backup saved successfully.');

    // 2. Group spots by City and State
    const cityGroups = new Map(); // key: "city||state" -> array of spots

    spots.forEach(spot => {
        const cityKey = `${(spot.city || 'Unknown').trim()}||${(spot.state || 'Unknown').trim()}`;
        if (!cityGroups.has(cityKey)) {
            cityGroups.set(cityKey, []);
        }
        cityGroups.get(cityKey).push(spot);
    });

    console.log(`Grouped into ${cityGroups.size} unique city-state clusters.`);

    // 3. Score and Sort each city group
    const organizedSpots = [];
    let stats = {
        mostFamousCount: 0,
        famousCount: 0,
        hiddenCount: 0
    };

    // Sort city keys alphabetically by state, then city for clean dataset structure
    const sortedCityKeys = Array.from(cityGroups.keys()).sort((a, b) => {
        const [cityA, stateA] = a.split('||');
        const [cityB, stateB] = b.split('||');
        if (stateA !== stateB) return stateA.localeCompare(stateB);
        return cityA.localeCompare(cityB);
    });

    sortedCityKeys.forEach(key => {
        const group = cityGroups.get(key);
        const [city, state] = key.split('||');

        // Calculate score for each spot
        group.forEach(s => {
            s._score = calculateProminenceScore(s);
        });

        // Sort descending by score. If scores match, preserve existing order.
        group.sort((a, b) => b._score - a._score);

        // Assign calibrated tiers and ratings based on rank in this city
        const total = group.length;

        // Distinguish authentic spots from template spots
        const authenticSpots = group.filter(s => !isTemplateSpot(s.name));
        const templateSpots = group.filter(s => isTemplateSpot(s.name));

        // In authentic spots:
        // Rank 1: rating 5.0, tier 'most famous'
        // Rank 2: rating 4.9, tier 'most famous'
        // Rank 3-5: rating 4.8, tier 'most famous'
        // Rank 6-8: rating 4.7 - 4.5, tier 'famous'
        // Rank 9+: rating 4.4 - 4.3, tier 'famous'
        authenticSpots.forEach((s, idx) => {
            if (idx === 0) {
                s.rating = 5.0;
                s.tier = 'most famous';
            } else if (idx === 1) {
                s.rating = 4.9;
                s.tier = 'most famous';
            } else if (idx < 5) {
                s.rating = 4.8;
                s.tier = 'most famous';
            } else if (idx < 8) {
                s.rating = Number((4.7 - (idx - 5) * 0.1).toFixed(1));
                s.tier = 'famous';
            } else if (idx < 12) {
                s.rating = Number((4.4 - (idx - 8) * 0.05).toFixed(1));
                s.tier = 'famous';
            } else {
                s.rating = 4.2;
                s.tier = 'hidden';
            }

            if (s.tier === 'most famous') stats.mostFamousCount++;
            else if (s.tier === 'famous') stats.famousCount++;
            else stats.hiddenCount++;

            delete s._score;
            organizedSpots.push(s);
        });

        // For template spots (relegated to the bottom):
        templateSpots.forEach((s, idx) => {
            // If the city had NO authentic spots at all, make the top template spot famous
            if (authenticSpots.length === 0 && idx === 0) {
                s.rating = 4.5;
                s.tier = 'famous';
                stats.famousCount++;
            } else {
                s.rating = Number((4.1 - (idx * 0.03)).toFixed(1));
                if (s.rating < 3.8) s.rating = 3.8;
                s.tier = 'hidden';
                stats.hiddenCount++;
            }
            delete s._score;
            organizedSpots.push(s);
        });
    });

    // Reorder so that the User-Requested Top 14 Marquee Spots appear FIRST by default when explore section opens
    const USER_DEFAULT_FEATURED = [
        { nameQuery: 'Taj Mahal', cityQuery: 'Agra' },
        { nameQuery: 'Red Fort', cityQuery: 'Old Delhi' },
        { nameQuery: 'Akshardham', cityQuery: 'New Delhi' },
        { nameQuery: 'Golden Temple', cityQuery: 'Amritsar' },
        { nameQuery: 'Gateway of India', cityQuery: 'Mumbai' },
        { nameQuery: 'Dashashwamedh Ghat', cityQuery: 'Varanasi', rename: 'Varanasi Ghats (Dashashwamedh Ghat)' },
        { nameQuery: 'Hawa Mahal', cityQuery: 'Jaipur' },
        { nameQuery: 'Meenakshi Amman Temple', cityQuery: 'Madurai' },
        { nameQuery: 'Jal Mahal', cityQuery: 'Jaipur' },
        { nameQuery: 'Prem Mandir', cityQuery: 'Vrindavan' },
        { nameQuery: 'Itkhori Bhadrakali Temple', cityQuery: 'Chatra' },
        { nameQuery: 'Mata Vaishno Devi Temple (Bhavan Shrine)', cityQuery: 'Katra' },
        { nameQuery: 'Ramanathaswamy Temple', cityQuery: 'Rameswaram' },
        { nameQuery: 'Shree Jagannath Temple', cityQuery: 'Puri' }
    ];

    const SECONDARY_NATIONAL_FEATURED = [
        { nameQuery: 'Victoria Memorial', cityQuery: 'Kolkata' },
        { nameQuery: 'Qutub Minar', cityQuery: 'Delhi' },
        { nameQuery: 'India Gate', cityQuery: 'Delhi' },
        { nameQuery: 'Amber Fort', cityQuery: 'Jaipur' },
        { nameQuery: 'Charminar', cityQuery: 'Hyderabad' },
        { nameQuery: 'Golconda Fort', cityQuery: 'Hyderabad' },
        { nameQuery: 'Kashi Vishwanath Temple', cityQuery: 'Varanasi' },
        { nameQuery: 'City Palace Udaipur', cityQuery: 'Udaipur' },
        { nameQuery: 'Mysore Palace', cityQuery: 'Mysuru' },
        { nameQuery: 'Sun Temple Konark', cityQuery: 'Konark' },
        { nameQuery: 'Mahabodhi Temple', cityQuery: 'Bodh Gaya' },
        { nameQuery: 'Virupaksha Temple', cityQuery: 'Hampi' },
        { nameQuery: 'Brihadeeswarar Temple', cityQuery: 'Thanjavur' },
        { nameQuery: 'Ajanta Caves', cityQuery: 'Aurangabad' },
        { nameQuery: 'Ellora Caves', cityQuery: 'Aurangabad' },
        { nameQuery: 'Rock Garden', cityQuery: 'Chandigarh' },
        { nameQuery: 'Sukhna Lake', cityQuery: 'Chandigarh' },
        { nameQuery: 'Dal Lake', cityQuery: 'Srinagar' },
        { nameQuery: 'Pangong Lake', cityQuery: 'Leh' },
        { nameQuery: 'Somnath Temple', cityQuery: 'Somnath' },
        { nameQuery: 'Dwarkadhish Temple', cityQuery: 'Dwarka' },
        { nameQuery: 'Mehrangarh Fort', cityQuery: 'Jodhpur' },
        { nameQuery: 'Jaisalmer Fort', cityQuery: 'Jaisalmer' },
        { nameQuery: 'Agra Fort', cityQuery: 'Agra' },
        { nameQuery: 'Marine Drive', cityQuery: 'Mumbai' },
        { nameQuery: 'Howrah Bridge', cityQuery: 'Kolkata' },
        { nameQuery: 'Bangalore Palace', cityQuery: 'Bengaluru' },
        { nameQuery: 'Hadimba Temple', cityQuery: 'Manali' },
        { nameQuery: 'Solang Valley', cityQuery: 'Manali' },
        { nameQuery: 'The Ridge', cityQuery: 'Shimla' },
        { nameQuery: 'Laxman Jhula', cityQuery: 'Rishikesh' },
        { nameQuery: 'Har Ki Pauri', cityQuery: 'Haridwar' },
        { nameQuery: 'Chinese Fishing Nets', cityQuery: 'Kochi (Cochin)' },
        { nameQuery: 'Naini Lake', cityQuery: 'Nainital' },
        { nameQuery: 'Kempty Falls', cityQuery: 'Mussoorie' },
        { nameQuery: 'Eravikulam National Park', cityQuery: 'Munnar' },
        { nameQuery: 'Wagah Border', cityQuery: 'Amritsar' }
    ];

    const finalFeaturedSpots = [];
    const usedIndices = new Set();

    // 1. First add the 14 User-Specified Places
    USER_DEFAULT_FEATURED.forEach(def => {
        const idx = organizedSpots.findIndex((s, i) => {
            if (usedIndices.has(i)) return false;
            const nameMatch = (s.name || '').toLowerCase().includes(def.nameQuery.toLowerCase());
            const cityMatch = !def.cityQuery || (s.city || '').toLowerCase().includes(def.cityQuery.toLowerCase()) || (s.state || '').toLowerCase().includes(def.cityQuery.toLowerCase());
            return nameMatch && cityMatch;
        });

        if (idx !== -1) {
            const spot = organizedSpots[idx];
            if (def.rename) spot.name = def.rename;
            spot.rating = 5.0;
            spot.tier = 'most famous';
            usedIndices.add(idx);
            finalFeaturedSpots.push(spot);
        }
    });

    // 2. Next add Secondary National Landmarks
    SECONDARY_NATIONAL_FEATURED.forEach(def => {
        const idx = organizedSpots.findIndex((s, i) => {
            if (usedIndices.has(i)) return false;
            const nameMatch = (s.name || '').toLowerCase().includes(def.nameQuery.toLowerCase());
            const cityMatch = !def.cityQuery || (s.city || '').toLowerCase().includes(def.cityQuery.toLowerCase()) || (s.state || '').toLowerCase().includes(def.cityQuery.toLowerCase());
            return nameMatch && cityMatch;
        });

        if (idx !== -1) {
            const spot = organizedSpots[idx];
            if (spot.tier !== 'most famous') spot.tier = 'most famous';
            if (spot.rating < 4.8) spot.rating = 4.8;
            usedIndices.add(idx);
            finalFeaturedSpots.push(spot);
        }
    });

    // 3. Append all remaining spots
    const finalSpots = [...finalFeaturedSpots];
    organizedSpots.forEach((s, i) => {
        if (!usedIndices.has(i)) {
            finalSpots.push(s);
        }
    });

    console.log(`\nFinal Assembly Summary:`);
    console.log(`Total user default featured: ${finalFeaturedSpots.slice(0, 14).length}`);
    console.log(`Total national featured at head: ${finalFeaturedSpots.length}`);
    console.log(`Total spots in final array: ${finalSpots.length}`);

    // Verification check: ensure exact spot count is preserved
    if (finalSpots.length !== spots.length) {
        throw new Error(`Spot count mismatch! Original: ${spots.length}, Final: ${finalSpots.length}`);
    }

    // Write formatted spots.json
    console.log('\nWriting organized spots to spots.json...');
    fs.writeFileSync(SPOTS_FILE, JSON.stringify(finalSpots, null, 2), 'utf8');
    console.log('Successfully written to spots.json!');
}

organizeAllSpots();
