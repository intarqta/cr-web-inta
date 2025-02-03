import React from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from "xlsx";
import { Button } from 'react-bootstrap';

const ExcelExport = ({ data, fileName }) => {
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {type: 'application/octet-stream'});
    saveAs(blob, `${fileName}.xlsx`);
  };

  return (
    <Button style={{width:'100%', padding:'0px',fontWeight:'bold',color:'#69bef1', background:'#0000', borderColor:'#0000'}} onClick={exportToExcel}>Descargar datos</Button>
  );
}

export default ExcelExport;