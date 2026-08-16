/* ============================================================
   Trial Registration — Supabase insert
   ============================================================ */

(function () {
  var form       = document.getElementById('trialForm');
  var successBox = document.getElementById('formSuccess');
  var errorBox   = document.getElementById('formError');
  var submitBtn  = document.getElementById('submitBtn');

  if (!form) return;

  function toggleOther(selectId, wrapId, otherValue) {
    var select = document.getElementById(selectId);
    var wrap = document.getElementById(wrapId);
    if (!select || !wrap) return;
    select.addEventListener('change', function () {
      wrap.hidden = select.value !== otherValue;
    });
  }

  toggleOther('business_type', 'businessTypeOtherWrap', 'อื่น ๆ');
  toggleOther('referral_source', 'referralOtherWrap', 'Other');
  toggleOther('product_interest', 'productOtherWrap', 'Other');

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

    if (form.business_type.value === 'อื่น ๆ' && !form.business_type_other.value.trim()) {
      showError('กรุณาระบุประเภทหน่วยงานอื่นๆ');
      return;
    }
    if (form.referral_source.value === 'Other' && !form.referral_source_other.value.trim()) {
      showError('กรุณาระบุช่องทางอื่นๆ');
      return;
    }
    if (form.product_interest.value === 'Other' && !form.product_interest_other.value.trim()) {
      showError('กรุณาระบุโปรแกรมอื่นๆ');
      return;
    }

    var data = {
      organization: form.organization.value.trim(),
      hospital_code: form.hospital_code.value.trim(),
      full_name: form.full_name.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim().toLowerCase(),
      business_type: form.business_type.value,
      business_type_other: form.business_type.value === 'อื่น ๆ' ? form.business_type_other.value.trim() : null,
      referral_source: form.referral_source.value,
      referral_source_other: form.referral_source.value === 'Other' ? form.referral_source_other.value.trim() : null,
      product_interest: form.product_interest.value,
      product_interest_other: form.product_interest.value === 'Other' ? form.product_interest_other.value.trim() : null,
      urgency: form.urgency.value,
      notes: form.notes.value.trim() || null
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'กำลังส่ง...';

    try {
      var client = getClient();
      client
        .from('trial_registrations')
        .insert([data])
        .then(function (result) {
          if (result.error) {
            if (result.error.code === '23505') {
              showError('อีเมลนี้เคยส่งคำขอทดลองใช้งานแล้ว หากต้องการแก้ไขข้อมูลกรุณาติดต่อทีมงาน');
            } else {
              showError(result.error.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
            }
            submitBtn.disabled = false;
            submitBtn.textContent = 'ส่งคำขอทดลองใช้งาน';
            return;
          }
          showSuccess();
        })
        .catch(function () {
          showError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่ภายหลัง');
          submitBtn.disabled = false;
          submitBtn.textContent = 'ส่งคำขอทดลองใช้งาน';
        });
    } catch (err) {
      showError(err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = 'ส่งคำขอทดลองใช้งาน';
    }
  });
})();
