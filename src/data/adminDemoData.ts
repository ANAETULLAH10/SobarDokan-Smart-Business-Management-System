import {
  Employee,
  AttendanceRecord,
  WarrantyItem,
  WarrantyClaim,
  AppUser,
  SubscriptionPlan,
  BillingInvoice,
  SupportTicket
} from '../types';

export const defaultEmployees: Employee[] = [
  {
    id: 'emp-1',
    name: 'মো: কামাল হোসেন',
    designation: 'ম্যানেজার ও সিনিয়র ক্যাশিয়ার',
    department: 'ম্যানেজমেন্ট',
    phone: '01711-234567',
    email: 'kamal@amardokan.com',
    salary: 25000,
    salaryType: 'monthly',
    joiningDate: '2024-01-15',
    status: 'active'
  },
  {
    id: 'emp-2',
    name: 'সাকিব আল হাসান',
    designation: 'সিনিয়র সেলস এক্সিকিউটিভ',
    department: 'সেলস ও আউটলেট',
    phone: '01822-345678',
    email: 'sakib@amardokan.com',
    salary: 18000,
    salaryType: 'monthly',
    joiningDate: '2024-03-01',
    status: 'active'
  },
  {
    id: 'emp-3',
    name: 'তানভীর আহমেদ',
    designation: 'স্টোর কিপার ও ইনভেন্টরি',
    department: 'ইনভেন্টরি ও গোডাউন',
    phone: '01933-456789',
    salary: 16000,
    salaryType: 'monthly',
    joiningDate: '2024-05-10',
    status: 'active'
  },
  {
    id: 'emp-4',
    name: 'ফাতিমা আক্তার',
    designation: 'অ্যাকাউন্ট্যান্ট ও লেজার অফিসার',
    department: 'হিসাব ও অডিট',
    phone: '01644-567890',
    email: 'fatima@amardokan.com',
    salary: 20000,
    salaryType: 'monthly',
    joiningDate: '2024-02-20',
    status: 'active'
  },
  {
    id: 'emp-5',
    name: 'আরিফুর রহমান',
    designation: 'ডেলিভারি ও সাপোর্ট অ্যাসিস্ট্যান্ট',
    department: 'ডেলিভারি',
    phone: '01555-678901',
    salary: 14000,
    salaryType: 'monthly',
    joiningDate: '2024-06-01',
    status: 'active'
  }
];

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

export const defaultAttendanceRecords: AttendanceRecord[] = [
  {
    id: 'att-1',
    employeeId: 'emp-1',
    employeeName: 'মো: কামাল হোসেন',
    date: today,
    checkInTime: '09:05 AM',
    checkOutTime: '',
    status: 'present',
    workingHours: 0,
    notes: 'সময়মতো স্টোরে উপস্থিতি'
  },
  {
    id: 'att-2',
    employeeId: 'emp-2',
    employeeName: 'সাকিব আল হাসান',
    date: today,
    checkInTime: '09:35 AM',
    checkOutTime: '',
    status: 'late',
    workingHours: 0,
    notes: 'জ্যামের কারণে ২৫ মিনিট লেট'
  },
  {
    id: 'att-3',
    employeeId: 'emp-3',
    employeeName: 'তানভীর আহমেদ',
    date: today,
    checkInTime: '08:58 AM',
    checkOutTime: '',
    status: 'present',
    workingHours: 0,
    notes: 'সকালে গোডাউন স্টক যাচাই'
  },
  {
    id: 'att-4',
    employeeId: 'emp-4',
    employeeName: 'ফাতিমা আক্তার',
    date: today,
    checkInTime: '09:00 AM',
    checkOutTime: '',
    status: 'present',
    workingHours: 0,
    notes: 'দৈনিক ব্যাংক রিকনসিলিয়েশন'
  },
  {
    id: 'att-5',
    employeeId: 'emp-5',
    employeeName: 'আরিফুর রহমান',
    date: today,
    status: 'leave',
    notes: 'জরুরি পারিবারিক কারণে ছুটি অনুমোদিত'
  },
  // Yesterday's records
  {
    id: 'att-6',
    employeeId: 'emp-1',
    employeeName: 'মো: কামাল হোসেন',
    date: yesterday,
    checkInTime: '09:00 AM',
    checkOutTime: '08:15 PM',
    status: 'present',
    workingHours: 11.25,
    notes: 'স্টোর ক্লোজিং পর্যন্ত দায়িত্ব পালন'
  },
  {
    id: 'att-7',
    employeeId: 'emp-2',
    employeeName: 'সাকিব আল হাসান',
    date: yesterday,
    checkInTime: '09:10 AM',
    checkOutTime: '08:00 PM',
    status: 'present',
    workingHours: 10.8,
    notes: 'দৈনিক বিক্রয় কোটা পূরণ'
  }
];

