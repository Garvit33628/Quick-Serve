import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaPrint, FaTimes } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const Invoice = ({ orderInfo, setShowInvoice }) => {
    const invoiceRef = useRef(null);
    const customerData = useSelector((state) => state.customer);

    if (!orderInfo) return null;

    const customerName = orderInfo.customerDetails?.name || customerData?.customerName || "Customer";
    const customerPhone = orderInfo.customerDetails?.phone || customerData?.customerPhone || "N/A";
    const guests = orderInfo.customerDetails?.guests || customerData?.guests || 1;
    const items = orderInfo.items || [];
    const subtotal = orderInfo.bills?.total ? Number(orderInfo.bills.total).toFixed(2) : "0.00";
    const tax = orderInfo.bills?.tax ? Number(orderInfo.bills.tax).toFixed(2) : "0.00";
    const grandTotal = orderInfo.bills?.totalWithTax ? Number(orderInfo.bills.totalWithTax).toFixed(2) : "0.00";
    const orderTime = orderInfo.orderDate || orderInfo.createdAt || Date.now();
    
    const formattedDate = new Date(orderTime).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    const formattedTime = new Date(orderTime).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    const invoiceNo = orderInfo.invoiceNumber || `INV-${Math.floor(new Date(orderTime).getTime() / 1000)}`;


    const getTableNo = () => {
        if (orderInfo.table && typeof orderInfo.table === 'object' && orderInfo.table.tableNo) {
            return orderInfo.table.tableNo;
        }
        if (customerData?.table?.tableNo) return customerData.table.tableNo;
        if (customerData?.table?.name) return customerData.table.name;
        if (typeof orderInfo.table === 'string' && orderInfo.table.length === 24) return "1";
        return orderInfo.table || "1";
    };

    const tableNo = getTableNo();

    const renderBarcodeSVG = (text) => {
        const pattern = [2, 1, 3, 1, 1, 2, 4, 1, 1, 3, 2, 1, 1, 1, 3, 2, 1, 4, 1, 2, 2, 1, 3, 1, 2, 3, 1, 1, 4, 1, 1, 2, 3, 2];
        const bars = [];
        let curX = 10;

        for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i);
            const w1 = (pattern[i % pattern.length] % 3) + 1;
            const gap = ((charCode * 3) % 3) + 1;
            const w2 = ((charCode * 7) % 3) + 1;

            bars.push({ x: curX, w: w1 });
            curX += w1 + gap;
            bars.push({ x: curX, w: w2 });
            curX += w2 + 2;
        }

        return (
            <div className="flex flex-col items-center mt-2">
                <svg width="220" height="38" viewBox="0 0 220 38" className="overflow-visible">
                    {bars.map((b, idx) => (
                        <rect key={idx} x={b.x} y="0" width={b.w} height="34" fill="black" />
                    ))}
                </svg>
                <span className="font-mono text-[9px] tracking-widest text-gray-800 uppercase mt-0.5">
                    *{text}*
                </span>
            </div>
        );
    };

    const handlePrint = () => {
        if (!invoiceRef.current) return;
        const printContent = invoiceRef.current.innerHTML;
        const WinPrint = window.open("", "", "width=420,height=750");

        WinPrint.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
            <title>Receipt - ${invoiceNo}</title>
            <style>
                @page {
                    size: 80mm auto;
                    margin: 0;
                }
                body {
                    font-family: 'Courier New', Courier, monospace;
                    background-color: #ffffff;
                    color: #000000;
                    margin: 0;
                    padding: 8px;
                    width: 270px;
                    font-size: 11px;
                    line-height: 1.2;
                }
                .receipt {
                    width: 100%;
                }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .text-left { text-align: left; }
                .font-bold { font-weight: bold; }
                .border-dashed {
                    border-top: 1px dashed #000;
                    margin: 5px 0;
                }
                .border-double {
                    border-top: 2px dashed #000;
                    margin: 5px 0;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 11px;
                }
                th, td {
                    padding: 2px 0;
                }
                svg { display: block; margin: 0 auto; }
            </style>
            </head>
            <body>
            <div class="receipt">
            ${printContent}
            </div>
            </body>
            </html>`);

        WinPrint.document.close();
        WinPrint.focus();
        setTimeout(() => {
            WinPrint.print();
            WinPrint.close();
        }, 500);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50 p-4">
            <div className="bg-[#181818] border border-gray-800 rounded-2xl shadow-2xl w-[370px] max-h-[92vh] flex flex-col overflow-hidden text-gray-200">
                
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-800 bg-[#121212]">
                    <div className="flex items-center gap-2">
                        <FaCheckCircle className="text-green-500" size={18} />
                        <h2 className="text-sm font-semibold text-gray-100">Order Completed</h2>
                    </div>
                    <button
                        onClick={() => setShowInvoice(false)}
                        className="text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-gray-800"
                    >
                        <FaTimes size={16} />
                    </button>
                </div>

               
                <div className="flex-1 overflow-y-auto p-5 flex justify-center bg-[#0d0d0d]">
                    <div
                        ref={invoiceRef}
                        className="bg-[#fcfbfa] text-black p-5 rounded-sm shadow-2xl font-mono text-[11px] w-[275px] leading-tight border-t-4 border-b-4 border-dashed border-gray-300 relative"
                        style={{
                            backgroundImage: 'radial-gradient(#000000 0.5px, transparent 0.5px)',
                            backgroundSize: '16px 16px',
                            backgroundColor: '#fffef8'
                        }}
                    >
                      
                        <div className="text-center space-y-0.5">
                            <h1 className="text-base font-extrabold uppercase tracking-wider text-black">QUICK-SERVE POS</h1>
                            <p className="text-[10px] text-gray-700">123 Hospitality Way, Kathmandu</p>
                            <p className="text-[10px] text-gray-700">Tel: +977-9800000000 | VAT: 600123456</p>
                        </div>

                        <div className="border-t border-dashed border-black my-2"></div>
                        <div className="text-center font-bold uppercase text-[11px] tracking-wider">
                            *** TAX INVOICE ***
                        </div>
                        <div className="border-t border-dashed border-black my-2"></div>

                       
                        <div className="space-y-0.5 text-[11px]">
                            <div className="flex justify-between">
                                <span className="text-gray-700">Invoice No:</span>
                                <span className="font-bold">{invoiceNo}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-700">Date/Time:</span>
                                <span>{formattedDate} {formattedTime}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-700">Table:</span>
                                <span className="font-bold">Table {tableNo}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-700">Customer:</span>
                                <span className="font-bold">{customerName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-700">Phone:</span>
                                <span>{customerPhone}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-700">Guests:</span>
                                <span>{guests}</span>
                            </div>
                        </div>

                        <div className="border-t border-dashed border-black my-2"></div>

                    
                        <table className="w-full text-left text-[11px]">
                            <thead>
                                <tr className="border-b border-dashed border-black">
                                    <th className="py-1 text-left font-bold">QTY ITEM</th>
                                    <th className="py-1 text-right font-bold">PRICE</th>
                                    <th className="py-1 text-right font-bold">TOTAL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, idx) => {
                                    const pPerQty = item.pricePerQuantity || (item.price / item.quantity) || 0;
                                    const itemTotal = item.price || (pPerQty * item.quantity);
                                    return (
                                        <tr key={idx} className="align-top">
                                            <td className="py-1 pr-1 font-sans text-[11px] leading-tight max-w-[130px] break-words">
                                                <span className="font-mono font-bold mr-1">{item.quantity}x</span>
                                                {item.name}
                                            </td>
                                            <td className="py-1 text-right font-mono text-[10px]">
                                                {pPerQty.toFixed(2)}
                                            </td>
                                            <td className="py-1 text-right font-mono font-bold">
                                                {itemTotal.toFixed(2)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        <div className="border-t border-dashed border-black my-2"></div>

                       
                        <div className="space-y-1 text-[11px]">
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span className="font-mono">NPR {subtotal}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>VAT (13%):</span>
                                <span className="font-mono">NPR {tax}</span>
                            </div>
                            <div className="border-t border-dashed border-black my-1"></div>
                            <div className="flex justify-between text-xs font-extrabold pt-0.5">
                                <span>GRAND TOTAL:</span>
                                <span className="font-mono text-sm">NPR {grandTotal}</span>
                            </div>
                            <div className="border-t border-dashed border-black my-1"></div>
                            <div className="flex justify-between text-[11px]">
                                <span>Payment Mode:</span>
                                <span className="font-bold uppercase">{orderInfo.paymentMethod || "Cash"}</span>
                            </div>
                            <div className="flex justify-between text-[11px]">
                                <span>Payment Status:</span>
                                <span className="font-bold uppercase text-emerald-700">PAID</span>
                            </div>
                        </div>

                        <div className="border-t border-dashed border-black my-2.5"></div>

                       
                        <div className="text-center space-y-1">
                            <p className="font-bold text-[11px]">*** THANK YOU FOR VISITING ***</p>
                            <p className="text-[10px] text-gray-600">Please Come Again!</p>

                           
                            {renderBarcodeSVG(invoiceNo)}
                        </div>
                    </div>
                </div>

               
                <div className="p-4 border-t border-gray-800 bg-[#121212] flex items-center justify-between gap-3">
                    <button
                        onClick={handlePrint}
                        className="flex-1 bg-[#025cca] hover:bg-[#024aa3] text-white font-semibold text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg"
                    >
                        <FaPrint size={15} /> Print Thermal Receipt
                    </button>
                    <button
                        onClick={() => setShowInvoice(false)}
                        className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-sm py-2.5 px-4 rounded-xl transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Invoice;


