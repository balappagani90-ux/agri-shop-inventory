/**
 * AgriShop Inventory - Database Layer (localStorage)
 * Replace DB.supabase calls with actual Supabase SDK when ready.
 */

const DB = (() => {
  // ── helpers ──────────────────────────────────────────────────────────────
  const read  = (k) => JSON.parse(localStorage.getItem(k) || '[]');
  const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const uid   = () => 'id_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  const now   = () => new Date().toISOString();

  // ── initialise sample data ────────────────────────────────────────────────
  function seed() {
    if (localStorage.getItem('_seeded')) return;

    // Users
    write('users', [
      { id:'u1', name:'Admin User',  email:'admin@agrishop.com',  password:'admin123',  role:'admin',  status:'active', createdAt: now() },
      { id:'u2', name:'Staff User',  email:'staff@agrishop.com',  password:'staff123',  role:'staff',  status:'active', createdAt: now() },
    ]);

    // Storerooms
    write('storerooms', [
      { id:'sr1', name:'Main Store',    code:'SR1', location:'Main Building', status:'active' },
      { id:'sr2', name:'Store Room 2',  code:'SR2', location:'Block B',       status:'active' },
      { id:'sr3', name:'Store Room 3',  code:'SR3', location:'Block C',       status:'active' },
    ]);

    // Categories
    write('categories', [
      { id:'cat1', name:'Fertilizers' },
      { id:'cat2', name:'Pesticides'  },
      { id:'cat3', name:'Seeds'       },
      { id:'cat4', name:'Other Agriculture Products' },
    ]);

    // Suppliers
    write('suppliers', [
      { id:'sup1', name:'AgroWorld Pvt Ltd',    phone:'9876543210', email:'info@agroworld.com',   address:'Industrial Area, City', status:'active' },
      { id:'sup2', name:'FarmSupply Co.',       phone:'9123456789', email:'sales@farmsupply.com', address:'Market Road, Town',     status:'active' },
      { id:'sup3', name:'GreenLeaf Seeds',      phone:'9988776655', email:'gl@greenleaf.com',     address:'Seed Street, Village',  status:'active' },
    ]);

    // Products
    const products = [
      { id:'p1',  name:'Urea',            categoryId:'cat1', brand:'IFFCO',       type:'Granular',   unit:'Bag',    packSize:'50 kg',  purchasePrice:900,  sellingPrice:1050, minStock:20, supplierId:'sup1', description:'Nitrogen fertilizer', status:'active', batchNo:'', expiryDate:'' },
      { id:'p2',  name:'DAP',             categoryId:'cat1', brand:'IFFCO',       type:'Granular',   unit:'Bag',    packSize:'50 kg',  purchasePrice:1400, sellingPrice:1600, minStock:15, supplierId:'sup1', description:'Di-ammonium phosphate', status:'active', batchNo:'', expiryDate:'' },
      { id:'p3',  name:'10:26:26 NPK',    categoryId:'cat1', brand:'Coromandel',  type:'Granular',   unit:'Bag',    packSize:'50 kg',  purchasePrice:1300, sellingPrice:1500, minStock:10, supplierId:'sup1', description:'NPK complex fertilizer', status:'active', batchNo:'', expiryDate:'' },
      { id:'p4',  name:'Potash',          categoryId:'cat1', brand:'SQM',         type:'Granular',   unit:'Bag',    packSize:'50 kg',  purchasePrice:1100, sellingPrice:1300, minStock:10, supplierId:'sup2', description:'Muriate of potash', status:'active', batchNo:'', expiryDate:'' },
      { id:'p5',  name:'Zinc Sulphate',   categoryId:'cat1', brand:'Various',     type:'Powder',     unit:'Kg',     packSize:'1 kg',   purchasePrice:80,   sellingPrice:100,  minStock:50, supplierId:'sup2', description:'Micronutrient zinc supplement', status:'active', batchNo:'', expiryDate:'' },
      { id:'p6',  name:'Chlorpyrifos',    categoryId:'cat2', brand:'Dhanuka',     type:'Liquid',     unit:'Litre',  packSize:'500 ml', purchasePrice:350,  sellingPrice:420,  minStock:30, supplierId:'sup2', description:'Insecticide', status:'active', expiryDate:'2026-12-31', batchNo:'BT2024A' },
      { id:'p7',  name:'Mancozeb',        categoryId:'cat2', brand:'Indofil',     type:'Powder',     unit:'Kg',     packSize:'1 kg',   purchasePrice:280,  sellingPrice:350,  minStock:25, supplierId:'sup2', description:'Fungicide', status:'active', expiryDate:'2026-06-30', batchNo:'BT2024B' },
      { id:'p8',  name:'Glyphosate',      categoryId:'cat2', brand:'Bayer',       type:'Liquid',     unit:'Litre',  packSize:'1 L',    purchasePrice:450,  sellingPrice:550,  minStock:20, supplierId:'sup2', description:'Herbicide', status:'active', expiryDate:'2027-03-31', batchNo:'BT2024C' },
      { id:'p9',  name:'Tomato Seeds',    categoryId:'cat3', brand:'Syngenta',    type:'Hybrid',     unit:'Packet', packSize:'10 g',   purchasePrice:150,  sellingPrice:200,  minStock:40, supplierId:'sup3', description:'Hybrid tomato variety', status:'active', expiryDate:'2025-12-31', batchNo:'TS2024' },
      { id:'p10', name:'Onion Seeds',     categoryId:'cat3', brand:'East West',   type:'Hybrid',     unit:'Packet', packSize:'50 g',   purchasePrice:120,  sellingPrice:160,  minStock:40, supplierId:'sup3', description:'Hybrid onion variety', status:'active', expiryDate:'2025-10-31', batchNo:'OS2024' },
    ];
    write('products', products);

    // Stock (per storeroom per product)
    const stockData = [
      {id:'s1',  productId:'p1',  storeroomId:'sr1', qty:100}, {id:'s2',  productId:'p1',  storeroomId:'sr2', qty:75},  {id:'s3',  productId:'p1',  storeroomId:'sr3', qty:50},
      {id:'s4',  productId:'p2',  storeroomId:'sr1', qty:60},  {id:'s5',  productId:'p2',  storeroomId:'sr2', qty:8},   {id:'s6',  productId:'p2',  storeroomId:'sr3', qty:30},
      {id:'s7',  productId:'p3',  storeroomId:'sr1', qty:45},  {id:'s8',  productId:'p3',  storeroomId:'sr2', qty:20},  {id:'s9',  productId:'p3',  storeroomId:'sr3', qty:15},
      {id:'s10', productId:'p4',  storeroomId:'sr1', qty:30},  {id:'s11', productId:'p4',  storeroomId:'sr2', qty:25},  {id:'s12', productId:'p4',  storeroomId:'sr3', qty:12},
      {id:'s13', productId:'p5',  storeroomId:'sr1', qty:200}, {id:'s14', productId:'p5',  storeroomId:'sr2', qty:150}, {id:'s15', productId:'p5',  storeroomId:'sr3', qty:100},
      {id:'s16', productId:'p6',  storeroomId:'sr1', qty:50},  {id:'s17', productId:'p6',  storeroomId:'sr2', qty:35},  {id:'s18', productId:'p6',  storeroomId:'sr3', qty:20},
      {id:'s19', productId:'p7',  storeroomId:'sr1', qty:40},  {id:'s20', productId:'p7',  storeroomId:'sr2', qty:30},  {id:'s21', productId:'p7',  storeroomId:'sr3', qty:10},
      {id:'s22', productId:'p8',  storeroomId:'sr1', qty:25},  {id:'s23', productId:'p8',  storeroomId:'sr2', qty:18},  {id:'s24', productId:'p8',  storeroomId:'sr3', qty:0},
      {id:'s25', productId:'p9',  storeroomId:'sr1', qty:80},  {id:'s26', productId:'p9',  storeroomId:'sr2', qty:60},  {id:'s27', productId:'p9',  storeroomId:'sr3', qty:40},
      {id:'s28', productId:'p10', storeroomId:'sr1', qty:70},  {id:'s29', productId:'p10', storeroomId:'sr2', qty:50},  {id:'s30', productId:'p10', storeroomId:'sr3', qty:35},
    ];
    write('stock', stockData);

    // Sample sales (last 30 days)
    const sales = [];
    const saleItems = [];
    const today = new Date();
    for (let d = 29; d >= 0; d--) {
      const dt = new Date(today); dt.setDate(dt.getDate() - d);
      const dateStr = dt.toISOString().split('T')[0];
      const saleId = 'sale_' + d;
      const prodIds = ['p1','p2','p3','p4','p5'];
      const pid = prodIds[d % 5];
      const qty = Math.floor(Math.random()*10)+1;
      const prod = products.find(p=>p.id===pid);
      const sr = ['sr1','sr2','sr3'][d%3];
      sales.push({ id: saleId, date: dateStr, storeroomId: sr, invoiceNo:'INV-'+String(1000+d).padStart(4,'0'), customer:'', phone:'', paymentMethod:'Cash', staffId:'u1', notes:'', total: prod.sellingPrice*qty, createdAt: dt.toISOString() });
      saleItems.push({ id:'si_'+d, saleId, productId: pid, qty, price: prod.sellingPrice, subtotal: prod.sellingPrice*qty });
    }
    write('sales', sales);
    write('saleItems', saleItems);

    // Sample purchases
    write('purchases', [
      { id:'pur1', date:'2026-09-01', supplierId:'sup1', invoiceNo:'PINV-001', storeroomId:'sr1', notes:'', total:45000, createdAt: now() },
      { id:'pur2', date:'2026-09-10', supplierId:'sup2', invoiceNo:'PINV-002', storeroomId:'sr2', notes:'', total:28000, createdAt: now() },
      { id:'pur3', date:'2026-09-15', supplierId:'sup3', invoiceNo:'PINV-003', storeroomId:'sr1', notes:'', total:15000, createdAt: now() },
    ]);
    write('purchaseItems', [
      { id:'pi1', purchaseId:'pur1', productId:'p1',  qty:50, price:900,  batchNo:'',       expiryDate:'',           subtotal:45000 },
      { id:'pi2', purchaseId:'pur2', productId:'p6',  qty:40, price:350,  batchNo:'BT2024A',expiryDate:'2026-12-31', subtotal:14000 },
      { id:'pi3', purchaseId:'pur2', productId:'p7',  qty:40, price:280,  batchNo:'BT2024B',expiryDate:'2026-06-30', subtotal:11200 },
      { id:'pi4', purchaseId:'pur3', productId:'p9',  qty:50, price:150,  batchNo:'TS2024', expiryDate:'2025-12-31', subtotal:7500  },
      { id:'pi5', purchaseId:'pur3', productId:'p10', qty:50, price:120,  batchNo:'OS2024', expiryDate:'2025-10-31', subtotal:6000  },
    ]);

    write('transfers', [
      { id:'tr1', date:'2026-09-05', fromStoreroomId:'sr1', toStoreroomId:'sr2', productId:'p1', qty:20, staffId:'u1', notes:'', createdAt: now() },
      { id:'tr2', date:'2026-09-12', fromStoreroomId:'sr2', toStoreroomId:'sr3', productId:'p2', qty:10, staffId:'u1', notes:'', createdAt: now() },
    ]);

    write('adjustments', [
      { id:'adj1', date:'2026-09-08', storeroomId:'sr1', productId:'p6', qty:-5, reason:'Damaged',  staffId:'u1', notes:'Broken bottles', createdAt: now() },
      { id:'adj2', date:'2026-09-20', storeroomId:'sr2', productId:'p9', qty:-3, reason:'Expired',  staffId:'u1', notes:'Past expiry',     createdAt: now() },
    ]);

    write('invHistory', []);
    localStorage.setItem('_seeded', '1');
  }

  // ── CRUD table helper ─────────────────────────────────────────────────────
  const table = (name) => ({
    all:    ()       => read(name),
    find:   (id)     => read(name).find(r => r.id === id),
    where:  (fn)     => read(name).filter(fn),
    insert: (data)   => { const rows = read(name); const row = { id: uid(), createdAt: now(), ...data }; rows.push(row); write(name, rows); return row; },
    update: (id, d)  => { const rows = read(name).map(r => r.id===id ? {...r,...d, updatedAt:now()} : r); write(name, rows); return rows.find(r=>r.id===id); },
    remove: (id)     => { write(name, read(name).filter(r => r.id !== id)); },
    removeWhere: (fn)=> { write(name, read(name).filter(r => !fn(r))); },
  });

  // ── Stock helpers ─────────────────────────────────────────────────────────
  function getStock(productId, storeroomId) {
    const s = read('stock').find(r => r.productId===productId && r.storeroomId===storeroomId);
    return s ? s.qty : 0;
  }

  function adjustStock(productId, storeroomId, delta, txType, ref, userId, notes='') {
    const stocks = read('stock');
    const idx = stocks.findIndex(r => r.productId===productId && r.storeroomId===storeroomId);
    const prev = idx >= 0 ? stocks[idx].qty : 0;
    const newQty = prev + delta;
    if (idx >= 0) { stocks[idx].qty = newQty; stocks[idx].updatedAt = now(); }
    else { stocks.push({ id: uid(), productId, storeroomId, qty: newQty, updatedAt: now() }); }
    write('stock', stocks);
    const hist = read('invHistory');
    hist.unshift({ id:uid(), date:new Date().toISOString().split('T')[0], time:new Date().toTimeString().slice(0,8), productId, storeroomId, txType, qty:Math.abs(delta), direction: delta>=0?'+':'-', prevQty:prev, newQty, userId, ref, notes, createdAt:now() });
    write('invHistory', hist);
    return newQty;
  }

  return { seed, table, uid, now, getStock, adjustStock };
})();
