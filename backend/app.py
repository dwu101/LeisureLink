from flask import Flask, request, jsonify
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import secrets
import requests
from google_auth_oauthlib.flow import Flow
from flask import redirect, session
from flask_sqlalchemy import SQLAlchemy 
import os
import psycopg2 
from sqlalchemy import create_engine, ForeignKey
from sqlalchemy_utils import database_exists, create_database, relationships, generic_relationship
from werkzeug.utils import secure_filename
from pathlib import Path
from sqlalchemy.orm.attributes import flag_modified
from settings import john_doe, jane_smith
import datetime
import jwt  



app = Flask(__name__)
app.secret_key = secrets.token_hex(16)
cookies = {}

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:postgres@localhost/database'

FRONTEND_DIR = Path(__file__).parent.parent / 'frontend'
UPLOAD_FOLDER = FRONTEND_DIR / 'public' / 'profile-pictures'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

going_out = [
    "Bars",
    "Cafe-hopping",
    "Clubs",
    "Concerts",
    "Festivals",
    "Karaoke",
    "Museums & galleries",
    "Stand up",
    "Theater"
]

activities = [
    "Gym",
    "Badminton", 
    "Baseball",
    "Basketball",
    "Bouldering",
    "Volleyball",
    "Boxing",
    "Football",
    "Soccer",
    "Yoga"
]

staying_in = [
    "Reading",
    "Video games",
    "Board games",
    "Cooking",
    "Baking",
    "Meditation",
    "Puzzle solving",
    "Movie watching",
    "TV binge watching",
    "Knitting",
    "Podcasts",
    "Journaling",
    "Scrapbooking",
    "DIY projects",
    "Online shopping",
]

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

db = SQLAlchemy(app)

class User(db.Model):
    __tablename__='User'
    account_id=db.Column(db.Integer, primary_key=True)
    username=db.Column(db.String(40), unique=True, nullable=False)
    password=db.Column(db.String(40), nullable=False)
    email=db.Column(db.String(40), nullable=False)
    bio=db.Column(db.String(1000))
    display_name=db.Column(db.String(40))
    status=db.Column(db.String(40))
    groups=db.Column(db.ARRAY(db.String(100)))
    pfp_link=db.Column(db.String(100))
    friends = db.Column(db.ARRAY(db.String(100)))
    tags = db.Column(db.ARRAY(db.String(100))) 
    events = db.Column(db.ARRAY(db.String(100)))


    def __init__(self,account_id, username,password,email,bio,display_name,status,groups,pfp_link,friends, tags, events=[]):
        self.account_id = account_id
        self.username=username
        self.password=password
        self.email=email
        self.bio=bio
        self.display_name=display_name
        self.status=status
        self.groups=groups
        self.pfp_link=pfp_link
        self.friends = friends if friends is not None else []
        self.tags = tags if tags is not None else []
        self.events = events

class UserGCAL(db.Model):
    __tablename__='UserGCal'
    account_id=db.Column(db.Integer, ForeignKey(User.account_id),primary_key=True)
    username=db.Column(db.String(400), unique=True, nullable=False)
    token=db.Column(db.String(400), nullable=False)
    refresh_token=db.Column(db.String(400), nullable=False)
    token_uri=db.Column(db.String(500), nullable=False)
    client_id=db.Column(db.String(500), nullable=False)
    client_secret=db.Column(db.String(500), nullable=False)
    scopes=db.Column(db.String(500), nullable=False)
    email=db.Column(db.String(500), nullable=False)

    

    def __init__(self, account_id, username, token, refresh_token, token_uri, client_id, client_secret, scopes, email):
        self.account_id=account_id
        self.username=username
        self.token = token
        self.refresh_token = refresh_token
        self.client_id=client_id
        self.token_uri=token_uri
        self.client_secret=client_secret
        self.scopes = scopes
        self.email = email


class Groups(db.Model):
    __tablename__='Groups'
    group_name=db.Column(db.String(40), nullable=False,primary_key=True)
    users=db.Column(db.ARRAY(db.Integer, ForeignKey(User.account_id)))

    def __init__(self, group_name, users):
        self.group_name=group_name
        self.users=users

# Helper Functions
def get_user_by_username(username):
    return User.query.filter_by(username=username).first()

def check_user_credentials(username, password):
    user = get_user_by_username(username)
    if user and user.password == password:
        return True
    return False

def create_user(username, password, email):
    try:
       
        new_user = User(account_id=User.query.count()+1, username=username, password=password, email=email, bio="", display_name="", status="Active", groups=[], pfp_link="", friends= [], tags=[])
        db.session.add(new_user)
        db.session.commit()
        return {"success": True, "message": "User created successfully."}
    except Exception as e:
        db.session.rollback()
        print(e)
        return {"success": False, "message": "Username or email already exists."}
    
