import React from 'react';

const UploadExcel = () => {
    return (
        <div className="upload-excel">
            <h2>Upload Excel File</h2>
            <input type="file" accept=".xlsx, .xls" />
            <button>Upload</button>
        </div>
    );
};

export default UploadExcel;
