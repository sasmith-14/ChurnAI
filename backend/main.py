from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from schemas import CustomerData
import joblib
import pandas as pd

model = joblib.load('../Model/model.pkl')
encoders = joblib.load('../Model/encoders.pkl')
feature_columns = joblib.load('../Model/features.pkl')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "server is running"}

@app.post("/predict")
def predict_churn(data: CustomerData):

    input_dict = data.model_dump()
    input_df = pd.DataFrame([input_dict])

    for col, le in encoders.items():
        if col in input_df.columns:
            input_df[col] = le.transform(input_df[col])

    input_df = input_df[feature_columns]

    prediction = model.predict(input_df)[0]
    probability = model.predict_proba(input_df)[0][1]  

    return {
        "churn_prediction": "Yes" if prediction == 1 else "No",
        "churn_probability": round(float(probability), 4)
    }
    
    