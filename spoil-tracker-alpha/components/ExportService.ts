// ExportService.ts

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { GroceryListItem } from '@/components/GroceryList/GroceryListService';
import { Asset } from 'expo-asset';

/**
 * Exports a list of grocery items as a CSV file.
 * The CSV file is written to the cache directory and then shared.
 * 
 * @param items Array of grocery list items to export.
 */
export async function exportGroceryListToCSV(items: GroceryListItem[]): Promise<void> {
  // Create CSV content with headers
  let csvContent = 'Food Name,Quantity,Measurement,Description,Bought\n';
  items.forEach(item => {
    // Escape commas in text fields if needed
    const foodName = `"${item.food_name}"`;
    const description = `"${item.description}"`;
    csvContent += `${foodName},${item.quantity},${item.measurement},${description},${item.isBought}\n`;
  });

  // Define a file URI in the cache directory
  const fileUri = FileSystem.cacheDirectory + 'grocery_list.csv';

  try {
    // Write the CSV string to a file
    await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: FileSystem.EncodingType.UTF8 });

    // If sharing is available, share the file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    } else {
      alert('Sharing is not available on this platform.');
    }
  } catch (error) {
    console.error('Error exporting CSV:', error);
    alert('Failed to export CSV.');
  }
}

export async function exportGroceryListToCSVWeb(items: GroceryListItem[]): Promise<void> {
    try {
      let csvContent = 'Food Name,Quantity,Measurement,Description,Bought\n';
      items.forEach(item => {
        const foodName = `"${item.food_name}"`;
        const description = `"${item.description}"`;
        csvContent += `${foodName},${item.quantity},${item.measurement},${description},${item.isBought}\n`;
      });
  
      // Create a Blob from the CSV string
      const csvBlob = new Blob([csvContent], { type: 'text/csv' });
  
      // Create a temporary URL and <a> tag to trigger download
      const csvUrl = URL.createObjectURL(csvBlob);
      const link = document.createElement('a');
      link.href = csvUrl;
      link.download = 'grocery_list.csv'; // The name for the downloaded file
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV on web.');
    }
  }
  

/**
 * Exports a list of grocery items as a PDF file.
 * An HTML template is created to represent the grocery list,
 * then printed to a PDF file which is shared.
 * 
 * @param items Array of grocery list items to export.
 */
