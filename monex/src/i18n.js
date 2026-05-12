import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// the translations
const resources = {
  en: {
    translation: {
      "Dashboard": "Dashboard",
      "Sites": "Sites",
      "Materials": "Materials",
      "Reports": "Reports",
      "Assigned Site": "Assigned Site",
      "Billing Report": "Billing Report",
      "Progress Updates": "Progress Updates",
      "Assigned Tasks": "Assigned Tasks",
      "Attendance": "Attendance",
      "Workers": "Workers",
      "Supervisors": "Supervisors",
      "Contact Details": "Contact Details",
      "Settings": "Settings",
      "Contact Admin": "Contact Admin",
      "GENERAL": "GENERAL",
      "USERS": "USERS",
      "WELCOME!": "WELCOME!",
      "Search...": "Search...",
      "Logout": "Logout",
      "Switch to Tamil": "Switch to Tamil",
      "Switch to English": "Switch to English",
      "Toggle Theme": "Toggle Theme"
    }
  },
  ta: {
    translation: {
      "Dashboard": "முகப்பு (Dashboard)",
      "Sites": "தளங்கள் (Sites)",
      "Materials": "பொருட்கள் (Materials)",
      "Reports": "அறிக்கைகள் (Reports)",
      "Assigned Site": "ஒதுக்கப்பட்ட தளம் (Assigned Site)",
      "Billing Report": "பில்லிங் அறிக்கை (Billing Report)",
      "Progress Updates": "முன்னேற்றப் புதுப்பிப்புகள் (Progress Updates)",
      "Assigned Tasks": "ஒதுக்கப்பட்ட பணிகள் (Assigned Tasks)",
      "Attendance": "வருகை (Attendance)",
      "Workers": "தொழிலாளர்கள் (Workers)",
      "Supervisors": "மேற்பார்வையாளர்கள் (Supervisors)",
      "Contact Details": "தொடர்பு விவரங்கள் (Contact Details)",
      "Settings": "அமைப்புகள் (Settings)",
      "Contact Admin": "நிர்வாகியைத் தொடர்பு கொள்க (Contact Admin)",
      "GENERAL": "பொது (GENERAL)",
      "USERS": "பயனர்கள் (USERS)",
      "WELCOME!": "நல்வரவு! (WELCOME!)",
      "Search...": "தேடு... (Search...)",
      "Logout": "வெளியேறு (Logout)",
      "Switch to Tamil": "தமிழுக்கு மாற்றுக",
      "Switch to English": "ஆங்கிலத்திற்கு மாற்றுக",
      "Toggle Theme": "தீம் மாற்றுக"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
