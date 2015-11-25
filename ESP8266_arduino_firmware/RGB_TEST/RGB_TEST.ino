/*
ESP8266 RGB Test
Author: David Bates
This firmware fades each of the led's in turn in order to test both 
PWM and LEDs. Assumes knowledge of ESP8266
*/
int redPin = 12;
int greenPin = 14;
int bluePin = 16;

void setup() {
  pinMode(greenPin, OUTPUT);     // Initialize the BUILTIN_LED pin as an output
pinMode(bluePin, OUTPUT);
pinMode(redPin, OUTPUT);
}

// the loop function runs over and over again forever
void loop() {

  for (int a = 0; a < 3; a++){
    int pin = redPin;
    if(a == 0){
      pin = redPin;
    }
    if(a == 1){
      pin = greenPin;
    }
    if(a == 2){
      pin = bluePin;
    }
  for (int i = 0; i < 1024;) {
                       // Wait for two seconds (to demonstrate the active low LED)
analogWrite(pin, i);  // Turn the LED off by making the voltage HIGH
  delay(5);  
  i = i + 8;
  }
  for (int i = 1024; i > 0; ) {
                       // Wait for two seconds (to demonstrate the active low LED)
analogWrite(pin, i);  // Turn the LED off by making the voltage HIGH
  delay(5); 
   i = i - 8; 
  }
  analogWrite(pin, 0);
  }
}

