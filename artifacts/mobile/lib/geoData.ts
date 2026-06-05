export interface GeoState {
  name: string;
  cities: string[];
}

export interface GeoCountry {
  name: string;
  states: GeoState[];
}

export const COUNTRIES: GeoCountry[] = [
  {
    name: "Afghanistan",
    states: [
      { name: "Kabul", cities: ["Kabul", "Bagrami", "Mir Bacha Kot"] },
      { name: "Kandahar", cities: ["Kandahar", "Spin Boldak", "Dand"] },
      { name: "Herat", cities: ["Herat", "Guzara", "Injil"] },
      { name: "Balkh", cities: ["Mazar-i-Sharif", "Balkh", "Dawlatabad"] },
    ],
  },
  {
    name: "Albania",
    states: [
      { name: "Tirana", cities: ["Tirana", "Kamëz", "Vora"] },
      { name: "Durrës", cities: ["Durrës", "Shijak", "Krujë"] },
      { name: "Vlorë", cities: ["Vlorë", "Sarandë", "Himarë"] },
    ],
  },
  {
    name: "Algeria",
    states: [
      { name: "Algiers", cities: ["Algiers", "Bab Ezzouar", "Dar El Beïda"] },
      { name: "Oran", cities: ["Oran", "Es Senia", "Bir El Djir"] },
      { name: "Constantine", cities: ["Constantine", "El Khroub", "Ain Smara"] },
    ],
  },
  {
    name: "Argentina",
    states: [
      { name: "Buenos Aires", cities: ["Buenos Aires", "La Plata", "Mar del Plata", "Quilmes", "Lanús"] },
      { name: "Córdoba", cities: ["Córdoba", "Villa María", "Río Cuarto", "San Francisco"] },
      { name: "Santa Fe", cities: ["Rosario", "Santa Fe", "Rafaela", "Venado Tuerto"] },
      { name: "Mendoza", cities: ["Mendoza", "San Rafael", "Godoy Cruz", "Luján de Cuyo"] },
      { name: "Tucumán", cities: ["San Miguel de Tucumán", "Tafí Viejo", "Banda del Río Salí"] },
    ],
  },
  {
    name: "Australia",
    states: [
      {
        name: "New South Wales",
        cities: ["Sydney", "Newcastle", "Wollongong", "Central Coast", "Maitland", "Wagga Wagga", "Albury", "Port Macquarie", "Tamworth", "Orange", "Dubbo", "Lismore"],
      },
      {
        name: "Victoria",
        cities: ["Melbourne", "Geelong", "Ballarat", "Bendigo", "Shepparton", "Mildura", "Wodonga", "Warrnambool", "Traralgon", "Sunbury"],
      },
      {
        name: "Queensland",
        cities: ["Brisbane", "Gold Coast", "Sunshine Coast", "Townsville", "Cairns", "Toowoomba", "Mackay", "Rockhampton", "Bundaberg", "Hervey Bay"],
      },
      {
        name: "South Australia",
        cities: ["Adelaide", "Mount Gambier", "Whyalla", "Victor Harbor", "Port Augusta", "Port Pirie", "Murray Bridge"],
      },
      {
        name: "Western Australia",
        cities: ["Perth", "Mandurah", "Bunbury", "Geraldton", "Kalgoorlie", "Albany", "Broome", "Karratha"],
      },
      {
        name: "Tasmania",
        cities: ["Hobart", "Launceston", "Devonport", "Burnie", "Ulverstone"],
      },
      {
        name: "Australian Capital Territory",
        cities: ["Canberra", "Queanbeyan", "Goulburn"],
      },
      {
        name: "Northern Territory",
        cities: ["Darwin", "Alice Springs", "Palmerston", "Katherine"],
      },
    ],
  },
  {
    name: "Austria",
    states: [
      { name: "Vienna", cities: ["Vienna"] },
      { name: "Upper Austria", cities: ["Linz", "Wels", "Steyr", "Leonding"] },
      { name: "Styria", cities: ["Graz", "Leoben", "Kapfenberg", "Bruck an der Mur"] },
      { name: "Lower Austria", cities: ["St. Pölten", "Wiener Neustadt", "Klosterneuburg"] },
      { name: "Salzburg", cities: ["Salzburg", "Hallein", "Wals-Siezenheim"] },
      { name: "Tyrol", cities: ["Innsbruck", "Kufstein", "Wörgl"] },
      { name: "Vorarlberg", cities: ["Bregenz", "Dornbirn", "Feldkirch"] },
    ],
  },
  {
    name: "Azerbaijan",
    states: [
      { name: "Baku", cities: ["Baku", "Surakhani", "Binagadi"] },
      { name: "Ganja", cities: ["Ganja", "Samukh", "Goranboy"] },
      { name: "Sumgait", cities: ["Sumgait", "Absheron"] },
    ],
  },
  {
    name: "Bahrain",
    states: [
      { name: "Capital", cities: ["Manama", "Jidhafs"] },
      { name: "Northern", cities: ["Madinat Hamad", "Madinat Isa"] },
      { name: "Southern", cities: ["Riffa", "Hawar"] },
    ],
  },
  {
    name: "Bangladesh",
    states: [
      {
        name: "Dhaka",
        cities: ["Dhaka", "Narayanganj", "Gazipur", "Manikganj", "Munshiganj", "Narsingdi", "Faridpur", "Madaripur", "Rajbari"],
      },
      {
        name: "Chittagong",
        cities: ["Chittagong", "Cox's Bazar", "Comilla", "Brahmanbaria", "Noakhali", "Feni", "Lakshmipur", "Chandpur"],
      },
      {
        name: "Rajshahi",
        cities: ["Rajshahi", "Chapai Nawabganj", "Natore", "Naogaon", "Bogura", "Sirajganj", "Pabna", "Joypurhat"],
      },
      {
        name: "Khulna",
        cities: ["Khulna", "Satkhira", "Bagerhat", "Jessore", "Narail", "Magura", "Chuadanga", "Meherpur", "Kushtia"],
      },
      {
        name: "Sylhet",
        cities: ["Sylhet", "Moulvibazar", "Habiganj", "Sunamganj"],
      },
      {
        name: "Barisal",
        cities: ["Barisal", "Bhola", "Patuakhali", "Pirojpur", "Jhalokati", "Barguna"],
      },
      {
        name: "Rangpur",
        cities: ["Rangpur", "Dinajpur", "Thakurgaon", "Panchagarh", "Nilphamari", "Gaibandha", "Kurigram", "Lalmonirhat"],
      },
      {
        name: "Mymensingh",
        cities: ["Mymensingh", "Jamalpur", "Sherpur", "Netrokona"],
      },
    ],
  },
  {
    name: "Belarus",
    states: [
      { name: "Minsk", cities: ["Minsk", "Barysaw", "Zhodzina"] },
      { name: "Homyel", cities: ["Homyel", "Mazyr", "Zhlobin"] },
      { name: "Hrodno", cities: ["Hrodno", "Lida", "Slonim"] },
      { name: "Mahilyow", cities: ["Mahilyow", "Babruysk", "Bялынічы"] },
      { name: "Vitebsk", cities: ["Vitebsk", "Orsha", "Polotsk"] },
      { name: "Brest", cities: ["Brest", "Baranavichy", "Pinsk"] },
    ],
  },
  {
    name: "Belgium",
    states: [
      { name: "Brussels", cities: ["Brussels", "Ixelles", "Schaerbeek"] },
      { name: "Flanders", cities: ["Antwerp", "Ghent", "Bruges", "Leuven", "Mechelen"] },
      { name: "Wallonia", cities: ["Liège", "Charleroi", "Namur", "Mons", "La Louvière"] },
    ],
  },
  {
    name: "Bolivia",
    states: [
      { name: "La Paz", cities: ["La Paz", "El Alto", "Viacha"] },
      { name: "Santa Cruz", cities: ["Santa Cruz", "Warnes", "La Guardia"] },
      { name: "Cochabamba", cities: ["Cochabamba", "Sacaba", "Quillacollo"] },
    ],
  },
  {
    name: "Brazil",
    states: [
      { name: "São Paulo", cities: ["São Paulo", "Guarulhos", "Campinas", "Santo André", "Ribeirão Preto", "São Bernardo do Campo", "Osasco", "Sorocaba"] },
      { name: "Rio de Janeiro", cities: ["Rio de Janeiro", "São Gonçalo", "Duque de Caxias", "Nova Iguaçu", "Niterói", "Belford Roxo"] },
      { name: "Minas Gerais", cities: ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Betim", "Montes Claros"] },
      { name: "Bahia", cities: ["Salvador", "Feira de Santana", "Vitória da Conquista", "Camaçari"] },
      { name: "Rio Grande do Sul", cities: ["Porto Alegre", "Caxias do Sul", "Pelotas", "Canoas", "Santa Maria"] },
      { name: "Paraná", cities: ["Curitiba", "Londrina", "Maringá", "Ponta Grossa", "Cascavel"] },
      { name: "Pernambuco", cities: ["Recife", "Caruaru", "Petrolina", "Olinda", "Paulista"] },
      { name: "Ceará", cities: ["Fortaleza", "Caucaia", "Juazeiro do Norte", "Maracanaú"] },
      { name: "Amazonas", cities: ["Manaus", "Parintins", "Itacoatiara"] },
      { name: "Goiás", cities: ["Goiânia", "Aparecida de Goiânia", "Anápolis"] },
    ],
  },
  {
    name: "Bulgaria",
    states: [
      { name: "Sofia", cities: ["Sofia", "Pernik", "Blagoevgrad"] },
      { name: "Plovdiv", cities: ["Plovdiv", "Asenovgrad", "Pazardzhik"] },
      { name: "Varna", cities: ["Varna", "Dobrich", "Shumen"] },
    ],
  },
  {
    name: "Cambodia",
    states: [
      { name: "Phnom Penh", cities: ["Phnom Penh"] },
      { name: "Siem Reap", cities: ["Siem Reap", "Sisophon"] },
      { name: "Preah Sihanouk", cities: ["Sihanoukville"] },
    ],
  },
  {
    name: "Cameroon",
    states: [
      { name: "Centre", cities: ["Yaoundé", "Obala", "Soa"] },
      { name: "Littoral", cities: ["Douala", "Nkongsamba", "Edéa"] },
      { name: "North West", cities: ["Bamenda", "Kumbo", "Ndop"] },
    ],
  },
  {
    name: "Canada",
    states: [
      {
        name: "Ontario",
        cities: ["Toronto", "Ottawa", "Mississauga", "Brampton", "Hamilton", "London", "Markham", "Vaughan", "Kitchener", "Windsor", "Richmond Hill", "Oakville", "Burlington", "Greater Sudbury", "Oshawa"],
      },
      {
        name: "Quebec",
        cities: ["Montreal", "Quebec City", "Laval", "Gatineau", "Longueuil", "Sherbrooke", "Saguenay", "Lévis", "Trois-Rivières", "Terrebonne"],
      },
      {
        name: "British Columbia",
        cities: ["Vancouver", "Surrey", "Burnaby", "Richmond", "Abbotsford", "Kelowna", "Coquitlam", "Langley", "Saanich", "Delta", "Kamloops"],
      },
      {
        name: "Alberta",
        cities: ["Calgary", "Edmonton", "Red Deer", "Lethbridge", "St. Albert", "Medicine Hat", "Grande Prairie", "Airdrie", "Spruce Grove"],
      },
      {
        name: "Manitoba",
        cities: ["Winnipeg", "Brandon", "Steinbach", "Thompson", "Portage la Prairie"],
      },
      {
        name: "Saskatchewan",
        cities: ["Saskatoon", "Regina", "Prince Albert", "Moose Jaw", "Swift Current", "Yorkton"],
      },
      {
        name: "Nova Scotia",
        cities: ["Halifax", "Dartmouth", "Sydney", "Truro", "New Glasgow"],
      },
      {
        name: "New Brunswick",
        cities: ["Moncton", "Saint John", "Fredericton", "Dieppe", "Riverview"],
      },
      {
        name: "Newfoundland and Labrador",
        cities: ["St. John's", "Mount Pearl", "Corner Brook", "Conception Bay South"],
      },
      {
        name: "Prince Edward Island",
        cities: ["Charlottetown", "Summerside"],
      },
    ],
  },
  {
    name: "Chile",
    states: [
      { name: "Metropolitan", cities: ["Santiago", "Puente Alto", "San Bernardo", "Maipú"] },
      { name: "Valparaíso", cities: ["Valparaíso", "Viña del Mar", "Quilpué", "Villa Alemana"] },
      { name: "Biobío", cities: ["Concepción", "Talcahuano", "Chiguayante", "San Pedro"] },
    ],
  },
  {
    name: "China",
    states: [
      { name: "Guangdong", cities: ["Guangzhou", "Shenzhen", "Dongguan", "Foshan", "Zhuhai", "Zhongshan", "Shantou", "Jiangmen"] },
      { name: "Jiangsu", cities: ["Nanjing", "Suzhou", "Wuxi", "Changzhou", "Nantong", "Xuzhou"] },
      { name: "Zhejiang", cities: ["Hangzhou", "Ningbo", "Wenzhou", "Shaoxing", "Huzhou", "Jiaxing"] },
      { name: "Shandong", cities: ["Jinan", "Qingdao", "Yantai", "Weifang", "Zibo", "Linyi"] },
      { name: "Henan", cities: ["Zhengzhou", "Luoyang", "Nanyang", "Xinxiang", "Xinyang"] },
      { name: "Sichuan", cities: ["Chengdu", "Mianyang", "Leshan", "Nanchong", "Deyang"] },
      { name: "Hubei", cities: ["Wuhan", "Xiangfan", "Yichang", "Huangshi", "Shashi"] },
      { name: "Hunan", cities: ["Changsha", "Hengyang", "Zhuzhou", "Xiangtan", "Shaoyang"] },
      { name: "Fujian", cities: ["Fuzhou", "Xiamen", "Quanzhou", "Zhangzhou", "Putian"] },
      { name: "Shaanxi", cities: ["Xi'an", "Baoji", "Xianyang", "Weinan", "Hanzhong"] },
      { name: "Beijing Municipality", cities: ["Beijing", "Haidian", "Chaoyang", "Dongcheng"] },
      { name: "Shanghai Municipality", cities: ["Shanghai", "Pudong", "Minhang", "Baoshan"] },
      { name: "Tianjin Municipality", cities: ["Tianjin", "Binhai", "Dongli", "Hexi"] },
      { name: "Yunnan", cities: ["Kunming", "Qujing", "Yuxi", "Dali"] },
      { name: "Liaoning", cities: ["Shenyang", "Dalian", "Anshan", "Fushun", "Benxi"] },
    ],
  },
  {
    name: "Colombia",
    states: [
      { name: "Bogotá D.C.", cities: ["Bogotá", "Usaquén", "Suba", "Chapinero"] },
      { name: "Antioquia", cities: ["Medellín", "Bello", "Itagüí", "Envigado", "Bucaramanga"] },
      { name: "Valle del Cauca", cities: ["Cali", "Buenaventura", "Palmira", "Tuluá"] },
      { name: "Cundinamarca", cities: ["Soacha", "Facatativá", "Zipaquirá", "Chía"] },
    ],
  },
  {
    name: "Croatia",
    states: [
      { name: "Zagreb", cities: ["Zagreb", "Velika Gorica", "Zaprešić"] },
      { name: "Split-Dalmatia", cities: ["Split", "Solin", "Kaštela"] },
      { name: "Rijeka", cities: ["Rijeka", "Opatija", "Crikvenica"] },
    ],
  },
  {
    name: "Czech Republic",
    states: [
      { name: "Prague", cities: ["Prague"] },
      { name: "Central Bohemia", cities: ["Kladno", "Mladá Boleslav", "Příbram"] },
      { name: "South Moravia", cities: ["Brno", "Znojmo", "Hodonín"] },
      { name: "Moravia-Silesia", cities: ["Ostrava", "Frýdek-Místek", "Karviná"] },
    ],
  },
  {
    name: "Denmark",
    states: [
      { name: "Capital Region", cities: ["Copenhagen", "Frederiksberg", "Gentofte"] },
      { name: "Zealand", cities: ["Roskilde", "Køge", "Slagelse"] },
      { name: "Central Jutland", cities: ["Aarhus", "Viborg", "Silkeborg"] },
      { name: "Southern Denmark", cities: ["Odense", "Esbjerg", "Kolding"] },
    ],
  },
  {
    name: "Ecuador",
    states: [
      { name: "Pichincha", cities: ["Quito", "Cayambe", "Rumiñahui"] },
      { name: "Guayas", cities: ["Guayaquil", "Samborondón", "Durán"] },
      { name: "Azuay", cities: ["Cuenca", "Gualaceo", "Santa Isabel"] },
    ],
  },
  {
    name: "Egypt",
    states: [
      { name: "Cairo", cities: ["Cairo", "Shubra El-Kheima", "Helwan"] },
      { name: "Giza", cities: ["Giza", "October City", "Imbaba"] },
      { name: "Alexandria", cities: ["Alexandria", "Borg El Arab", "Sidi Gaber"] },
      { name: "Dakahlia", cities: ["Mansoura", "Talkha", "Mit Ghamr"] },
      { name: "Sharqia", cities: ["Zagazig", "Belbeis", "Hihya"] },
      { name: "Qalyubia", cities: ["Benha", "Qalyub", "Shubra El-Kheima"] },
      { name: "Luxor", cities: ["Luxor", "Esna", "Armant"] },
      { name: "Aswan", cities: ["Aswan", "Kom Ombo", "Edfu"] },
    ],
  },
  {
    name: "Ethiopia",
    states: [
      { name: "Addis Ababa", cities: ["Addis Ababa"] },
      { name: "Oromia", cities: ["Adama", "Dire Dawa", "Jimma", "Bishoftu"] },
      { name: "Amhara", cities: ["Bahir Dar", "Gondar", "Dessie", "Debre Birhan"] },
      { name: "Tigray", cities: ["Mekelle", "Adwa", "Axum"] },
    ],
  },
  {
    name: "Finland",
    states: [
      { name: "Uusimaa", cities: ["Helsinki", "Espoo", "Vantaa", "Tampere"] },
      { name: "Pirkanmaa", cities: ["Tampere", "Nokia", "Ylöjärvi"] },
      { name: "Southwest Finland", cities: ["Turku", "Naantali", "Kaarina"] },
    ],
  },
  {
    name: "France",
    states: [
      { name: "Île-de-France", cities: ["Paris", "Boulogne-Billancourt", "Saint-Denis", "Argenteuil", "Montreuil", "Versailles"] },
      { name: "Auvergne-Rhône-Alpes", cities: ["Lyon", "Grenoble", "Saint-Étienne", "Clermont-Ferrand", "Valence"] },
      { name: "Hauts-de-France", cities: ["Lille", "Amiens", "Roubaix", "Tourcoing", "Reims"] },
      { name: "Nouvelle-Aquitaine", cities: ["Bordeaux", "Limoges", "Poitiers", "Pau", "La Rochelle"] },
      { name: "Occitanie", cities: ["Toulouse", "Montpellier", "Nîmes", "Perpignan", "Béziers"] },
      { name: "Provence-Alpes-Côte d'Azur", cities: ["Marseille", "Nice", "Toulon", "Aix-en-Provence", "Avignon"] },
      { name: "Grand Est", cities: ["Strasbourg", "Reims", "Metz", "Mulhouse", "Nancy"] },
      { name: "Pays de la Loire", cities: ["Nantes", "Angers", "Le Mans", "Saint-Nazaire"] },
      { name: "Normandie", cities: ["Rouen", "Caen", "Le Havre", "Cherbourg"] },
      { name: "Bretagne", cities: ["Rennes", "Brest", "Quimper", "Lorient"] },
    ],
  },
  {
    name: "Germany",
    states: [
      { name: "Bavaria", cities: ["Munich", "Nuremberg", "Augsburg", "Regensburg", "Ingolstadt", "Würzburg", "Erlangen"] },
      { name: "North Rhine-Westphalia", cities: ["Cologne", "Düsseldorf", "Dortmund", "Essen", "Duisburg", "Bochum", "Wuppertal", "Bielefeld", "Bonn", "Münster"] },
      { name: "Baden-Württemberg", cities: ["Stuttgart", "Karlsruhe", "Mannheim", "Freiburg im Breisgau", "Heidelberg", "Ulm"] },
      { name: "Berlin", cities: ["Berlin", "Spandau", "Charlottenburg", "Mitte", "Prenzlauer Berg"] },
      { name: "Hamburg", cities: ["Hamburg", "Harburg", "Wandsbek", "Altona"] },
      { name: "Hesse", cities: ["Frankfurt", "Wiesbaden", "Kassel", "Darmstadt", "Offenbach"] },
      { name: "Lower Saxony", cities: ["Hanover", "Braunschweig", "Osnabrück", "Oldenburg", "Göttingen"] },
      { name: "Saxony", cities: ["Leipzig", "Dresden", "Chemnitz", "Zwickau"] },
      { name: "Rhineland-Palatinate", cities: ["Mainz", "Ludwigshafen", "Koblenz", "Trier"] },
      { name: "Brandenburg", cities: ["Potsdam", "Cottbus", "Frankfurt (Oder)"] },
      { name: "Saxony-Anhalt", cities: ["Halle", "Magdeburg", "Dessau"] },
      { name: "Schleswig-Holstein", cities: ["Kiel", "Lübeck", "Flensburg"] },
      { name: "Thuringia", cities: ["Erfurt", "Jena", "Gera"] },
    ],
  },
  {
    name: "Ghana",
    states: [
      { name: "Greater Accra", cities: ["Accra", "Tema", "Kasoa"] },
      { name: "Ashanti", cities: ["Kumasi", "Obuasi", "Konongo"] },
      { name: "Western", cities: ["Sekondi-Takoradi", "Tarkwa", "Sefwi Wiawso"] },
    ],
  },
  {
    name: "Greece",
    states: [
      { name: "Attica", cities: ["Athens", "Piraeus", "Peristeri", "Kallithea"] },
      { name: "Central Macedonia", cities: ["Thessaloniki", "Serres", "Katerini"] },
      { name: "Crete", cities: ["Heraklion", "Chania", "Rethymno"] },
    ],
  },
  {
    name: "India",
    states: [
      {
        name: "Andhra Pradesh",
        cities: ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Rajahmundry", "Kakinada", "Tirupati", "Kadapa", "Anantapur", "Vizianagaram", "Eluru", "Ongole", "Nandyal", "Machilipatnam"],
      },
      {
        name: "Arunachal Pradesh",
        cities: ["Itanagar", "Naharlagun", "Pasighat", "Namsai", "Tawang", "Bomdila", "Ziro"],
      },
      {
        name: "Assam",
        cities: ["Guwahati", "Dibrugarh", "Silchar", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", "Sivasagar", "Dhubri", "Karimganj", "Goalpara"],
      },
      {
        name: "Bihar",
        cities: ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga", "Arrah", "Begusarai", "Katihar", "Munger", "Sitamarhi", "Hajipur", "Purnia", "Sasaram", "Motihari", "Bettiah"],
      },
      {
        name: "Chhattisgarh",
        cities: ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon", "Jagdalpur", "Ambikapur", "Dhamtari", "Mahasamund"],
      },
      {
        name: "Goa",
        cities: ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Bicholim"],
      },
      {
        name: "Gujarat",
        cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Junagadh", "Anand", "Navsari", "Morbi", "Mehsana", "Surendranagar", "Bharuch", "Valsad"],
      },
      {
        name: "Haryana",
        cities: ["Faridabad", "Gurugram", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal", "Sonipat", "Panchkula", "Bhiwani", "Sirsa", "Bahadurgarh", "Jind", "Thanesar"],
      },
      {
        name: "Himachal Pradesh",
        cities: ["Shimla", "Mandi", "Solan", "Palampur", "Baddi", "Kullu", "Dharamsala", "Nahan", "Hamirpur", "Una", "Chamba"],
      },
      {
        name: "Jharkhand",
        cities: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro Steel City", "Deoghar", "Hazaribagh", "Giridih", "Ramgarh", "Phusro", "Adityapur"],
      },
      {
        name: "Karnataka",
        cities: ["Bangalore", "Hubli-Dharwad", "Mysuru", "Mangaluru", "Belagavi", "Kalaburagi", "Ballari", "Davanagere", "Shivamogga", "Tumkur", "Raichur", "Bidar", "Vijayapura", "Udupi", "Hassan"],
      },
      {
        name: "Kerala",
        cities: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Palakkad", "Alappuzha", "Malappuram", "Kannur", "Kasaragod", "Kottayam", "Idukki", "Pathanamthitta"],
      },
      {
        name: "Madhya Pradesh",
        cities: ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa", "Murwara", "Singrauli", "Burhanpur", "Khandwa", "Bhind"],
      },
      {
        name: "Maharashtra",
        cities: ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Amravati", "Kolhapur", "Navi Mumbai", "Akola", "Latur", "Dhule", "Ahmednagar", "Chandrapur", "Parbhani", "Ichalkaranji", "Jalna", "Sangli", "Bhiwandi"],
      },
      {
        name: "Manipur",
        cities: ["Imphal", "Thoubal", "Kakching", "Ukhrul", "Churachandpur", "Senapati"],
      },
      {
        name: "Meghalaya",
        cities: ["Shillong", "Tura", "Jowai", "Nongpoh", "Nongstoin"],
      },
      {
        name: "Mizoram",
        cities: ["Aizawl", "Lunglei", "Champhai", "Serchhip"],
      },
      {
        name: "Nagaland",
        cities: ["Dimapur", "Kohima", "Mokokchung", "Wokha", "Zunheboto"],
      },
      {
        name: "Odisha",
        cities: ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Bhadrak", "Baripada", "Brahmapur"],
      },
      {
        name: "Punjab",
        cities: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Pathankot", "Hoshiarpur", "Moga", "Abohar", "Malerkotla", "Khanna", "Phagwara", "Muktsar", "Barnala", "Firozpur"],
      },
      {
        name: "Rajasthan",
        cities: ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Bhilwara", "Alwar", "Bharatpur", "Sikar", "Pali", "Sri Ganganagar", "Nagaur", "Chittorgarh", "Tonk"],
      },
      {
        name: "Sikkim",
        cities: ["Gangtok", "Namchi", "Geyzing", "Mangan"],
      },
      {
        name: "Tamil Nadu",
        cities: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Tiruppur", "Vellore", "Erode", "Thoothukudi", "Ambattur", "Tiruvannamalai", "Avadi", "Thanjavur", "Karur"],
      },
      {
        name: "Telangana",
        cities: ["Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar", "Ramagundam", "Secunderabad", "Mahabubnagar", "Nalgonda", "Adilabad", "Siddipet"],
      },
      {
        name: "Tripura",
        cities: ["Agartala", "Udaipur", "Dharmanagar", "Kailasahar"],
      },
      {
        name: "Uttar Pradesh",
        cities: ["Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut", "Allahabad", "Bareilly", "Aligarh", "Moradabad", "Saharanpur", "Gorakhpur", "Noida", "Ghaziabad", "Firozabad", "Jhansi", "Mathura", "Shahjahanpur", "Rampur", "Muzaffarnagar", "Hapur"],
      },
      {
        name: "Uttarakhand",
        cities: ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Kashipur", "Rudrapur", "Rishikesh", "Kotdwar", "Ramnagar", "Pithoragarh"],
      },
      {
        name: "West Bengal",
        cities: ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Bardhaman", "Maheshtala", "Rajpur Sonarpur", "South Dumdum", "Behala", "Kharagpur", "Haldia", "Raiganj", "Jalpaiguri", "Krishnanagar"],
      },
      {
        name: "Delhi",
        cities: ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "Dwarka", "Rohini", "Janakpuri", "Lajpat Nagar", "Preet Vihar", "Pitampura", "Vasant Kunj", "Mayur Vihar", "Shahdara"],
      },
      {
        name: "Jammu and Kashmir",
        cities: ["Srinagar", "Jammu", "Anantnag", "Sopore", "Baramulla", "Kathua", "Udhampur", "Poonch", "Rajouri"],
      },
      {
        name: "Ladakh",
        cities: ["Leh", "Kargil", "Nubra"],
      },
      {
        name: "Chandigarh",
        cities: ["Chandigarh"],
      },
      {
        name: "Puducherry",
        cities: ["Puducherry", "Karaikal", "Mahe", "Yanam"],
      },
    ],
  },
  {
    name: "Indonesia",
    states: [
      { name: "Jakarta", cities: ["Jakarta", "Bekasi", "Depok", "Tangerang", "South Tangerang"] },
      { name: "West Java", cities: ["Bandung", "Bogor", "Tasikmalaya", "Cimahi", "Sukabumi"] },
      { name: "East Java", cities: ["Surabaya", "Malang", "Madiun", "Kediri", "Blitar"] },
      { name: "Central Java", cities: ["Semarang", "Surakarta", "Tegal", "Pekalongan", "Salatiga"] },
      { name: "Bali", cities: ["Denpasar", "Singaraja", "Tabanan", "Gianyar"] },
      { name: "South Sulawesi", cities: ["Makassar", "Parepare", "Palopo"] },
      { name: "North Sumatra", cities: ["Medan", "Binjai", "Tebing Tinggi", "Pematangsiantar"] },
      { name: "South Sumatra", cities: ["Palembang", "Lubuklinggau", "Prabumulih"] },
    ],
  },
  {
    name: "Iran",
    states: [
      { name: "Tehran", cities: ["Tehran", "Karaj", "Shahr-e Rey", "Shahryar"] },
      { name: "Isfahan", cities: ["Isfahan", "Kashan", "Khomeyni Shahr"] },
      { name: "Razavi Khorasan", cities: ["Mashhad", "Neyshabur", "Sabzevar"] },
      { name: "Fars", cities: ["Shiraz", "Marvdasht", "Jahrom"] },
      { name: "Khuzestan", cities: ["Ahvaz", "Dezful", "Khorramshahr"] },
    ],
  },
  {
    name: "Iraq",
    states: [
      { name: "Baghdad", cities: ["Baghdad", "Abu Ghraib", "Al Tarmiyah"] },
      { name: "Basra", cities: ["Basra", "Zubayr", "Shatt al-Arab"] },
      { name: "Erbil", cities: ["Erbil", "Koya", "Makhmur"] },
      { name: "Mosul (Nineveh)", cities: ["Mosul", "Tal Afar", "Sinjar"] },
    ],
  },
  {
    name: "Ireland",
    states: [
      { name: "Leinster", cities: ["Dublin", "Dún Laoghaire", "Drogheda", "Swords", "Dundalk"] },
      { name: "Munster", cities: ["Cork", "Limerick", "Waterford", "Clonmel", "Tralee"] },
      { name: "Connacht", cities: ["Galway", "Castlebar", "Sligo"] },
      { name: "Ulster", cities: ["Letterkenny", "Monaghan", "Cavan"] },
    ],
  },
  {
    name: "Israel",
    states: [
      { name: "Tel Aviv", cities: ["Tel Aviv", "Bnei Brak", "Petah Tikva", "Holon"] },
      { name: "Jerusalem", cities: ["Jerusalem", "Bethlehem"] },
      { name: "Haifa", cities: ["Haifa", "Acre", "Nazareth"] },
    ],
  },
  {
    name: "Italy",
    states: [
      { name: "Lombardy", cities: ["Milan", "Brescia", "Bergamo", "Monza", "Como", "Varese"] },
      { name: "Lazio", cities: ["Rome", "Latina", "Frosinone", "Viterbo"] },
      { name: "Campania", cities: ["Naples", "Salerno", "Caserta", "Pozzuoli"] },
      { name: "Sicily", cities: ["Palermo", "Catania", "Messina", "Agrigento"] },
      { name: "Veneto", cities: ["Venice", "Verona", "Padua", "Vicenza", "Treviso"] },
      { name: "Emilia-Romagna", cities: ["Bologna", "Modena", "Parma", "Reggio Emilia", "Ferrara"] },
      { name: "Tuscany", cities: ["Florence", "Prato", "Livorno", "Arezzo", "Pisa"] },
      { name: "Piedmont", cities: ["Turin", "Novara", "Asti", "Alessandria"] },
    ],
  },
  {
    name: "Japan",
    states: [
      { name: "Tokyo", cities: ["Shinjuku", "Shibuya", "Minato", "Chiyoda", "Hachioji", "Tachikawa"] },
      { name: "Osaka", cities: ["Osaka", "Sakai", "Higashiosaka", "Toyonaka", "Suita"] },
      { name: "Kanagawa", cities: ["Yokohama", "Kawasaki", "Sagamihara", "Fujisawa"] },
      { name: "Aichi", cities: ["Nagoya", "Toyota", "Toyohashi", "Okazaki"] },
      { name: "Saitama", cities: ["Saitama City", "Kawaguchi", "Kawagoe", "Tokorozawa"] },
      { name: "Chiba", cities: ["Chiba City", "Funabashi", "Matsudo", "Kashiwa"] },
      { name: "Fukuoka", cities: ["Fukuoka City", "Kitakyushu", "Kurume", "Omuta"] },
      { name: "Hokkaido", cities: ["Sapporo", "Hakodate", "Asahikawa", "Kushiro"] },
      { name: "Hyogo", cities: ["Kobe", "Himeji", "Nishinomiya", "Amagasaki"] },
      { name: "Kyoto", cities: ["Kyoto City", "Uji", "Maizuru"] },
    ],
  },
  {
    name: "Jordan",
    states: [
      { name: "Amman", cities: ["Amman", "Zarqa", "Madaba"] },
      { name: "Irbid", cities: ["Irbid", "Ramtha", "Ajloun"] },
      { name: "Zarqa", cities: ["Zarqa", "Rusaifa"] },
      { name: "Aqaba", cities: ["Aqaba"] },
    ],
  },
  {
    name: "Kazakhstan",
    states: [
      { name: "Almaty", cities: ["Almaty", "Talgar", "Kapshagay"] },
      { name: "Astana", cities: ["Astana", "Kosshy"] },
      { name: "Karaganda", cities: ["Karaganda", "Temirtau", "Zhezkazgan"] },
      { name: "East Kazakhstan", cities: ["Ust-Kamenogorsk", "Semey"] },
    ],
  },
  {
    name: "Kenya",
    states: [
      { name: "Nairobi", cities: ["Nairobi"] },
      { name: "Mombasa", cities: ["Mombasa", "Malindi", "Kilifi"] },
      { name: "Kisumu", cities: ["Kisumu", "Homa Bay", "Siaya"] },
      { name: "Nakuru", cities: ["Nakuru", "Naivasha", "Eldoret"] },
    ],
  },
  {
    name: "Kuwait",
    states: [
      { name: "Kuwait City", cities: ["Kuwait City", "Salmiya", "Hawalli"] },
      { name: "Ahmadi", cities: ["Ahmadi", "Fahaheel", "Abu Halifa"] },
      { name: "Al Jahra", cities: ["Al Jahra", "Sulaibiya"] },
    ],
  },
  {
    name: "Malaysia",
    states: [
      { name: "Selangor", cities: ["Shah Alam", "Petaling Jaya", "Subang Jaya", "Klang", "Ampang Jaya"] },
      { name: "Kuala Lumpur", cities: ["Kuala Lumpur"] },
      { name: "Johor", cities: ["Johor Bahru", "Batu Pahat", "Muar", "Kluang", "Segamat"] },
      { name: "Penang", cities: ["George Town", "Butterworth", "Bukit Mertajam"] },
      { name: "Sabah", cities: ["Kota Kinabalu", "Sandakan", "Tawau", "Keningau"] },
      { name: "Sarawak", cities: ["Kuching", "Miri", "Sibu", "Bintulu"] },
      { name: "Perak", cities: ["Ipoh", "Taiping", "Teluk Intan"] },
      { name: "Pahang", cities: ["Kuantan", "Temerloh", "Raub"] },
      { name: "Kedah", cities: ["Alor Setar", "Sungai Petani", "Kulim"] },
      { name: "Negeri Sembilan", cities: ["Seremban", "Port Dickson", "Nilai"] },
    ],
  },
  {
    name: "Mexico",
    states: [
      { name: "Mexico City", cities: ["Mexico City", "Gustavo A. Madero", "Iztapalapa", "Tlalpan"] },
      { name: "State of Mexico", cities: ["Ecatepec de Morelos", "Neza", "Toluca", "Naucalpan"] },
      { name: "Jalisco", cities: ["Guadalajara", "Zapopan", "Tlaquepaque", "Tonalá"] },
      { name: "Nuevo León", cities: ["Monterrey", "Apodaca", "General Escobedo", "San Nicolás de los Garza"] },
      { name: "Baja California", cities: ["Tijuana", "Mexicali", "Ensenada", "Tecate"] },
      { name: "Puebla", cities: ["Puebla City", "Tehuacán", "Cholula"] },
      { name: "Veracruz", cities: ["Veracruz", "Xalapa", "Coatzacoalcos"] },
      { name: "Chihuahua", cities: ["Ciudad Juárez", "Chihuahua City", "Delicias"] },
    ],
  },
  {
    name: "Morocco",
    states: [
      { name: "Casablanca-Settat", cities: ["Casablanca", "Mohammedia", "Settat", "El Jadida"] },
      { name: "Rabat-Salé-Kénitra", cities: ["Rabat", "Salé", "Kénitra", "Témara"] },
      { name: "Marrakech-Safi", cities: ["Marrakech", "Safi", "Essaouira"] },
      { name: "Fès-Meknès", cities: ["Fès", "Meknès", "Sefrou"] },
      { name: "Souss-Massa", cities: ["Agadir", "Inezgane", "Tiznit"] },
    ],
  },
  {
    name: "Myanmar",
    states: [
      { name: "Yangon Region", cities: ["Yangon", "Mandalay", "Naypyidaw"] },
      { name: "Mandalay Region", cities: ["Mandalay", "Sagaing", "Pyin Oo Lwin"] },
      { name: "Ayeyarwady Region", cities: ["Pathein", "Maubin"] },
    ],
  },
  {
    name: "Nepal",
    states: [
      { name: "Bagmati", cities: ["Kathmandu", "Lalitpur", "Bhaktapur", "Kirtipur", "Madhyapur Thimi"] },
      { name: "Lumbini", cities: ["Butwal", "Bhairahawa", "Ghorahi", "Tulsipur"] },
      { name: "Gandaki", cities: ["Pokhara", "Waling", "Damauli"] },
      { name: "Koshi", cities: ["Biratnagar", "Dharan", "Inaruwa", "Itahari"] },
    ],
  },
  {
    name: "Netherlands",
    states: [
      { name: "North Holland", cities: ["Amsterdam", "Haarlem", "Zaandam", "Alkmaar"] },
      { name: "South Holland", cities: ["Rotterdam", "The Hague", "Leiden", "Dordrecht"] },
      { name: "Utrecht", cities: ["Utrecht", "Nieuwegein", "Amersfoort"] },
      { name: "North Brabant", cities: ["Eindhoven", "Tilburg", "Breda", "Helmond"] },
      { name: "Gelderland", cities: ["Nijmegen", "Arnhem", "Apeldoorn", "Ede"] },
      { name: "Overijssel", cities: ["Enschede", "Zwolle", "Deventer"] },
    ],
  },
  {
    name: "New Zealand",
    states: [
      { name: "Auckland", cities: ["Auckland", "Manukau", "North Shore", "Waitakere"] },
      { name: "Wellington", cities: ["Wellington", "Lower Hutt", "Upper Hutt", "Porirua"] },
      { name: "Canterbury", cities: ["Christchurch", "Selwyn", "Waimakariri"] },
      { name: "Waikato", cities: ["Hamilton", "Tauranga", "Rotorua"] },
    ],
  },
  {
    name: "Nigeria",
    states: [
      { name: "Lagos", cities: ["Lagos", "Ikeja", "Abeokuta", "Ikorodu", "Badagry"] },
      { name: "Kano", cities: ["Kano", "Wudil", "Gwarzo"] },
      { name: "Rivers", cities: ["Port Harcourt", "Obio-Akpor", "Okrika"] },
      { name: "Oyo", cities: ["Ibadan", "Ogbomosho", "Oyo", "Iseyin"] },
      { name: "FCT", cities: ["Abuja", "Gwagwalada", "Kuje"] },
      { name: "Anambra", cities: ["Onitsha", "Awka", "Nnewi", "Ekwulobia"] },
      { name: "Kaduna", cities: ["Kaduna", "Zaria", "Kafanchan"] },
      { name: "Delta", cities: ["Warri", "Asaba", "Ughelli"] },
    ],
  },
  {
    name: "Norway",
    states: [
      { name: "Oslo", cities: ["Oslo", "Bærum", "Lørenskog"] },
      { name: "Viken", cities: ["Drammen", "Fredrikstad", "Lillestrøm"] },
      { name: "Vestland", cities: ["Bergen", "Ålesund", "Sogndal"] },
      { name: "Trøndelag", cities: ["Trondheim", "Steinkjer", "Stjørdal"] },
    ],
  },
  {
    name: "Oman",
    states: [
      { name: "Muscat", cities: ["Muscat", "Seeb", "Bawshar", "Mutrah"] },
      { name: "Dhofar", cities: ["Salalah", "Thumrait", "Mirbat"] },
      { name: "Al Batinah North", cities: ["Sohar", "Barka", "Shinas"] },
    ],
  },
  {
    name: "Pakistan",
    states: [
      {
        name: "Punjab",
        cities: ["Lahore", "Faisalabad", "Rawalpindi", "Gujranwala", "Multan", "Sialkot", "Sargodha", "Bahawalpur", "Sheikhupura", "Jhang", "Gujrat", "Chiniot", "Kasur", "Rahim Yar Khan", "Okara", "Sahiwal", "Wah Cantonment", "Mandi Bahauddin", "Hafizabad", "Jhelum"],
      },
      {
        name: "Sindh",
        cities: ["Karachi", "Hyderabad", "Sukkur", "Larkana", "Nawabshah", "Mirpur Khas", "Jacobabad", "Shikarpur", "Khairpur", "Dadu", "Thatta", "Tando Adam", "Badin", "Umerkot", "Kotri"],
      },
      {
        name: "Khyber Pakhtunkhwa",
        cities: ["Peshawar", "Mardan", "Mingora", "Abbottabad", "Kohat", "Dera Ismail Khan", "Nowshera", "Charsadda", "Bannu", "Swabi", "Mansehra", "Haripur", "Buner"],
      },
      {
        name: "Balochistan",
        cities: ["Quetta", "Turbat", "Khuzdar", "Hub", "Chaman", "Gwadar", "Zhob", "Sibi", "Dera Murad Jamali"],
      },
      {
        name: "Islamabad Capital Territory",
        cities: ["Islamabad"],
      },
      {
        name: "Azad Kashmir",
        cities: ["Muzaffarabad", "Mirpur", "Kotli", "Rawalakot", "Bhimber"],
      },
      {
        name: "Gilgit-Baltistan",
        cities: ["Gilgit", "Skardu", "Chilas", "Ghanche"],
      },
    ],
  },
  {
    name: "Peru",
    states: [
      { name: "Lima", cities: ["Lima", "Callao", "Arequipa", "Trujillo"] },
      { name: "Arequipa", cities: ["Arequipa", "Camaná", "Mollendo"] },
      { name: "La Libertad", cities: ["Trujillo", "Chimbote", "La Esperanza"] },
    ],
  },
  {
    name: "Philippines",
    states: [
      { name: "Metro Manila", cities: ["Manila", "Quezon City", "Caloocan", "Davao", "Cebu City", "Pasig", "Taguig", "Parañaque", "Valenzuela"] },
      { name: "Central Visayas", cities: ["Cebu City", "Mandaue", "Lapu-Lapu", "Talisay"] },
      { name: "Davao Region", cities: ["Davao City", "Tagum", "Digos", "Panabo"] },
      { name: "Calabarzon", cities: ["Antipolo", "Bacoor", "Dasmarinas", "Calamba", "Imus"] },
      { name: "Central Luzon", cities: ["San Jose del Monte", "Olongapo", "Angeles", "Cabanatuan"] },
    ],
  },
  {
    name: "Poland",
    states: [
      { name: "Masovia", cities: ["Warsaw", "Radom", "Płock", "Siedlce"] },
      { name: "Lesser Poland", cities: ["Kraków", "Tarnów", "Nowy Sącz"] },
      { name: "Silesia", cities: ["Katowice", "Częstochowa", "Sosnowiec", "Gliwice"] },
      { name: "Greater Poland", cities: ["Poznań", "Kalisz", "Konin", "Gniezno"] },
      { name: "Pomerania", cities: ["Gdańsk", "Gdynia", "Sopot", "Słupsk"] },
    ],
  },
  {
    name: "Portugal",
    states: [
      { name: "Lisbon", cities: ["Lisbon", "Amadora", "Loures", "Oeiras", "Sintra"] },
      { name: "Porto", cities: ["Porto", "Vila Nova de Gaia", "Matosinhos", "Braga"] },
      { name: "Algarve", cities: ["Faro", "Portimão", "Loulé", "Lagos"] },
    ],
  },
  {
    name: "Qatar",
    states: [
      { name: "Doha", cities: ["Doha", "Al Rayyan", "Al Wakra"] },
      { name: "Al Khor", cities: ["Al Khor", "Al Thakhira"] },
    ],
  },
  {
    name: "Romania",
    states: [
      { name: "Bucharest", cities: ["Bucharest"] },
      { name: "Cluj", cities: ["Cluj-Napoca", "Dej", "Turda"] },
      { name: "Timiș", cities: ["Timișoara", "Lugoj", "Sânnicolau Mare"] },
      { name: "Iași", cities: ["Iași", "Pașcani"] },
    ],
  },
  {
    name: "Russia",
    states: [
      { name: "Moscow Oblast", cities: ["Moscow", "Korolev", "Balashikha", "Khimki", "Podolsk", "Mytishchi"] },
      { name: "Saint Petersburg", cities: ["Saint Petersburg", "Kolpino", "Pushkin"] },
      { name: "Krasnodar Krai", cities: ["Krasnodar", "Sochi", "Novorossiysk"] },
      { name: "Sverdlovsk Oblast", cities: ["Yekaterinburg", "Nizhny Tagil", "Pervouralsk"] },
      { name: "Novosibirsk Oblast", cities: ["Novosibirsk", "Berdsk", "Ob"] },
      { name: "Tatarstan", cities: ["Kazan", "Naberezhnye Chelny", "Nizhnekamsk"] },
      { name: "Chelyabinsk Oblast", cities: ["Chelyabinsk", "Magnitogorsk", "Zlatoust"] },
      { name: "Nizhny Novgorod Oblast", cities: ["Nizhny Novgorod", "Dzerzhinsk", "Arzamas"] },
      { name: "Bashkortostan", cities: ["Ufa", "Sterlitamak", "Salavat"] },
      { name: "Samara Oblast", cities: ["Samara", "Tolyatti", "Syzran"] },
    ],
  },
  {
    name: "Saudi Arabia",
    states: [
      {
        name: "Riyadh",
        cities: ["Riyadh", "Al Kharj", "Dawadmi", "Al Quwayiyah", "Hawtah Sudayr", "Diriyah", "Al Muzahimiyah"],
      },
      {
        name: "Mecca (Makkah)",
        cities: ["Mecca", "Jeddah", "Taif", "Al Qunfudhah", "Rabigh", "Yanbu Al Bahr"],
      },
      {
        name: "Medina",
        cities: ["Medina", "Yanbu", "Al Ula", "Ar Rass", "Al Qurrayat"],
      },
      {
        name: "Eastern Province",
        cities: ["Dammam", "Al-Ahsa (Hofuf)", "Dhahran", "Jubail", "Khobar", "Qatif", "Abqaiq"],
      },
      {
        name: "Asir",
        cities: ["Abha", "Khamis Mushait", "Bisha", "An Namas"],
      },
      {
        name: "Najran",
        cities: ["Najran", "Sharura", "Yadama"],
      },
      {
        name: "Jizan",
        cities: ["Jizan", "Sabya", "Abu Arish", "Farasan"],
      },
      {
        name: "Al Qassim",
        cities: ["Buraidah", "Unaizah", "Al Rass", "Al Badayea"],
      },
      {
        name: "Tabuk",
        cities: ["Tabuk", "Taymaa", "Umluj", "Al Wajh"],
      },
      {
        name: "Hail",
        cities: ["Hail", "Baqaa", "Al Ghazalah"],
      },
    ],
  },
  {
    name: "Senegal",
    states: [
      { name: "Dakar", cities: ["Dakar", "Pikine", "Guédiawaye"] },
      { name: "Thiès", cities: ["Thiès", "Mbour", "Tivaouane"] },
    ],
  },
  {
    name: "Serbia",
    states: [
      { name: "Belgrade", cities: ["Belgrade", "Zemun", "Novi Beograd"] },
      { name: "Vojvodina", cities: ["Novi Sad", "Subotica", "Zrenjanin"] },
      { name: "Šumadija", cities: ["Kragujevac", "Čačak", "Jagodina"] },
    ],
  },
  {
    name: "Singapore",
    states: [
      { name: "Singapore", cities: ["Singapore", "Tampines", "Woodlands", "Jurong East", "Bedok"] },
    ],
  },
  {
    name: "South Africa",
    states: [
      { name: "Gauteng", cities: ["Johannesburg", "Pretoria", "Soweto", "Benoni", "Boksburg", "Tembisa", "Vereeniging"] },
      { name: "Western Cape", cities: ["Cape Town", "Stellenbosch", "Paarl", "George", "Knysna"] },
      { name: "KwaZulu-Natal", cities: ["Durban", "Pietermaritzburg", "Newcastle", "Richards Bay", "Port Shepstone"] },
      { name: "Eastern Cape", cities: ["Port Elizabeth", "East London", "Mthatha", "Queenstown"] },
      { name: "Limpopo", cities: ["Polokwane", "Tzaneen", "Thohoyandou", "Mokopane"] },
      { name: "Mpumalanga", cities: ["Mbombela", "Middelburg", "Secunda", "Witbank"] },
      { name: "North West", cities: ["Rustenburg", "Klerksdorp", "Mahikeng", "Potchefstroom"] },
      { name: "Free State", cities: ["Bloemfontein", "Welkom", "Sasolburg", "Kroonstad"] },
    ],
  },
  {
    name: "South Korea",
    states: [
      { name: "Seoul", cities: ["Seoul", "Suwon", "Seongnam", "Goyang", "Incheon"] },
      { name: "Gyeonggi", cities: ["Suwon", "Seongnam", "Goyang", "Bucheon", "Ansan"] },
      { name: "Busan", cities: ["Busan", "Kimhae"] },
      { name: "Daegu", cities: ["Daegu", "Gyeongsan"] },
      { name: "Incheon", cities: ["Incheon"] },
      { name: "Gwangju", cities: ["Gwangju", "Naju"] },
      { name: "South Gyeongsang", cities: ["Changwon", "Jinju", "Tongyeong"] },
    ],
  },
  {
    name: "Spain",
    states: [
      { name: "Community of Madrid", cities: ["Madrid", "Alcalá de Henares", "Leganés", "Getafe", "Alcorcón"] },
      { name: "Catalonia", cities: ["Barcelona", "L'Hospitalet de Llobregat", "Terrassa", "Badalona", "Sabadell"] },
      { name: "Andalusia", cities: ["Seville", "Málaga", "Córdoba", "Granada", "Jerez de la Frontera"] },
      { name: "Valencia", cities: ["Valencia", "Alicante", "Elche", "Castellón de la Plana"] },
      { name: "Basque Country", cities: ["Bilbao", "Vitoria-Gasteiz", "San Sebastián"] },
      { name: "Galicia", cities: ["Vigo", "A Coruña", "Ourense", "Lugo"] },
      { name: "Castile and León", cities: ["Valladolid", "Salamanca", "Burgos", "León"] },
    ],
  },
  {
    name: "Sri Lanka",
    states: [
      { name: "Western Province", cities: ["Colombo", "Dehiwala-Mount Lavinia", "Moratuwa", "Sri Jayawardenepura Kotte", "Kelaniya"] },
      { name: "Central Province", cities: ["Kandy", "Matale", "Nuwara Eliya", "Dambulla"] },
      { name: "Southern Province", cities: ["Galle", "Matara", "Hambantota"] },
      { name: "Northern Province", cities: ["Jaffna", "Vavuniya", "Mannar"] },
      { name: "Eastern Province", cities: ["Trincomalee", "Batticaloa", "Ampara"] },
      { name: "North Western Province", cities: ["Kurunegala", "Puttalam", "Chilaw"] },
      { name: "Sabaragamuwa Province", cities: ["Ratnapura", "Kegalle"] },
      { name: "Uva Province", cities: ["Badulla", "Monaragala"] },
      { name: "North Central Province", cities: ["Anuradhapura", "Polonnaruwa"] },
    ],
  },
  {
    name: "Sudan",
    states: [
      { name: "Khartoum", cities: ["Khartoum", "Omdurman", "North Khartoum"] },
      { name: "Gezira", cities: ["Wad Madani", "Managil", "Hasaheisa"] },
      { name: "Northern", cities: ["Merowe", "Dongola", "Abu Hamad"] },
    ],
  },
  {
    name: "Sweden",
    states: [
      { name: "Stockholm", cities: ["Stockholm", "Solna", "Sundbyberg", "Södertälje"] },
      { name: "Västra Götaland", cities: ["Gothenburg", "Borås", "Mölndal", "Trollhättan"] },
      { name: "Skåne", cities: ["Malmö", "Helsingborg", "Lund", "Kristianstad"] },
      { name: "Uppsala", cities: ["Uppsala", "Enköping", "Tierp"] },
    ],
  },
  {
    name: "Switzerland",
    states: [
      { name: "Zurich", cities: ["Zurich", "Winterthur", "Uster", "Kloten"] },
      { name: "Bern", cities: ["Bern", "Biel/Bienne", "Thun", "Köniz"] },
      { name: "Vaud", cities: ["Lausanne", "Yverdon-les-Bains", "Montreux"] },
      { name: "Geneva", cities: ["Geneva", "Carouge", "Lancy"] },
    ],
  },
  {
    name: "Syria",
    states: [
      { name: "Damascus", cities: ["Damascus"] },
      { name: "Aleppo", cities: ["Aleppo", "Al-Bab", "Manbij"] },
      { name: "Homs", cities: ["Homs", "Palmyra", "Al-Rastan"] },
    ],
  },
  {
    name: "Taiwan",
    states: [
      { name: "Taipei", cities: ["Taipei", "New Taipei", "Keelung", "Taoyuan"] },
      { name: "Kaohsiung", cities: ["Kaohsiung", "Pingtung", "Tainan"] },
      { name: "Taichung", cities: ["Taichung", "Changhua", "Nantou"] },
    ],
  },
  {
    name: "Tanzania",
    states: [
      { name: "Dar es Salaam", cities: ["Dar es Salaam", "Mwanza", "Arusha"] },
      { name: "Mwanza", cities: ["Mwanza", "Musoma", "Ukerewe"] },
      { name: "Dodoma", cities: ["Dodoma", "Kondoa", "Chamwino"] },
    ],
  },
  {
    name: "Thailand",
    states: [
      { name: "Bangkok", cities: ["Bangkok", "Nonthaburi", "Samut Prakan", "Pathum Thani"] },
      { name: "Chiang Mai", cities: ["Chiang Mai", "Chiang Rai", "Lamphun"] },
      { name: "Chon Buri", cities: ["Pattaya", "Chonburi City", "Sriracha"] },
      { name: "Nakhon Ratchasima", cities: ["Nakhon Ratchasima", "Pak Chong"] },
      { name: "Phuket", cities: ["Phuket", "Kathu", "Thalang"] },
    ],
  },
  {
    name: "Tunisia",
    states: [
      { name: "Tunis", cities: ["Tunis", "La Marsa", "Ariana"] },
      { name: "Sfax", cities: ["Sfax", "Sakiet Ezzit"] },
      { name: "Sousse", cities: ["Sousse", "Monastir", "Mahdia"] },
    ],
  },
  {
    name: "Turkey",
    states: [
      { name: "Istanbul", cities: ["Istanbul", "Beşiktaş", "Kadıköy", "Üsküdar", "Fatih", "Başakşehir"] },
      { name: "Ankara", cities: ["Ankara", "Etimesgut", "Sincan", "Keçiören", "Yenimahalle"] },
      { name: "Izmir", cities: ["Izmir", "Konak", "Bornova", "Karşıyaka", "Buca"] },
      { name: "Bursa", cities: ["Bursa", "Nilüfer", "Osmangazi", "Yıldırım", "Gemlik"] },
      { name: "Antalya", cities: ["Antalya", "Alanya", "Manavgat", "Konyaaltı"] },
      { name: "Adana", cities: ["Adana", "Seyhan", "Çukurova", "Yüreğir"] },
      { name: "Konya", cities: ["Konya", "Ereğli", "Akşehir", "Karatay"] },
      { name: "Gaziantep", cities: ["Gaziantep", "Şahinbey", "Şehitkamil", "İslahiye"] },
    ],
  },
  {
    name: "Uganda",
    states: [
      { name: "Central", cities: ["Kampala", "Entebbe", "Mukono", "Jinja"] },
      { name: "Eastern", cities: ["Mbale", "Jinja", "Iganga", "Tororo"] },
    ],
  },
  {
    name: "Ukraine",
    states: [
      { name: "Kyiv", cities: ["Kyiv", "Brovary", "Boryspil"] },
      { name: "Kharkiv", cities: ["Kharkiv", "Lozova", "Chuhuiv"] },
      { name: "Dnipropetrovsk", cities: ["Dnipro", "Kryvyi Rih", "Kamianske"] },
      { name: "Odessa", cities: ["Odessa", "Mykolaiv", "Kherson"] },
      { name: "Lviv", cities: ["Lviv", "Drohobych", "Boryslav"] },
    ],
  },
  {
    name: "United Arab Emirates",
    states: [
      {
        name: "Dubai",
        cities: ["Dubai", "Jebel Ali", "Deira", "Bur Dubai", "Al Quoz", "Jumeirah", "Dubai Marina", "Al Barsha"],
      },
      {
        name: "Abu Dhabi",
        cities: ["Abu Dhabi", "Al Ain", "Ruwais", "Madinat Zayed", "Liwa", "Baniyas"],
      },
      {
        name: "Sharjah",
        cities: ["Sharjah", "Khor Fakkan", "Dhaid", "Kalba"],
      },
      {
        name: "Ajman",
        cities: ["Ajman"],
      },
      {
        name: "Ras Al Khaimah",
        cities: ["Ras Al Khaimah", "Al Nakheel", "Al Hamra"],
      },
      {
        name: "Fujairah",
        cities: ["Fujairah", "Dibba Al-Fujairah", "Kalba"],
      },
      {
        name: "Umm Al Quwain",
        cities: ["Umm Al Quwain", "Falaj Al Mualla"],
      },
    ],
  },
  {
    name: "United Kingdom",
    states: [
      {
        name: "England - Greater London",
        cities: ["London", "Westminster", "Croydon", "Barnet", "Lambeth", "Southwark", "Lewisham", "Hackney", "Tower Hamlets", "Waltham Forest"],
      },
      {
        name: "England - South East",
        cities: ["Brighton", "Southampton", "Portsmouth", "Oxford", "Reading", "Milton Keynes", "Canterbury", "Guildford"],
      },
      {
        name: "England - North West",
        cities: ["Manchester", "Liverpool", "Salford", "Bolton", "Stockport", "Wigan", "Warrington", "Preston", "Blackpool"],
      },
      {
        name: "England - West Midlands",
        cities: ["Birmingham", "Coventry", "Wolverhampton", "Dudley", "Walsall", "West Bromwich", "Solihull"],
      },
      {
        name: "England - Yorkshire",
        cities: ["Leeds", "Sheffield", "Bradford", "Hull", "Huddersfield", "Wakefield", "York", "Halifax"],
      },
      {
        name: "England - East of England",
        cities: ["Norwich", "Cambridge", "Luton", "Peterborough", "Chelmsford", "Ipswich"],
      },
      {
        name: "England - South West",
        cities: ["Bristol", "Plymouth", "Exeter", "Gloucester", "Bath", "Swindon", "Bournemouth"],
      },
      {
        name: "Scotland",
        cities: ["Glasgow", "Edinburgh", "Aberdeen", "Dundee", "Inverness", "Perth", "Stirling"],
      },
      {
        name: "Wales",
        cities: ["Cardiff", "Swansea", "Newport", "Bangor", "Wrexham", "St Davids"],
      },
      {
        name: "Northern Ireland",
        cities: ["Belfast", "Derry", "Lisburn", "Newry", "Armagh", "Ballymena"],
      },
    ],
  },
  {
    name: "United States",
    states: [
      { name: "Alabama", cities: ["Birmingham", "Montgomery", "Huntsville", "Mobile", "Tuscaloosa", "Hoover", "Dothan"] },
      { name: "Alaska", cities: ["Anchorage", "Fairbanks", "Juneau", "Ketchikan", "Sitka"] },
      { name: "Arizona", cities: ["Phoenix", "Tucson", "Mesa", "Chandler", "Scottsdale", "Glendale", "Gilbert", "Tempe"] },
      { name: "Arkansas", cities: ["Little Rock", "Fort Smith", "Fayetteville", "Springdale", "Jonesboro"] },
      { name: "California", cities: ["Los Angeles", "San Diego", "San Jose", "San Francisco", "Fresno", "Sacramento", "Long Beach", "Oakland", "Bakersfield", "Anaheim", "Santa Ana", "Riverside", "Irvine", "Stockton", "Chula Vista"] },
      { name: "Colorado", cities: ["Denver", "Colorado Springs", "Aurora", "Fort Collins", "Lakewood", "Thornton", "Arvada", "Westminster", "Boulder"] },
      { name: "Connecticut", cities: ["Bridgeport", "New Haven", "Hartford", "Stamford", "Waterbury", "Norwalk"] },
      { name: "Delaware", cities: ["Wilmington", "Dover", "Newark", "Middletown"] },
      { name: "Florida", cities: ["Jacksonville", "Miami", "Tampa", "Orlando", "St. Petersburg", "Hialeah", "Tallahassee", "Port St. Lucie", "Cape Coral", "Fort Lauderdale", "Pembroke Pines"] },
      { name: "Georgia", cities: ["Atlanta", "Augusta", "Columbus", "Macon", "Savannah", "Sandy Springs", "Roswell", "Athens"] },
      { name: "Hawaii", cities: ["Honolulu", "Pearl City", "Hilo", "Kailua", "Waipahu"] },
      { name: "Idaho", cities: ["Boise", "Meridian", "Nampa", "Idaho Falls", "Pocatello"] },
      { name: "Illinois", cities: ["Chicago", "Aurora", "Naperville", "Joliet", "Rockford", "Springfield", "Elgin", "Peoria", "Champaign"] },
      { name: "Indiana", cities: ["Indianapolis", "Fort Wayne", "Evansville", "South Bend", "Carmel", "Fishers", "Bloomington", "Hammond"] },
      { name: "Iowa", cities: ["Des Moines", "Cedar Rapids", "Davenport", "Sioux City", "Iowa City"] },
      { name: "Kansas", cities: ["Wichita", "Overland Park", "Kansas City", "Topeka", "Olathe"] },
      { name: "Kentucky", cities: ["Louisville", "Lexington", "Bowling Green", "Owensboro", "Covington"] },
      { name: "Louisiana", cities: ["New Orleans", "Baton Rouge", "Shreveport", "Metairie", "Lafayette"] },
      { name: "Maine", cities: ["Portland", "Lewiston", "Bangor", "South Portland"] },
      { name: "Maryland", cities: ["Baltimore", "Frederick", "Rockville", "Gaithersburg", "Bowie", "Hagerstown", "Annapolis"] },
      { name: "Massachusetts", cities: ["Boston", "Worcester", "Springfield", "Cambridge", "Lowell", "Brockton", "Quincy", "Lynn"] },
      { name: "Michigan", cities: ["Detroit", "Grand Rapids", "Warren", "Sterling Heights", "Ann Arbor", "Lansing", "Flint", "Dearborn"] },
      { name: "Minnesota", cities: ["Minneapolis", "Saint Paul", "Rochester", "Duluth", "Bloomington", "Brooklyn Park"] },
      { name: "Mississippi", cities: ["Jackson", "Gulfport", "Southaven", "Hattiesburg", "Biloxi"] },
      { name: "Missouri", cities: ["Kansas City", "Saint Louis", "Springfield", "Independence", "Columbia", "Lee's Summit"] },
      { name: "Montana", cities: ["Billings", "Missoula", "Great Falls", "Bozeman", "Butte"] },
      { name: "Nebraska", cities: ["Omaha", "Lincoln", "Bellevue", "Grand Island", "Kearney"] },
      { name: "Nevada", cities: ["Las Vegas", "Henderson", "Reno", "North Las Vegas", "Sparks", "Carson City"] },
      { name: "New Hampshire", cities: ["Manchester", "Nashua", "Concord", "Dover", "Rochester"] },
      { name: "New Jersey", cities: ["Newark", "Jersey City", "Paterson", "Elizabeth", "Trenton", "Camden", "Clifton", "Edison"] },
      { name: "New Mexico", cities: ["Albuquerque", "Las Cruces", "Rio Rancho", "Santa Fe", "Roswell"] },
      { name: "New York", cities: ["New York City", "Buffalo", "Rochester", "Yonkers", "Syracuse", "Albany", "New Rochelle", "Mount Vernon"] },
      { name: "North Carolina", cities: ["Charlotte", "Raleigh", "Greensboro", "Durham", "Winston-Salem", "Fayetteville", "Cary", "Wilmington"] },
      { name: "North Dakota", cities: ["Fargo", "Bismarck", "Grand Forks", "Minot"] },
      { name: "Ohio", cities: ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron", "Dayton", "Parma", "Canton"] },
      { name: "Oklahoma", cities: ["Oklahoma City", "Tulsa", "Norman", "Broken Arrow", "Lawton", "Edmond"] },
      { name: "Oregon", cities: ["Portland", "Salem", "Eugene", "Gresham", "Hillsboro", "Bend", "Beaverton"] },
      { name: "Pennsylvania", cities: ["Philadelphia", "Pittsburgh", "Allentown", "Erie", "Reading", "Scranton", "Bethlehem", "Lancaster"] },
      { name: "Rhode Island", cities: ["Providence", "Warwick", "Cranston", "Pawtucket", "East Providence"] },
      { name: "South Carolina", cities: ["Columbia", "Charleston", "North Charleston", "Greenville", "Rock Hill"] },
      { name: "South Dakota", cities: ["Sioux Falls", "Rapid City", "Aberdeen"] },
      { name: "Tennessee", cities: ["Nashville", "Memphis", "Knoxville", "Chattanooga", "Clarksville", "Murfreesboro"] },
      { name: "Texas", cities: ["Houston", "San Antonio", "Dallas", "Austin", "Fort Worth", "El Paso", "Arlington", "Corpus Christi", "Plano", "Laredo", "Lubbock", "Garland", "Irving", "Amarillo"] },
      { name: "Utah", cities: ["Salt Lake City", "West Valley City", "Provo", "West Jordan", "Orem", "Sandy", "Ogden"] },
      { name: "Vermont", cities: ["Burlington", "Essex Junction", "Rutland", "South Burlington"] },
      { name: "Virginia", cities: ["Virginia Beach", "Norfolk", "Chesapeake", "Richmond", "Newport News", "Alexandria", "Hampton", "Roanoke"] },
      { name: "Washington", cities: ["Seattle", "Spokane", "Tacoma", "Vancouver", "Bellevue", "Kent", "Everett", "Renton"] },
      { name: "West Virginia", cities: ["Charleston", "Huntington", "Morgantown", "Parkersburg"] },
      { name: "Wisconsin", cities: ["Milwaukee", "Madison", "Green Bay", "Kenosha", "Racine", "Appleton", "Waukesha"] },
      { name: "Wyoming", cities: ["Cheyenne", "Casper", "Laramie", "Gillette"] },
    ],
  },
  {
    name: "Uruguay",
    states: [
      { name: "Montevideo", cities: ["Montevideo"] },
      { name: "Canelones", cities: ["Las Piedras", "Canelones City", "La Paz"] },
    ],
  },
  {
    name: "Uzbekistan",
    states: [
      { name: "Tashkent", cities: ["Tashkent", "Chirchiq", "Angren"] },
      { name: "Samarkand", cities: ["Samarkand", "Kattaqo'rg'on"] },
      { name: "Fergana", cities: ["Fergana", "Namangan", "Andijan"] },
    ],
  },
  {
    name: "Venezuela",
    states: [
      { name: "Capital District", cities: ["Caracas", "Petare", "Catia"] },
      { name: "Miranda", cities: ["Los Teques", "Guarenas", "Guatire"] },
      { name: "Carabobo", cities: ["Valencia", "Maracay", "Puerto Cabello"] },
      { name: "Zulia", cities: ["Maracaibo", "Cabimas", "Ciudad Ojeda"] },
    ],
  },
  {
    name: "Vietnam",
    states: [
      { name: "Hanoi", cities: ["Hanoi", "Hà Đông", "Sơn Tây"] },
      { name: "Ho Chi Minh City", cities: ["Ho Chi Minh City", "Thủ Đức", "Bình Dương"] },
      { name: "Da Nang", cities: ["Da Nang", "Hội An"] },
      { name: "Hai Phong", cities: ["Hai Phong", "Thủy Nguyên"] },
      { name: "Can Tho", cities: ["Can Tho", "Sóc Trăng", "Bạc Liêu"] },
      { name: "Binh Duong", cities: ["Thu Dau Mot", "Dĩ An", "Thuận An"] },
    ],
  },
  {
    name: "Yemen",
    states: [
      { name: "Sanaa", cities: ["Sanaa"] },
      { name: "Aden", cities: ["Aden", "Lahij", "Al Mukalla"] },
      { name: "Taiz", cities: ["Taiz", "Turbah", "Mawza"] },
    ],
  },
  {
    name: "Zimbabwe",
    states: [
      { name: "Harare", cities: ["Harare", "Chitungwiza", "Epworth"] },
      { name: "Bulawayo", cities: ["Bulawayo", "Gweru", "Mutare"] },
      { name: "Masvingo", cities: ["Masvingo", "Chiredzi", "Zvishavane"] },
    ],
  },
];

export function getCountryNames(): string[] {
  return COUNTRIES.map((c) => c.name);
}

export function getStates(countryName: string): string[] {
  const country = COUNTRIES.find((c) => c.name === countryName);
  return country ? country.states.map((s) => s.name) : [];
}

export function getCities(countryName: string, stateName: string): string[] {
  const country = COUNTRIES.find((c) => c.name === countryName);
  if (!country) return [];
  const state = country.states.find((s) => s.name === stateName);
  return state ? state.cities : [];
}