export const defaultWarrantyItems: WarrantyItem[] = [
  {
    id: 'war-1',
    invoiceId: 'INV-1001',
    productId: 'prod-3',
    productName: 'Samsung 24" Borderless IPS Monitor',
    serialNumber: 'SN-SAM24-884920',
    barcode: '894110012347',
    customerName: 'রফিকুল ইসলাম',
    customerPhone: '01711-223344',
    purchaseDate: '2024-04-10',
    warrantyPeriodMonths: 36,
    warrantyExpiryDate: '2027-04-10',
    status: 'active'
  },
  {
    id: 'war-2',
    invoiceId: 'INV-1002',
    productId: 'prod-4',
    productName: 'Walton Inverter Smart Refrigerator 320L',
    serialNumber: 'SN-WAL98-442109',
    barcode: '894110012348',
    customerName: 'আনোয়ার হোসেন',
    customerPhone: '01819-887766',
    purchaseDate: '2024-01-20',
    warrantyPeriodMonths: 60,
    warrantyExpiryDate: '2029-01-20',
    status: 'active'
  },
  {
    id: 'war-3',
    invoiceId: 'INV-1003',
    productId: 'prod-5',
    productName: 'HP Wireless Mouse & Keyboard Combo',
    serialNumber: 'SN-HPW-991244',
    barcode: '894110012349',
    customerName: 'তানিয়া আক্তার',
    customerPhone: '01912-334455',
    purchaseDate: '2024-08-15',
    warrantyPeriodMonths: 12,
    warrantyExpiryDate: '2025-08-15',
    status: 'active'
  },
  {
    id: 'war-4',
    invoiceId: 'INV-0985',
    productId: 'prod-6',
    productName: 'Gree 1.5 Ton Split Inverter Air Conditioner',
    serialNumber: 'SN-GRE15-776201',
    barcode: '894110012350',
    customerName: 'মাহবুব আলম',
    customerPhone: '01755-998877',
    purchaseDate: '2023-09-01',
    warrantyPeriodMonths: 36,
    warrantyExpiryDate: '2026-09-01',
    status: 'expiring_soon'
  },
  {
    id: 'war-5',
    invoiceId: 'INV-0820',
    productId: 'prod-7',
    productName: 'TP-Link Archer Gigabit Dual Band Router',
    serialNumber: 'SN-TPL88-331209',
    barcode: '894110012351',
    customerName: 'জাহিদুল ইসলাম',
    customerPhone: '01688-443322',
    purchaseDate: '2023-01-05',
    warrantyPeriodMonths: 12,
    warrantyExpiryDate: '2024-01-05',
    status: 'expired'
  }
];

