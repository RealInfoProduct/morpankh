import { CommonModule, DatePipe, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { FirebaseService } from 'src/app/services/firebase.service';
import { LoaderService } from 'src/app/services/loader.service';
declare var html2pdf: any; // for CDN script
@Component({
  selector: 'app-invoicedownload',
  templateUrl: './invoicedownload.component.html',
  styleUrls: ['./invoicedownload.component.scss'],
  standalone: true,
  imports: [MaterialModule, FormsModule, NgIf, RouterModule, CommonModule],
  providers: [DatePipe]
})
export class InvoicedownloadComponent {
  invoiceId: string | null;
  invoiceDetail: any;
  purchaseList: any[] = [];
  filteredPurchaseList: any[] = [];
  productList: any[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private firebaseService: FirebaseService,
    private loaderService: LoaderService
  ) {
    this.invoiceId = this.activatedRoute.snapshot.paramMap.get('id'); // Now this is invoiceId
    this.getProductList();
  }

  getProductList() {
    this.firebaseService.getAllProduct().subscribe((products: any[]) => {
      this.productList = products || [];
      this.getPurchaseList();
    });
  }

  getPurchaseList() {
    this.loaderService.setLoader(true);
    this.firebaseService.getAllPurchase().subscribe((res: any[]) => {
      if (res) {
        const invoiceId = this.invoiceId;

        // Filter by invoiceId instead of id
        this.purchaseList = res.filter((item: any) => item.id === invoiceId);
        if (this.purchaseList.length > 0) {
          this.filteredPurchaseList = [...this.purchaseList];
  
          const invoice = this.purchaseList[0];
  
          if (invoice) {
            this.invoiceDetail = {
              id: invoice.invoiceNo,
              billFrom: invoice.firmName,
              billFromEmail: invoice.firmAddress,
              billFromAddress: '',
              billFromPhone: '',
              billTo: invoice.customerName,
              billToEmail: '',
              billToAddress: '',
              billToPhone: invoice.customerNumber,
              orders: [],
              orderDate: new Date(invoice.invoiceDate?.seconds * 1000),
              totalCost: this.productsubTotal,
              vat: 10,
              grandTotal: this.productgrandTotal,
              status: invoice.invoiceStatus,
            };
          }
        } else {
          window.alert('invoice not found')          
        }
        this.loaderService.setLoader(false);  
      }
    });
  }

  getProductName(productid: string): string {
    return this.productList.find(p => p.id === productid)?.productName || productid;
  }

  get productsubTotal(): number {
    const total = this.filteredPurchaseList.reduce((total: number, row: any) =>
      total + (row.shellAmount || 0), 0);
    return Math.round(total * 100) / 100;
  }

  get totalDiscount(): number {
    const total = this.filteredPurchaseList.reduce((total: number, row: any) => {
      const discountPercent = row.shellDiscount || 0;
      return total + ((discountPercent / 100) * row.shellAmount);
    }, 0);
    return Math.round(total * 100) / 100;
  }

  get productgrandTotal(): number {
    const total = this.filteredPurchaseList.reduce((total: number, row: any) => {
      const discountPercent = row.shellDiscount || 0;
      const discountAmount = (discountPercent / 100) * row.shellAmount;
      return total + (row.shellAmount - discountAmount);
    }, 0);
    return Math.round(total * 100) / 100;
  }


  sendWhatsAppWithPDF() {
    const element = document.getElementById('invoiceToPDF');
    if (!element || !this.invoiceDetail?.billToPhone) return;

    const options = {
      margin: 10,
      filename: `invoice-${this.invoiceDetail.id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(options).outputPdf('blob').then((pdfBlob: Blob) => {
      const phone = this.invoiceDetail.billToPhone.toString();
      const message = encodeURIComponent("Hello, please find your invoice attached.");
      const whatsappLink = `https://wa.me/${phone}?text=${message}`;
      window.open(whatsappLink, '_blank');
    });
  }

  viewPDF() {
    const element = document.getElementById('invoiceToPDF');
    const viewPdfButton = document.getElementById('viewPdfButton') as HTMLElement;  // Get the button element

    if (!element) return;

    // Hide the button
    if (viewPdfButton) {
      viewPdfButton.style.display = 'none';
    }

    const options = {
      margin: 10,
      filename: 'invoice.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(options).outputPdf('blob').then((pdfBlob: Blob) => {
      const fileURL = URL.createObjectURL(pdfBlob);
      window.open(fileURL);
      viewPdfButton.style.display = 'block';

    });
  }
}
