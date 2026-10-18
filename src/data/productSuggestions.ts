import { Category } from '../types';

export interface ProductSuggestion {
  id: string;
  name: string;
  banglaName: string;
  category: string;
  categoryBn: string;
  brand: string;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  keywords: string[];
}

export const DEFAULT_PRESET_CATEGORIES: Category[] = [
  { id: 'cat-groceries', name: 'Groceries', banglaName: 'মুদি মালামাল', color: '#3b82f6', productCount: 0 },
  { id: 'cat-rice-grains', name: 'Rice & Grains', banglaName: 'চাল, ডাল ও খাদ্যশস্য', color: '#10b981', productCount: 0 },
  { id: 'cat-oil-spices', name: 'Oil & Spices', banglaName: 'তেল, ঘি ও মসলা', color: '#f59e0b', productCount: 0 },
  { id: 'cat-beverages', name: 'Beverages', banglaName: 'পানীয়, চা ও কফি', color: '#06b6d4', productCount: 0 },
  { id: 'cat-snacks', name: 'Snacks & Bakery', banglaName: 'স্ন্যাকস, বিস্কুট ও বেকারি', color: '#ec4899', productCount: 0 },
  { id: 'cat-personal-care', name: 'Personal Care', banglaName: 'ব্যক্তিগত যত্ন ও প্রসাধন', color: '#8b5cf6', productCount: 0 },
  { id: 'cat-cleaning', name: 'Cleaning & Household', banglaName: 'পরিষ্কার সামগ্রী ও লন্ড্রি', color: '#14b8a6', productCount: 0 },
  { id: 'cat-dairy-eggs', name: 'Dairy & Eggs', banglaName: 'দুগ্ধজাত পণ্য ও ডিম', color: '#eab308', productCount: 0 },
  { id: 'cat-electronics', name: 'Electronics & Gadgets', banglaName: 'ইলেকট্রনিক্স ও গ্যাজেট', color: '#6366f1', productCount: 0 },
  { id: 'cat-mobile', name: 'Mobile & Accessories', banglaName: 'মোবাইল ও এক্সেসরিজ', color: '#0284c7', productCount: 0 },
  { id: 'cat-it-computers', name: 'Computers & IT', banglaName: 'কম্পিউটার ও আইটি', color: '#a855f7', productCount: 0 },
  { id: 'cat-clothing', name: 'Clothing & Fashion', banglaName: 'পোশাক ও ফ্যাশন', color: '#f43f5e', productCount: 0 },
  { id: 'cat-medicine', name: 'Medicine & Healthcare', banglaName: 'ঔষধ ও ফার্মেসি', color: '#22c55e', productCount: 0 },
  { id: 'cat-stationery', name: 'Stationery & Office', banglaName: 'স্টেশনারি ও খাতা-কলম', color: '#64748b', productCount: 0 },
  { id: 'cat-baby', name: 'Baby Care', banglaName: 'শিশু যত্ন ও ডায়াপার', color: '#f472b6', productCount: 0 },
  { id: 'cat-fruits-veg', name: 'Fruits & Vegetables', banglaName: 'ফলমূল ও কাঁচাবাজার', color: '#84cc16', productCount: 0 },
];

