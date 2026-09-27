/**
 * AgriShop Inventory Management System - Core Application Logic
 */

// Global App State
const App = {
  currentUser: null,
  currentView: 'dashboard',
  selectedStoreroomId: 'all',
  charts: {},

  init() {
    DB.seed();
    this.checkAuth();
    this.bindEvents();
    this.updateNotificationBadges();
  },

  checkAuth() {
    const savedUser = localStorage.getItem('agri_user');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
      this.showApp();
    } else {
      this.showLogin();
    }
  },

  login(email, password) {
    const users = DB.table('users').all();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      if (user.status !== 'active') {
        App.showToast('Account is inactive. Contact Admin.', 'error');
        return false;
      }
      this.currentUser = user;
      localStorage.setItem('agri_user', JSON.stringify(user));
      this.showApp();
      App.showToast(`Welcome back, ${user.name}!`, 'success');
      return true;
    } else {
      App.showToast('Invalid email or password', 'error');
      return false;
    }
  },

  logout() {
    this.currentUser = null;
    localStorage.removeItem('agri_user');
    this.showLogin();
    App.showToast('Logged out successfully', 'info');
  },

  showLogin() {
    document.getElementById('login-view').style.display = 'flex';
    document.getElementById('app-view').style.display = 'none';
  },

  showApp() {
    document.getElementById('login-view').style.display = 'none';
    document.getElementById('app-view').style.display = 'flex';
    
    // Update user display in sidebar & header
    document.getElementById('user-display-name').textContent = this.currentUser.name;
    document.getElementById('user-display-role').textContent = this.currentUser.role.toUpperCase();
    document.getElementById('user-avatar-initial').textContent = this.currentUser.name.charAt(0).toUpperCase();

    // Enforce Role Restrictions
    this.applyRolePermissions();

    // Navigate to default view
    this.navigateTo(this.currentView);
  },

  applyRolePermissions() {
    const isAdmin = this.currentUser.role === 'admin';
    document.querySelectorAll('.admin-only').forEach(el => {
      el.style.display = isAdmin ? '' : 'none';
    });
  },

  bindEvents() {
    // Mobile sidebar toggle
    const menuBtn = document.getElementById('menu-toggle-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (menuBtn) {
      menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
      });
    }
    if (overlay) {
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.style.display = 'none';
      });
    }

    // Navigation links
    document.querySelectorAll('[data-view]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const view = link.getAttribute('data-view');
        this.navigateTo(view);
        if (window.innerWidth <= 900) {
          sidebar.classList.remove('open');
          if (overlay) overlay.style.display = 'none';
        }
      });
    });

    // Submenu toggles
    document.querySelectorAll('.nav-group-toggle').forEach(toggle => {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('open');
        const submenu = toggle.nextElementSibling;
        if (submenu) submenu.classList.toggle('open');
      });
    });
  },

  navigateTo(viewId, params = {}) {
    this.currentView = viewId;

    // Update active menu link
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const activeLink = document.querySelector(`[data-view="${viewId}"]`);
    if (activeLink) activeLink.classList.add('active');

    // Hide all view panels
    document.querySelectorAll('.view-panel').forEach(panel => panel.style.display = 'none');

    // Show target view panel
    const targetPanel = document.getElementById(`view-${viewId}`);
    if (targetPanel) {
      targetPanel.style.display = 'block';
    }

    // Update Topbar Title
    const titleMap = {
      dashboard: '📊 Executive Dashboard',
      products: '📦 Product Catalog & Inventory',
      storerooms: '🏪 Storerooms Overview',
      'daily-update': '📝 Daily Stock Update',
      sales: '💰 Sales Management',
      purchases: '📥 Purchase / Stock In',
      transfers: '🔄 Stock Transfer',
      adjustments: '⚠️ Stock Adjustments (Damage / Loss)',
      suppliers: '🤝 Supplier Management',
      'low-stock': '⚠️ Low Stock & Out of Stock Alerts',
      'expiry-alerts': '⏳ Expiry Date Tracker',
      'daily-report': '📄 Daily Inventory Report',
      'monthly-report': '📅 Monthly Performance Report',
      'yearly-report': '📊 Yearly Financial Report',
      'product-report': '📦 Product-Wise Sales & Stock Report',
      'storeroom-report': '🏢 Storeroom Comparison Report',
      history: '📜 Inventory Audit Ledger',
      users: '👥 User & Access Control',
      settings: '⚙️ System Settings & Supabase Setup'
    };
    document.getElementById('page-title').textContent = titleMap[viewId] || 'AgriShop Inventory';

    // Render View Content
    this.renderView(viewId, params);
  },

  renderView(viewId, params) {
    switch (viewId) {
      case 'dashboard':
        this.renderDashboard();
        break;
      case 'products':
        this.renderProducts();
        break;
      case 'storerooms':
        this.renderStorerooms();
        break;
      case 'daily-update':
        this.renderDailyUpdate();
        break;
      case 'sales':
        this.renderSales();
        break;
      case 'purchases':
        this.renderPurchases();
        break;
      case 'transfers':
        this.renderTransfers();
        break;
      case 'adjustments':
        this.renderAdjustments();
        break;
      case 'suppliers':
        this.renderSuppliers();
        break;
      case 'low-stock':
        this.renderLowStock();
        break;
      case 'expiry-alerts':
        this.renderExpiryAlerts();
        break;
      case 'daily-report':
        this.renderDailyReport();
        break;
      case 'monthly-report':
        this.renderMonthlyReport();
        break;
      case 'yearly-report':
        this.renderYearlyReport();
        break;
      case 'product-report':
        this.renderProductReport();
        break;
      case 'storeroom-report':
        this.renderStoreroomReport();
        break;
      case 'history':
        this.renderHistory();
        break;
      case 'users':
        this.renderUsers();
        break;
      case 'settings':
        this.renderSettings();
        break;
    }
  },

  updateNotificationBadges() {
    const products = DB.table('products').all();
    const stocks = DB.table('stock').all();
    
    // Count low stock
    let lowCount = 0;
    products.forEach(p => {
      const totalQty = stocks.filter(s => s.productId === p.id).reduce((sum, s) => sum + s.qty, 0);
      if (totalQty <= p.minStock) lowCount++;
    });

    // Count expiring (within 60 days or expired)
    const today = new Date();
    const sixtyDaysLater = new Date();
    sixtyDaysLater.setDate(today.getDate() + 60);

    let expCount = 0;
    products.forEach(p => {
      if (p.expiryDate) {
        const exp = new Date(p.expiryDate);
        if (exp <= sixtyDaysLater) expCount++;
      }
    });

    const lowBadge = document.getElementById('badge-low-stock');
    if (lowBadge) {
      lowBadge.textContent = lowCount;
      lowBadge.style.display = lowCount > 0 ? 'inline-block' : 'none';
    }
    const expBadge = document.getElementById('badge-expiry');
    if (expBadge) {
      expBadge.textContent = expCount;
      expBadge.style.display = expCount > 0 ? 'inline-block' : 'none';
    }
  },

  // ── DASHBOARD RENDERER ───────────────────────────────────────────────────
  renderDashboard() {
    const products = DB.table('products').all();
    const stocks = DB.table('stock').all();
    const sales = DB.table('sales').all();
    const storerooms = DB.table('storerooms').all();

    // Aggregates
    const totalProducts = products.length;
    let totalStockQty = 0;
    let totalStockValue = 0;

    products.forEach(p => {
      const prodStock = stocks.filter(s => s.productId === p.id).reduce((sum, s) => sum + s.qty, 0);
      totalStockQty += prodStock;
      totalStockValue += (prodStock * p.purchasePrice);
    });

    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonth = todayStr.slice(0, 7);
    const currentYear = todayStr.slice(0, 4);

    const todaySales = sales.filter(s => s.date === todayStr).reduce((sum, s) => sum + s.total, 0);
    const monthSales = sales.filter(s => s.date && s.date.startsWith(currentMonth)).reduce((sum, s) => sum + s.total, 0);
    const yearSales = sales.filter(s => s.date && s.date.startsWith(currentYear)).reduce((sum, s) => sum + s.total, 0);

    // Low stock & Out of stock counts
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach(p => {
      const qty = stocks.filter(s => s.productId === p.id).reduce((sum, s) => sum + s.qty, 0);
      if (qty === 0) outOfStockCount++;
      else if (qty <= p.minStock) lowStockCount++;
    });

    // Populate Stat Cards
    document.getElementById('dash-total-products').textContent = totalProducts;
    document.getElementById('dash-total-qty').textContent = totalStockQty.toLocaleString();
    document.getElementById('dash-total-val').textContent = '₹' + totalStockValue.toLocaleString('en-IN');
    document.getElementById('dash-today-sales').textContent = '₹' + todaySales.toLocaleString('en-IN');
    document.getElementById('dash-month-sales').textContent = '₹' + monthSales.toLocaleString('en-IN');
    document.getElementById('dash-year-sales').textContent = '₹' + yearSales.toLocaleString('en-IN');
    document.getElementById('dash-low-stock').textContent = lowStockCount;
    document.getElementById('dash-out-stock').textContent = outOfStockCount;

    // Storeroom Summaries
    const srGrid = document.getElementById('dash-storeroom-grid');
    if (srGrid) {
      srGrid.innerHTML = storerooms.map((sr, idx) => {
        const srStocks = stocks.filter(s => s.storeroomId === sr.id);
        const srQty = srStocks.reduce((sum, s) => sum + s.qty, 0);
        let srVal = 0;
        srStocks.forEach(s => {
          const p = products.find(prod => prod.id === s.productId);
          if (p) srVal += (s.qty * p.purchasePrice);
        });
        const activeProds = srStocks.filter(s => s.qty > 0).length;

        return `
          <div class="storeroom-card">
            <div class="sr-header">
              <div class="sr-icon sr${idx + 1}">🏪</div>
              <div>
                <div class="sr-name">${sr.name}</div>
                <div class="sr-code">${sr.code} • ${sr.location}</div>
              </div>
            </div>
            <div class="sr-stats">
              <div class="sr-stat">
                <div class="sr-stat-val">${activeProds}</div>
                <div class="sr-stat-lbl">Products</div>
              </div>
              <div class="sr-stat">
                <div class="sr-stat-val">${srQty.toLocaleString()}</div>
                <div class="sr-stat-lbl">Total Quantity</div>
              </div>
              <div class="sr-stat">
                <div class="sr-stat-val">₹${(srVal/1000).toFixed(1)}k</div>
                <div class="sr-stat-lbl">Stock Value</div>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    // Recent Sales Table
    const recentSalesTable = document.getElementById('dash-recent-sales');
    if (recentSalesTable) {
      const recentSales = sales.slice().sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
      recentSalesTable.innerHTML = recentSales.length === 0 ? `<tr><td colspan="5" class="text-center">No recent sales</td></tr>` :
        recentSales.map(s => {
          const sr = storerooms.find(r => r.id === s.storeroomId);
          return `
            <tr>
              <td><strong>${s.invoiceNo}</strong></td>
              <td>${s.date}</td>
              <td><span class="tag">${sr ? sr.name : s.storeroomId}</span></td>
              <td>${s.paymentMethod}</td>
              <td class="text-bold text-green">₹${s.total.toLocaleString('en-IN')}</td>
            </tr>
          `;
        }).join('');
    }

    // Recent Stock History Table
    const recentHistoryTable = document.getElementById('dash-recent-updates');
    if (recentHistoryTable) {
      const history = DB.table('invHistory').all().slice(0, 5);
      recentHistoryTable.innerHTML = history.length === 0 ? `<tr><td colspan="5" class="text-center">No recent updates</td></tr>` :
        history.map(h => {
          const p = products.find(prod => prod.id === h.productId);
          const sr = storerooms.find(r => r.id === h.storeroomId);
          const badgeClass = h.direction === '+' ? 'badge-success' : 'badge-danger';
          return `
            <tr>
              <td>${h.date} ${h.time}</td>
              <td><strong>${p ? p.name : 'Unknown Product'}</strong></td>
              <td>${sr ? sr.name : 'Unknown Room'}</td>
              <td><span class="badge ${badgeClass}">${h.txType} (${h.direction}${h.qty})</span></td>
              <td>${h.prevQty} → <strong>${h.newQty}</strong></td>
            </tr>
          `;
        }).join('');
    }

    // Render Charts
    this.renderDashboardCharts(sales, storerooms, products, stocks);
  },

  renderDashboardCharts(sales, storerooms, products, stocks) {
    // 7-Day Sales Trend Chart
    const ctxSales = document.getElementById('chart-dash-sales');
    if (ctxSales) {
      const dates = [];
      const totals = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        dates.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        const dayTotal = sales.filter(s => s.date === dateStr).reduce((sum, s) => sum + s.total, 0);
        totals.push(dayTotal);
      }

      if (this.charts.dashSales) this.charts.dashSales.destroy();
      this.charts.dashSales = new Chart(ctxSales, {
        type: 'line',
        data: {
          labels: dates,
          datasets: [{
            label: 'Sales (₹)',
            data: totals,
            borderColor: '#2d6a4f',
            backgroundColor: 'rgba(45, 106, 79, 0.1)',
            fill: true,
            tension: 0.3,
            borderWidth: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      });
    }

    // Storeroom Stock Value Doughnut Chart
    const ctxSr = document.getElementById('chart-dash-storerooms');
    if (ctxSr) {
      const labels = storerooms.map(sr => sr.name);
      const values = storerooms.map(sr => {
        const srStocks = stocks.filter(s => s.storeroomId === sr.id);
        return srStocks.reduce((sum, s) => {
          const p = products.find(prod => prod.id === s.productId);
          return sum + (s.qty * (p ? p.purchasePrice : 0));
        }, 0);
      });

      if (this.charts.dashSr) this.charts.dashSr.destroy();
      this.charts.dashSr = new Chart(ctxSr, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: values,
            backgroundColor: ['#2d6a4f', '#2563eb', '#f0a500']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }
  },

  // ── PRODUCTS MANAGEMENT RENDERER ──────────────────────────────────────────
  renderProducts() {
    const products = DB.table('products').all();
    const categories = DB.table('categories').all();
    const suppliers = DB.table('suppliers').all();
    const stocks = DB.table('stock').all();

    const searchInput = document.getElementById('product-search-input');
    const catFilter = document.getElementById('product-cat-filter');
    const statusFilter = document.getElementById('product-status-filter');

    const searchVal = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const catVal = catFilter ? catFilter.value : '';
    const statusVal = statusFilter ? statusFilter.value : '';

    let filtered = products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchVal) || 
                          p.id.toLowerCase().includes(searchVal) || 
                          (p.brand && p.brand.toLowerCase().includes(searchVal));
      const matchCat = !catVal || p.categoryId === catVal;
      const matchStatus = !statusVal || p.status === statusVal;
      return matchSearch && matchCat && matchStatus;
    });

    const tableBody = document.getElementById('products-table-body');
    if (tableBody) {
      tableBody.innerHTML = filtered.length === 0 ? `<tr><td colspan="10" class="empty-state">No products found</td></tr>` :
        filtered.map(p => {
          const cat = categories.find(c => c.id === p.categoryId);
          const sup = suppliers.find(s => s.id === p.supplierId);
          
          const s1 = DB.getStock(p.id, 'sr1');
          const s2 = DB.getStock(p.id, 'sr2');
          const s3 = DB.getStock(p.id, 'sr3');
          const totalStock = s1 + s2 + s3;

          let stockBadge = '<span class="badge badge-success">In Stock</span>';
          if (totalStock === 0) stockBadge = '<span class="badge badge-danger">Out of Stock</span>';
          else if (totalStock <= p.minStock) stockBadge = '<span class="badge badge-warning">Low Stock</span>';

          const isAdmin = this.currentUser.role === 'admin';

          return `
            <tr>
              <td><strong>${p.id}</strong></td>
              <td>
                <div class="fw-700">${p.name}</div>
                <div class="fs-xs text-muted">${p.brand || ''} ${p.packSize ? '• ' + p.packSize : ''}</div>
              </td>
              <td><span class="tag">${cat ? cat.name : 'Uncategorized'}</span></td>
              <td>₹${p.purchasePrice}</td>
              <td class="text-bold text-green">₹${p.sellingPrice}</td>
              <td class="text-center">
                <span class="fs-xs text-muted">SR1: ${s1} | SR2: ${s2} | SR3: ${s3}</span><br/>
                <strong class="fs-sm">${totalStock} ${p.unit}s</strong>
              </td>
              <td>${p.minStock} ${p.unit}s</td>
              <td>${stockBadge}</td>
              <td class="fs-xs">${p.expiryDate ? p.expiryDate : 'N/A'}</td>
              <td class="td-actions">
                ${isAdmin ? `
                  <button class="btn btn-secondary btn-sm" onclick="App.openEditProductModal('${p.id}')">✏️ Edit</button>
                  <button class="btn btn-danger btn-sm" onclick="App.deleteProduct('${p.id}')">🗑️</button>
                ` : `<span class="fs-xs text-muted">Read-Only</span>`}
              </td>
            </tr>
          `;
        }).join('');
    }
  },

  openAddProductModal() {
    const categories = DB.table('categories').all();
    const suppliers = DB.table('suppliers').all();

    const catSelect = document.getElementById('prod-form-category');
    if (catSelect) {
      catSelect.innerHTML = categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    }
    const supSelect = document.getElementById('prod-form-supplier');
    if (supSelect) {
      supSelect.innerHTML = `<option value="">Select Supplier</option>` + suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    }

    document.getElementById('prod-form-id').value = '';
    document.getElementById('product-form').reset();
    document.getElementById('modal-product-title').textContent = '➕ Add New Product';
    
    // Default initial stock per room to 0
    document.getElementById('prod-init-sr1').value = 0;
    document.getElementById('prod-init-sr2').value = 0;
    document.getElementById('prod-init-sr3').value = 0;

    App.openModal('modal-product');
  },

  openEditProductModal(productId) {
    const p = DB.table('products').find(productId);
    if (!p) return;

    this.openAddProductModal();
    document.getElementById('modal-product-title').textContent = '✏️ Edit Product';
    
    document.getElementById('prod-form-id').value = p.id;
    document.getElementById('prod-form-name').value = p.name;
    document.getElementById('prod-form-category').value = p.categoryId;
    document.getElementById('prod-form-brand').value = p.brand || '';
    document.getElementById('prod-form-type').value = p.type || '';
    document.getElementById('prod-form-unit').value = p.unit || 'Bag';
    document.getElementById('prod-form-pack').value = p.packSize || '';
    document.getElementById('prod-form-pprice').value = p.purchasePrice;
    document.getElementById('prod-form-sprice').value = p.sellingPrice;
    document.getElementById('prod-form-minstock').value = p.minStock;
    document.getElementById('prod-form-supplier').value = p.supplierId || '';
    document.getElementById('prod-form-batch').value = p.batchNo || '';
    document.getElementById('prod-form-expiry').value = p.expiryDate || '';
    document.getElementById('prod-form-desc').value = p.description || '';

    // Show current stock values
    document.getElementById('prod-init-sr1').value = DB.getStock(p.id, 'sr1');
    document.getElementById('prod-init-sr2').value = DB.getStock(p.id, 'sr2');
    document.getElementById('prod-init-sr3').value = DB.getStock(p.id, 'sr3');
  },

  saveProduct(e) {
    e.preventDefault();
    const id = document.getElementById('prod-form-id').value;
    const name = document.getElementById('prod-form-name').value.trim();
    const categoryId = document.getElementById('prod-form-category').value;
    const brand = document.getElementById('prod-form-brand').value.trim();
    const type = document.getElementById('prod-form-type').value.trim();
    const unit = document.getElementById('prod-form-unit').value.trim();
    const packSize = document.getElementById('prod-form-pack').value.trim();
    const purchasePrice = parseFloat(document.getElementById('prod-form-pprice').value) || 0;
    const sellingPrice = parseFloat(document.getElementById('prod-form-sprice').value) || 0;
    const minStock = parseInt(document.getElementById('prod-form-minstock').value) || 0;
    const supplierId = document.getElementById('prod-form-supplier').value;
    const batchNo = document.getElementById('prod-form-batch').value.trim();
    const expiryDate = document.getElementById('prod-form-expiry').value;
    const description = document.getElementById('prod-form-desc').value.trim();

    const sr1Qty = parseInt(document.getElementById('prod-init-sr1').value) || 0;
    const sr2Qty = parseInt(document.getElementById('prod-init-sr2').value) || 0;
    const sr3Qty = parseInt(document.getElementById('prod-init-sr3').value) || 0;

    if (!name || !categoryId || purchasePrice < 0 || sellingPrice < 0) {
      App.showToast('Please fill out all required fields properly', 'error');
      return;
    }

    let productObj;
    if (id) {
      // Edit
      productObj = DB.table('products').update(id, {
        name, categoryId, brand, type, unit, packSize, purchasePrice, sellingPrice, minStock, supplierId, batchNo, expiryDate, description
      });
      // Adjust stock differences if changed
      const currSr1 = DB.getStock(id, 'sr1');
      const currSr2 = DB.getStock(id, 'sr2');
      const currSr3 = DB.getStock(id, 'sr3');

      if (sr1Qty !== currSr1) DB.adjustStock(id, 'sr1', sr1Qty - currSr1, 'Stock Adjustment', 'MANUAL_EDIT', App.currentUser.id, 'Manual initial stock edit');
      if (sr2Qty !== currSr2) DB.adjustStock(id, 'sr2', sr2Qty - currSr2, 'Stock Adjustment', 'MANUAL_EDIT', App.currentUser.id, 'Manual initial stock edit');
      if (sr3Qty !== currSr3) DB.adjustStock(id, 'sr3', sr3Qty - currSr3, 'Stock Adjustment', 'MANUAL_EDIT', App.currentUser.id, 'Manual initial stock edit');

      App.showToast('Product updated successfully', 'success');
    } else {
      // Add
      productObj = DB.table('products').insert({
        name, categoryId, brand, type, unit, packSize, purchasePrice, sellingPrice, minStock, supplierId, batchNo, expiryDate, description, status: 'active'
      });
      // Set initial stocks
      if (sr1Qty > 0) DB.adjustStock(productObj.id, 'sr1', sr1Qty, 'Initial Stock', 'NEW_PROD', App.currentUser.id, 'Initial stock entry');
      if (sr2Qty > 0) DB.adjustStock(productObj.id, 'sr2', sr2Qty, 'Initial Stock', 'NEW_PROD', App.currentUser.id, 'Initial stock entry');
      if (sr3Qty > 0) DB.adjustStock(productObj.id, 'sr3', sr3Qty, 'Initial Stock', 'NEW_PROD', App.currentUser.id, 'Initial stock entry');

      App.showToast('Product added successfully', 'success');
    }

    App.closeModal('modal-product');
    App.renderProducts();
    App.updateNotificationBadges();
  },

  deleteProduct(productId) {
    if (this.currentUser.role !== 'admin') {
      App.showToast('Only admins can delete products', 'error');
      return;
    }
    const p = DB.table('products').find(productId);
    if (!p) return;

    if (confirm(`Are you sure you want to delete "${p.name}"? This action cannot be undone.`)) {
      DB.table('products').remove(productId);
      DB.table('stock').removeWhere(s => s.productId === productId);
      App.showToast('Product deleted successfully', 'success');
      App.renderProducts();
      App.updateNotificationBadges();
    }
  },

  // ── STOREROOMS RENDERER ───────────────────────────────────────────────────
  renderStorerooms() {
    const storerooms = DB.table('storerooms').all();
    const products = DB.table('products').all();

    const selectedSrId = document.getElementById('storeroom-select-filter')?.value || 'sr1';

    const srTabs = document.getElementById('storeroom-tabs');
    if (srTabs) {
      srTabs.innerHTML = storerooms.map(sr => `
        <button class="tab-btn ${sr.id === selectedSrId ? 'active' : ''}" onclick="App.selectStoreroom('${sr.id}')">
          🏪 ${sr.name} (${sr.code})
        </button>
      `).join('');
    }

    const currentSr = storerooms.find(s => s.id === selectedSrId) || storerooms[0];
    
    // Render stock table for selected storeroom
    const tableBody = document.getElementById('storeroom-stock-table');
    if (tableBody && currentSr) {
      tableBody.innerHTML = products.map(p => {
        const qty = DB.getStock(p.id, currentSr.id);
        const value = qty * p.purchasePrice;
        let statusBadge = '<span class="badge badge-success">OK</span>';
        if (qty === 0) statusBadge = '<span class="badge badge-danger">Out of Stock</span>';
        else if (qty <= p.minStock) statusBadge = '<span class="badge badge-warning">Low Stock</span>';

        return `
          <tr>
            <td><strong>${p.id}</strong></td>
            <td><strong>${p.name}</strong> <span class="fs-xs text-muted">(${p.brand || ''})</span></td>
            <td>${p.unit}</td>
            <td class="qty-cell fs-md">${qty}</td>
            <td>₹${p.purchasePrice}</td>
            <td class="fw-700 text-green">₹${value.toLocaleString('en-IN')}</td>
            <td>${statusBadge}</td>
          </tr>
        `;
      }).join('');
    }
  },

  selectStoreroom(srId) {
    const select = document.getElementById('storeroom-select-filter');
    if (select) select.value = srId;
    this.renderStorerooms();
  },

  // ── DAILY STOCK UPDATE RENDERER ───────────────────────────────────────────
  renderDailyUpdate() {
    const dateInput = document.getElementById('daily-update-date');
    if (dateInput && !dateInput.value) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }

    const products = DB.table('products').all();
    const storerooms = DB.table('storerooms').all();

    const prodSelect = document.getElementById('daily-update-product');
    const srSelect = document.getElementById('daily-update-storeroom');

    if (prodSelect && prodSelect.options.length <= 1) {
      prodSelect.innerHTML = `<option value="">-- Select Product --</option>` + products.map(p => `<option value="${p.id}">${p.name} (${p.brand || ''})</option>`).join('');
    }
    if (srSelect && srSelect.options.length <= 1) {
      srSelect.innerHTML = storerooms.map(sr => `<option value="${sr.id}">${sr.name}</option>`).join('');
    }

    this.calcDailyStock();
  },

  onDailyProductChange() {
    const productId = document.getElementById('daily-update-product').value;
    const storeroomId = document.getElementById('daily-update-storeroom').value;

    if (productId && storeroomId) {
      const openQty = DB.getStock(productId, storeroomId);
      document.getElementById('daily-update-opening').value = openQty;
    } else {
      document.getElementById('daily-update-opening').value = 0;
    }
    this.calcDailyStock();
  },

  calcDailyStock() {
    const opening = parseFloat(document.getElementById('daily-update-opening').value) || 0;
    const purchased = parseFloat(document.getElementById('daily-update-purchased').value) || 0;
    const transferredIn = parseFloat(document.getElementById('daily-update-tr-in').value) || 0;
    const sold = parseFloat(document.getElementById('daily-update-sold').value) || 0;
    const transferredOut = parseFloat(document.getElementById('daily-update-tr-out').value) || 0;
    const damaged = parseFloat(document.getElementById('daily-update-damaged').value) || 0;

    const closing = opening + purchased + transferredIn - sold - transferredOut - damaged;

    const closingEl = document.getElementById('daily-update-closing');
    if (closingEl) {
      closingEl.textContent = closing;
      if (closing < 0) {
        closingEl.style.color = 'var(--red)';
      } else {
        closingEl.style.color = 'var(--green-dark)';
      }
    }
  },

  saveDailyUpdate(e) {
    e.preventDefault();
    const productId = document.getElementById('daily-update-product').value;
    const storeroomId = document.getElementById('daily-update-storeroom').value;
    const date = document.getElementById('daily-update-date').value;

    const openingInput = parseFloat(document.getElementById('daily-update-opening').value) || 0;
    const purchased = parseFloat(document.getElementById('daily-update-purchased').value) || 0;
    const transferredIn = parseFloat(document.getElementById('daily-update-tr-in').value) || 0;
    const sold = parseFloat(document.getElementById('daily-update-sold').value) || 0;
    const transferredOut = parseFloat(document.getElementById('daily-update-tr-out').value) || 0;
    const damaged = parseFloat(document.getElementById('daily-update-damaged').value) || 0;

    if (!productId || !storeroomId) {
      App.showToast('Please select product and storeroom', 'error');
      return;
    }

    const dbCurrentStock = DB.getStock(productId, storeroomId);
    const closing = openingInput + purchased + transferredIn - sold - transferredOut - damaged;

    if (closing < 0) {
      if (!confirm('Warning: Closing stock will become negative. Do you want to approve this adjustment?')) {
        return;
      }
    }

    const prod = DB.table('products').find(productId);
    const sr = DB.table('storerooms').find(storeroomId);

    if (confirm(`Confirm Daily Stock Update for ${prod.name} in ${sr.name}?\n\nAdmin Opening Stock: ${openingInput}\nPurchased: +${purchased}\nTransferred In: +${transferredIn}\nSold: -${sold}\nTransferred Out: -${transferredOut}\nDamaged/Expired: -${damaged}\n\nFinal Calculated Closing Stock: ${closing}`)) {
      // Reconcile database stock to equal closing
      const netDelta = closing - dbCurrentStock;
      if (netDelta !== 0) {
        DB.adjustStock(productId, storeroomId, netDelta, 'Daily Update', 'DAILY_UPDATE', App.currentUser.id, `Daily update on ${date}. Admin Opening: ${openingInput}, Closing: ${closing}`);
      }
      
      App.showToast(`Daily stock update saved! Closing stock set to ${closing}`, 'success');
      document.getElementById('daily-update-form').reset();
      document.getElementById('daily-update-date').value = date;
      this.onDailyProductChange();
    }
  },


  // ── SALES MANAGEMENT RENDERER ─────────────────────────────────────────────
  renderSales() {
    const sales = DB.table('sales').all();
    const products = DB.table('products').all();
    const storerooms = DB.table('storerooms').all();

    const dateInput = document.getElementById('sale-form-date');
    if (dateInput && !dateInput.value) dateInput.value = new Date().toISOString().split('T')[0];

    const invInput = document.getElementById('sale-form-invoice');
    if (invInput && !invInput.value) invInput.value = 'INV-' + Math.floor(100000 + Math.random() * 900000);

    const prodSelect = document.getElementById('sale-form-product');
    const srSelect = document.getElementById('sale-form-storeroom');

    if (prodSelect && prodSelect.options.length <= 1) {
      prodSelect.innerHTML = `<option value="">-- Select Product --</option>` + products.map(p => `<option value="${p.id}">${p.name} (₹${p.sellingPrice})</option>`).join('');
    }
    if (srSelect && srSelect.options.length <= 1) {
      srSelect.innerHTML = storerooms.map(sr => `<option value="${sr.id}">${sr.name}</option>`).join('');
    }

    // Render sales list
    const salesBody = document.getElementById('sales-history-body');
    if (salesBody) {
      salesBody.innerHTML = sales.length === 0 ? `<tr><td colspan="7" class="empty-state">No sales recorded yet</td></tr>` :
        sales.slice().sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map(s => {
          const sr = storerooms.find(r => r.id === s.storeroomId);
          const items = DB.table('saleItems').where(i => i.saleId === s.id);
          const itemSummary = items.map(i => {
            const p = products.find(prod => prod.id === i.productId);
            return `${p ? p.name : 'Item'} (${i.qty})`;
          }).join(', ');

          return `
            <tr>
              <td><strong>${s.invoiceNo}</strong></td>
              <td>${s.date}</td>
              <td><span class="tag">${sr ? sr.name : s.storeroomId}</span></td>
              <td>${s.customer || 'Cash Customer'}</td>
              <td>${itemSummary}</td>
              <td class="fw-700 text-green">₹${s.total.toLocaleString('en-IN')}</td>
              <td>
                <button class="btn btn-secondary btn-sm" onclick="App.printInvoice('${s.id}')">🖨️ Invoice</button>
              </td>
            </tr>
          `;
        }).join('');
    }
  },

  onSaleProductChange() {
    const pid = document.getElementById('sale-form-product').value;
    const srid = document.getElementById('sale-form-storeroom').value;
    if (pid) {
      const p = DB.table('products').find(pid);
      if (p) {
        document.getElementById('sale-form-price').value = p.sellingPrice;
        if (srid) {
          const currStock = DB.getStock(pid, srid);
          document.getElementById('sale-stock-avail').textContent = `Available Stock: ${currStock} ${p.unit}s`;
        }
      }
    }
    this.calcSaleTotal();
  },

  calcSaleTotal() {
    const qty = parseFloat(document.getElementById('sale-form-qty').value) || 0;
    const price = parseFloat(document.getElementById('sale-form-price').value) || 0;
    document.getElementById('sale-form-total').textContent = '₹' + (qty * price).toLocaleString('en-IN');
  },

  recordSale(e) {
    e.preventDefault();
    const date = document.getElementById('sale-form-date').value;
    const storeroomId = document.getElementById('sale-form-storeroom').value;
    const productId = document.getElementById('sale-form-product').value;
    const qty = parseInt(document.getElementById('sale-form-qty').value) || 0;
    const price = parseFloat(document.getElementById('sale-form-price').value) || 0;
    const customer = document.getElementById('sale-form-customer').value.trim();
    const phone = document.getElementById('sale-form-phone').value.trim();
    const invoiceNo = document.getElementById('sale-form-invoice').value.trim();
    const paymentMethod = document.getElementById('sale-form-paymethod').value;

    if (!storeroomId || !productId || qty <= 0 || price < 0) {
      App.showToast('Please fill out all sale fields correctly', 'error');
      return;
    }

    // Stock check validation
    const currStock = DB.getStock(productId, storeroomId);
    if (qty > currStock) {
      App.showToast(`Cannot sell ${qty}! Only ${currStock} available in selected storeroom.`, 'error');
      return;
    }

    const total = qty * price;

    // Create Sale record
    const sale = DB.table('sales').insert({
      date, storeroomId, invoiceNo, customer, phone, paymentMethod, staffId: App.currentUser.id, total
    });

    // Create Sale Item
    DB.table('saleItems').insert({
      saleId: sale.id, productId, qty, price, subtotal: total
    });

    // Automatically reduce stock
    DB.adjustStock(productId, storeroomId, -qty, 'Sale', invoiceNo, App.currentUser.id, `Sale to ${customer || 'Cash Customer'}`);

    App.showToast(`Sale recorded successfully! Invoice #${invoiceNo}`, 'success');
    document.getElementById('sale-form').reset();
    App.renderSales();
    App.updateNotificationBadges();
  },

  // ── STOCK PURCHASES RENDERER ──────────────────────────────────────────────
  renderPurchases() {
    const purchases = DB.table('purchases').all();
    const suppliers = DB.table('suppliers').all();
    const products = DB.table('products').all();
    const storerooms = DB.table('storerooms').all();

    const dateInput = document.getElementById('pur-form-date');
    if (dateInput && !dateInput.value) dateInput.value = new Date().toISOString().split('T')[0];

    const supSelect = document.getElementById('pur-form-supplier');
    const prodSelect = document.getElementById('pur-form-product');
    const srSelect = document.getElementById('pur-form-storeroom');

    if (supSelect && supSelect.options.length <= 1) {
      supSelect.innerHTML = `<option value="">-- Select Supplier --</option>` + suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    }
    if (prodSelect && prodSelect.options.length <= 1) {
      prodSelect.innerHTML = `<option value="">-- Select Product --</option>` + products.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    }
    if (srSelect && srSelect.options.length <= 1) {
      srSelect.innerHTML = storerooms.map(sr => `<option value="${sr.id}">${sr.name}</option>`).join('');
    }

    const purBody = document.getElementById('purchases-history-body');
    if (purBody) {
      purBody.innerHTML = purchases.length === 0 ? `<tr><td colspan="7" class="empty-state">No purchases recorded</td></tr>` :
        purchases.slice().sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map(pur => {
          const sup = suppliers.find(s => s.id === pur.supplierId);
          const sr = storerooms.find(r => r.id === pur.storeroomId);
          const items = DB.table('purchaseItems').where(i => i.purchaseId === pur.id);
          const itemSummary = items.map(i => {
            const p = products.find(prod => prod.id === i.productId);
            return `${p ? p.name : 'Product'} (${i.qty})`;
          }).join(', ');

          return `
            <tr>
              <td><strong>${pur.invoiceNo}</strong></td>
              <td>${pur.date}</td>
              <td>${sup ? sup.name : 'Unknown Supplier'}</td>
              <td><span class="tag">${sr ? sr.name : pur.storeroomId}</span></td>
              <td>${itemSummary}</td>
              <td class="fw-700 text-green">₹${pur.total.toLocaleString('en-IN')}</td>
              <td><span class="badge badge-success">Received</span></td>
            </tr>
          `;
        }).join('');
    }
  },

  onPurchaseProductChange() {
    const pid = document.getElementById('pur-form-product').value;
    if (pid) {
      const p = DB.table('products').find(pid);
      if (p) {
        document.getElementById('pur-form-price').value = p.purchasePrice;
        if (p.batchNo) document.getElementById('pur-form-batch').value = p.batchNo;
        if (p.expiryDate) document.getElementById('pur-form-expiry').value = p.expiryDate;
      }
    }
    this.calcPurchaseTotal();
  },

  calcPurchaseTotal() {
    const qty = parseFloat(document.getElementById('pur-form-qty').value) || 0;
    const price = parseFloat(document.getElementById('pur-form-price').value) || 0;
    document.getElementById('pur-form-total').textContent = '₹' + (qty * price).toLocaleString('en-IN');
  },

  recordPurchase(e) {
    e.preventDefault();
    const date = document.getElementById('pur-form-date').value;
    const supplierId = document.getElementById('pur-form-supplier').value;
    const invoiceNo = document.getElementById('pur-form-invoice').value.trim();
    const storeroomId = document.getElementById('pur-form-storeroom').value;
    const productId = document.getElementById('pur-form-product').value;
    const qty = parseInt(document.getElementById('pur-form-qty').value) || 0;
    const price = parseFloat(document.getElementById('pur-form-price').value) || 0;
    const batchNo = document.getElementById('pur-form-batch').value.trim();
    const expiryDate = document.getElementById('pur-form-expiry').value;

    if (!supplierId || !storeroomId || !productId || qty <= 0) {
      App.showToast('Please complete purchase information', 'error');
      return;
    }

    const total = qty * price;

    const pur = DB.table('purchases').insert({
      date, supplierId, invoiceNo, storeroomId, total
    });

    DB.table('purchaseItems').insert({
      purchaseId: pur.id, productId, qty, price, batchNo, expiryDate, subtotal: total
    });

    // Update batch/expiry on product if provided
    if (batchNo || expiryDate) {
      DB.table('products').update(productId, { batchNo, expiryDate });
    }

    // Automatically increase stock
    DB.adjustStock(productId, storeroomId, qty, 'Purchase', invoiceNo, App.currentUser.id, `Stock in from purchase #${invoiceNo}`);

    App.showToast(`Purchase recorded! Stock increased by +${qty}`, 'success');
    document.getElementById('purchase-form').reset();
    App.renderPurchases();
    App.updateNotificationBadges();
  },

  // ── STOCK TRANSFERS RENDERER ──────────────────────────────────────────────
  renderTransfers() {
    const transfers = DB.table('transfers').all();
    const products = DB.table('products').all();
    const storerooms = DB.table('storerooms').all();

    const dateInput = document.getElementById('tr-form-date');
    if (dateInput && !dateInput.value) dateInput.value = new Date().toISOString().split('T')[0];

    const prodSelect = document.getElementById('tr-form-product');
    const fromSr = document.getElementById('tr-form-from');
    const toSr = document.getElementById('tr-form-to');

    if (prodSelect && prodSelect.options.length <= 1) {
      prodSelect.innerHTML = `<option value="">-- Select Product --</option>` + products.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    }
    if (fromSr && fromSr.options.length <= 1) {
      fromSr.innerHTML = storerooms.map(sr => `<option value="${sr.id}">${sr.name}</option>`).join('');
    }
    if (toSr && toSr.options.length <= 1) {
      toSr.innerHTML = storerooms.map(sr => `<option value="${sr.id}">${sr.name}</option>`).join('');
      if (toSr.options.length > 1) toSr.selectedIndex = 1;
    }

    const trBody = document.getElementById('transfers-history-body');
    if (trBody) {
      trBody.innerHTML = transfers.length === 0 ? `<tr><td colspan="7" class="empty-state">No stock transfers recorded</td></tr>` :
        transfers.slice().sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map(tr => {
          const p = products.find(prod => prod.id === tr.productId);
          const fromRoom = storerooms.find(r => r.id === tr.fromStoreroomId);
          const toRoom = storerooms.find(r => r.id === tr.toStoreroomId);

          return `
            <tr>
              <td>${tr.date}</td>
              <td><strong>${p ? p.name : 'Unknown Product'}</strong></td>
              <td><span class="tag text-red">${fromRoom ? fromRoom.name : tr.fromStoreroomId}</span></td>
              <td>➡️</td>
              <td><span class="tag text-green">${toRoom ? toRoom.name : tr.toStoreroomId}</span></td>
              <td class="fw-700">${tr.qty} ${p ? p.unit : ''}s</td>
              <td><span class="badge badge-info">Completed</span></td>
            </tr>
          `;
        }).join('');
    }
  },

  onTransferFromChange() {
    const pid = document.getElementById('tr-form-product').value;
    const fromSr = document.getElementById('tr-form-from').value;
    if (pid && fromSr) {
      const avail = DB.getStock(pid, fromSr);
      document.getElementById('tr-stock-avail').textContent = `Available in source storeroom: ${avail}`;
    }
  },

  recordTransfer(e) {
    e.preventDefault();
    const date = document.getElementById('tr-form-date').value;
    const fromStoreroomId = document.getElementById('tr-form-from').value;
    const toStoreroomId = document.getElementById('tr-form-to').value;
    const productId = document.getElementById('tr-form-product').value;
    const qty = parseInt(document.getElementById('tr-form-qty').value) || 0;
    const notes = document.getElementById('tr-form-notes').value.trim();

    if (!fromStoreroomId || !toStoreroomId || !productId || qty <= 0) {
      App.showToast('Please fill out all transfer fields', 'error');
      return;
    }

    if (fromStoreroomId === toStoreroomId) {
      App.showToast('Source and Destination storerooms must be different', 'error');
      return;
    }

    // Check available stock in source room
    const avail = DB.getStock(productId, fromStoreroomId);
    if (qty > avail) {
      App.showToast(`Transfer failed: Only ${avail} units available in source room!`, 'error');
      return;
    }

    // Execute transfer
    DB.table('transfers').insert({
      date, fromStoreroomId, toStoreroomId, productId, qty, staffId: App.currentUser.id, notes
    });

    const ref = 'TR-' + Date.now().toString().slice(-6);

    // Source decreases
    DB.adjustStock(productId, fromStoreroomId, -qty, 'Transfer Out', ref, App.currentUser.id, `Transferred to ${toStoreroomId}`);
    // Destination increases
    DB.adjustStock(productId, toStoreroomId, qty, 'Transfer In', ref, App.currentUser.id, `Transferred from ${fromStoreroomId}`);

    App.showToast(`Transferred ${qty} units successfully!`, 'success');
    document.getElementById('transfer-form').reset();
    App.renderTransfers();
  },

  // ── STOCK ADJUSTMENTS RENDERER ─────────────────────────────────────────────
  renderAdjustments() {
    const adjustments = DB.table('adjustments').all();
    const products = DB.table('products').all();
    const storerooms = DB.table('storerooms').all();

    const dateInput = document.getElementById('adj-form-date');
    if (dateInput && !dateInput.value) dateInput.value = new Date().toISOString().split('T')[0];

    const prodSelect = document.getElementById('adj-form-product');
    const srSelect = document.getElementById('adj-form-storeroom');

    if (prodSelect && prodSelect.options.length <= 1) {
      prodSelect.innerHTML = `<option value="">-- Select Product --</option>` + products.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    }
    if (srSelect && srSelect.options.length <= 1) {
      srSelect.innerHTML = storerooms.map(sr => `<option value="${sr.id}">${sr.name}</option>`).join('');
    }

    const adjBody = document.getElementById('adjustments-history-body');
    if (adjBody) {
      adjBody.innerHTML = adjustments.length === 0 ? `<tr><td colspan="6" class="empty-state">No stock adjustments recorded</td></tr>` :
        adjustments.slice().sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map(adj => {
          const p = products.find(prod => prod.id === adj.productId);
          const sr = storerooms.find(r => r.id === adj.storeroomId);

          return `
            <tr>
              <td>${adj.date}</td>
              <td><strong>${p ? p.name : 'Product'}</strong></td>
              <td><span class="tag">${sr ? sr.name : adj.storeroomId}</span></td>
              <td><span class="badge badge-danger">${adj.reason}</span></td>
              <td class="fw-700 text-red">${adj.qty}</td>
              <td class="fs-xs">${adj.notes || '-'}</td>
            </tr>
          `;
        }).join('');
    }
  },

  recordAdjustment(e) {
    e.preventDefault();
    const date = document.getElementById('adj-form-date').value;
    const storeroomId = document.getElementById('adj-form-storeroom').value;
    const productId = document.getElementById('adj-form-product').value;
    const reason = document.getElementById('adj-form-reason').value;
    const qty = parseInt(document.getElementById('adj-form-qty').value) || 0;
    const notes = document.getElementById('adj-form-notes').value.trim();

    if (!storeroomId || !productId || qty === 0 || !notes) {
      App.showToast('Please fill out all fields including reason notes', 'error');
      return;
    }

    if (this.currentUser.role !== 'admin' && Math.abs(qty) > 5) {
      if (!confirm('Large adjustment requires admin verification. Proceed?')) return;
    }

    DB.table('adjustments').insert({
      date, storeroomId, productId, reason, qty: -Math.abs(qty), staffId: App.currentUser.id, notes
    });

    DB.adjustStock(productId, storeroomId, -Math.abs(qty), reason, 'ADJ-' + Date.now().toString().slice(-6), App.currentUser.id, notes);

    App.showToast('Stock adjustment recorded and logged to history', 'success');
    document.getElementById('adjustment-form').reset();
    App.renderAdjustments();
    App.updateNotificationBadges();
  },

  // ── SUPPLIERS MANAGEMENT RENDERER ──────────────────────────────────────────
  renderSuppliers() {
    const suppliers = DB.table('suppliers').all();
    const supBody = document.getElementById('suppliers-table-body');
    if (supBody) {
      supBody.innerHTML = suppliers.length === 0 ? `<tr><td colspan="5" class="empty-state">No suppliers found</td></tr>` :
        suppliers.map(s => `
          <tr>
            <td><strong>${s.name}</strong></td>
            <td>${s.phone || '-'}</td>
            <td>${s.email || '-'}</td>
            <td>${s.address || '-'}</td>
            <td>
              <button class="btn btn-secondary btn-sm" onclick="App.deleteSupplier('${s.id}')">🗑️ Delete</button>
            </td>
          </tr>
        `).join('');
    }
  },

  saveSupplier(e) {
    e.preventDefault();
    const name = document.getElementById('sup-form-name').value.trim();
    const phone = document.getElementById('sup-form-phone').value.trim();
    const email = document.getElementById('sup-form-email').value.trim();
    const address = document.getElementById('sup-form-address').value.trim();

    if (!name) {
      App.showToast('Supplier name is required', 'error');
      return;
    }

    DB.table('suppliers').insert({ name, phone, email, address, status: 'active' });
    App.showToast('Supplier added successfully', 'success');
    App.closeModal('modal-supplier');
    App.renderSuppliers();
  },

  deleteSupplier(supId) {
    if (confirm('Delete supplier?')) {
      DB.table('suppliers').remove(supId);
      App.showToast('Supplier removed', 'info');
      App.renderSuppliers();
    }
  },

  // ── LOW STOCK & EXPIRY RENDERERS ──────────────────────────────────────────
  renderLowStock() {
    const products = DB.table('products').all();
    const storerooms = DB.table('storerooms').all();
    const stocks = DB.table('stock').all();

    const alerts = [];
    products.forEach(p => {
      storerooms.forEach(sr => {
        const qty = DB.getStock(p.id, sr.id);
        if (qty <= p.minStock) {
          alerts.push({
            product: p,
            storeroom: sr,
            qty,
            isOutOfStock: qty === 0
          });
        }
      });
    });

    const body = document.getElementById('low-stock-body');
    if (body) {
      body.innerHTML = alerts.length === 0 ? `<tr><td colspan="6" class="empty-state">✅ All stock levels are healthy!</td></tr>` :
        alerts.map(a => `
          <tr class="${a.isOutOfStock ? 'table-danger' : ''}">
            <td><strong>${a.product.name}</strong> (${a.product.brand || ''})</td>
            <td><span class="tag">${a.storeroom.name}</span></td>
            <td><strong class="${a.isOutOfStock ? 'text-red' : 'text-orange'}">${a.qty} ${a.product.unit}s</strong></td>
            <td>${a.product.minStock} ${a.product.unit}s</td>
            <td>
              ${a.isOutOfStock ? '<span class="badge badge-danger">⚠️ OUT OF STOCK</span>' : '<span class="badge badge-warning">⚠️ LOW STOCK</span>'}
            </td>
            <td>
              <button class="btn btn-primary btn-sm" onclick="App.navigateTo('purchases')">📥 Restock</button>
            </td>
          </tr>
        `).join('');
    }
  },

  renderExpiryAlerts() {
    const products = DB.table('products').all();
    const storerooms = DB.table('storerooms').all();
    const today = new Date();

    const items = [];
    products.forEach(p => {
      if (p.expiryDate) {
        const exp = new Date(p.expiryDate);
        const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
        if (diffDays <= 60) {
          storerooms.forEach(sr => {
            const qty = DB.getStock(p.id, sr.id);
            if (qty > 0) {
              items.push({
                product: p,
                storeroom: sr,
                qty,
                diffDays,
                isExpired: diffDays <= 0,
                is30Days: diffDays > 0 && diffDays <= 30,
                is60Days: diffDays > 30 && diffDays <= 60
              });
            }
          });
        }
      }
    });

    const body = document.getElementById('expiry-alerts-body');
    if (body) {
      body.innerHTML = items.length === 0 ? `<tr><td colspan="6" class="empty-state">✅ No products expiring within 60 days!</td></tr>` :
        items.map(item => {
          let badge = `<span class="badge badge-warning">Expiring in ${item.diffDays} days</span>`;
          if (item.isExpired) badge = `<span class="badge badge-danger">EXPIRED (${Math.abs(item.diffDays)} days ago)</span>`;
          else if (item.is30Days) badge = `<span class="badge badge-danger">Expiring within 30 days!</span>`;

          return `
            <tr>
              <td><strong>${item.product.name}</strong></td>
              <td>${item.product.batchNo || 'N/A'}</td>
              <td>${item.product.expiryDate}</td>
              <td><span class="tag">${item.storeroom.name}</span></td>
              <td>${item.qty} ${item.product.unit}s</td>
              <td>${badge}</td>
            </tr>
          `;
        }).join('');
    }
  },

  // ── REPORTS RENDERERS ─────────────────────────────────────────────────────
  renderDailyReport() {
    const dateInput = document.getElementById('report-daily-date');
    if (dateInput && !dateInput.value) dateInput.value = new Date().toISOString().split('T')[0];
    const date = dateInput.value;

    const sales = DB.table('sales').where(s => s.date === date);
    const purchases = DB.table('purchases').where(p => p.date === date);
    const transfers = DB.table('transfers').where(t => t.date === date);
    const adjustments = DB.table('adjustments').where(a => a.date === date);

    const totalSalesAmt = sales.reduce((sum, s) => sum + s.total, 0);
    const totalPurchasesAmt = purchases.reduce((sum, p) => sum + p.total, 0);

    document.getElementById('dr-sales-total').textContent = '₹' + totalSalesAmt.toLocaleString('en-IN');
    document.getElementById('dr-purchases-total').textContent = '₹' + totalPurchasesAmt.toLocaleString('en-IN');
    document.getElementById('dr-sales-count').textContent = sales.length;
    document.getElementById('dr-transfers-count').textContent = transfers.length;

    // Daily Sales items list
    const body = document.getElementById('daily-report-body');
    if (body) {
      body.innerHTML = sales.length === 0 ? `<tr><td colspan="6" class="empty-state">No sales transactions for selected date</td></tr>` :
        sales.map(s => `
          <tr>
            <td>${s.invoiceNo}</td>
            <td>${s.customer || 'Cash Customer'}</td>
            <td><span class="tag">${s.storeroomId}</span></td>
            <td>${s.paymentMethod}</td>
            <td class="fw-700 text-green">₹${s.total.toLocaleString('en-IN')}</td>
          </tr>
        `).join('');
    }
  },

  renderMonthlyReport() {
    const monthSelect = document.getElementById('report-monthly-month');
    const yearSelect = document.getElementById('report-monthly-year');
    if (monthSelect && !monthSelect.value) monthSelect.value = String(new Date().getMonth() + 1).padStart(2, '0');
    if (yearSelect && !yearSelect.value) yearSelect.value = String(new Date().getFullYear());

    const monthStr = `${yearSelect.value}-${monthSelect.value}`;

    const sales = DB.table('sales').where(s => s.date && s.date.startsWith(monthStr));
    const purchases = DB.table('purchases').where(p => p.date && p.date.startsWith(monthStr));
    const transfers = DB.table('transfers').where(t => t.date && t.date.startsWith(monthStr));

    const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
    const totalPurchases = purchases.reduce((sum, p) => sum + p.total, 0);

    document.getElementById('mr-total-sales').textContent = '₹' + totalSales.toLocaleString('en-IN');
    document.getElementById('mr-total-purchases').textContent = '₹' + totalPurchases.toLocaleString('en-IN');
    document.getElementById('mr-total-transfers').textContent = transfers.length;

    // Render Monthly Sales Chart
    const ctx = document.getElementById('chart-monthly-sales');
    if (ctx) {
      const daysInMonth = new Date(yearSelect.value, monthSelect.value, 0).getDate();
      const labels = [];
      const data = [];

      for (let d = 1; d <= daysInMonth; d++) {
        const dayStr = `${monthStr}-${String(d).padStart(2, '0')}`;
        labels.push(`Day ${d}`);
        const daySales = sales.filter(s => s.date === dayStr).reduce((sum, s) => sum + s.total, 0);
        data.push(daySales);
      }

      if (this.charts.monthlySales) this.charts.monthlySales.destroy();
      this.charts.monthlySales = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Daily Sales (₹)',
            data,
            backgroundColor: '#40916c'
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }
  },

  renderYearlyReport() {
    const yearSelect = document.getElementById('report-yearly-year');
    if (yearSelect && !yearSelect.value) yearSelect.value = String(new Date().getFullYear());
    const yearStr = yearSelect.value;

    const sales = DB.table('sales').where(s => s.date && s.date.startsWith(yearStr));
    const purchases = DB.table('purchases').where(p => p.date && p.date.startsWith(yearStr));

    const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
    const totalPurchases = purchases.reduce((sum, p) => sum + p.total, 0);

    document.getElementById('yr-total-sales').textContent = '₹' + totalSales.toLocaleString('en-IN');
    document.getElementById('yr-total-purchases').textContent = '₹' + totalPurchases.toLocaleString('en-IN');

    // 12-Month Bar Chart
    const ctx = document.getElementById('chart-yearly-sales');
    if (ctx) {
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const salesData = [];
      const purData = [];

      months.forEach((m, idx) => {
        const mStr = `${yearStr}-${String(idx + 1).padStart(2, '0')}`;
        const mSales = sales.filter(s => s.date && s.date.startsWith(mStr)).reduce((sum, s) => sum + s.total, 0);
        const mPur = purchases.filter(p => p.date && p.date.startsWith(mStr)).reduce((sum, p) => sum + p.total, 0);
        salesData.push(mSales);
        purData.push(mPur);
      });

      if (this.charts.yearlySales) this.charts.yearlySales.destroy();
      this.charts.yearlySales = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: months,
          datasets: [
            { label: 'Sales (₹)', data: salesData, backgroundColor: '#2d6a4f' },
            { label: 'Purchases (₹)', data: purData, backgroundColor: '#ea580c' }
          ]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }
  },

  renderProductReport() {
    const products = DB.table('products').all();
    const select = document.getElementById('report-product-select');
    if (select && select.options.length <= 1) {
      select.innerHTML = products.map(p => `<option value="${p.id}">${p.name} (${p.brand || ''})</option>`).join('');
    }

    const selectedPid = select ? select.value || (products[0] ? products[0].id : '') : '';
    if (!selectedPid) return;

    const p = products.find(prod => prod.id === selectedPid);
    const history = DB.table('invHistory').where(h => h.productId === selectedPid);

    let purchasedQty = 0;
    let soldQty = 0;
    let damagedQty = 0;
    let transferQty = 0;

    history.forEach(h => {
      if (h.txType === 'Purchase') purchasedQty += h.qty;
      else if (h.txType === 'Sale') soldQty += h.qty;
      else if (h.txType === 'Damaged' || h.txType === 'Expired') damagedQty += h.qty;
      else if (h.txType === 'Transfer In' || h.txType === 'Transfer Out') transferQty += h.qty;
    });

    const currentQty = DB.getStock(selectedPid, 'sr1') + DB.getStock(selectedPid, 'sr2') + DB.getStock(selectedPid, 'sr3');
    const totalSalesAmount = soldQty * p.sellingPrice;

    document.getElementById('pr-prod-name').textContent = p.name;
    document.getElementById('pr-purchased').textContent = `${purchasedQty} ${p.unit}s`;
    document.getElementById('pr-sold').textContent = `${soldQty} ${p.unit}s`;
    document.getElementById('pr-damaged').textContent = `${damagedQty} ${p.unit}s`;
    document.getElementById('pr-current').textContent = `${currentQty} ${p.unit}s`;
    document.getElementById('pr-sales-val').textContent = '₹' + totalSalesAmount.toLocaleString('en-IN');
  },

  renderStoreroomReport() {
    const storerooms = DB.table('storerooms').all();
    const products = DB.table('products').all();
    const stocks = DB.table('stock').all();
    const sales = DB.table('sales').all();

    const body = document.getElementById('storeroom-report-body');
    if (body) {
      body.innerHTML = storerooms.map(sr => {
        const srStocks = stocks.filter(s => s.storeroomId === sr.id);
        const totalQty = srStocks.reduce((sum, s) => sum + s.qty, 0);
        const activeProducts = srStocks.filter(s => s.qty > 0).length;
        const srSales = sales.filter(s => s.storeroomId === sr.id).reduce((sum, s) => sum + s.total, 0);

        let totalValue = 0;
        srStocks.forEach(s => {
          const p = products.find(prod => prod.id === s.productId);
          if (p) totalValue += (s.qty * p.purchasePrice);
        });

        return `
          <tr>
            <td><strong>🏪 ${sr.name} (${sr.code})</strong></td>
            <td>${activeProducts} / ${products.length}</td>
            <td class="fw-700">${totalQty.toLocaleString()}</td>
            <td>₹${totalValue.toLocaleString('en-IN')}</td>
            <td class="fw-700 text-green">₹${srSales.toLocaleString('en-IN')}</td>
          </tr>
        `;
      }).join('');
    }
  },

  // ── AUDIT HISTORY RENDERER ────────────────────────────────────────────────
  renderHistory() {
    const history = DB.table('invHistory').all();
    const products = DB.table('products').all();
    const storerooms = DB.table('storerooms').all();
    const users = DB.table('users').all();

    const body = document.getElementById('history-table-body');
    if (body) {
      body.innerHTML = history.length === 0 ? `<tr><td colspan="8" class="empty-state">No inventory transaction history found</td></tr>` :
        history.map(h => {
          const p = products.find(prod => prod.id === h.productId);
          const sr = storerooms.find(r => r.id === h.storeroomId);
          const u = users.find(usr => usr.id === h.userId);
          const badgeClass = h.direction === '+' ? 'badge-success' : 'badge-danger';

          return `
            <tr>
              <td><span class="fs-xs">${h.date} ${h.time}</span></td>
              <td><strong>${p ? p.name : 'Unknown Product'}</strong></td>
              <td><span class="tag">${sr ? sr.name : h.storeroomId}</span></td>
              <td><span class="badge ${badgeClass}">${h.txType}</span></td>
              <td>${h.direction}${h.qty}</td>
              <td>${h.prevQty} ➡️ <strong>${h.newQty}</strong></td>
              <td><span class="fs-xs">${u ? u.name : 'System'}</span></td>
              <td class="fs-xs text-muted">${h.ref || '-'} ${h.notes ? '• ' + h.notes : ''}</td>
            </tr>
          `;
        }).join('');
    }
  },

  // ── USER MANAGEMENT RENDERER ──────────────────────────────────────────────
  renderUsers() {
    const users = DB.table('users').all();
    const body = document.getElementById('users-table-body');
    if (body) {
      body.innerHTML = users.map(u => `
        <tr>
          <td><strong>${u.name}</strong></td>
          <td>${u.email}</td>
          <td><span class="badge ${u.role === 'admin' ? 'badge-gold' : 'badge-info'}">${u.role.toUpperCase()}</span></td>
          <td><span class="badge badge-success">${u.status}</span></td>
          <td>
            ${this.currentUser.role === 'admin' && u.id !== this.currentUser.id ? `
              <button class="btn btn-secondary btn-sm" onclick="App.deleteUser('${u.id}')">🗑️ Delete</button>
            ` : '<span class="fs-xs text-muted">Current User</span>'}
          </td>
        </tr>
      `).join('');
    }
  },

  saveUser(e) {
    e.preventDefault();
    const name = document.getElementById('user-form-name').value.trim();
    const email = document.getElementById('user-form-email').value.trim();
    const password = document.getElementById('user-form-password').value.trim();
    const role = document.getElementById('user-form-role').value;

    if (!name || !email || !password) {
      App.showToast('Please fill out all user fields', 'error');
      return;
    }

    DB.table('users').insert({ name, email, password, role, status: 'active' });
    App.showToast('New user account created successfully', 'success');
    App.closeModal('modal-user');
    App.renderUsers();
  },

  deleteUser(userId) {
    if (confirm('Delete user account?')) {
      DB.table('users').remove(userId);
      App.showToast('User removed', 'info');
      App.renderUsers();
    }
  },

  // ── SETTINGS RENDERER ─────────────────────────────────────────────────────
  renderSettings() {
    const url = localStorage.getItem('supabase_url') || '';
    const key = localStorage.getItem('supabase_key') || '';
    document.getElementById('setting-supabase-url').value = url;
    document.getElementById('setting-supabase-key').value = key;
  },

  saveSettings(e) {
    e.preventDefault();
    const url = document.getElementById('setting-supabase-url').value.trim();
    const key = document.getElementById('setting-supabase-key').value.trim();

    localStorage.setItem('supabase_url', url);
    localStorage.setItem('supabase_key', key);

    App.showToast('Supabase settings saved locally', 'success');
  },

  // ── EXPORT & PRINT HELPERS ────────────────────────────────────────────────
  exportToCSV(filename, tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;

    let csv = [];
    const rows = table.querySelectorAll('tr');
    for (let i = 0; i < rows.length; i++) {
      const row = [], cols = rows[i].querySelectorAll('td, th');
      for (let j = 0; j < cols.length - 1; j++) {
        let text = cols[j].innerText.replace(/"/g, '""').replace(/\n/g, ' ');
        row.push('"' + text + '"');
      }
      csv.push(row.join(','));
    }

    const csvFile = new Blob([csv.join('\n')], { type: 'text/csv' });
    const downloadLink = document.createElement('a');
    downloadLink.download = filename + '.csv';
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    App.showToast(`Exported ${filename}.csv successfully!`, 'success');
  },

  printReport() {
    this.printSpecificReport(this.currentView);
  },

  printSpecificReport(viewId) {
    // Remove print-active class from all panels
    document.querySelectorAll('.view-panel').forEach(panel => panel.classList.remove('print-active'));

    const panel = document.getElementById(`view-${viewId}`);
    if (panel) {
      panel.classList.add('print-active');
    }

    // Insert or update printable header info
    let printHeader = panel.querySelector('.print-only-header');
    if (!printHeader) {
      printHeader = document.createElement('div');
      printHeader.className = 'print-only-header';
      panel.insertBefore(printHeader, panel.firstChild);
    }

    const titles = {
      'daily-report': 'DAILY SALES & INVENTORY REPORT',
      'monthly-report': 'MONTHLY SALES & INVENTORY STATEMENT',
      'yearly-report': 'YEARLY FINANCIAL SALES & INVENTORY REPORT',
      'product-report': 'PRODUCT-WISE SALES & STOCK STATEMENT',
      'storeroom-report': 'STOREROOM COMPARISON REPORT',
      'history': 'INVENTORY AUDIT LEDGER STATEMENT'
    };

    const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    printHeader.innerHTML = `
      <h1>🌱 AGRI SHOP AGRICULTURE STORE</h1>
      <p><b>Official Report:</b> ${titles[viewId] || 'INVENTORY & SALES REPORT'} | <b>Generated On:</b> ${dateStr}</p>
      <p><b>Generated By:</b> ${this.currentUser.name} (${this.currentUser.role.toUpperCase()}) | <b>Storerooms:</b> Main Store (SR1), Store Room 2 (SR2), Store Room 3 (SR3)</p>
    `;

    setTimeout(() => {
      window.print();
    }, 150);
  },


  printInvoice(saleId) {
    const sale = DB.table('sales').find(saleId);
    if (!sale) return;
    const items = DB.table('saleItems').where(i => i.saleId === saleId);
    const products = DB.table('products').all();
    const sr = DB.table('storerooms').find(sale.storeroomId);

    const win = window.open('', '_blank', 'width=600,height=600');
    win.document.write(`
      <html>
        <head>
          <title>Invoice #${sale.invoiceNo}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #2d6a4f; padding-bottom: 10px; margin-bottom: 20px; }
            .header h1 { color: #2d6a4f; margin: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #f4f4f4; }
            .total { text-align: right; margin-top: 20px; font-size: 1.2rem; font-weight: bold; color: #2d6a4f; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🌱 Agriculture Shop</h1>
            <p>Invoice #: ${sale.invoiceNo} | Date: ${sale.date}</p>
            <p>Storeroom: ${sr ? sr.name : ''}</p>
          </div>
          <p><strong>Customer:</strong> ${sale.customer || 'Cash Customer'}</p>
          <p><strong>Payment Method:</strong> ${sale.paymentMethod}</p>
          <table>
            <thead>
              <tr><th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr>
            </thead>
            <tbody>
              ${items.map(i => {
                const p = products.find(prod => prod.id === i.productId);
                return `<tr><td>${p ? p.name : ''}</td><td>${i.qty}</td><td>₹${i.price}</td><td>₹${i.subtotal}</td></tr>`;
              }).join('')}
            </tbody>
          </table>
          <div class="total">Total Paid: ₹${sale.total.toLocaleString('en-IN')}</div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    win.document.close();
  },

  // ── MODAL & TOAST HELPERS ─────────────────────────────────────────────────
  openModal(modalId) {
    const m = document.getElementById(modalId);
    if (m) m.classList.add('active');
  },

  closeModal(modalId) {
    const m = document.getElementById(modalId);
    if (m) m.classList.remove('active');
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || 'ℹ️'}</div>
      <div class="toast-body">
        <div class="toast-title">${type.toUpperCase()}</div>
        <div class="toast-msg">${message}</div>
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 4000);
  }
};

// Initialize App on DOM ready
document.addEventListener('DOMContentLoaded', () => App.init());
