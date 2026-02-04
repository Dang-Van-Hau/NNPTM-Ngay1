const API_BASE = 'https://api.escuelajs.co/api/v1';
const tbody = document.getElementById('tbody');

async function fetchProducts() {
  const res = await fetch(`${API_BASE}/products`);
  if (!res.ok) throw new Error('Lỗi tải sản phẩm');
  return res.json();
}

function escapeHtml(s) {
  if (s == null) return '';
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function renderTable(products) {
  if (!products.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-5 text-muted">Không có dữ liệu</td></tr>';
    return;
  }
  tbody.innerHTML = products.map(p => {
    const categoryName = p.category ? p.category.name : '—';
    const imgs = Array.isArray(p.images) ? p.images : (p.images ? [p.images] : []);
    const imagesHtml = imgs.slice(0, 3).map(url =>
      `<img src="${url}" alt="" class="thumb-img me-1" onerror="this.src='https://placehold.co/48x48?text=Err'">`
    ).join('');
    return `
      <tr>
        <td>${p.id}</td>
        <td>${escapeHtml(p.title || '')}</td>
        <td>${typeof p.price === 'number' ? p.price.toLocaleString() : p.price}</td>
        <td>${escapeHtml(categoryName)}</td>
        <td>${imagesHtml || '—'}</td>
      </tr>
    `;
  }).join('');
}

(async () => {
  try {
    const products = await fetchProducts();
    renderTable(products);
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-5 text-danger">Lỗi: ${e.message}</td></tr>`;
  }
})();
