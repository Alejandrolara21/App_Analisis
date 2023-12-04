from flask import Flask, jsonify, request, render_template
import pandas as pd

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

    required_fields = ['depth', 'year', 'month', 'significance', 'state_id']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Faltan campos requeridos'}), 400
    
    es_valido, mensaje_error = validar_tipos(data, {
        'depth': float,
        'year': int,
        'month': int,
        'significance': float,
        'state_id': int
    })

    if not es_valido:
        return jsonify({'error': mensaje_error}), 400

    depth = data['depth']
    year = data['year']
    month = data['month']
    significance = data['significance']
    state_id = data['state_id']

    

    return jsonify({'magnitudo': 1, 'frequency': 1})


if __name__ == '__main__':
    app.run(debug=True)