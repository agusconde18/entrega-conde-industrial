

#include <WiFi.h>
#include <WebServer.h>
#include "constants.h"

#include <Arduino.h>
#include "hardware/watchdog.h"

// Configuración del watchdog
#define WDT_TIMEOUT 5000  // Tiempo de espera en milisegundos


void actuator();
double resistanceToTemperature(double resistance);
double voltageToResistance(double voltage);
double getTemperature();
double getTemperature(bool notFilter); // Overloaded function declaration
double voltageValue();
long PIDCalculation(double setpoint, double input);



/***********************************************************CORE 1 SENSE FUNCTIONS **************************************/

// Data pin definitions
#define SENSOR_PIN 27
#define R1_VALUE 9750.0
#define SETPOINT_PIN 26
#define ACTUATOR_PIN 12
#define VOLTAGE 3.27
#define OFFSET_TEMP 8.0

#define PROMEDIO 15.0

// Termistor NTC 3950 info
#define termistorPin A3
#define termistorNominalRes 100000
#define termistorNominalTemp 25
#define termistorBValue 3950

// PID Vars
#define MAX_PID 100
#define MIN_PID 0
double kp = 1.5;
double ki = 0.007;
double kd = 15.0;
double Ts = 0.06;

double B = 0.8;

// PID working vars
double sumKi = 0;
double lastValue = 0;
volatile double temp;
volatile double setpoint = 0;
double pidAct;

/***********************************************************CORE 1 DISPLAY AND SENSE FUNCTIONS END **************************************/

/****************************************************************************CORE WIFI FUNCTIONS*************************************/
const char* ssid = "PicoW-Access-Point";
const char* password = "12345678";

// Configuración de la IP estática
IPAddress local_IP(192, 168, 0, 1);
IPAddress gateway(192, 168, 0, 1);
IPAddress subnet(255, 255, 0, 0);

WebServer server(80);

// Array float con ultimas 500 muestras de temperatura
volatile float tempArray[300] = {0};
volatile int indexArrayTemp = 0;

// Función para agregar encabezados CORS
void addCORSHeaders() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
}

void handleRoot() {
  addCORSHeaders();
  // Allow cache for 1 day
  server.sendHeader("Cache-Control", "public, max-age=86400");
  server.send(200, "text/html", homePage);
   server.client().stop();
}

void handleSetPoint() {
  addCORSHeaders();
  // extract from post request the setPoint value from a json object with name "temp": val
  // Serial
  //Serial.println("POST request received");
  //Serial.println(server.arg("temp"));
  
  if (server.hasArg("temp")) {
    String temp = server.arg("temp");
    setpoint = temp.toFloat();
    server.send(200, "text/html", "Set Point updated to: " + temp);
  } else {
    server.send(400, "text/html", "No setPoint received");
  }
   server.client().stop();
}

void handleGetActualTemp() {
  addCORSHeaders();
  server.send(200, "application/json", "{\"temp\":" + String(temp) + "}");
   server.client().stop();
}

void liveGraphGet() {
  addCORSHeaders();
  // Send as JSON array all the data from the temp array
  server.setContentLength(CONTENT_LENGTH_UNKNOWN);
  server.send(200, "application/json", "[");

    // create ordered array with the last 300 values and ignore the 0 values, keep in mind that the array is circular
    for (int i = indexArrayTemp; i < 300 + indexArrayTemp; i++) {
      if (tempArray[i % 300] != 0) {
        server.sendContent(String(tempArray[i % 300]));
        if(i < 299 + indexArrayTemp)
            server.sendContent(",");
      }
    }
  
  server.sendContent("]");
  server.sendContent(""); // Ensure the last chunk is sent
  server.client().stop(); // Close the connection
}

/****************************************************************************CORE WIFI FUNCTIONS END*************************************/
/****************************************************************************CORE 0 FUN**************************************************/
void loop() {
  server.handleClient();
  delay(1);
}



void handleNotFound() {
  String message = "File Not Found\n\n";
  message += "URI: ";
  message += server.uri();
  message += "\nMethod: ";
  message += (server.method() == HTTP_GET) ? "GET" : "POST"; // Include method
  server.send(404, "text/plain", message);
  //Serial.print("404: ");
  //Serial.println(server.uri()); // Log the not found URI
}



void setup() {
  //Serial.begin(115200);

  // Configurar la IP estática
  if (!WiFi.softAPConfig(local_IP, gateway, subnet)) {
    //Serial.println("Error al configurar la IP estática");
  }

  // Configurar el Pico W como Access Point
  WiFi.softAP(ssid, password);

  IPAddress IP = WiFi.softAPIP();
  //Serial.print("AP IP address: ");
  //Serial.println(IP);

  // Configurar el servidor HTTP
  server.on("/", HTTP_GET, handleRoot);
  
  server.on("/service/live-graph", HTTP_GET, liveGraphGet);
  server.on("/service/set-point", HTTP_POST, handleSetPoint);
  server.on("/service/live-temp", HTTP_GET, handleGetActualTemp);

  server.onNotFound(handleNotFound);

  // defailt or error

  server.begin();
}

/***********************************FUNCTIONS PID*************************************/


double filterTemp(double tempnew, double tempold)
{
    return tempnew * B + (1 - B) * tempold;
}


double getTempLastValue = -99999;

