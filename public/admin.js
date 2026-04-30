let auth = localStorage.getItem('adminAuth');

function init() {
  if (!auth) {
    auth = prompt('Enter admin key:');
    if (auth) localStorage.setItem('adminAuth', auth);
  }
  loadKeys();
  document.getElementById('generateBtn').addEventListener('click', generateKey);
}

function headers() {
  return { 'Authorization': 'Bearer ' + auth, 'Content-Type': 'application/json' };
}

async function generateKey() {
  const desc = document.getElementById('keyDesc').value;
  const btn = document.getElementById('generateBtn');
  btn.disabled = true;
  try {
    const res = await fetch('/admin/generate-key', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ description: desc || 'App key' })
    });
    const data = await res.json();
    const msg = document.getElementById('genMsg');
    msg.className = data.success ? 'success-msg' : 'error';
    msg.textContent = data.success ? 'Key generated: ' + data.key : data.error;
    msg.style.display = 'block';
    if (data.success) {
      document.getElementById('keyDesc').value = '';
      loadKeys();
    }
  } catch (e) {
    const msg = document.getElementById('genMsg');
    msg.className = 'error';
    msg.textContent = 'Error: ' + e.message;
    msg.style.display = 'block';
  }
  btn.disabled = false;
}

async function deactivateKey(key) {
  if (!confirm('Deactivate ' + key + '?')) return;
  try {
    const res = await fetch('/admin/deactivate-key', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ key: key })
    });
    const data = await res.json();
    if (data.success) loadKeys();
    else showError(data.error);
  } catch (e) {
    showError(e.message);
  }
}

async function loadKeys() {
  try {
    const res = await fetch('/admin/keys', { headers: headers() });
    const data = await res.json();
    if (data.success) renderKeys(data.data);
    else showError(data.error);
  } catch (e) {
    showError(e.message);
  }
}

function renderKeys(keys) {
  const tbody = document.getElementById('keysTable');
  tbody.innerHTML = '';
  keys.forEach(function(k) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td class="key">' + k.key + '</td>' +
      '<td>' + (k.description || '-') + '</td>' +
      '<td><span class="status ' + (k.active ? 'active' : 'inactive') + '">' + (k.active ? 'Active' : 'Inactive') + '</span></td>' +
      '<td>' + new Date(k.created_at).toLocaleDateString() + '</td>' +
      '<td class="actions">' + (k.active ? '<button class="danger" data-key="' + k.key + '">Deactivate</button>' : '') + '</td>';
    tbody.appendChild(tr);
  });
  document.querySelectorAll('button.danger').forEach(function(btn) {
    btn.addEventListener('click', function() { deactivateKey(btn.dataset.key); });
  });
}

function showError(msg) {
  const el = document.getElementById('error');
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(function() { el.style.display = 'none'; }, 5000);
}

document.addEventListener('DOMContentLoaded', init);