const API_BASE = 'https://api.escuelajs.co/api/v1';
const tbody = document.getElementById('tbody');
const searchTitle = document.getElementById('searchTitle');
const perPageSelect = document.getElementById('perPage');
const paginationEl = document.getElementById('pagination');
const paginationInfo = document.getElementById('paginationInfo');
const sortTitleEl = document.getElementById('sortTitle');
const sortPriceEl = document.getElementById('sortPrice');
const btnExportCsv = document.getElementById('btnExportCsv');

let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
let perPage = 10;
let sortTitleOrder = 'none';
let sortPriceOrder = 'none';

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

function applySort(data) {
  const list = [...data];
  if (sortTitleOrder === 'asc') list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  if (sortTitleOrder === 'desc') list.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
  if (sortPriceOrder === 'asc') list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
  if (sortPriceOrder === 'desc') list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
  return list;
}

function updateSortIcons() {
  sortTitleEl.classList.remove('bi-arrow-down', 'bi-arrow-up', 'bi-arrow-down-up', 'active');
  sortPriceEl.classList.remove('bi-arrow-down', 'bi-arrow-up', 'bi-arrow-down-up', 'active');
  sortTitleEl.classList.add(sortTitleOrder === 'asc' ? 'bi-arrow-up' : sortTitleOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-down-up');
  sortPriceEl.classList.add(sortPriceOrder === 'asc' ? 'bi-arrow-up' : sortPriceOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-down-up');
  if (sortTitleOrder !== 'none') sortTitleEl.classList.add('active');
  if (sortPriceOrder !== 'none') sortPriceEl.classList.add('active');
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
  updateSortIcons();
}

function filterByTitle() {
  const q = (searchTitle.value || '').trim().toLowerCase();
  const list = q
    ? allProducts.filter(p => (p.title || '').toLowerCase().includes(q))
    : [...allProducts];
  filteredProducts = applySort(list);
  currentPage = 1;
  render();
}

function exportCurrentViewToCsv() {
  const pageData = getPageData();
  if (pageData.length === 0) {
    alert('Không có dữ liệu để export.');
    return;
  }
  const headers = ['id', 'title', 'price', 'category', 'images', 'description'];
  const rows = pageData.map(p => {
    const cat = p.category ? p.category.name : '';
    const imgs = Array.isArray(p.images) ? p.images.join('; ') : (p.images || '');
    const desc = (p.description || '').replace(/"/g, '""');
    return [p.id, `"${(p.title || '').replace(/"/g, '""')}"`, p.price, `"${cat.replace(/"/g, '""')}"`, `"${imgs}"`, `"${desc}"`];
  });
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `products_page${currentPage}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
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
    sortTitleEl.addEventListener('click', () => {
      sortPriceOrder = 'none';
      sortTitleOrder = sortTitleOrder === 'none' ? 'asc' : sortTitleOrder === 'asc' ? 'desc' : 'none';
      filterByTitle();
    });
    sortPriceEl.addEventListener('click', () => {
      sortTitleOrder = 'none';
      sortPriceOrder = sortPriceOrder === 'none' ? 'asc' : sortPriceOrder === 'asc' ? 'desc' : 'none';
      filterByTitle();
    });
    btnExportCsv.addEventListener('click', exportCurrentViewToCsv);
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-5 text-danger">Lỗi: ${e.message}</td></tr>`;
  }
})();
