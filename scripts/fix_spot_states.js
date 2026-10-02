const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const spotsPath = path.join(rootDir, 'public', 'data', 'spots.json');
const hotelsPath = path.join(rootDir, 'public', 'data', 'hotels.json');
const citiesPath = path.join(rootDir, 'public', 'data', 'cities.json');
const statesPath = path.join(rootDir, 'public', 'data', 'states.json');

console.log('Loading data files...');
const spots = JSON.parse(fs.readFileSync(spotsPath, 'utf8'));
const hotels = JSON.parse(fs.readFileSync(hotelsPath, 'utf8'));
const cities = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));
const states = JSON.parse(fs.readFileSync(statesPath, 'utf8'));

// 1. Create backup files
fs.writeFileSync(path.join(rootDir, 'public', 'data', 'spots.backup_before_state_fix.json'), JSON.stringify(spots));
fs.writeFileSync(path.join(rootDir, 'public', 'data', 'hotels.backup_before_state_fix.json'), JSON.stringify(hotels));
console.log('Created backups of spots.json and hotels.json.');

// Mapping configuration for the 31 cities/localities with state === "India"
const cityMapping = {
  'Agartala': { state: 'Tripura', newCity: 'Agartala' },
  'Aizawl': { state: 'Mizoram', newCity: 'Aizawl' },
  'Andheri': { state: 'Maharashtra', newCity: 'Mumbai', addTag: 'Andheri' },
  'Ayodhya': { state: 'Uttar Pradesh', newCity: 'Ayodhya' },
  'Belagavi': { state: 'Karnataka', newCity: 'Belagavi' },
  'Central Kolkata': { state: 'West Bengal', newCity: 'Kolkata', addTag: 'Central Kolkata' },
  'Coimbatore': { state: 'Tamil Nadu', newCity: 'Coimbatore' },
  'Colaba': { state: 'Maharashtra', newCity: 'Mumbai', addTag: 'Colaba' },
  'Connaught Place': { state: 'Delhi', newCity: 'Connaught Place' },
  'Dadar': { state: 'Maharashtra', newCity: 'Mumbai', addTag: 'Dadar' },
  'Dakshineswar': { state: 'West Bengal', newCity: 'Kolkata', addTag: 'Dakshineswar' },
  'Gangtok': { state: 'Sikkim', newCity: 'Gangtok' },
  'Gorakhpur': { state: 'Uttar Pradesh', newCity: 'Gorakhpur' },
  'Howrah': { state: 'West Bengal', newCity: 'Howrah' },
  'Hubballi-Dharwad': { state: 'Karnataka', newCity: 'Hubballi', addTag: 'Hubballi-Dharwad' },
  'Juhu': { state: 'Maharashtra', newCity: 'Mumbai', addTag: 'Juhu' },
  'Kohima': { state: 'Nagaland', newCity: 'Kohima' },
  'Lucknow': { state: 'Uttar Pradesh', newCity: 'Lucknow' },
  'Mathura': { state: 'Uttar Pradesh', newCity: 'Mathura' },
  'Meerut': { state: 'Uttar Pradesh', newCity: 'Meerut' },
  'New Town': { state: 'West Bengal', newCity: 'Kolkata', addTag: 'New Town' },
  'North Delhi': { state: 'Delhi', newCity: 'North Delhi' },
  'North Kolkata': { state: 'West Bengal', newCity: 'Kolkata', addTag: 'North Kolkata' },
  'Palamu': { state: 'Jharkhand', newCity: 'Palamu' },
  'Powai': { state: 'Maharashtra', newCity: 'Mumbai', addTag: 'Powai' },
  'Prayagraj': { state: 'Uttar Pradesh', newCity: 'Prayagraj' },
  'Puri': { state: 'Odisha', newCity: 'Puri' },
  'Salt Lake': { state: 'West Bengal', newCity: 'Kolkata', addTag: 'Salt Lake' },
  'South Delhi': { state: 'Delhi', newCity: 'South Delhi' },
  'Vrindavan': { state: 'Uttar Pradesh', newCity: 'Vrindavan' },
  'Warangal': { state: 'Telangana', newCity: 'Warangal' }
};

// 2. Update spots
let updatedSpotsCount = 0;
spots.forEach(spot => {
  if (spot.state === 'India') {
    const mapping = cityMapping[spot.city];
    if (mapping) {
      spot.state = mapping.state;
      const oldCity = spot.city;
      spot.city = mapping.newCity;
      if (mapping.addTag) {
        spot.tags = spot.tags || [];
        if (!spot.tags.includes(mapping.addTag)) {
          spot.tags.push(mapping.addTag);
        }
      }
      updatedSpotsCount++;
    } else {
      console.warn(`Unmapped spot city with state India: ${spot.city} (${spot.name})`);
    }
  }
});
console.log(`Updated ${updatedSpotsCount} spots.`);

// 3. Update hotels
let updatedHotelsCount = 0;
hotels.forEach(hotel => {
  if (hotel.state === 'India') {
    const mapping = cityMapping[hotel.city];
    if (mapping) {
      hotel.state = mapping.state;
      hotel.city = mapping.newCity;
      updatedHotelsCount++;
    } else {
      console.warn(`Unmapped hotel city with state India: ${hotel.city} (${hotel.name})`);
    }
  }
});
console.log(`Updated ${updatedHotelsCount} hotels.`);

// 4. Update cities.json
const extraCities = [
  { name: 'Belagavi', state: 'Karnataka' },
  { name: 'Howrah', state: 'West Bengal' },
  { name: 'North Delhi', state: 'Delhi' },
  { name: 'Palamu', state: 'Jharkhand' }
];

let citiesAdded = 0;
extraCities.forEach(ec => {
  const exists = cities.some(c => c.name === ec.name && c.state === ec.state);
  if (!exists) {
    cities.push(ec);
    citiesAdded++;
  }
});
cities.sort((a, b) => a.name.localeCompare(b.name));
console.log(`Added ${citiesAdded} cities to cities.json.`);

// 5. Update states.json
const extraStates = [
  { name: 'Jammu & Kashmir', code: 'JK' },
  { name: 'Ladakh', code: 'LA' },
  { name: 'Chandigarh', code: 'CH' }
];

let statesAdded = 0;
extraStates.forEach(es => {
  const exists = states.some(s => s.name.toLowerCase() === es.name.toLowerCase() || s.code === es.code);
  if (!exists) {
    states.push(es);
    statesAdded++;
  }
});
states.sort((a, b) => a.name.localeCompare(b.name));
console.log(`Added ${statesAdded} states to states.json.`);

// 6. Write back to disk
fs.writeFileSync(spotsPath, JSON.stringify(spots, null, 2), 'utf8');
fs.writeFileSync(hotelsPath, JSON.stringify(hotels, null, 2), 'utf8');
fs.writeFileSync(citiesPath, JSON.stringify(cities, null, 2), 'utf8');
fs.writeFileSync(statesPath, JSON.stringify(states, null, 2), 'utf8');

console.log('All data files successfully written and updated!');
