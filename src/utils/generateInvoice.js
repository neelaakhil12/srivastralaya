import { jsPDF } from 'jspdf';

/**
 * Loads the brand logo as base64 data URL for high-resolution PDF rendering
 */
async function loadLogoDataUrl() {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = '/logo.png';
  });
}

/**
 * Generates and downloads a luxury PDF Tax Invoice for a given order.
 * @param {object} order - The order object
 */
export async function generateInvoice(order) {
  if (!order) return;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentW = pageW - margin * 2;
  let y = 0;

  // ─── 1. LUXURY MAROON & GOLD HEADER ────────────────────────────────────────
  const headerHeight = 46;
  doc.setFillColor(112, 26, 35); // #701A23 (Royal Maroon)
  doc.rect(0, 0, pageW, headerHeight, 'F');

  // Gold accent bar
  doc.setFillColor(212, 175, 55); // #D4AF37 (Gold)
  doc.rect(0, headerHeight - 2, pageW, 2, 'F');

  // Load and embed brand Logo
  const logoData = await loadLogoDataUrl();
  let brandStartX = margin;

  if (logoData) {
    // White rounded logo container badge
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, 6, 32, 32, 3, 3, 'F');
    doc.addImage(logoData, 'PNG', margin + 2, 8, 28, 28);
    brandStartX = margin + 36;
  }

  // Brand Name & Taglines
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(212, 175, 55); // Gold
  doc.text('SRI VASTRALAYA', brandStartX, 17);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 230, 230);
  doc.text('Traditional & Modern Fashion • Handcrafted Heritage', brandStartX, 24);
  doc.text('Hyderabad, Telangana | +91 9618093699 | srivastralaya6@gmail.com', brandStartX, 30);
  doc.setFontSize(7.5);
  doc.setTextColor(230, 200, 200);
  doc.text('Official E-Commerce Storefront: srivastralaya-delta.vercel.app', brandStartX, 36);

  // Right Header: TAX INVOICE label & Order reference
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('TAX INVOICE', pageW - margin, 18, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(212, 175, 55);
  doc.text(`INV #${(order.id || 'ORDER').replace(/^ORD-/, '')}`, pageW - margin, 26, { align: 'right' });
  doc.setTextColor(255, 255, 255);
  const invoiceDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  doc.text(`Date: ${invoiceDate}`, pageW - margin, 32, { align: 'right' });

  y = headerHeight + 8;

  // ─── 2. ORDER & CUSTOMER INFORMATION CARDS ─────────────────────────────────
  const boxW = (contentW - 6) / 2;
  const boxH = 38;

  // Left Card: Order Details
  doc.setFillColor(250, 246, 246); // subtle warm gray
  doc.setDrawColor(230, 215, 215);
  doc.roundedRect(margin, y, boxW, boxH, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(112, 26, 35);
  doc.text('ORDER INFORMATION', margin + 4, y + 6);
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.4);
  doc.line(margin + 4, y + 8, margin + boxW - 4, y + 8);

  doc.setFontSize(8);
  const isCOD = (order.paymentMethod || '').toLowerCase().includes('cod') || (order.paymentMethod || '').toLowerCase().includes('cash');
  const orderDetails = [
    ['Order ID:', `#${order.id || 'N/A'}`],
    ['Order Date:', invoiceDate],
    ['Payment Mode:', isCOD ? 'Cash on Delivery (COD) - COLLECT CASH' : (order.paymentMethod || 'Online (Razorpay)')],
    ['Order Status:', order.status || 'Confirmed']
  ];

  orderDetails.forEach(([lbl, val], idx) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text(lbl, margin + 4, y + 14 + idx * 5.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(20, 20, 20);
    doc.text(String(val), margin + 28, y + 14 + idx * 5.5);
  });

  // Right Card: Customer & Shipping Details
  const rightBoxX = margin + boxW + 6;
  doc.setFillColor(250, 246, 246);
  doc.setDrawColor(230, 215, 215);
  doc.roundedRect(rightBoxX, y, boxW, boxH, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(112, 26, 35);
  doc.text('BILLED & DELIVERED TO', rightBoxX + 4, y + 6);
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.4);
  doc.line(rightBoxX + 4, y + 8, rightBoxX + boxW - 4, y + 8);

  doc.setFontSize(8);
  const custName = order.customerName || 'Valued Customer';
  const custPhone = order.customerPhone || 'N/A';
  const custEmail = order.customerEmail || 'N/A';
  const custAddress = order.customerAddress || 'N/A';

  const custDetails = [
    ['Customer:', custName],
    ['Phone:', `+91 ${custPhone.replace(/^\+91/, '').trim()}`],
    ['Email:', custEmail],
    ['Address:', custAddress.length > 34 ? custAddress.slice(0, 34) + '...' : custAddress]
  ];

  custDetails.forEach(([lbl, val], idx) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text(lbl, rightBoxX + 4, y + 14 + idx * 5.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(20, 20, 20);
    doc.text(String(val), rightBoxX + 22, y + 14 + idx * 5.5);
  });

  y += boxH + 8;

  // ─── 3. ITEMS TABLE ────────────────────────────────────────────────────────
  // Table Header
  const tableHeaderHeight = 8;
  doc.setFillColor(112, 26, 35);
  doc.roundedRect(margin, y, contentW, tableHeaderHeight, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);

  const col = {
    no: margin + 3,
    desc: margin + 12,
    variant: margin + contentW * 0.52,
    qty: margin + contentW * 0.68,
    price: margin + contentW * 0.79,
    amount: margin + contentW - 3
  };

  doc.text('#', col.no, y + 5.5);
  doc.text('ITEM DESCRIPTION', col.desc, y + 5.5);
  doc.text('SIZE / COLOR', col.variant, y + 5.5);
  doc.text('QTY', col.qty, y + 5.5, { align: 'center' });
  doc.text('PRICE', col.price, y + 5.5, { align: 'right' });
  doc.text('TOTAL AMOUNT', col.amount, y + 5.5, { align: 'right' });

  y += tableHeaderHeight + 2;

  // Table Body Rows
  const items = Array.isArray(order.items) && order.items.length > 0 ? order.items : [
    { name: 'Fashion Item', quantity: 1, price: order.total || 0 }
  ];

  items.forEach((item, idx) => {
    const isEven = idx % 2 === 0;
    const rowH = 8.5;

    // Alternating soft row background
    if (isEven) {
      doc.setFillColor(252, 248, 248);
      doc.rect(margin, y, contentW, rowH, 'F');
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(40, 40, 40);

    const name = item.name || 'Product';
    const displayName = name.length > 30 ? name.slice(0, 30) + '...' : name;
    const qty = Number(item.quantity || item.qty || 1);
    const price = Number(item.price || 0);
    const itemTotal = price * qty;

    const variantParts = [];
    if (item.selectedSize || item.size) variantParts.push(`Size: ${item.selectedSize || item.size}`);
    if (item.selectedColor || item.color) variantParts.push(`${item.selectedColor || item.color}`);
    const variantText = variantParts.length > 0 ? variantParts.join(' | ') : '—';

    doc.text(String(idx + 1), col.no, y + 5.5);
    doc.setFont('helvetica', 'bold');
    doc.text(displayName, col.desc, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(90, 90, 90);
    doc.text(variantText, col.variant, y + 5.5);

    doc.setTextColor(30, 30, 30);
    doc.text(String(qty), col.qty, y + 5.5, { align: 'center' });
    doc.text(`Rs. ${price.toLocaleString('en-IN')}`, col.price, y + 5.5, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(112, 26, 35);
    doc.text(`Rs. ${itemTotal.toLocaleString('en-IN')}`, col.amount, y + 5.5, { align: 'right' });

    // Subtle row divider
    doc.setDrawColor(240, 230, 230);
    doc.setLineWidth(0.2);
    doc.line(margin, y + rowH, pageW - margin, y + rowH);

    y += rowH;
  });

  y += 4;

  // ─── 4. SUMMARY & TOTALS SECTION ──────────────────────────────────────────
  const summaryBoxW = 75;
  const summaryX = pageW - margin - summaryBoxW;

  const subtotal = Number(order.subtotal || order.total || 0);
  const discount = Number(order.discount || 0);
  const shipping = Number(order.shipping || 0);
  const grandTotal = Number(order.total || (subtotal - discount + shipping));

  const addSummaryLine = (label, valStr, isBold = false, textColor = [60, 60, 60]) => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(isBold ? 9.5 : 8.5);
    doc.setTextColor(...textColor);
    doc.text(label, summaryX, y + 4);
    doc.text(valStr, pageW - margin - 2, y + 4, { align: 'right' });
    y += 6;
  };

  addSummaryLine('Subtotal:', `Rs. ${subtotal.toLocaleString('en-IN')}`);
  if (discount > 0) {
    addSummaryLine('Promotional Discount:', `- Rs. ${discount.toLocaleString('en-IN')}`, false, [34, 139, 34]);
  }
  addSummaryLine('Shipping & Delivery:', shipping > 0 ? `Rs. ${shipping.toLocaleString('en-IN')}` : 'FREE (Special Offer)', false, shipping === 0 ? [34, 139, 34] : [60, 60, 60]);

  // Highlighted Grand Total Box (Clean, non-colliding layout)
  y += 2;
  doc.setFillColor(112, 26, 35);
  doc.roundedRect(summaryX - 4, y, summaryBoxW + 4, 10, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL AMOUNT:', summaryX, y + 6.5);
  doc.setTextColor(212, 175, 55); // Gold text
  doc.text(`Rs. ${grandTotal.toLocaleString('en-IN')}`, pageW - margin - 2, y + 6.5, { align: 'right' });

  // ─── 5. SECURITY & CONFIRMATION BADGE (LEFT OF TOTALS) ────────────────────
  const badgeY = y - 14;
  if (isCOD) {
    doc.setFillColor(254, 243, 199); // warm amber
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(margin, badgeY, 80, 24, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(180, 83, 9);
    doc.text('CASH ON DELIVERY (COD)', margin + 4, badgeY + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(146, 64, 14);
    doc.text(`• COLLECT Rs. ${grandTotal.toLocaleString('en-IN')} CASH ON DELIVERY`, margin + 4, badgeY + 11);
    doc.setFont('helvetica', 'normal');
    doc.text('• Fast Tracked Courier Express Delivery', margin + 4, badgeY + 16);
    doc.text('• Official Digital Tax Invoice for Sri Vastralaya', margin + 4, badgeY + 21);
  } else {
    doc.setFillColor(240, 249, 244); // light emerald
    doc.setDrawColor(167, 243, 208);
    doc.roundedRect(margin, badgeY, 80, 24, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(6, 95, 70);
    doc.text('✓ ORDER VERIFIED & CONFIRMED', margin + 4, badgeY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(50, 70, 60);
    doc.text('• 100% Genuine Handcrafted & Curated Quality', margin + 4, badgeY + 11);
    doc.text('• Fast DTDC / BlueDart Tracked Delivery', margin + 4, badgeY + 16);
    doc.text('• Official Digital Tax Invoice for Sri Vastralaya', margin + 4, badgeY + 21);
  }

  // ─── 6. POLISHED FOOTER ───────────────────────────────────────────────────
  const footerHeight = 22;
  const footerY = pageH - footerHeight;

  // Gold top border
  doc.setFillColor(212, 175, 55);
  doc.rect(0, footerY - 1, pageW, 1, 'F');

  doc.setFillColor(112, 26, 35);
  doc.rect(0, footerY, pageW, footerHeight, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(212, 175, 55); // Gold
  doc.text('Thank you for shopping with Sri Vastralaya! 🛍️', pageW / 2, footerY + 7, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 230, 230);
  doc.text('For returns, tracking assistance, or custom styling: +91 9618093699 | srivastralaya6@gmail.com', pageW / 2, footerY + 12, { align: 'center' });
  doc.text('Hyderabad, Telangana, India • Visit us online at: srivastralaya-delta.vercel.app', pageW / 2, footerY + 17, { align: 'center' });

  // Save PDF file
  const filename = `SriVastralaya_Invoice_${order.id || Date.now()}.pdf`;
  doc.save(filename);
}
