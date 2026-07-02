from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import numpy as np
from PIL import Image
import io

app = FastAPI(title="Paddy Crop Disease Detection API")

# Configure CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for simplicity, in prod replace with Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model
try:
    model = load_model("VGG16_Rice_Model.h5", compile=False)
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

class_names = ['Bacterialblight', 'Blast', 'Brownspot', 'Tungro']

def preprocess_image(img_bytes):
    # Load image from bytes
    img = Image.open(io.BytesIO(img_bytes))
    # Convert to RGB if needed
    if img.mode != 'RGB':
        img = img.convert('RGB')
    # Resize to target size used during training
    img = img.resize((224, 224))
    # Convert to numpy array
    img_array = image.img_to_array(img)
    # Rescale
    img_array = img_array / 255.0
    # Expand dimensions for batch size
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Paddy Crop Disease Detection API is running"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if model is None:
        return {"error": "Model not loaded on the server"}
    
    try:
        # Read image bytes
        contents = await file.read()
        # Preprocess the image
        img_array = preprocess_image(contents)
        # Predict
        prediction = model.predict(img_array)
        # Get the predicted class and confidence
        predicted_class_index = np.argmax(prediction)
        predicted_class = class_names[predicted_class_index]
        confidence = float(np.max(prediction) * 100)
        
        return {
            "prediction": predicted_class,
            "confidence": confidence
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
