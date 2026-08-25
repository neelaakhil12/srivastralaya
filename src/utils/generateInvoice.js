import { jsPDF } from 'jspdf';

/**
 * Generates and downloads a PDF invoice for a given order.
 * @param {object} order - The order object
 */
export function generateInvoice(order) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 18;
  const contentW = pageW - margin * 2;
  let y = 0;

  // ─── Header Background ───────────────────────────────────────────────────
  doc.setFillColor(112, 26, 35); // #701A23
  doc.rect(0, 0, pageW, 48, 'F');

  // Brand Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(212, 175, 55); // gold
  doc.text('SRI VASTRALAYA', margin, 20);

  // Tagline
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(255, 220, 220);
  doc.text('Traditional & Modern Fashion | Hyderabad, Telangana', margin, 28);
  doc.text('+91 9618093699 | srivastralaya6@gmail.com', margin, 34);

  // INVOICE label (right side)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('INVOICE', pageW - margin, 20, { align: 'right' });

  // Gold accent line
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.8);
  doc.line(0, 48, pageW, 48);

  y = 58;

  // ─── Order Meta ─────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(112, 26, 35);
  doc.text('ORDER DETAILS', margin, y);
  doc.text('CUSTOMER DETAILS', pageW / 2 + 4, y);

  y += 5;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);

  // Left column: order info
  const leftLines = [
    ['Order ID:', order.id || 'N/A'],
    ['Date:', orderDate],
    ['Payment:', order.paymentMethod || 'COD'],
    ['Status:', order.status || 'Pending'],
  ];

  // Right column: customer info
  const rightLines = [
    ['Name:', order.customerName || 'N/A'],
    ['Phone:', order.customerPhone || 'N/A'],
    ['Email:', order.customerEmail || 'N/A'],
    ['Address:', order.customerAddress || 'N/A'],
  ];

  const lineHeight = 6;
  leftLines.forEach(([label, value], i) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text(label, margin, y + i * lineHeight);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);
    doc.text(String(value), margin + 26, y + i * lineHeight);
  });

  rightLines.forEach(([label, value], i) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text(label, pageW / 2 + 4, y + i * lineHeight);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);
    const truncated = String(value).length > 30 ? String(value).slice(0, 30) + '…' : String(value);
    doc.text(truncated, pageW / 2 + 24, y + i * lineHeight);
  });

  y += leftLines.length * lineHeight + 10;

  // ─── Items Table ─────────────────────────────────────────────────────────
  // Table header
  doc.setFillColor(112, 26, 35);
  doc.roundedRect(margin, y - 4, contentW, 8, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);

  const col = {
    no: margin + 2,
    name: margin + 10,
    size: margin + contentW * 0.55,
    qty: margin + contentW * 0.68,
    price: margin + contentW * 0.79,
    total: margin + contentW - 2,
  };

  doc.text('#', col.no, y + 0.5);
  doc.text('Item Name', col.name, y + 0.5);
  doc.text('Size', col.size, y + 0.5);
  doc.text('Qty', col.qty, y + 0.5);
  doc.text('Price', col.price, y + 0.5);
  doc.text('Amount', col.total, y + 0.5, { align: 'right' });

  y += 10;

  const items = order.items || [];
  items.forEach((item, idx) => {
    const isEven = idx % 2 === 0;
    if (isEven) {
      doc.setFillColor(250, 240, 241); // light maroon tint
      doc.rect(margin, y - 4, contentW, 7, 'F');
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(40, 40, 40);

    const name = item.name || 'Product';
    const displayName = name.length > 32 ? name.slice(0, 32) + '…' : name;
    const qty = item.quantity || item.qty || 1;
    const price = Number(item.price) || 0;
    const itemTotal = price * qty;

    doc.text(String(idx + 1), col.no, y + 0.5);
    doc.text(displayName, col.name, y + 0.5);
    doc.text(item.size || '—', col.size, y + 0.5);
    doc.text(String(qty), col.qty, y + 0.5);
    doc.text(`₹${price.toLocaleString('en-IN')}`, col.price, y + 0.5);
    doc.text(`₹${itemTotal.toLocaleString('en-IN')}`, col.total, y + 0.5, { align: 'right' });

    y += 7;
  });

  // Bottom border of table
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  // ─── Totals ──────────────────────────────────────────────────────────────
  const totalsX = pageW - margin - 60;
  const totalsValueX = pageW - margin;

  const addTotalRow = (label, value, bold = false, color = [60, 60, 60]) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(bold ? 10 : 9);
    doc.setTextColor(...color);
    doc.text(label, totalsX, y);
    doc.text(value, totalsValueX, y, { align: 'right' });
    y += 6;
  };

  addTotalRow('Subtotal:', `₹${(order.subtotal || 0).toLocaleString('en-IN')}`);
  if (order.discount > 0) {
    addTotalRow('Discount:', `-₹${(order.discount || 0).toLocaleString('en-IN')}`, false, [34, 139, 34]);
  }
  addTotalRow('Shipping:', order.shipping > 0 ? `₹${order.shipping.toLocaleString('en-IN')}` : 'FREE');

  // Total line
  doc.setDrawColor(112, 26, 35);
  doc.setLineWidth(0.5);
  doc.line(totalsX - 5, y - 2, totalsValueX, y - 2);
  addTotalRow('TOTAL:', `₹${(order.total || 0).toLocaleString('en-IN')}`, true, [112, 26, 35]);

  y += 4;

  // ─── Status Badge ────────────────────────────────────────────────────────
  const statusColors = {
    'Delivered': [34, 139, 34],
    'Shipped': [0, 102, 204],
    'Processing': [255, 140, 0],
    'Cancelled': [180, 0, 0],
    'Pending': [100, 100, 100],
  };
  const statusColor = statusColors[order.status] || [100, 100, 100];
  doc.setFillColor(...statusColor);
  doc.roundedRect(margin, y, 40, 8, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(order.status || 'Pending', margin + 20, y + 5.5, { align: 'center' });

  y += 20;

  // ─── Notes ───────────────────────────────────────────────────────────────
  if (order.notes) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 100, 100);
    doc.text(`Note: ${order.notes}`, margin, y);
    y += 8;
  }

  // ─── Footer ──────────────────────────────────────────────────────────────
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFillColor(112, 26, 35);
  doc.rect(0, pageH - 18, pageW, 18, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(212, 175, 55);
  doc.text('Thank you for shopping with Sri Vastralaya! 🛍️', pageW / 2, pageH - 11, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 220, 220);
  doc.text('For queries: +91 9618093699 | srivastralaya6@gmail.com', pageW / 2, pageH - 6, { align: 'center' });

  // Save
  const filename = `SriVastralaya_Invoice_${order.id || Date.now()}.pdf`;
  doc.save(filename);
}
