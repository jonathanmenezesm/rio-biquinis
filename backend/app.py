import os

from bson.errors import InvalidId
from bson.objectid import ObjectId
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient


app = Flask(__name__)
CORS(app)

mongo_uri = os.getenv('MONGO_URI', 'mongodb://mongo:27017/')
mongo_db = os.getenv('MONGO_DB', 'ongdb')

client = MongoClient(mongo_uri)
db = client[mongo_db]


def serializar_biquini(biquini):
	biquini['_id'] = str(biquini['_id'])
	return biquini


@app.route('/biquinis', methods=['GET'])
def listar_biquinis():
	biquinis = [serializar_biquini(biquini) for biquini in db.biquinis.find({})]
	return jsonify(biquinis), 200


@app.route('/biquinis/<biquini_id>', methods=['GET'])
def visualizar_biquini(biquini_id):
	try:
		biquini = db.biquinis.find_one({'_id': ObjectId(biquini_id)})
	except (InvalidId, TypeError):
		return jsonify({'erro': 'ID inválido'}), 400

	if biquini is None:
		return jsonify({'erro': 'Biquíni não encontrado'}), 404

	return jsonify(serializar_biquini(biquini)), 200


@app.route('/biquinis', methods=['POST'])
def cadastrar_biquini():
	novo_biquini = request.get_json() or {}
	novo_biquini.setdefault('nome', '')
	novo_biquini.setdefault('cor', '')
	novo_biquini.setdefault('tamanhos', [])
	novo_biquini.setdefault('preco', 0)
	novo_biquini.setdefault('descricao', '')
	novo_biquini.setdefault('estoque', 0)
	novo_biquini.setdefault('foto', '')
	novo_biquini.setdefault('categoria', '')

	resultado = db.biquinis.insert_one(novo_biquini)
	biquini_salvo = db.biquinis.find_one({'_id': resultado.inserted_id})
	return jsonify(serializar_biquini(biquini_salvo)), 201


@app.route('/biquinis/<biquini_id>', methods=['PUT'])
def atualizar_biquini(biquini_id):
	dados_atualizados = request.get_json() or {}

	try:
		resultado = db.biquinis.update_one(
			{'_id': ObjectId(biquini_id)},
			{'$set': dados_atualizados},
		)
	except (InvalidId, TypeError):
		return jsonify({'erro': 'ID inválido'}), 400

	if resultado.matched_count == 0:
		return jsonify({'erro': 'Biquíni não encontrado'}), 404

	biquini = db.biquinis.find_one({'_id': ObjectId(biquini_id)})
	return jsonify(serializar_biquini(biquini)), 200


@app.route('/biquinis/<biquini_id>', methods=['DELETE'])
def deletar_biquini(biquini_id):
	try:
		resultado = db.biquinis.delete_one({'_id': ObjectId(biquini_id)})
	except (InvalidId, TypeError):
		return jsonify({'erro': 'ID inválido'}), 400

	if resultado.deleted_count == 0:
		return jsonify({'erro': 'Biquíni não encontrado'}), 404

	return jsonify({'mensagem': 'Biquíni deletado com sucesso'}), 200


@app.route('/saude', methods=['GET'])
def saude():
	return jsonify({'status': 'ok'}), 200


if __name__ == '__main__':
	app.run(host='0.0.0.0', port=5000, debug=True)