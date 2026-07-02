/* ============================================================
   Admin — Login, view registrations, export Excel
   ============================================================ */

(function () {
  var loginSection     = document.getElementById('loginSection');
  var dashboardSection = document.getElementById('dashboardSection');
  var loginForm        = document.getElementById('loginForm');
  var loginError       = document.getElementById('loginError');
  var loadError        = document.getElementById('loadError');
  var loginBtn         = document.getElementById('loginBtn');
  var logoutBtn        = document.getElementById('logoutBtn');
  var refreshBtn       = document.getElementById('refreshBtn');
  var exportBtn        = document.getElementById('exportBtn');
  var searchInput      = document.getElementById('searchInput');
  var regTableBody     = document.getElementById('regTableBody');
  var adminUserBar     = document.getElementById('adminUserBar');
  var adminEmailEl     = document.getElementById('adminEmail');
  var lastRefreshEl    = document.getElementById('lastRefresh');
  var tableCountEl     = document.getElementById('tableCount');

  var allRows = [];
  var client  = null;

  var ATTENDANCE_LABELS = {
    both: 'ทั้ง 2 วัน',
    day1: '13 ส.ค. 2569 (วันที่ 1)',
    day2: '14 ส.ค. 2569 (วันที่ 2)'
  };

  function getClient() {
    if (client) return client;
    var url = window.SUPABASE_URL;
    var key = window.SUPABASE_ANON_KEY;
    if (!url || !key || url.indexOf('YOUR_PROJECT') !== -1) {
      throw new Error('ยังไม่ได้ตั้งค่า js/config.js');
    }
    client = window.supabase.createClient(url, key);
    return client;
  }

  function showLoginError(msg) {
    loginError.textContent = msg;
    loginError.hidden = false;
  }

  function showLoadError(msg) {
    loadError.textContent = msg;
    loadError.hidden = false;
  }

  function formatDate(iso) {
    if (!iso) return '—';
    var d = new Date(iso);
    return d.toLocaleString('th-TH', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function showDashboard(email) {
    loginSection.hidden = true;
    dashboardSection.hidden = false;
    adminUserBar.hidden = false;
    adminEmailEl.textContent = email;
  }

  function showLogin() {
    loginSection.hidden = false;
    dashboardSection.hidden = true;
    adminUserBar.hidden = true;
    loginError.hidden = true;
    loadError.hidden = true;
  }

  function updateStats(rows) {
    document.getElementById('statTotal').textContent = rows.length;
    document.getElementById('statBoth').textContent = rows.filter(function (r) { return r.attendance_days === 'both'; }).length;
    document.getElementById('statDay1').textContent = rows.filter(function (r) { return r.attendance_days === 'day1'; }).length;
    document.getElementById('statDay2').textContent = rows.filter(function (r) { return r.attendance_days === 'day2'; }).length;
  }

  function filterRows(query) {
    if (!query) return allRows;
    var q = query.toLowerCase();
    return allRows.filter(function (r) {
      return (r.full_name && r.full_name.toLowerCase().indexOf(q) !== -1) ||
        (r.email && r.email.toLowerCase().indexOf(q) !== -1) ||
        (r.organization && r.organization.toLowerCase().indexOf(q) !== -1) ||
        (r.phone && r.phone.indexOf(q) !== -1);
    });
  }

  function renderTable(rows) {
    if (!rows.length) {
      regTableBody.innerHTML = '<tr><td colspan="10" class="admin-empty">ไม่พบข้อมูล</td></tr>';
      tableCountEl.textContent = 'แสดง 0 รายการ';
      return;
    }
    regTableBody.innerHTML = rows.map(function (r, i) {
      return '<tr>' +
        '<td>' + (i + 1) + '</td>' +
        '<td>' + escapeHtml(formatDate(r.created_at)) + '</td>' +
        '<td>' + escapeHtml(r.full_name) + '</td>' +
        '<td>' + escapeHtml(r.email) + '</td>' +
        '<td>' + escapeHtml(r.phone) + '</td>' +
        '<td>' + escapeHtml(r.organization) + '</td>' +
        '<td>' + escapeHtml(r.position || '—') + '</td>' +
        '<td>' + escapeHtml(ATTENDANCE_LABELS[r.attendance_days] || r.attendance_days) + '</td>' +
        '<td>' + (r.bring_notebook ? 'ใช่' : 'ไม่') + '</td>' +
        '<td>' + escapeHtml(r.notes || '—') + '</td>' +
        '</tr>';
    }).join('');
    tableCountEl.textContent = 'แสดง ' + rows.length + ' รายการ';
  }

  function loadRegistrations() {
    loadError.hidden = true;
    regTableBody.innerHTML = '<tr><td colspan="10" class="admin-empty">กำลังโหลด...</td></tr>';

    getClient()
      .from('forum_registrations')
      .select('*')
      .order('created_at', { ascending: false })
      .then(function (result) {
        if (result.error) {
          if (result.error.code === 'PGRST301' || result.error.message.indexOf('JWT') !== -1) {
            showLoadError('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
            showLogin();
            return;
          }
          showLoadError(result.error.message || 'ไม่สามารถโหลดข้อมูลได้ — ตรวจสอบ RLS policy และอีเมล admin');
          regTableBody.innerHTML = '<tr><td colspan="10" class="admin-empty">โหลดไม่สำเร็จ</td></tr>';
          return;
        }
        allRows = result.data || [];
        updateStats(allRows);
        renderTable(filterRows(searchInput ? searchInput.value : ''));
        lastRefreshEl.textContent = new Date().toLocaleString('th-TH');
      });
  }

  function exportExcel() {
    var rows = filterRows(searchInput ? searchInput.value : '');
    if (!rows.length) {
      alert('ไม่มีข้อมูลสำหรับ export');
      return;
    }
    if (!window.XLSX) {
      alert('ไม่สามารถโหลด Excel library ได้');
      return;
    }

    var sheetData = rows.map(function (r, i) {
      return {
        'ลำดับ': i + 1,
        'วันที่ลงทะเบียน': formatDate(r.created_at),
        'ชื่อ-นามสกุล': r.full_name,
        'อีเมล': r.email,
        'เบอร์โทร': r.phone,
        'หน่วยงาน': r.organization,
        'ตำแหน่ง': r.position || '',
        'วันเข้าร่วม': ATTENDANCE_LABELS[r.attendance_days] || r.attendance_days,
        'นำ Notebook': r.bring_notebook ? 'ใช่' : 'ไม่',
        'หมายเหตุ': r.notes || '',
        'งาน': r.event_name || ''
      };
    });

    var ws = XLSX.utils.json_to_sheet(sheetData);
    ws['!cols'] = [
      { wch: 6 }, { wch: 20 }, { wch: 22 }, { wch: 28 }, { wch: 14 },
      { wch: 28 }, { wch: 20 }, { wch: 22 }, { wch: 12 }, { wch: 24 }, { wch: 28 }
    ];
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ลงทะเบียน Forum');
    var filename = 'forum_registrations_' + new Date().toISOString().slice(0, 10) + '.xlsx';
    XLSX.writeFile(wb, filename);
  }

  function checkSession() {
    getClient().auth.getSession().then(function (res) {
      var session = res.data && res.data.session;
      if (session && session.user) {
        showDashboard(session.user.email);
        loadRegistrations();
      } else {
        showLogin();
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      loginError.hidden = true;
      loginBtn.disabled = true;
      loginBtn.textContent = 'กำลังเข้าสู่ระบบ...';

      var email = loginForm.email.value.trim();
      var password = loginForm.password.value;

      getClient().auth.signInWithPassword({ email: email, password: password })
        .then(function (res) {
          loginBtn.disabled = false;
          loginBtn.textContent = 'เข้าสู่ระบบ';
          if (res.error) {
            showLoginError(res.error.message === 'Invalid login credentials'
              ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
              : res.error.message);
            return;
          }
          showDashboard(res.data.user.email);
          loadRegistrations();
        })
        .catch(function () {
          loginBtn.disabled = false;
          loginBtn.textContent = 'เข้าสู่ระบบ';
          showLoginError('ไม่สามารถเชื่อมต่อได้');
        });
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      getClient().auth.signOut().then(function () {
        allRows = [];
        showLogin();
        loginForm.reset();
      });
    });
  }

  if (refreshBtn) refreshBtn.addEventListener('click', loadRegistrations);
  if (exportBtn) exportBtn.addEventListener('click', exportExcel);

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      renderTable(filterRows(searchInput.value));
    });
  }

  checkSession();
})();
