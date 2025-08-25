from datetime import datetime
import uuid

class Child:
    def __init__(self, db):
        self.collection = db.children
    
    def create_child(self, child_data):
        """Create a new child profile"""
        child = {
            '_id': str(uuid.uuid4()),
            'name': child_data['name'],
            'age': child_data['age'],
            'parent_id': child_data['parent_id'],
            'learning_difficulties': child_data.get('learning_difficulties', []),
            'growth_meter_level': 1,  # Starting level
            'current_difficulty': 'easy',
            'total_points': 0,
            'created_at': datetime.utcnow(),
            'last_activity': datetime.utcnow(),
            'preferences': {
                'favorite_colors': [],
                'preferred_activities': [],
                'attention_span': 'short'  # short, medium, long
            },
            'assigned_teachers': [],
            'assigned_experts': []
        }
        
        result = self.collection.insert_one(child)
        return str(result.inserted_id)
    
    def get_child(self, child_id):
        """Get child by ID"""
        return self.collection.find_one({'_id': child_id})
    
    def get_children_by_parent(self, parent_id):
        """Get all children for a parent"""
        return list(self.collection.find({'parent_id': parent_id}))
    
    def update_growth_meter(self, child_id, points):
        """Update child's growth meter and level"""
        child = self.get_child(child_id)
        if not child:
            return False
        
        new_points = child['total_points'] + points
        new_level = self.calculate_level(new_points)
        new_difficulty = self.calculate_difficulty(new_level)
        
        return self.collection.update_one(
            {'_id': child_id},
            {
                '$set': {
                    'total_points': new_points,
                    'growth_meter_level': new_level,
                    'current_difficulty': new_difficulty,
                    'last_activity': datetime.utcnow()
                }
            }
        )
    
    def calculate_level(self, points):
        """Calculate level based on points"""
        if points < 100:
            return 1
        elif points < 300:
            return 2
        elif points < 600:
            return 3
        elif points < 1000:
            return 4
        else:
            return 5
    
    def calculate_difficulty(self, level):
        """Calculate difficulty based on level"""
        if level <= 2:
            return 'easy'
        elif level <= 4:
            return 'medium'
        else:
            return 'hard'
