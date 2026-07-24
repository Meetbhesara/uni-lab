export const generateInvoiceHtml = (invoiceForm, entries, type) => {
    const isProforma = type === 'PROFORMA';
    const invoiceTitle = isProforma ? 'PROFORMA INVOICE' : 'TAX INVOICE';
    const invoiceNo = invoiceForm.invoiceId || '';
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-');
    
    const cd = invoiceForm.companyDetails || {};
    const companyName = cd.companyName || invoiceForm.companyName || 'Unique Engineering';
    const isUniqueLab = companyName.toUpperCase().includes('LAB');
    
    let companyAddress = cd.address 
        ? `${cd.address}${cd.state || cd.pincode ? ',<br/>' : ''}${cd.state || ''} ${cd.pincode ? '- ' + cd.pincode : ''}` 
        : '11, Sarva Darshan Apartment. B/H Heven Park,<br/>Vejalpur, Ahmedabad, Gujarat - 380051';
        
    const udyam = cd.udyamNumber || (isUniqueLab ? 'UDYAM-GJ-01-xxxxxxx (Micro/Services)' : 'UDYAM-GJ-01-0197958 (Micro/Services)');
    const companyGST = cd.gstin || (isUniqueLab ? '24XXXXX0000X0XX' : '24CHHPK0829H2ZG');
    const companyEmail = cd.email || (isUniqueLab ? 'uniquelab@gmail.com' : 'uniqueengineering93@gmail.com');
    const companyContact = cd.contactNo || '+91-9099160391';
    const pan = cd.panCardNumber || (isUniqueLab ? 'XXXXX0000X' : 'CHHPK0829H');
    
    const bank = cd.bankDetails || {};
    const acHolder = bank.accountHolderName || companyName;
    const bankName = bank.bankName || 'Indusind Bank';
    const acNo = bank.accountNumber || '201000478211';
    const ifsc = bank.ifscCode || 'INDB0000330';

    let logoHtml = '';
    const logoPath = cd.logo;
    if (logoPath) {
        let logoUrl = logoPath;
        if (!logoUrl.startsWith('http://') && !logoUrl.startsWith('https://')) {
            const baseUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ? import.meta.env.VITE_API_BASE_URL : 'http://localhost:5001';
            logoUrl = `${baseUrl}${logoUrl.startsWith('/') ? '' : '/'}${logoUrl}`;
        }
        logoHtml = `<img src="${logoUrl}" style="max-height: 55px; max-width: 100px; object-fit: contain;" />`;
    } else {
        const logoText = isUniqueLab ? "ULI" : "UE";
        logoHtml = `<div style="font-family:Arial, sans-serif; font-size:45px; font-weight:900; color:#007bff; line-height:1; letter-spacing:-2px; border:3px solid #007bff; display:inline-block; padding:0px 6px; border-radius:5px;">${logoText}</div>`;
    }

    const b = invoiceForm.buyerDetails;
    const s = invoiceForm.shipToDetails;

    const formatNum = (num) => {
        return Number(num).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const numberToWords = (amount) => {
        const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
        const b = ['', '', 'Twenty ', 'Thirty ', 'Forty ', 'Fifty ', 'Sixty ', 'Seventy ', 'Eighty ', 'Ninety '];
        const inWords = (num) => {
            if ((num = num.toString()).length > 9) return 'overflow';
            let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
            if (!n) return '';
            let str = '';
            str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + a[n[1][1]]) + 'Crore ' : '';
            str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + a[n[2][1]]) + 'Lakh ' : '';
            str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + a[n[3][1]]) + 'Thousand ' : '';
            str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + a[n[4][1]]) + 'Hundred ' : '';
            str += (n[5] != 0) ? (a[Number(n[5])] || b[n[5][0]] + a[n[5][1]]) : '';
            return str.trim();
        };
        const rounded = Math.round(amount);
        return "INR " + (inWords(rounded) || "Zero").replace(/  /g, " ") + " Only";
    };

    let itemsHtml = '';
    let totalAmount = 0;
    let totalQty = 0;
    
    const shouldIncludeDates = invoiceForm.includeDates !== false;

    entries.forEach((entry, i) => {
        const conf = invoiceForm.entryConfigs?.[entry._id] || {};
        const qty = conf.qty !== undefined ? conf.qty : 1;
        const rate = conf.rate || 0;
        const amt = qty * rate;
        totalAmount += amt;
        totalQty += qty;
        
        const entryDate = entry.scheduleDate ? new Date(entry.scheduleDate).toLocaleDateString('en-GB') : '';
        const siteName = entry.site?.siteName || '';
        
        const instrumentTitle = conf.instrument || 'Total Station';
        let desc = "<b>Hire Charges for " + instrumentTitle + "</b><br/>";
        desc += "<div style=\"font-size:10px; font-style:italic; margin-top: 4px; line-height: 1.4; font-weight: normal;\">";
        if (siteName) desc += "SURVEY WORK AT " + siteName.toUpperCase() + "<br/>";
        
        // Main Site Ledger Name
        const mainLedgerName = conf.ledgerName || conf.ledger || entry.ledger || entry.scheduleType || '';
        if (mainLedgerName) desc += mainLedgerName.toUpperCase() + "<br/>";
        if (conf.extraDescription) desc += conf.extraDescription.toUpperCase() + "<br/>";
        
        if (shouldIncludeDates && entryDate) {
            desc += "DATE : " + entryDate;
        }
        desc += "</div>";

        const hsnSacCode = conf.hsnSac || entry.hsnSac || '';
        const perShortName = conf.shortName || '';
        
        itemsHtml += "<tr style=\"vertical-align:top;\">";
        itemsHtml += "<td style=\"padding:4px; border-right:1px solid #000; text-align:center;\">" + (i + 1) + "</td>";
        itemsHtml += "<td style=\"padding:4px; text-align:left; border-right:1px solid #000;\">" + desc + "</td>";
        itemsHtml += "<td style=\"padding:4px; border-right:1px solid #000; text-align:left;\">" + hsnSacCode + "</td>";
        itemsHtml += "<td style=\"padding:4px; border-right:1px solid #000; text-align:center;\"><b>" + qty.toFixed(1) + "</b></td>";
        itemsHtml += "<td style=\"padding:4px; border-right:1px solid #000; text-align:right;\">" + formatNum(rate) + "</td>";
        itemsHtml += "<td style=\"padding:4px; border-right:1px solid #000; text-align:left;\">" + perShortName + "</td>";
        itemsHtml += "<td style=\"padding:4px; text-align:right;\"><b>" + formatNum(amt) + "</b></td>";
        itemsHtml += "</tr>";
    });
    
    const gstType = invoiceForm.gstType || 'CGST_SGST';
    const gstPercentage = invoiceForm.gstPercentage || 18;
    
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    
    if (gstType === 'IGST') {
        igst = totalAmount * (gstPercentage / 100);
    } else {
        cgst = totalAmount * (gstPercentage / 2 / 100);
        sgst = totalAmount * (gstPercentage / 2 / 100);
    }
    const totalTax = cgst + sgst + igst;
    const grandTotal = totalAmount + totalTax;
    
    // Add empty padding row to push taxes to the bottom, shrinking dynamically to fit 1 page cleanly
    let spacerHeight = Math.max(10, 150 - (entries.length * 30));
    itemsHtml += "<tr style=\"height: " + spacerHeight + "px; vertical-align: bottom;\">";
    itemsHtml += "<td style=\"border-right:1px solid #000;\"></td>";
    if (gstType === 'IGST') {
        itemsHtml += "<td style=\"padding:4px 10px; border-right:1px solid #000; text-align:right;\"><b><i>IGST " + gstPercentage + "%</i></b></td>";
        itemsHtml += "<td style=\"border-right:1px solid #000;\"></td>";
        itemsHtml += "<td style=\"border-right:1px solid #000;\"></td>";
        itemsHtml += "<td style=\"border-right:1px solid #000;\"></td>";
        itemsHtml += "<td style=\"border-right:1px solid #000;\"></td>";
        itemsHtml += "<td style=\"padding:4px; text-align:right;\"><b>" + formatNum(igst) + "</b></td>";
    } else {
        const halfPct = gstPercentage / 2;
        itemsHtml += "<td style=\"padding:4px 10px; border-right:1px solid #000; text-align:right;\"><b><i>CGST " + halfPct + "%</i></b><br/><b><i>SGST " + halfPct + "%</i></b></td>";
        itemsHtml += "<td style=\"border-right:1px solid #000;\"></td>";
        itemsHtml += "<td style=\"border-right:1px solid #000;\"></td>";
        itemsHtml += "<td style=\"border-right:1px solid #000;\"></td>";
        itemsHtml += "<td style=\"border-right:1px solid #000;\"></td>";
        itemsHtml += "<td style=\"padding:4px; text-align:right;\"><b>" + formatNum(cgst) + "</b><br/><b>" + formatNum(sgst) + "</b></td>";
    }
    itemsHtml += "</tr>";

    let html = "<!DOCTYPE html>\n<html>\n<head>\n<meta charset=\"utf-8\">\n<style>\n";
    html += "@page { size: A4 portrait; margin: 5mm 8mm; }\n";
    html += "@media print { html, body { width: 100%; margin: 0; padding: 0; -webkit-print-color-adjust: exact; } .container { page-break-inside: avoid; break-inside: avoid; } }\n";
    html += "body { font-family: Arial, sans-serif; font-size: 10px; margin: 0; padding: 8px 12px; color: #000; box-sizing: border-box; }\n";
    html += "table { border-collapse: collapse; }\n";
    html += "td, th { vertical-align: top; }\n";
    html += ".container { width: 100%; border: 1px solid #000; }\n";
    html += ".header-title { text-align: center; font-size: 13px; font-weight: bold; padding: 2px; }\n";
    html += "</style>\n</head>\n<body>\n";
    
    html += "<div class=\"header-title\">" + invoiceTitle + "</div>\n";
    html += "<div class=\"container\">\n";
    
    // TOP SECTION: Left (Company/Buyer) and Right (Details)
    html += "<table style=\"width: 100%; border-bottom: 1px solid #000;\">\n<tr>\n";
    
    // LEFT COLUMN
    html += "<td style=\"width: 50%; padding: 0; border-right: 1px solid #000;\">\n";
    // Company
    html += "<div style=\"padding: 4px; border-bottom: 1px solid #000; min-height: 100px;\">\n";
    html += "<table style=\"width:100%;\">\n<tr>\n";
    html += "<td style=\"width:105px; vertical-align:top; text-align:center;\">\n";
    html += logoHtml + "\n";
    html += "</td>\n<td>\n";
    html += "<b>" + companyName + "</b><br/>\n";
    html += companyAddress + "<br/>\n";
    html += "UDYAM : " + udyam + "<br/>\n";
    html += "GSTIN/UIN: <b>" + companyGST + "</b><br/>\n";
    html += "State Name : Gujarat, Code : 24<br/>\n";
    html += "Contact : " + companyContact + "<br/>\n";
    html += "E-Mail : " + companyEmail + "\n";
    html += "</td>\n</tr>\n</table>\n</div>\n";
    
    // Consignee
    html += "<div style=\"padding: 4px; border-bottom: 1px solid #000;\">\n";
    html += "Consignee (Ship to)<br/>\n";
    html += "<b>" + (s.name || "NA").toUpperCase() + "</b><br/>\n";
    html += (s.address || "NA").toUpperCase() + "<br/>\n";
    html += "<table style=\"width:100%; font-size:11px;\">\n";
    html += "<tr><td style=\"width:90px;\">GSTIN/UIN</td><td>: <b>" + s.gstin + "</b></td></tr>\n";
    html += "<tr><td>State Name</td><td>: " + s.stateName + ", Code : " + s.stateCode + "</td></tr>\n";
    html += "<tr><td>Contact person</td><td>: " + s.contactPerson + "</td></tr>\n";
    html += "<tr><td>Contact</td><td>: " + s.contact + "</td></tr>\n";
    html += "</table>\n</div>\n";
    
    // Buyer
    html += "<div style=\"padding: 4px;\">\n";
    html += "Buyer (Bill to)<br/>\n";
    html += "<b>" + (b.name || "NA").toUpperCase() + "</b><br/>\n";
    html += (b.address || "NA").toUpperCase() + "<br/>\n";
    html += "<table style=\"width:100%; font-size:11px;\">\n";
    html += "<tr><td style=\"width:90px;\">GSTIN/UIN</td><td>: <b>" + b.gstin + "</b></td></tr>\n";
    html += "<tr><td>State Name</td><td>: " + b.stateName + ", Code : " + b.stateCode + "</td></tr>\n";
    html += "<tr><td>Contact person</td><td>: " + b.contactPerson + "</td></tr>\n";
    html += "<tr><td>Contact</td><td>: " + b.contact + "</td></tr>\n";
    html += "</table>\n</div>\n";
    
    html += "</td>\n"; // End Left Column
    
    // RIGHT COLUMN
    html += "<td style=\"width: 50%; padding: 0;\">\n";
    html += "<table style=\"width: 100%;\">\n";
    html += "<tr>\n<td style=\"width: 50%; border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px;\">Invoice No.<br/><b>" + invoiceNo + "</b></td>\n";
    html += "<td style=\"width: 50%; border-bottom: 1px solid #000; padding: 4px;\">Dated<br/><b>" + dateStr + "</b></td>\n</tr>\n";
    
    html += "<tr>\n<td style=\"border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px;\">Delivery Note</td>\n";
    html += "<td style=\"border-bottom: 1px solid #000; padding: 4px;\">Mode/Terms of Payment</td>\n</tr>\n";
    
    html += "<tr>\n<td style=\"border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px;\">Reference No. and Date<br/><b>" + (invoiceNo ? invoiceNo + " dt. " + dateStr : "dt. " + dateStr) + "</b></td>\n";
    html += "<td style=\"border-bottom: 1px solid #000; padding: 4px;\">Other References</td>\n</tr>\n";
    
    html += "<tr>\n<td style=\"border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px;\">Buyer's Order No.</td>\n";
    html += "<td style=\"border-bottom: 1px solid #000; padding: 4px;\">Dated</td>\n</tr>\n";
    
    html += "<tr>\n<td style=\"border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px;\">Dispatch Doc No.</td>\n";
    html += "<td style=\"border-bottom: 1px solid #000; padding: 4px;\">Delivery Note Date</td>\n</tr>\n";
    
    html += "<tr>\n<td style=\"border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px;\">Dispatched through</td>\n";
    html += "<td style=\"border-bottom: 1px solid #000; padding: 4px;\">Destination</td>\n</tr>\n";
    html += "</table>\n";
    
    html += "<div style=\"padding: 4px;\">\nTerms of Delivery\n</div>\n";
    html += "</td>\n"; // End Right Column
    
    html += "</tr>\n</table>\n";
    
    // ITEMS TABLE
    html += "<table style=\"width: 100%; border-bottom: 1px solid #000;\">\n";
    html += "<tr style=\"border-bottom: 1px solid #000; text-align:center;\">\n";
    html += "<td style=\"border-right: 1px solid #000; padding: 4px; width: 4%;\">Sl<br/>No.</td>\n";
    html += "<td style=\"border-right: 1px solid #000; padding: 4px; width: 44%;\">Description of Goods</td>\n";
    html += "<td style=\"border-right: 1px solid #000; padding: 4px; width: 8%;\">HSN/SAC</td>\n";
    html += "<td style=\"border-right: 1px solid #000; padding: 4px; width: 10%;\">Quantity</td>\n";
    html += "<td style=\"border-right: 1px solid #000; padding: 4px; width: 10%;\">Rate</td>\n";
    html += "<td style=\"border-right: 1px solid #000; padding: 4px; width: 4%;\">per</td>\n";
    html += "<td style=\"padding: 4px; width: 14%;\">Amount</td>\n";
    html += "</tr>\n";
    html += itemsHtml;
    
    // Total Row
    html += "<tr style=\"border-top: 1px solid #000; text-align: right;\">\n";
    html += "<td colspan=\"3\" style=\"padding: 4px; border-right: 1px solid #000;\">Total</td>\n";
    html += "<td style=\"padding: 4px; border-right: 1px solid #000; text-align: center;\"><b>" + totalQty.toFixed(1) + " Days</b></td>\n";
    html += "<td style=\"padding: 4px; border-right: 1px solid #000;\"></td>\n";
    html += "<td style=\"padding: 4px; border-right: 1px solid #000;\"></td>\n";
    html += "<td style=\"padding: 4px;\"><b>₹ " + formatNum(grandTotal) + "</b></td>\n";
    html += "</tr>\n</table>\n";
    
    // Amount Chargeable
    html += "<div style=\"padding: 4px; border-bottom: 1px solid #000;\">\n";
    html += "<div style=\"float: right; font-style: italic; font-size: 10px;\">E. & O.E</div>\n";
    html += "Amount Chargeable (in words)<br/>\n";
    html += "<b>" + numberToWords(grandTotal) + "</b>\n</div>\n";
    
    // Tax Breakdown Table
    html += "<table style=\"width: 100%; border-bottom: 1px solid #000; text-align: center;\">\n";
    html += "<tr style=\"border-bottom: 1px solid #000;\">\n";
    html += "<td rowspan=\"2\" style=\"border-right: 1px solid #000; padding: 2px;\">HSN/SAC</td>\n";
    html += "<td rowspan=\"2\" style=\"border-right: 1px solid #000; padding: 2px;\">Taxable<br/>Value</td>\n";
    if (gstType === 'IGST') {
        html += "<td colspan=\"2\" style=\"border-right: 1px solid #000; padding: 2px; border-bottom: 1px solid #000;\">IGST</td>\n";
    } else {
        html += "<td colspan=\"2\" style=\"border-right: 1px solid #000; padding: 2px; border-bottom: 1px solid #000;\">CGST</td>\n";
        html += "<td colspan=\"2\" style=\"border-right: 1px solid #000; padding: 2px; border-bottom: 1px solid #000;\">SGST/UTGST</td>\n";
    }
    html += "<td rowspan=\"2\" style=\"padding: 2px;\">Total<br/>Tax Amount</td>\n";
    html += "</tr>\n";
    html += "<tr style=\"border-bottom: 1px solid #000;\">\n";
    if (gstType === 'IGST') {
        html += "<td style=\"border-right: 1px solid #000; padding: 2px;\">Rate</td>\n";
        html += "<td style=\"border-right: 1px solid #000; padding: 2px;\">Amount</td>\n";
    } else {
        html += "<td style=\"border-right: 1px solid #000; padding: 2px;\">Rate</td>\n";
        html += "<td style=\"border-right: 1px solid #000; padding: 2px;\">Amount</td>\n";
        html += "<td style=\"border-right: 1px solid #000; padding: 2px;\">Rate</td>\n";
        html += "<td style=\"border-right: 1px solid #000; padding: 2px;\">Amount</td>\n";
    }
    html += "</tr>\n";
    
    html += "<tr style=\"border-bottom: 1px solid #000;\">\n";
    html += "<td style=\"border-right: 1px solid #000; padding: 2px; text-align: left;\">9983</td>\n";
    html += "<td style=\"border-right: 1px solid #000; padding: 2px; text-align: right;\">" + formatNum(totalAmount) + "</td>\n";
    if (gstType === 'IGST') {
        html += "<td style=\"border-right: 1px solid #000; padding: 2px;\">" + gstPercentage + "%</td>\n";
        html += "<td style=\"border-right: 1px solid #000; padding: 2px; text-align: right;\">" + formatNum(igst) + "</td>\n";
    } else {
        const halfPct = gstPercentage / 2;
        html += "<td style=\"border-right: 1px solid #000; padding: 2px;\">" + halfPct + "%</td>\n";
        html += "<td style=\"border-right: 1px solid #000; padding: 2px; text-align: right;\">" + formatNum(cgst) + "</td>\n";
        html += "<td style=\"border-right: 1px solid #000; padding: 2px;\">" + halfPct + "%</td>\n";
        html += "<td style=\"border-right: 1px solid #000; padding: 2px; text-align: right;\">" + formatNum(sgst) + "</td>\n";
    }
    html += "<td style=\"padding: 2px; text-align: right;\">" + formatNum(totalTax) + "</td>\n";
    html += "</tr>\n";
    
    html += "<tr>\n";
    html += "<td style=\"border-right: 1px solid #000; padding: 2px; text-align: right;\"><b>Total</b></td>\n";
    html += "<td style=\"border-right: 1px solid #000; padding: 2px; text-align: right;\"><b>" + formatNum(totalAmount) + "</b></td>\n";
    if (gstType === 'IGST') {
        html += "<td style=\"border-right: 1px solid #000; padding: 2px;\"></td>\n";
        html += "<td style=\"border-right: 1px solid #000; padding: 2px; text-align: right;\"><b>" + formatNum(igst) + "</b></td>\n";
    } else {
        html += "<td style=\"border-right: 1px solid #000; padding: 2px;\"></td>\n";
        html += "<td style=\"border-right: 1px solid #000; padding: 2px; text-align: right;\"><b>" + formatNum(cgst) + "</b></td>\n";
        html += "<td style=\"border-right: 1px solid #000; padding: 2px;\"></td>\n";
        html += "<td style=\"border-right: 1px solid #000; padding: 2px; text-align: right;\"><b>" + formatNum(sgst) + "</b></td>\n";
    }
    html += "<td style=\"padding: 2px; text-align: right;\"><b>" + formatNum(totalTax) + "</b></td>\n";
    html += "</tr>\n</table>\n";
    
    html += "<div style=\"padding: 4px; border-bottom: 1px solid #000;\">\n";
    html += "Tax Amount (in words) : <b>" + numberToWords(totalTax) + "</b>\n</div>\n";
    
    // Declaration & Signatures
    html += "<table style=\"width: 100%;\">\n<tr>\n";
    html += "<td style=\"width: 50%; border-right: 1px solid #000; padding: 0; vertical-align: top;\">\n";
    html += "<div style=\"padding: 4px; display: flex;\">\n";
    html += "<div style=\"width: 120px;\">Company's PAN</div>\n";
    html += "<div>: <b>" + pan + "</b></div>\n</div>\n";
    html += "<div style=\"padding: 4px; margin-top: 5px;\">\n";
    html += "<u style=\"font-size: 10px;\">Declaration</u><br/>\n";
    html += "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.\n";
    html += "</div>\n</td>\n";
    
    html += "<td style=\"width: 50%; padding: 0; vertical-align: top;\">\n";
    html += "<div style=\"padding: 4px; padding-left: 40px;\">\n";
    html += "<div style=\"margin-bottom: 2px;\">Company's Bank Details</div>\n";
    html += "<table style=\"width: 100%;\">\n";
    html += "<tr><td style=\"width: 130px;\">A/c Holder's Name</td><td>: <b>" + acHolder + "</b></td></tr>\n";
    html += "<tr><td>Bank Name</td><td>: <b>" + bankName + "</b></td></tr>\n";
    html += "<tr><td>A/c No.</td><td>: <b>" + acNo + "</b></td></tr>\n";
    html += "<tr><td>Branch & IFS Code</td><td>: <b>" + ifsc + "</b></td></tr>\n";
    html += "</table>\n</div>\n";
    
    let stampHtml = '<br/><br/><br/>';
    const stampPath = cd.companyStamp || cd.stampLogo || cd.stamp;
    if (stampPath) {
        let stampUrl = stampPath;
        if (!stampUrl.startsWith('http://') && !stampUrl.startsWith('https://')) {
            const baseUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ? import.meta.env.VITE_API_BASE_URL : 'http://localhost:5001';
            stampUrl = `${baseUrl}${stampUrl.startsWith('/') ? '' : '/'}${stampUrl}`;
        }
        stampHtml = `<div style="text-align:right; margin: 2px 0;"><img src="${stampUrl}" style="max-height: 55px; max-width: 130px; object-fit: contain; display: inline-block;" /></div>`;
    }

    html += "<div style=\"text-align: right; padding: 4px; margin-top: 4px; border-top: 1px solid #ccc;\">\n";
    html += "<b>for " + companyName + "</b><br/>" + stampHtml + "\nAuthorised Signatory\n";
    html += "</div>\n</td>\n</tr>\n</table>\n";
    
    html += "</div>\n"; // End container
    
    html += "<div style=\"text-align:center; padding:5px; font-size:10px;\">\n";
    html += "SUBJECT TO AHMEDABAD JURISDICTION<br/>\nThis is a Computer Generated Invoice\n</div>\n";
    
    html += "</body>\n</html>";
    
    return html;
};
