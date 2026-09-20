import { ArchivePlate } from './types';

export const ARCHIVE_PLATES: ArchivePlate[] = [
  {
    id: 'trieste-1960',
    title: 'BATHYSCAPHE TRIESTE',
    subtitle: 'The First Human Descent into the Abyss',
    year: '1960',
    depth: '10,916 M',
    expedition: 'US Navy Project Nekton · 23 January 1960',
    description: 'Swiss oceanographer Jacques Piccard and US Navy Lieutenant Don Walsh boarded the heavy steel bathyscaphe Trieste. Suspended beneath a 50-foot float filled with lighter-than-water gasoline, the crew spent 4 hours and 47 minutes descending through pitch-black freezing waters into the Challenger Deep, proving for the first time that humans could enter Earth’s deepest chasm and survive.',
    description_id: 'Oseanografer Swiss Jacques Piccard dan Letnan AL AS Don Walsh mengarungi palung dengan kapal selam baja Trieste. Berada di bawah tangki apung bensin ringan sepanjang 15 meter, mereka menghabiskan 4 jam 47 menit meluncur menembus kegelapan beku Challenger Deep, membuktikan untuk pertama kalinya bahwa manusia mampu menembus titik terdalam bumi dan kembali selamat.',
    specs: [
      { label: 'CREW SPHERE', value: 'Krupp forged steel (12.7 cm thickness)' },
      { label: 'BALLAST', value: '9 tons iron shot held by electromagnets' },
      { label: 'FLOAT FLUID', value: '110,000 liters aviation gasoline' },
      { label: 'BOTTOM TIME', value: '20 minutes at maximum depth' }
    ],
    tags: ['Historical', 'Bathyscaphe', 'Milestone', '1960']
  },
  {
    id: 'deepsea-2012',
    title: 'DEEPSEA CHALLENGER',
    subtitle: 'Solo Vertical Torpedo Descent',
    year: '2012',
    depth: '10,908 M',
    expedition: 'National Geographic Expedition · 26 March 2012',
    description: 'Filmmaker and deep-sea explorer James Cameron piloted the vertically oriented submersible Deepsea Challenger on a solo dive into the southern pool of Challenger Deep. The craft utilized advanced syntactic foam capable of withstanding 16,500 psi without crushing, equipped with 3D stereoscopic cameras that documented alien seafloor silt and amphipods in high-definition.',
    description_id: 'Sutradara dan penjelajah laut dalam James Cameron mengemudikan kapal selam vertikal Deepsea Challenger secara solo ke kolam selatan Challenger Deep. Dirancang dengan busa sintaktik canggih yang menahan tekanan 1.100 atmosfer tanpa remuk, dilengkapi kamera 3D resolusi tinggi yang mengabadikan sedimen kapur laut purba dan koloni amfipoda raksasa.',
    specs: [
      { label: 'PILOT', value: 'James Cameron (Solo)' },
      { label: 'DESCENT SPEED', value: '2.5 hours rapid vertical descent' },
      { label: 'HULL MATERIAL', value: 'Structural Isofloat syntactic foam' },
      { label: 'LIGHTING', value: '2.5 meter LED light panel (10,000+ lumens)' }
    ],
    tags: ['Solo Dive', 'Syntactic Foam', '3D Optics', '2012']
  },
  {
    id: 'limiting-factor-2019',
    title: 'DSV LIMITING FACTOR',
    subtitle: 'Triton 36000/2 Commercial Deep Submersible',
    year: '2019',
    depth: '10,928 M',
    expedition: 'Five Deeps Expedition · Victor Vescovo',
    description: 'The world’s first commercially certified full-ocean-depth submersible, manufactured by Triton Submarines. Constructed with a 90mm thick Grade 23 titanium pressure hull, Limiting Factor completed multiple consecutive dives to the Challenger Deep seafloor in a single week, collecting biological samples, mapping the ocean floor with high-resolution bathymetry, and proving reliable reusability.',
    description_id: 'Kapal selam bersertifikasi komersial pertama di dunia yang mampu menyelam ke seluruh kedalaman samudra tanpa batas. Ditempa dari lambung titanium Grade 23 setebal 90mm, Limiting Factor melakukan penyelaman berulang kali ke dasar Challenger Deep dalam sepekan, mengambil sampel biologi, memetakan topografi bawah laut, dan membuktikan daya jelajah berulang.',
    specs: [
      { label: 'PILOT', value: 'Victor Vescovo & Dr. Kathy Sullivan' },
      { label: 'PRESSURE HULL', value: 'Titanium Grade 23 (90 mm thickness)' },
      { label: 'CERTIFICATION', value: 'DNV GL Unlimited Ocean Depth' },
      { label: 'SONAR', value: 'Kongsberg EM 124 multibeam bathymetry' }
    ],
    tags: ['Titanium Hull', 'Reusability', 'Mapping', '2019']
  },
  {
    id: 'mariana-snailfish',
    title: 'MARIANA SNAILFISH',
    subtitle: 'Pseudoliparis swirei · The Hadal Apex',
    year: '2017',
    depth: '7,966 M',
    expedition: 'Schmidt Ocean Institute & University of Washington',
    description: 'Found living at depths exceeding 8,000 meters, the Mariana snailfish is the deepest-dwelling fish discovered by science. Translucent, scaleless, and fragile in air, its cellular membranes are rich in trimethylamine N-oxide (TMAO) and piezolytes that stabilize proteins against catastrophic distortion caused by hydrostatic pressure exceeding 800 times atmospheric pressure.',
    description_id: 'Hidup di kedalaman melebihi 8.000 meter, ikan siput Mariana adalah ikan terendah yang pernah ditemukan ilmu pengetahuan. Berkulit transparan tanpa sisik dan tampak ringkih, struktur membran selnya kaya senyawa TMAO dan piezolit yang menstabilkan protein tubuh dari tekanan hidrostatik dahsyat 800 kali lipat di atas kepala kita.',
    specs: [
      { label: 'ORGANISM', value: 'Pseudoliparis swirei (Teleost)' },
      { label: 'DEPTH RECORD', value: '7,966 to 8,178 meters' },
      { label: 'ADAPTATION', value: 'High cellular TMAO osmolyte concentrations' },
      { label: 'DIET', value: 'Hadal amphipods (Hirondellea gigas)' }
    ],
    tags: ['Biology', 'Vertebrate', 'Adaptation', 'Apex Hadal']
  },
  {
    id: 'black-smokers',
    title: 'SERPENTINITE CHIMNEYS',
    subtitle: 'Abyssal Hydrothermal Fluids & Chemosynthesis',
    year: '2016',
    depth: '6,200 M',
    expedition: 'NOAA Deepwater Wonders of West Pacific',
    description: 'At tectonic fracture zones, seawater penetrates miles beneath the seafloor, reacting with peridotite mantle rock through serpentinization. Mineral-rich fluids superheated to over 300°C erupt back into the near-freezing ocean, precipitating towers of iron, copper, and zinc sulfides that nourish dense ecosystems driven by hydrogen sulfide chemosynthesis rather than sunlight.',
    description_id: 'Pada retakan lempeng tektonik, air laut meresap bermil-mil ke dalam batuan mantel peridotit melalui proses serpentinisasi. Fluida kaya mineral yang mendidih di atas 300°C menyembur kembali ke samudra beku, membentuk menara sulfida besi dan tembaga yang menghidupi ekosistem kemosintesis tanpa setitik pun cahaya matahari.',
    specs: [
      { label: 'TEMPERATURE', value: 'Up to 380°C (supercritical fluid)' },
      { label: 'CHEMISTRY', value: 'Methane, Hydrogen Sulfide, Dissolved Iron' },
      { label: 'ENERGY SOURCE', value: 'Chemosynthetic sulfur-oxidizing bacteria' },
      { label: 'STRUCTURE', value: 'Precipitated porous sulfide mineral chimneys' }
    ],
    tags: ['Geology', 'Hydrothermal', 'Chemosynthesis', 'NOAA']
  },
  {
    id: 'mariana-cross-section',
    title: 'THE SUBDUCTION SCAR',
    subtitle: 'Where the Pacific Crust Dives into the Earth',
    year: 'GEOLOGY',
    depth: '10,994 M',
    expedition: 'Plate Tectonics & Global Geophysics',
    description: 'The Mariana Trench represents the deepest convergent plate boundary on Earth. Here, the ancient, cold, and ultra-dense Pacific Plate (formed 170 million years ago during the Jurassic) is subducted beneath the younger Mariana Plate at a steep 60-degree angle, dragging billions of tons of ocean water directly into the deep Earth mantle.',
    description_id: 'Palung Mariana adalah batas konvergen lempeng tektonik terdalam di bumi. Di sinilah Lempeng Pasifik purba yang dingin dan sangat padat (terbentuk 170 juta tahun lalu pada zaman Jura) menunjam ke bawah Lempeng Mariana dengan kemiringan curam 60 derajat, menyeret miliaran ton air laut ke dalam mantel bumi.',
    specs: [
      { label: 'SUBDUCTING PLATE', value: 'Pacific Plate (Jurassic age, ~170 Ma)' },
      { label: 'OVERRIDING PLATE', value: 'Mariana Plate' },
      { label: 'TRENCH LENGTH', value: '2,550 km crescent arc' },
      { label: 'MAX TRENCH WIDTH', value: '69 km mean canyon floor width' }
    ],
    tags: ['Tectonics', 'Subduction', 'Geophysics', 'Earth Crust']
  }
];
