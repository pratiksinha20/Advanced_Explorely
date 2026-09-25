import React from 'react';
import {
    Home, Compass, FolderOpen, Hotel, MapPin, Search, Heart, Sun, Moon,
    Menu, X, Map, Building2, Star, ExternalLink, Link2, ChevronRight,
    Landmark, Mountain, Umbrella, TreePine, PawPrint, Droplets, Waves,
    Castle, Crown, Columns3, TreeDeciduous, ShoppingBag, Backpack, Flame,
    ArrowUpDown, Tag, DollarSign, Ban, Filter,
    MapPinned, TrendingUp, Sparkles, LayoutGrid,
    RefreshCw, RotateCcw, GripVertical, Trash2, Plus, Quote, ArrowRight, Dices, Award,
    Split, Users, Receipt, Wallet, CheckCircle2, ArrowRightLeft, AlertCircle, Utensils, Car, Ticket, Check, Target
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
    'chevron-right': ChevronRight,
    'map': Map,
    'building': Building2,
    'star': Star,
    'external-link': ExternalLink,
    'link': Link2,
    'map-pinned': MapPinned,
    'trending-up': TrendingUp,
    'sparkles': Sparkles,
    'layout-grid': LayoutGrid,
    'refresh-cw': RefreshCw,
    'rotate-ccw': RotateCcw,
    'grip-vertical': GripVertical,
    'trash-2': Trash2,
    'plus': Plus,
    'quote': Quote,
    'arrow-right': ArrowRight,
    'dices': Dices,
    'award': Award,

    // Split & Expense Icons
    'split': Split,
    'users': Users,
    'receipt': Receipt,
    'wallet': Wallet,
    'check-circle': CheckCircle2,
    'arrow-right-left': ArrowRightLeft,
    'alert-circle': AlertCircle,
    'utensils': Utensils,
    'taxi': Car,
    'car': Car,
    'ticket': Ticket,
    'check': Check,
    'target': Target,

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
