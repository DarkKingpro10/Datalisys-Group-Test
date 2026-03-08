const fs = require('fs');
const readline = require('readline');
const path = require('path');

function parseDate(s) {
  if (!s) return null;
  // Normalize CSV datetime like "2017-09-20 10:00:00"
  const t = s.replace(' ', 'T');
  const d = new Date(t);
  return isNaN(d.getTime()) ? null : d;
}

function parseFloatSafe(s) {
  if (!s) return 0;
  const n = Number(s);
  return isNaN(n) ? 0 : n;
}

function csvSplit(line) {
  const res = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i+1] === '"') { cur += '"'; i++; } else { inQuotes = !inQuotes; }
      continue;
    }
    if (ch === ',' && !inQuotes) {
      res.push(cur);
      cur = '';
      continue;
    }
    cur += ch;
  }
  res.push(cur);
  return res;
}

async function readOrders(filePath, from, to) {
  const orders = new Map();
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity,
  });
  let header = [];
  for await (const line of rl) {
    if (!header.length) { header = csvSplit(line); continue; }
    const parts = csvSplit(line);
    const row = {};
    for (let i = 0; i < header.length; i++) row[header[i]] = parts[i] || '';
    const purchase = parseDate(row.order_purchase_timestamp);
    if (!purchase) continue;
    if (purchase < from || purchase > to) continue;
    orders.set(row.order_id, {
      order_status: row.order_status,
      order_purchase_timestamp: row.order_purchase_timestamp,
      order_delivered_customer_date: row.order_delivered_customer_date,
      order_estimated_delivery_date: row.order_estimated_delivery_date,
    });
  }
  return orders;
}

async function computeFromFiles({fromStr, toStr}) {
  const base = path.join(__dirname, '..', 'data', 'raw');
  const ordersFile = path.join(base, 'olist_orders_dataset.csv');
  const itemsFile = path.join(base, 'olist_order_items_dataset.csv');
  const paymentsFile = path.join(base, 'olist_order_payments_dataset.csv');

  const from = new Date(fromStr);
  const to = new Date(toStr);

  const orders = await readOrders(ordersFile, from, to);
  const orderIds = new Set(orders.keys());

  // Items: GMV and items count
  let gmV = 0;
  let itemsCount = 0;
  const rlItems = readline.createInterface({ input: fs.createReadStream(itemsFile), crlfDelay: Infinity });
  header = [];
  for await (const line of rlItems) {
    if (!header.length) { header = csvSplit(line); continue; }
    const parts = csvSplit(line);
    const row = {};
    for (let i = 0; i < header.length; i++) row[header[i]] = parts[i] || '';
    if (!orderIds.has(row.order_id)) continue;
    const price = parseFloatSafe(row.price);
    gmV += price;
    itemsCount += 1;
  }

  // Payments: Revenue (sum of payment_value for orders in range)
  let revenue = 0;
  const rlPay = readline.createInterface({ input: fs.createReadStream(paymentsFile), crlfDelay: Infinity });
  header = [];
  for await (const line of rlPay) {
    if (!header.length) { header = csvSplit(line); continue; }
    const parts = csvSplit(line);
    const row = {};
    for (let i = 0; i < header.length; i++) row[header[i]] = parts[i] || '';
    if (!orderIds.has(row.order_id)) continue;
    revenue += parseFloatSafe(row.payment_value);
  }

  const ordersTotal = orderIds.size;
  const canceled = Array.from(orders.values()).filter(o => (o.order_status || '').toLowerCase() === 'canceled').length;
  const deliveredOrders = Array.from(orders.values()).filter(o => o.order_delivered_customer_date && o.order_estimated_delivery_date);
  const deliveredOnTime = deliveredOrders.filter(o => {
    const d = parseDate(o.order_delivered_customer_date);
    const e = parseDate(o.order_estimated_delivery_date);
    if (!d || !e) return false;
    return d.getTime() <= e.getTime();
  }).length;

  const aov = ordersTotal ? revenue / ordersTotal : 0;
  const ipo = ordersTotal ? itemsCount / ordersTotal : 0;
  const cancelRate = ordersTotal ? (canceled / ordersTotal) * 100 : 0;
  const onTimeRate = deliveredOrders.length ? (deliveredOnTime / deliveredOrders.length) * 100 : 0;

  return {
    gmV, revenue, orders: ordersTotal, aov, ipo, cancelRate, onTimeRate,
    itemsCount, deliveredTotal: deliveredOrders.length, deliveredOnTime
  };
}

