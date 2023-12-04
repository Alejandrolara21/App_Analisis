from flask import Flask, jsonify, request, render_template
import pandas as pd
import joblib

app = Flask(__name__)

def validar_tipos(data, tipos_esperados):    
    # Verificar si los campos y tipos esperados están presentes en los datos
    for campo, tipo_esperado in tipos_esperados.items():
        if campo not in data:
            return False, f"Falta el campo '{campo}' en los datos"

        # Verificar si el valor es del tipo esperado
        if not isinstance(data[campo], tipo_esperado):
            return False, f"El campo '{campo}' debe ser del tipo {tipo_esperado.__name__}"

    return True, None


@app.route('/')
def home():
    df_names_countries = pd.read_csv('./dataset/dataset_years.csv', sep=";")
    unique_states = df_names_countries[['state', 'state_id']].drop_duplicates()
    list_countries = unique_states.to_dict(orient='records')    
    return render_template("index.html", list_countries=list_countries)

@app.route('/api/modeloAnalisis', methods=['POST'])
def analisis():
    data = request.json

    required_fields = ['depth', 'year', 'significance', 'state_id', 'optionTime']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Faltan campos requeridos'}), 400
    
    es_valido, mensaje_error = validar_tipos(data, {
        'depth': float,
        'year': int,
        'month': int,
        'season': int,
        'significance': float,
        'state_id': int,
        'optionTime': int
    })

    if not es_valido:
        return jsonify({'error': mensaje_error}), 400

    depth = data['depth']
    year = data['year']
    significance = data['significance']
    state_id = data['state_id']
    optionTime = data['optionTime']

    data_test = {
        'depth': [depth],
        'year': [year],
        'significance': [significance],
        'state_id': [state_id],
    }

    if optionTime == 1:
        modelo = joblib.load('./modelos_analisis/modelo_regresion_years.pkl')
    elif optionTime == 2:
        season = data['season']
        data_test['season'] = [season]
        modelo = joblib.load('./modelos_analisis/modelo_regresion_seasons.pkl')
    elif optionTime == 3:
        month = data['month']
        data_test['month'] = [month]
        modelo = joblib.load('./modelos_analisis/modelo_regresion_months.pkl')
    elif optionTime == 4:
        month = data['month']
        data_test['month'] = [month]
        modelo = joblib.load('./modelos_analisis/modelo_red_neuronal_months.pkl')
    else:
        return jsonify({'error': 'No se tiene esa opcion'}), 400
    
    X_test = pd.DataFrame(data_test)
    new_predictions = modelo.predict(X_test)

    # Imprime las predicciones
    print("Predicciones para 'magnitudo' y 'frequency':")
    print(new_predictions)
    return jsonify({'magnitudo': 1, 'frequency': 1})


if __name__ == '__main__':
    app.run(debug=True)