const fs = require('fs');
const path = require('path');

const resultFile = 'final_QA_dataset.jsonl';
fs.writeFileSync(resultFile, '');

function findAndConcatQAJSONL(directory) {
    const files = fs.readdirSync(directory);

    files.forEach(file => {
        const filePath = path.join(directory, file);

        if (fs.statSync(filePath).isDirectory()) {
            findAndConcatQAJSONL(filePath);
        } else if (file === 'QA.jsonl') {
            concatQAJSONL(filePath);
        }
    });
}

function concatQAJSONL(filePath) {
    const data = fs.readFileSync(filePath, 'utf8').trim();
    if(!data)
    {
        throw new Error(`File is empty: ${filePath}`);
    }
    const lines = data.split('\n').filter(line => line.trim() !== ''); // Filter empty lines

    const validLines = lines.filter(line => {
        try {
            const parsedJSON = JSON.parse(line);

            // Check if the parsed JSON matches the expected format
            if (
                typeof parsedJSON === 'object' &&
                parsedJSON.hasOwnProperty('conversations') &&
                Array.isArray(parsedJSON.conversations) &&
                parsedJSON.conversations.length === 2 &&
                parsedJSON.conversations.every(conversation => {
                    return (
                        typeof conversation === 'object' &&
                        conversation.hasOwnProperty('role') &&
                        typeof conversation.role === 'string' &&
                        conversation.hasOwnProperty('content') &&
                        typeof conversation.content === 'string'
                    );
                })
            ) {
                return true;
            } else {
                console.error(`Invalid JSON line in ${filePath}: ${line}`);
                return false;
            }
        } catch (error) {
            console.error(`Invalid JSON line in ${filePath}: ${line}`);
            return false;
        }
    });

    const concatenatedLines = validLines.join('\n'); // Concatenate with a newline separator
    fs.appendFileSync(resultFile, concatenatedLines + '\n'); // Add a newline at the end
}

const startingDirectory = '../';

findAndConcatQAJSONL(startingDirectory);
fs.writeFileSync(resultFile, fs.readFileSync(resultFile, 'utf8').replace(/\n$/, ''));