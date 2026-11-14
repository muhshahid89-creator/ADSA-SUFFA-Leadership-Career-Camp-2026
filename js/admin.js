/**
 * ADSA SUFFA Leadership & Career Camp 2026
 * Admin Dashboard Controller
 * Modules: Overview, Students, Dars Management (41), Gallery, Export (PDF)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const loginSection = document.getElementById('loginSection');
  const adminLayout = document.getElementById('adminLayout');
  const loginForm = document.getElementById('loginForm');
  const loginErrorMsg = document.getElementById('loginErrorMsg');
  const logoutBtn = document.getElementById('logoutBtn');
  const currentUserDisplay = document.getElementById('currentUserDisplay');

  // Module Panels & Nav
  const sidebarButtons = document.querySelectorAll('.sidebar-item-btn[data-module]');
  const modulePanels = document.querySelectorAll('.module-panel');
  const moduleTitle = document.getElementById('moduleTitle');

  // Check Auth State
  function checkAuth() {
    if (Store.isAdminLoggedIn()) {
      if (loginSection) loginSection.style.display = 'none';
      if (adminLayout) adminLayout.style.display = 'flex';
      loadCurrentModule('overview');
      updateAllBadges();
    } else {
      if (loginSection) loginSection.style.display = 'flex';
      if (adminLayout) adminLayout.style.display = 'none';
    }
  }

  // Login Form Submission
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = document.getElementById('loginUsername').value;
      const pass = document.getElementById('loginPassword').value;

      const result = Store.loginAdmin(user, pass);
      if (result.success) {
        if (loginErrorMsg) loginErrorMsg.style.display = 'none';
        checkAuth();
      } else {
        if (loginErrorMsg) {
          loginErrorMsg.textContent = result.message || 'Invalid username or password.';
          loginErrorMsg.style.display = 'block';
        }
      }
    });
  }

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to sign out?')) {
        Store.logoutAdmin();
        checkAuth();
      }
    });
  }

  // Module Navigation
  function loadCurrentModule(moduleName) {
    sidebarButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.module === moduleName);
    });

    modulePanels.forEach(panel => {
      panel.classList.toggle('active', panel.id === `panel-${moduleName}`);
    });

    const titles = {
      'overview': 'Registration Overview',
      'students': 'Students Directory',
      'dars': 'Dars Management (41 Branches)',
      'gallery': 'Gallery Upload',
      'export': 'Export & PDF Download'
    };

    if (moduleTitle) moduleTitle.textContent = titles[moduleName] || 'Admin Dashboard';

    // Refresh specific module data
    if (moduleName === 'overview') renderOverview();
    else if (moduleName === 'students') renderStudents();
    else if (moduleName === 'dars') renderDarsManagement();
    else if (moduleName === 'gallery') renderAdminGallery();
    else if (moduleName === 'export') renderExportPreview();

    updateAllBadges();
  }

  sidebarButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      loadCurrentModule(btn.dataset.module);
    });
  });

  // Global Badge updater
  function updateAllBadges() {
    const stats = Store.getStats();
    const studentsBadge = document.getElementById('badgeStudentsCount');
    const darsBadge = document.getElementById('badgeDarsCount');
    const galleryBadge = document.getElementById('badgeGalleryCount');

    if (studentsBadge) studentsBadge.textContent = stats.totalStudents;
    if (darsBadge) darsBadge.textContent = stats.totalDars;
    if (galleryBadge) galleryBadge.textContent = stats.totalPhotos;
  }

  /* ========================================================================
     MODULE 1: OVERVIEW
     ======================================================================== */
  function renderOverview() {
    const stats = Store.getStats();

    // Stat cards numbers
    const totalEl = document.getElementById('overviewTotalStudents');
    const todayEl = document.getElementById('overviewTodayStudents');
    const darsActiveEl = document.getElementById('overviewActiveDars');
    const galleryEl = document.getElementById('overviewTotalPhotos');

    if (totalEl) totalEl.textContent = stats.totalStudents;
    if (todayEl) todayEl.textContent = stats.todayStudents;
    if (darsActiveEl) darsActiveEl.textContent = `${stats.activeDarsCount} / ${stats.totalDars}`;
    if (galleryEl) galleryEl.textContent = stats.totalPhotos;

    // District breakdown progress bars
    const distContainer = document.getElementById('overviewDistrictBars');
    if (distContainer) {
      distContainer.innerHTML = '';
      const total = stats.totalStudents || 1;
      const sortedDistricts = Object.entries(stats.districtCounts)
        .sort((a, b) => b[1] - a[1]);

      if (sortedDistricts.length === 0) {
        distContainer.innerHTML = '<p style="color:#64748b; font-size:0.9rem;">No registrations yet.</p>';
      } else {
        sortedDistricts.forEach(([dist, count]) => {
          const pct = Math.round((count / total) * 100);
          const bar = document.createElement('div');
          bar.style.marginBottom = '12px';
          bar.innerHTML = `
            <div style="display:flex; justify-content:space-between; font-size:0.85rem; font-weight:600; margin-bottom:4px;">
              <span>${dist}</span>
              <span>${count} (${pct}%)</span>
            </div>
            <div style="background:#e2e8f0; height:8px; border-radius:999px; overflow:hidden;">
              <div style="background:var(--primary); height:100%; width:${pct}%;"></div>
            </div>
          `;
          distContainer.appendChild(bar);
        });
      }
    }

    // Recent 5 Students Table
    const recentTableBody = document.getElementById('overviewRecentTableBody');
    if (recentTableBody) {
      recentTableBody.innerHTML = '';
      if (stats.recentStudents.length === 0) {
        recentTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px; color:#64748b;">No registrations yet.</td></tr>';
      } else {
        stats.recentStudents.forEach(st => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td><strong>${st.id}</strong></td>
            <td><strong>${st.name}</strong><br><small style="color:#64748b;">${st.phone}</small></td>
            <td><span class="badge-tag dars">Dars ${st.darsId}</span><br><small>${st.place || st.district}</small></td>
            <td>${st.district}</td>
          `;
          recentTableBody.appendChild(tr);
        });
      }
    }
  }

  /* ========================================================================
     MODULE 2: STUDENTS
     ======================================================================== */
  const studentSearchInput = document.getElementById('studentSearchInput');
  const studentDarsFilter = document.getElementById('studentDarsFilter');
  const studentDistrictFilter = document.getElementById('studentDistrictFilter');
  const studentsTableBody = document.getElementById('studentsTableBody');
  const studentCountDisplay = document.getElementById('studentCountDisplay');

  // Populate Dars Filter in Students module
  function populateStudentFilters() {
    if (studentDarsFilter) {
      studentDarsFilter.innerHTML = '<option value="ALL">All Dars</option>';
      const allDars = Store.getDars();
      allDars.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.id;
        opt.textContent = `Dars ${d.id} - ${d.name}`;
        studentDarsFilter.appendChild(opt);
      });
    }
  }
  populateStudentFilters();

  function renderStudents() {
    if (!studentsTableBody) return;
    const allStudents = Store.getStudents();
    const term = (studentSearchInput?.value || '').toLowerCase().trim();
    const darsId = studentDarsFilter?.value || 'ALL';
    const district = studentDistrictFilter?.value || 'ALL';

    const filtered = allStudents.filter(s => {
      const matchTerm = !term ||
        s.name.toLowerCase().includes(term) ||
        s.id.toLowerCase().includes(term) ||
        s.phone.includes(term) ||
        s.place.toLowerCase().includes(term) ||
        s.darsName.toLowerCase().includes(term);

      const matchDars = (darsId === 'ALL') || (s.darsId === darsId);
      const matchDist = (district === 'ALL') || (s.district === district);

      return matchTerm && matchDars && matchDist;
    });

    if (studentCountDisplay) {
      studentCountDisplay.textContent = `Showing ${filtered.length} of ${allStudents.length} Students`;
    }

    studentsTableBody.innerHTML = '';
    if (filtered.length === 0) {
      studentsTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding:32px; color:#64748b;">
            No students found.
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach((st, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${st.id}</strong></td>
        <td>
          <strong style="color:var(--navy); font-size:0.95rem;">${st.name}</strong>
          ${st.classLevel ? `<br><small style="color:#64748b;">${st.classLevel}</small>` : ''}
        </td>
        <td>
          <span class="badge-tag dars">Dars ${st.darsId}</span>
          <div style="font-size:0.8rem; color:#475569; margin-top:2px;">${st.darsName || ''}</div>
        </td>
        <td>
          <a href="tel:${st.phone}" style="color:var(--primary); font-weight:600;">📞 ${st.phone}</a>
        </td>
        <td>${[st.place, st.district].filter(Boolean).join(', ')}</td>
        <td>${st.createdAt ? new Date(st.createdAt).toLocaleDateString() : '—'}</td>
        <td>
          <div class="action-btns">
            <button class="btn-icon" title="View Details" onclick="viewStudentDetails('${st.id}')">👁️ View</button>
            <button class="btn-icon" title="Edit" onclick="openEditStudentModal('${st.id}')">✏️ Edit</button>
            <button class="btn-icon danger" title="Delete" onclick="deleteStudentRecord('${st.id}')">🗑️</button>
          </div>
        </td>
      `;
      studentsTableBody.appendChild(tr);
    });
  }

  if (studentSearchInput) studentSearchInput.addEventListener('input', renderStudents);
  if (studentDarsFilter) studentDarsFilter.addEventListener('change', renderStudents);
  if (studentDistrictFilter) studentDistrictFilter.addEventListener('change', renderStudents);

  // Global Actions for Students
  window.viewStudentDetails = function(id) {
    const student = Store.getStudents().find(s => s.id === id);
    if (!student) return;

    const modal = document.getElementById('viewStudentModal');
    const content = document.getElementById('viewStudentModalContent');
    if (modal && content) {
      content.innerHTML = `
        <div style="text-align:center; margin-bottom:20px;">
          <span class="badge-tag dars" style="font-size:0.9rem; padding:4px 12px;">${student.id}</span>
          <h2 style="color:var(--navy); margin-top:8px;">${student.name}</h2>
          <p style="color:#64748b;">${student.classLevel || 'Dars Student'}</p>
        </div>
        <div style="background:#f8fafc; border-radius:8px; padding:18px; display:flex; flex-direction:column; gap:10px; font-size:0.9rem;">
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid #e2e8f0; padding-bottom:6px;">
            <span style="color:#64748b;">Dars:</span>
            <strong>${student.darsId} - ${student.darsName}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid #e2e8f0; padding-bottom:6px;">
            <span style="color:#64748b;">Phone:</span>
            <strong>${student.phone}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid #e2e8f0; padding-bottom:6px;">
            <span style="color:#64748b;">Email:</span>
            <strong>${student.email || '—'}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid #e2e8f0; padding-bottom:6px;">
            <span style="color:#64748b;">Place:</span>
            <strong>${student.place || '—'}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid #e2e8f0; padding-bottom:6px;">
            <span style="color:#64748b;">District:</span>
            <strong>${student.district}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid #e2e8f0; padding-bottom:6px;">
            <span style="color:#64748b;">Usthad:</span>
            <strong>${student.usthad || '—'}</strong>
          </div>
          <div style="border-top:1px solid #e2e8f0; padding-top:6px;">
            <span style="color:#64748b; display:block; margin-bottom:4px;">Notes:</span>
            <p style="background:#fff; padding:8px; border-radius:4px; border:1px solid #e2e8f0;">${student.notes || 'No notes provided.'}</p>
          </div>
        </div>
      `;
      modal.classList.add('open');
    }
  };

  window.openEditStudentModal = function(id) {
    const student = Store.getStudents().find(s => s.id === id);
    if (!student) return;

    document.getElementById('editStudentId').value = student.id;
    document.getElementById('editStudentName').value = student.name;
    document.getElementById('editStudentPhone').value = student.phone;
    document.getElementById('editStudentPlace').value = student.place;
    document.getElementById('editStudentDistrict').value = student.district;
    document.getElementById('editStudentClass').value = student.classLevel || '';
    document.getElementById('editStudentUsthad').value = student.usthad || '';

    // Populate Dars select
    const darsSel = document.getElementById('editStudentDars');
    if (darsSel) {
      darsSel.innerHTML = '';
      Store.getDars().forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.id;
        opt.textContent = `${d.id} - ${d.name}`;
        if (d.id === student.darsId) opt.selected = true;
        darsSel.appendChild(opt);
      });
    }

    document.getElementById('editStudentModal').classList.add('open');
  };

  const editStudentForm = document.getElementById('editStudentForm');
  if (editStudentForm) {
    editStudentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('editStudentId').value;
      const name = document.getElementById('editStudentName').value;
      const phone = document.getElementById('editStudentPhone').value;
      const darsId = document.getElementById('editStudentDars').value;
      const place = document.getElementById('editStudentPlace').value;
      const district = document.getElementById('editStudentDistrict').value;
      const classLevel = document.getElementById('editStudentClass').value;
      const usthad = document.getElementById('editStudentUsthad').value;

      const d = Store.getDarsById(darsId);
      const location = d ? [d.place, d.district].filter(Boolean).join(', ') : '';
      const darsName = d ? `${d.name}${location ? `, ${location}` : ''}` : `Dars ${darsId}`;

      Store.updateStudent({
        id,
        name,
        phone,
        darsId,
        darsName,
        place,
        district,
        classLevel,
        usthad
      });

      document.getElementById('editStudentModal').classList.remove('open');
      renderStudents();
      updateAllBadges();
      alert('Student details updated.');
    });
  }

  window.deleteStudentRecord = function(id) {
    if (confirm(`Are you sure you want to delete student record ${id}?`)) {
      Store.deleteStudent(id);
      renderStudents();
      updateAllBadges();
    }
  };

  // Add Student Manually Modal
  const openAddStudentBtn = document.getElementById('openAddStudentBtn');
  const addStudentModal = document.getElementById('addStudentModal');
  const addStudentForm = document.getElementById('addStudentForm');

  if (openAddStudentBtn && addStudentModal) {
    openAddStudentBtn.addEventListener('click', () => {
      const darsSel = document.getElementById('addStudentDars');
      if (darsSel) {
        darsSel.innerHTML = '';
        Store.getDars().forEach(d => {
          const opt = document.createElement('option');
          opt.value = d.id;
          const location = [d.place, d.district].filter(Boolean).join(', ');
          opt.textContent = `${d.id} - ${d.name}${location ? ` (${location})` : ''}`;
          darsSel.appendChild(opt);
        });
      }
      addStudentModal.classList.add('open');
    });
  }

  if (addStudentForm) {
    addStudentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('addStudentName').value;
      const phone = document.getElementById('addStudentPhone').value;
      const darsId = document.getElementById('addStudentDars').value;
      const place = document.getElementById('addStudentPlace').value;
      const district = document.getElementById('addStudentDistrict').value;
      const classLevel = document.getElementById('addStudentClass').value;
      const usthad = document.getElementById('addStudentUsthad').value;

      Store.addStudent({
        name,
        phone,
        darsId,
        place,
        district,
        classLevel,
        usthad
      });

      addStudentModal.classList.remove('open');
      addStudentForm.reset();
      renderStudents();
      updateAllBadges();
      alert('Student added.');
    });
  }

  /* ========================================================================
     MODULE 3: DARS MANAGEMENT
     ======================================================================== */
  const darsSearchAdmin = document.getElementById('darsSearchAdmin');
  const darsTableBody = document.getElementById('darsTableBody');

  function renderDarsManagement() {
    if (!darsTableBody) return;
    const allDars = Store.getDars();
    const stats = Store.getStats();

    const term = (darsSearchAdmin?.value || '').toLowerCase().trim();

    const filtered = allDars.filter(d => {
      const searchText = [d.id, d.name, d.place, d.district, d.usthad, d.phone]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return !term || searchText.includes(term);
    });

    darsTableBody.innerHTML = '';
    filtered.forEach(d => {
      const regCount = stats.darsCounts[d.id] || 0;
      const location = [d.place, d.district].filter(Boolean).join(', ');
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="badge-tag dars" style="font-size:0.85rem;">DARS ${d.id}</span></td>
        <td>
          <strong style="color:var(--navy); font-size:0.95rem;">${d.name}</strong>
          <div style="font-size:0.8rem; color:#64748b;">📍 ${location || 'Location not provided'}</div>
        </td>
        <td>
          <strong>👳‍♂️ ${d.usthad || 'Details pending'}</strong>
          <div style="font-size:0.8rem; color:var(--primary);">📞 ${d.phone || '—'}</div>
        </td>
        <td>
          <span class="badge-tag ${regCount > 0 ? 'dars' : ''}">
            ${regCount} Students
          </span>
        </td>
        <td>
          <button class="btn-icon" onclick="openEditDarsModal('${d.id}')">
            ✏️ Edit Details
          </button>
        </td>
      `;
      darsTableBody.appendChild(tr);
    });
  }

  if (darsSearchAdmin) darsSearchAdmin.addEventListener('input', renderDarsManagement);

  // Edit Dars Modal
  window.openEditDarsModal = function(id) {
    const d = Store.getDarsById(id);
    if (!d) return;

    document.getElementById('editDarsId').value = d.id;
    document.getElementById('editDarsCodeDisplay').textContent = `DARS ${d.id}`;
    document.getElementById('editDarsName').value = d.name;
    document.getElementById('editDarsPlace').value = d.place;
    document.getElementById('editDarsDistrict').value = d.district;
    document.getElementById('editDarsUsthad').value = d.usthad || '';
    document.getElementById('editDarsPhone').value = d.phone || '';

    document.getElementById('editDarsModal').classList.add('open');
  };

  const editDarsForm = document.getElementById('editDarsForm');
  if (editDarsForm) {
    editDarsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('editDarsId').value;
      const name = document.getElementById('editDarsName').value;
      const place = document.getElementById('editDarsPlace').value;
      const district = document.getElementById('editDarsDistrict').value;
      const usthad = document.getElementById('editDarsUsthad').value;
      const phone = document.getElementById('editDarsPhone').value;

      Store.updateDars({ id, name, place, district, usthad, phone });
      document.getElementById('editDarsModal').classList.remove('open');
      renderDarsManagement();
      alert(`Dars ${id} details updated.`);
    });
  }

  /* ========================================================================
     MODULE 4: GALLERY
     ======================================================================== */
  const photoFileInput = document.getElementById('photoFileInput');
  const photoPreview = document.getElementById('photoPreview');
  const uploadPhotoForm = document.getElementById('uploadPhotoForm');
  const adminGalleryGrid = document.getElementById('adminGalleryGrid');
  let selectedPhotoBase64 = null;

  if (photoFileInput) {
    photoFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          alert('The image must be smaller than 5MB.');
          return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
          selectedPhotoBase64 = event.target.result;
          if (photoPreview) {
            photoPreview.src = selectedPhotoBase64;
            photoPreview.style.display = 'block';
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (uploadPhotoForm) {
    uploadPhotoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('photoTitle').value;
      const caption = document.getElementById('photoCaption').value;
      const category = document.getElementById('photoCategory').value;

      if (!selectedPhotoBase64) {
        alert('Please choose a photo.');
        return;
      }

      Store.addPhoto({
        title,
        caption,
        category,
        url: selectedPhotoBase64
      });

      uploadPhotoForm.reset();
      selectedPhotoBase64 = null;
      if (photoPreview) photoPreview.style.display = 'none';

      renderAdminGallery();
      updateAllBadges();
      alert('Photo uploaded successfully.');
    });
  }

  function renderAdminGallery() {
    if (!adminGalleryGrid) return;
    const photos = Store.getGallery();
    adminGalleryGrid.innerHTML = '';

    if (photos.length === 0) {
      adminGalleryGrid.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:30px; color:#64748b;">No photos have been uploaded yet.</p>';
      return;
    }

    photos.forEach(p => {
      const card = document.createElement('div');
      card.className = 'admin-photo-card';
      card.innerHTML = `
        <img class="admin-photo-thumb" src="${p.url}" alt="${p.title}" onerror="this.src='https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=800&q=80'">
        <div class="admin-photo-body">
          <span class="badge-tag" style="align-self:flex-start; font-size:0.7rem;">${p.category}</span>
          <div class="admin-photo-title">${p.title}</div>
          <div class="admin-photo-caption">${p.caption || '—'}</div>
          <div style="margin-top:auto; padding-top:8px;">
            <button class="btn-icon danger" style="width:100%; justify-content:center;" onclick="deleteGalleryPhoto('${p.id}')">
              🗑️ Delete Photo
            </button>
          </div>
        </div>
      `;
      adminGalleryGrid.appendChild(card);
    });
  }

  window.deleteGalleryPhoto = function(id) {
    if (confirm('Are you sure you want to delete this photo?')) {
      Store.deletePhoto(id);
      renderAdminGallery();
      updateAllBadges();
    }
  };

  /* ========================================================================
     MODULE 5: EXPORT
     ======================================================================== */
  const exportDarsFilter = document.getElementById('exportDarsFilter');
  const exportStudentsBtn = document.getElementById('exportStudentsBtn');
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  const printStudentsBtn = document.getElementById('printStudentsBtn');
  const exportPreviewTbody = document.getElementById('exportPreviewTbody');
  const exportTotalCount = document.getElementById('exportTotalCount');

  function populateExportDarsFilter() {
    if (exportDarsFilter) {
      exportDarsFilter.innerHTML = '<option value="ALL">All 41 Dars</option>';
      Store.getDars().forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.id;
        opt.textContent = `Dars ${d.id} - ${d.name}`;
        exportDarsFilter.appendChild(opt);
      });
    }
  }
  populateExportDarsFilter();

  function getExportFilteredStudents() {
    const darsId = exportDarsFilter?.value || 'ALL';
    const students = Store.getStudents();
    if (darsId === 'ALL') return students;
    return students.filter(s => s.darsId === darsId);
  }

  function renderExportPreview() {
    if (!exportPreviewTbody) return;
    const list = getExportFilteredStudents();
    if (exportTotalCount) exportTotalCount.textContent = list.length;

    exportPreviewTbody.innerHTML = '';
    if (list.length === 0) {
      exportPreviewTbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:24px; color:#64748b;">No records to export.</td></tr>';
      return;
    }

    list.forEach((st, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td><strong>${st.id}</strong></td>
        <td>${st.name}</td>
        <td>Dars ${st.darsId} - ${st.darsName}</td>
        <td>${st.phone}</td>
        <td>${[st.place, st.district].filter(Boolean).join(', ')}</td>
      `;
      exportPreviewTbody.appendChild(tr);
    });
  }

  if (exportDarsFilter) exportDarsFilter.addEventListener('change', renderExportPreview);

  // 1. Generate & Download PDF
  if (exportStudentsBtn) {
    exportStudentsBtn.addEventListener('click', () => {
      const students = getExportFilteredStudents();
      if (students.length === 0) {
        alert('No student records are available to download.');
        return;
      }

      // Check if jsPDF is available
      if (window.jspdf && window.jspdf.jsPDF) {
        generateDirectPdf(students);
      } else {
        // Fallback to formatted Print-to-PDF Window
        generatePrintPdfWindow(students);
      }
    });
  }

  function generateDirectPdf(students) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    // Header styling
    doc.setFillColor(14, 77, 52); // Forest Green
    doc.rect(0, 0, 210, 36, 'F');

    // Add Logo if available
    if (window.ADSA_LOGO_BASE64) {
      try {
        doc.addImage(window.ADSA_LOGO_BASE64, 'JPEG', 12, 5, 26, 26);
      } catch (e) {
        console.warn('Could not add logo to PDF:', e);
      }
    }

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    const titleX = window.ADSA_LOGO_BASE64 ? 116 : 105;
    doc.text('ADSA SUFFA LEADERSHIP & CAREER CAMP 2026', titleX, 14, { align: 'center' });

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.text('Alathurpadi Dars Students Association · Students Directory', titleX, 22, { align: 'center' });

    // Meta details
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(9);
    const dateStr = new Date().toLocaleDateString();
    doc.text(`Generated on: ${dateStr}`, 14, 42);
    doc.text(`Total Students: ${students.length}`, 196, 42, { align: 'right' });

    // Table data preparation
    const tableData = students.map((s, i) => [
      i + 1,
      s.id,
      s.name,
      `Dars ${s.darsId}`,
      s.phone,
      [s.place, s.district].filter(Boolean).join(', '),
      s.classLevel || '—'
    ]);

    if (doc.autoTable) {
      doc.autoTable({
        head: [['#', 'Reg ID', 'Student Name', 'Dars', 'Phone', 'Place / District', 'Class']],
        body: tableData,
        startY: 46,
        theme: 'striped',
        headStyles: { fillColor: [14, 77, 52], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 8.5, cellPadding: 2.5 },
        alternateRowStyles: { fillColor: [248, 250, 252] }
      });
      doc.save(`ADSA_SUFFA_Students_List_2026.pdf`);
    } else {
      generatePrintPdfWindow(students);
    }
  }

  function generatePrintPdfWindow(students) {
    const printWin = window.open('', '_blank');
    const rowsHtml = students.map((s, i) => `
      <tr>
        <td style="border:1px solid #ccc; padding:6px; text-align:center;">${i + 1}</td>
        <td style="border:1px solid #ccc; padding:6px; font-weight:bold;">${s.id}</td>
        <td style="border:1px solid #ccc; padding:6px; font-weight:bold;">${s.name}</td>
        <td style="border:1px solid #ccc; padding:6px;">Dars ${s.darsId} - ${s.darsName}</td>
        <td style="border:1px solid #ccc; padding:6px;">${s.phone}</td>
        <td style="border:1px solid #ccc; padding:6px;">${[s.place, s.district].filter(Boolean).join(', ')}</td>
        <td style="border:1px solid #ccc; padding:6px;">${s.classLevel || '—'}</td>
      </tr>
    `).join('');

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>ADSA SUFFA Camp 2026 - Students List PDF</title>
        <style>
          body { font-family: sans-serif; margin: 20px; color: #1e293b; }
          .header { text-align: center; border-bottom: 2px solid #1f4d8f; padding-bottom: 14px; margin-bottom: 15px; }
          .header img { width: 75px; height: 75px; border-radius: 50%; margin: 0 auto 8px; display: block; border: 2px solid #1f4d8f; }
          .title { font-size: 18px; font-weight: bold; color: #1f4d8f; }
          .subtitle { font-size: 12px; color: #64748b; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 15px; }
          th { background: #1f4d8f; color: #fff; border: 1px solid #1f4d8f; padding: 8px; text-align: left; }
          .meta { display: flex; justify-content: space-between; font-size: 11px; color: #475569; }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div style="text-align:right; margin-bottom:10px;">
          <button onclick="window.print()" style="background:#1f4d8f; color:#fff; border:none; padding:8px 16px; border-radius:4px; cursor:pointer;">
            🖨️ Save as PDF / Print
          </button>
        </div>
        <div class="header">
          <img src="images/logo.jpg" alt="ADSA Logo">
          <div class="title">ADSA SUFFA LEADERSHIP & CAREER CAMP 2026</div>
          <div class="subtitle">Alathurpadi Dars Students Association · Registered Students Directory</div>
        </div>
        <div class="meta">
          <span>Date: ${new Date().toLocaleDateString()}</span>
          <span>Total Students: <strong>${students.length}</strong></span>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Reg ID</th>
              <th>Student Name</th>
              <th>Dars</th>
              <th>Phone</th>
              <th>Place / District</th>
              <th>Class</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <script>
          setTimeout(() => { window.print(); }, 500);
        </script>
      </body>
      </html>
    `);
    printWin.document.close();
  }

  // 2. Export as CSV / Excel
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
      const students = getExportFilteredStudents();
      if (students.length === 0) {
        alert('No student records are available to download.');
        return;
      }

      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Sl No,Reg ID,Student Name,Phone,Email,Dars ID,Dars Name,Place,District,Class Level,Usthad,Registered Date\r\n";

      students.forEach((s, i) => {
        const row = [
          i + 1,
          `"${s.id}"`,
          `"${s.name}"`,
          `"${s.phone}"`,
          `"${s.email || ''}"`,
          `"${s.darsId}"`,
          `"${(s.darsName || '').replace(/"/g, '""')}"`,
          `"${s.place}"`,
          `"${s.district}"`,
          `"${s.classLevel || ''}"`,
          `"${s.usthad || ''}"`,
          `"${s.createdAt ? new Date(s.createdAt).toLocaleDateString() : ''}"`
        ];
        csvContent += row.join(",") + "\r\n";
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `ADSA_SUFFA_Students_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    });
  }

  // 3. Print dialog
  if (printStudentsBtn) {
    printStudentsBtn.addEventListener('click', () => {
      const students = getExportFilteredStudents();
      generatePrintPdfWindow(students);
    });
  }

  // Close modals when clicking outside or close button
  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('open');
    });
  });

  // Initial Auth Check
  checkAuth();
});
