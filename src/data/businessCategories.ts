import {
  Smartphone, Monitor, Printer, LayoutGrid, Tv, Pill,
  ShoppingBasket, ShoppingCart, Shirt, Scissors, Footprints,
  Sparkles, Gem, Watch, Headphones, Video, Sun, Lightbulb,
  Wrench, Paintbrush, Building2, Armchair, UtensilsCrossed,
  Box, BookOpen, Gift, Baby, Trophy, Bike, Sprout,
  Apple, Cake, Coffee, Truck, PawPrint, Hammer, Layers,
  LucideIcon
} from 'lucide-react';
import { Category } from '../types';

export interface BusinessCategoryItem {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  keywords: string[];
  starterCategories: Category[];
}

export const BUSINESS_CATEGORIES: BusinessCategoryItem[] = [
  {
    id: 'mobile-shop',
    title: 'মোবাইল শপ',
    subtitle: 'স্মার্টফোন, ফিচার ফোন, এয়ারবাড, পাওয়ারব্যাংক ও এক্সেসরিজ',
    icon: Smartphone,
    iconBgColor: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
    keywords: ['মোবাইল', 'স্মার্টফোন', 'mobile', 'phone', 'smartphone', 'earbuds', 'charger'],
    starterCategories: [
      { id: 'cat-mob-1', name: 'Smartphones', banglaName: 'স্মার্টফোন', color: '#3b82f6', productCount: 0 },
      { id: 'cat-mob-2', name: 'Feature Phones', banglaName: 'ফিচার ফোন', color: '#06b6d4', productCount: 0 },
      { id: 'cat-mob-3', name: 'Earbuds & Audio', banglaName: 'এয়ারবাড ও অডিও', color: '#8b5cf6', productCount: 0 },
      { id: 'cat-mob-4', name: 'Power Bank & Charger', banglaName: 'পাওয়ার ব্যাংক ও চার্জার', color: '#f59e0b', productCount: 0 },
      { id: 'cat-mob-5', name: 'Cover & Glass', banglaName: 'কভার ও প্রোটেক্টর', color: '#ec4899', productCount: 0 },
    ]
  },
  {
    id: 'it-computer-shop',
    title: 'আইটি / কম্পিউটার শপ',
    subtitle: 'ল্যাপটপ, ডেস্কটপ, মনিটর, RAM/SSD, কম্পোনেন্ট ও এক্সেসরিজ',
    icon: Monitor,
    iconBgColor: 'bg-purple-500/10',
    iconColor: 'text-purple-500',
    keywords: ['কম্পিউটার', 'ল্যাপটপ', 'computer', 'it', 'laptop', 'monitor', 'ssd', 'ram'],
    starterCategories: [
      { id: 'cat-it-1', name: 'Laptops', banglaName: 'ল্যাপটপ', color: '#8b5cf6', productCount: 0 },
      { id: 'cat-it-2', name: 'Desktops & PC', banglaName: 'ডেস্কটপ ও পিসি', color: '#3b82f6', productCount: 0 },
      { id: 'cat-it-3', name: 'Monitors', banglaName: 'মনিটর', color: '#10b981', productCount: 0 },
      { id: 'cat-it-4', name: 'Storage & RAM', banglaName: 'RAM ও SSD স্টোরেজ', color: '#f59e0b', productCount: 0 },
      { id: 'cat-it-5', name: 'Accessories', banglaName: 'কিবোর্ড, মাউস ও এক্সেসরিজ', color: '#06b6d4', productCount: 0 },
    ]
  },
  {
    id: 'printing-press',
    title: 'প্রিন্টিং প্রেস',
    subtitle: 'ব্যানার, ফেস্টুন, PVC, ভিজিটিং কার্ড ও ল্যামিনেশন',
    icon: Printer,
    iconBgColor: 'bg-rose-500/10',
    iconColor: 'text-rose-500',
    keywords: ['প্রিন্টিং', 'ব্যানার', 'কার্ড', 'print', 'press', 'banner', 'card'],
    starterCategories: [
      { id: 'cat-pr-1', name: 'Banners & Festoons', banglaName: 'ব্যানার ও ফেস্টুন', color: '#f43f5e', productCount: 0 },
      { id: 'cat-pr-2', name: 'Visiting Cards', banglaName: 'ভিজিটিং কার্ড', color: '#3b82f6', productCount: 0 },
      { id: 'cat-pr-3', name: 'PVC & Stickers', banglaName: 'PVC ও স্টিকার', color: '#10b981', productCount: 0 },
      { id: 'cat-pr-4', name: 'Flyers & Posters', banglaName: 'লিফলেট ও পোস্টার', color: '#f59e0b', productCount: 0 },
    ]
  },
  {
    id: 'tiles-sanitary',
    title: 'টাইলস ও স্যানিটারি',
    subtitle: 'টাইলস, কমোড, বেসিন, ট্যাপ ও স্যানিটারি ফিটিংস',
    icon: LayoutGrid,
    iconBgColor: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500',
    keywords: ['টাইলস', 'স্যানিটারি', 'tiles', 'sanitary', 'basin', 'tap'],
    starterCategories: [
      { id: 'cat-tl-1', name: 'Floor & Wall Tiles', banglaName: 'ফ্লোর ও ওয়াল টাইলস', color: '#10b981', productCount: 0 },
      { id: 'cat-tl-2', name: 'Sanitary Commode', banglaName: 'কমোড ও প্যান', color: '#06b6d4', productCount: 0 },
      { id: 'cat-tl-3', name: 'Basins & Sinks', banglaName: 'বেসিন ও কিচেন সিঙ্ক', color: '#3b82f6', productCount: 0 },
      { id: 'cat-tl-4', name: 'Fittings & Taps', banglaName: 'ট্যাপ ও বাথ ফিটিংস', color: '#8b5cf6', productCount: 0 },
    ]
  },
  {
    id: 'electronics',
    title: 'ইলেকট্রনিক্স',
    subtitle: 'টিভি, ফ্রিজ, এসি, ওয়াশিং মেশিন ও হোম অ্যাপ্লায়েন্স',
    icon: Tv,
    iconBgColor: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
    keywords: ['ইলেকট্রনিক্স', 'টিভি', 'ফ্রিজ', 'এসি', 'electronics', 'tv', 'fridge', 'ac'],
    starterCategories: [
      { id: 'cat-el-1', name: 'TV & Sound', banglaName: 'টিভি ও সাউন্ড সিস্টেম', color: '#f59e0b', productCount: 0 },
      { id: 'cat-el-2', name: 'Refrigerators', banglaName: 'ফ্রিজ ও ডিপ ফ্রিজ', color: '#06b6d4', productCount: 0 },
      { id: 'cat-el-3', name: 'Air Conditioners', banglaName: 'এয়ার কন্ডিশনার (AC)', color: '#3b82f6', productCount: 0 },
      { id: 'cat-el-4', name: 'Washing Machines', banglaName: 'ওয়াশিং মেশিন', color: '#8b5cf6', productCount: 0 },
      { id: 'cat-el-5', name: 'Home Appliances', banglaName: 'ছোট হোম অ্যাপ্লায়েন্স', color: '#10b981', productCount: 0 },
    ]
  },
  {
    id: 'pharmacy',
    title: 'ফার্মেসি',
    subtitle: 'ওষুধ, সিরাপ, ইনজেকশন, সার্জিক্যাল ও স্বাস্থ্য পণ্য',
    icon: Pill,
    iconBgColor: 'bg-teal-500/10',
    iconColor: 'text-teal-500',
    keywords: ['ফার্মেসি', 'ওষুধ', 'pharmacy', 'medicine', 'syrup', 'tablet'],
    starterCategories: [
      { id: 'cat-ph-1', name: 'Tablets & Capsules', banglaName: 'ট্যাবলেট ও ক্যাপসুল', color: '#14b8a6', productCount: 0 },
      { id: 'cat-ph-2', name: 'Syrups & Suspensions', banglaName: 'সিরাপ ও তরল ওষুধ', color: '#3b82f6', productCount: 0 },
      { id: 'cat-ph-3', name: 'Injections & Saline', banglaName: 'ইনজেকশন ও স্যালাইন', color: '#f59e0b', productCount: 0 },
      { id: 'cat-ph-4', name: 'Surgical & Healthcare', banglaName: 'সার্জিক্যাল ও মেডিকেল সরঞ্জাম', color: '#ec4899', productCount: 0 },
      { id: 'cat-ph-5', name: 'Baby & Personal Care', banglaName: 'বেবি ফুড ও হেলথ কেয়ার', color: '#8b5cf6', productCount: 0 },
    ]
  },
  {
    id: 'grocery-shop',
    title: 'মুদি দোকান',
    subtitle: 'চাল, ডাল, তেল, মসলা, সাবান ও দৈনন্দিন পণ্য',
    icon: ShoppingBasket,
    iconBgColor: 'bg-green-500/10',
    iconColor: 'text-green-500',
    keywords: ['মুদি', 'মুদি দোকান', 'চাল', 'ডাল', 'grocery', 'oil', 'rice'],
    starterCategories: [
      { id: 'cat-gr-1', name: 'Rice & Flour', banglaName: 'চাল, আটা ও ময়দা', color: '#22c55e', productCount: 0 },
      { id: 'cat-gr-2', name: 'Oil & Spices', banglaName: 'তেল, ঘি ও মসলা', color: '#f59e0b', productCount: 0 },
      { id: 'cat-gr-3', name: 'Lentils & Beans', banglaName: 'ডাল ও শস্যদানা', color: '#eab308', productCount: 0 },
      { id: 'cat-gr-4', name: 'Soap & Detergent', banglaName: 'সাবান, শ্যাম্পু ও ক্লিনিং', color: '#3b82f6', productCount: 0 },
      { id: 'cat-gr-5', name: 'Tea & Beverage', banglaName: 'চা, চিনি ও গুঁড়ো দুধ', color: '#8b5cf6', productCount: 0 },
    ]
  },
  {
    id: 'supershop',
    title: 'সুপারশপ / ডিপার্টমেন্টাল',
    subtitle: 'গ্রোসারি, ফ্রোজেন, পার্সোনাল ও হোম কেয়ার এক ছাদে',
    icon: ShoppingCart,
    iconBgColor: 'bg-indigo-500/10',
    iconColor: 'text-indigo-500',
    keywords: ['সুপারশপ', 'ডিপার্টমেন্টাল', 'supershop', 'superstore', 'departmental'],
    starterCategories: [
      { id: 'cat-sp-1', name: 'Groceries', banglaName: 'গ্রোসারি ও খাদ্যপণ্য', color: '#6366f1', productCount: 0 },
      { id: 'cat-sp-2', name: 'Frozen & Dairy', banglaName: 'ফ্রোজেন খাবার ও দুগ্ধজাত', color: '#06b6d4', productCount: 0 },
      { id: 'cat-sp-3', name: 'Personal Care', banglaName: 'পার্সোনাল কেয়ার ও প্রসাধন', color: '#ec4899', productCount: 0 },
      { id: 'cat-sp-4', name: 'Household Cleaning', banglaName: 'হোম কেয়ার ও ক্লিনিং', color: '#10b981', productCount: 0 },
      { id: 'cat-sp-5', name: 'Snacks & Bakery', banglaName: 'স্ন্যাকস ও বেকারি', color: '#f59e0b', productCount: 0 },
    ]
  },
  {
    id: 'clothing-fashion',
    title: 'কাপড় ও পোশাক',
    subtitle: 'শার্ট, প্যান্ট, শাড়ি, থ্রি-পিস, পাঞ্জাবি ও বাচ্চাদের পোশাক',
    icon: Shirt,
    iconBgColor: 'bg-pink-500/10',
    iconColor: 'text-pink-500',
    keywords: ['কাপড়', 'পোশাক', 'শাড়ি', 'শার্ট', 'cloth', 'clothing', 'fashion', 'shirt', 'pant'],
    starterCategories: [
      { id: 'cat-cl-1', name: 'Mens Wear', banglaName: 'শার্ট, প্যান্ট ও পাঞ্জাবি', color: '#3b82f6', productCount: 0 },
      { id: 'cat-cl-2', name: 'Womens Wear', banglaName: 'শাড়ি ও থ্রি-পিস', color: '#ec4899', productCount: 0 },
      { id: 'cat-cl-3', name: 'Kids Wear', banglaName: 'বাচ্চাদের পোশাক', color: '#f59e0b', productCount: 0 },
      { id: 'cat-cl-4', name: 'T-Shirts & Casual', banglaName: 'টি-শার্ট ও ট্রাউজার', color: '#10b981', productCount: 0 },
    ]
  },
  {
    id: 'tailors-fabrics',
    title: 'থান কাপড় ও টেইলার্স',
    subtitle: 'গজ কাপড়, থান, লাইনিং ও সেলাইয়ের অর্ডার',
    icon: Scissors,
    iconBgColor: 'bg-violet-500/10',
    iconColor: 'text-violet-500',
    keywords: ['টেইলার্স', 'থান', 'সেলাই', 'tailor', 'fabric'],
    starterCategories: [
      { id: 'cat-tlr-1', name: 'Than & Fabric', banglaName: 'থান ও গজ কাপড়', color: '#8b5cf6', productCount: 0 },
      { id: 'cat-tlr-2', name: 'Lining & Accessories', banglaName: 'লাইনিং, বকরম ও সুতা', color: '#f59e0b', productCount: 0 },
      { id: 'cat-tlr-3', name: 'Stitching Order', banglaName: 'সেলাই মজুরি ও অর্ডার', color: '#10b981', productCount: 0 },
    ]
  },
  {
    id: 'shoes-bags',
    title: 'জুতা ও ব্যাগ',
    subtitle: 'জুতা, স্যান্ডেল, স্পোর্টস শু, ব্যাগ, বেল্ট ও ওয়ালেট',
    icon: Footprints,
    iconBgColor: 'bg-orange-500/10',
    iconColor: 'text-orange-500',
    keywords: ['জুতা', 'ব্যাগ', 'shoes', 'bag', 'sandal'],
    starterCategories: [
      { id: 'cat-sh-1', name: 'Mens Shoes', banglaName: 'পুরুষদের জুতা ও স্যান্ডেল', color: '#f97316', productCount: 0 },
      { id: 'cat-sh-2', name: 'Ladies Footwear', banglaName: 'মহিলাদের জুতা ও হিল', color: '#ec4899', productCount: 0 },
      { id: 'cat-sh-3', name: 'Sports Shoes', banglaName: 'স্পোর্টস শু ও স্নিকার্স', color: '#3b82f6', productCount: 0 },
      { id: 'cat-sh-4', name: 'Bags & Luggage', banglaName: 'ব্যাগ, লাগেজ ও ট্রাভেল ব্যাগ', color: '#10b981', productCount: 0 },
      { id: 'cat-sh-5', name: 'Belts & Wallets', banglaName: 'বেল্ট ও ওয়ালেট', color: '#8b5cf6', productCount: 0 },
    ]
  },
  {
    id: 'cosmetics-perfume',
    title: 'কসমেটিকস ও পারফিউম',
    subtitle: 'স্কিন ও হেয়ার কেয়ার, মেকআপ, পারফিউম ও বডি স্প্রে',
    icon: Sparkles,
    iconBgColor: 'bg-fuchsia-500/10',
    iconColor: 'text-fuchsia-500',
    keywords: ['কসমেটিকস', 'পারফিউম', 'মেকআপ', 'cosmetics', 'perfume', 'makeup'],
    starterCategories: [
      { id: 'cat-cos-1', name: 'Skin Care', banglaName: 'স্কিন কেয়ার ও লোশন', color: '#d946ef', productCount: 0 },
      { id: 'cat-cos-2', name: 'Hair Care', banglaName: 'শ্যাম্পু, তেল ও হেয়ার কেয়ার', color: '#8b5cf6', productCount: 0 },
      { id: 'cat-cos-3', name: 'Makeup & Beauty', banglaName: 'মেকআপ সামগ্রী', color: '#ec4899', productCount: 0 },
      { id: 'cat-cos-4', name: 'Perfume & Bodyspray', banglaName: 'পারফিউম ও বডি স্প্রে', color: '#3b82f6', productCount: 0 },
    ]
  },
  {
    id: 'jewelry',
    title: 'জুয়েলারি',
    subtitle: 'স্বর্ণ, রূপা, ডায়মন্ড ও ইমিটেশন গহনা',
    icon: Gem,
    iconBgColor: 'bg-yellow-500/10',
    iconColor: 'text-yellow-600',
    keywords: ['জুয়েলারি', 'গহনা', 'স্বর্ণ', 'jewelry', 'gold', 'silver'],
    starterCategories: [
      { id: 'cat-jw-1', name: 'Gold Jewelry', banglaName: 'স্বর্ণালংকার', color: '#eab308', productCount: 0 },
      { id: 'cat-jw-2', name: 'Silver Jewelry', banglaName: 'রূপার গহনা', color: '#94a3b8', productCount: 0 },
      { id: 'cat-jw-3', name: 'Imitation Jewelry', banglaName: 'ইমিটেশন ও ফ্যাশন গহনা', color: '#ec4899', productCount: 0 },
    ]
  },
  {
    id: 'watch-optics',
    title: 'ঘড়ি ও চশমা',
    subtitle: 'হাতঘড়ি, ওয়াল ক্লক, সানগ্লাস, ফ্রেম ও লেন্স',
    icon: Watch,
    iconBgColor: 'bg-sky-500/10',
    iconColor: 'text-sky-500',
    keywords: ['ঘড়ি', 'চশমা', 'watch', 'clock', 'glasses', 'optical'],
    starterCategories: [
      { id: 'cat-wt-1', name: 'Wrist Watches', banglaName: 'হাতঘড়ি', color: '#0ea5e9', productCount: 0 },
      { id: 'cat-wt-2', name: 'Wall Clocks', banglaName: 'দেয়াল ঘড়ি', color: '#f59e0b', productCount: 0 },
      { id: 'cat-wt-3', name: 'Sunglasses & Frames', banglaName: 'সানগ্লাস ও ফ্রেম', color: '#8b5cf6', productCount: 0 },
      { id: 'cat-wt-4', name: 'Optics & Lens', banglaName: 'চশমার লেন্স ও সল্যুশন', color: '#10b981', productCount: 0 },
    ]
  },
  {
    id: 'gadgets-accessories',
    title: 'গ্যাজেট ও এক্সেসরিজ',
    subtitle: 'ইয়ারবাড, স্মার্টওয়াচ, পাওয়ার ব্যাংক, চার্জার ও কভার',
    icon: Headphones,
    iconBgColor: 'bg-teal-500/10',
    iconColor: 'text-teal-500',
    keywords: ['গ্যাজেট', 'স্মার্টওয়াচ', 'gadget', 'smartwatch'],
    starterCategories: [
      { id: 'cat-gd-1', name: 'Smart Watches', banglaName: 'স্মার্টওয়াচ', color: '#14b8a6', productCount: 0 },
      { id: 'cat-gd-2', name: 'Earbuds & Headphones', banglaName: 'ইয়ারবাড ও হেডফোন', color: '#8b5cf6', productCount: 0 },
      { id: 'cat-gd-3', name: 'Power & Cables', banglaName: 'পাওয়ার ব্যাংক ও চার্জার', color: '#f59e0b', productCount: 0 },
    ]
  },
  {
    id: 'cctv-security',
    title: 'সিসিটিভি ও সিকিউরিটি',
    subtitle: 'CCTV ক্যামেরা, DVR/NVR, অ্যাক্সেস কন্ট্রোল ও ইনস্টলেশন',
    icon: Video,
    iconBgColor: 'bg-red-500/10',
    iconColor: 'text-red-500',
    keywords: ['সিসিটিভি', 'ক্যামেরা', 'cctv', 'camera', 'security'],
    starterCategories: [
      { id: 'cat-cc-1', name: 'CCTV Cameras', banglaName: 'CCTV ও IP ক্যামেরা', color: '#ef4444', productCount: 0 },
      { id: 'cat-cc-2', name: 'DVR & NVR', banglaName: 'DVR ও NVR রেকর্ডার', color: '#3b82f6', productCount: 0 },
      { id: 'cat-cc-3', name: 'Hard Drives & Cables', banglaName: 'হার্ডডিস্ক ও ক্যাবল', color: '#f59e0b', productCount: 0 },
      { id: 'cat-cc-4', name: 'Installation & Accessories', banglaName: 'ইনস্টলেশন ও কানেক্টর', color: '#10b981', productCount: 0 },
    ]
  },
  {
    id: 'solar-ips-battery',
    title: 'সোলার / IPS / ব্যাটারি',
    subtitle: 'সোলার প্যানেল, IPS/UPS, ব্যাটারি ও ইনভার্টার',
    icon: Sun,
    iconBgColor: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
    keywords: ['সোলার', 'আইপিএস', 'ব্যাটারি', 'solar', 'ips', 'battery'],
    starterCategories: [
      { id: 'cat-sl-1', name: 'Solar Panels', banglaName: 'সোলার প্যানেল', color: '#f59e0b', productCount: 0 },
      { id: 'cat-sl-2', name: 'IPS & UPS', banglaName: 'IPS ও UPS মেশিন', color: '#3b82f6', productCount: 0 },
      { id: 'cat-sl-3', name: 'Batteries', banglaName: 'টিউবুলার ও জেল ব্যাটারি', color: '#10b981', productCount: 0 },
      { id: 'cat-sl-4', name: 'Inverters & Charge Controllers', banglaName: 'চার্জ কন্ট্রোলার ও এক্সেসরিজ', color: '#8b5cf6', productCount: 0 },
    ]
  },
  {
    id: 'electric-lighting',
    title: 'ইলেকট্রিক ও লাইটিং',
    subtitle: 'LED লাইট, ফ্যান, সুইচ-সকেট, ক্যাবল ও সার্কিট ব্রেকার',
    icon: Lightbulb,
    iconBgColor: 'bg-yellow-500/10',
    iconColor: 'text-yellow-500',
    keywords: ['ইলেকট্রিক', 'লাইট', 'ফ্যান', 'electric', 'light', 'fan', 'cable'],
    starterCategories: [
      { id: 'cat-elc-1', name: 'LED Lights', banglaName: 'LED লাইট ও টিউব', color: '#eab308', productCount: 0 },
      { id: 'cat-elc-2', name: 'Fans', banglaName: 'সিলিং ও টেবিল ফ্যান', color: '#06b6d4', productCount: 0 },
      { id: 'cat-elc-3', name: 'Switches & Sockets', banglaName: 'সুইচ, সকেট ও বোর্ড', color: '#8b5cf6', productCount: 0 },
      { id: 'cat-elc-4', name: 'Cables & Wires', banglaName: 'ইলেকট্রিক তার ও ক্যাবল', color: '#ef4444', productCount: 0 },
      { id: 'cat-elc-5', name: 'Breakers & DB', banglaName: 'সার্কিট ব্রেকার ও কাটআউট', color: '#10b981', productCount: 0 },
    ]
  },
  {
    id: 'hardware-tools',
    title: 'হার্ডওয়্যার ও টুলস',
    subtitle: 'হ্যান্ড ও পাওয়ার টুলস, নাট-বোল্ট, তালা, পাইপ-ফিটিংস',
    icon: Wrench,
    iconBgColor: 'bg-slate-500/10',
    iconColor: 'text-slate-600',
    keywords: ['হার্ডওয়্যার', 'টুলস', 'hardware', 'tools', 'pipe'],
    starterCategories: [
      { id: 'cat-hw-1', name: 'Hand Tools', banglaName: 'হ্যান্ড টুলস ও হাতুড়ি', color: '#64748b', productCount: 0 },
      { id: 'cat-hw-2', name: 'Power Tools', banglaName: 'পাওয়ার ড্রিল ও কাটার', color: '#f59e0b', productCount: 0 },
      { id: 'cat-hw-3', name: 'Pipes & Fittings', banglaName: 'পাইপ ও ফিটিংস', color: '#3b82f6', productCount: 0 },
      { id: 'cat-hw-4', name: 'Locks & Fasteners', banglaName: 'তালা, স্ক্রু ও নাট-বোল্ট', color: '#10b981', productCount: 0 },
    ]
  },
  {
    id: 'paint-colors',
    title: 'রং ও পেইন্ট',
    subtitle: 'ইন্টেরিয়র/এক্সটেরিয়র পেইন্ট, প্রাইমার, থিনার ও ব্রাশ',
    icon: Paintbrush,
    iconBgColor: 'bg-cyan-500/10',
    iconColor: 'text-cyan-500',
    keywords: ['রং', 'পেইন্ট', 'paint', 'color'],
    starterCategories: [
      { id: 'cat-pt-1', name: 'Interior & Exterior Paint', banglaName: 'প্লাস্টিক ও ওয়েদার কোট পেইন্ট', color: '#06b6d4', productCount: 0 },
      { id: 'cat-pt-2', name: 'Primer & Distemper', banglaName: 'প্রাইমার ও পুটিং', color: '#3b82f6', productCount: 0 },
      { id: 'cat-pt-3', name: 'Thinner & Solvents', banglaName: 'থিনার ও তারপিন', color: '#f59e0b', productCount: 0 },
      { id: 'cat-pt-4', name: 'Brushes & Rollers', banglaName: 'রোলার, ব্রাশ ও স্যান্ডপেপার', color: '#8b5cf6', productCount: 0 },
    ]
  },
  {
    id: 'construction-materials',
    title: 'রড-সিমেন্ট ও নির্মাণ সামগ্রী',
    subtitle: 'সিমেন্ট, রড, ইট, বালু, পাথর ও কনস্ট্রাকশন কেমিক্যাল',
    icon: Building2,
    iconBgColor: 'bg-stone-500/10',
    iconColor: 'text-stone-600',
    keywords: ['রড', 'সিমেন্ট', 'নির্মাণ', 'cement', 'rod', 'construction'],
    starterCategories: [
      { id: 'cat-cn-1', name: 'Cement', banglaName: 'সিমেন্ট', color: '#78716c', productCount: 0 },
      { id: 'cat-cn-2', name: 'Steel & Rod', banglaName: 'রড ও রিকবার', color: '#ef4444', productCount: 0 },
      { id: 'cat-cn-3', name: 'Brick & Sand', banglaName: 'ইট, বালু ও খোয়া', color: '#f59e0b', productCount: 0 },
    ]
  },
  {
    id: 'furniture',
    title: 'ফার্নিচার',
    subtitle: 'খাট, সোফা, ডাইনিং, আলমারি, অফিস ফার্নিচার ও ম্যাট্রেস',
    icon: Armchair,
    iconBgColor: 'bg-amber-600/10',
    iconColor: 'text-amber-700',
    keywords: ['ফার্নিচার', 'সোফা', 'খাট', 'furniture', 'sofa', 'bed'],
    starterCategories: [
      { id: 'cat-fn-1', name: 'Beds & Wardrobes', banglaName: 'খাট ও আলমারি', color: '#d97706', productCount: 0 },
      { id: 'cat-fn-2', name: 'Sofas & Living', banglaName: 'সোফা ও ডিভান', color: '#8b5cf6', productCount: 0 },
      { id: 'cat-fn-3', name: 'Dining Tables', banglaName: 'ডাইনিং টেবিল ও চেয়ার', color: '#10b981', productCount: 0 },
      { id: 'cat-fn-4', name: 'Office Furniture', banglaName: 'অফিস টেবিল ও চেয়ার', color: '#3b82f6', productCount: 0 },
    ]
  },
  {
    id: 'crockery-kitchen',
    title: 'ক্রোকারিজ ও কিচেন',
    subtitle: 'প্লেট, গ্লাস, হাঁড়ি-পাতিল, কুকার, নন-স্টিক ও কাটলারি',
    icon: UtensilsCrossed,
    iconBgColor: 'bg-emerald-500/10',
    iconColor: 'text-emerald-600',
    keywords: ['ক্রোকারিজ', 'প্লেট', 'কুকার', 'crockery', 'kitchen', 'cooker'],
    starterCategories: [
      { id: 'cat-cr-1', name: 'Cookware & Pots', banglaName: 'প্রেসার কুকার ও হাঁড়ি-পাতিল', color: '#10b981', productCount: 0 },
      { id: 'cat-cr-2', name: 'Dinner Sets & Plates', banglaName: 'ডিনার সেট, প্লেট ও বাটি', color: '#3b82f6', productCount: 0 },
      { id: 'cat-cr-3', name: 'Glassware & Jugs', banglaName: 'গ্লাস ও জগ', color: '#06b6d4', productCount: 0 },
      { id: 'cat-cr-4', name: 'Kitchen Accessories', banglaName: 'ছুরি, চামচ ও কিচেন টুলস', color: '#f59e0b', productCount: 0 },
    ]
  },
  {
    id: 'plastic-household',
    title: 'প্লাস্টিক ও হাউজহোল্ড',
    subtitle: 'প্লাস্টিক পণ্য, বালতি, ঝুড়ি, ক্লিনিং ও ঘরের সামগ্রী',
    icon: Box,
    iconBgColor: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
    keywords: ['প্লাস্টিক', 'বালতি', 'plastic', 'household'],
    starterCategories: [
      { id: 'cat-pl-1', name: 'Buckets & Mugs', banglaName: 'বালতি ও মগ', color: '#3b82f6', productCount: 0 },
      { id: 'cat-pl-2', name: 'Baskets & Containers', banglaName: 'ঝুড়ি ও এয়ারটাইট বক্স', color: '#10b981', productCount: 0 },
      { id: 'cat-pl-3', name: 'Cleaning Essentials', banglaName: 'মপ, ঝাড়ু ও ক্লিনার', color: '#f59e0b', productCount: 0 },
    ]
  },
  {
    id: 'books-stationery',
    title: 'বই ও স্টেশনারি',
    subtitle: 'খাতা, কলম, বই, অফিস স্টেশনারি, আর্ট সামগ্রী ও ফটোকপি',
    icon: BookOpen,
    iconBgColor: 'bg-indigo-500/10',
    iconColor: 'text-indigo-500',
    keywords: ['বই', 'খাতা', 'কলম', 'book', 'stationery', 'pen'],
    starterCategories: [
      { id: 'cat-bk-1', name: 'Notebooks & Paper', banglaName: 'খাতা ও কাগজ', color: '#6366f1', productCount: 0 },
      { id: 'cat-bk-2', name: 'Pens & Pencils', banglaName: 'কলম, পেন্সিল ও মার্কার', color: '#3b82f6', productCount: 0 },
      { id: 'cat-bk-3', name: 'Books & Guides', banglaName: 'পাঠ্যবই ও গল্পের বই', color: '#10b981', productCount: 0 },
      { id: 'cat-bk-4', name: 'Office Stationery', banglaName: 'ফাইল, স্ট্যাপলার ও অফিস আইটেম', color: '#f59e0b', productCount: 0 },
    ]
  },
  {
    id: 'toys-gifts',
    title: 'খেলনা ও গিফট',
    subtitle: 'খেলনা, পুতুল, গিফট আইটেম, শোপিস ও পার্টি সামগ্রী',
    icon: Gift,
    iconBgColor: 'bg-pink-500/10',
    iconColor: 'text-pink-500',
    keywords: ['খেলনা', 'গিফট', 'toy', 'gift'],
    starterCategories: [
      { id: 'cat-ty-1', name: 'Toys & Dolls', banglaName: 'রিমোট কার ও পুতুল', color: '#ec4899', productCount: 0 },
      { id: 'cat-ty-2', name: 'Gift Items', banglaName: 'গিফট আইটেম ও ফটো ফ্রেম', color: '#8b5cf6', productCount: 0 },
      { id: 'cat-ty-3', name: 'Party Supplies', banglaName: 'জন্মদিনের বেলুন ও পার্টি সামগ্রী', color: '#f59e0b', productCount: 0 },
    ]
  },
  {
    id: 'baby-kids',
    title: 'বেবি ও কিডস',
    subtitle: 'ডায়াপার, বেবি ফুড, ফিডার, বেবি কেয়ার ও বাচ্চাদের পোশাক',
    icon: Baby,
    iconBgColor: 'bg-rose-500/10',
    iconColor: 'text-rose-500',
    keywords: ['বাচ্চা', 'বেবি', 'baby', 'kids', 'diaper'],
    starterCategories: [
      { id: 'cat-bb-1', name: 'Diapers & Wipes', banglaName: 'ডায়াপার ও ওয়াইপস', color: '#f43f5e', productCount: 0 },
      { id: 'cat-bb-2', name: 'Baby Food', banglaName: 'সেরেল্যাক ও ফর্মুলা মিল্ক', color: '#f59e0b', productCount: 0 },
      { id: 'cat-bb-3', name: 'Feeding & Bottles', banglaName: 'ফিডার ও বেবি পট', color: '#3b82f6', productCount: 0 },
      { id: 'cat-bb-4', name: 'Baby Care & Skincare', banglaName: 'বেবি লোশন ও তেল', color: '#10b981', productCount: 0 },
    ]
  },
  {
    id: 'sports',
    title: 'স্পোর্টস',
    subtitle: 'ক্রিকেট, ফুটবল, ব্যাডমিন্টন, জিম ও স্পোর্টস পোশাক',
    icon: Trophy,
    iconBgColor: 'bg-lime-500/10',
    iconColor: 'text-lime-600',
    keywords: ['স্পোর্টস', 'ফুটবল', 'ক্রিকেট', 'sports', 'football', 'cricket'],
    starterCategories: [
      { id: 'cat-sp-1', name: 'Cricket Equipment', banglaName: 'ব্যাট, বল ও প্যাড', color: '#84cc16', productCount: 0 },
      { id: 'cat-sp-2', name: 'Football & Badminton', banglaName: 'ফুটবল ও ব্যাডমিন্টন র্যাকেট', color: '#3b82f6', productCount: 0 },
      { id: 'cat-sp-3', name: 'Gym & Fitness', banglaName: 'ডাম্বেল ও ফিটনেস গিয়ার', color: '#f59e0b', productCount: 0 },
      { id: 'cat-sp-4', name: 'Jerseys & Sportswear', banglaName: 'জার্সি ও ট্রাউজার', color: '#ec4899', productCount: 0 },
    ]
  },
  {
    id: 'motorcycle-auto-parts',
    title: 'মোটরসাইকেল ও অটো পার্টস',
    subtitle: 'ইঞ্জিন পার্টস, টায়ার, ব্যাটারি, লুব্রিকেন্ট ও হেলমেট',
    icon: Bike,
    iconBgColor: 'bg-red-500/10',
    iconColor: 'text-red-500',
    keywords: ['মোটরসাইকেল', 'অটো', 'বাইক', 'bike', 'motorcycle', 'auto', 'parts', 'helmet'],
    starterCategories: [
      { id: 'cat-bk-1', name: 'Engine & Spare Parts', banglaName: 'স্পেয়ার পার্টস ও ব্রেক শু', color: '#ef4444', productCount: 0 },
      { id: 'cat-bk-2', name: 'Engine Oil & Lubricant', banglaName: 'ইঞ্জিন অয়েল ও মবিল', color: '#f59e0b', productCount: 0 },
      { id: 'cat-bk-3', name: 'Tyres & Tubes', banglaName: 'টায়ার ও টিউব', color: '#64748b', productCount: 0 },
      { id: 'cat-bk-4', name: 'Helmets & Accessories', banglaName: 'হেলমেট ও বাইক সিকিউরিটি', color: '#3b82f6', productCount: 0 },
    ]
  },
  {
    id: 'agriculture-seeds-feed',
    title: 'কৃষি, সার-বীজ ও ফিড',
    subtitle: 'সার, বীজ, কীটনাশক ও পোল্ট্রি-ফিশ-ক্যাটল ফিড',
    icon: Sprout,
    iconBgColor: 'bg-green-500/10',
    iconColor: 'text-green-600',
    keywords: ['কৃষি', 'সার', 'বীজ', 'agri', 'seed', 'fertilizer', 'feed'],
    starterCategories: [
      { id: 'cat-ag-1', name: 'Fertilizers', banglaName: 'রাসায়নিক ও জৈব সার', color: '#16a34a', productCount: 0 },
      { id: 'cat-ag-2', name: 'Seeds', banglaName: 'উন্নত জাতের বীজ', color: '#eab308', productCount: 0 },
      { id: 'cat-ag-3', name: 'Pesticides', banglaName: 'কীটনাশক ও বালাইনাশক', color: '#ef4444', productCount: 0 },
      { id: 'cat-ag-4', name: 'Animal & Fish Feed', banglaName: 'পোল্ট্রি ও মাছের খাবার', color: '#3b82f6', productCount: 0 },
    ]
  },
  {
    id: 'fruits-vegetables-meat',
    title: 'ফল, সবজি ও কাঁচাবাজার',
    subtitle: 'সবজি, ফল, মাছ, মাংস, ডিম ও দুধ',
    icon: Apple,
    iconBgColor: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500',
    keywords: ['ফল', 'সবজি', 'মাছ', 'মাংস', 'fruit', 'vegetable', 'meat', 'fish'],
    starterCategories: [
      { id: 'cat-fv-1', name: 'Fresh Fruits', banglaName: 'তাজা ফলমূল', color: '#10b981', productCount: 0 },
      { id: 'cat-fv-2', name: 'Vegetables', banglaName: 'শাকসবজি', color: '#22c55e', productCount: 0 },
      { id: 'cat-fv-3', name: 'Fish & Meat', banglaName: 'মাছ ও মাংস', color: '#ef4444', productCount: 0 },
      { id: 'cat-fv-4', name: 'Eggs & Milk', banglaName: 'ডিম ও তরল দুধ', color: '#f59e0b', productCount: 0 },
    ]
  },
  {
    id: 'bakery-sweets',
    title: 'বেকারি ও মিষ্টি',
    subtitle: 'মিষ্টি, দই, কেক, ব্রেড, বিস্কুট ও চানাচুর',
    icon: Cake,
    iconBgColor: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
    keywords: ['বেকারি', 'মিষ্টি', 'দই', 'কেক', 'bakery', 'sweets', 'cake'],
    starterCategories: [
      { id: 'cat-bk-1', name: 'Sweets & Curd', banglaName: 'মিষ্টান্ন ও দই', color: '#f59e0b', productCount: 0 },
      { id: 'cat-bk-2', name: 'Cakes & Pastries', banglaName: 'কেক ও পেস্ট্রি', color: '#ec4899', productCount: 0 },
      { id: 'cat-bk-3', name: 'Breads & Buns', banglaName: 'পাউরুটি ও বান', color: '#8b5cf6', productCount: 0 },
      { id: 'cat-bk-4', name: 'Biscuits & Chanachur', banglaName: 'বিস্কুট, টোস্ট ও চানাচুর', color: '#3b82f6', productCount: 0 },
    ]
  },
  {
    id: 'restaurant-fast-food',
    title: 'রেস্টুরেন্ট ও ফাস্ট ফুড',
    subtitle: 'বিরিয়ানি, কারি, ফাস্ট ফুড, বেভারেজ ও ডেজার্ট',
    icon: Coffee,
    iconBgColor: 'bg-orange-500/10',
    iconColor: 'text-orange-500',
    keywords: ['রেস্টুরেন্ট', 'ফাস্টফুড', 'খাবার', 'restaurant', 'fast food', 'food'],
    starterCategories: [
      { id: 'cat-rst-1', name: 'Biryani & Meals', banglaName: 'বিরিয়ানি, পোলাও ও ভাত', color: '#f97316', productCount: 0 },
      { id: 'cat-rst-2', name: 'Curry & Kabab', banglaName: 'চিকেন, মাটন ও কাবাব', color: '#ef4444', productCount: 0 },
      { id: 'cat-rst-3', name: 'Fast Food', banglaName: 'বার্গার, পিৎজা ও শর্মা', color: '#eab308', productCount: 0 },
      { id: 'cat-rst-4', name: 'Beverages', banglaName: 'কোল্ড ড্রিংকস ও কফি', color: '#06b6d4', productCount: 0 },
    ]
  },
  {
    id: 'wholesale-distribution',
    title: 'পাইকারি ও ডিস্ট্রিবিউশন',
    subtitle: 'কার্টন ও ডজন হিসাবে FMCG, বেভারেজ ও কনফেকশনারি',
    icon: Truck,
    iconBgColor: 'bg-blue-500/10',
    iconColor: 'text-blue-600',
    keywords: ['পাইকারি', 'ডিস্ট্রিবিউশন', 'wholesale', 'distribution'],
    starterCategories: [
      { id: 'cat-ws-1', name: 'Carton Goods', banglaName: 'কার্টন ও বস্তা মাল', color: '#2563eb', productCount: 0 },
      { id: 'cat-ws-2', name: 'Beverages Wholesale', banglaName: 'পানীয় ও জুস কেস', color: '#10b981', productCount: 0 },
      { id: 'cat-ws-3', name: 'Confectionery', banglaName: 'বিস্কুট ও চকলেট বক্স', color: '#f59e0b', productCount: 0 },
    ]
  },
  {
    id: 'pet-shop',
    title: 'পেট শপ',
    subtitle: 'ক্যাট-ডগ ফুড, বার্ড সিড, অ্যাকুয়ারিয়াম ও পেট এক্সেসরিজ',
    icon: PawPrint,
    iconBgColor: 'bg-violet-500/10',
    iconColor: 'text-violet-500',
    keywords: ['পেট', 'বিড়াল', 'পাখি', 'pet', 'cat', 'dog', 'fish'],
    starterCategories: [
      { id: 'cat-pet-1', name: 'Cat & Dog Food', banglaName: 'ক্যাট ও ডগ ফুড', color: '#8b5cf6', productCount: 0 },
      { id: 'cat-pet-2', name: 'Bird Seeds', banglaName: 'পাখির খাবার ও বীজ', color: '#10b981', productCount: 0 },
      { id: 'cat-pet-3', name: 'Aquarium & Fish', banglaName: 'অ্যাকুয়ারিয়াম ও মাছের খাদ্য', color: '#06b6d4', productCount: 0 },
      { id: 'cat-pet-4', name: 'Pet Accessories', banglaName: 'খাঁচা, বেল্ট ও খেলনা', color: '#f59e0b', productCount: 0 },
    ]
  },
  {
    id: 'servicing-repair',
    title: 'সার্ভিসিং ও রিপেয়ার',
    subtitle: 'সার্ভিস চার্জ, স্পেয়ার পার্টস, ডিসপ্লে-ব্যাটারি বদল',
    icon: Hammer,
    iconBgColor: 'bg-slate-500/10',
    iconColor: 'text-slate-600',
    keywords: ['সার্ভিসিং', 'রিপেয়ার', 'মেরামত', 'servicing', 'repair'],
    starterCategories: [
      { id: 'cat-srv-1', name: 'Service Labor Charge', banglaName: 'সার্ভিস চার্জ ও মজুরি', color: '#64748b', productCount: 0 },
      { id: 'cat-srv-2', name: 'Display & Battery', banglaName: 'ডিসপ্লে ও ব্যাটারি বদল', color: '#3b82f6', productCount: 0 },
      { id: 'cat-srv-3', name: 'Spare Parts', banglaName: 'স্পেয়ার পার্টস', color: '#f59e0b', productCount: 0 },
    ]
  },
  {
    id: 'other',
    title: 'অন্যান্য',
    subtitle: 'তালিকায় না থাকলে এটি নিন — সব ফিচারই পাবেন',
    icon: Layers,
    iconBgColor: 'bg-purple-500/10',
    iconColor: 'text-purple-600',
    keywords: ['অন্যান্য', 'other', 'general'],
    starterCategories: [
      { id: 'cat-oth-1', name: 'General Products', banglaName: 'সাধারণ পণ্য', color: '#8b5cf6', productCount: 0 },
      { id: 'cat-oth-2', name: 'Category 1', banglaName: 'ক্যাটাগরি ১', color: '#3b82f6', productCount: 0 },
      { id: 'cat-oth-3', name: 'Category 2', banglaName: 'ক্যাটাগরি ২', color: '#10b981', productCount: 0 },
    ]
  }
];
