import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report


df = pd.read_csv('data/WA_Fn-UseC_-Telco-Customer-Churn.csv')

df = df.drop(columns = ['customerID'])

df['TotalCharges'] = df['TotalCharges'].replace(' ','0')
df['TotalCharges'] = pd.to_numeric(df['TotalCharges'])


encoders = {}

for col in df.select_dtypes(include = ['object']).columns:
    if col != 'Churn':  
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
        encoders[col] = le    

target_le = LabelEncoder()
df['Churn'] = target_le.fit_transform(df['Churn'])


X = df.drop(columns = ['Churn'])
y = df['Churn']

feature_columns = list(X.columns)

X_train, X_test, y_train, y_test = train_test_split(X,y,test_size = 0.2, random_state = 42)


model = RandomForestClassifier(class_weight = "balanced", max_depth=10, n_estimators=200, random_state = 42)
model.fit(X_train, y_train)


prediction = model.predict(X_test)

print("--Model Scorecard--")
print(classification_report(y_test,prediction))


joblib.dump(model, 'model.pkl')
joblib.dump(encoders, 'encoders.pkl')
joblib.dump(feature_columns, 'features.pkl')

print("successful")