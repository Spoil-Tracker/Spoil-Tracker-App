import http, { IncomingMessage, ServerResponse } from 'http';
import { barcodeAPIKey } from './barcodeApiKey';



async function getBarcodeData(barcodeValue: string): Promise<string[]> {
    //Call the API
    const apiUrl = `https://api.barcodelookup.com/v3/products?barcode=${barcodeValue}&key=${barcodeAPIKey}`;
    const response = await fetch(apiUrl);

    //Check the reply
    if(response.status === 200) {
        console.log("BarcodeAPI: Data Recieved")
    }
    else if(response.status === 403) {
        console.log("BarcodeAPI: Invalid API key")
    }
    else if(response.status === 404) {
        console.log("BarcodeAPI: No data returned")
    }
    else if(response.status === 429) {
        console.log("BarcodeAPI: Exceeded API call limits")
    }

    const data: any = await response.json();

    
    console.log("-------------data----------------");
    console.log(data);
    console.log("-------------data.products----------------");
    console.log(data.products);
    console.log("-------------data.products[0]----------------");
    console.log(data.products[0]);
    console.log("-------------data.products[0].title-------------------");
    console.log(data.products[0].title);
    

    console.log(data.products[0].title);
    console.log(data.products[0].nutrition_facts);
    console.log("\n");

    const returnString = new Array(
        data.products[0].title,
        data.products[0].brand,
        data.products[0].nutrition_facts
    )

    return returnString;
};

const barcode =  '077341125112';
const barcode2 = '044000006174';
const barcode3 = '044000060121';
const barcode4 = '028400110457';

getBarcodeData(barcode);
getBarcodeData(barcode2);
getBarcodeData(barcode3);
getBarcodeData(barcode4);

/**
http.createServer(async (req, res) => {
    if (req.url === '/') {
        const response =  await fetch(apiUrl);
        if (response.status === 200) {
            const data = await response.json();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data, null, 2)); // Pretty-printed JSON
        } else if (response.status === 403) {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid API key' }));
        } else if (response.status === 404) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'No data returned' }));
        } else if (response.status === 429) {
            res.writeHead(429, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Exceeded API call limits' }));
        }
    }
}).listen(3000);
*/

