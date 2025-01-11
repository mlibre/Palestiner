!rm -r /content/palestineInformationAI
!rm -r /content/.ipynb_checkpoints

!pip install -U autotrain-advanced > install_logs.txt 2>&1

!autotrain setup --colab > setup_logs.txt
!autotrain setup --update-torch


from autotrain.params import LLMTrainingParams
from autotrain.project import AutoTrainProject



HF_USERNAME = "mlibre"
HF_TOKEN = "token"


params = LLMTrainingParams(
    model="microsoft/Phi-3.5-mini-instruct",
    data_path="/content/dataset/", # /content/dataset/train.jsonl
    chat_template= None, #
    text_column="text", # the column in the dataset that contains the text
    train_split="train", # /content/dataset/train.jsonl
    trainer="sft", # using the SFT trainer, choose from sft, default, orpo, dpo and reward
    epochs=5,
    batch_size=2,
    lr=1e-5,
    peft=True, # training LoRA using PEFT
    quantization="int4", # using int4 quantization ["int4", "int8", "none"]
    target_modules="all-linear",
    padding="right",
    optimizer="paged_adamw_8bit",
    scheduler="cosine",
    gradient_accumulation=8,
    mixed_precision="bf16",
    merge_adapter=True,
    project_name="palestineInformationAI",
    log="tensorboard",
    push_to_hub=True,
    username=HF_USERNAME,
    token=HF_TOKEN,
)

project = AutoTrainProject(params=params, backend="local", process=True)
project.create()

!export HF_USERNAME=mlibre
!export HF_TOKEN=token
!autotrain --config /content/dataset/config.yml