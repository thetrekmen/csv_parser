import chalk from 'chalk';
import fs from 'fs';
import Excel from 'exceljs';
import readline from 'readline';

async function parseCsvFiles(searchWord, newSearchWord, newerSearchWord, directory) {

    // Read the list of files in the directory
    const files = await readDirectory(directory);
    // Initialize an array to store the header row
    const headerRow = [];
    // Initialize an array to store the rows that meet the search criteria
    const newRows = [];
    // Initialize a counter
    let i = 0;

    // Iterate through the list of files in the directory
    for (const file of files) {

        // // progress tracker
        console.clear()
        console.log(chalk.whiteBright('parseCsvFiles function has started. Standby...'))
        console.log(chalk.yellow('*Depending on file size and files in folder, this may take a while...*'))

        if (i < files.length) {
            console.log(chalk.blue('   Files remaining: ') + chalk.green.bold(files.length - i) + ' out of ' + chalk.red.bold(files.length));
            console.log(chalk.blue('   Currently processing: ') + file);
        }
        i++

        // Read the .cvs file
        const workbook = new Excel.Workbook();
        await workbook.csv.readFile(`${directory}/${file}`);

        // Get the first worksheet in the workbook
        const worksheet = workbook.worksheets[0];

        // find the header row
        worksheet.eachRow({ includeEmpty: false }, function (row, rowNumber) {

            if (rowNumber === 1) {
                function prepend(array, value) {
                    let newArray = array.slice();
                    newArray.push(value);
                    return newArray;
                }
                let rowHeader = prepend(row.values, "Mac Address");
                headerRow.push(rowHeader)
            }
            // find the mac address
            const string = JSON.stringify(row.values);
            const macRegex = /([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})/;
            const matches = string.match(macRegex);
            let macAddress;
            if (matches) {
                macAddress = matches[0]
            }
            // iterate through the rows and find the search words
            if (macAddress) {
                worksheet.eachRow({ includeEmpty: false }, function (row, rowNumber) {
                    let regexFirst = new RegExp(searchWord, 'i');
                    if (regexFirst.test(row.values)) {
                        // console.log('Row ' + rowNumber + ' = ' + JSON.stringify(row.values));
                        let regexSecond = new RegExp(newSearchWord, 'i');
                        if (regexSecond.test(row.values)) {
                            // console.log('Row ' + rowNumber + ' = ' + JSON.stringify(row.values));
                            row.eachCell({ includeEmpty: false }, function (cell) {
                                let regexThird = new RegExp(newerSearchWord);
                                if (regexThird.test(cell.value)) {
                                    // console.log('Row ' + rowNumber + ' = ' + JSON.stringify(row.values));
                                    // console.log(macAddress)
                                    // if search words are found, add the row to the newRows array
                                    function prepend(array, value) {
                                        let newArray = array.slice();
                                        newArray.push(value);
                                        return newArray;
                                    }
                                    let rows = prepend(row.values, macAddress);
                                    newRows.push(rows);
                                }
                            })
                        }
                    }
                });
            }
        });
    }

    // Create a new .csv file and write the new rows to it
    const newWorkbook = new Excel.Workbook();
    const newWorksheet = newWorkbook.addWorksheet('Sheet1');
    // adds header row
    newWorksheet.addRow(headerRow[0])
    // adding new rows
    newRows.forEach(function (row) {
        newWorksheet.addRow(row);
    });

    await newWorkbook.csv.writeFile('Test.csv');
    console.log(chalk.green('parseCsvFiles function has completed.'));
}

async function readDirectory(directory) {
    return new Promise((resolve, reject) => {
        fs.readdir(directory, (error, files) => {
            if (error) {
                reject(error);
            } else {
                resolve(files);
            }
        });
    });
}

// Call the parsecsvFiles function with the search and new search words and the directory path
// parseCsvFiles('papa', 'money', 'average', '/Users/thetrekman/Documents/Code/csv-parser/Docs');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// prompt the user for the search word variables
rl.question('Enter the first search word: ', (searchWord) => {
    rl.question('Enter the second search word: ', (newSearchWord) => {
        rl.question('Enter the third search word: ', (newerSearchWord) => {
            rl.question('Enter the directory path: ', (directory) => {
                rl.close();

                // call the parseCsvFiles function with the search word variables
                parseCsvFiles(searchWord, newSearchWord, newerSearchWord, directory);
            });
        });
    });
});

//Reads the list of files in the specified directory, reads each .csv file using the exceljs library, searches for rows that contain the search word, and then checks if the row also contains the new search word. If it does, the row is added to an array. After all files have been processed, a new .csv file is created and the rows that contain the new search word are written to it.
