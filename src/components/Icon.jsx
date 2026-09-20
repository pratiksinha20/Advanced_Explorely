import React from 'react';
import {
    Home, Compass, FolderOpen, Hotel, MapPin, Search, Heart, Sun, Moon,
    Menu, X, Map, Building2, Star, ExternalLink, Link2,
    Landmark, Mountain, Umbrella, TreePine, PawPrint, Droplets, Waves,
    Castle, Crown, Columns3, TreeDeciduous, ShoppingBag, Backpack, Flame,
    ArrowUpDown, Tag, DollarSign, Ban, Filter,
    MapPinned, TrendingUp, Sparkles, LayoutGrid
} from 'lucide-react';

const iconMap = {
    // Navigation
    'home': Home,
    'compass': Compass,
    'folder-open': FolderOpen,
    'hotel': Hotel,
    'map-pin': MapPin,
    'search': Search,
    'heart': Heart,
    'sun': Sun,
    'moon': Moon,
    'menu': Menu,
    'x': X,
    'map': Map,
    'building': Building2,
    'star': Star,
    'external-link': ExternalLink,
    'link': Link2,
    'map-pinned': MapPinned,
    'trending-up': TrendingUp,
    'sparkles': Sparkles,
    'layout-grid': LayoutGrid,

    // Categories
    'landmark': Landmark,
    'mountain': Mountain,
    'umbrella': Umbrella,
    'tree-pine': TreePine,
    'paw-print': PawPrint,
    'droplets': Droplets,
    'waves': Waves,
    'castle': Castle,
    'crown': Crown,
    'columns-3': Columns3,
    'tree-deciduous': TreeDeciduous,
    'shopping-bag': ShoppingBag,
    'backpack': Backpack,
    'flame': Flame,

    // Filters
    'arrow-up-down': ArrowUpDown,
    'tag': Tag,
    'dollar-sign': DollarSign,
    'ban': Ban,
    'filter': Filter,
};

export default function Icon({ name, size = 18, className = '', color, strokeWidth = 2, ...props }) {
    const IconComponent = iconMap[name];
    if (!IconComponent) return null;
    return <IconComponent size={size} className={`lucide-icon ${className}`} color={color} strokeWidth={strokeWidth} {...props} />;
}
