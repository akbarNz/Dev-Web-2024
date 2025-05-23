from machine import Pin, I2C, UART
import time
from ads1x15 import ADS1115

# Configuration UART
uart = UART(0, baudrate=115200)
print("lancé !")

# I2C pour ADS1115
i2c = I2C(1, scl=Pin(11), sda=Pin(10))
print("Scan I2C:", i2c.scan())  # doit contenir 0x48
GAIN = 1
ads = ADS1115(i2c, address=0x48, gain=GAIN)
THRESHOLD = 10000

# Décodeur HEF4511BP
decode_data_pins = [
    Pin(2, Pin.OUT),
    Pin(3, Pin.OUT),
    Pin(6, Pin.OUT),
    Pin(7, Pin.OUT)
]

bcd_digits = [
    [0, 0, 0, 0], [0, 0, 0, 1], [0, 0, 1, 0], [0, 0, 1, 1],
    [0, 1, 0, 0], [0, 1, 0, 1], [0, 1, 1, 0], [0, 1, 1, 1],
    [1, 0, 0, 0], [1, 0, 0, 1]
]

enable_left = Pin(4, Pin.OUT)   # afficheur gauche
enable_right = Pin(26, Pin.OUT) # afficheur droit

led_red = Pin(9, Pin.OUT)
led_green = Pin(8, Pin.OUT)

capteur_bas_index = 0
capteur_haut_index = 1

count = 0
MAX_PEOPLE = 5

# États de détection
etat = 0  # 0: rien, 1: capteur bas d'abord, 2: capteur haut d'abord
last_trigger_time = 0
detection_timeout = 1000  # 1 seconde max entre deux déclenchements

def set_digit(value):
    if 0 <= value <= 9:
        bits = bcd_digits[value]
    else:
        bits = [0, 0, 0, 0]  # Sécurité si hors plage

    # Envoi dans l’ordre D3 → D0 vers GPIO7 → GPIO2
    for pin, bit in zip(decode_data_pins[::-1], bits):
        pin.value(bit)

def update_display(value):
    tens = value // 10
    ones = value % 10

    # Afficheur droit = unité
    enable_left.value(1)  # désactive gauche
    enable_right.value(0)  # active droit
    set_digit(ones)
    time.sleep(0.004)

    # Afficheur gauche = dizaine
    enable_right.value(1)  # désactive droit
    enable_left.value(0)  # active gauche
    set_digit(tens)
    time.sleep(0.004)

    # Éteint tous pour éviter ghosting
    enable_left.value(1)
    enable_right.value(1)

def update_led():
    if count > MAX_PEOPLE:
        blink = (time.ticks_ms() % 1000) < 500
        led_red.value(1 if blink else 0)
        led_green.value(0)
    else:
        led_red.value(0)
        led_green.value(1)

def check_uart_commands():
    global MAX_PEOPLE
    if uart.any():
        command = uart.readline().decode('utf-8').strip()
        if command.startswith("SET_LIMIT:"):
            try:
                new_limit = int(command.split(":")[1])
                if new_limit > 0:
                    MAX_PEOPLE = new_limit
                    uart.write(f"LIMIT_UPDATED:{MAX_PEOPLE}\n".encode())
                else:
                    uart.write("ERROR:Limite doit être positive\n".encode())
            except:
                uart.write("ERROR:Format invalide\n".encode())

print("Démarrage du système...")
uart.write("SYSTEM_READY\n".encode())

while True:
    check_uart_commands()
    update_display(count)
    update_led()

    val_bas = ads.read_single_ended(capteur_bas_index)
    val_haut = ads.read_single_ended(capteur_haut_index)
    now = time.ticks_ms()

    print("Bas =", val_bas, " | Haut =", val_haut)  # Affichage continu

    # Transition d’état
    if etat == 0:
        if val_bas > THRESHOLD:
            etat = 1
            last_trigger_time = now
            print("Capteur bas déclenché en premier")
        elif val_haut > THRESHOLD:
            etat = 2
            last_trigger_time = now
            print("Capteur haut déclenché en premier")

    elif etat == 1:  # bas a été déclenché en premier
        if val_haut > THRESHOLD:
            count += 1
            print("Entrée détectée → Nombre de personnes :", count)
            etat = 0
            time.sleep(1)

    elif etat == 2:  # haut a été déclenché en premier
        if val_bas > THRESHOLD:
            count = max(0, count - 1)
            print("Sortie détectée → Nombre de personnes :", count)
            etat = 0
            time.sleep(1)

    # Réinitialisation si trop de délai
    if etat != 0 and time.ticks_diff(now, last_trigger_time) > detection_timeout:
        print("Délai dépassé sans deuxième capteur → Reset état")
        etat = 0

    time.sleep(0.001)
