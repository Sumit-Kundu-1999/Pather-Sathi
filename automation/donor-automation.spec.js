const { test, expect } = require('@playwright/test');
const xlsx = require('xlsx');
const path = require('path');

function getDonorDataFromExcel() {
    const filePath = path.join(__dirname, 'Donor_excel_format.xlsx');
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Get the first sheet
    const sheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON array
    const rawData = xlsx.utils.sheet_to_json(sheet);
    const value = rawData.map(row => ({
        donorName: row['Name'],
        amount: row['Donation'],
        collectedBy: row['Collected'],
        year: row['Year'],
        address: row['Address'],
        phoneNumer: row['Phone'],
    })).filter(row => row.donorName);

    // Map it to ensure we only grab your 3 specific columns
    // Make sure the strings match your EXACT Excel column headers (case-sensitive)
    console.log('Excel Value ', value);
    return value
}

test('Inject data from Excel to Mongo DB', async ({ request }) => {
    const donorData = getDonorDataFromExcel();
    for (const donor of donorData) {
        const response = await request.post('http://localhost:3000/donors/donor/details', {
            // The 'data' object becomes your req.body in Node.js/Express
            data: {
                name: donor.donorName,
                amount: donor.amount,
                adminName: donor.collectedBy ?? 'NA',
                year: donor.year,
                address: donor.address ?? 'NA',
                phone: donor.phoneNumer ?? 'NA'
            }
        });
        expect(response.ok()).toBeTruthy();
    }
})