async function analyzePayments({ fromStr, toStr, topN = 20 }) {
  const base = path.join(__dirname, '..', 'data', 'raw');
  const ordersFile = path.join(base, 'olist_orders_dataset.csv');
  const itemsFile = path.join(base, 'olist_order_items_dataset.csv');
  const paymentsFile = path.join(base, 'olist_order_payments_dataset.csv');

  const from = new Date(fromStr);
  const to = new Date(toStr);

  const orders = await readOrders(ordersFile, from, to);
  const orderIds = new Set(orders.keys());

  // Sum item prices per order
  const orderItemPrice = new Map();
  const orderItemCount = new Map();
  const rlItems = readline.createInterface({ input: fs.createReadStream(itemsFile), crlfDelay: Infinity });
  let header = [];
  for await (const line of rlItems) {
    if (!header.length) { header = csvSplit(line); continue; }
    const parts = csvSplit(line);
    const row = {};
    for (let i = 0; i < header.length; i++) row[header[i]] = parts[i] || '';
    if (!orderIds.has(row.order_id)) continue;
    const price = parseFloatSafe(row.price);
    orderItemPrice.set(row.order_id, (orderItemPrice.get(row.order_id) || 0) + price);
    orderItemCount.set(row.order_id, (orderItemCount.get(row.order_id) || 0) + 1);
  }

  // Sum payments per order
  const orderPaymentSum = new Map();
  const orderPaymentCount = new Map();
  const rlPay = readline.createInterface({ input: fs.createReadStream(paymentsFile), crlfDelay: Infinity });
  header = [];
  for await (const line of rlPay) {
    if (!header.length) { header = csvSplit(line); continue; }
    const parts = csvSplit(line);
    const row = {};
    for (let i = 0; i < header.length; i++) row[header[i]] = parts[i] || '';
    if (!orderIds.has(row.order_id)) continue;
    const val = parseFloatSafe(row.payment_value);
    orderPaymentSum.set(row.order_id, (orderPaymentSum.get(row.order_id) || 0) + val);
    orderPaymentCount.set(row.order_id, (orderPaymentCount.get(row.order_id) || 0) + 1);
  }

  // Build list of orders with diffs
  const diffs = [];
  for (const oid of orderIds) {
    const itemsSum = orderItemPrice.get(oid) || 0;
    const itemsCnt = orderItemCount.get(oid) || 0;
    const paymentsSum = orderPaymentSum.get(oid) || 0;
    const paymentsCnt = orderPaymentCount.get(oid) || 0;
    const diff = paymentsSum - itemsSum; // positive => paid more than items
    diffs.push({ order_id: oid, itemsSum, itemsCnt, paymentsSum, paymentsCnt, diff, absDiff: Math.abs(diff) });
  }

  diffs.sort((a, b) => b.absDiff - a.absDiff);

  console.log('\nTop ' + topN + ' órdenes por diferencia absoluta (payments - items):');
  console.log('order_id | payments | items_sum | diff | payments_count | items_count');
  for (let i = 0; i < Math.min(topN, diffs.length); i++) {
    const d = diffs[i];
    console.log(`${d.order_id} | ${d.paymentsSum.toFixed(2)} | ${d.itemsSum.toFixed(2)} | ${d.diff.toFixed(2)} | ${d.paymentsCnt} | ${d.itemsCnt}`);
  }

  const stats = {
    totalOrders: orderIds.size,
    ordersWithPayments: 0,
    ordersWithMultiplePayments: 0,
    ordersWithZeroPayment: 0,
    ordersWithItemsButNoPayments: 0,
    ordersWithPaymentsButNoItems: 0,
  };

  for (const d of diffs) {
    if (d.paymentsSum > 0) stats.ordersWithPayments++;
    if (d.paymentsCnt > 1) stats.ordersWithMultiplePayments++;
    if (d.paymentsSum === 0) stats.ordersWithZeroPayment++;
    if (d.itemsSum > 0 && d.paymentsSum === 0) stats.ordersWithItemsButNoPayments++;
    if (d.itemsSum === 0 && d.paymentsSum > 0) stats.ordersWithPaymentsButNoItems++;
  }

  console.log('\nEstadísticas:');
  console.log('Total órdenes en rango:', stats.totalOrders);
  console.log('Órdenes con pagos > 0:', stats.ordersWithPayments);
  console.log('Órdenes con múltiples pagos:', stats.ordersWithMultiplePayments);
  console.log('Órdenes con pago = 0:', stats.ordersWithZeroPayment);
  console.log('Órdenes con items pero sin pagos:', stats.ordersWithItemsButNoPayments);
  console.log('Órdenes con pagos pero sin items:', stats.ordersWithPaymentsButNoItems);
}

function formatBRL(n) {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function main() {
  const args = {};
  for (const a of process.argv.slice(2)) {
    const [k, v] = a.split('=');
    args[k.replace(/^--/, '')] = v;
  }
  const from = args.from || '2016-01-01';
  const to = args.to || '2030-01-01';
  const report = args.report || null;
  console.log(`Rango: ${from} → ${to}`);
  if (report === 'payments') {
    await analyzePayments({ fromStr: from, toStr: to, topN: Number(args.top || 20) });
    return;
  }

  const res = await computeFromFiles({ fromStr: from, toStr: to });
  console.log('Resultados:');
  console.log('- GMV:', formatBRL(res.gmV));
  console.log('- Revenue:', formatBRL(res.revenue));
  console.log('- Orders:', res.orders);
  console.log('- AOV:', formatBRL(res.aov));
  console.log('- IPO:', res.ipo.toFixed(2));
  console.log('- Cancel Rate (%):', res.cancelRate.toFixed(2));
  console.log('- On-time Rate (%):', res.onTimeRate.toFixed(2));
  console.log('\nDetalles: itemsCount=' + res.itemsCount + ', delivered=' + res.deliveredTotal + ', deliveredOnTime=' + res.deliveredOnTime);
}

main().catch(err => { console.error(err); process.exit(1); });
