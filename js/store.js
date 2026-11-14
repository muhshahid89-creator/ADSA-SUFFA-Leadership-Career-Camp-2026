/**
 * ADSA SUFFA Leadership & Career Camp 2026
 * Central Data Store (localStorage based with offline fallback)
 */

const STORAGE_KEYS = {
  DARS: 'adsa_suffa_dars_2026',
  DARS_VERSION: 'adsa_suffa_dars_data_version',
  STUDENTS: 'adsa_suffa_students_2026',
  GALLERY: 'adsa_suffa_gallery_2026',
  AUTH: 'adsa_suffa_admin_session'
};

const CURRENT_DARS_DATA_VERSION = '2026-11-14-02';

// 41 Kerala Dars Default Directory
const DEFAULT_DARS = [
  { id: "01", name: "Kodinji Dars", place: "", district: "Malappuram", usthad: "Abdul Azeez Faizy Vazhipara", phone: "+91 98479 90622" },
  { id: "02", name: "Mullampara Dars", place: "", district: "Malappuram", usthad: "Abdul Bari Faizy Meenarkuzhi", phone: "+91 97473 46280" },
  { id: "03", name: "Ponnyakurshi Dars", place: "", district: "Malappuram", usthad: "Abdussalam Faizy Cholode", phone: "+91 96050 10307" },
  { id: "04", name: "Kareeparambu West Kodur Dars", place: "", district: "Malappuram", usthad: "Yusuf Faizy Edakkazhiyur", phone: "+91 97448 87966" },
  { id: "05", name: "Udinur Dars", place: "", district: "Kasaragod", usthad: "Shareef Faizy Thrikkaripur", phone: "+91 96564 80068" },
  { id: "06", name: "Kareettiparambu Dars", place: "", district: "Kozhikode", usthad: "Saleh Nizami Koduvally", phone: "+91 82815 81045" },
  { id: "07", name: "Thrikkanapuram Kuttippuram Dars", place: "", district: "Malappuram", usthad: "Sayyid Hashim Thangal Faizy", phone: "+91 98462 44903" },
  { id: "08", name: "Parappur Vadakkumuri Dars", place: "", district: "Malappuram", usthad: "Shareef Faizy Kulathur", phone: "+91 95620 65598" },
  { id: "09", name: "Velleri Dars", place: "", district: "Malappuram", usthad: "Salim Faizy Puzhakkattiri", phone: "+91 98463 54012" },
  { id: "10", name: "Melmuri Chungam Dars", place: "", district: "Malappuram", usthad: "Abdul Qadir Faizy Pattikkad", phone: "+91 97476 23492" },
  { id: "11", name: "Thoovvur Palakkal Vetta Dars", place: "", district: "Malappuram", usthad: "Habeeb Faizy Puzhakkattiri", phone: "+91 81368 17727" },
  { id: "12", name: "Vettuppara Dars", place: "", district: "", usthad: "Usman Faizy Cherambadi", phone: "+91 70257 00271" },
  { id: "13", name: "Molur Dars", place: "", district: "Malappuram", usthad: "Salahudheen Faizy Aripra", phone: "+91 99615 99120" },
  { id: "14", name: "Details Pending", place: "", district: "", usthad: "", phone: "" },
  { id: "15", name: "Kanhangad Punchavi Dars", place: "", district: "Kasaragod", usthad: "Arshad Nadwi Mukkam", phone: "+91 99617 37252" },
  { id: "16", name: "Ukkath Kunnumpuram Dars", place: "", district: "Malappuram", usthad: "Shafi Faizy Kuttur", phone: "+91 95447 08953" },
  { id: "17", name: "Valamangalam Dars", place: "", district: "Malappuram", usthad: "Musa Faizy Manjeri", phone: "+91 95441 24059" },
  { id: "18", name: "Elamkulam Dars", place: "", district: "Malappuram", usthad: "Niamathullah Faizy Pailippuram", phone: "+91 85940 17916" },
  { id: "19", name: "Pullur Dars", place: "", district: "Malappuram", usthad: "Hafiz Ubaid Faizy Nellaya", phone: "+91 81118 23545" },
  { id: "20", name: "Mongam Cheruputhoor Dars", place: "", district: "Malappuram", usthad: "Hafiz Jalal Faizy", phone: "+91 86060 00313" },
  { id: "21", name: "Wandoor Manjappetti Dars", place: "", district: "Malappuram", usthad: "Sufyan Faizy Kalikavu", phone: "+91 95628 34519" },
  { id: "22", name: "Pallippuram Dars", place: "", district: "Malappuram", usthad: "Abdul Azeez Faizy Pathiramanna", phone: "+91 96057 97586" },
  { id: "23", name: "Chemmankadavu Kongayam Dars", place: "", district: "Malappuram", usthad: "Muhammad Saneer Faizy Pariyaram", phone: "+91 81119 61062" },
  { id: "24", name: "Thekkumuri Puthanathani Dars", place: "", district: "Malappuram", usthad: "Shafeeq Faizy Vakkad", phone: "+91 97445 69792" },
  { id: "25", name: "Anakkayam Dars", place: "", district: "Malappuram", usthad: "Siddiq Faizy Mudikkode", phone: "+91 96560 47409" },
  { id: "26", name: "Irumbuzhi Dars", place: "", district: "Malappuram", usthad: "Hafiz Basheer Faizy Aripra", phone: "+91 86064 86717" },
  { id: "27", name: "Cheruvathur Kottappalli Dars", place: "", district: "Kasaragod", usthad: "Uwais Ashrafi Faizy Kannadiparamba", phone: "+91 97476 62491" },
  { id: "28", name: "Charladukka Dars", place: "", district: "Kasaragod", usthad: "Abdur Raziq Faizy", phone: "+91 75589 87582" },
  { id: "29", name: "Mullampara Vakkethodi Dars", place: "", district: "Malappuram", usthad: "Mubashshir Faizy", phone: "+91 99463 10313" },
  { id: "30", name: "Padinjattumuri Dars", place: "", district: "Malappuram", usthad: "Sayyid Ameerudheen Thangal Faizy", phone: "+91 90619 98857" },
  { id: "31", name: "Padanna Dars", place: "", district: "Kasaragod", usthad: "Hafiz Latheef Faizy", phone: "+91 94978 66785" },
  { id: "32", name: "Mudikkode Dars", place: "", district: "Malappuram", usthad: "Ali Faizy Karipur", phone: "+91 77365 30150" },
  { id: "33", name: "Thoovvur Pallipparamba Dars", place: "", district: "Malappuram", usthad: "Murshid Faizy Pattakarimbu", phone: "+91 85898 33872" },
  { id: "34", name: "Kinassery Dars", place: "", district: "", usthad: "Noufal Baqavi", phone: "+91 70340 90514" },
  { id: "35", name: "Pookayur Dars", place: "", district: "Malappuram", usthad: "Hafiz Umair Faizy", phone: "+91 96336 62678" },
  { id: "36", name: "Pattisseri Dars - Nellaya", place: "", district: "Palakkad", usthad: "Haris Faizy Nizami", phone: "+91 75929 83137" },
  { id: "37", name: "Mele Kizhisseri Dars", place: "", district: "Malappuram", usthad: "Sharafudheen Baqavi Haithami", phone: "+91 80866 69304" },
  { id: "38", name: "Karathode Dars", place: "", district: "Malappuram", usthad: "Musthafa Baqavi Haithami", phone: "+91 73563 16971" },
  { id: "39", name: "Vengad Melmuri Dars", place: "", district: "Malappuram", usthad: "Ali Baqavi Kapp", phone: "" },
  { id: "40", name: "Vallappuzha Kalladippatta Dars", place: "", district: "Palakkad", usthad: "Muhammad Basheer Faizy Nizami", phone: "+91 96457 03217" },
  { id: "41", name: "Muthanur Thrippanachi Dars", place: "", district: "Malappuram", usthad: "Ashraf Baqavi Nizami", phone: "+91 77363 66630" }
];

