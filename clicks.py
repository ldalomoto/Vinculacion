import pyautogui
import time

pyautogui.FAILSAFE = False

points = [
    (261, 476),
    (770, 256),
    (1192, 225),
    (1190, 515)
]

DELAY_ENTRE_CLICKS = 0.5
INTERVALO_CICLO = 60  # segundos

while True:
    inicio_ciclo = time.time()
    
    # ================= CLICKS (SIEMPRE) =================
    for x, y in points:
        pyautogui.moveTo(x, y, duration=0.2)
        pyautogui.click()
        time.sleep(DELAY_ENTRE_CLICKS)

    # ================= ESPERA =================
    restante = INTERVALO_CICLO - (time.time() - inicio_ciclo)
    if restante > 0:
        time.sleep(restante)