export const POPULAR_PRODUCT_CATALOG: ProductSuggestion[] = [
  // 1. Rice, Flour & Grains (চাল, ডাল, আটা)
  {
    id: 'sug-1',
    name: 'Pran Miniket Rice 5kg',
    banglaName: 'প্রাণ মিনিকেট চাল ৫ কেজি',
    category: 'Rice & Grains',
    categoryBn: 'চাল, ডাল ও খাদ্যশস্য',
    brand: 'Pran',
    unit: 'ব্যাগ',
    purchasePrice: 380,
    sellingPrice: 430,
    keywords: ['pran', 'miniket', 'chal', 'rice', 'প্রাণ', 'মিনিকেট', 'চাল', 'p']
  },
  {
    id: 'sug-2',
    name: 'Pran Nazirshail Rice 5kg',
    banglaName: 'প্রাণ নাজিরশাইল চাল ৫ কেজি',
    category: 'Rice & Grains',
    categoryBn: 'চাল, ডাল ও খাদ্যশস্য',
    brand: 'Pran',
    unit: 'ব্যাগ',
    purchasePrice: 420,
    sellingPrice: 480,
    keywords: ['pran', 'nazirshail', 'chal', 'rice', 'প্রাণ', 'নাজিরশাইল', 'চাল', 'p']
  },
  {
    id: 'sug-3',
    name: 'Pran Chinigura Aromatic Rice 1kg',
    banglaName: 'প্রাণ চিনিগুঁড়া সুগন্ধি পোলাও চাল ১ কেজি',
    category: 'Rice & Grains',
    categoryBn: 'চাল, ডাল ও খাদ্যশস্য',
    brand: 'Pran',
    unit: 'প্যাকেট',
    purchasePrice: 130,
    sellingPrice: 155,
    keywords: ['pran', 'chinigura', 'polao', 'rice', 'প্রাণ', 'চিনিগুঁড়া', 'পোলাও', 'চাল', 'p']
  },
  {
    id: 'sug-4',
    name: 'Teer Miniket Rice 50kg',
    banglaName: 'তীর প্রিমিয়াম মিনিকেট চাল ৫০ কেজি',
    category: 'Rice & Grains',
    categoryBn: 'চাল, ডাল ও খাদ্যশস্য',
    brand: 'Teer',
    unit: 'বস্তা',
    purchasePrice: 3300,
    sellingPrice: 3550,
    keywords: ['teer', 'miniket', 'chal', 'rice', 'তীর', 'মিনিকেট', 'চাল', 't']
  },
  {
    id: 'sug-5',
    name: 'ACI Pure Miniket Rice 5kg',
    banglaName: 'এসিআই পিওর মিনিকেট চাল ৫ কেজি',
    category: 'Rice & Grains',
    categoryBn: 'চাল, ডাল ও খাদ্যশস্য',
    brand: 'ACI',
    unit: 'ব্যাগ',
    purchasePrice: 390,
    sellingPrice: 440,
    keywords: ['aci', 'pure', 'miniket', 'rice', 'এসিআই', 'মিনিকেট', 'চাল', 'a']
  },
  {
    id: 'sug-6',
    name: 'Daawat Basmati Rice 1kg',
    banglaName: 'দাওয়াত বাসমতী চাল ১ কেজি',
    category: 'Rice & Grains',
    categoryBn: 'চাল, ডাল ও খাদ্যশস্য',
    brand: 'Daawat',
    unit: 'প্যাকেট',
    purchasePrice: 270,
    sellingPrice: 320,
    keywords: ['daawat', 'basmati', 'rice', 'দাওয়াত', 'বাসমতী', 'চাল', 'd']
  },
  {
    id: 'sug-7',
    name: 'Deshi Masoor Dal 1kg',
    banglaName: 'দেশি চিকন মসুর ডাল ১ কেজি',
    category: 'Rice & Grains',
    categoryBn: 'চাল, ডাল ও খাদ্যশস্য',
    brand: 'Deshi',
    unit: 'কেজি',
    purchasePrice: 120,
    sellingPrice: 140,
    keywords: ['masoor', 'dal', 'mosur', 'মসুর', 'ডাল', 'm', 'd']
  },
  {
    id: 'sug-8',
    name: 'Moong Dal 1kg',
    banglaName: 'ভাজা মুগ ডাল ১ কেজি',
    category: 'Rice & Grains',
    categoryBn: 'চাল, ডাল ও খাদ্যশস্য',
    brand: 'Deshi',
    unit: 'কেজি',
    purchasePrice: 145,
    sellingPrice: 170,
    keywords: ['moong', 'mug', 'dal', 'মুগ', 'ডাল', 'm', 'd']
  },
  {
    id: 'sug-9',
    name: 'Chola Boot 1kg',
    banglaName: 'ছোলা বুট ১ কেজি',
    category: 'Rice & Grains',
    categoryBn: 'চাল, ডাল ও খাদ্যশস্য',
    brand: 'Deshi',
    unit: 'কেজি',
    purchasePrice: 95,
    sellingPrice: 115,
    keywords: ['chola', 'boot', 'ছোলা', 'বুট', 'c']
  },
  {
    id: 'sug-10',
    name: 'Teer Atta 2kg',
    banglaName: 'তীর পুষ্টি সমৃদ্ধ সাদা আটা ২ কেজি',
    category: 'Groceries',
    categoryBn: 'মুদি মালামাল',
    brand: 'Teer',
    unit: 'প্যাকেট',
    purchasePrice: 110,
    sellingPrice: 128,
    keywords: ['teer', 'atta', 'তীর', 'আটা', 't', 'a']
  },
  {
    id: 'sug-11',
    name: 'Teer Maida 2kg',
    banglaName: 'তীর ময়দা ২ কেজি',
    category: 'Groceries',
    categoryBn: 'মুদি মালামাল',
    brand: 'Teer',
    unit: 'প্যাকেট',
    purchasePrice: 135,
    sellingPrice: 155,
    keywords: ['teer', 'maida', 'তীর', 'ময়দা', 't', 'm']
  },
  {
    id: 'sug-12',
    name: 'Teer Suji 500g',
    banglaName: 'তীর সুজি ৫০০ গ্রাম',
    category: 'Groceries',
    categoryBn: 'মুদি মালামাল',
    brand: 'Teer',
    unit: 'প্যাকেট',
    purchasePrice: 42,
    sellingPrice: 50,
    keywords: ['teer', 'suji', 'তীর', 'সুজি', 't', 's']
  },
  {
    id: 'sug-13',
    name: 'Fresh Refined Sugar 1kg',
    banglaName: 'ফ্রেশ পরিশোধিত সাদা চিনি ১ কেজি',
    category: 'Groceries',
    categoryBn: 'মুদি মালামাল',
    brand: 'Fresh',
    unit: 'কেজি',
    purchasePrice: 130,
    sellingPrice: 145,
    keywords: ['fresh', 'sugar', 'chini', 'ফ্রেশ', 'চিনি', 'f', 's', 'c']
  },
  {
    id: 'sug-14',
    name: 'ACI Pure Iodized Salt 1kg',
    banglaName: 'এসিআই পিওর আয়োডিনযুক্ত ভ্যাকুয়াম লবণ ১ কেজি',
    category: 'Groceries',
    categoryBn: 'মুদি মালামাল',
    brand: 'ACI',
    unit: 'প্যাকেট',
    purchasePrice: 35,
    sellingPrice: 42,
    keywords: ['aci', 'salt', 'lobon', 'লবণ', 'এসিআই', 'a', 's', 'l']
  },

  // 2. Edible Oil & Spices (তেল ও মশলা)
  {
    id: 'sug-15',
    name: 'Teer Soybean Oil 1L',
    banglaName: 'তীর ফর্টিফাইড সয়াবিন তেল ১ লিটার',
    category: 'Oil & Spices',
    categoryBn: 'তেল, ঘি ও মসলা',
    brand: 'Teer',
    unit: 'বোতল',
    purchasePrice: 165,
    sellingPrice: 185,
    keywords: ['teer', 'soybean', 'oil', 'tel', 'তীর', 'সয়াবিন', 'তেল', 't', 's', 'o']
  },
  {
    id: 'sug-16',
    name: 'Teer Soybean Oil 2L',
    banglaName: 'তীর সয়াবিন তেল ২ লিটার',
    category: 'Oil & Spices',
    categoryBn: 'তেল, ঘি ও মসলা',
    brand: 'Teer',
    unit: 'বোতল',
    purchasePrice: 330,
    sellingPrice: 370,
    keywords: ['teer', 'soybean', 'oil', 'tel', 'তীর', 'সয়াবিন', 'তেল', 't', 's', 'o']
  },
  {
    id: 'sug-17',
    name: 'Teer Soybean Oil 5L',
    banglaName: 'তীর সয়াবিন তেল ৫ লিটার',
    category: 'Oil & Spices',
    categoryBn: 'তেল, ঘি ও মসলা',
    brand: 'Teer',
    unit: 'বোতল',
    purchasePrice: 820,
    sellingPrice: 915,
    keywords: ['teer', 'soybean', 'oil', 'তীর', 'সয়াবিন', 'তেল', 't', 's']
  },
  {
    id: 'sug-18',
    name: 'Rupchanda Fortified Soyabean Oil 1L',
    banglaName: 'রূপচাঁদা ভিটামিন সমৃদ্ধ সয়াবিন তেল ১ লিটার',
    category: 'Oil & Spices',
    categoryBn: 'তেল, ঘি ও মসলা',
    brand: 'Rupchanda',
    unit: 'বোতল',
    purchasePrice: 170,
    sellingPrice: 190,
    keywords: ['rupchanda', 'soyabean', 'oil', 'রূপচাঁদা', 'সয়াবিন', 'তেল', 'r', 's']
  },
  {
    id: 'sug-19',
    name: 'Rupchanda Fortified Soyabean Oil 5L',
    banglaName: 'রূপচাঁদা সয়াবিন তেল ৫ লিটার',
    category: 'Oil & Spices',
    categoryBn: 'তেল, ঘি ও মসলা',
    brand: 'Rupchanda',
    unit: 'বোতল',
    purchasePrice: 835,
    sellingPrice: 925,
    keywords: ['rupchanda', 'soyabean', 'oil', 'রূপচাঁদা', 'সয়াবিন', 'তেল', 'r']
  },
  {
    id: 'sug-20',
    name: 'Radhuni Pure Mustard Oil 250ml',
    banglaName: 'রাঁধুনী খাঁটি সরিষার তেল ২৫০ মিলি',
    category: 'Oil & Spices',
    categoryBn: 'তেল, ঘি ও মসলা',
    brand: 'Radhuni',
    unit: 'বোতল',
    purchasePrice: 85,
    sellingPrice: 100,
    keywords: ['radhuni', 'mustard', 'oil', 'sorisha', 'রাঁধুনী', 'সরিষা', 'তেল', 'r', 'm']
  },
  {
    id: 'sug-21',
    name: 'Radhuni Pure Mustard Oil 500ml',
    banglaName: 'রাঁধুনী খাঁটি সরিষার তেল ৫০০ মিলি',
    category: 'Oil & Spices',
    categoryBn: 'তেল, ঘি ও মসলা',
    brand: 'Radhuni',
    unit: 'বোতল',
    purchasePrice: 165,
    sellingPrice: 195,
    keywords: ['radhuni', 'mustard', 'oil', 'রাঁধুনী', 'সরিষা', 'তেল', 'r']
  },
  {
    id: 'sug-22',
    name: 'Radhuni Turmeric Powder 200g',
    banglaName: 'রাঁধুনী খাঁটি হলুদ গুঁড়া ২০০ গ্রাম',
    category: 'Oil & Spices',
    categoryBn: 'তেল, ঘি ও মসলা',
    brand: 'Radhuni',
    unit: 'প্যাকেট',
    purchasePrice: 65,
    sellingPrice: 80,
    keywords: ['radhuni', 'turmeric', 'holud', 'রাঁধুনী', 'হলুদ', 'r', 'h']
  },
  {
    id: 'sug-23',
    name: 'Radhuni Chilli Powder 200g',
    banglaName: 'রাঁধুনী ঝাল মরিচ গুঁড়া ২০০ গ্রাম',
    category: 'Oil & Spices',
    categoryBn: 'তেল, ঘি ও মসলা',
    brand: 'Radhuni',
    unit: 'প্যাকেট',
    purchasePrice: 85,
    sellingPrice: 105,
    keywords: ['radhuni', 'chilli', 'morich', 'রাঁধুনী', 'মরিচ', 'r', 'c', 'm']
  },
  {
    id: 'sug-24',
    name: 'Radhuni Coriander Powder 200g',
    banglaName: 'রাঁধুনী ধনিয়া গুঁড়া ২০০ গ্রাম',
    category: 'Oil & Spices',
    categoryBn: 'তেল, ঘি ও মসলা',
    brand: 'Radhuni',
    unit: 'প্যাকেট',
    purchasePrice: 60,
    sellingPrice: 75,
    keywords: ['radhuni', 'coriander', 'dhonia', 'রাঁধুনী', 'ধনিয়া', 'r', 'd']
  },
  {
    id: 'sug-25',
    name: 'Radhuni Meat Curry Masala 50g',
    banglaName: 'রাঁধুনী মাংসের মসলা ৫০ গ্রাম',
    category: 'Oil & Spices',
    categoryBn: 'তেল, ঘি ও মসলা',
    brand: 'Radhuni',
    unit: 'প্যাকেট',
    purchasePrice: 45,
    sellingPrice: 55,
    keywords: ['radhuni', 'meat', 'masala', 'মাংসের', 'মসলা', 'রাঁধুনী', 'r', 'm']
  },
  {
    id: 'sug-26',
    name: 'Radhuni Biryani Masala 40g',
    banglaName: 'রাঁধুনী বিরিয়ানি মসলা ৪০ গ্রাম',
    category: 'Oil & Spices',
    categoryBn: 'তেল, ঘি ও মসলা',
    brand: 'Radhuni',
    unit: 'প্যাকেট',
    purchasePrice: 50,
    sellingPrice: 60,
    keywords: ['radhuni', 'biryani', 'masala', 'রাঁধুনী', 'বিরিয়ানি', 'মসলা', 'r', 'b']
  },
  {
    id: 'sug-27',
    name: 'Aarong Pure Ghee 400g',
    banglaName: 'আড়ং ডেইরি খাঁটি গাওয়া ঘি ৪০০ গ্রাম',
    category: 'Oil & Spices',
    categoryBn: 'তেল, ঘি ও মসলা',
    brand: 'Aarong',
    unit: 'জার',
    purchasePrice: 520,
    sellingPrice: 590,
    keywords: ['aarong', 'ghee', 'আড়ং', 'ঘি', 'a', 'g']
  },

  // 3. Dairy, Eggs & Beverages (দুধ, ডিম ও পানীয়)
  {
    id: 'sug-28',
    name: 'Dano Daily Pushti Milk Powder 500g',
    banglaName: 'ডানো ডেইলি পুষ্টি গুঁড়ো দুধ ৫০০ গ্রাম',
    category: 'Dairy & Eggs',
    categoryBn: 'দুগ্ধজাত পণ্য ও ডিম',
    brand: 'Dano',
    unit: 'প্যাকেট',
    purchasePrice: 380,
    sellingPrice: 430,
    keywords: ['dano', 'milk', 'powder', 'ডানো', 'দুধ', 'd', 'm']
  },
  {
    id: 'sug-29',
    name: 'Marks Full Cream Milk Powder 500g',
    banglaName: 'মার্কস ফুল ক্রিম মিল্ক পাউডার ৫০০ গ্রাম',
    category: 'Dairy & Eggs',
    categoryBn: 'দুগ্ধজাত পণ্য ও ডিম',
    brand: 'Marks',
    unit: 'প্যাকেট',
    purchasePrice: 395,
    sellingPrice: 445,
    keywords: ['marks', 'milk', 'powder', 'মার্কস', 'দুধ', 'm']
  },
  {
    id: 'sug-30',
    name: 'Aarong Dairy Liquid Milk 1L',
    banglaName: 'আড়ং ডেইরি পাস্তুরিত তরল দুধ ১ লিটার',
    category: 'Dairy & Eggs',
    categoryBn: 'দুগ্ধজাত পণ্য ও ডিম',
    brand: 'Aarong',
    unit: 'প্যাকেট',
    purchasePrice: 80,
    sellingPrice: 95,
    keywords: ['aarong', 'milk', 'আড়ং', 'তরল দুধ', 'a', 'm']
  },
  {
    id: 'sug-31',
    name: 'Farm Fresh Brown Eggs (1 Dozen)',
    banglaName: 'ফার্ম ফ্রেশ লাল ডিম (১ ডজন - ১২টি)',
    category: 'Dairy & Eggs',
    categoryBn: 'দুগ্ধজাত পণ্য ও ডিম',
    brand: 'Farm Fresh',
    unit: 'ডজন',
    purchasePrice: 140,
    sellingPrice: 160,
    keywords: ['egg', 'dim', 'ডিম', 'ফার্ম', 'e', 'd']
  },
  {
    id: 'sug-32',
    name: 'Ispahani Mirzapore Best Leaf Tea 400g',
    banglaName: 'ইস্পাহানি মির্জাপুর চা পাতা ৪০০ গ্রাম',
    category: 'Beverages',
    categoryBn: 'পানীয়, চা ও কফি',
    brand: 'Ispahani',
    unit: 'প্যাকেট',
    purchasePrice: 210,
    sellingPrice: 240,
    keywords: ['ispahani', 'tea', 'cha', 'ইস্পাহানি', 'চা', 'মির্জাপুর', 'i', 't', 'c']
  },
  {
    id: 'sug-33',
    name: 'Ispahani Mirzapore Tea Bags 50pcs',
    banglaName: 'ইস্পাহানি মির্জাপুর টি ব্যাগ ৫০টি',
    category: 'Beverages',
    categoryBn: 'পানীয়, চা ও কফি',
    brand: 'Ispahani',
    unit: 'বক্স',
    purchasePrice: 110,
    sellingPrice: 130,
    keywords: ['ispahani', 'tea', 'teabag', 'টি ব্যাগ', 'চা', 'i', 't']
  },
  {
    id: 'sug-34',
    name: 'Taaza Black Tea 400g',
    banglaName: 'তাজা ব্ল্যাক টি ৪০০ গ্রাম',
    category: 'Beverages',
    categoryBn: 'পানীয়, চা ও কফি',
    brand: 'Brooke Bond',
    unit: 'প্যাকেট',
    purchasePrice: 200,
    sellingPrice: 235,
    keywords: ['taaza', 'tea', 'তাজা', 'চা', 't']
  },
  {
    id: 'sug-35',
    name: 'Nescafe Classic Instant Coffee 50g',
    banglaName: 'নেসক্যাফে ক্লাসিক ইনস্ট্যান্ট কফি ৫০ গ্রাম',
    category: 'Beverages',
    categoryBn: 'পানীয়, চা ও কফি',
    brand: 'Nestle',
    unit: 'জার',
    purchasePrice: 220,
    sellingPrice: 265,
    keywords: ['nescafe', 'coffee', 'নেসক্যাফে', 'কফি', 'n', 'c']
  },
  {
    id: 'sug-36',
    name: 'Tang Instant Drink Orange 500g',
    banglaName: 'ট্যাং ইনস্ট্যান্ট অরেঞ্জ ড্রিংক ৫০০ গ্রাম',
    category: 'Beverages',
    categoryBn: 'পানীয়, চা ও কফি',
    brand: 'Tang',
    unit: 'জার',
    purchasePrice: 340,
    sellingPrice: 395,
    keywords: ['tang', 'orange', 'ট্যাং', 'শরবত', 't', 'o']
  },
  {
    id: 'sug-37',
    name: 'Horlicks Classic Malt 500g',
    banglaName: 'হরলিক্স ক্লাসিক মল্ট ৫০০ গ্রাম',
    category: 'Beverages',
    categoryBn: 'পানীয়, চা ও কফি',
    brand: 'Horlicks',
    unit: 'জার',
    purchasePrice: 380,
    sellingPrice: 435,
    keywords: ['horlicks', 'হরলিক্স', 'h']
  },
  {
    id: 'sug-38',
    name: 'Coca-Cola 500ml',
    banglaName: 'কোকা-কোলা ৫০০ মিলি',
    category: 'Beverages',
    categoryBn: 'পানীয়, চা ও কফি',
    brand: 'Coca-Cola',
    unit: 'বোতল',
    purchasePrice: 38,
    sellingPrice: 45,
    keywords: ['coca-cola', 'coke', 'কোকা-কোলা', 'কোক', 'c']
  },
  {
    id: 'sug-39',
    name: 'Coca-Cola 1.25L',
    banglaName: 'কোকা-কোলা ১.২৫ লিটার',
    category: 'Beverages',
    categoryBn: 'পানীয়, চা ও কফি',
    brand: 'Coca-Cola',
    unit: 'বোতল',
    purchasePrice: 75,
    sellingPrice: 90,
    keywords: ['coca-cola', 'coke', 'কোকা-কোলা', 'কোক', 'c']
  },
  {
    id: 'sug-40',
    name: '7Up 1L',
    banglaName: 'সেভেন আপ ১ লিটার',
    category: 'Beverages',
    categoryBn: 'পানীয়, চা ও কফি',
    brand: 'PepsiCo',
    unit: 'বোতল',
    purchasePrice: 65,
    sellingPrice: 75,
    keywords: ['7up', 'seven up', 'সেভেন আপ', '7', 's']
  },
  {
    id: 'sug-41',
    name: 'Mojo Carbonated Beverage 500ml',
    banglaName: 'মোজো বেভারেজ ৫০০ মিলি',
    category: 'Beverages',
    categoryBn: 'পানীয়, চা ও কফি',
    brand: 'Akij',
    unit: 'বোতল',
    purchasePrice: 25,
    sellingPrice: 30,
    keywords: ['mojo', 'akij', 'মোজো', 'm']
  },
  {
    id: 'sug-42',
    name: 'Pran Frooto Mango Juice 250ml',
    banglaName: 'প্রাণ ফ্রুটো ম্যাঙ্গো জুস ২৫০ মিলি',
    category: 'Beverages',
    categoryBn: 'পানীয়, চা ও কফি',
    brand: 'Pran',
    unit: 'বোতল',
    purchasePrice: 28,
    sellingPrice: 35,
    keywords: ['pran', 'frooto', 'mango', 'juice', 'প্রাণ', 'জুস', 'ম্যাঙ্গো', 'p', 'f', 'm']
  },
  {
    id: 'sug-43',
    name: 'Mum Mineral Water 500ml',
    banglaName: 'মাম মিনারেল ড্রিংকিং ওয়াটার ৫০০ মিলি',
    category: 'Beverages',
    categoryBn: 'পানীয়, চা ও কফি',
    brand: 'Partex',
    unit: 'বোতল',
    purchasePrice: 15,
    sellingPrice: 20,
    keywords: ['mum', 'water', 'pani', 'মাম', 'পানি', 'm', 'w', 'p']
  },
  {
    id: 'sug-44',
    name: 'Kinley Drinking Water 1.5L',
    banglaName: 'কিনলে ফিল্টারড পানি ১.৫ লিটার',
    category: 'Beverages',
    categoryBn: 'পানীয়, চা ও কফি',
    brand: 'Coca-Cola',
    unit: 'বোতল',
    purchasePrice: 25,
    sellingPrice: 30,
    keywords: ['kinley', 'water', 'পানি', 'কিনলে', 'k', 'w']
  },

  // 4. Snacks & Bakery (স্ন্যাকস, নুডলস ও বিস্কুট)
  {
    id: 'sug-45',
    name: 'Maggi 2-Minute Masala Noodles 8-Pack',
    banglaName: 'ম্যাগি ২-মিনিট মসলা নুডলস ৮ প্যাক',
    category: 'Snacks & Bakery',
    categoryBn: 'স্ন্যাকস, বিস্কুট ও বেকারি',
    brand: 'Nestle',
    unit: 'প্যাক',
    purchasePrice: 160,
    sellingPrice: 190,
    keywords: ['maggi', 'noodles', 'ম্যাগি', 'নুডলস', 'm', 'n']
  },
  {
    id: 'sug-46',
    name: 'Pran Mr. Noodles Magic Masala 8-Pack',
    banglaName: 'প্রাণ মিস্টার নুডলস ম্যাজিক মসলা ৮ প্যাক',
    category: 'Snacks & Bakery',
    categoryBn: 'স্ন্যাকস, বিস্কুট ও বেকারি',
    brand: 'Pran',
    unit: 'প্যাক',
    purchasePrice: 145,
    sellingPrice: 175,
    keywords: ['pran', 'mr noodles', 'noodles', 'মিস্টার নুডলস', 'p', 'm', 'n']
  },
  {
    id: 'sug-47',
    name: 'Olympic Energy Plus Biscuit',
    banglaName: 'অলিম্পিক এনার্জি প্লাস বিস্কুট',
    category: 'Snacks & Bakery',
    categoryBn: 'স্ন্যাকস, বিস্কুট ও বেকারি',
    brand: 'Olympic',
    unit: 'প্যাকেট',
    purchasePrice: 30,
    sellingPrice: 35,
    keywords: ['olympic', 'energy plus', 'biscuit', 'অলিম্পিক', 'বিস্কুট', 'o', 'e', 'b']
  },
  {
    id: 'sug-48',
    name: 'Olympic Tip Biscuit',
    banglaName: 'অলিম্পিক টিপ বিস্কুট',
    category: 'Snacks & Bakery',
    categoryBn: 'স্ন্যাকস, বিস্কুট ও বেকারি',
    brand: 'Olympic',
    unit: 'প্যাকেট',
    purchasePrice: 42,
    sellingPrice: 50,
    keywords: ['olympic', 'tip', 'biscuit', 'টিপ বিস্কুট', 'o', 't', 'b']
  },
  {
    id: 'sug-49',
    name: 'Lexicon Cream Cracker Biscuit',
    banglaName: 'লেক্সিকন ক্রিম ক্র্যাকার বিস্কুট',
    category: 'Snacks & Bakery',
    categoryBn: 'স্ন্যাকস, বিস্কুট ও বেকারি',
    brand: 'Olympic',
    unit: 'প্যাকেট',
    purchasePrice: 50,
    sellingPrice: 60,
    keywords: ['lexicon', 'cream cracker', 'biscuit', 'লেক্সিকন', 'ক্র্যাকার', 'l', 'c', 'b']
  },
  {
    id: 'sug-50',
    name: 'Oreo Chocolate Sandwich Cookies',
    banglaName: 'ওরিও চকলেট ক্রিম কুকিজ বিস্কুট',
    category: 'Snacks & Bakery',
    categoryBn: 'স্ন্যাকস, বিস্কুট ও বেকারি',
    brand: 'Cadbury',
    unit: 'প্যাকেট',
    purchasePrice: 45,
    sellingPrice: 55,
    keywords: ['oreo', 'chocolate', 'cookie', 'biscuit', 'ওরিও', 'o', 'c']
  },
  {
    id: 'sug-51',
    name: 'Lays Potato Chips American Style',
    banglaName: 'লেজ আমেরিকান স্টাইল পটেটো চিপস',
    category: 'Snacks & Bakery',
    categoryBn: 'স্ন্যাকস, বিস্কুট ও বেকারি',
    brand: 'Lays',
    unit: 'প্যাকেট',
    purchasePrice: 22,
    sellingPrice: 25,
    keywords: ['lays', 'chips', 'potato', 'লেজ', 'চিপস', 'l', 'c']
  },
  {
    id: 'sug-52',
    name: 'Pran Jhal Chanachur 300g',
    banglaName: 'প্রাণ ঝাল চানাচুর ৩০০ গ্রাম',
    category: 'Snacks & Bakery',
    categoryBn: 'স্ন্যাকস, বিস্কুট ও বেকারি',
    brand: 'Pran',
    unit: 'প্যাকেট',
    purchasePrice: 55,
    sellingPrice: 65,
    keywords: ['pran', 'chanachur', 'প্রাণ', 'চানাচুর', 'p', 'c']
  },
  {
    id: 'sug-53',
    name: 'Bombay Sweets Ring Chips',
    banglaName: 'বোম্বে সুইটস রিং চিপস',
    category: 'Snacks & Bakery',
    categoryBn: 'স্ন্যাকস, বিস্কুট ও বেকারি',
    brand: 'Bombay Sweets',
    unit: 'প্যাকেট',
    purchasePrice: 18,
    sellingPrice: 20,
    keywords: ['bombay', 'ring', 'chips', 'রিং চিপস', 'b', 'r', 'c']
  },
  {
    id: 'sug-54',
    name: 'Cadbury Dairy Milk Chocolate',
    banglaName: 'ক্যাডবেরি ডেইরি মিল্ক চকলেট',
    category: 'Snacks & Bakery',
    categoryBn: 'স্ন্যাকস, বিস্কুট ও বেকারি',
    brand: 'Cadbury',
    unit: 'পিস',
    purchasePrice: 85,
    sellingPrice: 100,
    keywords: ['cadbury', 'dairy milk', 'chocolate', 'ডেইরি মিল্ক', 'চকলেট', 'c', 'd']
  },
  {
    id: 'sug-55',
    name: 'KitKat 4-Finger Chocolate Bar',
    banglaName: 'নেকলে কিটক্যাট ৪-ফিঙ্গার চকলেট',
    category: 'Snacks & Bakery',
    categoryBn: 'স্ন্যাকস, বিস্কুট ও বেকারি',
    brand: 'Nestle',
    unit: 'পিস',
    purchasePrice: 60,
    sellingPrice: 75,
    keywords: ['kitkat', 'chocolate', 'কিটক্যাট', 'চকলেট', 'k', 'c']
  },

  // 5. Personal Care & Toiletries (প্রসাধন ও সাবান)
  {
    id: 'sug-56',
    name: 'Lux Velvet Touch Beauty Soap 100g',
    banglaName: 'লাক্স ভেলভেট টাচ বিউটি সোপ ১০০ গ্রাম',
    category: 'Personal Care',
    categoryBn: 'ব্যক্তিগত যত্ন ও প্রসাধন',
    brand: 'Lux',
    unit: 'পিস',
    purchasePrice: 62,
    sellingPrice: 72,
    keywords: ['lux', 'soap', 'shaban', 'লাক্স', 'সাবান', 'l', 's']
  },
  {
    id: 'sug-57',
    name: 'Lifebuoy Total Germ Protection Soap 100g',
    banglaName: 'লাইফবয় টোটাল প্রটেকশন সাবান ১০০ গ্রাম',
    category: 'Personal Care',
    categoryBn: 'ব্যক্তিগত যত্ন ও প্রসাধন',
    brand: 'Lifebuoy',
    unit: 'পিস',
    purchasePrice: 50,
    sellingPrice: 60,
    keywords: ['lifebuoy', 'soap', 'লাইফবয়', 'সাবান', 'l', 's']
  },
  {
    id: 'sug-58',
    name: 'Dettol Original Antiseptic Soap 75g',
    banglaName: 'ডেটল অরিজিনাল অ্যান্টিসেপটিক সাবান ৭৫ গ্রাম',
    category: 'Personal Care',
    categoryBn: 'ব্যক্তিগত যত্ন ও প্রসাধন',
    brand: 'Dettol',
    unit: 'পিস',
    purchasePrice: 58,
    sellingPrice: 68,
    keywords: ['dettol', 'soap', 'ডেটল', 'সাবান', 'd', 's']
  },
  {
    id: 'sug-59',
    name: 'Savlon Antiseptic Soap 100g',
    banglaName: 'স্যাভলন অ্যান্টিসেপটিক সাবান ১০০ গ্রাম',
    category: 'Personal Care',
    categoryBn: 'ব্যক্তিগত যত্ন ও প্রসাধন',
    brand: 'Savlon',
    unit: 'পিস',
    purchasePrice: 55,
    sellingPrice: 65,
    keywords: ['savlon', 'soap', 'স্যাভলন', 'সাবান', 's']
  },
  {
    id: 'sug-60',
    name: 'Dove Beauty Bar Moisture Soap 100g',
    banglaName: 'ডাভ বিউটি বার ময়েশ্চারাইজিং সাবান ১০০ গ্রাম',
    category: 'Personal Care',
    categoryBn: 'ব্যক্তিগত যত্ন ও প্রসাধন',
    brand: 'Dove',
    unit: 'পিস',
    purchasePrice: 110,
    sellingPrice: 135,
    keywords: ['dove', 'soap', 'ডাভ', 'সাবান', 'd', 's']
  },
  {
    id: 'sug-61',
    name: 'Sunsilk Stunning Black Shine Shampoo 180ml',
    banglaName: 'সানসিল্ক ব্ল্যাক শাইন শ্যাম্পু ১৮০ মিলি',
    category: 'Personal Care',
    categoryBn: 'ব্যক্তিগত যত্ন ও প্রসাধন',
    brand: 'Sunsilk',
    unit: 'বোতল',
    purchasePrice: 190,
    sellingPrice: 230,
    keywords: ['sunsilk', 'shampoo', 'সানসিল্ক', 'শ্যাম্পু', 's']
  },
  {
    id: 'sug-62',
    name: 'Clear Anti-Dandruff Cool Sport Shampoo 180ml',
    banglaName: 'ক্লিয়ার অ্যান্টি-ড্যান্ড্রাফ শ্যাম্পু ১৮০ মিলি',
    category: 'Personal Care',
    categoryBn: 'ব্যক্তিগত যত্ন ও প্রসাধন',
    brand: 'Clear',
    unit: 'বোতল',
    purchasePrice: 210,
    sellingPrice: 250,
    keywords: ['clear', 'shampoo', 'ক্লিয়ার', 'শ্যাম্পু', 'c', 's']
  },
  {
    id: 'sug-63',
    name: 'Head & Shoulders Cool Menthol Shampoo 180ml',
    banglaName: 'হেড অ্যান্ড শোল্ডারস কুল মেনথল শ্যাম্পু ১৮০ মিলি',
    category: 'Personal Care',
    categoryBn: 'ব্যক্তিগত যত্ন ও প্রসাধন',
    brand: 'Head & Shoulders',
    unit: 'বোতল',
    purchasePrice: 220,
    sellingPrice: 260,
    keywords: ['head & shoulders', 'shampoo', 'হেড অ্যান্ড শোল্ডারস', 'শ্যাম্পু', 'h', 's']
  },
  {
    id: 'sug-64',
    name: 'Parachute Pure Coconut Hair Oil 200ml',
    banglaName: 'প্যারাসুট খাঁটি নারিকেল তেল ২০০ মিলি',
    category: 'Personal Care',
    categoryBn: 'ব্যক্তিগত যত্ন ও প্রসাধন',
    brand: 'Parachute',
    unit: 'বোতল',
    purchasePrice: 125,
    sellingPrice: 145,
    keywords: ['parachute', 'coconut oil', 'narikel tel', 'প্যারাসুট', 'নারিকেল তেল', 'p', 'c']
  },
  {
    id: 'sug-65',
    name: 'Close Up Red Hot Gel Toothpaste 100g',
    banglaName: 'ক্লোজ আপ রেড হট জেল টুথপেস্ট ১০০ গ্রাম',
    category: 'Personal Care',
    categoryBn: 'ব্যক্তিগত যত্ন ও প্রসাধন',
    brand: 'Close Up',
    unit: 'টিউব',
    purchasePrice: 95,
    sellingPrice: 115,
    keywords: ['close up', 'toothpaste', 'ক্লোজ আপ', 'টুথপেস্ট', 'c', 't']
  },
  {
    id: 'sug-66',
    name: 'Colgate Strong Teeth Toothpaste 100g',
    banglaName: 'কোলগেট স্ট্রং টিথ টুথপেস্ট ১০০ গ্রাম',
    category: 'Personal Care',
    categoryBn: 'ব্যক্তিগত যত্ন ও প্রসাধন',
    brand: 'Colgate',
    unit: 'টিউব',
    purchasePrice: 90,
    sellingPrice: 110,
    keywords: ['colgate', 'toothpaste', 'কোলগেট', 'টুথপেস্ট', 'c', 't']
  },
  {
    id: 'sug-67',
    name: 'Pepsodent Expert Protection Toothpaste 100g',
    banglaName: 'পেপসোডেন্ট এক্সপার্ট প্রটেকশন টুথপেস্ট ১০০ গ্রাম',
    category: 'Personal Care',
    categoryBn: 'ব্যক্তিগত যত্ন ও প্রসাধন',
    brand: 'Pepsodent',
    unit: 'টিউব',
    purchasePrice: 85,
    sellingPrice: 105,
    keywords: ['pepsodent', 'toothpaste', 'পেপসোডেন্ট', 'টুথপেস্ট', 'p', 't']
  },
  {
    id: 'sug-68',
    name: 'Vaseline Pure Petroleum Jelly 50g',
    banglaName: 'ভ্যাসলিন অরিজিনাল পেট্রোলিয়াম জেলি ৫০ গ্রাম',
    category: 'Personal Care',
    categoryBn: 'ব্যক্তিগত যত্ন ও প্রসাধন',
    brand: 'Vaseline',
    unit: 'জার',
    purchasePrice: 65,
    sellingPrice: 80,
    keywords: ['vaseline', 'petroleum jelly', 'ভ্যাসলিন', 'v', 'p']
  },
  {
    id: 'sug-69',
    name: 'Gillette Mach3 Razor System',
    banglaName: 'জিলেট ম্যাক-৩ ট্রিপল ব্লেড রেজার',
    category: 'Personal Care',
    categoryBn: 'ব্যক্তিগত যত্ন ও প্রসাধন',
    brand: 'Gillette',
    unit: 'পিস',
    purchasePrice: 280,
    sellingPrice: 340,
    keywords: ['gillette', 'razor', 'mach3', 'জিলেট', 'রেজার', 'g', 'r']
  },

  // 6. Cleaning & Household (পরিষ্কার ও লন্ড্রি)
  {
    id: 'sug-70',
    name: 'Wheel 2-in-1 Detergent Powder 1kg',
    banglaName: 'হুইল ২-ইন-১ ওয়াশিং পাউডার ১ কেজি',
    category: 'Cleaning & Household',
    categoryBn: 'পরিষ্কার সামগ্রী ও লন্ড্রি',
    brand: 'Wheel',
    unit: 'প্যাকেট',
    purchasePrice: 120,
    sellingPrice: 140,
    keywords: ['wheel', 'detergent', 'powder', 'হুইল', 'পাউডার', 'w', 'd']
  },
  {
    id: 'sug-71',
    name: 'Surf Excel Quick Wash Detergent 1kg',
    banglaName: 'সার্ফ এক্সেল কুইক ওয়াশ ডিটারজেন্ট ১ কেজি',
    category: 'Cleaning & Household',
    categoryBn: 'পরিষ্কার সামগ্রী ও লন্ড্রি',
    brand: 'Surf Excel',
    unit: 'প্যাকেট',
    purchasePrice: 220,
    sellingPrice: 255,
    keywords: ['surf excel', 'detergent', 'সার্ফ এক্সেল', 's', 'd']
  },
  {
    id: 'sug-72',
    name: 'Rin Power White Detergent 1kg',
    banglaName: 'রিন পাওয়ার হোয়াইট ডিটারজেন্ট ১ কেজি',
    category: 'Cleaning & Household',
    categoryBn: 'পরিষ্কার সামগ্রী ও লন্ড্রি',
    brand: 'Rin',
    unit: 'প্যাকেট',
    purchasePrice: 150,
    sellingPrice: 175,
    keywords: ['rin', 'detergent', 'রিন', 'ডিটারজেন্ট', 'r', 'd']
  },
  {
    id: 'sug-73',
    name: 'Vim Dishwash Liquid Lemon 500ml',
    banglaName: 'ভিম ডিশওয়াশ লিকুইড লেমন ৫০০ মিলি',
    category: 'Cleaning & Household',
    categoryBn: 'পরিষ্কার সামগ্রী ও লন্ড্রি',
    brand: 'Vim',
    unit: 'বোতল',
    purchasePrice: 115,
    sellingPrice: 135,
    keywords: ['vim', 'dishwash', 'liquid', 'ভিম', 'লিকুইড', 'v', 'd']
  },
  {
    id: 'sug-74',
    name: 'Harpic Toilet Cleaner Power Plus 750ml',
    banglaName: 'হারপিক টয়লেট ক্লিনার পাওয়ার প্লাস ৭৫০ মিলি',
    category: 'Cleaning & Household',
    categoryBn: 'পরিষ্কার সামগ্রী ও লন্ড্রি',
    brand: 'Harpic',
    unit: 'বোতল',
    purchasePrice: 145,
    sellingPrice: 170,
    keywords: ['harpic', 'toilet cleaner', 'হারপিক', 'টয়লেট ক্লিনার', 'h', 't']
  },
  {
    id: 'sug-75',
    name: 'Lizol Floor Cleaner Citrus 500ml',
    banglaName: 'লাইজল ফ্লোর ক্লিনার সাইট্রাস ৫০০ মিলি',
    category: 'Cleaning & Household',
    categoryBn: 'পরিষ্কার সামগ্রী ও লন্ড্রি',
    brand: 'Lizol',
    unit: 'বোতল',
    purchasePrice: 130,
    sellingPrice: 155,
    keywords: ['lizol', 'floor cleaner', 'লাইজল', 'l', 'f']
  },
  {
    id: 'sug-76',
    name: 'Bashundhara Facial Tissue Box',
    banglaName: 'বসুন্ধরা প্রিমিয়াম ফেসিয়াল টিস্যু বক্স',
    category: 'Cleaning & Household',
    categoryBn: 'পরিষ্কার সামগ্রী ও লন্ড্রি',
    brand: 'Bashundhara',
    unit: 'বক্স',
    purchasePrice: 65,
    sellingPrice: 75,
    keywords: ['bashundhara', 'tissue', 'বসুন্ধরা', 'টিস্যু', 'b', 't']
  },
  {
    id: 'sug-77',
    name: 'Bashundhara Toilet Tissue Roll',
    banglaName: 'বসুন্ধরা টয়লেট টিস্যু রোল',
    category: 'Cleaning & Household',
    categoryBn: 'পরিষ্কার সামগ্রী ও লন্ড্রি',
    brand: 'Bashundhara',
    unit: 'রোল',
    purchasePrice: 22,
    sellingPrice: 28,
    keywords: ['bashundhara', 'toilet tissue', 'টিস্যু রোল', 'b', 't']
  },
  {
    id: 'sug-78',
    name: 'Mortein Mosquito Repellent Coil',
    banglaName: 'মর্টিন মশার কয়েল লাল ১০টি',
    category: 'Cleaning & Household',
    categoryBn: 'পরিষ্কার সামগ্রী ও লন্ড্রি',
    brand: 'Mortein',
    unit: 'প্যাকেট',
    purchasePrice: 55,
    sellingPrice: 65,
    keywords: ['mortein', 'coil', 'মর্টিন', 'কয়েল', 'm', 'c']
  },

  // 7. Mobile, IT & Electronics (মোবাইল ও গ্যাজেট)
  {
    id: 'sug-79',
    name: 'Samsung 25W Type-C Super Fast Charger',
    banglaName: 'স্যামসাং ২৫ ওয়াট টাইপ-সি ফাস্ট চার্জার',
    category: 'Mobile & Accessories',
    categoryBn: 'মোবাইল ও এক্সেসরিজ',
    brand: 'Samsung',
    unit: 'পিস',
    purchasePrice: 650,
    sellingPrice: 850,
    keywords: ['samsung', 'charger', 'type-c', 'স্যামসাং', 'চার্জার', 's', 'c']
  },
  {
    id: 'sug-80',
    name: 'Remax Type-C Fast Charging Data Cable',
    banglaName: 'রিম্যাক্স টাইপ-সি ফাস্ট চার্জিং ডাটা কেবল',
    category: 'Mobile & Accessories',
    categoryBn: 'মোবাইল ও এক্সেসরিজ',
    brand: 'Remax',
    unit: 'পিস',
    purchasePrice: 120,
    sellingPrice: 180,
    keywords: ['remax', 'cable', 'data cable', 'রিম্যাক্স', 'কেবল', 'r', 'c']
  },
  {
    id: 'sug-81',
    name: 'Joyroom 10000mAh Dual USB Power Bank',
    banglaName: 'জয়রুম ১০,০০০ mAh ডুয়াল আউটপুট পাওয়ার ব্যাংক',
    category: 'Mobile & Accessories',
    categoryBn: 'মোবাইল ও এক্সেসরিজ',
    brand: 'Joyroom',
    unit: 'পিস',
    purchasePrice: 950,
    sellingPrice: 1250,
    keywords: ['joyroom', 'power bank', 'পাওয়ার ব্যাংক', 'j', 'p']
  },
  {
    id: 'sug-82',
    name: 'Havit Wireless Optical Mouse 2.4GHz',
    banglaName: 'হ্যাভিট ওয়্যারলেস অপটিক্যাল মাউস',
    category: 'Computers & IT',
    categoryBn: 'কম্পিউটার ও আইটি',
    brand: 'Havit',
    unit: 'পিস',
    purchasePrice: 280,
    sellingPrice: 390,
    keywords: ['havit', 'mouse', 'wireless mouse', 'হ্যাভিট', 'মাউস', 'h', 'm']
  },
  {
    id: 'sug-83',
    name: 'A4Tech USB Multimedia Keyboard',
    banglaName: 'এ-ফোর-টেক ইউএসবি মাল্টিমিডিয়া কিবোর্ড',
    category: 'Computers & IT',
    categoryBn: 'কম্পিউটার ও আইটি',
    brand: 'A4Tech',
    unit: 'পিস',
    purchasePrice: 420,
    sellingPrice: 550,
    keywords: ['a4tech', 'keyboard', 'কিবোর্ড', 'a', 'k']
  },
  {
    id: 'sug-84',
    name: 'SanDisk Ultra 64GB MicroSD Card',
    banglaName: 'সানডিস্ক আল্ট্রা ৬৪ জিবি মেমোরি কার্ড',
    category: 'Mobile & Accessories',
    categoryBn: 'মোবাইল ও এক্সেসরিজ',
    brand: 'SanDisk',
    unit: 'পিস',
    purchasePrice: 420,
    sellingPrice: 550,
    keywords: ['sandisk', 'memory card', 'microsd', 'সানডিস্ক', 'মেমোরি কার্ড', 's', 'm']
  },
  {
    id: 'sug-85',
    name: 'Western Digital 240GB Green SATA SSD',
    banglaName: 'ওয়েস্টার্ন ডিজিটাল ২৪০ জিবি এসএসডি',
    category: 'Computers & IT',
    categoryBn: 'কম্পিউটার ও আইটি',
    brand: 'WD',
    unit: 'পিস',
    purchasePrice: 1850,
    sellingPrice: 2350,
    keywords: ['wd', 'ssd', 'storage', 'এসএসডি', 'w', 's']
  },
  {
    id: 'sug-86',
    name: 'TP-Link TL-WR840N 300Mbps Wi-Fi Router',
    banglaName: 'টিপি-লিংক ওয়াইফাই রাউটার ৩০০ এমবিপিএস',
    category: 'Computers & IT',
    categoryBn: 'কম্পিউটার ও আইটি',
    brand: 'TP-Link',
    unit: 'পিস',
    purchasePrice: 1100,
    sellingPrice: 1350,
    keywords: ['tp-link', 'router', 'wifi', 'টিপি-লিংক', 'রাউটার', 't', 'r']
  },
  {
    id: 'sug-87',
    name: 'Walton 32-Inch Smart Android LED TV',
    banglaName: 'ওয়ালটন ৩২ ইঞ্চি স্মার্ট অ্যান্ড্রয়েড এলইডি টিভি',
    category: 'Electronics & Gadgets',
    categoryBn: 'ইলেকট্রনিক্স ও গ্যাজেট',
    brand: 'Walton',
    unit: 'পিস',
    purchasePrice: 16500,
    sellingPrice: 19500,
    keywords: ['walton', 'tv', 'led tv', 'ওয়ালটন', 'টিভি', 'w', 't']
  },
  {
    id: 'sug-88',
    name: 'Vision 200W Electric Blender 3-in-1',
    banglaName: 'ভিশন ইলেকট্রিক ব্লেন্ডার ৩-ইন-১',
    category: 'Electronics & Gadgets',
    categoryBn: 'ইলেকট্রনিক্স ও গ্যাজেট',
    brand: 'Vision',
    unit: 'পিস',
    purchasePrice: 2100,
    sellingPrice: 2650,
    keywords: ['vision', 'blender', 'ভিশন', 'ব্লেন্ডার', 'v', 'b']
  },

  // 8. Medicine & Pharmacy (ঔষধ ও স্বাস্থ্য)
  {
    id: 'sug-89',
    name: 'Napa 500mg Paracetamol Tablet',
    banglaName: 'নাপা ৫০০ মিগ্রা প্যারাসিটামল ট্যাবলেট (পাতা)',
    category: 'Medicine & Healthcare',
    categoryBn: 'ঔষধ ও ফার্মেসি',
    brand: 'Beximco',
    unit: 'পাতা',
    purchasePrice: 10,
    sellingPrice: 12,
    keywords: ['napa', 'paracetamol', 'tablet', 'নাপা', 'প্যারাসিটামল', 'n', 'p', 't']
  },
  {
    id: 'sug-90',
    name: 'Napa Extra Paracetamol & Caffeine Tablet',
    banglaName: 'নাপা এক্সট্রা ট্যাবলেট (পাতা)',
    category: 'Medicine & Healthcare',
    categoryBn: 'ঔষধ ও ফার্মেসি',
    brand: 'Beximco',
    unit: 'পাতা',
    purchasePrice: 20,
    sellingPrice: 25,
    keywords: ['napa extra', 'paracetamol', 'নাপা এক্সট্রা', 'n', 'p']
  },
  {
    id: 'sug-91',
    name: 'Ace 500mg Paracetamol Tablet',
    banglaName: 'এইস ৫০০ মিগ্রা ট্যাবলেট (পাতা)',
    category: 'Medicine & Healthcare',
    categoryBn: 'ঔষধ ও ফার্মেসি',
    brand: 'Square',
    unit: 'পাতা',
    purchasePrice: 10,
    sellingPrice: 12,
    keywords: ['ace', 'paracetamol', 'এইস', 'a', 'p']
  },
  {
    id: 'sug-92',
    name: 'Seclo 20mg Omeprazole Capsule',
    banglaName: 'সেকলো ২০ মিগ্রা গ্যাস্ট্রিক ক্যাপসুল (পাতা)',
    category: 'Medicine & Healthcare',
    categoryBn: 'ঔষধ ও ফার্মেসি',
    brand: 'Square',
    unit: 'পাতা',
    purchasePrice: 50,
    sellingPrice: 60,
    keywords: ['seclo', 'gastric', 'সেকলো', 'গ্যাস্ট্রিক', 's', 'g']
  },
  {
    id: 'sug-93',
    name: 'Sergel 20mg Esomeprazole Capsule',
    banglaName: 'সার্জেল ২০ মিগ্রা ক্যাপসুল (পাতা)',
    category: 'Medicine & Healthcare',
    categoryBn: 'ঔষধ ও ফার্মেসি',
    brand: 'Healthcare',
    unit: 'পাতা',
    purchasePrice: 60,
    sellingPrice: 70,
    keywords: ['sergel', 'সার্জেল', 'গ্যাস্ট্রিক', 's']
  },
  {
    id: 'sug-94',
    name: 'Fexo 120mg Fexofenadine Tablet',
    banglaName: 'ফেক্সো ১২০ মিগ্রা অ্যালার্জি ট্যাবলেট (পাতা)',
    category: 'Medicine & Healthcare',
    categoryBn: 'ঔষধ ও ফার্মেসি',
    brand: 'Square',
    unit: 'পাতা',
    purchasePrice: 75,
    sellingPrice: 90,
    keywords: ['fexo', 'allergy', 'ফেক্সো', 'অ্যালার্জি', 'f', 'a']
  },
  {
    id: 'sug-95',
    name: 'Savlon Antiseptic Liquid 112ml',
    banglaName: 'স্যাভলন অ্যান্টিসেপটিক লিকুইড ১১২ মিলি',
    category: 'Medicine & Healthcare',
    categoryBn: 'ঔষধ ও ফার্মেসি',
    brand: 'ACI',
    unit: 'বোতল',
    purchasePrice: 45,
    sellingPrice: 55,
    keywords: ['savlon', 'liquid', 'স্যাভলন', 's', 'l']
  },
  {
    id: 'sug-96',
    name: 'Hansaplast Adhesive First Aid Bandages',
    banglaName: 'হ্যানসাপ্লাস্ট ওয়াটারপ্রুফ ব্যান্ডেজ স্ট্রিপ',
    category: 'Medicine & Healthcare',
    categoryBn: 'ঔষধ ও ফার্মেসি',
    brand: 'Hansaplast',
    unit: 'পিস',
    purchasePrice: 4,
    sellingPrice: 5,
    keywords: ['hansaplast', 'bandage', 'ব্যান্ডেজ', 'h', 'b']
  }
];

