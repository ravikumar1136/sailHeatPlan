# app.py
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import numpy as np
import io
import os
from werkzeug.utils import secure_filename
from datetime import datetime
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity

app = Flask(__name__)
CORS(app)

# Configure JWT
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'dev-secret-key')
jwt = JWTManager(app)

# In-memory user database (replace with a real database in production)
users = {
    'admin@sail.co.in': {
        'password': 'password123',
        'name': 'Admin User'
    }
}

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    
    user = users.get(email)
    if not user or user['password'] != password:
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Create access token
    access_token = create_access_token(identity=email)
    return jsonify({
        'access_token': access_token,
        'user': {
            'email': email,
            'name': user['name']
        }
    })

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    
    if not email or not password or not name:
        return jsonify({'error': 'Email, password, and name are required'}), 400
    
    if email in users:
        return jsonify({'error': 'User already exists'}), 409
    
    # Add user to database
    users[email] = {
        'password': password,
        'name': name
    }
    
    # Create access token
    access_token = create_access_token(identity=email)
    return jsonify({
        'access_token': access_token,
        'user': {
            'email': email,
            'name': name
        }
    })

@app.route('/api/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user = get_jwt_identity()
    user = users.get(current_user)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'email': current_user,
        'name': user['name']
    })

@app.route('/api/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    current_user = get_jwt_identity()
    data = request.json
    name = data.get('name')
    
    if not name:
        return jsonify({'error': 'Name is required'}), 400
    
    if current_user not in users:
        return jsonify({'error': 'User not found'}), 404
    
    users[current_user]['name'] = name
    return jsonify({
        'email': current_user,
        'name': name
    })

@app.route('/api/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    current_user = get_jwt_identity()
    data = request.json
    current_password = data.get('currentPassword')
    new_password = data.get('newPassword')
    
    if not current_password or not new_password:
        return jsonify({'error': 'Current password and new password are required'}), 400
    
    if current_user not in users:
        return jsonify({'error': 'User not found'}), 404
    
    if users[current_user]['password'] != current_password:
        return jsonify({'error': 'Current password is incorrect'}), 401
    
    users[current_user]['password'] = new_password
    return jsonify({'message': 'Password updated successfully'})

@app.route('/api/generate-heat-plan', methods=['POST'])
def generate_heat_plan():
    if 'orderFile' not in request.files or 'stockFile' not in request.files:
        return jsonify({'error': 'Both order and stock files are required'}), 400
    
    order_file = request.files['orderFile']
    stock_file = request.files['stockFile']
    
    if order_file.filename == '' or stock_file.filename == '':
        return jsonify({'error': 'Both order and stock files are required'}), 400
    
    try:
        print("\nReading input files...")
        print(f"Order file: {order_file.filename}")
        print(f"Stock file: {stock_file.filename}")
        
        # Read Excel files with explicit engine
        try:
            order_data = pd.read_excel(order_file, engine='openpyxl')
            print("\nOrder data columns found:", order_data.columns.tolist())
        except Exception as e:
            print(f"Error reading order file: {str(e)}")
            return jsonify({'error': f'Error reading order file: Please ensure it is a valid Excel file with columns: Grade, Wid, B Qty, Customer'}), 400
            
        try:
            stock_data = pd.read_excel(stock_file, engine='openpyxl')
            print("\nStock data columns found:", stock_data.columns.tolist())
        except Exception as e:
            print(f"Error reading stock file: {str(e)}")
            return jsonify({'error': f'Error reading stock file: Please ensure it is a valid Excel file with columns: GRD, WIDT, PKT'}), 400
        
        # Process data to generate heat plan
        try:
            result = process_heat_plan(order_data, stock_data)
            heat_plan = result['heat_plan']
            stock_availability = result['stock_availability']
            
            if heat_plan.empty and stock_availability.empty:
                return jsonify({'error': 'No heat plan items or stock availability found. Please check your data.'}), 400
            
            # Convert to dictionary for JSON response
            response_data = {
                'heat_plan': heat_plan.to_dict(orient='records') if not heat_plan.empty else [],
                'stock_availability': stock_availability.to_dict(orient='records') if not stock_availability.empty else []
            }
            
            return jsonify({'data': response_data})
            
        except ValueError as ve:
            print(f"Validation error: {str(ve)}")
            return jsonify({'error': str(ve)}), 400
        except Exception as e:
            print(f"Processing error: {str(e)}")
            return jsonify({'error': 'Error processing data: ' + str(e)}), 500
    
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        import traceback
        print("Full traceback:", traceback.format_exc())
        return jsonify({'error': 'Error processing files. Please check your data format and try again.'}), 500

def get_heat_plan_width(grade, order_width):
    """
    Calculate heat plan width based on grade and order width.
    """
    # If width is less than 650, default to 800
    if order_width < 650:
        return 800
    
    # Width mapping for all grades
    mapping = {
        700: 735,
        750: 775,
        800: 835,
        810: 835,
        890: 935,
        1000: 1050,
        1020: 1050,
        1025: 1050,
        1100: 1125,
        1150: 1170,
        1200: 1225,
        1230: 1265,
        1250: 1275,
        1255: 1275
    }
    
    # Special handling for Grade 201
    if grade == "201" and order_width == 1250:
        return 1295
    
    # Sort mapping keys
    sorted_widths = sorted(mapping.keys())
    
    # Check for exact match
    if order_width in mapping:
        return mapping[order_width]
    
    # Round up to next available width
    for width in sorted_widths:
        if width > order_width:
            return mapping[width]
    
    # If width is larger than any in mapping, use the largest available
    return mapping[sorted_widths[-1]]

def get_stock_width(grade, width):
    """
    Get the actual width to check in stock based on grade and order width.
    """
    if grade == "201" and width == 1250:
        return 1295
    return width

def process_heat_plan(order_data, stock_data):
    """
    Process order and stock data to generate a heat plan and stock availability.
    """
    try:
        # 1. Data Validation
        if order_data.empty or stock_data.empty:
            raise ValueError("Order data or stock data is empty")
            
        # 2. Verify required columns
        required_order_columns = ['Grade', 'Wid', 'B Qty', 'Customer']
        required_stock_columns = ['GRD', 'WIDT', 'PKT']
        
        missing_order_cols = [col for col in required_order_columns if col not in order_data.columns]
        missing_stock_cols = [col for col in required_stock_columns if col not in stock_data.columns]
        
        if missing_order_cols or missing_stock_cols:
            raise ValueError(f"Missing columns. Order: {missing_order_cols}, Stock: {missing_stock_cols}")

        # 3. Create clean copies and prepare data
        stock = stock_data.copy()
        orders = order_data.copy()
        
        # Clean stock data - maintain original values, just remove nulls and spaces
        stock['GRD'] = stock['GRD'].fillna('').astype(str).str.strip()
        stock['WIDT'] = pd.to_numeric(stock['WIDT'], errors='coerce')
        stock['PKT'] = stock['PKT'].fillna('').astype(str).str.strip()
        
        # Clean order data - maintain original values, just remove nulls and spaces
        orders['Grade'] = orders['Grade'].fillna('').astype(str).str.strip()
        orders['Wid'] = pd.to_numeric(orders['Wid'], errors='coerce')
        orders['Customer'] = orders['Customer'].fillna('').astype(str).str.strip()
        # Keep B Qty exactly as is to preserve original values including NaN
        
        # Remove invalid rows but preserve original data format
        stock = stock[
            (stock['GRD'] != '') & 
            (stock['PKT'] != '') & 
            (~stock['WIDT'].isna())
        ].reset_index(drop=True)
        
        orders = orders[
            (orders['Grade'] != '') & 
            (~orders['Wid'].isna()) & 
            (orders['Customer'] != '')
        ].reset_index(drop=True)

        # 4. Initialize result containers
        orders_from_stock = []
        used_pkts = set()

        # First, handle 201LN grade specifically to ensure both orders are matched
        ln_orders = orders[orders['Grade'] == '201LN'].copy()
        ln_stock = stock[stock['GRD'] == '201LN'].copy()
        
        # Match 201LN orders first
        for _, order in ln_orders.iterrows():
            # Find ALL matching unused stock for this order
            available_stock = ln_stock[
                (ln_stock['WIDT'] == order['Wid']) & 
                (~ln_stock['PKT'].isin(used_pkts))
            ]
            
            # Try to match with each available stock item
            for _, stock_match in available_stock.iterrows():
                # Create the match
                orders_from_stock.append({
                    'grade': stock_match['GRD'],
                    'width': stock_match['WIDT'],
                    'pkt': stock_match['PKT']
                })
                
                # Mark this PKT as used
                used_pkts.add(stock_match['PKT'])

        # Then process all other orders
        other_orders = orders[orders['Grade'] != '201LN']
        for _, order in other_orders.iterrows():
            # Find matching unused stock
            available_stock = stock[
                (stock['GRD'] == order['Grade']) & 
                (stock['WIDT'] == order['Wid']) & 
                (~stock['PKT'].isin(used_pkts))
            ]
            
            if not available_stock.empty:
                # Get the first available stock
                stock_match = available_stock.iloc[0]
                
                # Create the match
                orders_from_stock.append({
                    'grade': stock_match['GRD'],
                    'width': stock_match['WIDT'],
                    'pkt': stock_match['PKT']
                })
                
                # Mark this PKT as used
                used_pkts.add(stock_match['PKT'])

        # Create final stock availability DataFrame
        stock_availability = pd.DataFrame(orders_from_stock)
        if not stock_availability.empty:
            stock_availability = stock_availability.sort_values(
                ['grade', 'width', 'pkt']
            ).reset_index(drop=True)

        # Process remaining orders for heat plan
        remaining_mask = ~orders.apply(
            lambda x: any(
                (m['grade'] == x['Grade']) and 
                (m['width'] == x['Wid'])
                for m in orders_from_stock
            ),
            axis=1
        )
        remaining_orders = orders[remaining_mask]

        # Process heat plan only if we have remaining orders
        if not remaining_orders.empty:
            # Convert B Qty to numeric for calculations
            remaining_orders['B Qty'] = pd.to_numeric(remaining_orders['B Qty'], errors='coerce')
            valid_orders = remaining_orders[pd.notna(remaining_orders['B Qty'])]

            if not valid_orders.empty:
                # Apply width mapping for heat plan
                valid_orders['heat_plan_width'] = valid_orders.apply(
                    lambda row: get_heat_plan_width(row['Grade'], row['Wid']), 
                    axis=1
                )
                
                # Group by grade and mapped width
                grouped = valid_orders.groupby(['Grade', 'heat_plan_width'])['B Qty'].sum().reset_index()
                grouped['no_of_heats'] = np.ceil(grouped['B Qty'] / 60)
                
                heat_plan_result = pd.DataFrame({
                    'grade': grouped['Grade'],
                    'width': grouped['heat_plan_width'],
                    'slab_wt': '',
                    'no_of_heats': grouped['no_of_heats'],
                    'qty': grouped['B Qty']
                })
            else:
                heat_plan_result = pd.DataFrame()
        else:
            heat_plan_result = pd.DataFrame()

        return {
            'heat_plan': heat_plan_result,
            'stock_availability': stock_availability
        }

    except Exception as e:
        print(f"Error in process_heat_plan: {str(e)}")
        raise e

@app.route('/api/download-heat-plan', methods=['POST'])
def download_heat_plan():
    try:
        data = request.json
        heat_plan_data = data.get('data')
        
        if not heat_plan_data:
            return jsonify({'error': 'Heat plan data is required'}), 400
        
        # Convert to DataFrame
        df = pd.DataFrame(heat_plan_data)
        
        # Create Excel file in memory
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            df.to_excel(writer, sheet_name='Heat Plan', index=False)
            
            # Get the xlsxwriter workbook and worksheet objects
            workbook = writer.book
            worksheet = writer.sheets['Heat Plan']
            
            # Add some formatting
            header_format = workbook.add_format({
                'bold': True,
                'text_wrap': True,
                'valign': 'top',
                'fg_color': '#D7E4BC',
                'border': 1
            })
            
            # Write the column headers with the defined format
            for col_num, value in enumerate(df.columns.values):
                worksheet.write(0, col_num, value, header_format)
                
            # Set column widths
            worksheet.set_column('A:A', 15)  # Grade
            worksheet.set_column('B:B', 12)  # Width
            worksheet.set_column('C:C', 12)  # Slab wt
            worksheet.set_column('D:D', 12)  # NO OF HEATS
            worksheet.set_column('E:E', 12)  # QTY
        
        output.seek(0)
        
        # Generate filename with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"heat_plan_{timestamp}.xlsx"
        
        return send_file(
            output,
            as_attachment=True,
            download_name=filename,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)