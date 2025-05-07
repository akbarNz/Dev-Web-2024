from machine import Pin
from time import sleep, ticks_ms

# Configuration des broches
pir1_pin = Pin(2, Pin.IN)  # Capteur PIR 1 (entrée)
pir2_pin = Pin(3, Pin.IN)  # Capteur PIR 2 (sortie)
led_rouge = Pin(5, Pin.OUT)  # LED rouge
led_verte = Pin(4, Pin.OUT)  # LED verte

# Broches pour l'afficheur 7 segments (a, b, c, d, e, f, g, dp)
segments = [
    Pin(12, Pin.OUT),  # a
    Pin(13, Pin.OUT),  # b
    Pin(6, Pin.OUT),  # c
    Pin(7, Pin.OUT),  # d
    Pin(8, Pin.OUT),  # e
    Pin(9, Pin.OUT),  # f
    Pin(10, Pin.OUT), # g
    Pin(11, Pin.OUT)  # dp (point décimal, non utilisé ici)
]

# Encodage des chiffres pour un afficheur 7 segments (à cathode commune)
chiffres = {
    0: [1, 1, 1, 1, 1, 1, 0, 0],
    1: [0, 1, 1, 0, 0, 0, 0, 0],
    2: [1, 1, 0, 1, 1, 0, 1, 0],
    3: [1, 1, 1, 1, 0, 0, 1, 0],
    4: [0, 1, 1, 0, 0, 1, 1, 0],
    5: [1, 0, 1, 1, 0, 1, 1, 0],
    6: [1, 0, 1, 1, 1, 1, 1, 0],
    7: [1, 1, 1, 0, 0, 0, 0, 0],
    8: [1, 1, 1, 1, 1, 1, 1, 0],
    9: [1, 1, 1, 1, 0, 1, 1, 0]
}

# Variables globales
compteur = 0
limite_personnes = 5
dernier_pir1 = 0
dernier_pir2 = 0
delai_max = 2000  # 2 secondes max entre les 2 capteurs

# Fonction pour afficher un chiffre sur l'afficheur 7 segments
def afficher_chiffre(chiffre):
    for i in range(7):  
        segments[i].value(chiffres[chiffre][i])

# Fonction pour détecter les entrées et sorties
def detecter_passage():
    global compteur, dernier_pir1, dernier_pir2

    if pir1_pin.value() == 1 and ticks_ms() - dernier_pir1 > 1000:  # Anti-rebond
        dernier_pir1 = ticks_ms()
        print("Détection PIR1 (Entrée)")
    
    if pir2_pin.value() == 1 and ticks_ms() - dernier_pir2 > 1000:  # Anti-rebond
        dernier_pir2 = ticks_ms()
        print("Détection PIR2 (Sortie)")

    if dernier_pir1 > 0 and dernier_pir2 > dernier_pir1 and (dernier_pir2 - dernier_pir1) < delai_max:
        compteur += 1
        print(f"Personne entrée ! Total: {compteur}")
        dernier_pir1 = 0
        dernier_pir2 = 0

    if dernier_pir2 > 0 and dernier_pir1 > dernier_pir2 and (dernier_pir1 - dernier_pir2) < delai_max:
        compteur -= 1
        if compteur < 0:
            compteur = 0
        print(f"Personne sortie ! Total: {compteur}")
        dernier_pir1 = 0
        dernier_pir2 = 0

# Boucle principale
while True:
    detecter_passage()
    
    # Gestion des LEDs
    if compteur > limite_personnes:
        led_rouge.value(1)
        led_verte.value(0)
    else:
        led_rouge.value(0)
        led_verte.value(1)
    
    # Affichage du nombre de personnes sur le 7 segments
    afficher_chiffre(compteur if compteur <= 9 else 9)  # Limite à 9 pour l'affichage
    
    sleep(0.1)
