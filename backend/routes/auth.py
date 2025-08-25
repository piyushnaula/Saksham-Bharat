from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models.user import User
from models.child import Child
from models.growth_garden import GrowthGarden
from app import mongo
import re

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'password', 'name', 'role']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate email format
        if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', data['email']):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Validate role
        if data['role'] not in ['parent', 'teacher', 'expert']:
            return jsonify({'error': 'Invalid role'}), 400
        
        user_model = User(mongo.db)
        
        # Check if user already exists
        if user_model.find_by_email(data['email']):
            return jsonify({'error': 'User already exists'}), 409
        
        # Create user
        user_id = user_model.create_user(data)
        
        return jsonify({
            'message': 'User created successfully',
            'user_id': user_id
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400
        
        user_model = User(mongo.db)
        user = user_model.verify_password(email, password)
        
        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Create access token
        access_token = create_access_token(identity=user['_id'])
        
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': user['_id'],
                'name': user['name'],
                'email': user['email'],
                'role': user['role']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/add-child', methods=['POST'])
@jwt_required()
def add_child():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'age']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        data['parent_id'] = user_id
        
        child_model = Child(mongo.db)
        child_id = child_model.create_child(data)
        
        # Create growth garden for the child
        garden_model = GrowthGarden(mongo.db)
        garden_model.create_garden(child_id)
        
        return jsonify({
            'message': 'Child added successfully',
            'child_id': child_id
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()
        user_model = User(mongo.db)
        user = user_model.collection.find_one({'_id': user_id})
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Remove sensitive data
        user.pop('password_hash', None)
        
        # Get children if user is parent
        if user['role'] == 'parent':
            child_model = Child(mongo.db)
            user['children'] = child_model.get_children_by_parent(user_id)
        
        return jsonify({'user': user}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
