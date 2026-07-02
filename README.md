# Paddy Crop Disease Detection

This repository contains a deep learning project for detecting diseases in paddy (rice) crops using the VGG16 architecture. 

## Overview
The model classifies paddy crop leaf images into 4 distinct classes:
- Bacterialblight
- Blast
- Brownspot
- Tungro

## Project Structure
- `paddy_crop_disease_detection_using_VGG16.ipynb`: The main Jupyter Notebook that covers data loading, preprocessing, model definition using transfer learning (VGG16), training, and evaluation.
- `paddy_crop_disease_model_exe.ipynb`: A shorter notebook dedicated to loading the trained model and running inferences on new images to predict the disease class and confidence score.
- `requirements.txt`: List of dependencies required to run the notebooks.

## Model Details
- **Architecture**: VGG16 (pre-trained on ImageNet) with a custom dense classification head.
- **Input Size**: Images are resized to 224x224 and normalized.
- **Classes**: 4 (Bacterialblight, Blast, Brownspot, Tungro).

## Setup & Requirements
You can install the required Python libraries using:
```bash
pip install -r requirements.txt
```

Note: The notebooks were originally designed to run in Google Colab (they contain `google.colab` imports and use Google Drive for dataset and model storage). You may need to update the file paths (`/content/drive/MyDrive/...`) in the code if you are running this locally.

## Usage
1. Train the model using the `paddy_crop_disease_detection_using_VGG16.ipynb` notebook. The trained model will be saved as an `.h5` file.
2. For inference, use the `paddy_crop_disease_model_exe.ipynb` notebook. Load the saved model and provide the path to a test image to get a prediction.