// Sample Initial Students
const DEFAULT_STUDENTS = [
  {
    id: "REG-2026-001",
    name: "Muhammed Salih K.",
    phone: "9846112233",
    email: "salih@example.com",
    darsId: "01",
    darsName: "Valiya Juma Masjid Dars, Ponnani",
    place: "Ponnani",
    district: "Malappuram",
    age: "19",
    classLevel: "Mutawassitha (2nd Year)",
    usthad: "K.V. Muhammad Musliyar",
    createdAt: "2026-11-10T10:15:00.000Z"
  },
  {
    id: "REG-2026-002",
    name: "Ahmed Basil P.K.",
    phone: "9745223344",
    email: "basil@example.com",
    darsId: "02",
    darsName: "Kuttichira Mishkal Masjid Dars",
    place: "Kuttichira",
    district: "Kozhikode",
    age: "20",
    classLevel: "Aaliyah (Final Year)",
    usthad: "Abdul Rahman Faizy",
    createdAt: "2026-11-11T14:30:00.000Z"
  },
  {
    id: "REG-2026-003",
    name: "Anas Rahman",
    phone: "9562334455",
    email: "anas@example.com",
    darsId: "06",
    darsName: "Pattambi Town Juma Masjid Dars",
    place: "Pattambi",
    district: "Palakkad",
    age: "18",
    classLevel: "Oola (1st Year)",
    usthad: "Sulaiman Faizy",
    createdAt: "2026-11-12T09:20:00.000Z"
  },
  {
    id: "REG-2026-004",
    name: "Musthafa Kamal",
    phone: "9895445566",
    email: "kamal@example.com",
    darsId: "08",
    darsName: "Nadapuram Juma Masjid Dars",
    place: "Nadapuram",
    district: "Kozhikode",
    age: "21",
    classLevel: "Aaliyah (2nd Year)",
    usthad: "Mustafa Darimi",
    createdAt: "2026-11-13T11:45:00.000Z"
  },
  {
    id: "REG-2026-005",
    name: "Ziyad Hussain M.T.",
    phone: "9447556677",
    email: "ziyad@example.com",
    darsId: "32",
    darsName: "Malik Deenar Juma Masjid Dars",
    place: "Thalangara",
    district: "Kasaragod",
    age: "20",
    classLevel: "Mutawassitha (3rd Year)",
    usthad: "Noorudheen Faizy",
    createdAt: "2026-11-14T08:00:00.000Z"
  }
];