double getTemperature()
{
    // Get the value of the voltage
    double voltage = voltageValue();
    // Get the value of the resistance
    double resistance = voltageToResistance(voltage);
    // Get the value of the temperature
    double temp = resistanceToTemperature(resistance) - OFFSET_TEMP;

    if (getTempLastValue == -99999)
    {
        getTempLastValue = temp;
    }

    //return filterTemp(temp, getTempLastValue);

    double temp2 = temp * B + getTempLastValue * (1 - B);

    getTempLastValue = temp2;

    return temp2;
}

double getTemperature(bool notFilter)
{
    // Get the value of the voltage
    double voltage = voltageValue();
    // Get the value of the resistance
    double resistance = voltageToResistance(voltage);
    // Get the value of the temperature
    double temp = resistanceToTemperature(resistance);

    if (getTempLastValue == -99999)
    {
        getTempLastValue = temp;
    }

    return temp;
}

double voltageValue()
{
    // Get read analogRead PROMEDIO times and get the average
    double val = 0.0;
    for (int i = 0; i < PROMEDIO; i++)
    {
        val += analogRead(SENSOR_PIN);
    }
    val = val / PROMEDIO;
    return (val * VOLTAGE) / 4095.0;
}

/** Conversion de tension a resistencia */
double voltageToResistance(double voltage)
{
    return (R1_VALUE * voltage) / (VOLTAGE - voltage);
}

/** Conversion de resistencia a temperatura usando NTC 3950 */
double resistanceToTemperature(double resistance)
{
    double steinhart = resistance / termistorNominalRes; // (R/Ro)
    steinhart = log(steinhart);                          // ln(R/Ro)
    steinhart /= termistorBValue;                        // 1/B * ln(R/Ro)
    steinhart += 1.0 / (termistorNominalTemp + 273.15);  // + (1/To)
    steinhart = 1.0 / steinhart;                         // Invert
    steinhart -= 273.15;         
    
    return steinhart;
}

/** PID Calc tiene que si supera el valor 100 deja de aumentar el valor de la salida, y congela el valor de la suma integral */
double PIDCalculation_lastError = 0;
double lastTempPIDCalc = 0;
double lastD = 0;

long PIDCalculation(double setpoint, double input)
{
    double error = setpoint - input;
    // Proportional
    double P = kp * error;
    // Integral
    double I = ki * Ts * error ;
    sumKi += I;
    // Derivative
    double D = ((kd * (lastTempPIDCalc - input)) / Ts);
    lastD = D * 0.1d + lastD * 0.9d;
    
    double output = P + sumKi + lastD;

    if (output > MAX_PID)
    {
        output = MAX_PID;
        sumKi -= I;
    }
    else if (output < MIN_PID)
    {
        output = MIN_PID;
        sumKi -= I;
    }
    lastValue = input;
    PIDCalculation_lastError = error;
    lastTempPIDCalc = input;
    // set mayor a 290
    output = setpoint > 290.0 ? 100.0 : output;
    return output;
}


// Zero crossing actuator
// Example: if PID is 20% the actuator will be 20ms on and 80ms off
long lastMillisActuator = 0;
bool actuatorState = false;
double longTiempo = Ts * 1000;
void actuator()
{
    double pid = pidAct;

    // validation
    pid = pid > 100 ? 100 : pid;
    pid = pid < 0 ? 0 : pid;

    double pidDecimal = pid / 100.0;

    double highTime = pidDecimal * longTiempo;
    double lowTime = longTiempo - highTime;

    double actualRemainingTime = actuatorState ? highTime : lowTime;

    if (millis() - lastMillisActuator > actualRemainingTime)
    {
        actuatorState = !actuatorState;
        lastMillisActuator = millis();

        double newTime = actuatorState ? highTime : lowTime;
        if (newTime == 0)
        {
            actuatorState = !actuatorState;
        }
    }

    digitalWrite(ACTUATOR_PIN, actuatorState);
}

/****************************************************************************CORE 1 FUN**************************************************/

// Running on core1
void setup1() {
  // set pin 13 as output
    pinMode(LED_BUILTIN, OUTPUT);
    //Serial.begin(250000);
    // Initialize adc1_7 arduino as input
    pinMode(SENSOR_PIN, INPUT);
    pinMode(SETPOINT_PIN, INPUT);
    pinMode(ACTUATOR_PIN, OUTPUT);
    // Native ADC 12 bits calibration esp32
    analogReadResolution(12);


    // Initialize actuator
    digitalWrite(ACTUATOR_PIN, LOW);

    temp = getTemperature();

    delay(2000); // Pause for 2 seconds
    watchdog_enable(WDT_TIMEOUT, true);  // Inicializar el watchdog con el tiempo de espera
}

bool led = false;

long millisLast = 0;
long countSaveArray = 0;

void loop1() {
// Reiniciar el watchdog
  watchdog_update();
  // Print setpoint and temp in OLED Display
    actuator();

    if (millis() - millisLast < Ts * 1000)
    {
        return;
    }

    // Tareas cada 500ms
    millisLast = millis();
    temp = getTemperature();
    // Get the value of the PID
    pidAct = PIDCalculation(setpoint, temp);

    // togle led
    led = !led;
    digitalWrite(LED_BUILTIN, led);

    // save to array last temperature every 1 second 
    if(countSaveArray == 20)
    {
        tempArray[indexArrayTemp] = temp;
        indexArrayTemp++;
        if(indexArrayTemp == 300)
        {
            indexArrayTemp = 0;
        }
        countSaveArray = 0;
    }
    countSaveArray++;

}
