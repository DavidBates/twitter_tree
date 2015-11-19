#include <ESP8266WiFi.h>
 
const char* ssid     = "YourSSID";
const char* password = "YourPassword";
 
const char* host = "ElasticSearchEndpoint";
 
void setup() {
  pinMode(4, OUTPUT);
  pinMode(12, OUTPUT);
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
 
int value = 0;
 
void loop() {
  delay(5000);
  ++value;
 
  Serial.print("connecting to ");
  Serial.println(host);
  
  // Use WiFiClient class to create TCP connections
  WiFiClient client;
  const int httpPort = 9200; //<- elasticsearch api
  if (!client.connect(host, httpPort)) {
    Serial.println("connection failed");
    return;
  }
  
  // We now create a URI for the request
  String url = "/christmas_tree/tweets/?";//Need to finalize query
  Serial.print("Requesting URL: ");
  Serial.println(url);
  
  // This will send the request to the server
  client.print(String("GET ") + url + " HTTP/1.1\r\n" +
               "Host: " + host + "\r\n" + 
               "Connection: close\r\n\r\n");
  delay(10);
  
  // Read all the lines of the reply from server and print them to Serial
  while(client.available()){
    String line = client.readStringUntil('\r');
    Serial.print(line);
    if(line.lastIndexOf("\"on\":true") > -1){
      Serial.print("Got a color");
      //Parse hex/rgb and set tree color. 
    }
  }
  
  Serial.println();
  Serial.println("closing connection");
 
}