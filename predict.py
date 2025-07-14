import sys
import json
import joblib
import numpy as np
import pandas as pd
import os

# --- Cargar los modelos ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'arbol_decision_modelo.pkl')
ENCODER_PATH = os.path.join(BASE_DIR, 'models', 'label_encoder_accion.pkl')

try:
    model = joblib.load(MODEL_PATH) 
    label_encoder = joblib.load(ENCODER_PATH)
except Exception as e:
    print(json.dumps({"error": f"Error al cargar modelos: {e}"}))
    sys.exit(1)

def predict_action(data):

    try:
        input_data = json.loads(data)
        
        # 1. Definir el orden de las columnas EXACTAMENTE como en el entrenamiento
        feature_columns = [
            'tiempo_juego', 'frutas_mostradas', 'errores_10s', 'aciertos_10s',
            'vidas_restantes', 'velocidad_actual', 'fruta_dominante', 'errores_fruta'
        ]
        
        # 2. Crear el DataFrame
        input_df = pd.DataFrame([input_data], columns=input_data.keys())
        
        # 3. Reordenar el DataFrame para que coincida con el entrenamiento
        input_df = input_df[feature_columns]

        # 4. Hacer la predicción usando el DataFrame
        prediction_encoded = model.predict(input_df)
        prediction_decoded = label_encoder.inverse_transform(prediction_encoded)

        return json.dumps({"prediction": prediction_decoded[0]})

    except KeyError as ke:
        return json.dumps({"error": f"Falta la característica en los datos de entrada: {ke}"})
    except Exception as e:
        return json.dumps({"error": f"Error en la predicción: {e}"})

if __name__ == '__main__':
    if len(sys.argv) > 1:
        input_json_string = sys.argv[1]
        result = predict_action(input_json_string)
        print(result)
    else:
        print(json.dumps({"error": "No se proporcionaron datos."}))