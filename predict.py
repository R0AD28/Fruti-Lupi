import sys
import json
import joblib
import numpy as np

try:
    model = joblib.load('./models/modelo_decision_tree.pkl')
    label_encoder = joblib.load('./models/label_encoder_accion.pkl')
except Exception as e:
    print(json.dumps({"error": f"Error al cargar los modelos: {e}"}))
    sys.exit(1)

def predict_action(data):
    try:

        input_data = json.loads(data)


        features = np.array([[
            input_data['puntaje'],
            input_data['vidas'],
            input_data['tiempo_reaccion']

        ]])


        prediction_encoded = model.predict(features)
        
        prediction_decoded = label_encoder.inverse_transform(prediction_encoded)

        return json.dumps({"prediction": prediction_decoded[0]})

    except Exception as e:
        return json.dumps({"error": f"Error durante la predicción: {e}"})

if __name__ == '__main__':
    if len(sys.argv) > 1:
        input_json_string = sys.argv[1]
        result = predict_action(input_json_string)
        print(result)
    else:
        print(json.dumps({"error": "No se proporcionaron datos de entrada."}))