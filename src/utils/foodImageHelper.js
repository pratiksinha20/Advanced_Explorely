// High-resolution curated food photography mapping for Indian dishes
const FOOD_IMAGE_MAPPING = [
    // Biryani & Rice
    { keywords: ['biryani', 'pulao', 'pilaf', 'tehri', 'rice', 'khichdi'], image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80' },
    
    // Chicken & Meat
    { keywords: ['butter chicken', 'murgh', 'tikka', 'korma'], image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=80' },
    { keywords: ['tandoori', 'kebabs', 'seekh', 'roast chicken'], image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&auto=format&fit=crop&q=80' },
    { keywords: ['mutton', 'roganjosh', 'rogan josh', 'lamb', 'laal maas'], image: 'https://images.unsplash.com/photo-1545247181-516773cae754?w=500&auto=format&fit=crop&q=80' },
    
    // Saag, Dal & Lentils
    { keywords: ['saag', 'sarson', 'palak'], image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80' },
    { keywords: ['dal makhani', 'dal', 'lentil', 'sambar'], image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80' },
    { keywords: ['rajma', 'chole', 'chanamut', 'chana'], image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&auto=format&fit=crop&q=80' },
    { keywords: ['paneer', 'shahi paneer', 'kadai paneer', 'matar paneer'], image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80' },

    // Breads & Kulchas & Parathas
    { keywords: ['kulcha', 'bhature', 'naan', 'roti', 'paratha', 'poori', 'puri'], image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500&auto=format&fit=crop&q=80' },

    // South Indian
    { keywords: ['dosa', 'dosai', 'uttapam'], image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=80' },
    { keywords: ['idli', 'vada', 'appam'], image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80' },

    // Fish & Seafood
    { keywords: ['fish', 'prawn', 'lobster', 'crab', 'macher', 'seafood', 'tilapia'], image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=80' },

    // Snacks, Chaat & Fast Food
    { keywords: ['samosa', 'kachori', 'pakora', 'bhajji', 'vada pav', 'pav bhaji'], image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80' },
    { keywords: ['momos', 'dimsum', 'dumpling'], image: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=500&auto=format&fit=crop&q=80' },
    { keywords: ['chaat', 'pani puri', 'golgappa', 'bhel'], image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80' },

    // Sweets & Desserts
    { keywords: ['lassi', 'milk', 'kheer', 'payasam', 'shake', 'beverage', 'tea', 'chai', 'coffee'], image: 'https://images.unsplash.com/photo-1571006682858-a457247d5598?w=500&auto=format&fit=crop&q=80' },
    { keywords: ['sweet', 'halwa', 'gulab jamun', 'rasgulla', 'jalebi', 'kulfi', 'pootarekulu', 'sandesh', 'barfi', 'laddu', 'ladoo', 'dessert', 'petha'], image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&auto=format&fit=crop&q=80' },
];

const DEFAULT_FOOD_IMAGE = 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&auto=format&fit=crop&q=80';

/**
 * Returns a high-quality real food photo URL for a given food item object
 */
export function getFoodImage(food) {
    if (!food) return DEFAULT_FOOD_IMAGE;
    if (food.image && food.image.trim() !== '') return food.image;

    const name = (food.name || '').toLowerCase();
    const desc = (food.description || '').toLowerCase();

    for (const item of FOOD_IMAGE_MAPPING) {
        if (item.keywords.some(kw => name.includes(kw) || desc.includes(kw))) {
            return item.image;
        }
    }

    return DEFAULT_FOOD_IMAGE;
}