// Default Gallery (Camp-themed visual placeholders)
const DEFAULT_GALLERY = [
  {
    id: "photo_01",
    title: "Inaugural Leadership Session 2025",
    caption: "ADSA SUFFA camp opening ceremony held last year.",
    category: "Session",
    date: "2025-12-20",
    url: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "photo_02",
    title: "Career Guidance & Counseling",
    caption: "Career guidance session for students.",
    category: "Career",
    date: "2025-12-21",
    url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "photo_03",
    title: "Dars Students Group Discussion",
    caption: "Gathering and discussion with students from 41 Darses.",
    category: "Discussion",
    date: "2025-12-21",
    url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "photo_04",
    title: "Camp Certificate Distribution",
    caption: "Certificates presented to participating students.",
    category: "Award",
    date: "2025-12-22",
    url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80"
  }
];

const Store = {
  // Initialization
  init() {
    const storedDars = localStorage.getItem(STORAGE_KEYS.DARS);
    const storedDarsVersion = localStorage.getItem(STORAGE_KEYS.DARS_VERSION);

    if (!storedDars) {
      localStorage.setItem(STORAGE_KEYS.DARS, JSON.stringify(DEFAULT_DARS));
      localStorage.setItem(STORAGE_KEYS.DARS_VERSION, CURRENT_DARS_DATA_VERSION);
    } else if (storedDarsVersion !== CURRENT_DARS_DATA_VERSION) {
      const currentDars = JSON.parse(storedDars);
      if (!Array.isArray(currentDars)) {
        throw new TypeError('Saved Dars directory must be an array.');
      }

      const currentDarsById = new Map(
        currentDars.map(dars => [String(dars.id).padStart(2, '0'), dars])
      );
      const migratedDars = DEFAULT_DARS.map(dars => ({
        ...(currentDarsById.get(dars.id) || {}),
        ...dars
      }));

      localStorage.setItem(STORAGE_KEYS.DARS, JSON.stringify(migratedDars));
      localStorage.setItem(STORAGE_KEYS.DARS_VERSION, CURRENT_DARS_DATA_VERSION);
    }
    if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(DEFAULT_STUDENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.GALLERY)) {
      localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(DEFAULT_GALLERY));
    }
  },

  // DARS API
  getDars() {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DARS);
      return data ? JSON.parse(data) : DEFAULT_DARS;
    } catch (e) {
      return DEFAULT_DARS;
    }
  },

  getDarsById(id) {
    const list = this.getDars();
    const cleanId = String(id).padStart(2, '0');
    return list.find(d => d.id === cleanId) || null;
  },

  updateDars(updatedDars) {
    const list = this.getDars();
    const index = list.findIndex(d => d.id === updatedDars.id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updatedDars };
      localStorage.setItem(STORAGE_KEYS.DARS, JSON.stringify(list));
      return true;
    }
    return false;
  },

  // STUDENTS API
  getStudents() {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  addStudent(studentData) {
    const students = this.getStudents();
    const count = students.length + 1;
    const newId = `REG-2026-${String(count).padStart(3, '0')}`;
    
    // Lookup Dars details
    let darsName = studentData.darsName || "";
    if (!darsName && studentData.darsId) {
      const d = this.getDarsById(studentData.darsId);
      const location = d ? [d.place, d.district].filter(Boolean).join(', ') : '';
      darsName = d ? `${d.name}${location ? `, ${location}` : ''}` : `Dars ${studentData.darsId}`;
    }

    const student = {
      id: newId,
      name: String(studentData.name).trim(),
      phone: String(studentData.phone).trim(),
      email: studentData.email ? String(studentData.email).trim() : "",
      darsId: String(studentData.darsId || "01").padStart(2, '0'),
      darsName: darsName,
      place: String(studentData.place || "").trim(),
      district: String(studentData.district || "").trim(),
      age: String(studentData.age || "").trim(),
      classLevel: String(studentData.classLevel || "").trim(),
      usthad: String(studentData.usthad || "").trim(),
      notes: String(studentData.notes || "").trim(),
      createdAt: new Date().toISOString()
    };

    students.unshift(student); // newest first
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    return student;
  },

  updateStudent(student) {
    const students = this.getStudents();
    const index = students.findIndex(s => s.id === student.id);
    if (index !== -1) {
      students[index] = { ...students[index], ...student };
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
      return true;
    }
    return false;
  },

  deleteStudent(id) {
    let students = this.getStudents();
    students = students.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    return true;
  },

  // GALLERY API
  getGallery() {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GALLERY);
      const gallery = data ? JSON.parse(data) : [];
      if (!Array.isArray(gallery)) return gallery;

      const defaultCaptions = new Map(DEFAULT_GALLERY.map(photo => [photo.id, photo.caption]));
      return gallery.map(photo => {
        if (!photo || typeof photo !== 'object') return photo;
        const defaultCaption = defaultCaptions.get(photo.id);
        if (defaultCaption && /[\u0D00-\u0D7F]/.test(photo.caption || '')) {
          return { ...photo, caption: defaultCaption };
        }
        return photo;
      });
    } catch (e) {
      return [];
    }
  },

  addPhoto(photoData) {
    const photos = this.getGallery();
    const newPhoto = {
      id: "photo_" + Date.now(),
      title: photoData.title || "Camp Photo",
      caption: photoData.caption || "",
      category: photoData.category || "Camp",
      date: photoData.date || new Date().toISOString().split('T')[0],
      url: photoData.url
    };
    photos.unshift(newPhoto);
    localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(photos));
    return newPhoto;
  },

  deletePhoto(id) {
    let photos = this.getGallery();
    photos = photos.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(photos));
    return true;
  },

  // OVERVIEW & STATS
  getStats() {
    const students = this.getStudents();
    const dars = this.getDars();
    const gallery = this.getGallery();

    const todayStr = new Date().toISOString().split('T')[0];
    const todayCount = students.filter(s => (s.createdAt || "").startsWith(todayStr)).length;

    // Distinct Dars registered
    const activeDarsSet = new Set(students.map(s => s.darsId));

    // District breakdown
    const districtCounts = {};
    students.forEach(s => {
      const dist = s.district || "Other";
      districtCounts[dist] = (districtCounts[dist] || 0) + 1;
    });

    // Students count per Dars
    const darsCounts = {};
    students.forEach(s => {
      darsCounts[s.darsId] = (darsCounts[s.darsId] || 0) + 1;
    });

    return {
      totalStudents: students.length,
      todayStudents: todayCount,
      totalDars: dars.length,
      activeDarsCount: activeDarsSet.size,
      totalPhotos: gallery.length,
      districtCounts,
      darsCounts,
      recentStudents: students.slice(0, 5)
    };
  },

  // ADMIN AUTH
  isAdminLoggedIn() {
    const session = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (!session) return false;
    try {
      const parsed = JSON.parse(session);
      return parsed && parsed.loggedIn === true;
    } catch (e) {
      return false;
    }
  },

  loginAdmin(username, password) {
    // Default admin credential:
    // admin / admin123 or admin@suffa.org / 123456
    const validUsers = [
      { u: 'admin', p: 'admin123' },
      { u: 'admin@suffa.adsa.in', p: 'admin2026' },
      { u: 'admin', p: 'admin' }
    ];

    const match = validUsers.some(v => 
      v.u.toLowerCase() === username.trim().toLowerCase() && v.p === password
    );

    if (match) {
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify({
        loggedIn: true,
        user: username,
        loginTime: new Date().toISOString()
      }));
      return { success: true };
    }
    return { success: false, message: "Invalid email/username or password. (Default: admin / admin123)" };
  },

  logoutAdmin() {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  },

  // Reset to initial demo data
  resetAll() {
    localStorage.setItem(STORAGE_KEYS.DARS, JSON.stringify(DEFAULT_DARS));
    localStorage.setItem(STORAGE_KEYS.DARS_VERSION, CURRENT_DARS_DATA_VERSION);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(DEFAULT_STUDENTS));
    localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(DEFAULT_GALLERY));
  }
};

// Auto initialize on load
Store.init();

// Export to window so it's readily usable anywhere
if (typeof window !== 'undefined') {
  window.Store = Store;
}
