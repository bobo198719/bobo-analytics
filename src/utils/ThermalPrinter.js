/**
 * BOBO SaaS Touch POS - Native Hardware Bridge
 * Connects directly to ESC/POS Thermal Printers via Web Serial API
 */

export class ThermalPrinter {
    constructor() {
        this.port = null;
        this.writer = null;
    }

    async connect() {
        if (!('serial' in navigator)) {
            throw new Error("Web Serial API not supported in this browser. Please use Chrome or Edge.");
        }

        try {
            // Filter specifically for printers if possible, or let user pick COM port
            this.port = await navigator.serial.requestPort();
            await this.port.open({ baudRate: 9600 });
            
            const textEncoder = new TextEncoderStream();
            const writableStreamClosed = textEncoder.readable.pipeTo(this.port.writable);
            this.writer = textEncoder.writable.getWriter();
            
            console.log("[HARDWARE] Thermal Printer Connected Successfully");
            return true;
        } catch (err) {
            console.error("[HARDWARE] Connection Failed:", err);
            return false;
        }
    }

    async printReceipt(orderData) {
        if (!this.writer) {
            throw new Error("Printer not connected.");
        }

        try {
            // ESC/POS Commands
            const ESC = '\x1B';
            const GS = '\x1D';
            
            const init = ESC + '@'; // Initialize printer
            const center = ESC + 'a1'; // Center align
            const left = ESC + 'a0'; // Left align
            const boldOn = ESC + 'E1';
            const boldOff = ESC + 'E0';
            const cut = GS + 'V1'; // Cut paper

            let receipt = '';
            
            // Header
            receipt += init + center + boldOn;
            receipt += "BOBO TOUCH CRM\n";
            receipt += "--------------------------\n";
            receipt += boldOff;
            receipt += `Order ID: ${orderData.orderId}\n`;
            receipt += `Table: ${orderData.table}\n`;
            receipt += `Date: ${new Date().toLocaleString()}\n`;
            receipt += "--------------------------\n";
            
            // Items
            receipt += left;
            orderData.items.forEach(item => {
                receipt += `${item.name.substring(0, 16).padEnd(16)} x${item.quantity}  ₹${(item.price * item.quantity).toFixed(2)}\n`;
            });
            
            receipt += center;
            receipt += "--------------------------\n";
            
            // Totals
            receipt += left + boldOn;
            receipt += `Subtotal:      ₹${orderData.subtotal.toFixed(2)}\n`;
            receipt += `Tax (5%):      ₹${orderData.tax.toFixed(2)}\n`;
            receipt += `TOTAL:         ₹${orderData.total.toFixed(2)}\n`;
            receipt += boldOff + center;
            receipt += "--------------------------\n";
            receipt += "Powered by Bobo Solutions\n\n\n\n\n";
            
            // Cut receipt
            receipt += cut;

            // Send to printer
            await this.writer.write(receipt);
            console.log("[HARDWARE] Receipt printed to matrix");
            return true;

        } catch (err) {
            console.error("[HARDWARE] Print Failed:", err);
            return false;
        }
    }

    async disconnect() {
        if (this.writer) {
            await this.writer.releaseLock();
        }
        if (this.port) {
            await this.port.close();
        }
    }
}
