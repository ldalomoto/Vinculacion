import pyautogui
import time
from datetime import datetime
import os
import pyscreenshot as ImageGrab

pyautogui.FAILSAFE = True

points = [
    (261, 476),
    (770, 256),
    (1192, 225),
    (1190, 515)
]

intervalo_ciclo = 60
delay_entre_clicks = 0.5

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
output_dir = os.path.join(BASE_DIR, "captures")
os.makedirs(output_dir, exist_ok=True)

print("Automatización iniciada...")

while True:
    inicio = time.time()

    # --- Clicks ---
    for x, y in points:
        pyautogui.moveTo(x, y, duration=0.2)
        pyautogui.click()
        time.sleep(delay_entre_clicks)

    # --- Captura (UNA POR CICLO) ---
    filename = datetime.now().strftime("capture_%Y%m%d_%H%M%S.png")
    path = os.path.join(output_dir, filename)

    img = ImageGrab.grab()
    img.save(path)

    print(f"📸 Captura guardada en: {path}")

    # --- Esperar hasta completar el minuto ---
    restante = intervalo_ciclo - (time.time() - inicio)
    if restante > 0:
        time.sleep(restante)
