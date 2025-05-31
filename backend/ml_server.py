from flask import Flask, jsonify, request
import pandas as pd
from sklearn.linear_model import LinearRegression
from datetime import datetime
from dateutil.relativedelta import relativedelta

app = Flask(__name__)

@app.route('/predictpower', methods=['POST'])
def predict_power():
    data = request.json
    df = pd.DataFrame(data)

    if df.shape[0] < 2:
        return jsonify([])

    # Convert timestamp to ordinal
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df['timestamp_ordinal'] = df['timestamp'].map(datetime.toordinal)

    # Train linear regression
    model = LinearRegression()
    model.fit(df[['timestamp_ordinal']], df['consumption'])

    # Generate monthly predictions up to July 2025
    last_date = df['timestamp'].max()
    end_date = datetime(2025, 7, 1)

    predictions = []
    next_date = last_date + relativedelta(months=1)
    while next_date <= end_date:
        pred_value = model.predict([[next_date.toordinal()]])[0]
        predictions.append({
            "timestamp": next_date.isoformat(),
            "consumption": pred_value
        })
        next_date += relativedelta(months=1)

    return jsonify(predictions)

if __name__ == '__main__':
    app.run(debug=True)
