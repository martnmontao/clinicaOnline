import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { variable64 } from "../perfil/logo";

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

type Product = {
  nombre: string;
  cantidad: number;
  total: number;
};

const generatePDF = (
  products: Product[],
  reciboNo: string,
  fecha: string
) => {

  const tableBody = [
    [
      { text: "Nombre producto", style: "tableHeader" },
      { text: "Cantidad", style: "tableHeader" },
      { text: "Total", style: "tableHeader" },
    ],
    ...products.map((product) => [
      product.nombre,
      product.cantidad.toString(),
      `$ ${product.total}`,
    ]),
  ];


  const totalGeneral = products.reduce((sum, product) => sum + product.total, 0);


  const content: any[] = [];


  content.push({
    columns: [
      { image: variable64.miVar, width: 50 },
      {
        stack: [
          { text: `Recibo No. ${reciboNo}`, style: "header" },
          { text: `Fecha: ${fecha}`, style: "subheader" },
        ],
        alignment: "right",
      },
    ],
  });


  content.push({
    qr: 'https://www.youtube.com/@vilcadev',
    fit: 100,
    alignment: "right",
    margin: [0, 10, 0, 10],
  });


  content.push({ text: "\n" });


  content.push({
    table: {
      headerRows: 1,
      widths: ["*", "*", "*"],
      body: tableBody,
    },
    layout: "lightHorizontalLines",
    margin: [0, 10, 0, 10],
  });


  content.push({
    columns: [
      { text: "", width: "*" },
      {
        text: `Total: $ ${totalGeneral}`,
        style: "total",
        alignment: "right",
        margin: [0, 10, 0, 10],
      },
    ],
  });


  const styles = {
    header: {
      fontSize: 14,
      bold: true,
    },
    subheader: {
      fontSize: 12,
      margin: [0, 5, 0, 5],
    },
    tableHeader: {
      bold: true,
      fontSize: 12,
      color: "black",
    },
    total: {
      fontSize: 12,
      bold: true,
    },
  };


  const docDefinition: any = {
    content,
    styles,
  };

  pdfMake.createPdf(docDefinition).open();
};

export default generatePDF;