from machine import Pin
from time import sleep

bouton1 = Pin(2, Pin.IN, Pin.PULL_UP) 
bouton2 = Pin(3, Pin.IN, Pin.PULL_UP) 

led_rouge = Pin(11, Pin.OUT)
led_verte = Pin(12, Pin.OUT)

segments1 = [Pin(4, Pin.OUT), Pin(5, Pin.OUT), Pin(6, Pin.OUT), Pin(7, Pin.OUT),
             Pin(8, Pin.OUT), Pin(9, Pin.OUT), Pin(10, Pin.OUT)]

segments2 = [Pin(13, Pin.OUT), Pin(14, Pin.OUT), Pin(15, Pin.OUT), Pin(16, Pin.OUT),
             Pin(17, Pin.OUT), Pin(18, Pin.OUT), Pin(19, Pin.OUT)]


chiffres = {
    0: [0, 0, 0, 0, 0, 0, 1], 1: [1, 0, 0, 1, 1, 1, 1],
    2: [0, 0, 1, 0, 0, 1, 0], 3: [0, 0, 0, 0, 1, 1, 0],
    4: [1, 0, 0, 1, 1, 0, 0], 5: [0, 1, 0, 0, 1, 0, 0],
    6: [0, 1, 0, 0, 0, 0, 0], 7: [0, 0, 0, 1, 1, 1, 1],
    8: [0, 0, 0, 0, 0, 0, 0], 9: [0, 0, 0, 0, 1, 0, 0]
}


limite = int(input("Quelle est la limite de personnes (<99) ? : "))
compteur = 0
dernier_bouton = None  
sequence_complete = False  


def afficher_chiffre(segments, chiffre):
    chiffre = min(max(chiffre, 0), 9)  
    for i in range(7):
        segments[i].value(chiffres[chiffre][i])


def mettre_a_jour_affichage():
    afficher_chiffre(segments1, compteur % 10)
    afficher_chiffre(segments2, (compteur // 10) % 10)
    led_rouge.value(1 if compteur > limite else 0)
    led_verte.value(0 if compteur > limite else 1)
    print(f"Compteur: {compteur}")

def gerer_boutons():
    global compteur, dernier_bouton, sequence_complete

    if bouton1.value() == 0 and dernier_bouton is None: 
        sleep(0.005)  
        if bouton1.value() == 0:
            dernier_bouton = "B1"
            print("Bouton 1 pressé, en attente du bouton 2...")

    if bouton2.value() == 0 and dernier_bouton is None:
        sleep(0.005)
        if bouton2.value() == 0:
            dernier_bouton = "B2"
            print("Bouton 2 pressé, en attente du bouton 1...")

    if dernier_bouton == "B1" and bouton2.value() == 0:
        sleep(0.005)
        if bouton2.value() == 0:
            compteur += 1
            sequence_complete = True
            print("Séquence validée : +1")

    elif dernier_bouton == "B2" and bouton1.value() == 0:
        sleep(0.005)
        if bouton1.value() == 0:
            compteur = max(0, compteur - 1)
            sequence_complete = True
            print("Séquence validée : -1")

    if sequence_complete:
        while bouton1.value() == 0 or bouton2.value() == 0:
            sleep(0.005)  
        mettre_a_jour_affichage()
        dernier_bouton = None
        sequence_complete = False
        print("Prêt pour une nouvelle séquence")

print("Prêt pour une nouvelle séquence")
while True:
    gerer_boutons()
    sleep(0.1)
