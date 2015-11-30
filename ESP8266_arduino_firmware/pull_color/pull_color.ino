/*
 * Pull Color From ElasticSearch
 * This firmware get's the last 10 colors captured with the nodejs application
 * and fades between them.
 * Author: David Bates
 * License: MIT
 * Contributers: Erich Dalton, Chris Bonadeo
 * Adapted from examples from: Adafruit, Arduino
 */

#include <ESP8266WiFi.h>
 
const char* ssid     = ""; //Your Wifi SSID
const char* password = ""; //Your Wifi Password
 
const char* host = ""; //Your ElasticSearchEndpoint
int redPin = 12;
int grnPin = 14;
int bluPin = 16;

int redVal = 255;
int grnVal = 255; 
int bluVal = 255;
int hold = 500;
int repeat = 3;
int wait = 10;
int j = 0;
int DEBUG = 1;
int loopCount = 60;

int prevR = redVal;
int prevG = grnVal;
int prevB = bluVal;
 
void setup() {
  pinMode(redPin, OUTPUT);
  pinMode(grnPin, OUTPUT);
  pinMode(bluPin, OUTPUT);
  
  Serial.begin(115200);
  delay(10);
 
  // We start by connecting to a WiFi network
 
  Serial.println();
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
 
  Serial.println("");
  Serial.println("WiFi connected");  
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}
 
 
void loop() {
 
  Serial.print("connecting to ");
  Serial.println(host);
  
  // Use WiFiClient class to create TCP connections
  WiFiClient client;
  const int httpPort = 80; //<- elasticsearch api your's maybe on 9200
  if (!client.connect(host, httpPort)) {
    Serial.println("connection failed");
    return;
  }
  
  // We now create a URI for the request
  String url = "/twitter-tree/_search/?sort=timestamp:desc&size=2&fields=rgbColor.r,rgbColor.g,rgbColor.b";
  Serial.print("Requesting URL: ");
  Serial.println(url);
  
  // This will send the request to the server
  client.print("GET " + url + " HTTP/1.1\r\n" +
               "Host: " + host + "\r\n" + 
               "Connection: close\r\n\r\n");
  delay(10);
  
  // Read all the lines of the reply from server and print them to Serial
  String lines = "";
  while(client.available()){
    lines += client.readStringUntil('\r');
  }

  //Parse Lines into RGB Values
  Serial.println(lines);
  int leftParen = 0;
  int rightParen = 0;
  String greenKey = "\"rgbColor.g\":";
  String redKey = "\"rgbColor.r\":";
  String blueKey = "\"rgbColor.b\":";
  int greenInd = lines.indexOf(greenKey);
  lines = lines.substring(greenInd, lines.length());
  leftParen = lines.indexOf("[") + 1;
  rightParen = lines.indexOf("]");
  int firstGreen = lines.substring(leftParen, rightParen).toInt();
  int redInd = lines.indexOf(redKey);
  lines = lines.substring(redInd, lines.length());
  leftParen = lines.indexOf("[") + 1;
  rightParen = lines.indexOf("]");
  int firstRed = lines.substring(leftParen, rightParen).toInt();
  int blueInd = lines.indexOf(blueKey);
  lines = lines.substring(blueInd, lines.length());
  leftParen = lines.indexOf("[") + 1;
  rightParen = lines.indexOf("]");
  int firstBlue = lines.substring(leftParen, rightParen).toInt();
  
  Serial.print(firstRed);
  Serial.print(" ");
  Serial.print(firstGreen);
  Serial.print(" ");
  Serial.println(firstBlue);

  greenInd = lines.indexOf(greenKey);
  lines = lines.substring(greenInd, lines.length());
  leftParen = lines.indexOf("[") + 1;
  rightParen = lines.indexOf("]");
  int secondGreen = lines.substring(leftParen, rightParen).toInt();
  redInd = lines.indexOf(redKey);
  lines = lines.substring(redInd, lines.length());
  leftParen = lines.indexOf("[") + 1;
  rightParen = lines.indexOf("]");
  int secondRed = lines.substring(leftParen, rightParen).toInt();
  blueInd = lines.indexOf(blueKey);
  lines = lines.substring(blueInd, lines.length());
  leftParen = lines.indexOf("[") + 1;
  rightParen = lines.indexOf("]");
  int secondBlue = lines.substring(leftParen, rightParen).toInt();
  
  Serial.print(secondRed);
  Serial.print(" ");
  Serial.print(secondGreen);
  Serial.print(" ");
  Serial.println(secondBlue);

  crossFade(firstRed, firstGreen, firstBlue);
  crossFade(secondRed, secondGreen, secondBlue);
  
  
  Serial.println();
  Serial.println("closing connection");
 
}

int calculateStep(int prevValue, int endValue) {
  int step = endValue - prevValue; 
  if (step) {                      
    step = 1020/step;          
  } 
  return step;
}

int calculateVal(int step, int val, int i) {

  if ((step) && i % step == 0) { 
    if (step > 0) {             
      val += 1;           
    } 
    else if (step < 0) {        
      val -= 1;
    } 
  }
 
  if (val > 255) {
    val = 255;
  } 
  else if (val < 0) {
    val = 0;
  }
  return val;
}

void crossFade(int R, int G, int B) {

  int stepR = calculateStep(prevR, R);
  int stepG = calculateStep(prevG, G); 
  int stepB = calculateStep(prevB, B);

  for (int i = 0; i <= 1020; i++) {
    redVal = calculateVal(stepR, redVal, i);
    grnVal = calculateVal(stepG, grnVal, i);
    bluVal = calculateVal(stepB, bluVal, i);

    analogWrite(redPin, redVal);   // Write current values to LED pins
    analogWrite(grnPin, grnVal);      
    analogWrite(bluPin, bluVal); 

    delay(wait); 
      if (DEBUG) { // If we want serial output, print it at the 
      if (i == 0 or i % loopCount == 0) { // beginning, and every loopCount times
        Serial.print("Loop/RGB: #");
        Serial.print(i);
        Serial.print(" | ");
        Serial.print(redVal);
        Serial.print(" / ");
        Serial.print(grnVal);
        Serial.print(" / ");  
        Serial.println(bluVal); 
      } 
      DEBUG += 1;
    }
  }
  
  prevR = redVal; 
  prevG = grnVal; 
  prevB = bluVal;
  delay(hold); 
}

void setColor(int red, int green, int blue)
{
  analogWrite(redPin, map(red, 0, 255, 0, 1024));
  analogWrite(grnPin, map(green, 0, 255, 0, 1024));
  analogWrite(bluPin, map(blue, 0, 255, 0, 1024));  
}