export async function exportGroceryListToPDF(
    items: GroceryListItem[],
    listName: string,
    listDescription: string
  ): Promise<void> {
    try {
      // Load the logo image using expo-asset to get an absolute URI.
      const asset = Asset.fromModule(require('../assets/images/logo.png'));
      await asset.downloadAsync();
      const spoilTrackerImage = asset.uri;
  
      // Build HTML content that matches your web version styling.
      const htmlContent = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              * { box-sizing: border-box; margin: 0; padding: 0; }
              body { font-family: Arial, sans-serif; background-color: #FEF9F2; padding: 20px; }
              .title { 
                text-align: center; 
                margin-bottom: 16px; 
                font-size: 24px; 
                font-family: 'inter-bold'; 
                color: #4CAE4F; 
                width: 380px; 
                margin: 0 auto;
              }
              .logo { vertical-align: middle; height: 40px; width: 176px; }
              .list-name { 
                text-align: center; 
                font-size: 20px; 
                color: #007bff; 
                margin: 8px 0; 
                width: 380px; 
                margin: 0 auto;
              }
              .list-description { 
                text-align: center; 
                font-size: 16px; 
                color: #333; 
                margin-bottom: 16px; 
                width: 380px; 
                margin: 0 auto;
              }
              h1.header { 
                text-align: left; 
                font-size: 24px; 
                color: #007bff; 
                width: 220px; 
                margin: 16px 0;
              }
              .container { 
                width: calc(100% - 20px); /* 10px margin on each side */
                margin: 0 auto; 
                padding: 10px 0; 
              }
              .item-line { 
                width: 380px; 
                background-color: #e2e6ea; 
                padding: 8px; 
                margin-bottom: 8px; 
                border: 1px solid white; 
                border-radius: 6px; 
                font-size: 14px; 
                color: #333; 
                display: flex; 
                align-items: center; 
                justify-content: space-between; 
                margin: 0 auto;
              }
              .item-line .left-info { 
                display: flex; 
                flex-direction: column; 
              }
              .item-line span { 
                font-weight: bold; 
                color: #007bff; 
              }
            </style>
          </head>
          <body>
            <!-- Title with inline logo image -->
            <div class="title">
              <img src="${spoilTrackerImage}" alt="SpoilTracker" class="logo" />
            </div>
            <!-- List name and description -->
            <div class="list-name">${listName}</div>
            <div class="list-description">${listDescription}</div>
            <h1 class="header">Grocery List</h1>
            <div class="container">
              ${items.map(item => `
                <div class="item-line">
                  <div class="left-info">
                    <span>${item.food_name}</span>
                    <span style="font-weight: normal; color: #333;">
                      Quantity: ${item.quantity} | Measurement: ${item.measurement}
                    </span>
                  </div>
                  <input type="checkbox" style="transform: scale(1.2);" />
                </div>
              `).join('')}
            </div>
          </body>
        </html>
      `;
  
      // Generate PDF using expo-print
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      
      // Share the PDF if possible
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        alert('Sharing is not available on this platform.');
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF.');
    }
  }

export async function exportGroceryListToPDFWeb(
    items: GroceryListItem[],
    listName: string,
    listDescription: string
  ): Promise<void> {
    try {
      // Dynamically import the browser-friendly ESM build of jsPDF
      const { jsPDF } = require('jspdf/dist/jspdf.es.min.js');
      const doc = new jsPDF();
  
      // Load the logo image using expo-asset to obtain an absolute URI
      const asset = Asset.fromModule(require('../assets/images/logo.png'));
      await asset.downloadAsync();
      const spoilTrackerImage = asset.uri; // This is an absolute URL
  
      // Build HTML content including the list name and description
      const htmlContent = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
              * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
              }
              body {
                font-family: Arial, sans-serif;
                background-color: #FEF9F2;
                margin: 0;
                padding: 0;
              }
              .title {
                text-align: center;
                margin-bottom: 16px;
                font-size: 24px;
                font-family: 'inter-bold';
                color: #4CAE4F;
                width: 380px;
              }
              .logo {
                vertical-align: middle;
                height: 40px;
                width: 176px;
              }
              .list-name {
                text-align: center;
                font-size: 20px;
                color: #007bff;
                margin: 8px 0;
              }
              .list-description {
                text-align: center;
                font-size: 16px;
                color: #333;
                margin-bottom: 16px;
              }
              .container {
                width: calc(100% - 20px); /* 10px margin on each side */
                margin: 0 auto;
                padding: 10px 0;
              }
              .item-line {
                width: 380px;
                background-color: #e2e6ea;
                padding: 8px;
                margin-bottom: 8px;
                border: 1px solid white;
                border-radius: 6px;
                font-size: 14px;
                color: #333;
                display: flex;
                align-items: center;
                justify-content: space-between;
              }
              .item-line .left-info {
                display: flex;
                flex-direction: column;
              }
              .item-line span {
                font-weight: bold;
                color: #007bff;
              }
            </style>
          </head>
          <body>
            <!-- Title with inline logo image -->
            <div class="title">
              <img src="${spoilTrackerImage}" alt="SpoilTracker" class="logo" />
            </div>
            <!-- List name and description -->
            <div class="list-name" style="width: 380px;">${listName}</div>
            <div class="list-description" style="width: 380px;">${listDescription}</div>
            <h1 style="text-align: left; font-size: 24px; color: #007bff; width: 220px;">Grocery List</h1>
            <div class="container">
              ${items.map(item => `
                <div class="item-line">
                  <div class="left-info">
                    <span>${item.food_name}</span>
                    <span style="font-weight: normal; color: #333;">
                      Quantity: ${item.quantity} | Measurement: ${item.measurement}
                    </span>
                  </div>
                  <input type="checkbox" style="transform: scale(1.2);" />
                </div>
              `).join('')}
            </div>
          </body>
        </html>
      `;
  
      // Create a temporary container element for rendering
      const container = document.createElement('div');
      container.innerHTML = htmlContent;
  
      // Render the container into the PDF using jsPDF's html() method
      doc.html(container, {
        callback: (doc: { save: (fileName: string) => void; }) => {
          doc.save('grocery_list.pdf');
        },
        x: 0,
        y: 0,
        margin: [10, 10, 10, 10],
        autoPaging: 'text',
        html2canvas: {
          scale: 0.5, // Adjust scale as needed
        },
      });
    } catch (error) {
      console.error('Error exporting PDF on web:', error);
      alert('Failed to export PDF on web.');
    }
  }

