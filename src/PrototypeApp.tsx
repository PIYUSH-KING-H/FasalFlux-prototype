import { createContext, useContext, useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Bell,
  Building2,
  CalendarDays,
  Check,
  CloudSun,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  FileText,
  IndianRupee,
  LayoutDashboard,
  Leaf,
  Menu,
  MoreHorizontal,
  PackageCheck,
  Phone,
  Plus,
  QrCode,
  Search,
  Settings,
  ShieldCheck,
  Sprout,
  Truck,
  UserCheck,
  UserPlus,
  Users,
  X,
  Wheat,
  MapPin,
  MessageSquareText,
  LocateFixed,
} from "lucide-react";
import "./prototype.css";

type Role = "admin" | "mandi_official" | "farmer";
type Language = "en" | "hi" | "ta";
type AdminView = "dashboard" | "officials" | "mandis" | "activity";
type MandiView = "dashboard" | "farmers" | "queue" | "payments";
type FarmerView = "home" | "book" | "history" | "help" | "weather";
type Status = "booked" | "checked-in" | "weighing" | "procurement" | "paid";

type Booking = {
  id: number;
  farmer: string;
  village: string;
  crop: string;
  quantity: number;
  token: string;
  slot: string;
  status: Status;
  amount: number;
  phone: string;
};

type Official = {
  id: number;
  name: string;
  mandi: string;
  phone: string;
  status: "active" | "pending";
  lastActive: string;
};

type WeatherData = {
  location: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  rainChance: number;
  condition: string;
  source: "gps" | "demo";
  updatedAt: string;
};

type BookingReceipt = Booking & { qrDataUrl: string };

const demoWeather: WeatherData = {
  location: "Khandwa",
  temperature: 29,
  feelsLike: 31,
  humidity: 61,
  windSpeed: 12,
  rainChance: 24,
  condition: "Partly cloudy",
  source: "demo",
  updatedAt: "Demo location",
};

const seedBookings: Booking[] = [
  {
    id: 1,
    farmer: "Ramesh Kumar",
    village: "Rampur",
    crop: "Wheat",
    quantity: 12.5,
    token: "FF-041",
    slot: "09:00 - 10:00 AM",
    status: "checked-in",
    amount: 26250,
    phone: "98765 43210",
  },
  {
    id: 2,
    farmer: "Sita Devi",
    village: "Khera",
    crop: "Tomato",
    quantity: 4.2,
    token: "FF-042",
    slot: "09:00 - 10:00 AM",
    status: "weighing",
    amount: 8820,
    phone: "98111 22334",
  },
  {
    id: 3,
    farmer: "Harpreet Singh",
    village: "Chandpur",
    crop: "Mustard",
    quantity: 8.8,
    token: "FF-043",
    slot: "10:00 - 11:00 AM",
    status: "booked",
    amount: 18480,
    phone: "99887 66554",
  },
  {
    id: 4,
    farmer: "Meena Patel",
    village: "Lakshmi Nagar",
    crop: "Onion",
    quantity: 6.4,
    token: "FF-044",
    slot: "10:00 - 11:00 AM",
    status: "booked",
    amount: 13440,
    phone: "98989 12121",
  },
  {
    id: 5,
    farmer: "Amit Yadav",
    village: "Basantpur",
    crop: "Wheat",
    quantity: 15,
    token: "FF-045",
    slot: "11:00 AM - 12:00 PM",
    status: "procurement",
    amount: 31500,
    phone: "97654 88776",
  },
];

const seedOfficials: Official[] = [
  {
    id: 1,
    name: "Arjun Rao",
    mandi: "Mandi Khandwa",
    phone: "98765 10001",
    status: "active",
    lastActive: "Now",
  },
  {
    id: 2,
    name: "Priya Sharma",
    mandi: "Mandi Indore",
    phone: "98765 10002",
    status: "active",
    lastActive: "4 min ago",
  },
  {
    id: 3,
    name: "Vikram Singh",
    mandi: "Mandi Dewas",
    phone: "98765 10003",
    status: "pending",
    lastActive: "Invite sent",
  },
];

const statusLabels: Record<Status, string> = {
  booked: "Booked",
  "checked-in": "Checked in",
  weighing: "At weighbridge",
  procurement: "Procurement",
  paid: "Paid",
};
const statusTone: Record<Status, string> = {
  booked: "blue",
  "checked-in": "green",
  weighing: "amber",
  procurement: "violet",
  paid: "green",
};

