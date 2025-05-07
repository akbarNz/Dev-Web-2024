from machine import Pin
from time import sleep

bouton = Pin(2, Pin.IN, Pin.PULL_UP)
led_rouge = Pin(11, Pin.OUT)
led_verte = Pin(12, Pin.OUT)

segments = [
    Pin(3, Pin.OUT), Pin(4, Pin.OUT), Pin(5, Pin.OUT), Pin(6, Pin.OUT),
    Pin(7, Pin.OUT), Pin(8, Pin.OUT), Pin(9, Pin.OUT), Pin(10, Pin.OUT)
]

chiffres = {
    0: [0, 0, 0, 0, 0, 0, 1, 1], 1: [1, 0, 0, 1, 1, 1, 1, 1],
    2: [0, 0, 1, 0, 0, 1, 0, 1], 3: [0, 0, 0, 0, 1, 1, 0, 1],
    4: [1, 0, 0, 1, 1, 0, 0, 1], 5: [0, 1, 0, 0, 1, 0, 0, 1],
    6: [0, 1, 0, 0, 0, 0, 0, 1], 7: [0, 0, 0, 1, 1, 1, 1, 1],
    8: [0, 0, 0, 0, 0, 0, 0, 1], 9: [0, 0, 0, 0, 1, 0, 0, 1]
}

demande_limite = int(input("Quelle est la limite de personne < 9 personnes "))
compteur = 0
limite = demande_limite

def afficher_chiffre(chiffre):
    chiffre = min(chiffre, 9)
    for i in range(7):
        segments[i].value(chiffres[chiffre][i])

def gerer_bouton():
    global compteur
    if bouton.value() == 0:
        sleep(0.05)
        if bouton.value() == 0:
            compteur += 1
            print(f"Compteur: {compteur}")
            afficher_chiffre(compteur if compteur <= 9 else 9)
            led_rouge.value(0 if compteur > limite else 1)
            led_verte.value(1 if compteur > limite else 0)
            while bouton.value() == 0:
                sleep(0.05)

while True:
    gerer_bouton()
    sleep(0.1)
