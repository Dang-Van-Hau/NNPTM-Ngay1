const API_BASE = 'https://api.escuelajs.co/api/v1';
const tbody = document.getElementById('tbody');
const searchTitle = document.getElementById('searchTitle');
const perPageSelect = document.getElementById('perPage');
const paginationEl = document.getElementById('pagination');
const paginationInfo = document.getElementById('paginationInfo');

let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
let perPage = 10;

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
    const desc = (p.description || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const categoryName = p.category ? p.category.name : '—';
    const imgs = Array.isArray(p.images) ? p.images : (p.images ? [p.images] : []);
    const imagesHtml = imgs.slice(0, 3).map(url =>
      `<img src="${url}" alt="" class="thumb-img me-1" onerror="this.src='https://placehold.co/48x48?text=Err'">`
    ).join('');
    return `
      <tr class="tooltip-desc">
        <td>${p.id}</td>
        <td>${escapeHtml(p.title || '')}<span class="tooltip-desc-text">${desc || 'Không có mô tả'}</span></td>
        <td>${typeof p.price === 'number' ? p.price.toLocaleString() : p.price}</td>
        <td>${escapeHtml(categoryName)}</td>
        <td>${imagesHtml || '—'}</td>
      </tr>
    `;
  }).join('');
}

function getPageData() {
  const start = (currentPage - 1) * perPage;
  return filteredProducts.slice(start, start + perPage);
}

function renderPagination() {
  const total = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const start = (currentPage - 1) * perPage + 1;
  const end = Math.min(currentPage * perPage, total);

  paginationInfo.textContent = total === 0
    ? 'Không có dữ liệu'
    : `Hiển thị ${start}–${end} / ${total} sản phẩm`;

  let html = '';
  if (currentPage > 1) {
    html += `<li class="page-item"><a class="page-link" href="#" data-page="${currentPage - 1}">Trước</a></li>`;
  }
  for (let i = 1; i <= totalPages; i++) {
    const active = i === currentPage ? ' active' : '';
    html += `<li class="page-item${active}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
  }
  if (currentPage < totalPages) {
    html += `<li class="page-item"><a class="page-link" href="#" data-page="${currentPage + 1}">Sau</a></li>`;
  }
  paginationEl.innerHTML = html;

  paginationEl.querySelectorAll('a[data-page]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      currentPage = Number(a.dataset.page);
      render();
    });
  });
}

function render() {
  renderTable(getPageData());
  renderPagination();
}

function filterByTitle() {
  const q = (searchTitle.value || '').trim().toLowerCase();
  filteredProducts = q
    ? allProducts.filter(p => (p.title || '').toLowerCase().includes(q))
    : [...allProducts];
  currentPage = 1;
  render();
}

(async () => {
  try {
    allProducts = await fetchProducts();
    filterByTitle();
    searchTitle.addEventListener('input', filterByTitle);
    searchTitle.addEventListener('change', filterByTitle);
    perPageSelect.addEventListener('change', () => {
      perPage = parseInt(perPageSelect.value, 10);
      currentPage = 1;
      render();
    });
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-5 text-danger">Lỗi: ${e.message}</td></tr>`;
  }
})();