const translations: Record<Language, Record<string, string>> = {
  en: {},
  hi: {
    Notifications: "सूचनाएं",
    "2 updates waiting for your review.": "आपकी समीक्षा के लिए 2 अपडेट हैं।",
    "All notifications are up to date.": "सभी सूचनाएं अपडेट हैं।",
    "Mark as read": "पढ़ा हुआ चिह्नित करें",
    "Profile settings opened.": "प्रोफ़ाइल सेटिंग्स खोली गईं।",
    "Profile settings": "प्रोफ़ाइल सेटिंग्स",
    "BOOKING CONFIRMED": "बुकिंग की पुष्टि हुई",
    "Your digital mandi token is ready": "आपका डिजिटल मंडी टोकन तैयार है",
    "Show this QR at the mandi entry counter.":
      "मंडी प्रवेश काउंटर पर यह QR दिखाएं।",
    "Booking QR code": "बुकिंग QR कोड",
    Mandi: "मंडी",
    "Arrival slot": "आगमन स्लॉट",
    Produce: "उपज",
    "Digital receipt secured": "डिजिटल रसीद सुरक्षित है",
    "This token can be verified by the mandi official.":
      "इस टोकन को मंडी अधिकारी सत्यापित कर सकते हैं।",
    "Print receipt": "रसीद प्रिंट करें",
    Done: "हो गया",
    Weather: "मौसम",
    "FARMER WEATHER": "किसान मौसम",
    "Weather & farm advisory": "मौसम और खेती सलाह",
    "Plan your field work and mandi visit with local weather information.":
      "स्थानीय मौसम जानकारी से खेत का काम और मंडी यात्रा की योजना बनाएं।",
    "Use my GPS location": "मेरी GPS लोकेशन इस्तेमाल करें",
    "Updating...": "अपडेट हो रहा है...",
    "Weather data from your GPS location": "आपकी GPS लोकेशन से मौसम डेटा",
    "Demo location · allow GPS for local weather":
      "डेमो लोकेशन · स्थानीय मौसम के लिए GPS अनुमति दें",
    "GPS location": "GPS लोकेशन",
    "Demo data": "डेमो डेटा",
    "CURRENT WEATHER": "वर्तमान मौसम",
    "Feels like": "महसूस होता है",
    Updated: "अपडेट किया गया",
    "Live conditions": "लाइव स्थिति",
    "Partly cloudy": "आंशिक बादल",
    Humidity: "नमी",
    "Wind speed": "हवा की गति",
    "Rain chance": "बारिश की संभावना",
    "Best travel window": "यात्रा का अच्छा समय",
    "After 4 PM": "शाम 4 बजे के बाद",
    "Now - 4 PM": "अभी - शाम 4 बजे",
    "CROP ADVISORY": "फसल सलाह",
    "Rain expected": "बारिश की संभावना",
    "Avoid spraying and cover harvested produce today.":
      "आज छिड़काव से बचें और कटी हुई उपज को ढककर रखें।",
    "Good for field work": "खेत के काम के लिए अच्छा",
    "A suitable window for inspection, harvesting and mandi travel.":
      "निरीक्षण, कटाई और मंडी यात्रा के लिए अच्छा समय।",
    "Save advice": "सलाह सेव करें",
    "Crop advisory saved for your next visit.":
      "आपकी अगली यात्रा के लिए फसल सलाह सेव हो गई।",
    "WHY THIS HELPS": "यह कैसे मदद करता है",
    "Weather-aware farming": "मौसम के अनुसार खेती",
    "Use the local forecast to decide when to harvest, cover produce and travel to the mandi.":
      "स्थानीय पूर्वानुमान से तय करें कि कब कटाई, उपज को ढकना और मंडी जाना है।",
    "Location is refreshed from GPS when you update":
      "अपडेट करने पर लोकेशन GPS से ताज़ा होती है",
    "LOCATION PRIVACY": "लोकेशन गोपनीयता",
    "Your location stays in this session": "आपकी लोकेशन इसी सत्र में रहती है",
    "FasalFlux uses your location only to show nearby weather and does not save your exact coordinates.":
      "FasalFlux आपकी लोकेशन का उपयोग केवल पास का मौसम दिखाने के लिए करता है और सटीक निर्देशांक सेव नहीं करता।",
    "GPS permission is optional": "GPS अनुमति वैकल्पिक है",
    "Command centre": "कमांड सेंटर",
    "Mandi officials": "मंडी अधिकारी",
    "Mandi network": "मंडी नेटवर्क",
    "Activity log": "गतिविधि लॉग",
    "Today's operations": "आज का संचालन",
    Farmers: "किसान",
    "Live queue": "लाइव कतार",
    Payments: "भुगतान",
    "My harvest": "मेरी फसल",
    "Book a mandi slot": "मंडी स्लॉट बुक करें",
    "My records": "मेरे रिकॉर्ड",
    "Help centre": "सहायता केंद्र",
    Settings: "सेटिंग्स",
    Support: "सहायता",
    WORKSPACE: "कार्यस्थल",
    SYSTEM: "सिस्टम",
    "VIEWING AS": "इस रूप में देख रहे हैं",
    Admin: "एडमिन",
    "Mandi official": "मंडी अधिकारी",
    Farmer: "किसान",
    "Search farmers, tokens...": "किसान, टोकन खोजें...",
    "DEMO ROLE": "डेमो भूमिका",
    "Built for trust": "विश्वास के लिए बनाया गया",
    "Transparent mandi operations": "पारदर्शी मंडी संचालन",
    "Good morning, Neha.": "सुप्रभात, नेहा।",
    "Good morning, Arjun.": "सुप्रभात, अर्जुन।",
    "Good morning, Ramesh.": "सुप्रभात, रमेश।",
    "Open mandi view": "मंडी व्यू खोलें",
    "Add official": "अधिकारी जोड़ें",
    "Register farmer": "किसान पंजीकृत करें",
    "Book a new slot": "नया स्लॉट बुक करें",
    "View full queue": "पूरी कतार देखें",
    "Process next payment": "अगला भुगतान करें",
    "Start booking": "बुकिंग शुरू करें",
    "Platform overview": "प्लेटफॉर्म अवलोकन",
    "People & access": "लोग और एक्सेस",
    "Farmer directory": "किसान निर्देशिका",
    "Real-time operations": "रीयल-टाइम संचालन",
    "Transparent procurement": "पारदर्शी खरीद",
    "Smart arrival planning": "स्मार्ट आगमन योजना",
    "Your records": "आपके रिकॉर्ड",
    "Farmer support": "किसान सहायता",
    "Farmers at Mandi Khandwa": "मंडी खंडवा के किसान",
    "Live mandi queue": "मंडी की लाइव कतार",
    "Payments & procurement": "भुगतान और खरीद",
    "Farmers needing attention": "ध्यान देने वाले किसान",
    "Mandi readiness": "मंडी की तैयारी",
    "Today's flow": "आज का प्रवाह",
    "Book your mandi slot": "अपना मंडी स्लॉट बुक करें",
    "Harvest history": "फसल इतिहास",
    "Your next arrival": "आपका अगला आगमन",
    Active: "सक्रिय",
    Pending: "लंबित",
    Approve: "स्वीकृत करें",
    "Today at a glance": "आज की झलक",
    Booked: "बुक किया गया",
    "Checked in": "चेक-इन",
    "At weighbridge": "वेटब्रिज पर",
    Procurement: "खरीद प्रक्रिया",
    Paid: "भुगतान हो गया",
    "Every harvest, on time.": "हर फसल, समय पर।",
    "Across the FasalFlux network": "पूरे FasalFlux नेटवर्क में",
    "connected mandis": "जुड़ी हुई मंडियां",
    "Network health": "नेटवर्क स्वास्थ्य",
    "Mandi uptime": "मंडी अपटाइम",
    "Farmers served": "सेवा प्राप्त किसान",
    "Payments reconciled": "भुगतान मिलान",
    "Audit trail": "ऑडिट ट्रेल",
    "Export log": "लॉग एक्सपोर्ट करें",
    "Quick actions": "त्वरित कार्य",
    "Keep things moving": "काम को आगे बढ़ाएं",
    "Invite a mandi official": "मंडी अधिकारी को आमंत्रित करें",
    "Give a new operator access": "नए ऑपरेटर को एक्सेस दें",
    "Download network report": "नेटवर्क रिपोर्ट डाउनलोड करें",
    "Operations and payment summary": "संचालन और भुगतान सारांश",
    "Contact support": "सहायता से संपर्क करें",
    "Get help with your workspace": "अपने कार्यस्थल की सहायता लें",
    "Recent activity": "हाल की गतिविधि",
    "What needs your attention": "आपके ध्यान की जरूरत",
    "Review invite": "आमंत्रण देखें",
    "View audit log": "ऑडिट लॉग देखें",
    "View network": "नेटवर्क देखें",
    "Network performance": "नेटवर्क प्रदर्शन",
    "Farmers served this week": "इस सप्ताह सेवा प्राप्त किसान",
    "This week": "इस सप्ताह",
    "registered today": "आज पंजीकृत",
    "CROP & LOAD": "फसल और भार",
    "ARRIVAL SLOT": "आगमन स्लॉट",
    STATUS: "स्थिति",
    ACTION: "कार्य",
    "TOKEN / FARMER": "टोकन / किसान",
    CROP: "फसल",
    "TIME SLOT": "समय स्लॉट",
    FARMER: "किसान",
    QUANTITY: "मात्रा",
    VALUE: "मूल्य",
    PAYMENT: "भुगतान",
    "PAID OUT TODAY": "आज भुगतान किया गया",
    "capacity used": "उपयोग की गई क्षमता",
    "One shared view, fewer missed arrivals.":
      "एक साझा दृश्य, कम छूटे हुए आगमन।",
    "Farmers know when to come. Your team knows who is next.":
      "किसानों को आने का समय पता है। आपकी टीम को अगला किसान पता है।",
    "Message farmers": "किसानों को संदेश भेजें",
    "Come when the mandi is ready.": "मंडी तैयार हो तभी आएं।",
    "estimated wait": "अनुमानित प्रतीक्षा",
    "your digital token": "आपका डिजिटल टोकन",
    "No active booking": "कोई सक्रिय बुकिंग नहीं",
    "Your next mandi visit, without the guesswork.":
      "आपकी अगली मंडी यात्रा, बिना किसी अनुमान के।",
    "Prepare for arrival": "आगमन की तैयारी करें",
    "Payment promise": "भुगतान का वादा",
    "Direct, traceable payment after procurement.":
      "खरीद के बाद सीधा और ट्रेस करने योग्य भुगतान।",
    "Choose a time slot": "समय स्लॉट चुनें",
    "Choose an arrival slot": "आगमन स्लॉट चुनें",
    "Spaces available": "स्थान उपलब्ध",
    Cancel: "रद्द करें",
    "Confirm slot": "स्लॉट की पुष्टि करें",
    "Register a farmer": "किसान पंजीकृत करें",
    "Create a farmer record and reserve their first mandi arrival.":
      "किसान रिकॉर्ड बनाएं और उनका पहला मंडी आगमन आरक्षित करें।",
    "Farmer name": "किसान का नाम",
    "Village / location": "गांव / स्थान",
    Crop: "फसल",
    "Expected quantity (tonnes)": "अनुमानित मात्रा (टन)",
    "Mobile number": "मोबाइल नंबर",
    "Send invite": "आमंत्रण भेजें",
    "Mandi assignment": "मंडी नियुक्ति",
    "Full name": "पूरा नाम",
    "Mandi Khandwa": "मंडी खंडवा",
    "Mandi Indore": "मंडी इंदौर",
    "Mandi Dewas": "मंडी देवास",
  },
  ta: {
    Notifications: "அறிவிப்புகள்",
    "2 updates waiting for your review.":
      "உங்கள் பார்வைக்காக 2 புதுப்பிப்புகள் காத்திருக்கின்றன.",
    "All notifications are up to date.":
      "அனைத்து அறிவிப்புகளும் புதுப்பித்த நிலையில் உள்ளன.",
    "Mark as read": "படித்ததாகக் குறிக்கவும்",
    "Profile settings opened.": "சுயவிவர அமைப்புகள் திறக்கப்பட்டன.",
    "Profile settings": "சுயவிவர அமைப்புகள்",
    "BOOKING CONFIRMED": "முன்பதிவு உறுதிசெய்யப்பட்டது",
    "Your digital mandi token is ready": "உங்கள் டிஜிட்டல் மண்டி டோக்கன் தயார்",
    "Show this QR at the mandi entry counter.":
      "மண்டி நுழைவு கவுண்டரில் இந்த QR-ஐக் காட்டவும்.",
    "Booking QR code": "முன்பதிவு QR குறியீடு",
    Mandi: "மண்டி",
    "Arrival slot": "வருகை நேரம்",
    Produce: "விளைபொருள்",
    "Digital receipt secured": "டிஜிட்டல் ரசீது பாதுகாக்கப்பட்டது",
    "This token can be verified by the mandi official.":
      "இந்த டோக்கனை மண்டி அதிகாரி சரிபார்க்கலாம்.",
    "Print receipt": "ரசீதை அச்சிடவும்",
    Done: "முடிந்தது",
    Weather: "வானிலை",
    "FARMER WEATHER": "விவசாயி வானிலை",
    "Weather & farm advisory": "வானிலை மற்றும் விவசாய ஆலோசனை",
    "Plan your field work and mandi visit with local weather information.":
      "உள்ளூர் வானிலை தகவலுடன் வயல் வேலை மற்றும் மண்டி பயணத்தைத் திட்டமிடுங்கள்.",
    "Use my GPS location": "எனது GPS இருப்பிடத்தைப் பயன்படுத்தவும்",
    "Updating...": "புதுப்பிக்கப்படுகிறது...",
    "Weather data from your GPS location":
      "உங்கள் GPS இருப்பிடத்திலிருந்து வானிலை தரவு",
    "Demo location · allow GPS for local weather":
      "டெமோ இருப்பிடம் · உள்ளூர் வானிலைக்கு GPS அனுமதிக்கவும்",
    "GPS location": "GPS இருப்பிடம்",
    "Demo data": "டெமோ தரவு",
    "CURRENT WEATHER": "தற்போதைய வானிலை",
    "Feels like": "உணரப்படும் வெப்பநிலை",
    Updated: "புதுப்பிக்கப்பட்டது",
    "Live conditions": "நேரடி நிலை",
    "Partly cloudy": "சில மேகங்கள்",
    Humidity: "ஈரப்பதம்",
    "Wind speed": "காற்றின் வேகம்",
    "Rain chance": "மழை வாய்ப்பு",
    "Best travel window": "சிறந்த பயண நேரம்",
    "After 4 PM": "மாலை 4 மணிக்குப் பிறகு",
    "Now - 4 PM": "இப்போது - மாலை 4 மணி",
    "CROP ADVISORY": "பயிர் ஆலோசனை",
    "Rain expected": "மழை எதிர்பார்க்கப்படுகிறது",
    "Avoid spraying and cover harvested produce today.":
      "இன்று தெளிப்பதைத் தவிர்த்து அறுவடை செய்த விளைபொருளை மூடி வைக்கவும்.",
    "Good for field work": "வயல் வேலைக்கு ஏற்றது",
    "A suitable window for inspection, harvesting and mandi travel.":
      "ஆய்வு, அறுவடை மற்றும் மண்டி பயணத்திற்கு ஏற்ற நேரம்.",
    "Save advice": "ஆலோசனையைச் சேமிக்கவும்",
    "Crop advisory saved for your next visit.":
      "உங்கள் அடுத்த பயணத்திற்கான பயிர் ஆலோசனை சேமிக்கப்பட்டது.",
    "WHY THIS HELPS": "இது எவ்வாறு உதவுகிறது",
    "Weather-aware farming": "வானிலைக்கு ஏற்ற விவசாயம்",
    "Use the local forecast to decide when to harvest, cover produce and travel to the mandi.":
      "எப்போது அறுவடை செய்ய, விளைபொருளை மூட மற்றும் மண்டிக்கு செல்ல வேண்டும் என்பதை உள்ளூர் முன்னறிவிப்பால் தீர்மானிக்கவும்.",
    "Location is refreshed from GPS when you update":
      "புதுப்பிக்கும்போது இருப்பிடம் GPS மூலம் புதுப்பிக்கப்படும்",
    "LOCATION PRIVACY": "இருப்பிட தனியுரிமை",
    "Your location stays in this session":
      "உங்கள் இருப்பிடம் இந்த அமர்வில் மட்டுமே இருக்கும்",
    "FasalFlux uses your location only to show nearby weather and does not save your exact coordinates.":
      "அருகிலுள்ள வானிலையை மட்டும் காட்ட FasalFlux உங்கள் இருப்பிடத்தைப் பயன்படுத்துகிறது; துல்லியமான ஆயங்களைச் சேமிக்காது.",
    "GPS permission is optional": "GPS அனுமதி விருப்பமானது",
    "Command centre": "கட்டுப்பாட்டு மையம்",
    "Mandi officials": "மண்டி அதிகாரிகள்",
    "Mandi network": "மண்டி வலையமைப்பு",
    "Activity log": "செயல்பாட்டு பதிவு",
    "Today's operations": "இன்றைய செயல்பாடுகள்",
    Farmers: "விவசாயிகள்",
    "Live queue": "நேரடி வரிசை",
    Payments: "கொடுப்பனவுகள்",
    "My harvest": "எனது அறுவடை",
    "Book a mandi slot": "மண்டி நேரத்தை முன்பதிவு செய்க",
    "My records": "எனது பதிவுகள்",
    "Help centre": "உதவி மையம்",
    Settings: "அமைப்புகள்",
    Support: "ஆதரவு",
    WORKSPACE: "பணியிடம்",
    SYSTEM: "அமைப்பு",
    "VIEWING AS": "பார்ப்பது",
    Admin: "நிர்வாகி",
    "Mandi official": "மண்டி அதிகாரி",
    Farmer: "விவசாயி",
    "Search farmers, tokens...": "விவசாயிகள், டோக்கன்களை தேடுக...",
    "DEMO ROLE": "டெமோ பங்கு",
    "Built for trust": "நம்பிக்கைக்காக உருவாக்கப்பட்டது",
    "Transparent mandi operations": "வெளிப்படையான மண்டி செயல்பாடுகள்",
    "Good morning, Neha.": "காலை வணக்கம், நேஹா.",
    "Good morning, Arjun.": "காலை வணக்கம், அர்ஜுன்.",
    "Good morning, Ramesh.": "காலை வணக்கம், ரமேஷ்.",
    "Open mandi view": "மண்டி காட்சியைத் திறக்கவும்",
    "Add official": "அதிகாரியைச் சேர்க்கவும்",
    "Register farmer": "விவசாயியைப் பதிவு செய்க",
    "Book a new slot": "புதிய நேரத்தை முன்பதிவு செய்க",
    "View full queue": "முழு வரிசையைக் காண்க",
    "Process next payment": "அடுத்த கொடுப்பனவைச் செய்க",
    "Start booking": "முன்பதிவைத் தொடங்குக",
    "Platform overview": "தள மேலோட்டம்",
    "People & access": "நபர்கள் மற்றும் அணுகல்",
    "Farmer directory": "விவசாயி அடைவு",
    "Real-time operations": "நேரடி செயல்பாடுகள்",
    "Transparent procurement": "வெளிப்படையான கொள்முதல்",
    "Smart arrival planning": "சிறந்த வருகை திட்டமிடல்",
    "Your records": "உங்கள் பதிவுகள்",
    "Farmer support": "விவசாயி ஆதரவு",
    "Farmers at Mandi Khandwa": "மண்டி கண்ட்வா விவசாயிகள்",
    "Live mandi queue": "மண்டியின் நேரடி வரிசை",
    "Payments & procurement": "கொடுப்பனவுகள் மற்றும் கொள்முதல்",
    "Farmers needing attention": "கவனம் தேவைப்படும் விவசாயிகள்",
    "Mandi readiness": "மண்டி தயார்நிலை",
    "Today's flow": "இன்றைய ஓட்டம்",
    "Book your mandi slot": "உங்கள் மண்டி நேரத்தை முன்பதிவு செய்க",
    "Harvest history": "அறுவடை வரலாறு",
    "Your next arrival": "உங்கள் அடுத்த வருகை",
    Active: "செயலில்",
    Pending: "நிலுவையில்",
    Approve: "அனுமதிக்கவும்",
    "Today at a glance": "இன்றைய கண்ணோட்டம்",
    Booked: "முன்பதிவு செய்யப்பட்டது",
    "Checked in": "சரிபார்க்கப்பட்டது",
    "At weighbridge": "எடை மேடையில்",
    Procurement: "கொள்முதல்",
    Paid: "செலுத்தப்பட்டது",
    "Every harvest, on time.": "ஒவ்வொரு அறுவடையும், சரியான நேரத்தில்.",
    "Across the FasalFlux network": "முழு FasalFlux வலையமைப்பிலும்",
    "connected mandis": "இணைக்கப்பட்ட மண்டிகள்",
    "Network health": "வலையமைப்பு நலம்",
    "Mandi uptime": "மண்டி இயக்க நேரம்",
    "Farmers served": "சேவை பெற்ற விவசாயிகள்",
    "Payments reconciled": "சரிபார்க்கப்பட்ட கொடுப்பனவுகள்",
    "Audit trail": "தணிக்கை பதிவு",
    "Export log": "பதிவை ஏற்றுமதி செய்க",
    "Quick actions": "விரைவு செயல்கள்",
    "Keep things moving": "செயல்பாட்டைத் தொடருங்கள்",
    "Invite a mandi official": "மண்டி அதிகாரியை அழைக்கவும்",
    "Give a new operator access": "புதிய இயக்குநருக்கு அணுகல் வழங்கவும்",
    "Download network report": "வலையமைப்பு அறிக்கையைப் பதிவிறக்கவும்",
    "Operations and payment summary": "செயல்பாடு மற்றும் கொடுப்பனவு சுருக்கம்",
    "Contact support": "ஆதரவைத் தொடர்புகொள்ளவும்",
    "Get help with your workspace": "உங்கள் பணியிடத்திற்கு உதவி பெறவும்",
    "Recent activity": "சமீபத்திய செயல்பாடு",
    "What needs your attention": "உங்கள் கவனம் தேவைப்படுவது",
    "Review invite": "அழைப்பைப் பார்க்கவும்",
    "View audit log": "தணிக்கை பதிவைக் காண்க",
    "View network": "வலையமைப்பைக் காண்க",
    "Network performance": "வலையமைப்பு செயல்திறன்",
    "Farmers served this week": "இந்த வாரம் சேவை பெற்ற விவசாயிகள்",
    "This week": "இந்த வாரம்",
    "registered today": "இன்று பதிவு செய்யப்பட்டவை",
    "CROP & LOAD": "பயிர் மற்றும் எடை",
    "ARRIVAL SLOT": "வருகை நேரம்",
    STATUS: "நிலை",
    ACTION: "செயல்",
    "TOKEN / FARMER": "டோக்கன் / விவசாயி",
    CROP: "பயிர்",
    "TIME SLOT": "நேரம்",
    FARMER: "விவசாயி",
    QUANTITY: "அளவு",
    VALUE: "மதிப்பு",
    PAYMENT: "கொடுப்பனவு",
    "PAID OUT TODAY": "இன்று செலுத்தப்பட்டது",
    "capacity used": "பயன்படுத்தப்பட்ட திறன்",
    "One shared view, fewer missed arrivals.":
      "ஒரே பகிரப்பட்ட காட்சி, குறைந்த தவறிய வருகைகள்.",
    "Farmers know when to come. Your team knows who is next.":
      "விவசாயிகளுக்கு வருகை நேரம் தெரியும். உங்கள் குழுவிற்கு அடுத்தவர் தெரியும்.",
    "Message farmers": "விவசாயிகளுக்கு செய்தி அனுப்பவும்",
    "Come when the mandi is ready.": "மண்டி தயாராக இருக்கும்போது வாருங்கள்.",
    "estimated wait": "மதிப்பிடப்பட்ட காத்திருப்பு",
    "your digital token": "உங்கள் டிஜிட்டல் டோக்கன்",
    "No active booking": "செயலில் உள்ள முன்பதிவு இல்லை",
    "Your next mandi visit, without the guesswork.":
      "உங்கள் அடுத்த மண்டி பயணம், யூகமின்றி.",
    "Prepare for arrival": "வருகைக்குத் தயாராகுங்கள்",
    "Payment promise": "கொடுப்பனவு உறுதி",
    "Direct, traceable payment after procurement.":
      "கொள்முதலுக்குப் பிறகு நேரடி, கண்காணிக்கக்கூடிய கொடுப்பனவு.",
    "Choose a time slot": "நேரத்தைத் தேர்ந்தெடுக்கவும்",
    "Choose an arrival slot": "வருகை நேரத்தைத் தேர்ந்தெடுக்கவும்",
    "Spaces available": "இடங்கள் உள்ளன",
    Cancel: "ரத்துசெய்",
    "Confirm slot": "நேரத்தை உறுதிசெய்",
    "Register a farmer": "விவசாயியைப் பதிவு செய்க",
    "Create a farmer record and reserve their first mandi arrival.":
      "விவசாயி பதிவை உருவாக்கி முதல் மண்டி வருகையை முன்பதிவு செய்க.",
    "Farmer name": "விவசாயி பெயர்",
    "Village / location": "கிராமம் / இடம்",
    Crop: "பயிர்",
    "Expected quantity (tonnes)": "எதிர்பார்க்கப்படும் அளவு (டன்)",
    "Mobile number": "கைபேசி எண்",
    "Send invite": "அழைப்பை அனுப்பவும்",
    "Mandi assignment": "மண்டி ஒதுக்கீடு",
    "Full name": "முழு பெயர்",
    "Mandi Khandwa": "மண்டி கண்ட்வா",
    "Mandi Indore": "மண்டி இந்தூர்",
    "Mandi Dewas": "மண்டி தேவாஸ்",
  },
};

