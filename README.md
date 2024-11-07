# PalestineLLM

**PalestineLLM** is a **Pro-Palestine** project designed to facilitate the understanding and exploration of issues related to Palestine through the use of language models. This repository includes various datasets, text documents, and tools for training language models to improve their performance on Palestinian topics.

## Table of Contents

- [Dataset](#dataset)
- [Installation](#installation)
- [Usage](#usage)
- [How You Can Help](#how-you-can-help)

## Dataset

The project includes various text documents and structured data related to Palestinian topics. The datasets are organized into different directories, such as [decolonizepalestine](https://decolonizepalestine.com/).

### Key Files and Folders

- **datasets**: Contains text documents and QA pairs organized by source.
- **fine-tune**: Includes materials for fine-tuning the language model.
- **concatenated_qr.jsonl**: A JSON Lines file that consolidates question-answer pairs.
- **prompt_generator.js**: A script for generating prompts.
- **QA.jsonl**: Structured QA pairs extracted from various sources for training and evaluation purposes.

## Installation

To set up the project, follow these steps:

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/mlibre/PalestineLLM.git
   cd PalestineLLM
   ```

2. **Run Ollama_Unsloth on Google Colab**.
3. **Download and Share the Model**.

## Usage

```bash
node qa_contacter.js
```

This script will create a consolidated file (`final_QA_dataset.jsonl`) in the `fine-tune` directory.

For fine-tuning, run the Jupyter notebook located in the `fine-tune` directory:

1. Open the notebook using Jupyter:

   ```bash
   jupyter notebook Ollama_Unsloth_Llama3_jsonl.ipynb
   ```

2. Follow the instructions in the notebook to fine-tune the model.

## How You Can Help

We encourage contributions from the community to make **PalestineLLM** even more impactful. Here's how you can help:

- **Share Your OpenAI O1 Data**: If you have access to `OpenAI's O1` or other cutting-edge models, you can help by generating high-quality question-answer pairs (QAs) related to **Palestinian** topics and contributing them to this repository. Simply copy the `.prompt` file contents and paste them into your AI tool. It will generate JSON lines of high-quality data.

- **Create and Share Custom GPTs**: Consider building **custom GPT models** focused on **Palestinian** issues using **OpenAI's tools**. You can share these models in the OpenAI Marketplace and with the community to expand the availability of specialized LLMs.

- **Fine-tune and Share PalestineLLM**: You can help improve **PalestineLLM** by fine-tuning it on additional datasets, especially those related to **Palestine**. Also, you can work on better models as I was only able to fine-tune on Llama 3.1 7B. Once fine-tuned, feel free to share your model on HuggingFace or other platforms to make it accessible to others.

- **Star this Repository and Share It**: By starring this repository, you can help spread the word about this project and encourage others to contribute and use it.

- **Machine Learning and AI Research**: If you are a researcher or student working on machine learning or AI projects, share your ideas and help make **PalestineLLM** better.
