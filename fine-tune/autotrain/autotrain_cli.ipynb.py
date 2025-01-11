# !rm -r /content/palestineInformationAI
# !rm -r /content/.ipynb_checkpoints
# !rm -r /content/data
# !rm -r /content/.config

!pip install -U autotrain-advanced > install_logs.txt 2>&1

!autotrain setup --colab > setup_logs.txt
!autotrain setup --update-torch

# !rm -r /content/palestineInformationAI
# !rm -r /content/.ipynb_checkpoints
# !rm -r /content/data
# !rm -r /content/.config

!export HF_USERNAME=mlibre
!export HF_TOKEN="token"
!autotrain --config /content/dataset/config.yml