const additionalTranslations: Record<
  Exclude<Language, "en">,
  Record<string, string>
> = {
  hi: {
    "PLATFORM OVERVIEW": "प्लेटफॉर्म अवलोकन",
    "Your command centre for farmers, officials and mandi operations.":
      "किसानों, अधिकारियों और मंडी संचालन के लिए आपका कमांड सेंटर।",
    "Connected mandis": "जुड़ी हुई मंडियां",
    "Farmers served today": "आज सेवा प्राप्त किसान",
    "Value processed": "संसाधित मूल्य",
    "+2 this month": "इस महीने +2",
    "2 invites pending": "2 आमंत्रण लंबित",
    "+18.4% this week": "इस सप्ताह +18.4%",
    "96.4% reconciled": "96.4% मिलान हुआ",
    "NETWORK PERFORMANCE": "नेटवर्क प्रदर्शन",
    "QUICK ACTIONS": "त्वरित कार्य",
    "RECENT ACTIVITY": "हाल की गतिविधि",
    "All officials": "सभी अधिकारी",
    "active officials": "सक्रिय अधिकारी",
    "Across the FasalFlux network": "पूरे FasalFlux नेटवर्क में",
    Now: "अभी",
    "4 min ago": "4 मिनट पहले",
    "Invite sent": "आमंत्रण भेजा गया",
    "1 official invite pending": "1 अधिकारी का आमंत्रण लंबित",
    "All mandis are secure": "सभी मंडियां सुरक्षित हैं",
    "Operations are healthy": "संचालन सुचारू है",
    "No unresolved access alerts": "कोई अनसुलझा एक्सेस अलर्ट नहीं",
    "99.8% network uptime today": "आज नेटवर्क अपटाइम 99.8%",
    "Mandi Khandwa reported 72% capacity":
      "मंडी खंडवा ने 72% क्षमता रिपोर्ट की",
    "View all": "सभी देखें",
    "connected mandis": "जुड़ी हुई मंडियां",
    "Network health": "नेटवर्क स्वास्थ्य",
    "Mandi uptime": "मंडी अपटाइम",
    "Farmers served": "सेवा प्राप्त किसान",
    "Payments reconciled": "भुगतान मिलान",
    "High capacity": "उच्च क्षमता",
    "Operating smoothly": "सुचारू संचालन",
    "Onboarding official": "अधिकारी ऑनबोर्डिंग",
    arrivals: "आगमन",
    "minutes ago · FasalFlux audit system": "मिनट पहले · FasalFlux ऑडिट सिस्टम",
    "Mandi official approved and access enabled.":
      "मंडी अधिकारी स्वीकृत और एक्सेस सक्षम।",
    "Invite a mandi official": "मंडी अधिकारी को आमंत्रित करें",
    "Send invite": "आमंत्रण भेजें",
    "Mandi assignment": "मंडी नियुक्ति",
    "PEOPLE & ACCESS": "लोग और एक्सेस",
    "FARMER DIRECTORY": "किसान निर्देशिका",
    "Manage arrivals, farmer records and their progress through the mandi.":
      "आगमन, किसान रिकॉर्ड और मंडी में उनकी प्रगति प्रबंधित करें।",
    "registered today": "आज पंजीकृत",
    "Filters opened.": "फिल्टर खोले गए।",
    "REAL-TIME OPERATIONS": "रीयल-टाइम संचालन",
    "Move each farmer forward with a single shared view.":
      "एक साझा दृश्य से हर किसान को आगे बढ़ाएं।",
    "Live updates": "लाइव अपडेट",
    "In queue": "कतार में",
    "Average wait": "औसत प्रतीक्षा",
    "At weighbridge": "वेटब्रिज पर",
    "Next: FF-042": "अगला: FF-042",
    "priority arrivals": "प्राथमिकता वाले आगमन",
    "TRANSPARENT PROCUREMENT": "पारदर्शी खरीद",
    "Confirm weights and keep direct payment status visible to every farmer.":
      "वजन की पुष्टि करें और हर किसान को सीधी भुगतान स्थिति दिखाएं।",
    "PAID OUT TODAY": "आज भुगतान किया गया",
    "DBT verification active": "DBT सत्यापन सक्रिय",
    "Payment ledger": "भुगतान खाता",
    "Paid via DBT": "DBT से भुगतान",
    Pending: "लंबित",
    "MANDI READINESS": "मंडी की तैयारी",
    "capacity used": "उपयोग की गई क्षमता",
    "Checked in": "चेक-इन",
    Processing: "प्रसंस्करण",
    Upcoming: "आगामी",
    "One shared view, fewer missed arrivals.":
      "एक साझा दृश्य, कम छूटे हुए आगमन।",
    "Farmers know when to come. Your team knows who is next.":
      "किसानों को आने का समय पता है। आपकी टीम को अगला किसान पता है।",
    "Farmer communication centre opened.": "किसान संचार केंद्र खोला गया।",
    "SMART ARRIVAL PLANNING": "स्मार्ट आगमन योजना",
    "Choose a slot, receive a token, and track your progress from your phone.":
      "स्लॉट चुनें, टोकन पाएं और फोन से अपनी प्रगति देखें।",
    "NEXT AVAILABLE": "अगला उपलब्ध",
    "Come when the mandi is ready.": "मंडी तैयार हो तभी आएं।",
    "Reserve a slot, receive a token, and track your progress from your phone.":
      "स्लॉट आरक्षित करें, टोकन पाएं और फोन से अपनी प्रगति देखें।",
    "Choose a slot": "स्लॉट चुनें",
    "Get a token": "टोकन पाएं",
    "Track & get paid": "ट्रैक करें और भुगतान पाएं",
    "Live capacity helps avoid crowded arrivals.":
      "लाइव क्षमता भीड़ वाले आगमन से बचने में मदद करती है।",
    "Keep your simple token on your phone.": "अपना सरल टोकन फोन में रखें।",
    "See payment after weighing and procurement.":
      "वजन और खरीद के बाद भुगतान देखें।",
    "YOUR RECORDS": "आपके रिकॉर्ड",
    "A transparent record of every trip to the mandi.":
      "मंडी की हर यात्रा का पारदर्शी रिकॉर्ड।",
    "Download records": "रिकॉर्ड डाउनलोड करें",
    "FARMER SUPPORT": "किसान सहायता",
    "Get a clear answer before your harvest reaches the mandi.":
      "आपकी फसल मंडी पहुंचने से पहले स्पष्ट उत्तर पाएं।",
    "Call support": "सहायता को कॉल करें",
    "Send a message": "संदेश भेजें",
    "Common questions": "सामान्य प्रश्न",
    "Toll-free": "टोल-फ्री",
    "Talk to your mandi official": "अपने मंडी अधिकारी से बात करें",
    "Slots, tokens and payments": "स्लॉट, टोकन और भुगतान",
    "WEDNESDAY, 18 JUNE 2025": "बुधवार, 18 जून 2025",
    "Your next mandi visit, without the guesswork.":
      "आपकी अगली मंडी यात्रा, बिना किसी अनुमान के।",
    "YOUR NEXT ARRIVAL": "आपका अगला आगमन",
    "Mandi Khandwa · 12 km away": "मंडी खंडवा · 12 किमी दूर",
    "View mandi details": "मंडी विवरण देखें",
    "Prepare for arrival": "आगमन की तैयारी करें",
    "Bring your token and produce details. Our team will guide you through weighing.":
      "अपना टोकन और उपज का विवरण लाएं। हमारी टीम वजन प्रक्रिया में आपका मार्गदर्शन करेगी।",
    "Payment promise": "भुगतान का वादा",
    "Direct, traceable payment after procurement.":
      "खरीद के बाद सीधा और ट्रेस करने योग्य भुगतान।",
  },
  ta: {
    "PLATFORM OVERVIEW": "தள மேலோட்டம்",
    "Your command centre for farmers, officials and mandi operations.":
      "விவசாயிகள், அதிகாரிகள் மற்றும் மண்டி செயல்பாடுகளுக்கான உங்கள் கட்டுப்பாட்டு மையம்.",
    "Connected mandis": "இணைக்கப்பட்ட மண்டிகள்",
    "Farmers served today": "இன்று சேவை பெற்ற விவசாயிகள்",
    "Value processed": "செயலாக்கப்பட்ட மதிப்பு",
    "+2 this month": "இந்த மாதம் +2",
    "2 invites pending": "2 அழைப்புகள் நிலுவையில்",
    "+18.4% this week": "இந்த வாரம் +18.4%",
    "96.4% reconciled": "96.4% சரிபார்க்கப்பட்டது",
    "NETWORK PERFORMANCE": "வலையமைப்பு செயல்திறன்",
    "QUICK ACTIONS": "விரைவு செயல்கள்",
    "RECENT ACTIVITY": "சமீபத்திய செயல்பாடு",
    "All officials": "அனைத்து அதிகாரிகள்",
    "active officials": "செயலில் உள்ள அதிகாரிகள்",
    Now: "இப்போது",
    "4 min ago": "4 நிமிடங்களுக்கு முன்",
    "Invite sent": "அழைப்பு அனுப்பப்பட்டது",
    "1 official invite pending": "1 அதிகாரி அழைப்பு நிலுவையில்",
    "All mandis are secure": "அனைத்து மண்டிகளும் பாதுகாப்பானவை",
    "Operations are healthy": "செயல்பாடுகள் சீராக உள்ளன",
    "No unresolved access alerts": "தீர்க்கப்படாத அணுகல் எச்சரிக்கைகள் இல்லை",
    "99.8% network uptime today": "இன்று வலையமைப்பு இயக்க நேரம் 99.8%",
    "View all": "அனைத்தையும் காண்க",
    "Operating smoothly": "சீரான செயல்பாடு",
    "High capacity": "அதிக திறன்",
    "Onboarding official": "அதிகாரி இணைப்பு",
    arrivals: "வருகைகள்",
    "Mandi official approved and access enabled.":
      "மண்டி அதிகாரி அனுமதிக்கப்பட்டு அணுகல் செயல்படுத்தப்பட்டது.",
    "PEOPLE & ACCESS": "நபர்கள் மற்றும் அணுகல்",
    "FARMER DIRECTORY": "விவசாயி அடைவு",
    "Manage arrivals, farmer records and their progress through the mandi.":
      "வருகைகள், விவசாயி பதிவுகள் மற்றும் மண்டி முன்னேற்றத்தை நிர்வகிக்கவும்.",
    "registered today": "இன்று பதிவு செய்யப்பட்டவை",
    "Filters opened.": "வடிகட்டிகள் திறக்கப்பட்டன.",
    "REAL-TIME OPERATIONS": "நேரடி செயல்பாடுகள்",
    "Move each farmer forward with a single shared view.":
      "ஒரே பகிரப்பட்ட காட்சியில் ஒவ்வொரு விவசாயியையும் முன்னேற்றவும்.",
    "Live updates": "நேரடி புதுப்பிப்புகள்",
    "In queue": "வரிசையில்",
    "Average wait": "சராசரி காத்திருப்பு",
    "Next: FF-042": "அடுத்து: FF-042",
    "TRANSPARENT PROCUREMENT": "வெளிப்படையான கொள்முதல்",
    "Confirm weights and keep direct payment status visible to every farmer.":
      "எடைகளை உறுதிசெய்து ஒவ்வொரு விவசாயிக்கும் நேரடி கொடுப்பனவு நிலையைக் காட்டவும்.",
    "PAID OUT TODAY": "இன்று செலுத்தப்பட்டது",
    "DBT verification active": "DBT சரிபார்ப்பு செயலில்",
    "Payment ledger": "கொடுப்பனவு பதிவு",
    "Paid via DBT": "DBT மூலம் செலுத்தப்பட்டது",
    "MANDI READINESS": "மண்டி தயார்நிலை",
    Processing: "செயலாக்கம்",
    Upcoming: "வரவிருக்கும்",
    "Farmer communication centre opened.":
      "விவசாயி தொடர்பு மையம் திறக்கப்பட்டது.",
    "SMART ARRIVAL PLANNING": "சிறந்த வருகை திட்டமிடல்",
    "NEXT AVAILABLE": "அடுத்த கிடைக்கும் நேரம்",
    "Choose a slot": "நேரத்தைத் தேர்ந்தெடுக்கவும்",
    "Get a token": "டோக்கனைப் பெறவும்",
    "Track & get paid": "கண்காணித்து பணம் பெறவும்",
    "Live capacity helps avoid crowded arrivals.":
      "நேரடி திறன் அதிக கூட்டத்தைத் தவிர்க்க உதவும்.",
    "Keep your simple token on your phone.":
      "உங்கள் எளிய டோக்கனை கைபேசியில் வைத்திருங்கள்.",
    "See payment after weighing and procurement.":
      "எடை மற்றும் கொள்முதலுக்குப் பிறகு கொடுப்பனவைக் காண்க.",
    "YOUR RECORDS": "உங்கள் பதிவுகள்",
    "A transparent record of every trip to the mandi.":
      "மண்டிக்கான ஒவ்வொரு பயணத்தின் வெளிப்படையான பதிவு.",
    "Download records": "பதிவுகளைப் பதிவிறக்கவும்",
    "FARMER SUPPORT": "விவசாயி ஆதரவு",
    "Get a clear answer before your harvest reaches the mandi.":
      "உங்கள் அறுவடை மண்டியை அடையும் முன் தெளிவான பதிலைப் பெறுங்கள்.",
    "Call support": "ஆதரவை அழைக்கவும்",
    "Send a message": "செய்தி அனுப்பவும்",
    "Common questions": "பொதுவான கேள்விகள்",
    "Toll-free": "கட்டணமில்லா",
    "Slots, tokens and payments": "நேரங்கள், டோக்கன்கள் மற்றும் கொடுப்பனவுகள்",
    "WEDNESDAY, 18 JUNE 2025": "புதன்கிழமை, 18 ஜூன் 2025",
    "Your next mandi visit, without the guesswork.":
      "உங்கள் அடுத்த மண்டி பயணம், யூகமின்றி.",
    "YOUR NEXT ARRIVAL": "உங்கள் அடுத்த வருகை",
    "Mandi Khandwa · 12 km away": "மண்டி கண்ட்வா · 12 கி.மீ தொலைவில்",
    "View mandi details": "மண்டி விவரங்களைக் காண்க",
    "Prepare for arrival": "வருகைக்குத் தயாராகுங்கள்",
    "Bring your token and produce details. Our team will guide you through weighing.":
      "உங்கள் டோக்கன் மற்றும் விளைபொருள் விவரங்களை கொண்டு வாருங்கள். எடை செயல்முறையில் எங்கள் குழு வழிகாட்டும்.",
    "Payment promise": "கொடுப்பனவு உறுதி",
    "Direct, traceable payment after procurement.":
      "கொள்முதலுக்குப் பிறகு நேரடி, கண்காணிக்கக்கூடிய கொடுப்பனவு.",
  },
};

