/**
 * ADSA SUFFA Leadership & Career Camp 2026
 * Public Website Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
    });
  }

  // 2. Populate 41 Dars in Registration Form Dropdown
  const regDarsSelect = document.getElementById('regDars');
  const darsList = Store.getDars();

  if (regDarsSelect) {
    regDarsSelect.innerHTML = '<option value="">-- Select a Dars --</option>';
    darsList.filter(d => d.name !== 'Details Pending').forEach(d => {
      const opt = document.createElement('option');
      opt.value = d.id;
      const location = [d.place, d.district].filter(Boolean).join(', ');
      opt.textContent = `${d.id} - ${d.name}${location ? ` (${location})` : ''}`;
      regDarsSelect.appendChild(opt);
    });
  }

  // Auto-fill Usthad name when Dars is selected
  if (regDarsSelect) {
    regDarsSelect.addEventListener('change', (e) => {
      const darsId = e.target.value;
      const usthadInput = document.getElementById('regUsthad');
      const districtSelect = document.getElementById('regDistrict');
      
      if (darsId) {
        const found = Store.getDarsById(darsId);
        if (found) {
          if (usthadInput && !usthadInput.value) usthadInput.value = found.usthad || '';
          if (districtSelect && !districtSelect.value) districtSelect.value = found.district || '';
        }
      }
    });

    const requestedDarsId = new URLSearchParams(window.location.search).get('dars');
    if (requestedDarsId) {
      regDarsSelect.value = requestedDarsId;
      if (regDarsSelect.value === requestedDarsId) {
        regDarsSelect.dispatchEvent(new Event('change'));
      }
    }
  }

  // 3. Render 41 Dars Directory Cards
  const darsCardsContainer = document.getElementById('darsCardsContainer');
  const darsSearchInput = document.getElementById('darsSearchInput');
  const darsDistrictFilter = document.getElementById('darsDistrictFilter');
  const darsCountBadge = document.getElementById('darsCountBadge');

  function renderDarsDirectory(filteredList) {
    if (!darsCardsContainer) return;
    darsCardsContainer.innerHTML = '';

    if (filteredList.length === 0) {
      darsCardsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: #fff; border-radius: 12px; border: 1px dashed #cbd5e1;">
          <p style="color: #64748b; font-size: 1.1rem;">No Dars matched your search.</p>
        </div>
      `;
      if (darsCountBadge) darsCountBadge.textContent = `0 Dars`;
      return;
    }

    if (darsCountBadge) darsCountBadge.textContent = `${filteredList.length} Dars`;

    const stats = Store.getStats();

    filteredList.forEach(d => {
      const regCount = stats.darsCounts[d.id] || 0;
      const phoneHref = String(d.phone || '').replace(/[^\d+]/g, '');
      const canRegister = d.name !== 'Details Pending';
      const card = document.createElement('article');
      card.className = 'dars-card';
      card.innerHTML = `
        <div class="dars-card-top">
          <span class="dars-id-pill">DARS ${d.id}</span>
        </div>
        <h4 class="dars-card-name">${d.name}</h4>
        ${d.place ? `<p class="dars-card-place">📍 ${d.place}</p>` : ''}
        <div class="dars-card-meta">
          ${d.usthad ? `<div class="dars-usthad-row"><span>Usthad</span> <strong>${d.usthad}</strong></div>` : ''}
          ${d.phone ? `<a class="dars-phone-link" href="tel:${phoneHref}">📞 ${d.phone}</a>` : ''}
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
            <span class="dars-reg-badge">${regCount} registration${regCount === 1 ? '' : 's'}</span>
            ${canRegister ? `<button class="btn btn-outline" style="padding: 4px 10px; font-size: 0.75rem;" onclick="quickRegisterDars('${d.id}')">Register ➔</button>` : ''}
          </div>
        </div>
      `;
      darsCardsContainer.appendChild(card);
    });
  }

  function filterDars() {
    const term = (darsSearchInput?.value || '').toLowerCase().trim();
    const district = darsDistrictFilter?.value || 'ALL';

    const allDars = Store.getDars();
    const result = allDars.filter(d => {
      const searchText = [d.id, d.name, d.place, d.district, d.usthad, d.phone]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const matchesSearch = !term || searchText.includes(term);
      const matchesDistrict = district === 'ALL' ||
        (district === 'UNSPECIFIED' ? !d.district : d.district === district);
      return matchesSearch && matchesDistrict;
    });

    renderDarsDirectory(result);
  }

  if (darsSearchInput) darsSearchInput.addEventListener('input', filterDars);
  if (darsDistrictFilter) darsDistrictFilter.addEventListener('change', filterDars);

  // Initial Dars Directory render
  renderDarsDirectory(darsList);

  // Schedule day selector
  const scheduleDayTabs = document.querySelectorAll('.schedule-day-tab');
  if (scheduleDayTabs.length) {
    const scheduleDetailDay = document.getElementById('scheduleDetailDay');
    const scheduleVisualDay = document.getElementById('scheduleVisualDay');
    const scheduleDetailTitle = document.getElementById('scheduleDetailTitle');
    const scheduleDetailSummary = document.getElementById('scheduleDetailSummary');
    const scheduleSection1 = document.getElementById('scheduleSection1');
    const scheduleSection2 = document.getElementById('scheduleSection2');
    const scheduleSection3 = document.getElementById('scheduleSection3');

    scheduleDayTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        scheduleDayTabs.forEach(dayTab => {
          const isSelected = dayTab === tab;
          dayTab.classList.toggle('is-active', isSelected);
          dayTab.setAttribute('aria-pressed', String(isSelected));
        });

        if (scheduleDetailDay) scheduleDetailDay.textContent = tab.dataset.scheduleDay;
        if (scheduleVisualDay) scheduleVisualDay.textContent = tab.dataset.dayNumber;
        if (scheduleDetailTitle) scheduleDetailTitle.textContent = tab.dataset.scheduleTitle;
        if (scheduleDetailSummary) scheduleDetailSummary.textContent = tab.dataset.scheduleSummary;
        if (scheduleSection1) scheduleSection1.textContent = tab.getAttribute('data-section-1');
        if (scheduleSection2) scheduleSection2.textContent = tab.getAttribute('data-section-2');
        if (scheduleSection3) scheduleSection3.textContent = tab.getAttribute('data-section-3');
      });
    });
  }

  // Global Quick Register link from Dars card
  window.quickRegisterDars = function(darsId) {
    if (regDarsSelect) {
      regDarsSelect.value = darsId;
      regDarsSelect.dispatchEvent(new Event('change'));
    } else {
      window.location.href = `register.html?dars=${encodeURIComponent(darsId)}`;
      return;
    }
    const regSection = document.getElementById('register');
    if (regSection) {
      regSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 4. Render Gallery Photos
  const galleryGrid = document.getElementById('publicGalleryGrid');
  function renderPublicGallery() {
    if (!galleryGrid) return;
    const photos = Store.getGallery();
    galleryGrid.innerHTML = '';

    photos.forEach(p => {
      const item = document.createElement('div');
      item.className = 'gallery-item';
      item.innerHTML = `
        <img src="${p.url}" alt="${p.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=800&q=80'">
        <div class="gallery-item-overlay">
          <span class="gallery-tag">${p.category}</span>
          <h4 class="gallery-item-title">${p.title}</h4>
          <p class="gallery-item-caption">${p.caption}</p>
        </div>
      `;
      galleryGrid.appendChild(item);
    });
  }
  renderPublicGallery();

  // 5. Registration Form Handler
  const studentRegForm = document.getElementById('studentRegForm');
  const regSuccessCard = document.getElementById('regSuccessCard');
  const registerBox = document.getElementById('registerBox');

  if (studentRegForm) {
    studentRegForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('regName').value;
      const phone = document.getElementById('regPhone').value;
      const darsId = document.getElementById('regDars').value;
      const district = document.getElementById('regDistrict').value;
      const classLevel = document.getElementById('regClassLevel').value;
      const usthad = document.getElementById('regUsthad')?.value || '';

      if (!name || !phone || !darsId || !district) {
        showToast('Please complete all required fields.', 'error');
        return;
      }

      // Add to store
      const registered = Store.addStudent({
        name,
        phone,
        darsId,
        district,
        classLevel,
        usthad
      });

      // Show Success Card
      if (regSuccessCard && registerBox) {
        registerBox.style.display = 'none';
        regSuccessCard.style.display = 'block';

        document.getElementById('successRegId').textContent = registered.id;
        document.getElementById('successName').textContent = registered.name;
        document.getElementById('successDars').textContent = registered.darsName;
        document.getElementById('successPhone').textContent = registered.phone;
        document.getElementById('successDistrict').textContent = registered.district;

        showToast('Registration completed successfully!', 'success');
        regSuccessCard.scrollIntoView({ behavior: 'smooth' });
      }

      // Update counters and directory
      filterDars();
    });
  }

  // Reset form to register another student
  const regAnotherBtn = document.getElementById('regAnotherBtn');
  if (regAnotherBtn) {
    regAnotherBtn.addEventListener('click', () => {
      if (studentRegForm) studentRegForm.reset();
      if (registerBox) registerBox.style.display = 'block';
      if (regSuccessCard) regSuccessCard.style.display = 'none';
      registerBox.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Toast notification helper
  function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✓' : 'ℹ'}</span>
      <div>${message}</div>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
});
