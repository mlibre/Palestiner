const fs = require('fs');
const path = require('path');

// Paths to the prompt files
const promptFile = './fine-tune/QA_generator.prompt';
const extendedPromptFile = './fine-tune/QA_generator_full.prompt';

// Function to find and concatenate the prompt with each part.txt file
function findAndConcatPrompt(directory) {
    const files = fs.readdirSync(directory);

    files.forEach(file => {
        const filePath = path.join(directory, file);

        if (fs.statSync(filePath).isDirectory()) {
            findAndConcatPrompt(filePath); // Recursively process subdirectories
        } else if (file.startsWith('part') && file.endsWith('.txt')) {
            concatPrompt(filePath, promptFile); // Concatenate with QA_generator.prompt
            concatPrompt(filePath, extendedPromptFile); // Concatenate with QA_generator_full.prompt
        }
    });
}

// Function to concatenate the prompt with a part.txt file
function concatPrompt(partFilePath, promptFilePath) {
    try {
        const promptData = fs.readFileSync(promptFilePath, 'utf8');
        const partData = fs.readFileSync(partFilePath, 'utf8');

        // Create the full prompt content by concatenating prompt and part
        const fullPrompt = promptData + '\n\n' + partData;

        const partFileName = path.basename(partFilePath, '.txt'); // Get part1 from part1.txt
        const promptFileName = path.basename(promptFilePath, '.prompt'); // Get QA_generator or QA_generator_full
        const fullPromptFilePath = path.join(path.dirname(partFilePath), `${partFileName}_${promptFileName}.prompt`);
        
        fs.writeFileSync(fullPromptFilePath, fullPrompt, 'utf8');

        console.log(`Full prompt created at: ${fullPromptFilePath}`);
    } catch (error) {
        console.error(`Error processing ${partFilePath}: ${error.message}`);
    }
}

// Starting directory for processing
const startingDirectory = './datasets';

findAndConcatPrompt(startingDirectory);