export const defaultWarrantyClaims: WarrantyClaim[] = [
  {
    id: 'claim-1',
    warrantyItemId: 'war-1',
    customerName: 'রফিকুল ইসলাম',
    customerPhone: '01711-223344',
    productName: 'Samsung 24" Borderless IPS Monitor',
    serialNumber: 'SN-SAM24-884920',
    issueDescription: 'ডিসপ্লেতে হঠাৎ লাল রঙের ভার্টিক্যাল লাইন আসছে এবং মাঝে মাঝে স্ক্রিন ফ্লিকার করছে।',
    claimDate: today,
    estimatedReturnDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    status: 'under_repair',
    technicianNotes: 'স্যামসাং সার্ভিস সেন্টারে পাঠানো হয়েছে। প্যানেল টেস্ট চলমান।'
  },
  {
    id: 'claim-2',
    warrantyItemId: 'war-3',
    customerName: 'তানিয়া আক্তার',
    customerPhone: '01912-334455',
    productName: 'HP Wireless Mouse & Keyboard Combo',
    serialNumber: 'SN-HPW-991244',
    issueDescription: 'মাউসের রাইট বাটন ক্লিক মাঝে মাঝে কাজ করে না।',
    claimDate: yesterday,
    estimatedReturnDate: today,
    status: 'repaired',
    technicianNotes: 'মাইক্রো সুইচ পরিবর্তন করে টেস্ট সম্পন্ন। পণ্য হস্তান্তরের জন্য প্রস্তুত।'
  }
];

export const defaultAppUsers: AppUser[] = [
  {
    id: 'usr-1',
    name: 'MD ANAETULLAH',
    phone: '01700-000000',
    email: 'mdanaetullah2021@gmail.com',
    role: 'admin',
    pin: '1234',
    status: 'active',
    permissions: {
      canPos: true,
      canDiscount: true,
      canEditProducts: true,
      canViewReports: true,
      canDeleteRecords: true,
      canAccessSettings: true
    },
    lastActive: 'এখন সক্রিয়',
    createdAt: '2024-01-01'
  },
  {
    id: 'usr-2',
    name: 'মো: কামাল হোসেন',
    phone: '01711-234567',
    email: 'kamal@amardokan.com',
    role: 'manager',
    pin: '4321',
    status: 'active',
    permissions: {
      canPos: true,
      canDiscount: true,
      canEditProducts: true,
      canViewReports: true,
      canDeleteRecords: false,
      canAccessSettings: false
    },
    lastActive: '১০ মিনিট আগে',
    createdAt: '2024-01-15'
  },
  {
    id: 'usr-3',
    name: 'সাকিব আল হাসান',
    phone: '01822-345678',
    email: 'sakib@amardokan.com',
    role: 'cashier',
    pin: '1122',
    status: 'active',
    permissions: {
      canPos: true,
      canDiscount: false,
      canEditProducts: false,
      canViewReports: false,
      canDeleteRecords: false,
      canAccessSettings: false
    },
    lastActive: 'আজ সকাল ০৯:৩০',
    createdAt: '2024-03-01'
  },
  {
    id: 'usr-4',
    name: 'তানভীর আহমেদ',
    phone: '01933-456789',
    email: 'tanveer@amardokan.com',
    role: 'salesperson',
    pin: '3344',
    status: 'active',
    permissions: {
      canPos: true,
      canDiscount: false,
      canEditProducts: true,
      canViewReports: false,
      canDeleteRecords: false,
      canAccessSettings: false
    },
    lastActive: 'গতকাল',
    createdAt: '2024-05-10'
  }
];