/**
 * Intelligent Category Detection based on product name keywords in English and Bangla
 */
export function detectCategoryFromProductName(
  productName: string,
  availableCategories: Category[]
): string {
  if (!productName || !productName.trim()) {
    return availableCategories[0]?.name || 'Groceries';
  }

  const query = productName.toLowerCase().trim();

  // Keyword rules mapping to standard categories
  const categoryRules: { categoryName: string; keywords: string[] }[] = [
    {
      categoryName: 'Rice & Grains',
      keywords: [
        'চাল', 'রাইস', 'rice', 'chal', 'miniket', 'মিনিকেট', 'nazirshail', 'নাজিরশাইল',
        'polao', 'পোলাও', 'chinigura', 'চিনিগুঁড়া', 'basmati', 'বাসমতী', 'katari', 'কাটারি',
        'dal', 'ডাল', 'masoor', 'মসুর', 'moong', 'মুগ', 'chola', 'ছোলা', 'boot', 'বুট',
        'wheat', 'গম', 'corn', 'ভুট্টা'
      ]
    },
    {
      categoryName: 'Oil & Spices',
      keywords: [
        'oil', 'তেল', 'soybean', 'সয়াবিন', 'mustard', 'সরিষা', 'ghee', 'ঘি', 'masala', 'মসলা',
        'turmeric', 'হলুদ', 'chilli', 'chili', 'মরিচ', 'coriander', 'ধনিয়া', 'cumin', 'জিরা',
        'spice', 'বিরিয়ানি', 'biryani', 'radhuni', 'রাঁধুনী', 'rupchanda', 'রূপচাঁদা'
      ]
    },
    {
      categoryName: 'Groceries',
      keywords: [
        'atta', 'আটা', 'maida', 'ময়দা', 'suji', 'সুজি', 'sugar', 'চিনি', 'salt', 'লবণ',
        'lobon', 'teer', 'fresh', 'aci pure', 'পুষ্টি', 'teer', 'তীর'
      ]
    },
    {
      categoryName: 'Beverages',
      keywords: [
        'tea', 'চা', 'ispahani', 'taaza', 'কফি', 'coffee', 'nescafe', 'juice', 'জুস',
        'frooto', 'ম্যাঙ্গো', 'drink', 'শরবত', 'coke', 'coca-cola', 'কোক', 'pepsi', 'পেপসি',
        '7up', 'seven up', 'mojo', 'মোজো', 'sprite', 'water', 'পানি', 'mum', 'kinley',
        'horlicks', 'হরলিক্স', 'tang', 'ট্যাং'
      ]
    },
    {
      categoryName: 'Snacks & Bakery',
      keywords: [
        'noodles', 'নুডলস', 'maggi', 'ম্যাগি', 'biscuit', 'বিস্কুট', 'energy plus', 'tip',
        'cream cracker', 'oreo', 'chips', 'চিপস', 'lays', 'chanachur', 'চানাচুর', 'ring chips',
        'chocolate', 'চকলেট', 'cadbury', 'kitkat', 'কিটক্যাট', 'cake', 'কেক', 'cookie', 'কুকিজ',
        'bread', 'পাউরুটি', 'toast', 'টোস্ট'
      ]
    },
    {
      categoryName: 'Dairy & Eggs',
      keywords: [
        'milk', 'দুধ', 'dano', 'ডানো', 'marks', 'মার্কস', 'aarong', 'আড়ং', 'egg', 'ডিম',
        'dim', 'curd', 'দই', 'butter', 'মাখন', 'cheese', 'পনির'
      ]
    },
    {
      categoryName: 'Personal Care',
      keywords: [
        'soap', 'সাবান', 'lux', 'লাক্স', 'lifebuoy', 'লাইফবয়', 'dettol', 'ডেটল', 'savlon',
        'স্যাভলন', 'dove', 'ডাভ', 'shampoo', 'শ্যাম্পু', 'sunsilk', 'সানসিল্ক', 'clear', 'ক্লিয়ার',
        'head & shoulders', 'হেড অ্যান্ড শোল্ডারস', 'toothpaste', 'টুথপেস্ট', 'close up', 'ক্লোজ আপ',
        'colgate', 'কোলগেট', 'pepsodent', 'পেপসোডেন্ট', 'toothbrush', 'টুথব্রাশ', 'coconut oil',
        'নারিকেল তেল', 'parachute', 'প্যারাসুট', 'vaseline', 'ভ্যাসলিন', 'gillette', 'জিলেট',
        'razor', 'রেজার', 'lotion', 'লোশন', 'cream', 'ক্রিম'
      ]
    },
    {
      categoryName: 'Cleaning & Household',
      keywords: [
        'detergent', 'ডিটারজেন্ট', 'wheel', 'হুইল', 'surf excel', 'সার্ফ এক্সেল', 'rin', 'রিন',
        'dishwash', 'ডিশওয়াশ', 'vim', 'ভিম', 'harpic', 'হারপিক', 'toilet cleaner', 'টয়লেট ক্লিনার',
        'lizol', 'লাইজল', 'floor cleaner', 'tissue', 'টিস্যু', 'bashundhara', 'বসুন্ধরা',
        'coil', 'কয়েল', 'mortein', 'মর্টিন', 'air freshener', 'odonil'
      ]
    },
    {
      categoryName: 'Mobile & Accessories',
      keywords: [
        'mobile', 'মোবাইল', 'phone', 'ফোন', 'smartphone', 'স্মার্টফোন', 'samsung', 'স্যামসাং',
        'walton', 'ওয়ালটন', 'symphony', 'সিম্ফনি', 'charger', 'চার্জার', 'cable', 'কেবল',
        'remax', 'power bank', 'পাওয়ার ব্যাংক', 'joyroom', 'earbuds', 'এয়ারবাড', 'airpods',
        'microsd', 'memory card', 'মেমোরি কার্ড', 'sandisk', 'সানডিস্ক', 'cover', 'glass'
      ]
    },
    {
      categoryName: 'Computers & IT',
      keywords: [
        'computer', 'কম্পিউটার', 'laptop', 'ল্যাপটপ', 'pc', 'পিসি', 'monitor', 'মনিটর',
        'mouse', 'মাউস', 'havit', 'keyboard', 'কিবোর্ড', 'a4tech', 'ssd', 'এসএসডি',
        'ram', 'র‍্যাম', 'wd', 'western digital', 'router', 'রাউটার', 'tp-link', 'টিপি-লিংক',
        'printer', 'প্রিন্টার'
      ]
    },
    {
      categoryName: 'Electronics & Gadgets',
      keywords: [
        'tv', 'টিভি', 'led tv', 'television', 'টেলিভিশন', 'fridge', 'ফ্রিজ', 'refrigerator',
        'ac', 'এসি', 'air conditioner', 'fan', 'ফ্যান', 'blender', 'ব্লেন্ডার', 'vision', 'ভিশন',
        'singer', 'সিঙ্গার', 'iron', 'আয়রন', 'heater', 'ওভেন', 'oven'
      ]
    },
    {
      categoryName: 'Medicine & Healthcare',
      keywords: [
        'tablet', 'ট্যাবলেট', 'capsule', 'ক্যাপসুল', 'napa', 'নাপা', 'ace', 'এইস',
        'paracetamol', 'প্যারাসিটামল', 'seclo', 'সেকলো', 'sergel', 'সার্জেল', 'fexo', 'ফেক্সো',
        'gastric', 'গ্যাস্ট্রিক', 'syrup', 'সিরাপ', 'bandage', 'ব্যান্ডেজ', 'hansaplast',
        'হ্যানসাপ্লাস্ট', 'dropper', 'ড্রপ', 'ইনসুলিন', 'থার্মোমিটার', 'ফার্মেসি', 'ঔষধ'
      ]
    },
    {
      categoryName: 'Clothing & Fashion',
      keywords: [
        'shirt', 'শার্ট', 'pant', 'প্যান্ট', 'panjabi', 'পাঞ্জাবি', 'saree', 'শাড়ি',
        't-shirt', 'টি-শার্ট', 'lungi', 'লুঙ্গি', 'shoe', 'জুতা', 'sandal', 'স্যান্ডেল', 'জামা'
      ]
    },
    {
      categoryName: 'Stationery & Office',
      keywords: [
        'khata', 'খাতা', 'pen', 'কলম', 'pencil', 'পেন্সিল', 'paper', 'কাগজ', 'dianry',
        'ডায়েরি', 'বই', 'book', 'stapler', 'file', 'ফাইল'
      ]
    }
  ];

  // Match keyword against rules
  for (const rule of categoryRules) {
    const hasMatch = rule.keywords.some(kw => query.includes(kw.toLowerCase()));
    if (hasMatch) {
      // Find matching category in user's availableCategories
      const matched = availableCategories.find(c =>
        c.name.toLowerCase() === rule.categoryName.toLowerCase() ||
        (c.banglaName && c.banglaName.toLowerCase().includes(rule.categoryName.toLowerCase())) ||
        rule.keywords.some(kw => c.name.toLowerCase().includes(kw) || (c.banglaName && c.banglaName.includes(kw)))
      );
      if (matched) return matched.name;

      // Fallback: if category exists by name
      const direct = availableCategories.find(c => c.name.toLowerCase().includes(rule.categoryName.toLowerCase()));
      if (direct) return direct.name;
    }
  }

  return availableCategories[0]?.name || 'Groceries';
}