def create_user_GCAL(username, token, refresh_token, token_uri, client_id, client_secret, scopes, email):
    account_id = get_user_by_username(username).account_id

    user_to_delete = UserGCAL.query.filter_by(username=username).first()

    if user_to_delete:
        db.session.delete(user_to_delete)  # Mark the row for deletion
        db.session.commit()
    
    insert = UserGCAL(
        account_id=account_id,  # Use the account_id from user2
        username=username,
        token=token,
        refresh_token=refresh_token,
        token_uri=token_uri,
        client_id=client_id,
        client_secret=client_secret,
        scopes=scopes,
        email=email
        
    )
    db.session.add(insert)
    db.session.commit()



def get_email(username):
    user = get_user_by_username(username)
    return user.email if user else None

def get_bio(username):
    user = get_user_by_username(username)
    return user.bio if user else "None"

def get_display_name(username):
    user = get_user_by_username(username)
    return user.display_name if user else "None"

def get_status(username):
    user = get_user_by_username(username)
    return user.status if user else "Active"

def get_groups(username):
    user = get_user_by_username(username)
    return user.groups if user else "None"

def get_pfp_link(username):
    user = get_user_by_username(username)
    return user.pfp_link if user else "/profile-pictures/defaultpfp.jpg"

def get_tags(username):
    user = get_user_by_username(username)
    return user.tags if user else "None"

def add_friend(current_user, friend_username):
    current_user_obj = get_user_by_username(current_user)
    friend_user_obj = get_user_by_username(friend_username)

    if not current_user_obj or not friend_user_obj:
        return {"success": False, "message": "User not found"}

    if friend_user_obj.username in current_user_obj.friends:
        return {"success": False, "message": "Friend already added"}

    current_user_obj.friends.append(friend_user_obj.username)
    db.session.commit()
    return {"success": True, "message": "Friend added successfully"}

def remove_friend(current_user, friend_username):
    current_user_obj = get_user_by_username(current_user)
    friend_user_obj = get_user_by_username(friend_username)

    if not current_user_obj or not friend_user_obj:
        return {"success": False, "message": "User not found"}

    if friend_user_obj.account_id not in current_user_obj.friends:
        return {"success": False, "message": "Friend not found in your friends list"}

    current_user_obj.friends.remove(friend_user_obj.account_id)
    db.session.commit()
    return {"success": True, "message": "Friend removed successfully"}



def init_db():
    # Check if the database exists, and create it if not
    engine = create_engine(app.config['SQLALCHEMY_DATABASE_URI'])
    if not database_exists(engine.url):
        create_database(engine.url)
        
        print("Database created.")
    else:
        print("Database already exists.")
        db.drop_all()

    db.create_all()  # Create tables based on the models defined

@app.before_request
def make_session_permanent():
    session.permanent = True

@app.route('/')
def home(p):
    return "Backend is now running!!!!!!!!!!!!!!!"





os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'openid'
]

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    # print(username)
    # print(password)
    if check_user_credentials(username, password):
        # print("A")
        return jsonify({"status": 200, "message": "Success!"})
    else:
        # print("B")
        return jsonify({"status": 401, "message": "Invalid credentials"})

@app.route('/signUp', methods=['POST'])
def sign_up():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')
    # print(username, password, email)
    if username and password and email:
        result = create_user(username, password, email)
        # print("IN SIGN UP")
        # print("username",(username))
        # print("email",get_email(username))
        return jsonify(result)
    else:
        return jsonify({"status": 401, "message": "Incomplete Info"})



@app.route('/getProfile', methods=['GET'])
def get_profile():
    username = request.args.get('username')
    # print(username)
    if not username:
        return jsonify({"success": False, "message": "Username is required"}), 400
    
    profile = {
        "email": get_email(username),
        "bio": get_bio(username),
        "display_name": get_display_name(username),
        "status": get_status(username),
        "groups": get_groups(username),
        "pfp_link": get_pfp_link(username),
        "tags": get_tags(username)
    }
    # print(profile)
    if all(value is not None for value in profile.values()):
        # print("HERE")
        return jsonify({"success": True, "profile": profile})
    else:
        return jsonify({"success": False, "message": "User not found"}), 404
    