Object.assign(translations.hi, additionalTranslations.hi);
Object.assign(translations.ta, additionalTranslations.ta);

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};
const LanguageContext = createContext<LanguageContextValue>({
  language: "en",
  setLanguage: () => undefined,
  t: (key) => key,
});
function useLanguage() {
  return useContext(LanguageContext);
}

const originalTextByNode = new WeakMap<Text, string>();

function translateInlineText(root: HTMLElement, language: Language) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode() as Text | null;
  while (node) {
    const parent = node.parentElement;
    const raw = node.nodeValue || "";
    const value = raw.trim();
    if (
      parent &&
      value &&
      !parent.closest("input, textarea, select, option, script, style")
    ) {
      const original = originalTextByNode.get(node) || value;
      originalTextByNode.set(node, original);
      const translated = translations[language][original] || original;
      const start = raw.indexOf(value);
      const next = `${raw.slice(0, start)}${translated}${raw.slice(start + value.length)}`;
      if (next !== raw) node.nodeValue = next;
    }
    node = walker.nextNode() as Text | null;
  }
}

function App() {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = window.localStorage.getItem("fasalflux-language");
    return saved === "hi" || saved === "ta" ? saved : "en";
  });
  const [role, setRole] = useState<Role>("admin");
  const [adminView, setAdminView] = useState<AdminView>("dashboard");
  const [mandiView, setMandiView] = useState<MandiView>("dashboard");
  const [farmerView, setFarmerView] = useState<FarmerView>("home");
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = window.localStorage.getItem("fasalflux-bookings");
    return saved ? (JSON.parse(saved) as Booking[]) : seedBookings;
  });
  const [officials, setOfficials] = useState<Official[]>(() => {
    const saved = window.localStorage.getItem("fasalflux-officials");
    return saved ? (JSON.parse(saved) as Official[]) : seedOfficials;
  });
  const [toast, setToast] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showOfficialForm, setShowOfficialForm] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showFarmerForm, setShowFarmerForm] = useState(false);
  const [receipt, setReceipt] = useState<BookingReceipt | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [search, setSearch] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  const activeBookings = bookings.filter(
    (booking) => booking.status !== "paid",
  );
  const filteredBookings = useMemo(
    () =>
      bookings.filter((booking) =>
        `${booking.farmer} ${booking.village} ${booking.token} ${booking.crop}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [bookings, search],
  );
  const flash = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  };

  const t = (key: string) => translations[language][key] || key;

  async function loadWeather() {
    setWeatherLoading(true);
    if (!navigator.geolocation) {
      setWeather(demoWeather);
      setWeatherLoading(false);
      flash("GPS is not available. Showing Khandwa demo weather.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const params = `latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m&hourly=precipitation_probability&forecast_days=1&timezone=auto`;
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?${params}`,
          );
          if (!response.ok) throw new Error("Weather request failed");
          const data = (await response.json()) as {
            current: {
              temperature_2m: number;
              apparent_temperature: number;
              relative_humidity_2m: number;
              wind_speed_10m: number;
            };
            hourly: { precipitation_probability: number[] };
          };
          let location = `${coords.latitude.toFixed(2)}, ${coords.longitude.toFixed(2)}`;
          try {
            const placeResponse = await fetch(
              `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${coords.latitude}&longitude=${coords.longitude}&count=1&language=en&format=json`,
            );
            const placeData = (await placeResponse.json()) as {
              results?: { name?: string; admin1?: string }[];
            };
            if (placeData.results?.[0])
              location = [
                placeData.results[0].name,
                placeData.results[0].admin1,
              ]
                .filter(Boolean)
                .join(", ");
          } catch {
            /* Coordinates are still useful when reverse geocoding is unavailable. */
          }
          setWeather({
            location,
            temperature: Math.round(data.current.temperature_2m),
            feelsLike: Math.round(data.current.apparent_temperature),
            humidity: Math.round(data.current.relative_humidity_2m),
            windSpeed: Math.round(data.current.wind_speed_10m),
            rainChance: data.hourly.precipitation_probability[0] || 0,
            condition: "Live conditions",
            source: "gps",
            updatedAt: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          });
          flash("Weather updated from your GPS location.");
        } catch {
          setWeather(demoWeather);
          flash("Live weather is unavailable. Showing Khandwa demo weather.");
        } finally {
          setWeatherLoading(false);
        }
      },
      () => {
        setWeather(demoWeather);
        setWeatherLoading(false);
        flash(
          "Location permission was not granted. Showing Khandwa demo weather.",
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }

  function openWeather() {
    setFarmerView("weather");
    void loadWeather();
  }

  async function completeBooking(
    booking: Omit<Booking, "id" | "token" | "status" | "amount">,
  ) {
    const nextBooking: Booking = {
      ...booking,
      id: Date.now(),
      token: `FF-${46 + bookings.length}`,
      status: "booked",
      amount: booking.quantity * 2100,
    };
    const qrDataUrl = await QRCode.toDataURL(
      JSON.stringify({
        app: "FasalFlux",
        token: nextBooking.token,
        farmer: nextBooking.farmer,
        mandi: "Mandi Khandwa",
        slot: nextBooking.slot,
        crop: nextBooking.crop,
        quantity: nextBooking.quantity,
      }),
      { width: 220, margin: 2, color: { dark: "#123f30", light: "#ffffff" } },
    );
    setBookings((items) => [...items, nextBooking]);
    setShowBookingForm(false);
    setReceipt({ ...nextBooking, qrDataUrl });
    setFarmerView("home");
    flash(`Booking confirmed. ${nextBooking.token} is ready.`);
  }

  useEffect(() => {
    window.localStorage.setItem("fasalflux-bookings", JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    window.localStorage.setItem(
      "fasalflux-officials",
      JSON.stringify(officials),
    );
  }, [officials]);

  useEffect(() => {
    window.localStorage.setItem("fasalflux-language", language);
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".prototype-shell");
    if (!root) return;
    let scheduled = false;
    const apply = () => {
      scheduled = false;
      translateInlineText(root, language);
    };
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(apply);
    };
    schedule();
    const observer = new MutationObserver(schedule);
    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    return () => observer.disconnect();
  }, [language]);

  function advanceBooking(booking: Booking) {
    const next: Status =
      booking.status === "booked"
        ? "checked-in"
        : booking.status === "checked-in"
          ? "weighing"
          : booking.status === "weighing"
            ? "procurement"
            : "paid";
    setBookings((items) =>
      items.map((item) =>
        item.id === booking.id ? { ...item, status: next } : item,
      ),
    );
    flash(`${booking.token} moved to ${statusLabels[next].toLowerCase()}.`);
  }

  function changeRole(nextRole: Role) {
    setRole(nextRole);
    setMobileOpen(false);
    setSearch("");
    if (nextRole === "admin") setAdminView("dashboard");
    if (nextRole === "mandi_official") setMandiView("dashboard");
    if (nextRole === "farmer") setFarmerView("home");
  }

  const roleMeta = {
    admin: {
      name: "Neha Verma",
      title: "Platform administrator",
      initials: "NV",
    },
    mandi_official: {
      name: "Arjun Rao",
      title: "Mandi official · Khandwa",
      initials: "AR",
    },
    farmer: { name: "Ramesh Kumar", title: "Farmer · Rampur", initials: "RK" },
  }[role];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div className="prototype-shell">
        <aside className={`prototype-sidebar ${mobileOpen ? "open" : ""}`}>
          <div className="prototype-brand">
            <span className="brand-symbol">
              <Leaf size={21} />
            </span>
            <span>
              <b>FasalFlux</b>
              <small>Every harvest, on time.</small>
            </span>
          </div>
          <div className="role-switcher">
            <span className="role-avatar">{roleMeta.initials}</span>
            <span>
              <small>{t("VIEWING AS")}</small>
              <b>
                {role === "admin"
                  ? t("Admin")
                  : role === "mandi_official"
                    ? t("Mandi official")
                    : t("Farmer")}
              </b>
            </span>
            <ChevronDown size={16} />
          </div>
          <nav className="prototype-nav">
            <span className="nav-label">{t("WORKSPACE")}</span>
            {role === "admin" && (
              <>
                <NavButton
                  icon={LayoutDashboard}
                  label={t("Command centre")}
                  active={adminView === "dashboard"}
                  onClick={() => setAdminView("dashboard")}
                />
                <NavButton
                  icon={UserCheck}
                  label={t("Mandi officials")}
                  active={adminView === "officials"}
                  onClick={() => setAdminView("officials")}
                  badge={
                    officials.filter((item) => item.status === "pending").length
                  }
                />
                <NavButton
                  icon={Building2}
                  label={t("Mandi network")}
                  active={adminView === "mandis"}
                  onClick={() => setAdminView("mandis")}
                />
                <NavButton
                  icon={Activity}
                  label={t("Activity log")}
                  active={adminView === "activity"}
                  onClick={() => setAdminView("activity")}
                />
              </>
            )}
            {role === "mandi_official" && (
              <>
                <NavButton
                  icon={LayoutDashboard}
                  label={t("Today's operations")}
                  active={mandiView === "dashboard"}
                  onClick={() => setMandiView("dashboard")}
                />
                <NavButton
                  icon={Users}
                  label={t("Farmers")}
                  active={mandiView === "farmers"}
                  onClick={() => setMandiView("farmers")}
                  badge={activeBookings.length}
                />
                <NavButton
                  icon={Truck}
                  label={t("Live queue")}
                  active={mandiView === "queue"}
                  onClick={() => setMandiView("queue")}
                />
                <NavButton
                  icon={IndianRupee}
                  label={t("Payments")}
                  active={mandiView === "payments"}
                  onClick={() => setMandiView("payments")}
                />
              </>
            )}
            {role === "farmer" && (
              <>
                <NavButton
                  icon={LayoutDashboard}
                  label={t("My harvest")}
                  active={farmerView === "home"}
                  onClick={() => setFarmerView("home")}
                />
                <NavButton
                  icon={CalendarDays}
                  label={t("Book a mandi slot")}
                  active={farmerView === "book"}
                  onClick={() => setFarmerView("book")}
                />
                <NavButton
                  icon={FileText}
                  label={t("My records")}
                  active={farmerView === "history"}
                  onClick={() => setFarmerView("history")}
                />
                <NavButton
                  icon={CircleHelp}
                  label={t("Help centre")}
                  active={farmerView === "help"}
                  onClick={() => setFarmerView("help")}
                />
                <NavButton
                  icon={CloudSun}
                  label={t("Weather")}
                  active={farmerView === "weather"}
                  onClick={openWeather}
                />
              </>
            )}
            <span className="nav-label nav-spaced">{t("SYSTEM")}</span>
            <NavButton
              icon={Settings}
              label={t("Settings")}
              onClick={() => flash("Settings are ready for configuration.")}
            />
            <NavButton
              icon={MessageSquareText}
              label={t("Support")}
              onClick={() => flash("Support desk notified.")}
            />
          </nav>
          <div className="sidebar-bottom">
            <div className="trust-note">
              <ShieldCheck size={16} />
              <span>
                <b>Built for trust</b>
                <small>{t("Transparent mandi operations")}</small>
              </span>
            </div>
            <button
              className="account-row"
              onClick={() =>
                flash("Demo session stays active for the presentation.")
              }
            >
              <span className="user-avatar">{roleMeta.initials}</span>
              <span>
                <b>{roleMeta.name}</b>
                <small>{roleMeta.title}</small>
              </span>
              <MoreHorizontal size={16} />
            </button>
          </div>
        </aside>
        <main className="prototype-main">
          <header className="prototype-topbar">
            <button
              className="mobile-trigger"
              onClick={() => setMobileOpen((open) => !open)}
            >
              <Menu size={20} />
            </button>
            <div className="crumb">
              <span>FasalFlux</span>
              <ChevronRight size={14} />
              <b>
                {role === "admin"
                  ? adminView === "dashboard"
                    ? t("Command centre")
                    : adminView === "officials"
                      ? t("Mandi officials")
                      : adminView === "mandis"
                        ? t("Mandi network")
                        : t("Activity log")
                  : role === "mandi_official"
                    ? mandiView === "dashboard"
                      ? t("Today's operations")
                      : t(
                          mandiView === "farmers"
                            ? "Farmers"
                            : mandiView === "queue"
                              ? "Live queue"
                              : "Payments",
                        )
                    : farmerView === "home"
                      ? t("My harvest")
                      : farmerView === "book"
                        ? t("Book a mandi slot")
                        : farmerView === "history"
                          ? t("My records")
                          : farmerView === "help"
                            ? t("Help centre")
                            : t("Weather")}
              </b>
            </div>
            <div className="top-actions">
              <label className="language-picker" aria-label="Choose language">
                <span>文</span>
                <select
                  value={language}
                  onChange={(event) =>
                    setLanguage(event.target.value as Language)
                  }
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी</option>
                  <option value="ta">தமிழ்</option>
                </select>
              </label>
              <div className="global-search">
                <Search size={16} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t("Search farmers, tokens...")}
                />
              </div>
              <button
                className="top-icon"
                onClick={() => {
                  setShowNotifications((open) => !open);
                  setShowProfile(false);
                }}
                aria-label="Notifications"
              >
                <Bell size={18} />
                <i>2</i>
              </button>
              <button
                className="top-avatar top-avatar-button"
                onClick={() => {
                  setShowProfile((open) => !open);
                  setShowNotifications(false);
                }}
                aria-label="Open profile"
              >
                {roleMeta.initials}
              </button>
              {showNotifications && (
                <div className="top-popover notification-popover">
                  <b>{t("Notifications")}</b>
                  <p>{t("2 updates waiting for your review.")}</p>
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      flash(t("All notifications are up to date."));
                    }}
                  >
                    {t("Mark as read")}
                  </button>
                </div>
              )}
              {showProfile && (
                <div className="top-popover profile-popover">
                  <span className="popover-avatar">{roleMeta.initials}</span>
                  <div>
                    <b>{roleMeta.name}</b>
                    <small>{roleMeta.title}</small>
                  </div>
                  <button
                    onClick={() => {
                      setShowProfile(false);
                      flash(t("Profile settings opened."));
                    }}
                  >
                    <Settings size={14} /> {t("Profile settings")}
                  </button>
                </div>
              )}
            </div>
          </header>
          <div className="prototype-content">
            {role === "admin" && (
              <AdminWorkspace
                view={adminView}
                officials={officials}
                onAdd={() => setShowOfficialForm(true)}
                onApprove={(id) => {
                  setOfficials((items) =>
                    items.map((item) =>
                      item.id === id
                        ? {
                            ...item,
                            status: "active",
                            lastActive: "Just approved",
                          }
                        : item,
                    ),
                  );
                  flash("Mandi official approved and access enabled.");
                }}
                onRole={changeRole}
                onToast={flash}
              />
            )}
            {role === "mandi_official" && (
              <MandiWorkspace
                view={mandiView}
                bookings={filteredBookings}
                allBookings={bookings}
                onAdvance={advanceBooking}
                onToast={flash}
                onRegister={() => setShowFarmerForm(true)}
              />
            )}
            {role === "farmer" && (
              <FarmerWorkspace
                view={farmerView}
                bookings={bookings.filter(
                  (booking) => booking.farmer === "Ramesh Kumar",
                )}
                onBook={() => setShowBookingForm(true)}
                onToast={flash}
                weather={weather}
                weatherLoading={weatherLoading}
                onLocate={loadWeather}
              />
            )}
          </div>
        </main>
        <div className="demo-switcher">
          <span>{t("DEMO ROLE")}</span>
          <button
            className={role === "admin" ? "active" : ""}
            onClick={() => changeRole("admin")}
          >
            <ShieldCheck size={14} /> {t("Admin")}
          </button>
          <button
            className={role === "mandi_official" ? "active" : ""}
            onClick={() => changeRole("mandi_official")}
          >
            <Building2 size={14} /> {t("Mandi official")}
          </button>
          <button
            className={role === "farmer" ? "active" : ""}
            onClick={() => changeRole("farmer")}
          >
            <Sprout size={14} /> {t("Farmer")}
          </button>
        </div>
        {showOfficialForm && (
          <OfficialModal
            onClose={() => setShowOfficialForm(false)}
            onSave={(official) => {
              setOfficials((items) => [
                ...items,
                {
                  ...official,
                  id: Date.now(),
                  status: "pending",
                  lastActive: "Invite sent",
                },
              ]);
              setShowOfficialForm(false);
              flash(`Invite sent to ${official.name}.`);
            }}
          />
        )}
        {showBookingForm && (
          <BookingModal
            onClose={() => setShowBookingForm(false)}
            onSave={completeBooking}
          />
        )}
        {receipt && (
          <BookingReceiptModal
            receipt={receipt}
            onClose={() => setReceipt(null)}
          />
        )}
        {showFarmerForm && (
          <FarmerModal
            onClose={() => setShowFarmerForm(false)}
            onSave={(farmer) => {
              setBookings((items) => [
                ...items,
                {
                  ...farmer,
                  id: Date.now(),
                  token: `FF-${46 + items.length}`,
                  status: "booked",
                  amount: farmer.quantity * 2100,
                },
              ]);
              setShowFarmerForm(false);
              flash(`Farmer ${farmer.farmer} registered with a mandi slot.`);
            }}
          />
        )}
        {toast && (
          <div className="prototype-toast">
            <span>
              <Check size={15} />
            </span>
            {toast}
            <button onClick={() => setToast("")}>
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    </LanguageContext.Provider>
  );
}

