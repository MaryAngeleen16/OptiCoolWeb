from flask import Flask, request, jsonify
import RPi.GPIO as GPIO
from pymodbus.client.sync import ModbusTcpClient
import time
import threading

# Configuration
ESP32_HOST = "192.168.1.104"
ESP8266_HOST = "192.168.1.102"
PORT = 8080

app = Flask(__name__)

# Define GPIO pins for appliances
APPLIANCES = {
    "ac1": 17,
    "ac2": 18,
    "fan1": 22,
    "fan2": 23
}

GPIO.setmode(GPIO.BCM)
for pin in APPLIANCES.values():
    GPIO.setup(pin, GPIO.OUT)
    GPIO.output(pin, GPIO.LOW)

# Modbus client setup
modbus_client = ModbusTcpClient('192.168.1.100')

auto_mode = True  
temperature = 25  
ac_status = False
fan_status = False
override = False  
last_adjustment_time = 0  # Stores last auto-control adjustment time


def get_sensor_data():
    """
    Reads temperature and humidity values from Modbus sensors.
    Returns: Indoor temperature, indoor humidity, outdoor temperature, outdoor humidity.
    """
    try:
        indoor_temp = modbus_client.read_input_registers(0, 1).registers[0]
        indoor_humidity = modbus_client.read_input_registers(1, 1).registers[0]
        outdoor_temp = modbus_client.read_input_registers(2, 1).registers[0]
        outdoor_humidity = modbus_client.read_input_registers(3, 1).registers[0]
        return indoor_temp, indoor_humidity, outdoor_temp, outdoor_humidity
    except Exception as e:
        print(f"Error reading sensor data: {e}")
        return None, None, None, None


def calculate_optimized_temperature(indoor_temp, indoor_humidity, outdoor_temp):
    """
    Calculates an optimized AC setpoint based on indoor/outdoor temperature and humidity.
    """
    K = 0.3  # Weighting factor for outdoor influence

    # Humidity-based adjustment
    if indoor_humidity > 65:
        humidity_adjustment = -1  # Lower temp for high humidity
    elif indoor_humidity < 40:
        humidity_adjustment = 1  # Raise temp for low humidity
    else:
        humidity_adjustment = 0  # No adjustment

    # Optimized temperature formula
    optimized_temp = indoor_temp + K * (outdoor_temp - indoor_temp) + humidity_adjustment
    return round(optimized_temp, 1)


def auto_control():
    """
    Automatically adjusts AC and fan based on optimized temperature every 20-30 minutes.
    """
    global ac_status, fan_status, temperature, last_adjustment_time

    while True:
        if not auto_mode or override:
            time.sleep(60)  # Wait before checking again
            continue

        current_time = time.time()
        if current_time - last_adjustment_time < 1200:
            time.sleep(60)
            continue

        indoor_temp, indoor_humidity, outdoor_temp, _ = get_sensor_data()
        if indoor_temp is None:
            time.sleep(60)
            continue

        optimized_temp = calculate_optimized_temperature(indoor_temp, indoor_humidity, outdoor_temp)

        # Control logic
        if indoor_temp > optimized_temp:
            ac_status = True
            fan_status = False
        else:
            ac_status = False
            fan_status = True

        # Apply to GPIO
        GPIO.output(APPLIANCES["ac1"], GPIO.HIGH if ac_status else GPIO.LOW)
        GPIO.output(APPLIANCES["ac2"], GPIO.HIGH if ac_status else GPIO.LOW)
        GPIO.output(APPLIANCES["fan1"], GPIO.HIGH if fan_status else GPIO.LOW)
        GPIO.output(APPLIANCES["fan2"], GPIO.HIGH if fan_status else GPIO.LOW)

        # Update temperature and last adjustment time
        temperature = optimized_temp
        last_adjustment_time = current_time
        time.sleep(60)


@app.route('/set_mode', methods=['POST'])
def set_mode():
    global auto_mode
    data = request.json
    if "mode" in data and data["mode"] in ["auto", "manual"]:
        auto_mode = (data["mode"] == "auto")
        return jsonify({"message": f"Mode set to {data['mode']}"}), 200
    return jsonify({"error": "Invalid mode"}), 400


@app.route('/status', methods=['GET'])
def status():
    return jsonify({
        "mode": "auto" if auto_mode else "manual",
        "temperature": temperature,
        "ac_status": ac_status,
        "fan_status": fan_status,
        "override": override
    }), 200


if __name__ == '__main__':
    threading.Thread(target=auto_control, daemon=True).start()
    app.run(host='0.0.0.0', port=5000, debug=True)