@app.route('/updateTags', methods=['POST'])
def update_user_tags():
   try:
       data = request.get_json()
       
       # Check if required fields are present
       if not data or 'username' not in data or 'tags' not in data:
           return jsonify({
               'success': False,
               'message': 'Missing required fields: username and tags'
           }), 400
           
       username = data['username']
       new_tags = data['tags']
       
       if not isinstance(new_tags, list):
           return jsonify({
               'success': False,
               'message': 'Tags must be an array'
           }), 400
           
       user = get_user_by_username(username)
       if not user:
           return jsonify({
               'success': False,
               'message': f'User {username} not found'
           }), 404
           
       user.tags = new_tags
       db.session.commit()
       
       return jsonify({
           'success': True,
           'message': 'Tags updated successfully',
           'tags': user.tags
       }), 200
    
   except Exception as e:
       return jsonify({
           'success': False,
           'message': f'Server error: {str(e)}'
       }), 500

@app.route('/addGroup', methods=['POST'])
def add_group():
    data = request.json
    username = data.get('username')
    group_names = data.get('groups', [])

    if not username or not isinstance(group_names, list):
        return jsonify({"success": False, "message": "Invalid input"}), 400

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    # Add the groups to the database
    for group_name in group_names:
        group = Groups.query.filter_by(group_name=group_name).first()
        if not group:
            group = Groups(group_name=group_name, users=[user.account_id])
            db.session.add(group)
        elif user.account_id not in group.users:
            group.users.append(user.account_id)

    db.session.commit()
    return jsonify({"success": True, "message": "Groups added successfully"})