export const defaultSubscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'plan-starter',
    name: 'Starter Basic',
    banglaName: 'ফ্রি স্টার্টার',
    price: 0,
    billingCycle: 'monthly',
    features: [
      '১টি ক্যাশ কাউন্টার / ইউজার',
      'সর্বোচ্চ ১০০টি পণ্য সংরক্ষণ',
      'বেসিক POS ক্যাশ মেমো প্রিন্ট',
      'বকেয়া খাতা ও হিসাব সংরক্ষণ',
      'সাধারণ রিপোর্ট ও বিক্রয় তালিকা'
    ]
  },
  {
    id: 'plan-pro',
    name: 'Pro Business (অমরদোকান স্পেশাল)',
    banglaName: 'প্রো বিজনেস প্ল্যান',
    price: 999,
    billingCycle: 'monthly',
    isPopular: true,
    features: [
      'আনলিমিটেড পণ্য ও স্টক ট্র্যাকিং',
      'আনলিমিটেড কর্মী ও ক্যাশিয়ার একাউন্ট',
      'বারকোড স্ক্যানার ও লেবেল প্রিন্ট',
      'অটোমেটিক SMS তাগাদা ও মার্কেটিং',
      'ওয়ারেন্টি ট্র্যাকিং ও ক্লেইম রেজিস্টার',
      'স্টাফ হাজিরা ও অ্যাটেনডেন্স ক্যালকুলেটর',
      'মাসিক লাভ-লোকসান ও আর্থিক এনালাইটিক্স',
      'সার্ভার ক্লাউড ব্যাকআপ ও ডাটা সুরক্ষা'
    ]
  },
  {
    id: 'plan-enterprise',
    name: 'Enterprise Chain',
    banglaName: 'এন্টারপ্রাইজ চেইন',
    price: 2499,
    billingCycle: 'monthly',
    features: [
      'মাল্টি-ব্রাঞ্চ ও বহু শপ সেন্ট্রাল কন্ট্রোল',
      '২৪/৭ ভিআইপি ডেডিকেটেড ফোন ও হোয়াটসঅ্যাপ সাপোর্ট',
      'কাস্টম ডোমেইন ও নিজস্ব ব্র্যান্ডেড মেমো',
      'রিয়েলটাইম ইনভেন্টরি ট্র্যাকিং এক ব্রাঞ্চ থেকে অন্য ব্রাঞ্চ',
      'অটোমেটিক অ্যাকাউন্টিং ও ভ্যাট রিপোর্ট এক্সপোর্ট'
    ]
  }
];

export const defaultBillingInvoices: BillingInvoice[] = [
  {
    id: 'inv-sub-1',
    invoiceNumber: 'SUB-2024-0891',
    date: '২০২৪-০৭-০১',
    planName: 'Pro Business (বার্ষিক লাইসেন্স প্যাকেজ)',
    amount: 9990,
    status: 'paid',
    paymentMethod: 'bKash'
  },
  {
    id: 'inv-sub-2',
    invoiceNumber: 'SMS-2024-0412',
    date: '২০২৪-০৮-১৫',
    planName: '১,৫০০ SMS রিচার্জ বান্ডেল প্যাক',
    amount: 650,
    status: 'paid',
    paymentMethod: 'Nagad'
  }
];

export const defaultSupportTickets: SupportTicket[] = [
  {
    id: 'tkt-1',
    ticketNumber: 'TKT-88410',
    subject: 'POS-80 থার্মাল প্রিন্টারে বাংলা ফন্ট প্রিন্টিং কনফিগারেশন',
    category: 'printer',
    priority: 'high',
    description: 'আমাদের ৮৮ মিমি থার্মাল প্রিন্টারে মেমো প্রিন্ট করার সময় বাংলা অক্ষর ভাঙা আসছে। ESC/POS ড্রাইভার কীভাবে সেট করব?',
    status: 'resolved',
    createdAt: '2024-08-10 11:30 AM',
    updatedAt: '2024-08-10 01:15 PM',
    response: 'সমস্যাটি সমাধানের জন্য মেমো প্রিন্ট সেটিংসে "ESC/POS Raster Mode" চালু করে দেওয়া হয়েছে। এখন সম্পূর্ণ ঝকঝকে বাংলা ফন্ট প্রিন্ট হচ্ছে।'
  },
  {
    id: 'tkt-2',
    ticketNumber: 'TKT-88425',
    subject: 'বারকোড স্ক্যানার অটো এন্টার কি (Auto-Enter) কাজ করছে না',
    category: 'scanner',
    priority: 'medium',
    description: 'হ্যান্ডহেল্ড বারকোড স্ক্যানার দিয়ে স্ক্যান করলে কোড উঠছে কিন্তু স্বয়ংক্রিয়ভাবে সার্চ সাবমিট বা কার্টে অ্যাড হচ্ছে না।',
    status: 'in_progress',
    createdAt: '2024-08-28 04:20 PM',
    updatedAt: '2024-08-28 05:00 PM',
    response: 'টেকনিক্যাল টিম বিষয়টি পর্যবেক্ষণ করছে। স্ক্যানার ম্যানুয়ালের "Add Suffix Enter CR/LF" বারকোডটি স্ক্যান করার পরামর্শ দেওয়া হয়েছে।'
  }
];
