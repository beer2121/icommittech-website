/* ============================================================
   Admin — Forum + Trial registrations, export Excel
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
  var regTableHead     = document.getElementById('regTableHead');
  var regTableBody     = document.getElementById('regTableBody');
  var adminUserBar     = document.getElementById('adminUserBar');
  var adminEmailEl     = document.getElementById('adminEmail');
  var lastRefreshEl    = document.getElementById('lastRefresh');
  var tableCountEl     = document.getElementById('tableCount');
  var pageTitle        = document.getElementById('pageTitle');
  var pageSubtitle     = document.getElementById('pageSubtitle');
  var forumStats       = document.getElementById('forumStats');
  var trialStats       = document.getElementById('trialStats');

  var allRows = [];
  var client  = null;
  var activeTab = 'forum';

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
    return new Date(iso).toLocaleString('th-TH', {
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

  function setTab(tab) {
    activeTab = tab;
    document.querySelectorAll('.admin-tab').forEach(function (btn) {
      var on = btn.getAttribute('data-tab') === tab;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    forumStats.hidden = tab !== 'forum';
    trialStats.hidden = tab !== 'trial';
    if (tab === 'forum') {
      pageTitle.textContent = 'รายชื่อลงทะเบียน Forum';
      pageSubtitle.textContent = 'Digital Hospital Forum 2026';
    } else {
      pageTitle.textContent = 'คำขอทดลองใช้งาน';
      pageSubtitle.textContent = 'Trial Program Registration';
    }
    if (searchInput) searchInput.value = '';
    loadRegistrations();
  }

  function updateForumStats(rows) {
    document.getElementById('statTotal').textContent = rows.length;
    document.getElementById('statBoth').textContent = rows.filter(function (r) { return r.attendance_days === 'both'; }).length;
    document.getElementById('statDay1').textContent = rows.filter(function (r) { return r.attendance_days === 'day1'; }).length;
    document.getElementById('statDay2').textContent = rows.filter(function (r) { return r.attendance_days === 'day2'; }).length;
  }

  function updateTrialStats(rows) {
    document.getElementById('trialStatTotal').textContent = rows.length;
    document.getElementById('trialStatUrgent').textContent = rows.filter(function (r) {
      return r.urgency && r.urgency.indexOf('เร่งด่วนมาก') === 0;
    }).length;
    document.getElementById('trialStatClaim').textContent = rows.filter(function (r) {
      return r.product_interest === 'ตรวจสอบเวชระเบียน';
    }).length;
    document.getElementById('trialStatIcd').textContent = rows.filter(function (r) {
      return r.product_interest && r.product_interest.indexOf('ICD') !== -1;
    }).length;
  }

  function filterRows(query) {
    if (!query) return allRows;
    var q = query.toLowerCase();
    return allRows.filter(function (r) {
      return (r.full_name && r.full_name.toLowerCase().indexOf(q) !== -1) ||
        (r.email && r.email.toLowerCase().indexOf(q) !== -1) ||
        (r.organization && r.organization.toLowerCase().indexOf(q) !== -1) ||
        (r.phone && r.phone.indexOf(q) !== -1) ||
        (r.hospital_code && r.hospital_code.toLowerCase().indexOf(q) !== -1);
    });
  }

  function renderForumTable(rows) {
    regTableHead.innerHTML = '<tr>' +
      '<th>#</th><th>วันที่ลงทะเบียน</th><th>ชื่อ-นามสกุล</th><th>อีเมล</th><th>เบอร์โทร</th>' +
      '<th>หน่วยงาน</th><th>ตำแหน่ง</th><th>วันเข้าร่วม</th><th>Notebook</th><th>หมายเหตุ</th></tr>';
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

  function renderTrialTable(rows) {
    regTableHead.innerHTML = '<tr>' +
      '<th>#</th><th>วันที่ส่ง</th><th>หน่วยงาน</th><th>รหัส รพ.</th><th>ผู้ติดต่อ</th>' +
      '<th>อีเมล</th><th>เบอร์โทร</th><th>ประเภท</th><th>โปรแกรม</th><th>ความเร่งด่วน</th><th>ช่องทาง</th><th>หมายเหตุ</th></tr>';
    if (!rows.length) {
      regTableBody.innerHTML = '<tr><td colspan="12" class="admin-empty">ไม่พบข้อมูล</td></tr>';
      tableCountEl.textContent = 'แสดง 0 รายการ';
      return;
    }
    regTableBody.innerHTML = rows.map(function (r, i) {
      var biz = r.business_type === 'อื่น ๆ' && r.business_type_other
        ? r.business_type + ' (' + r.business_type_other + ')'
        : r.business_type;
      var product = r.product_interest === 'Other' && r.product_interest_other
        ? r.product_interest_other
        : r.product_interest;
      var source = r.referral_source === 'Other' && r.referral_source_other
        ? r.referral_source_other
        : r.referral_source;
      return '<tr>' +
        '<td>' + (i + 1) + '</td>' +
        '<td>' + escapeHtml(formatDate(r.created_at)) + '</td>' +
        '<td>' + escapeHtml(r.organization) + '</td>' +
        '<td>' + escapeHtml(r.hospital_code) + '</td>' +
        '<td>' + escapeHtml(r.full_name) + '</td>' +
        '<td>' + escapeHtml(r.email) + '</td>' +
        '<td>' + escapeHtml(r.phone) + '</td>' +
        '<td>' + escapeHtml(biz || '—') + '</td>' +
        '<td>' + escapeHtml(product || '—') + '</td>' +
        '<td>' + escapeHtml(r.urgency || '—') + '</td>' +
        '<td>' + escapeHtml(source || '—') + '</td>' +
        '<td>' + escapeHtml(r.notes || '—') + '</td>' +
        '</tr>';
    }).join('');
    tableCountEl.textContent = 'แสดง ' + rows.length + ' รายการ';
  }

  function renderTable(rows) {
    if (activeTab === 'trial') renderTrialTable(rows);
    else renderForumTable(rows);
  }

  function loadRegistrations() {
    loadError.hidden = true;
    var colCount = activeTab === 'trial' ? 12 : 10;
    regTableBody.innerHTML = '<tr><td colspan="' + colCount + '" class="admin-empty">กำลังโหลด...</td></tr>';
    var table = activeTab === 'trial' ? 'trial_registrations' : 'forum_registrations';

    getClient()
      .from(table)
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
          regTableBody.innerHTML = '<tr><td colspan="' + colCount + '" class="admin-empty">โหลดไม่สำเร็จ</td></tr>';
          return;
        }
        allRows = result.data || [];
        if (activeTab === 'trial') updateTrialStats(allRows);
        else updateForumStats(allRows);
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

    var sheetData;
    var sheetName;
    var filename;

    if (activeTab === 'trial') {
      sheetName = 'ทดลองใช้งาน';
      filename = 'trial_registrations_' + new Date().toISOString().slice(0, 10) + '.xlsx';
      sheetData = rows.map(function (r, i) {
        return {
          'ลำดับ': i + 1,
          'วันที่ส่ง': formatDate(r.created_at),
          'หน่วยงาน': r.organization,
          'รหัสโรงพยาบาล': r.hospital_code,
          'ผู้ติดต่อ': r.full_name,
          'อีเมล': r.email,
          'เบอร์โทร': r.phone,
          'ประเภทธุรกิจ': r.business_type,
          'ประเภทอื่นๆ': r.business_type_other || '',
          'โปรแกรมที่สนใจ': r.product_interest,
          'โปรแกรมอื่นๆ': r.product_interest_other || '',
          'ความเร่งด่วน': r.urgency,
          'ช่องทางรู้จัก': r.referral_source,
          'ช่องทางอื่นๆ': r.referral_source_other || '',
          'หมายเหตุ': r.notes || ''
        };
      });
    } else {
      sheetName = 'ลงทะเบียน Forum';
      filename = 'forum_registrations_' + new Date().toISOString().slice(0, 10) + '.xlsx';
      sheetData = rows.map(function (r, i) {
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
    }

    var ws = XLSX.utils.json_to_sheet(sheetData);
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
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

      getClient().auth.signInWithPassword({
        email: loginForm.email.value.trim(),
        password: loginForm.password.value
      }).then(function (res) {
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
      }).catch(function () {
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

  document.querySelectorAll('.admin-tab').forEach(function (btn) {
    btn.addEventListener('click', function () {
      setTab(btn.getAttribute('data-tab'));
    });
  });

  if (refreshBtn) refreshBtn.addEventListener('click', loadRegistrations);
  if (exportBtn) exportBtn.addEventListener('click', exportExcel);
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      renderTable(filterRows(searchInput.value));
    });
  }

  checkSession();
})();
