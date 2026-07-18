export const generateInvoiceHtml = (invoiceForm, entries, type) => {
    const isProforma = type === 'PROFORMA';
    const invoiceTitle = isProforma ? 'PROFORMA INVOICE' : 'TAX INVOICE';
    const invoiceNo = invoiceForm.invoiceId || '';
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-');
    
    const companyName = invoiceForm.companyName || 'Unique Engineering';
    const companyAddress = '11, Sarva Darshan Apartment. B/H Heven Park,<br/>Vejalpur, Ahmedabad, Gujarat - 380051';
    const companyGST = '24CHHPK0829H2ZG';
    const companyEmail = 'uniqueengineering93@gmail.com';
    const companyContact = '+91-9099160391';
    
    const b = invoiceForm.buyerDetails;
    const s = invoiceForm.shipToDetails;

    let itemsHtml = '';
    let totalAmount = 0;
    
    entries.forEach((entry, i) => {
        const conf = invoiceForm.entryConfigs[entry._id] || {};
        const qty = conf.qty || 1;
        const rate = conf.rate || 0;
        const amt = qty * rate;
        totalAmount += amt;
        
        const entryDate = new Date(entry.scheduleDate).toLocaleDateString('en-GB');
        const desc = "<b>Hire Charges for " + conf.instrument + "</b><br/><span style=\"font-size:10px; color:#555;\">DATE : " + entryDate + "</span>";
        
        itemsHtml += "<tr style=\"border-bottom: 1px solid #ccc; text-align:center;\">";
        itemsHtml += "<td style=\"padding:5px; border-right:1px solid #000;\">" + (i + 1) + "</td>";
        itemsHtml += "<td style=\"padding:5px; text-align:left; border-right:1px solid #000;\">" + desc + "</td>";
        itemsHtml += "<td style=\"padding:5px; border-right:1px solid #000;\">9983</td>";
        itemsHtml += "<td style=\"padding:5px; border-right:1px solid #000;\"><b>" + qty.toFixed(1) + " Days</b></td>";
        itemsHtml += "<td style=\"padding:5px; border-right:1px solid #000;\">" + rate.toFixed(2) + "</td>";
        itemsHtml += "<td style=\"padding:5px; border-right:1px solid #000;\">Days</td>";
        itemsHtml += "<td style=\"padding:5px;\"><b>" + amt.toFixed(2) + "</b></td>";
        itemsHtml += "</tr>";
    });
    
    const cgst = totalAmount * 0.09;
    const sgst = totalAmount * 0.09;
    const grandTotal = totalAmount + cgst + sgst;
    
    itemsHtml += "<tr style=\"text-align:center;\">";
    itemsHtml += "<td style=\"border-right:1px solid #000;\"></td>";
    itemsHtml += "<td style=\"text-align:right; padding-right:10px; border-right:1px solid #000;\"><i>CGST 9%</i><br/><i>SGST 9%</i></td>";
    itemsHtml += "<td style=\"border-right:1px solid #000;\"></td>";
    itemsHtml += "<td style=\"border-right:1px solid #000;\"></td>";
    itemsHtml += "<td style=\"border-right:1px solid #000;\"></td>";
    itemsHtml += "<td style=\"border-right:1px solid #000;\"></td>";
    itemsHtml += "<td style=\"padding:5px;\"><b>" + cgst.toFixed(2) + "</b><br/><b>" + sgst.toFixed(2) + "</b></td>";
    itemsHtml += "</tr>";

    const numberToWords = (num) => {
        return "INR " + Math.round(num).toString() + " Only";
    };

    // Use regular string concatenation for HTML to avoid any backtick/escape issues
    let html = "<!DOCTYPE html>\n<html>\n<head>\n<meta charset=\"utf-8\">\n<style>\n";
    html += "body { font-family: Arial, sans-serif; font-size: 11px; margin: 0; padding: 20px; color: #000; }\n";
    html += ".container { width: 100%; border: 1px solid #000; }\n";
    html += ".header-title { text-align: center; font-size: 16px; font-weight: bold; border-bottom: 1px solid #000; padding: 5px; }\n";
    html += "table { width: 100%; border-collapse: collapse; }\n";
    html += "td, th { padding: 4px; vertical-align: top; }\n";
    html += ".border-bottom { border-bottom: 1px solid #000; }\n";
    html += ".border-right { border-right: 1px solid #000; }\n";
    html += ".bold { font-weight: bold; }\n";
    html += "</style>\n</head>\n<body>\n";
    
    html += "<div class=\"container\">\n";
    html += "<div class=\"header-title\">" + invoiceTitle + "</div>\n";
    html += "<table><tr class=\"border-bottom\">\n";
    html += "<td style=\"width: 50%; padding:10px;\" class=\"border-right\">\n";
    html += "<div style=\"font-size:18px; font-weight:bold; color:#0056b3;\">" + companyName + "</div>\n";
    html += "<div>" + companyAddress + "</div>\n";
    html += "<div>GSTIN/UIN: " + companyGST + "</div>\n";
    html += "<div>Contact: " + companyContact + "</div>\n";
    html += "<div>E-Mail: " + companyEmail + "</div>\n</td>\n";
    
    html += "<td style=\"width: 50%; padding:0;\">\n<table style=\"height:100%;\">\n";
    html += "<tr class=\"border-bottom\"><td class=\"border-right\" style=\"width:50%;\">Invoice No.<br/><b>" + invoiceNo + "</b></td>";
    html += "<td>Dated<br/><b>" + dateStr + "</b></td></tr>\n";
    html += "<tr class=\"border-bottom\"><td class=\"border-right\">Delivery Note</td><td>Mode/Terms of Payment</td></tr>\n";
    html += "<tr class=\"border-bottom\"><td class=\"border-right\">Reference No. & Date.</td><td>Other References</td></tr>\n";
    html += "<tr class=\"border-bottom\"><td class=\"border-right\">Buyer's Order No.</td><td>Dated</td></tr>\n";
    html += "<tr><td class=\"border-right\">Dispatch Doc No.</td><td>Delivery Note Date</td></tr>\n";
    html += "</table>\n</td>\n</tr>\n";
    
    html += "<tr class=\"border-bottom\">\n";
    html += "<td class=\"border-right\" style=\"padding:10px;\">\n<div>Consignee (Ship to)</div>\n";
    html += "<div class=\"bold\">" + s.name + "</div>\n";
    html += "<div>" + s.address + "</div>\n";
    html += "<div>GSTIN/UIN: " + s.gstin + "</div>\n";
    html += "<div>State Name: " + s.stateName + ", Code: " + s.stateCode + "</div>\n";
    html += "<div>Contact person: " + s.contactPerson + "</div>\n";
    html += "<div>Contact: " + s.contact + "</div>\n</td>\n";
    
    html += "<td style=\"padding:10px;\">\n<div>Buyer (Bill to)</div>\n";
    html += "<div class=\"bold\">" + b.name + "</div>\n";
    html += "<div>" + b.address + "</div>\n";
    html += "<div>GSTIN/UIN: " + b.gstin + "</div>\n";
    html += "<div>State Name: " + b.stateName + ", Code: " + b.stateCode + "</div>\n";
    html += "<div>Contact person: " + b.contactPerson + "</div>\n";
    html += "<div>Contact: " + b.contact + "</div>\n</td>\n</tr>\n</table>\n";
    
    html += "<table style=\"border-bottom: 1px solid #000; min-height: 400px;\">\n";
    html += "<tr class=\"border-bottom\" style=\"background:#f9f9f9; text-align:center;\">\n";
    html += "<th class=\"border-right\">Sl No.</th>\n<th class=\"border-right\">Description of Goods</th>\n";
    html += "<th class=\"border-right\">HSN/SAC</th>\n<th class=\"border-right\">Quantity</th>\n";
    html += "<th class=\"border-right\">Rate</th>\n<th class=\"border-right\">per</th>\n<th>Amount</th>\n</tr>\n";
    html += itemsHtml + "\n</table>\n";
    
    html += "<table class=\"border-bottom\">\n<tr>\n";
    html += "<td style=\"text-align:right; border-right:1px solid #000; width:80%;\"><b>Total</b></td>\n";
    html += "<td style=\"text-align:right;\"><b>₹ " + grandTotal.toFixed(2) + "</b></td>\n</tr>\n</table>\n";
    
    html += "<div style=\"padding:5px;\" class=\"border-bottom\">\nAmount Chargeable (in words)<br/>\n";
    html += "<b>" + numberToWords(grandTotal) + "</b>\n</div>\n";
    
    html += "<table>\n<tr>\n<td style=\"width:50%; border-right:1px solid #000; padding:10px;\">\n";
    html += "<div>Company's PAN : <b>CHHPK0829H</b></div>\n";
    html += "<div style=\"margin-top:20px; text-decoration:underline;\">Declaration</div>\n";
    html += "<div>We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.</div>\n</td>\n";
    
    html += "<td style=\"width:50%; padding:10px; text-align:right;\">\n";
    html += "<div>Company's Bank Details</div>\n";
    html += "<div style=\"text-align:left; display:inline-block;\">\n";
    html += "<div>A/c Holder's Name: <b>" + companyName + "</b></div>\n";
    html += "<div>Bank Name: <b>Indusind Bank</b></div>\n";
    html += "<div>A/c No.: <b>201000478211</b></div>\n";
    html += "<div>Branch & IFS Code: <b>INDB0000330</b></div>\n</div>\n";
    html += "<div style=\"margin-top:40px;\">\n<b>for " + companyName + "</b><br/><br/><br/><br/>\nAuthorised Signatory\n</div>\n</td>\n</tr>\n</table>\n";
    
    html += "<div style=\"text-align:center; padding:5px; border-top:1px solid #000; font-size:10px;\">\n";
    html += "SUBJECT TO AHMEDABAD JURISDICTION<br/>\nThis is a Computer Generated Invoice\n</div>\n";
    
    html += "</div>\n</body>\n</html>";
    
    return html;
};
