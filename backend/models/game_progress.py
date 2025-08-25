from datetime import datetime
import uuid

class GameProgress:
    def __init__(self, db):
        self.collection = db.game_progress
    
    def record_game_session(self, session_data):
        """Record a game session"""
        session = {
            '_id': str(uuid.uuid4()),
            'child_id': session_data['child_id'],
            'game_type': session_data['game_type'],  # 'reading', 'memory', 'math', etc.
            'game_subtype': session_data.get('game_subtype', ''),
            'score': session_data['score'],
            'points_earned': session_data['points_earned'],
            'time_spent': session_data['time_spent'],  # in seconds
            'difficulty_level': session_data['difficulty_level'],
            'correct_answers': session_data.get('correct_answers', 0),
            'total_questions': session_data.get('total_questions', 0),
            'mistakes': session_data.get('mistakes', []),
            'completed_at': datetime.utcnow(),
            'session_notes': session_data.get('notes', '')
        }
        
        result = self.collection.insert_one(session)
        return str(result.inserted_id)
    
    def get_child_progress(self, child_id, game_type=None, days=30):
        """Get child's progress for specific time period"""
        query = {'child_id': child_id}
        if game_type:
            query['game_type'] = game_type
        
        # Get last 30 days by default
        from datetime import timedelta
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        query['completed_at'] = {'$gte': cutoff_date}
        
        return list(self.collection.find(query).sort('completed_at', -1))
    
    def get_performance_analytics(self, child_id):
        """Get performance analytics for a child"""
        pipeline = [
            {'$match': {'child_id': child_id}},
            {'$group': {
                '_id': '$game_type',
                'total_sessions': {'$sum': 1},
                'avg_score': {'$avg': '$score'},
                'total_points': {'$sum': '$points_earned'},
                'total_time': {'$sum': '$time_spent'},
                'accuracy': {
                    '$avg': {
                        '$cond': [
                            {'$gt': ['$total_questions', 0]},
                            {'$divide': ['$correct_answers', '$total_questions']},
                            0
                        ]
                    }
                }
            }}
        ]
        
        return list(self.collection.aggregate(pipeline))
