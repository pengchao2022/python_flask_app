import os
from flask import Flask, request, jsonify, send_from_directory
from .database import db, init_db
from .models import TodoItem

def create_app():
    app = Flask(__name__, static_folder='static')
    
    
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    init_db(app)
    
    # static file route
    @app.route('/')
    def index():
        return send_from_directory(app.static_folder, 'index.html')
    
    @app.route('/static/<path:path>')
    def static_files(path):
        return send_from_directory(app.static_folder, path)
    
    # Todo REST API 
    @app.route('/todos', methods=['GET'])
    def get_todos():
        todos = TodoItem.query.all()
        return jsonify([t.to_dict() for t in todos])
    
    @app.route('/todos', methods=['POST'])
    def create_todo():
        data = request.get_json()
        if not data or 'title' not in data:
            return jsonify({'error': 'Title is required'}), 400
        todo = TodoItem(
            title=data['title'],
            description=data.get('description'),
            completed=data.get('completed', False)
        )
        db.session.add(todo)
        db.session.commit()
        return jsonify(todo.to_dict()), 201
    
    @app.route('/todos/<int:todo_id>', methods=['PUT'])
    def update_todo(todo_id):
        todo = TodoItem.query.get(todo_id)
        if not todo:
            return jsonify({'error': 'Not found'}), 404
        data = request.get_json()
        if 'title' in data:
            todo.title = data['title']
        if 'description' in data:
            todo.description = data['description']
        if 'completed' in data:
            todo.completed = data['completed']
        db.session.commit()
        return jsonify(todo.to_dict())
    
    @app.route('/todos/<int:todo_id>', methods=['DELETE'])
    def delete_todo(todo_id):
        todo = TodoItem.query.get(todo_id)
        if not todo:
            return jsonify({'error': 'Not found'}), 404
        db.session.delete(todo)
        db.session.commit()
        return jsonify({'message': 'Deleted'})
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=8000, debug=False)