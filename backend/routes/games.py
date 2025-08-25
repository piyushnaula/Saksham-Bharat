from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.game_progress import GameProgress
from models.child import Child
from models.growth_garden import GrowthGarden
from app import mongo

games_bp = Blueprint('games', __name__)

@games_bp.route('/start-session', methods=['POST'])
@jwt_required()
def start_game_session():
    try:
        data = request.get_json()
        child_id = data.get('child_id')
        game_type = data.get('game_type')
        
        if not child_id or not game_type:
            return jsonify({'error': 'child_id and game_type required'}), 400
        
        # Get child's current level and difficulty
        child_model = Child(mongo.db)
        child = child_model.get_child(child_id)
        
        if not child:
            return jsonify({'error': 'Child not found'}), 404
        
        return jsonify({
            'session_id': f"{child_id}_{game_type}_{int(datetime.utcnow().timestamp())}",
            'difficulty_level': child['current_difficulty'],
            'growth_meter_level': child['growth_meter_level'],
            'recommended_time': 10 if child['current_difficulty'] == 'easy' else 15
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@games_bp.route('/complete-session', methods=['POST'])
@jwt_required()
def complete_game_session():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['child_id', 'game_type', 'score', 'time_spent']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Calculate points based on score and difficulty
        points_earned = calculate_points(data['score'], data.get('difficulty_level', 'easy'))
        data['points_earned'] = points_earned
        
        # Record game session
        progress_model = GameProgress(mongo.db)
        session_id = progress_model.record_game_session(data)
        
        # Update child's growth meter
        child_model = Child(mongo.db)
        child_model.update_growth_meter(data['child_id'], points_earned)
        
        # Update growth garden
        garden_model = GrowthGarden(mongo.db)
        garden_model.add_leaf(data['child_id'], data['game_type'], 1)
        
        # Check for achievements
        achievements = check_achievements(data['child_id'], data)
        
        return jsonify({
            'message': 'Session completed successfully',
            'session_id': session_id,
            'points_earned': points_earned,
            'achievements': achievements
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def calculate_points(score, difficulty):
    """Calculate points based on score and difficulty"""
    base_points = score
    multiplier = {'easy': 1, 'medium': 1.5, 'hard': 2}
    return int(base_points * multiplier.get(difficulty, 1))

def check_achievements(child_id, session_data):
    """Check for new achievements"""
    achievements = []
    
    # Check for perfect score
    if session_data['score'] >= 100:
        achievements.append({
            'type': 'perfect_score',
            'message': 'Perfect Score! 🌟',
            'reward': 'flower'
        })
    
    # Check for streak (implement streak logic)
    # Check for time achievements
    # etc.
    
    return achievements

@games_bp.route('/leaderboard/<child_id>', methods=['GET'])
@jwt_required()
def get_leaderboard(child_id):
    try:
        progress_model = GameProgress(mongo.db)
        
        # Get child's recent progress
        recent_progress = progress_model.get_child_progress(child_id, days=7)
        
        # Calculate weekly stats
        total_points = sum(session['points_earned'] for session in recent_progress)
        total_sessions = len(recent_progress)
        avg_score = sum(session['score'] for session in recent_progress) / total_sessions if total_sessions > 0 else 0
        
        return jsonify({
            'weekly_stats': {
                'total_points': total_points,
                'total_sessions': total_sessions,
                'average_score': round(avg_score, 2),
                'rank': 'Growing Star'  # Implement ranking logic
            },
            'recent_sessions': recent_progress[:5]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
