# !rm -r /content/palestineInformationAI
# !rm -r /content/.ipynb_checkpoints
# !rm -r /content/data
# !rm -r /content/.config

!pip install -U autotrain-advanced

!autotrain setup --update-torch
!autotrain setup --colab

# !rm -r /content/palestineInformationAI
# !rm -r /content/.ipynb_checkpoints
# !rm -r /content/data
# !rm -r /content/.config

!export HF_USERNAME=mlibre
!export HF_TOKEN="token"
!autotrain --config /content/dataset/config.yml




# on linux autotrain app --host 127.0.0.1 --port 8000