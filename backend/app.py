from flask import Flask, jsonify, request, abort, make_response
from flask_cors import CORS  # Importa CORS
import json
import os

app = Flask(__name__)
CORS(app)
# Inicializar la lista de datos
data = []

# Cargar los datos desde el archivo JSON
def load_data():
    try:
        if os.path.exists('data.json'):
            with open('data.json', 'r') as f:
                return json.load(f)
        return []
    except (IOError, json.JSONDecodeError) as e:
        print(f"Error cargando los datos: {e}")
        return []

# Guardar los datos en el archivo JSON
def save_data():
    try:
        with open('data.json', 'w') as f:
            json.dump(data, f, indent=4)
    except IOError as e:
        print(f"Error guardando los datos: {e}")
        raise

# Cargar datos al inicio
data = load_data()

# Ruta para obtener todos los elementos
@app.route('/items', methods=['GET'])
def get_items():
    try:
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": f"Error obteniendo los datos: {str(e)}"}), 500

# Ruta para obtener un solo elemento por su id
@app.route('/items/<int:item_id>', methods=['GET'])
def get_item(item_id):
    try:
        item = next((i for i in data if i['id'] == item_id), None)
        if item:
            return jsonify(item), 200
        else:
            return jsonify({"error": "Elemento no encontrado"}), 404
    except Exception as e:
        return jsonify({"error": f"Error obteniendo el elemento: {str(e)}"}), 500

# Ruta para agregar un nuevo elemento
@app.route('/items', methods=['POST'])
def add_item():
    try:
        if not request.json or 'name' not in request.json:
            return jsonify({"error": "Solicitud incorrecta: El campo 'name' es obligatorio"}), 400
        
        new_item = request.json
        new_item['id'] = get_next_id()  # Asignar un ID incremental
        data.append(new_item)
        save_data()
        return jsonify(new_item), 201
    except IOError as e:
        return jsonify({"error": f"Error guardando los datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Error agregando el elemento: {str(e)}"}), 500

# Obtener el siguiente ID disponible
def get_next_id():
    try:
        return max((item['id'] for item in data), default=0) + 1
    except ValueError:
        return 1

# Ruta para actualizar un elemento
@app.route('/items/<int:item_id>', methods=['PUT'])
def update_item(item_id):
    try:
        item = next((i for i in data if i['id'] == item_id), None)
        if item:
            item.update(request.json)
            save_data()
            return jsonify(item), 200
        else:
            return jsonify({"error": "Elemento no encontrado"}), 404
    except IOError as e:
        return jsonify({"error": f"Error guardando los datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Error actualizando el elemento: {str(e)}"}), 500

# Ruta para eliminar un elemento
@app.route('/items/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    global data
    try:
        item_to_delete = next((i for i in data if i['id'] == item_id), None)
        if item_to_delete:
            data.remove(item_to_delete)
            save_data()
            return jsonify({"mensaje": "Elemento eliminado"}), 200
        else:
            return jsonify({"error": "Elemento no encontrado"}), 404
    except IOError as e:
        return jsonify({"error": f"Error guardando los datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Error eliminando el elemento: {str(e)}"}), 500

# Manejador de error 404 personalizado
@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'error': str(error)}), 404)

# Manejador de error 400 personalizado
@app.errorhandler(400)
def bad_request(error):
    return make_response(jsonify({'error': str(error)}), 400)

# Manejador de error 500 personalizado
@app.errorhandler(500)
def internal_error(error):
    return make_response(jsonify({'error': str(error)}), 500)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
