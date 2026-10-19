(() => {
  const STORAGE_KEY = 'studentCourseManagement.githubPages.v1';
  const starterCourses = [
    { code: 'CYB 203', title: 'Cybercrime Law and Countermeasures', units: 2 },
    { code: 'COS 201', title: 'Computer Programming I', units: 3 },
    { code: 'ENT 211', title: 'Entrepreneurship and Innovation', units: 2 },
    { code: 'MIVA-CYB 207', title: 'Zero Trust Networking', units: 2 },
    { code: 'SEN 201', title: 'Introduction to Software Engineering', units: 2 },
    { code: 'MTH 201', title: 'Mathematical Methods I', units: 2 },
    { code: 'CYB 201', title: 'Introduction to Cybersecurity and Strategy', units: 2 },
    { code: 'CYB 299', title: 'SIWES I', units: 3 }
  ];
  const $ = (id) => document.getElementById(id);
  let courses = loadCourses();
  let editIndex = null;
  let toastTimer;

  function loadCourses() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === null) return starterCourses.map(c => ({ ...c }));
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.filter(validCourse).map(normalizeCourse) : starterCourses.map(c => ({ ...c }));
    } catch (error) { return starterCourses.map(c => ({ ...c })); }
  }
  function validCourse(c) { return c && typeof c.code === 'string' && typeof c.title === 'string' && Number.isFinite(Number(c.units)) && Number(c.units) > 0; }
  function normalizeCourse(c) { return { code: String(c.code).trim(), title: String(c.title).trim(), units: Number(c.units) }; }
  function saveCourses() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(courses)); $('status'); }
    catch (error) { showToast('Could not save in this browser. Export a backup file.'); }
  }
  function escapeHtml(value) { return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
  function render() {
    const q = $('searchInput').value.trim().toLowerCase();
    const visible = courses.map((course, index) => ({ ...course, index })).filter(c => c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q));
    $('courseCount').textContent = courses.length;
    const totalUnits = courses.reduce((sum, c) => sum + Number(c.units), 0);
    $('unitCount').textContent = totalUnits;
    $('averageUnits').textContent = courses.length ? (totalUnits / courses.length).toFixed(1) : '0.0';
    $('courseTable').innerHTML = visible.map(c => `<tr><td class="course-code">${escapeHtml(c.code)}</td><td class="course-title">${escapeHtml(c.title)}</td><td><span class="unit-pill">${c.units}</span></td><td><div class="row-actions"><button class="tiny-btn" data-action="edit" data-index="${c.index}">Edit</button><button class="tiny-btn delete" data-action="delete" data-index="${c.index}">Delete</button></div></td></tr>`).join('');
    $('emptyState').hidden = visible.length !== 0;
    $('showingCount').textContent = `Showing ${visible.length} of ${courses.length} course${courses.length === 1 ? '' : 's'}`;
  }
  function showToast(message) { const el = $('toast'); el.textContent = message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2600); }
  function openDialog(index = null) {
    editIndex = index;
    $('dialogTitle').textContent = index === null ? 'Add a course' : 'Edit course';
    $('courseCode').value = index === null ? '' : courses[index].code;
    $('courseTitle').value = index === null ? '' : courses[index].title;
    $('courseUnits').value = index === null ? '' : courses[index].units;
    $('formError').textContent = '';
    $('courseDialog').showModal();
    $('courseCode').focus();
  }
  function closeDialog() { $('courseDialog').close(); }
  function csvEscape(value) { return '"' + String(value).replace(/"/g, '""') + '"'; }
  function downloadFile(name, content, type) {
    const blob = new Blob([content], { type }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }
  function exportCsv() { const lines = [['Course Code','Course Title','Units'], ...courses.map(c => [c.code,c.title,c.units])].map(row => row.map(csvEscape).join(',')).join('\r\n'); downloadFile('student-courses.csv', '\uFEFF' + lines, 'text/csv;charset=utf-8'); showToast('CSV backup downloaded.'); }
  function exportJson() { downloadFile('student-courses.json', JSON.stringify(courses, null, 2), 'application/json'); showToast('JSON backup downloaded.'); }
  function parseCsv(text) {
    const rows = []; let row = [], cell = '', quoted = false;
    for (let i = 0; i < text.length; i++) { const ch = text[i]; if (quoted) { if (ch === '"' && text[i+1] === '"') { cell += '"'; i++; } else if (ch === '"') quoted = false; else cell += ch; } else if (ch === '"') quoted = true; else if (ch === ',') { row.push(cell); cell = ''; } else if (ch === '\n') { row.push(cell.replace(/\r$/, '')); if (row.some(v => v.trim())) rows.push(row); row = []; cell = ''; } else cell += ch; }
    row.push(cell.replace(/\r$/, '')); if (row.some(v => v.trim())) rows.push(row);
    if (rows.length && /course\s*code/i.test(rows[0][0])) rows.shift();
    return rows.map(r => ({ code: String(r[0] || '').trim(), title: String(r[1] || '').trim(), units: Number(r[2]) })).filter(validCourse);
  }
  $('addCourseBtn').addEventListener('click', () => openDialog());
  $('closeDialog').addEventListener('click', closeDialog);
  $('cancelDialog').addEventListener('click', closeDialog);
  $('searchInput').addEventListener('input', render);
  $('courseTable').addEventListener('click', event => {
    const button = event.target.closest('button[data-action]'); if (!button) return;
    const index = Number(button.dataset.index);
    if (button.dataset.action === 'edit') openDialog(index);
    if (button.dataset.action === 'delete' && confirm(`Delete ${courses[index].code} — ${courses[index].title}?`)) { courses.splice(index, 1); saveCourses(); render(); showToast('Course deleted.'); }
  });
  $('courseForm').addEventListener('submit', event => {
    event.preventDefault();
    const course = { code: $('courseCode').value.trim(), title: $('courseTitle').value.trim(), units: Number($('courseUnits').value) };
    if (!course.code || !course.title || !Number.isInteger(course.units) || course.units < 1 || course.units > 30) { $('formError').textContent = 'Enter a course code, title and whole-number units between 1 and 30.'; return; }
    const duplicate = courses.findIndex((c, i) => c.code.toLowerCase() === course.code.toLowerCase() && i !== editIndex);
    if (duplicate !== -1) { $('formError').textContent = 'A course with this code already exists.'; return; }
    if (editIndex === null) courses.push(course); else courses[editIndex] = course;
    saveCourses(); render(); closeDialog(); showToast(editIndex === null ? 'Course added and saved.' : 'Course updated and saved.');
  });
  $('exportBtn').addEventListener('click', exportCsv);
  $('jsonBtn').addEventListener('click', exportJson);
  $('importBtn').addEventListener('click', () => $('fileInput').click());
  $('fileInput').addEventListener('change', async event => {
    const file = event.target.files[0]; if (!file) return;
    try {
      const text = await file.text(); let imported;
      if (file.name.toLowerCase().endsWith('.json')) { const parsed = JSON.parse(text); if (!Array.isArray(parsed)) throw new Error('JSON must contain a list of courses.'); imported = parsed.filter(validCourse).map(normalizeCourse); }
      else imported = parseCsv(text);
      if (!imported.length) throw new Error('No valid courses were found. Check the file format.');
      const unique = new Map(); imported.forEach(c => unique.set(c.code.toLowerCase(), c));
      if (!confirm(`Import ${unique.size} course(s)? This replaces the current course list.`)) return;
      courses = [...unique.values()]; saveCourses(); render(); showToast(`${courses.length} course(s) imported.`);
    } catch (error) { alert(error.message || 'Unable to import this file.'); }
    finally { event.target.value = ''; }
  });
  render();
})();
