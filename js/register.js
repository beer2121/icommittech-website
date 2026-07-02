/* ============================================================
   Forum Registration — Supabase insert
   ============================================================ */

(function () {
  var form        = document.getElementById('registerForm');
  var successBox  = document.getElementById('formSuccess');
  var errorBox    = document.getElementById('formError');
  var submitBtn   = document.getElementById('submitBtn');

  if (!form) return;

  function showError(msg) {
    if (errorBox) {
      errorBox.textContent = msg;
      errorBox.hidden = false;
    }
    if (successBox) successBox.hidden = true;
  }

  function showSuccess() {
    if (successBox) successBox.hidden = false;
    if (errorBox) errorBox.hidden = true;
    form.hidden = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function getClient() {
    var url = window.SUPABASE_URL;
    var key = window.SUPABASE_ANON_KEY;
    if (!url || !key || url.indexOf('YOUR_PROJECT') !== -1 || key.indexOf('YOUR_ANON') !== -1) {
      throw new Error('ยังไม่ได้ตั้งค่า Supabase — กรุณาแก้ไขไฟล์ js/config.js');
    }
    if (!window.supabase) {
      throw new Error('ไม่สามารถโหลด Supabase client ได้');
    }
    return window.supabase.createClient(url, key);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (errorBox) errorBox.hidden = true;

    var data = {
      event_name:      'Digital Hospital Forum 2026',
      full_name:       form.full_name.value.trim(),
      email:           form.email.value.trim().toLowerCase(),
      phone:           form.phone.value.trim(),
      organization:    form.organization.value.trim(),
      position:        form.position.value.trim() || null,
      attendance_days: form.attendance_days.value,
      bring_notebook:  form.bring_notebook.checked,
      notes:           form.notes.value.trim() || null
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'กำลังส่ง...';

    try {
      var client = getClient();
      client
        .from('forum_registrations')
        .insert([data])
        .then(function (result) {
          if (result.error) {
            if (result.error.code === '23505') {
              showError('อีเมลนี้ลงทะเบียนไว้แล้ว หากต้องการแก้ไขข้อมูลกรุณาติดต่อทีมงาน');
            } else {
              showError(result.error.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
            }
            submitBtn.disabled = false;
            submitBtn.textContent = 'ส่งการลงทะเบียน';
            return;
          }
          showSuccess();
        })
        .catch(function () {
          showError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่ภายหลัง');
          submitBtn.disabled = false;
          submitBtn.textContent = 'ส่งการลงทะเบียน';
        });
    } catch (err) {
      showError(err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = 'ส่งการลงทะเบียน';
    }
  });
})();
