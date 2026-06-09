// Indian Clinical Database Standards - Mock Datasets

export interface DrugInteraction {
  drugA: string;
  drugB: string;
  severity: 'high' | 'moderate' | 'low';
  description: string;
}

export interface GenericDrug {
  genericName: string;
  brands: string[];
  category: string;
  cghsRate: number;
}

export interface AbpmPackage {
  code: string;
  name: string;
  specialty: string;
  price: number;
}

export interface AbdmLockerRecord {
  abhaId: string;
  name: string;
  age: number;
  gender: string;
  history: { date: string; facility: string; diagnosis: string; notes: string }[];
}

export const CDSCO_DRUGS: GenericDrug[] = [
  {
    genericName: 'Pantoprazole',
    brands: ['Pantocid 40mg', 'Pan-40', 'Pantodac'],
    category: 'Proton Pump Inhibitor',
    cghsRate: 12.50
  },
  {
    genericName: 'Ibuprofen',
    brands: ['Brufen 400', 'Ibugesic', 'Ibuparent'],
    category: 'NSAID',
    cghsRate: 8.00
  },
  {
    genericName: 'Aspirin',
    brands: ['Ecosprin 75', 'Loprin', 'Colsprin'],
    category: 'Antiplatelet / Salicylate',
    cghsRate: 5.50
  },
  {
    genericName: 'Amoxicillin',
    brands: ['Mox 500', 'Novamox', 'Almox'],
    category: 'Antibiotic',
    cghsRate: 24.00
  },
  {
    genericName: 'Metformin',
    brands: ['Glycomet 500', 'Gluformin', 'Obimet'],
    category: 'Antidiabetic',
    cghsRate: 15.00
  }
];

export const DRUG_INTERACTIONS: DrugInteraction[] = [
  {
    drugA: 'Ibuprofen',
    drugB: 'Aspirin',
    severity: 'high',
    description: 'Concomitant administration increases risk of gastrointestinal bleeding and reduces aspirin cardioprotective efficacy.'
  },
  {
    drugA: 'Pantoprazole',
    drugB: 'Ketoconazole',
    severity: 'moderate',
    description: 'Pantoprazole raises gastric pH levels, reducing bioavailability and absorption of Ketoconazole.'
  },
  {
    drugA: 'Amoxicillin',
    drugB: 'Methotrexate',
    severity: 'high',
    description: 'Penicillins may reduce clearance of methotrexate, resulting in elevated serum levels and potential toxicity.'
  }
];

export const AYUSHMAN_BHARAT_PACKAGES: AbpmPackage[] = [
  {
    code: '3010410',
    name: 'Medical management of severe acute gastritis / GERD',
    specialty: 'General Medicine',
    price: 3500
  },
  {
    code: '1020301',
    name: 'Neonatal Respiratory Distress Management',
    specialty: 'Pediatric Care',
    price: 18000
  },
  {
    code: '4020102',
    name: 'Single chamber pacemaker implantation including device cost',
    specialty: 'Cardiology',
    price: 65000
  },
  {
    code: '5030401',
    name: 'Open reduction and internal fixation of long bone fractures',
    specialty: 'Orthopedics',
    price: 22000
  }
];

export const BHASHINI_TRANSLATIONS: Record<string, Record<string, string>> = {
  hindi: {
    greetings: 'नमस्ते, सुवी एआई में आपका स्वागत है।',
    consultation: 'नमस्ते डॉक्टर साहब, पेट में बहुत तेज दर्द हो रहा है तीन दिन से...',
    instructions: 'दवाइयां सुबह खाली पेट, खाना खाने से आधा घंटा पहले एक बार लेनी हैं। 3 दिनों तक मसालेदार भोजन और खट्टे फलों से सख्त परहेज करें।',
    icu_admit: 'रोगी को सघन चिकित्सा इकाई (ICU) में भर्ती किया गया है। महत्वपूर्ण संकेतों पर लगातार निगरानी रखी जा रही है।'
  },
  tamil: {
    greetings: 'வணக்கம், சுவி ஏஐ-க்கு வரவேற்கிறோம்.',
    consultation: 'வணக்கம் டாக்டர், மூன்று நாட்களாக என் வயிற்றில் கடுமையான வலி உள்ளது...',
    instructions: 'மருந்தை காலையில் வெறும் வயிற்றில், உணவுக்கு அரை மணி நேரத்திற்கு முன் ஒரு வேளை எடுத்துக் கொள்ள வேண்டும். 3 நாட்களுக்கு காரமான உணவுகள் மற்றும் புளிப்பு பழங்களைத் தவிர்க்கவும்.',
    icu_admit: 'நோயாளி தீவிர சிகிச்சை பிரிவில் (ICU) அனுமதிக்கப்பட்டுள்ளார். முக்கிய அறிகுறிகள் தொடர்ந்து கண்காணிக்கப்படுகின்றன.'
  },
  telugu: {
    greetings: 'నమస్కారం, సువి ఏఐ కి స్వాగతం.',
    consultation: 'నమస్తే డాక్టర్ గారు, మూడు రోజుల నుండి కడుపులో చాలా నొప్పిగా ఉంది...',
    instructions: 'మందులు ఉదయం పరగడుపున, భోజనానికి అరగంట ముందు ఒకసారి వేసుకోవాలి. 3 రోజుల వరకు మసాలా ఆహారాలు మరియు పుల్లని పండ్లకు దూరంగా ఉండండి.',
    icu_admit: 'రోగిని అత్యవసర చికిత్స విభాగం (ICU) లో చేర్చారు. ముఖ్యమైన సంకేతాలు నిరంతరం పర్యవేక్షించబడుతున్నాయి.'
  }
};

export const ABDM_LOCKER_RECORDS: AbdmLockerRecord[] = [
  {
    abhaId: '91-8839-2201-9238',
    name: 'Aarav Sharma',
    age: 42,
    gender: 'Male',
    history: [
      {
        date: '2025-11-12',
        facility: 'AIIMS New Delhi',
        diagnosis: 'Mild Gastric Irritation',
        notes: 'Advised lifestyle modification and antacids PRN.'
      },
      {
        date: '2026-02-05',
        facility: 'Max Super Speciality Hospital',
        diagnosis: 'Lumbar Strain',
        notes: 'Prescribed NSAIDs and physical therapy for 2 weeks.'
      }
    ]
  },
  {
    abhaId: '44-9021-3312-8874',
    name: 'Priya Patel',
    age: 29,
    gender: 'Female',
    history: [
      {
        date: '2026-03-10',
        facility: 'InstaClinic Pune',
        diagnosis: 'Allergic Bronchitis',
        notes: 'Steroid inhaler prescribed, checkup scheduled in 1 month.'
      }
    ]
  },
  {
    abhaId: '12-4458-9902-1249',
    name: 'Karan Singh',
    age: 58,
    gender: 'Male',
    history: [
      {
        date: '2024-08-19',
        facility: 'Fortis Hospital Mumbai',
        diagnosis: 'Type-2 Diabetes Mellitus',
        notes: 'Initiated Metformin 500mg BD. HbA1c is 7.2%.'
      }
    ]
  }
];
