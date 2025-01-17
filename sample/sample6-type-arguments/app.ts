import { plainToInstance, Transform } from '../../src';

interface CSVInvoiceRecord {
  net: string;
}

class Invoice {
  @Transform<CSVInvoiceRecord, 'net', number>(({ value }) => Number(value.replace(',', '')))
  net: number;
}

const rawInvoice: CSVInvoiceRecord = {
  net: '2,000',
};

const invoice = plainToInstance(Invoice, rawInvoice);
console.log(invoice);
