import spidev
import time
import os
import pynats

# open(bus, device) : open(X,Y) will open /dev/spidev-X.Y
spi = spidev.SpiDev()
spi.open(0,0)

# Read SPI data from MCP3008, Channel must be an integer 0-7
def ReadADC(ch):
    if ((ch > 7) or (ch < 0)):
        return -1
    adc = spi.xfer2([1,(8+ch)<<4,0])
    data = ((adc[1]&3)<<8) + adc[2]
    return data

# Convert data to voltage level
def ReadVolts(data,deci):
    volts = (data * 3.3) / float(1023)
    volts = round(volts,deci)
    return volts

# Calculate temperature from LM35 data
def ConvertTemp(data,deci):
    temp = data * 100
    temp = round(temp,deci)

    return temp

# Define sensor channels
light_ch = 0
temp_ch  = 1

# Define delay between readings
delay = 5 

c = pynats.Connection(verbose=True)
c.connect()


while True:
    
    # Read the light sensor data
    light_data = ReadADC(light_ch)
    light_volts = ReadVolts(light_data,2)
    
    # Read the temperature sensor data
    temp_data = ReadADC(temp_ch)
    temp_volts = ReadVolts(temp_data,4)
    temp       = ConvertTemp(temp_volts,2)
    
    # Print out results
    #print "Temp  : ",temp_data, " (",temp_volts ,"V) -->",temp,"~C    Light : ",light_data," (",light_volts,"V)"
    print "Light:",light_data

    data = '{ "brightness" :' + str(light_data) +'}'

   # Simple Publisher
    c.publish('humix.sense.brightness.event', data)
 
    # Delay seconds
    time.sleep(delay)
