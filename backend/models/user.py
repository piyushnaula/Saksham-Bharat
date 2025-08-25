from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import uuid

class User:
    def __init__(self, db):
        self.collection = db.users
    
    def create_user(self, user_data):
        """Create a new user (parent/teacher/expert)"""
        user = {
            '_id': str(uuid.uuid4()),
            'email': user_data['email'],
            'password_hash': generate_password_hash(user_data['password']),
            'name': user_data['name'],
            'role': user_data['role'],  # 'parent', 'teacher', 'expert'
            'phone': user_data.get('phone', ''),
            'organization': user_data.get('organization', ''),
            'created_at': datetime.utcnow(),
            'is_active': True,
            'profile_completed': False
        }
        
        result = self.collection.insert_one(user)
        return str(result.inserted_id)
    
    def find_by_email(self, email):
        """Find user by email"""
        return self.collection.find_one({'email': email})
    
    def verify_password(self, email, password):
        """Verify user password"""
        user = self.find_by_email(email)
        if user and check_password_hash(user['password_hash'], password):
            return user
        return None
    
    def update_profile(self, user_id, update_data):
        """Update user profile"""
        update_data['updated_at'] = datetime.utcnow()
        return self.collection.update_one(
            {'_id': user_id},
            {'$set': update_data}
        )
