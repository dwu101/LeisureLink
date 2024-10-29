from flask import Flask, request, jsonify
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import secrets
import requests
from google_auth_oauthlib.flow import Flow
from flask import redirect, session
import os

app = Flask(__name__)
app.secret_key = secrets.token_hex(16)
cookies = {}


@app.before_request
def make_session_permanent():
    session.permanent = True

@app.route('/')
def home():
    return "Backend is now running!!!!!!!!!!!!!!!"





os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'openid'
]
@app.route('/authorize')
def authorize():
    state = secrets.token_urlsafe(32)

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
    cookies[state] = {}

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

        cookies[state] = {
            'token': credentials.token,
            'refresh_token': credentials.refresh_token,
            'token_uri': credentials.token_uri,
            'client_id': credentials.client_id,
            'client_secret': credentials.client_secret,
            'scopes': credentials.scopes
        }

        print("Session after storing credentials:", dict(session))

        # Instead of redirecting, return a response that sets a cookie and then redirects
        response = jsonify({
            'success': True,
            'redirect_url': 'http://localhost:3000/AddEvent'
        })

        # Ensure the session is saved
        session.modified = True
                # Set an additional cookie to verify cookie functionality
        response.set_cookie('auth_check', 'true', 
                          httponly=False, 
                          secure=False, 
                          samesite='Lax')

        # Redirect after ensuring cookies are set
        return redirect('http://localhost:3000/AddEvent')

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
    curr = cookies[session['state']]
    try:
        if 'state' not in session:
            return jsonify({'error': 'Not authenticated'}), 401

        # Get credentials from session
        credentials = Credentials(
            token=curr['token'],
            refresh_token=curr['refresh_token'],
            token_uri=curr['token_uri'],
            client_id=curr['client_id'],
            client_secret=curr['client_secret'],
            scopes=curr['scopes']
        )

        # Build the service
        service = build('calendar', 'v3', credentials=credentials)

        # Get event details from request
        data = request.json
        
        event = {
            'summary': data['summary'],
            'description': data.get('description', ''),
            'start': {
                'dateTime': data['startDateTime'],
                'timeZone': 'UTC',
            },
            'end': {
                'dateTime': data['endDateTime'],
                'timeZone': 'UTC',
            },
        }

        # Add the event to the user's calendar
        event = service.events().insert(calendarId='primary', body=event).execute()
        return jsonify({'success': True, 'eventId': event['id']})

    except Exception as e:
        print(f"Error details: {str(e)}")
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

# @app.route('/search', methods=['POST', 'OPTIONS'])
# def search():
#     try:
#         data = request.get_json()
#         type = data['searchType']
#         item = data['query']

#         if type == "username": 
#             ret = [
#                 {
#                     "displayName": "John Doe",
#                     "username": "john123"
#                 },
#                 {
#                     "displayName": "Jone Smith",
#                     "username": "jone456"
#                 }
#             ]
#         elif type == "displayName":
#             ret = [
#                 {
#                     "displayName": "John Doe",
#                     "username": "john123"
#                 },
#                 {
#                     "displayName": "John Smith",
#                     "username": "jsmith456"
#                 },
#                 {
#                     "displayName": "John Wilson",
#                     "username": "jwilson789"
#                 },
#                 {
#                     "displayName": "John Brown",
#                     "username": "jbrown101"
#                 },
#                 {
#                     "displayName": "John Miller",
#                     "username": "jmiller202"
#                 }
#             ]
            
#         elif type == "group":
#             ret = [
#                     {
#                         "displayName": "Sarah Johnson",
#                         "username": "sjohnson123"
#                     },
#                     {
#                         "displayName": "Michael Chen",
#                         "username": "mchen456"
#                     },
#                     {
#                         "displayName": "Emma Rodriguez",
#                         "username": "erodriguez789"
#                     }
#                 ]
            
            
#         else:
#             return "Input Valid Search Type", 404 
        

#         return jsonify(ret)

#     except Exception as e:
#         return f"Error: {e}", 404

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000,debug=True)
