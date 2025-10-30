// Minimal inventory renderer that uses the global Assets array
function populateInventory() {
  const tbody = document.getElementById('inventory-table-body') || document.getElementById('online-assets-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  Assets.forEach(a => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${a.assetName}</td><td>${a.macAddress}</td><td>${a.assetId}</td><td class="${a.status==='Online'?'success':'danger'}">${a.status}</td><td class="${a.condition==='Disponível'?'success':'warning'}">${a.condition}</td><td class="action-icons">-</td>`;
    tbody.appendChild(tr);
  });
}
document.addEventListener('DOMContentLoaded', populateInventory);