@app.route('/createGroup', methods=['POST'])
def create_group():
    try:
        data = request.get_json()
        
        # Validate input
        if 'groupName' not in data or 'usernames' not in data:
            return jsonify({
                'success': False,
                'message': 'Missing required fields: groupName and usernames'
            }), 400
            
        group_name = data['groupName']
        usernames = data['usernames']
        
        # Check if group already exists
        existing_group = Groups.query.filter_by(group_name=group_name).first()
        if existing_group:
            return jsonify({
                'success': False,
                'message': 'Group name already exists'
            }), 400
            
        # Get account_ids for all usernames
        user_account_ids = []
        users_to_update = []
        
        for username in usernames:
            user = User.query.filter_by(username=username).first()
            if not user:
                return jsonify({
                    'success': False,
                    'message': f'User {username} not found'
                }), 404
            user_account_ids.append(user.account_id)
            users_to_update.append(user)
        
        # Create new group
        new_group = Groups(
            group_name=group_name,
            users=user_account_ids
        )
        
        # Add to database
        db.session.add(new_group)
        
        # Add group to each user's groups array and commit the changes
        for user in users_to_update:
            if user.groups is None:
                user.groups = []
            # Create a new list instead of modifying in place
            new_groups = user.groups.copy()
            new_groups.append(group_name)
            # Assign the new list to trigger change detection
            user.groups = new_groups
            # Flag the column as modified
            flag_modified(user, "groups")
            db.session.add(user)
            
        # Commit all changes in a single transaction
        db.session.commit()

        # Verify the changes after commit
        updated_users = []
        for username in usernames:
            user = User.query.filter_by(username=username).first()
            updated_users.append({
                'username': username,
                'groups': user.groups
            })
            # print(f"{username}: {user.groups}")
            
        return jsonify({
            'success': True,
            'message': 'Group created successfully',
            'group': {
                'name': group_name,
                'users': usernames
            },
            'updated_users': updated_users
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(e)
        return jsonify({
            'success': False,
            'message': 'An error occurred while creating the group',
            'error': str(e)
        }), 500

# Endpoint to delete groups for a user
@app.route('/deleteGroup', methods=['POST'])
def delete_group():
    data = request.json
    username = data.get('username')
    group_names = data.get('groups', [])
    print(username)
    print(group_names)

    if not username or not isinstance(group_names, list):
        return jsonify({"success": False, "message": "Invalid input"}), 400

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    # Delete the groups from the user's list
    for group_name in group_names:
        group = Groups.query.filter_by(group_name=group_name).first()
        if group:
            # Convert tuple to list, remove user, and convert back to tuple
            users_list = list(group.users)
            if user.account_id in users_list:
                users_list.remove(user.account_id)
                group.users = tuple(users_list)  # Convert back to tuple
                
                if not users_list:  # If no users remain
                    db.session.delete(group)
        
        if user.groups is not None and group_name in user.groups:
            updated_groups = [g for g in user.groups if g != group_name]
            user.groups = updated_groups

    db.session.commit()

    return jsonify({"success": True, "message": "Groups deleted successfully"})

@app.route('/getGroupUsers', methods=['POST'])
def get_group_users():
    data = request.json
    group_name = data.get('group_name')
    
    
    if not group_name:
        return jsonify({"success": False, "message": "Group name is required"}), 400
    
    group = Groups.query.filter_by(group_name=group_name).first()
    if not group:
        return jsonify({"success": False, "message": "Group not found"}), 404
    
    if group.users:
        users = User.query.filter(User.account_id.in_(group.users)).all()
        users_data = [{
            'username': user.username,
            'display_name': user.display_name,
            'status': user.status
        } for user in users]

        print(users_data)
        
        return jsonify({
            "success": True,
            "group_name": group_name,
            "users": users_data
        })
    
    return jsonify({
        "success": True,
        "group_name": group_name,
        "users": []
    })

@app.route('/removeGroupMembers', methods=['POST'])
def remove_group_members():
    try:
        data = request.json
        group_name = data.get('group_name')
        usernames = data.get('members', [])  # List of usernames to remove
        print(group_name)
        print(usernames)

        if not group_name or not isinstance(usernames, list):
            return jsonify({
                "success": False,
                "message": "Invalid input - group name or members list missing"
            }), 400

        # Get the group
        group = Groups.query.filter_by(group_name=group_name).first()
        if not group:
            return jsonify({
                "success": False,
                "message": f"Group {group_name} not found"
            }), 404

        # Get all users that need to be removed
        users_to_remove = User.query.filter(User.username.in_(usernames)).all()
        if not users_to_remove:
            return jsonify({
                "success": False,
                "message": "No valid users found to remove"
            }), 404

        # Keep track of successful removals
        removed_users = []
        
        for user in users_to_remove:
            # Remove the group from user's groups list
            if user.groups is not None and group_name in user.groups:
                user.groups = [g for g in user.groups if g != group_name]
            
            # Remove user's account_id from group's users list
            if group.users is not None and user.account_id in group.users:
                group.users = [u for u in group.users if u != user.account_id]
                removed_users.append(user.username)

        # If all users were removed from the group, you might want to delete the group
        if not group.users:
            db.session.delete(group)
        
        # Commit all changes
        db.session.commit()

        return jsonify({
            "success": True,
            "message": f"Successfully removed {len(removed_users)} members from {group_name}",
            "removed_users": removed_users
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": f"An error occurred: {str(e)}"
        }), 500

# Endpoint to search for users or groups
@app.route('/search', methods=['POST'])
def search():
    data = request.get_json()
    query = data.get('query')
    search_by = data.get('searchBy')
    query = query.lower()

    print(query)
    print(search_by)
    if not query or search_by not in ["username", "displayName", "group"]:
        
        return jsonify({"success": False, "message": "Invalid search parameters"}), 400

    results = []

    if search_by == "username":
        # print("here")
        users = User.query.filter(User.username.ilike(f"%{query}%")).all()
        print(f"users {users}")
    elif search_by == "displayName":
        users = User.query.filter(User.display_name.ilike(f"%{query}%")).all()
    elif search_by == "group":
        groups = Groups.query.filter(Groups.group_name.ilike(f"%{query}%")).all()
        user_ids = {user_id for group in groups for user_id in group.users}
        users = User.query.filter(User.account_id.in_(user_ids)).all()
    else:
        return jsonify({"success": False, "message": "Invalid search type"}), 400

    for user in users:
        results.append({
            "status": user.status,
            "username": user.username,
            "displayName": user.display_name
        })

    print(jsonify({"success": 200, "results": results}))
    # return jsonify({"success": 200, "results": results})
    return results

# Endpoint to change password
@app.route('/changePassword', methods=['POST'])
def change_password():
    data = request.json
    username = data.get('username')
    new_password = data.get('newPassword')

    if not username or not new_password:
        return jsonify({"success": False, "message": "Username and new password are required"}), 400

    user = get_user_by_username(username)
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    user.password = new_password
    db.session.commit()
    return jsonify({"success": True, "message": "Password changed successfully"})

# Endpoint to change email
@app.route('/changeEmail', methods=['POST'])
def change_email():
    data = request.json
    username = data.get('username')
    new_email = data.get('newEmail')

    # print(data)
    if not username or not new_email:
        return jsonify({"success": False, "message": "Username and new email are required"}), 400

    user = get_user_by_username(username)
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    user.email = new_email
    db.session.commit()
    return jsonify({"success": True, "message": "Email changed successfully"})

# Endpoint to change bio
@app.route('/changeBio', methods=['POST'])
def change_bio():
    data = request.json
    username = data.get('username')
    new_bio = data.get('newBio')

    if not username or new_bio is None:
        return jsonify({"success": False, "message": "Username and new bio are required"}), 400

    user = get_user_by_username(username)
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    user.bio = new_bio
    db.session.commit()
    return jsonify({"success": True, "message": "Bio changed successfully"})

# Endpoint to change display name
@app.route('/changeDisplayName', methods=['POST'])
def change_display_name():
    data = request.json
    username = data.get('username')
    new_display_name = data.get('newDisplayName')

    if not username or not new_display_name:
        return jsonify({"success": False, "message": "Username and new display name are required"}), 400

    user = get_user_by_username(username)
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    user.display_name = new_display_name
    db.session.commit()
    return jsonify({"success": True, "message": "Display name changed successfully"})

# Endpoint to change status
@app.route('/changeStatus', methods=['POST'])
def change_status():
    data = request.json
    username = data.get('username')
    new_status = data.get('newStatus')

    if not username or not new_status:
        return jsonify({"success": False, "message": "Username and new status are required"}), 400

    user = get_user_by_username(username)
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    user.status = new_status
    db.session.commit()
    return jsonify({"success": True, "message": "Status changed successfully"})

# Endpoint to change profile picture link
@app.route('/changePFP', methods=['POST'])
def change_pfp():
    data = request.json
    username = data.get('username')
    new_pfp_link = data.get('newPFPLink')
    # print(data)
    # print(username, new_pfp_link)


    if not username or not new_pfp_link:
        return jsonify({"success": False, "message": "Username and new profile picture link are required"}), 400

    user = get_user_by_username(username)
    if not user:
        print("RAHHHH USER NOT FOUND")
        return jsonify({"success": False, "message": "User not found"}), 404

    user.pfp_link = new_pfp_link
    db.session.commit()
    return jsonify({"success": True, "message": "Profile picture link changed successfully"})

@app.route('/gcalLinked', methods=['POST'])
def gcalLinked():
    data = request.json
    username = data.get('username')

    return jsonify(200,UserGCAL.query.filter_by(username=username).first() != None)


@app.route('/checkFriendship', methods=['POST'])
def check_friendship():
    try:
        data = request.get_json()
        
        # Validate input
        if 'currentUsername' not in data or 'friendUsername' not in data:
            return jsonify({
                'success': False,
                'message': 'Missing required fields: currentUsername and friendUsername'
            }), 400
            
        current_username = data['currentUsername']
        friend_username = data['friendUsername']
        
        # Get user objects
        current_user = User.query.filter_by(username=current_username).first()
        friend_user = User.query.filter_by(username=friend_username).first()
        
        # Check if both users exist
        if not current_user:
            return jsonify({
                'success': False,
                'message': f'User {current_username} not found'
            }), 404
            
        if not friend_user:
            return jsonify({
                'success': False,
                'message': f'User {friend_username} not found'
            }), 404
            
        # Check if they're friends
        is_friend = friend_username in current_user.friends if current_user.friends else False
        
        return jsonify({
            'success': True,
            'areFriends': is_friend,
        }), 200
        
    except Exception as e:
        print(e)
        return jsonify({
            'success': False,
            'message': 'An error occurred while checking friendship status',
            'error': str(e)
        }), 500

@app.route('/addFriend', methods=['POST'])
def add_friend_endpoint():
    data = request.json
    current_user = data.get('current_user')
    friend_username = data.get('friend_username')

    if not current_user or not friend_username:
        return jsonify({"success": False, "message": "Current user and friend username are required"}), 400

    result = add_friend(current_user, friend_username)
    return jsonify(result)

@app.route('/removeFriend', methods=['POST'])
def remove_friend_endpoint():
    data = request.json
    current_user = data.get('current_user')
    friend_username = data.get('friend_username')

    if not current_user or not friend_username:
        return jsonify({"success": False, "message": "Current user and friend username are required"}), 400

    result = remove_friend(current_user, friend_username)
    return jsonify(result)



@app.route('/getFriends/<username>', methods=['GET'])
def get_user_friends(username):
    try:
        user = User.query.filter_by(username=username).first()
        
        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
            
        friends_details = []
        for friend_username in user.friends:
            friend = User.query.filter_by(username=friend_username).first()
            if friend: 
                friends_details.append({
                    'username': friend.username,
                    'display_name': friend.display_name or friend.username  
                })
        
        return jsonify({
            'success': True,
            'friends': friends_details
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'An error occurred while fetching friends',
            'error': str(e)
        }), 500




@app.route('/authorize')
def authorize():
    state = secrets.token_urlsafe(32)
    username = request.args.get('username')


    while state in cookies:
        state = secrets.token_urlsafe(32)

    flow = Flow.from_client_secrets_file(
        'client_secrets.json',
        scopes=SCOPES,
        redirect_uri='http://127.0.0.1:5000/oauth2callback'
    )

    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt="consent",
        state=state
    )

    session['state'] = state
    cookies[state] = {"username": username}

    session.modified=True
    # Instead of redirecting directly, return the URL for the frontend to handle
    return jsonify({
        'authUrl': authorization_url
    })

@app.route('/oauth2callback')
def oauth2callback():
    state = request.args.get('state')

    try:
        flow = Flow.from_client_secrets_file(
            'client_secrets.json',
            scopes=SCOPES,
            redirect_uri='http://127.0.0.1:5000/oauth2callback'
        )

        authorization_response = request.url
        flow.fetch_token(authorization_response=authorization_response)

        credentials = flow.credentials

        cookies[state]["token"] = credentials.token
        cookies[state]["refresh_token"] = credentials.refresh_token
        cookies[state]["token_uri"] = credentials.token_uri
        cookies[state]["client_id"] = credentials.client_id
        cookies[state]["client_secret"] = credentials.client_secret
        cookies[state]["scopes"] = credentials.scopes


        print(cookies[state])
        print("Session after storing credentials:", dict(session))

        decoded = jwt.decode(credentials.id_token, options={"verify_signature": False})
        google_email = decoded['email']

        response = jsonify({
            'success': True,
            'redirect_url': 'http://localhost:3000/ProfilePage'
        })

        session.modified = True
        response.set_cookie('auth_check', 'true', 
                          httponly=False, 
                          secure=False, 
                          samesite='Lax')


                                                                                                #INSERT FUNCTION TO ADD GCAL DATA INTO DB
        create_user_GCAL(cookies[state]["username"], credentials.token, credentials.refresh_token, credentials.token_uri, credentials.client_id,credentials.client_secret,credentials.scopes, google_email)
        return redirect('http://localhost:3000/ProfilePage')

    except Exception as e:
        print(f"OAuth callback error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/check-cred')
def check_cred():
    # Add detailed session debugging
    print("Current session at check-cred:", dict(session))
    print("Request cookies:", request.cookies)
    has_credentials = 'state' in session
    print("Has credentials:", has_credentials)
    
    return jsonify({
        'authenticated': has_credentials,
    })

@app.route('/addEvent', methods=['POST'])
def add_event():
    try:
        data = request.json
        friends = data['friends']
        description = data.get("description", '') + '\n' + f"With {', '.join(friends[:-1])}, and {friends[-1]}" if friends else data.get("description", '')
        
        event = {
            'summary': data['summary'],
            'description': description,
            'start': {
                'dateTime': data['startDateTime'],
                'timeZone': 'UTC',
            },
            'end': {
                'dateTime': data['endDateTime'],
                'timeZone': 'UTC',
            },
        }
        
        def check_calendar_conflicts(service, start_time, end_time):
            events_result = service.events().list(
                calendarId='primary',
                timeMin=start_time,
                timeMax=end_time,
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            
            events = events_result.get('items', [])
            return len(events) > 0
        
        conflicts = []
        non_gcal_users = []
        
        # Check for conflicts and identify non-GCAL users
        for friend in friends:
            friend_creds = UserGCAL.query.filter_by(username=friend).first()
            
            if friend_creds:
                friend_credentials = Credentials(
                    token=friend_creds.token,
                    refresh_token=friend_creds.refresh_token,
                    token_uri=friend_creds.token_uri,
                    client_id=friend_creds.client_id,
                    client_secret=friend_creds.client_secret,
                    scopes=SCOPES
                )
                
                try:
                    friend_service = build('calendar', 'v3', credentials=friend_credentials)
                    has_conflict = check_calendar_conflicts(
                        friend_service,
                        data['startDateTime'],
                        data['endDateTime']
                    )
                    
                    if has_conflict:
                        conflicts.append(friend)
                        
                except Exception as e:
                    print(f"Error checking calendar for {friend}: {str(e)}")
                    return jsonify({
                        'error': f'Failed to access calendar for user {friend}',
                        'details': str(e)
                    }), 500
            else:
                non_gcal_users.append(friend)
        
        if conflicts:
            return jsonify({
                'error': 'There is a Calendar Conflict for users invited (potentially you)',
                'conflicting_users': conflicts
            }), 409

        
        for friend in friends:
            if friend not in non_gcal_users:
                other_friends = [f for f in friends if f != friend]
                description = data.get("description", '')
                if other_friends:
                    description += '\n' + f"With {', '.join(other_friends[:-1])}, and {other_friends[-1]}" if len(other_friends) > 1 else f"\nWith {other_friends[0]}"
                
                event = {
                    'summary': data['summary'],
                    'description': description,
                    'start': {
                        'dateTime': data['startDateTime'],
                        'timeZone': 'UTC',
                    },
                    'end': {
                        'dateTime': data['endDateTime'],
                        'timeZone': 'UTC',
                    },
                }
                
                friend_creds = UserGCAL.query.filter_by(username=friend).first()
                friend_credentials = Credentials(
                    token=friend_creds.token,
                    refresh_token=friend_creds.refresh_token,
                    token_uri=friend_creds.token_uri,
                    client_id=friend_creds.client_id,
                    client_secret=friend_creds.client_secret,
                    scopes=SCOPES
                )
                
                friend_service = build('calendar', 'v3', credentials=friend_credentials)
                friend_service.events().insert(calendarId='primary', body=event).execute()

        def check_event_conflict(existing_events, new_start, new_end):
            new_start_dt = datetime.datetime.fromisoformat(new_start.replace('Z', ''))
            new_end_dt = datetime.datetime.fromisoformat(new_end.replace('Z', ''))
            
            for i in range(0, len(existing_events), 4):
                event_start = datetime.datetime.fromisoformat(existing_events[i + 1].replace('Z', ''))
                event_end = datetime.datetime.fromisoformat(existing_events[i + 2].replace('Z', ''))
                
                if (new_start_dt <= event_end and new_end_dt >= event_start):
                    return True
            return False

        for username in non_gcal_users:
            user = User.query.filter_by(username=username).first()
            if user:
                if user.events is None:
                    user.events = []
                    db.session.commit()
                
                if check_event_conflict(user.events, data['startDateTime'], data['endDateTime']):
                    conflicts.append(username)
                    continue
                
                other_friends = [f for f in friends if f != username]
                description = data.get("description", '')
                if other_friends:
                    description += '\n' + f"With {', '.join(other_friends[:-1])}, and {other_friends[-1]}" if len(other_friends) > 1 else f"\nWith {other_friends[0]}"
                
                new_events = user.events.copy() if user.events else []
                new_events.extend([
                    data['summary'],
                    data['startDateTime'],
                    data['endDateTime'],
                    description
                ])
                
                user.events = new_events
                db.session.add(user)
                db.session.commit()
                db.session.refresh(user)
                print(f"Events after update: {user.events}")

        if conflicts:
            return jsonify({
                'error': 'There is a Calendar Conflict for users invited',
                'conflicting_users': conflicts
            }), 409

        return jsonify({'success': True})
    
    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500


@app.route('/getEvents', methods=['GET'])
def get_events():
    try:
        username = request.args.get('username')
        user_creds = UserGCAL.query.filter_by(username=username).first()
        
        if user_creds:
            credentials = Credentials(
                token=user_creds.token,
                refresh_token=user_creds.refresh_token, 
                token_uri=user_creds.token_uri,
                client_id=user_creds.client_id,
                client_secret=user_creds.client_secret,
                scopes=SCOPES
            )

            service = build('calendar', 'v3', credentials=credentials)
            
            now = datetime.datetime.utcnow()
            two_weeks = now + datetime.timedelta(weeks=2)
            
            events_result = service.events().list(
                calendarId='primary',
                timeMin=now.isoformat() + 'Z',
                timeMax=two_weeks.isoformat() + 'Z',
                singleEvents=True,
                orderBy='startTime'
            ).execute()

            events = events_result.get('items', [])
            
            formatted_events = []
            for event in events:
                formatted_events.append({
                    'title': event.get('summary'),
                    'description': event.get('description'),
                    'start': event['start'].get('dateTime', event['start'].get('date')),
                    'end': event['end'].get('dateTime', event['end'].get('date'))
                })
            return jsonify({'events': formatted_events})
        
        else:
            user = User.query.filter_by(username=username).first()
            if not user:
                return jsonify({'error': 'User not found'}), 404

            formatted_events = []
            if user.events:

                # Process events in groups of 4 (summary, start, end, description)
                for i in range(0, len(user.events), 4):
                    formatted_events.append({
                        'title': user.events[i],
                        'start': user.events[i + 1],
                        'end': user.events[i + 2],
                        'description': user.events[i + 3]
                    })
            print("Printing formatted events")
            print(user.events)
            print(formatted_events)
            return jsonify({'events': formatted_events})

    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500

@app.route('/logout', methods=['POST', 'OPTIONS'])
def logout():
    try:
        # Revoke Google OAuth token if it exists
        if 'credentials' in session:
            try:
                credentials = session['credentials']
                revoke = requests.post('https://oauth2.googleapis.com/revoke',
                    params={'token': credentials['token']},
                    headers={'content-type': 'application/x-www-form-urlencoded'})
                
                if revoke.status_code == 200:
                    print('Successfully revoked Google OAuth token')
                else:
                    print('Failed to revoke Google OAuth token')
            except Exception as e:
                print(f"Error revoking Google OAuth token: {str(e)}")
        
        # Clear the session
        session.clear()
        
        # Create response object
        response = jsonify({'message': 'Successfully logged out'})
        
        # Clear cookies
        response.delete_cookie('session')
        response.delete_cookie('auth_check')
        response.delete_cookie('google_oauth_state')
        
        # Set cookie expiry in the past to ensure deletion
        response.set_cookie('session', '', expires=0)
        
        if request.method == 'OPTIONS':
            return response
            
        print(f"User logged out. Session cleared: {dict(session)}")
        
        return response
        
    except Exception as e:
        print(f"Logout error: {str(e)}")
        return jsonify({
            'error': 'Logout failed',
            'message': str(e)
        }), 500
  
@app.route('/api/upload-profile-picture', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    # username = request.files['username']
    # # change_pfp()
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 401
    
    if file and allowed_file(file.filename):
        # Secure the filename
        filename = secure_filename(file.filename)
        
        # Add timestamp to ensure uniqueness
        import time
        timestamp = str(int(time.time()))
        filename = f"{timestamp}_{filename}"
        
        # Create upload folder if it doesn't exist
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        
        # Save the file
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        return jsonify({
            'success': True,
            'imagePath': f'/profile-pictures/{filename}'
        })
    
    return jsonify({'error': 'File type not allowed'}), 404


def insert_dummy_data():
    # Insert dummy data into the User table
    user1 = User(
        account_id= 1,
        username="john_doe",
        password="password123",
        email="john@example.com",
        bio="Just a regular user.",
        display_name="John Doe",
        status="Active",
        groups=["Developers", "Designers"],
        pfp_link="/profile-pictures/TESTING.jpg",
        friends= ["jane_smith"],
        tags = [ 'Gym', 'Basketball', 'Bars', 'Clubs','Reading', 'DIY Projects',]
    )

    user2 = User(
        account_id=2,
        username="jane_smith",
        password="mypassword",
        email="jane@example.com",
        bio="I love coding and coffee.",
        display_name="Jane Smith",
        status="Busy",
        groups=["Developers"],
        pfp_link="/profile-pictures/defaultpfp.jpg",
        friends= ["john_doe"],
        tags = []

    )

    user3= User(
        account_id=3,
        username="joanArc",
        password="mypassword",
        email="joanArc@example.com",
        bio="I love Arcs.",
        display_name="of Arc, Joan",
        status="Busy",
        groups=["Developers", "Designers"],
        pfp_link="/profile-pictures/defaultpfp.jpg",
        friends= ["john_doe"],
        tags = ['Cooking', 'Festivals', 'Theater']
    )

    # Add users to the session and commit to generate account_ids
    
    db.session.add(user1)
    print("1")
    db.session.add(user2)
    print("2")
    db.session.add(user3)
    db.session.commit()

    # Use the generated account_ids for UserGCAL
    user_gcal1 = UserGCAL(
        account_id=1,  # Use the account_id from user1
        username="john_doe",
        token=john_doe['token'],
        refresh_token=john_doe['refresh_token'],
        token_uri=john_doe['token_uri'],
        client_id=john_doe['client_id'],
        client_secret=john_doe['client_secret'],
        scopes=john_doe['scopes'],
        email=john_doe['email']
    )

    user_gcal2 = UserGCAL(
        account_id=2,  # Use the account_id from user1
        username="jane_smith",
        token=jane_smith['token'],
        refresh_token=jane_smith['refresh_token'],
        token_uri=jane_smith['token_uri'],
        client_id=jane_smith['client_id'],
        client_secret=jane_smith['client_secret'],
        scopes=jane_smith['scopes'],
        email=jane_smith['email']
    )

    # user_gcal2 = UserGCAL(
    #     account_id=user2.account_id,  # Use the account_id from user2
    #     username="jane_smith",
    #     client_id="client456",
    #     project_id="project456",
    #     auth_uri="https://example.com/auth2",
    #     token_uri="https://example.com/token2",
    #     auth_provider_x509_cert_url="https://example.com/cert2",
    #     client_secret="secret456",
    #     redirect_uri="https://example.com/redirect2"
    # )

    # Insert dummy data into the Groups table
    group1 = Groups(
        group_name="Developers",
        users=[user1.account_id, user2.account_id]  # Use account_ids from users
    )

    group2 = Groups(
        group_name="Designers",
        users=[user1.account_id]  # Use account_id from user1
    )

    # Add and commit all the dummy data to the database
    db.session.add(user_gcal1)
    print("3")
    # db.session.add(user_gcal2)
    print("4")
    db.session.add(group1)
    print("5")
    print("6")
    db.session.commit()

    print("Dummy data inserted successfully.")

# Initialize the database on app startup
with app.app_context():
    init_db()
    insert_dummy_data()
    

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000,debug=True)
