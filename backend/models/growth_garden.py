from datetime import datetime
import uuid

class GrowthGarden:
    def __init__(self, db):
        self.collection = db.growth_garden
    
    def create_garden(self, child_id):
        """Create a new growth garden for a child"""
        garden = {
            '_id': str(uuid.uuid4()),
            'child_id': child_id,
            'tree_level': 1,
            'total_leaves': 0,
            'total_branches': 0,
            'total_flowers': 0,
            'total_fruits': 0,
            'achievements': [],
            'milestones': [],
            'created_at': datetime.utcnow(),
            'last_updated': datetime.utcnow()
        }
        
        result = self.collection.insert_one(garden)
        return str(result.inserted_id)
    
    def add_leaf(self, child_id, task_type, points=1):
        """Add a leaf for completed task"""
        return self.collection.update_one(
            {'child_id': child_id},
            {
                '$inc': {'total_leaves': points},
                '$set': {'last_updated': datetime.utcnow()},
                '$push': {
                    'achievements': {
                        'type': 'leaf',
                        'task_type': task_type,
                        'earned_at': datetime.utcnow(),
                        'points': points
                    }
                }
            }
        )
    
    def add_branch(self, child_id, module_name):
        """Add a branch for completed module"""
        return self.collection.update_one(
            {'child_id': child_id},
            {
                '$inc': {'total_branches': 1},
                '$set': {'last_updated': datetime.utcnow()},
                '$push': {
                    'achievements': {
                        'type': 'branch',
                        'module_name': module_name,
                        'earned_at': datetime.utcnow()
                    }
                }
            }
        )
    
    def add_flower(self, child_id, achievement_type):
        """Add a flower for major achievement"""
        return self.collection.update_one(
            {'child_id': child_id},
            {
                '$inc': {'total_flowers': 1},
                '$set': {'last_updated': datetime.utcnow()},
                '$push': {
                    'achievements': {
                        'type': 'flower',
                        'achievement_type': achievement_type,
                        'earned_at': datetime.utcnow()
                    }
                }
            }
        )
    
    def get_garden(self, child_id):
        """Get child's growth garden"""
        return self.collection.find_one({'child_id': child_id})
    
    def calculate_tree_level(self, garden):
        """Calculate tree level based on achievements"""
        total_achievements = (
            garden['total_leaves'] + 
            (garden['total_branches'] * 10) + 
            (garden['total_flowers'] * 25) + 
            (garden['total_fruits'] * 50)
        )
        
        if total_achievements < 50:
            return 1
        elif total_achievements < 150:
            return 2
        elif total_achievements < 300:
            return 3
        elif total_achievements < 500:
            return 4
        else:
            return 5