function NavButton({
  icon: Icon,
  label,
  active,
  onClick,
  badge,
}: {
  icon: typeof Activity;
  label: string;
  active?: boolean;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      className={`prototype-nav-button ${active ? "active" : ""}`}
      onClick={onClick}
    >
      <Icon size={17} />
      <span>{label}</span>
      {badge ? <em>{badge}</em> : null}
    </button>
  );
}

function SectionHeader({
  eyebrow,
  title,
  copy,
  action,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  action?: React.ReactNode;
}) {
  const { t } = useLanguage();
  return (
    <div className="section-header">
      <div>
        <span className="eyebrow">{t(eyebrow)}</span>
        <h1>{t(title)}</h1>
        <p>{t(copy)}</p>
      </div>
      {action}
    </div>
  );
}
function Stat({
  icon: Icon,
  label,
  value,
  change,
  tone,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  change: string;
  tone: string;
}) {
  return (
    <div className="stat-card">
      <span className={`stat-icon ${tone}`}>
        <Icon size={18} />
      </span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        <span className="stat-change">{change}</span>
      </div>
    </div>
  );
}

function AdminWorkspace({
  view,
  officials,
  onAdd,
  onApprove,
  onRole,
  onToast,
}: {
  view: AdminView;
  officials: Official[];
  onAdd: () => void;
  onApprove: (id: number) => void;
  onRole: (role: Role) => void;
  onToast: (message: string) => void;
}) {
  if (view === "officials")
    return (
      <>
        <SectionHeader
          eyebrow="PEOPLE & ACCESS"
          title="Mandi officials"
          copy="Manage the people who keep every local mandi moving."
          action={
            <button className="button primary" onClick={onAdd}>
              <UserPlus size={16} /> Add official
            </button>
          }
        />
        <div className="toolbar">
          <div className="toolbar-copy">
            <UserCheck size={18} />
            <span>
              <b>
                {officials.filter((item) => item.status === "active").length}{" "}
                active officials
              </b>
              <small>Across the FasalFlux network</small>
            </span>
          </div>
          <span className="filter-chip">
            All officials <ChevronDown size={14} />
          </span>
        </div>
        <div className="official-grid">
          {officials.map((official) => (
            <div className="official-card" key={official.id}>
              <div className="official-card-top">
                <span className="large-avatar">
                  {official.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                </span>
                <span
                  className={`status-badge ${official.status === "active" ? "success" : "warning"}`}
                >
                  {official.status === "active" ? "Active" : "Pending"}
                </span>
              </div>
              <h3>{official.name}</h3>
              <p>
                <Building2 size={14} />
                {official.mandi}
              </p>
              <p>
                <Phone size={14} />
                {official.phone}
              </p>
              <div className="official-card-foot">
                <small>{official.lastActive}</small>
                {official.status === "pending" ? (
                  <button
                    className="text-link"
                    onClick={() => onApprove(official.id)}
                  >
                    Approve <Check size={14} />
                  </button>
                ) : (
                  <button
                    className="icon-action"
                    onClick={() =>
                      onToast(`Opening profile for ${official.name}.`)
                    }
                  >
                    <MoreHorizontal size={17} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </>
    );
  if (view === "mandis")
    return (
      <>
        <SectionHeader
          eyebrow="NETWORK ADMINISTRATION"
          title="Mandi network"
          copy="A clear operating picture across all connected markets."
          action={
            <button
              className="button outline"
              onClick={() => onToast("Mandi onboarding request opened.")}
            >
              <Plus size={16} /> Add mandi
            </button>
          }
        />
        <div className="admin-network-grid">
          <div className="network-map">
            <div className="map-glow" />
            <MapPin size={26} />
            <strong>12</strong>
            <span>connected mandis</span>
            <div className="map-pin pin-one" />
            <div className="map-pin pin-two" />
            <div className="map-pin pin-three" />
          </div>
          <div className="network-list">
            <NetworkRow
              name="Mandi Khandwa"
              location="Khandwa, Madhya Pradesh"
              status="Operating smoothly"
              count="148 arrivals"
              tone="green"
            />
            <NetworkRow
              name="Mandi Indore"
              location="Indore, Madhya Pradesh"
              status="High capacity"
              count="212 arrivals"
              tone="amber"
            />
            <NetworkRow
              name="Mandi Dewas"
              location="Dewas, Madhya Pradesh"
              status="Onboarding official"
              count="86 arrivals"
              tone="blue"
            />
          </div>
        </div>
        <div className="panel activity-panel">
          <PanelTitle
            eyebrow="NETWORK HEALTH"
            title="Today at a glance"
            action={
              <button
                className="icon-action"
                onClick={() => onToast("Network report exported.")}
              >
                <FileText size={16} />
              </button>
            }
          />
          <div className="health-row">
            <span>
              <Activity size={16} /> Mandi uptime
            </span>
            <b>99.8%</b>
          </div>
          <div className="health-row">
            <span>
              <Users size={16} /> Farmers served
            </span>
            <b>1,284</b>
          </div>
          <div className="health-row">
            <span>
              <ShieldCheck size={16} /> Payments reconciled
            </span>
            <b>96.4%</b>
          </div>
        </div>
      </>
    );
  if (view === "activity")
    return (
      <>
        <SectionHeader
          eyebrow="AUDIT TRAIL"
          title="Activity log"
          copy="Every important access and operational change, in one place."
          action={
            <button
              className="button outline"
              onClick={() => onToast("Activity report downloaded.")}
            >
              <FileText size={16} /> Export log
            </button>
          }
        />
        <div className="panel activity-log">
          {[
            "Arjun Rao advanced token FF-041 to weighing",
            "Priya Sharma joined the Mandi Indore workspace",
            "Neha Verma approved Vikram Singh’s official invite",
            "Payment of ₹26,250 reconciled for Ramesh Kumar",
            "Mandi Khandwa reported 72% capacity",
          ].map((item, index) => (
            <div className="log-row" key={item}>
              <span className={`log-icon ${index % 2 ? "blue" : "green"}`}>
                <Check size={14} />
              </span>
              <div>
                <b>{item}</b>
                <small>{index + 2} minutes ago · FasalFlux audit system</small>
              </div>
              <ChevronRight size={15} />
            </div>
          ))}
        </div>
      </>
    );
  return (
    <>
      <SectionHeader
        eyebrow="PLATFORM OVERVIEW"
        title="Good morning, Neha."
        copy="Your command centre for farmers, officials and mandi operations."
        action={
          <button
            className="button primary"
            onClick={() => onRole("mandi_official")}
          >
            <Building2 size={16} /> Open mandi view
          </button>
        }
      />
      <div className="stat-grid">
        <Stat
          icon={Building2}
          label="Connected mandis"
          value="12"
          change="+2 this month"
          tone="green"
        />
        <Stat
          icon={UserCheck}
          label="Mandi officials"
          value={officials.length.toString()}
          change="2 invites pending"
          tone="blue"
        />
        <Stat
          icon={Users}
          label="Farmers served today"
          value="1,284"
          change="+18.4% this week"
          tone="amber"
        />
        <Stat
          icon={IndianRupee}
          label="Value processed"
          value="₹28.6L"
          change="96.4% reconciled"
          tone="violet"
        />
      </div>
      <div className="admin-dashboard-grid">
        <div className="panel chart-panel">
          <PanelTitle
            eyebrow="NETWORK PERFORMANCE"
            title="Farmers served this week"
            action={
              <span className="date-pill">
                This week <ChevronDown size={14} />
              </span>
            }
          />
          <div className="large-chart">
            <div className="chart-y">
              <span>1.5k</span>
              <span>1k</span>
              <span>500</span>
              <span>0</span>
            </div>
            <div className="chart-columns">
              {[44, 60, 51, 68, 74, 87, 78].map((height, index) => (
                <div key={index}>
                  <i style={{ height: `${height}%` }} />
                  <span>
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="panel quick-panel">
          <PanelTitle eyebrow="QUICK ACTIONS" title="Keep things moving" />
          <button onClick={onAdd}>
            <UserPlus size={18} />
            <span>
              <b>Invite a mandi official</b>
              <small>Give a new operator access</small>
            </span>
            <ArrowRight size={16} />
          </button>
          <button onClick={() => onToast("Network report is being prepared.")}>
            <FileText size={18} />
            <span>
              <b>Download network report</b>
              <small>Operations and payment summary</small>
            </span>
            <ArrowRight size={16} />
          </button>
          <button onClick={() => onToast("Support request created.")}>
            <MessageSquareText size={18} />
            <span>
              <b>Contact support</b>
              <small>Get help with your workspace</small>
            </span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
      <div className="panel activity-panel">
        <PanelTitle
          eyebrow="RECENT ACTIVITY"
          title="What needs your attention"
          action={
            <button
              className="text-link"
              onClick={() => onToast("Showing the full activity log.")}
            >
              View all <ArrowRight size={14} />
            </button>
          }
        />
        <div className="attention-grid">
          <Attention
            icon={UserPlus}
            title="1 official invite pending"
            copy="Vikram Singh · Mandi Dewas"
            action="Review invite"
            onClick={onAdd}
          />
          <Attention
            icon={ShieldCheck}
            title="All mandis are secure"
            copy="No unresolved access alerts"
            action="View audit log"
            onClick={() => onToast("Audit log opened.")}
          />
          <Attention
            icon={Activity}
            title="Operations are healthy"
            copy="99.8% network uptime today"
            action="View network"
            onClick={() => onToast("Network view opened.")}
          />
        </div>
      </div>
    </>
  );
}

function NetworkRow({
  name,
  location,
  status,
  count,
  tone,
}: {
  name: string;
  location: string;
  status: string;
  count: string;
  tone: string;
}) {
  return (
    <div className="network-row">
      <span className={`network-icon ${tone}`}>
        <Building2 size={18} />
      </span>
      <span>
        <b>{name}</b>
        <small>{location}</small>
      </span>
      <span className="network-status">
        <i className={tone} />
        {status}
      </span>
      <strong>{count}</strong>
      <ChevronRight size={16} />
    </div>
  );
}
function Attention({
  icon: Icon,
  title,
  copy,
  action,
  onClick,
}: {
  icon: typeof Activity;
  title: string;
  copy: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <div className="attention-item">
      <span>
        <Icon size={17} />
      </span>
      <div>
        <b>{title}</b>
        <small>{copy}</small>
        <button onClick={onClick}>
          {action} <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}
function PanelTitle({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
}) {
  const { t } = useLanguage();
  return (
    <div className="panel-title">
      <div>
        <span className="eyebrow">{t(eyebrow)}</span>
        <h2>{t(title)}</h2>
      </div>
      {action}
    </div>
  );
}

function MandiWorkspace({
  view,
  bookings,
  allBookings,
  onAdvance,
  onToast,
  onRegister,
}: {
  view: MandiView;
  bookings: Booking[];
  allBookings: Booking[];
  onAdvance: (booking: Booking) => void;
  onToast: (message: string) => void;
  onRegister: () => void;
}) {
  if (view === "farmers")
    return (
      <>
        <SectionHeader
          eyebrow="FARMER DIRECTORY"
          title="Farmers at Mandi Khandwa"
          copy="Manage arrivals, farmer records and their progress through the mandi."
          action={
            <button className="button primary" onClick={onRegister}>
              <UserPlus size={16} /> Register farmer
            </button>
          }
        />
        <div className="filter-bar">
          <div className="directory-count">
            <Users size={18} />
            <b>{allBookings.length} farmers</b>
            <span>registered today</span>
          </div>
          <button
            className="button outline"
            onClick={() => onToast("Filters opened.")}
          >
            <Search size={15} /> Filter
          </button>
        </div>
        <div className="panel records-panel">
          <div className="table-head">
            <span>FARMER</span>
            <span>CROP & LOAD</span>
            <span>ARRIVAL SLOT</span>
            <span>STATUS</span>
            <span>ACTION</span>
          </div>
          {bookings.map((booking) => (
            <BookingTableRow
              key={booking.id}
              booking={booking}
              onAdvance={onAdvance}
            />
          ))}
        </div>
      </>
    );
  if (view === "queue")
    return (
      <>
        <SectionHeader
          eyebrow="REAL-TIME OPERATIONS"
          title="Live mandi queue"
          copy="Move each farmer forward with a single shared view."
          action={
            <span className="live-status">
              <i /> Live updates
            </span>
          }
        />
        <div className="stat-grid three">
          <Stat
            icon={Users}
            label="In queue"
            value={String(
              bookings.filter((item) => item.status !== "paid").length,
            )}
            change="4 arriving next"
            tone="green"
          />
          <Stat
            icon={Clock3}
            label="Average wait"
            value="18 min"
            change="6 min better than target"
            tone="blue"
          />
          <Stat
            icon={PackageCheck}
            label="At weighbridge"
            value={String(
              bookings.filter((item) => item.status === "weighing").length,
            )}
            change="Next: FF-042"
            tone="amber"
          />
        </div>
        <div className="panel records-panel">
          <div className="table-head">
            <span>TOKEN / FARMER</span>
            <span>CROP</span>
            <span>TIME SLOT</span>
            <span>STATUS</span>
            <span>ACTION</span>
          </div>
          {bookings.map((booking) => (
            <BookingTableRow
              key={booking.id}
              booking={booking}
              onAdvance={onAdvance}
            />
          ))}
        </div>
      </>
    );
  if (view === "payments")
    return (
      <>
        <SectionHeader
          eyebrow="TRANSPARENT PROCUREMENT"
          title="Payments & procurement"
          copy="Confirm weights and keep direct payment status visible to every farmer."
          action={
            <button
              className="button primary"
              onClick={() => {
                const next = bookings.find(
                  (item) => item.status === "procurement",
                );
                if (next) onAdvance(next);
                else onToast("No procurement items are waiting.");
              }}
            >
              <IndianRupee size={16} /> Process next payment
            </button>
          }
        />
        <div className="payment-banner">
          <div>
            <small>PAID OUT TODAY</small>
            <strong>
              ₹
              {allBookings
                .filter((item) => item.status === "paid")
                .reduce((sum, item) => sum + item.amount, 0)
                .toLocaleString("en-IN")}
            </strong>
            <span>
              <BadgeCheck size={15} /> DBT verification active
            </span>
          </div>
          <div className="payment-bars">
            {[42, 55, 46, 72, 62, 78, 86, 68, 92, 77].map((height, index) => (
              <i key={index} style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>
        <div className="panel records-panel">
          <div className="table-head">
            <span>FARMER</span>
            <span>QUANTITY</span>
            <span>VALUE</span>
            <span>PAYMENT</span>
            <span>ACTION</span>
          </div>
          {allBookings.map((booking) => (
            <div className="record-row" key={booking.id}>
              <span className="person-cell">
                <span className="small-avatar">
                  {booking.farmer.slice(0, 2).toUpperCase()}
                </span>
                <b>{booking.farmer}</b>
              </span>
              <span>{booking.quantity} t</span>
              <span>₹{booking.amount.toLocaleString("en-IN")}</span>
              <span
                className={`status-badge ${booking.status === "paid" ? "success" : "warning"}`}
              >
                {booking.status === "paid" ? "Paid via DBT" : "Pending"}
              </span>
              <button className="row-arrow" onClick={() => onAdvance(booking)}>
                <ChevronRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </>
    );
  return (
    <>
      <SectionHeader
        eyebrow="MANDI KHANDWA · WEDNESDAY, 18 JUNE"
        title="Good morning, Arjun."
        copy="Here is what needs your attention today."
        action={
          <button
            className="button primary"
            onClick={() => onToast("Farmer registration form opened.")}
          >
            <UserPlus size={16} /> Register farmer
          </button>
        }
      />
      <div className="stat-grid">
        <Stat
          icon={Users}
          label="Arrivals today"
          value={String(allBookings.length)}
          change="+12% vs yesterday"
          tone="green"
        />
        <Stat
          icon={Clock3}
          label="Average wait time"
          value="18 min"
          change="6 min better than target"
          tone="blue"
        />
        <Stat
          icon={Wheat}
          label="Mandi capacity"
          value="72%"
          change="Processing smoothly"
          tone="amber"
        />
        <Stat
          icon={IndianRupee}
          label="Payments processed"
          value={`₹${(allBookings.filter((item) => item.status === "paid").length * 24.8).toFixed(1)}k`}
          change="DBT verified"
          tone="violet"
        />
      </div>
      <div className="mandi-dashboard-grid">
        <div className="panel queue-preview">
          <PanelTitle
            eyebrow="OPERATIONS"
            title="Farmers needing attention"
            action={
              <button
                className="text-link"
                onClick={() => onToast("Use Live queue for all arrivals.")}
              >
                View full queue <ArrowRight size={14} />
              </button>
            }
          />
          {bookings.slice(0, 4).map((booking) => (
            <BookingTableRow
              key={booking.id}
              booking={booking}
              onAdvance={onAdvance}
              compact
            />
          ))}
        </div>
        <div className="panel readiness-panel">
          <PanelTitle eyebrow="MANDI READINESS" title="Today’s flow" />
          <div className="readiness-ring">
            <strong>72%</strong>
            <span>capacity used</span>
          </div>
          <div className="readiness-stats">
            <span>
              <i className="green" /> Checked in{" "}
              <b>
                {
                  allBookings.filter((item) => item.status === "checked-in")
                    .length
                }
              </b>
            </span>
            <span>
              <i className="amber" /> Processing{" "}
              <b>
                {
                  allBookings.filter((item) =>
                    ["weighing", "procurement"].includes(item.status),
                  ).length
                }
              </b>
            </span>
            <span>
              <i className="gray" /> Upcoming{" "}
              <b>
                {allBookings.filter((item) => item.status === "booked").length}
              </b>
            </span>
          </div>
        </div>
      </div>
      <div className="impact-strip">
        <Sprout size={20} />
        <span>
          <b>One shared view, fewer missed arrivals.</b>
          <small>Farmers know when to come. Your team knows who is next.</small>
        </span>
        <button onClick={() => onToast("Farmer communication centre opened.")}>
          Message farmers <ArrowRight size={14} />
        </button>
      </div>
    </>
  );
}

function BookingTableRow({
  booking,
  onAdvance,
  compact = false,
}: {
  booking: Booking;
  onAdvance: (booking: Booking) => void;
  compact?: boolean;
}) {
  const { t } = useLanguage();
  return (
    <div className={`record-row ${compact ? "compact" : ""}`}>
      <span className="person-cell">
        <span className="small-avatar">
          {booking.farmer
            .split(" ")
            .map((part) => part[0])
            .join("")}
        </span>
        <span>
          <b>{booking.farmer}</b>
          <small>
            {booking.village} · {booking.token}
          </small>
        </span>
      </span>
      <span>
        {booking.crop}
        <small>{booking.quantity} t</small>
      </span>
      <span>
        {booking.slot}
        <small>{booking.phone}</small>
      </span>
      <span className={`status-badge ${statusTone[booking.status]}`}>
        {t(statusLabels[booking.status])}
      </span>
      <button
        className="row-arrow"
        onClick={() => onAdvance(booking)}
        aria-label={`Advance ${booking.token}`}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

function FarmerWorkspace({
  view,
  bookings,
  onBook,
  onToast,
  weather,
  weatherLoading,
  onLocate,
}: {
  view: FarmerView;
  bookings: Booking[];
  onBook: () => void;
  onToast: (message: string) => void;
  weather: WeatherData | null;
  weatherLoading: boolean;
  onLocate: () => void | Promise<void>;
}) {
  if (view === "weather")
    return (
      <WeatherView
        weather={weather || demoWeather}
        loading={weatherLoading}
        onLocate={onLocate}
        onToast={onToast}
      />
    );
  if (view === "book")
    return (
      <>
        <SectionHeader
          eyebrow="SMART ARRIVAL PLANNING"
          title="Book your mandi slot"
          copy="Choose a time that keeps your harvest moving and your waiting short."
        />
        <div className="booking-hero">
          <div>
            <span className="eyebrow">NEXT AVAILABLE</span>
            <h2>Come when the mandi is ready.</h2>
            <p>
              Reserve a slot, receive a token, and track your progress from your
              phone.
            </p>
            <button className="button gold" onClick={onBook}>
              <CalendarDays size={16} /> Start booking
            </button>
          </div>
          <div className="booking-illustration">
            <div>
              <Clock3 size={18} />
              <b>18 min</b>
              <small>estimated wait</small>
            </div>
            <div>
              <Wheat size={18} />
              <b>FF-046</b>
              <small>your digital token</small>
            </div>
          </div>
        </div>
        <div className="steps-row">
          <Step
            number="01"
            title="Choose a slot"
            copy="Live capacity helps avoid crowded arrivals."
          />
          <Step
            number="02"
            title="Show your token"
            copy="Keep your simple token on your phone."
          />
          <Step
            number="03"
            title="Get paid directly"
            copy="See payment after weighing and procurement."
          />
        </div>
      </>
    );
  if (view === "history")
    return (
      <>
        <SectionHeader
          eyebrow="YOUR RECORDS"
          title="Harvest history"
          copy="A transparent record of every trip to the mandi."
          action={
            <button
              className="button outline"
              onClick={() => onToast("Records downloaded.")}
            >
              <FileText size={16} /> Download records
            </button>
          }
        />
        <div className="panel records-panel farmer-records">
          {bookings.map((booking) => (
            <div className="record-row" key={booking.id}>
              <span className="person-cell">
                <span className="small-avatar">
                  <Wheat size={15} />
                </span>
                <span>
                  <b>
                    {booking.crop} · {booking.quantity} tonnes
                  </b>
                  <small>
                    {booking.slot} · {booking.token}
                  </small>
                </span>
              </span>
              <span>{booking.village}</span>
              <span>₹{booking.amount.toLocaleString("en-IN")}</span>
              <span className={`status-badge ${statusTone[booking.status]}`}>
                {statusLabels[booking.status]}
              </span>
              <ChevronRight size={16} />
            </div>
          ))}
        </div>
      </>
    );
  if (view === "help")
    return (
      <>
        <SectionHeader
          eyebrow="FARMER SUPPORT"
          title="We are here to help."
          copy="Get a clear answer before your harvest reaches the mandi."
        />
        <div className="help-grid">
          <HelpCard
            icon={Phone}
            title="Call support"
            copy="1800 123 4567 · Toll-free"
            onClick={() => onToast("Calling farmer support...")}
          />
          <HelpCard
            icon={MessageSquareText}
            title="Send a message"
            copy="Talk to your mandi official"
            onClick={() => onToast("Message centre opened.")}
          />
          <HelpCard
            icon={CircleHelp}
            title="Common questions"
            copy="Slots, tokens and payments"
            onClick={() => onToast("Help articles opened.")}
          />
        </div>
      </>
    );
  const current = bookings[0];
  return (
    <>
      <div className="farmer-welcome">
        <div>
          <span className="eyebrow">WEDNESDAY, 18 JUNE 2025</span>
          <h1>Good morning, Ramesh.</h1>
          <p>Your next mandi visit, without the guesswork.</p>
        </div>
        <button className="button gold" onClick={onBook}>
          <CalendarDays size={16} /> Book a new slot
        </button>
      </div>
      <div className="farmer-status-card">
        <div className="status-card-top">
          <div>
            <span className="eyebrow">YOUR NEXT ARRIVAL</span>
            <h2>{current ? current.token : "No active booking"}</h2>
            <p>
              {current
                ? `${current.crop} · ${current.quantity} tonnes · ${current.slot}`
                : "Book a slot to see your token here."}
            </p>
          </div>
          <span
            className={`status-badge ${current ? statusTone[current.status] : "blue"}`}
          >
            {current ? statusLabels[current.status] : "Ready to book"}
          </span>
        </div>
        <div className="journey">
          <JourneyStep label="Booked" done />
          <JourneyStep label="Checked in" done={current?.status !== "booked"} />
          <JourneyStep
            label="Weighing"
            done={["weighing", "procurement", "paid"].includes(
              current?.status || "",
            )}
          />
          <JourneyStep label="Paid" done={current?.status === "paid"} />
        </div>
        <div className="farmer-card-footer">
          <span>
            <MapPin size={15} /> Mandi Khandwa · 12 km away
          </span>
          <button
            onClick={() => onToast("Directions opened for Mandi Khandwa.")}
          >
            View mandi details <ArrowRight size={14} />
          </button>
        </div>
      </div>
      <div className="farmer-lower-grid">
        <div className="panel farmer-tip">
          <Sprout size={20} />
          <div>
            <b>Prepare for arrival</b>
            <p>
              Bring your token and produce details. Our team will guide you
              through weighing.
            </p>
          </div>
        </div>
        <div className="panel farmer-payment">
          <IndianRupee size={20} />
          <div>
            <b>Payment promise</b>
            <p>Direct, traceable payment after procurement.</p>
          </div>
          <BadgeCheck size={20} />
        </div>
      </div>
    </>
  );
}

function WeatherView({
  weather,
  loading,
  onLocate,
  onToast,
}: {
  weather: WeatherData;
  loading: boolean;
  onLocate: () => void | Promise<void>;
  onToast: (message: string) => void;
}) {
  const { t } = useLanguage();
  const isGps = weather.source === "gps";
  const fieldAdvice =
    weather.rainChance > 50
      ? {
          title: t("Rain expected"),
          copy: t("Avoid spraying and cover harvested produce today."),
        }
      : {
          title: t("Good for field work"),
          copy: t(
            "A suitable window for inspection, harvesting and mandi travel.",
          ),
        };

  return (
    <>
      <SectionHeader
        eyebrow="FARMER WEATHER"
        title="Weather & farm advisory"
        copy="Plan your field work and mandi visit with local weather information."
        action={
          <button
            className="button outline"
            onClick={() => void onLocate()}
            disabled={loading}
          >
            <LocateFixed size={16} />{" "}
            {loading ? t("Updating...") : t("Use my GPS location")}
          </button>
        }
      />
      <div className="weather-location-strip">
        <div>
          <MapPin size={17} />
          <span>
            <b>{weather.location}</b>
            <small>
              {isGps
                ? t("Weather data from your GPS location")
                : t("Demo location · allow GPS for local weather")}
            </small>
          </span>
        </div>
        <span className={`source-pill ${isGps ? "gps" : "demo"}`}>
          <i />
          {isGps ? t("GPS location") : t("Demo data")}
        </span>
      </div>
      <div className="weather-grid">
        <div className="weather-hero-card">
          <div className="weather-hero-icon">
            <CloudSun size={54} />
          </div>
          <div>
            <span className="eyebrow">{t("CURRENT WEATHER")}</span>
            <strong>{weather.temperature}°C</strong>
            <h2>{t(weather.condition)}</h2>
            <p>
              {t("Feels like")} {weather.feelsLike}°C · {t("Updated")}{" "}
              {weather.updatedAt}
            </p>
          </div>
        </div>
        <div className="weather-metrics panel">
          <WeatherMetric
            icon={Sprout}
            label={t("Humidity")}
            value={`${weather.humidity}%`}
          />
          <WeatherMetric
            icon={Truck}
            label={t("Wind speed")}
            value={`${weather.windSpeed} km/h`}
          />
          <WeatherMetric
            icon={CloudSun}
            label={t("Rain chance")}
            value={`${weather.rainChance}%`}
          />
          <WeatherMetric
            icon={Clock3}
            label={t("Best travel window")}
            value={weather.rainChance > 50 ? t("After 4 PM") : t("Now - 4 PM")}
          />
        </div>
      </div>
      <div className="weather-advisory">
        <span className="advisory-icon">
          <Sprout size={19} />
        </span>
        <div>
          <span className="eyebrow">{t("CROP ADVISORY")}</span>
          <h2>{fieldAdvice.title}</h2>
          <p>{fieldAdvice.copy}</p>
        </div>
        <button
          className="text-link"
          onClick={() => onToast(t("Crop advisory saved for your next visit."))}
        >
          <BadgeCheck size={15} /> {t("Save advice")}
        </button>
      </div>
      <div className="weather-info-grid">
        <div className="panel weather-info-card">
          <PanelTitle eyebrow="WHY THIS HELPS" title="Weather-aware farming" />
          <p>
            {t(
              "Use the local forecast to decide when to harvest, cover produce and travel to the mandi.",
            )}
          </p>
          <div className="weather-check">
            <Check size={15} />{" "}
            {t("Location is refreshed from GPS when you update")}
          </div>
        </div>
        <div className="panel weather-info-card">
          <PanelTitle
            eyebrow="LOCATION PRIVACY"
            title="Your location stays in this session"
          />
          <p>
            {t(
              "FasalFlux uses your location only to show nearby weather and does not save your exact coordinates.",
            )}
          </p>
          <div className="weather-check">
            <ShieldCheck size={15} /> {t("GPS permission is optional")}
          </div>
        </div>
      </div>
    </>
  );
}

function WeatherMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
}) {
  return (
    <div className="weather-metric">
      <span>
        <Icon size={17} />
      </span>
      <small>{label}</small>
      <b>{value}</b>
    </div>
  );
}

function JourneyStep({ label, done }: { label: string; done: boolean }) {
  return (
    <div className={`journey-step ${done ? "done" : ""}`}>
      <span>{done ? <Check size={13} /> : <i />}</span>
      <small>{label}</small>
    </div>
  );
}
function Step({
  number,
  title,
  copy,
}: {
  number: string;
  title: string;
  copy: string;
}) {
  return (
    <div className="step-card">
      <span>{number}</span>
      <div>
        <b>{title}</b>
        <p>{copy}</p>
      </div>
    </div>
  );
}
function HelpCard({
  icon: Icon,
  title,
  copy,
  onClick,
}: {
  icon: typeof Activity;
  title: string;
  copy: string;
  onClick: () => void;
}) {
  return (
    <button className="help-card-large" onClick={onClick}>
      <span>
        <Icon size={19} />
      </span>
      <b>{title}</b>
      <small>{copy}</small>
      <ArrowRight size={16} />
    </button>
  );
}

function OfficialModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (official: { name: string; mandi: string; phone: string }) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    mandi: "Mandi Khandwa",
    phone: "",
  });
  return (
    <Modal
      title="Invite a mandi official"
      copy="Give a trusted operator access to manage their mandi."
      onClose={onClose}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave(form);
        }}
      >
        <label>
          Full name
          <input
            required
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="e.g. Sunita Verma"
          />
        </label>
        <label>
          Mandi assignment
          <select
            value={form.mandi}
            onChange={(event) =>
              setForm({ ...form, mandi: event.target.value })
            }
          >
            <option>Mandi Khandwa</option>
            <option>Mandi Indore</option>
            <option>Mandi Dewas</option>
          </select>
        </label>
        <label>
          Mobile number
          <input
            required
            value={form.phone}
            onChange={(event) =>
              setForm({ ...form, phone: event.target.value })
            }
            placeholder="10-digit mobile number"
          />
        </label>
        <div className="modal-actions">
          <button type="button" className="button outline" onClick={onClose}>
            Cancel
          </button>
          <button className="button primary" type="submit">
            <UserPlus size={15} /> Send invite
          </button>
        </div>
      </form>
    </Modal>
  );
}
function BookingModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (booking: {
    farmer: string;
    village: string;
    crop: string;
    quantity: number;
    slot: string;
    phone: string;
  }) => void;
}) {
  const [form, setForm] = useState({
    farmer: "Ramesh Kumar",
    village: "Rampur",
    crop: "Wheat",
    quantity: 5,
    slot: "10:00 - 11:00 AM",
    phone: "98765 43210",
  });
  return (
    <Modal
      title="Book your mandi slot"
      copy="Reserve a predictable arrival window for your harvest."
      onClose={onClose}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave(form);
        }}
      >
        <div className="form-two">
          <label>
            Farmer name
            <input
              required
              value={form.farmer}
              onChange={(event) =>
                setForm({ ...form, farmer: event.target.value })
              }
            />
          </label>
          <label>
            Village
            <input
              required
              value={form.village}
              onChange={(event) =>
                setForm({ ...form, village: event.target.value })
              }
            />
          </label>
        </div>
        <div className="form-two">
          <label>
            Crop
            <select
              value={form.crop}
              onChange={(event) =>
                setForm({ ...form, crop: event.target.value })
              }
            >
              <option>Wheat</option>
              <option>Mustard</option>
              <option>Tomato</option>
              <option>Onion</option>
              <option>Potato</option>
            </select>
          </label>
          <label>
            Expected quantity (tonnes)
            <input
              required
              min="0.1"
              step="0.1"
              type="number"
              value={form.quantity}
              onChange={(event) =>
                setForm({ ...form, quantity: Number(event.target.value) })
              }
            />
          </label>
        </div>
        <label>
          Mobile number
          <input
            required
            value={form.phone}
            onChange={(event) =>
              setForm({ ...form, phone: event.target.value })
            }
          />
        </label>
        <div className="slot-choice">
          <b>Choose a time slot</b>
          {["09:00 - 10:00 AM", "10:00 - 11:00 AM", "11:00 AM - 12:00 PM"].map(
            (slot) => (
              <button
                type="button"
                className={form.slot === slot ? "selected" : ""}
                key={slot}
                onClick={() => setForm({ ...form, slot })}
              >
                <CalendarDays size={14} />
                {slot}
                <small>Spaces available</small>
              </button>
            ),
          )}
        </div>
        <div className="modal-actions">
          <button type="button" className="button outline" onClick={onClose}>
            Cancel
          </button>
          <button className="button gold" type="submit">
            <Check size={15} /> Confirm slot
          </button>
        </div>
      </form>
    </Modal>
  );
}

function BookingReceiptModal({
  receipt,
  onClose,
}: {
  receipt: BookingReceipt;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="prototype-modal receipt-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-heading">
          <div>
            <span className="eyebrow">{t("BOOKING CONFIRMED")}</span>
            <h2>{t("Your digital mandi token is ready")}</h2>
            <p>{t("Show this QR at the mandi entry counter.")}</p>
          </div>
          <button className="close-modal" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="receipt-body">
          <div className="qr-frame">
            <img src={receipt.qrDataUrl} alt={t("Booking QR code")} />
            <span>
              <QrCode size={14} /> {receipt.token}
            </span>
          </div>
          <div className="receipt-details">
            <div>
              <small>{t("Farmer")}</small>
              <b>{receipt.farmer}</b>
            </div>
            <div>
              <small>{t("Mandi")}</small>
              <b>Mandi Khandwa</b>
            </div>
            <div>
              <small>{t("Arrival slot")}</small>
              <b>{receipt.slot}</b>
            </div>
            <div>
              <small>{t("Produce")}</small>
              <b>
                {receipt.crop} · {receipt.quantity} t
              </b>
            </div>
          </div>
          <div className="receipt-note">
            <ShieldCheck size={16} />
            <span>
              <b>{t("Digital receipt secured")}</b>
              <small>
                {t("This token can be verified by the mandi official.")}
              </small>
            </span>
          </div>
          <div className="modal-actions">
            <button className="button outline" onClick={() => window.print()}>
              <FileText size={15} /> {t("Print receipt")}
            </button>
            <button className="button primary" onClick={onClose}>
              <Check size={15} /> {t("Done")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FarmerModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (farmer: {
    farmer: string;
    village: string;
    crop: string;
    quantity: number;
    slot: string;
    phone: string;
  }) => void;
}) {
  const [form, setForm] = useState({
    farmer: "",
    village: "",
    crop: "Wheat",
    quantity: 5,
    slot: "10:00 - 11:00 AM",
    phone: "",
  });

  return (
    <Modal
      title="Register a farmer"
      copy="Create a farmer record and reserve their first mandi arrival."
      onClose={onClose}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave(form);
        }}
      >
        <div className="form-two">
          <label>
            Farmer name
            <input
              required
              value={form.farmer}
              onChange={(event) =>
                setForm({ ...form, farmer: event.target.value })
              }
              placeholder="e.g. Suresh Patel"
            />
          </label>
          <label>
            Village / location
            <input
              required
              value={form.village}
              onChange={(event) =>
                setForm({ ...form, village: event.target.value })
              }
              placeholder="e.g. Rampur"
            />
          </label>
        </div>
        <div className="form-two">
          <label>
            Crop
            <select
              value={form.crop}
              onChange={(event) =>
                setForm({ ...form, crop: event.target.value })
              }
            >
              <option>Wheat</option>
              <option>Mustard</option>
              <option>Tomato</option>
              <option>Onion</option>
              <option>Potato</option>
            </select>
          </label>
          <label>
            Expected quantity (tonnes)
            <input
              required
              min="0.1"
              step="0.1"
              type="number"
              value={form.quantity}
              onChange={(event) =>
                setForm({ ...form, quantity: Number(event.target.value) })
              }
            />
          </label>
        </div>
        <label>
          Mobile number
          <input
            required
            value={form.phone}
            onChange={(event) =>
              setForm({ ...form, phone: event.target.value })
            }
            placeholder="10-digit mobile number"
          />
        </label>
        <div className="slot-choice">
          <b>Choose an arrival slot</b>
          {["09:00 - 10:00 AM", "10:00 - 11:00 AM", "11:00 AM - 12:00 PM"].map(
            (slot) => (
              <button
                type="button"
                className={form.slot === slot ? "selected" : ""}
                key={slot}
                onClick={() => setForm({ ...form, slot })}
              >
                <CalendarDays size={14} />
                {slot}
                <small>Spaces available</small>
              </button>
            ),
          )}
        </div>
        <div className="modal-actions">
          <button type="button" className="button outline" onClick={onClose}>
            Cancel
          </button>
          <button className="button primary" type="submit">
            <UserPlus size={15} /> Register farmer
          </button>
        </div>
      </form>
    </Modal>
  );
}
function Modal({
  title,
  copy,
  onClose,
  children,
}: {
  title: string;
  copy: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="prototype-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-heading">
          <div>
            <span className="eyebrow">FASALFLUX</span>
            <h2>{title}</h2>
            <p>{copy}</p>
          </div>
          <button className="close-modal" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export default App;