/**
 * Filter popular product catalog by starting letter or search text
 */
export function getProductSuggestions(
  query: string,
  existingProducts: { name: string; banglaName?: string; category: string; brand?: string; unit?: string; purchasePrice?: number; sellingPrice?: number }[] = [],
  maxResults = 10
): ProductSuggestion[] {
  if (!query || !query.trim()) {
    return POPULAR_PRODUCT_CATALOG.slice(0, maxResults);
  }

  const q = query.trim().toLowerCase();

  // Combine user's existing products with catalog
  const userSuggestions: ProductSuggestion[] = existingProducts.map((p, idx) => ({
    id: `user-prod-${idx}`,
    name: p.name,
    banglaName: p.banglaName || p.name,
    category: p.category,
    categoryBn: p.category,
    brand: p.brand || '',
    unit: p.unit || 'পিস',
    purchasePrice: p.purchasePrice || 0,
    sellingPrice: p.sellingPrice || 0,
    keywords: [p.name.toLowerCase(), (p.banglaName || '').toLowerCase(), (p.brand || '').toLowerCase()]
  }));

  const allPool = [...userSuggestions, ...POPULAR_PRODUCT_CATALOG];

  // Unique by lowercase name
  const seen = new Set<string>();
  const uniquePool: ProductSuggestion[] = [];
  for (const item of allPool) {
    const key = item.name.toLowerCase().trim();
    if (!seen.has(key)) {
      seen.add(key);
      uniquePool.push(item);
    }
  }

  // Rank by:
  // 1. Starts with query in English or Bengali (First letter / Prefix match)
  // 2. Contains query
  const startsWithList: ProductSuggestion[] = [];
  const containsList: ProductSuggestion[] = [];

  for (const item of uniquePool) {
    const nameLow = item.name.toLowerCase();
    const bnLow = (item.banglaName || '').toLowerCase();
    const brandLow = (item.brand || '').toLowerCase();

    const isStartsWith =
      nameLow.startsWith(q) ||
      bnLow.startsWith(q) ||
      brandLow.startsWith(q) ||
      item.keywords.some(k => k.startsWith(q));

    if (isStartsWith) {
      startsWithList.push(item);
    } else if (
      nameLow.includes(q) ||
      bnLow.includes(q) ||
      brandLow.includes(q) ||
      item.keywords.some(k => k.includes(q))
    ) {
      containsList.push(item);
    }

    if (startsWithList.length >= maxResults * 2) break;
  }

  return [...startsWithList, ...containsList].slice(0, maxResults);
}
