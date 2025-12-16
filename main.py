import pyautogui
import time
from datetime import datetime, timedelta
import os
import pyscreenshot as ImageGrab

pyautogui.FAILSAFE = True

# ================= CONFIGURACIÓN =================
HORARIO_INICIO = "19:52"   # ← CAMBIA AQUÍ
HORARIO_FIN    = "21:52"   # ← CAMBIA AQUÍ
# =================================================

points = [
    (261, 476),
    (770, 256),
    (1192, 225),
    (1190, 515)
]

DELAY_ENTRE_CLICKS = 0.5

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "captures")
os.makedirs(OUTPUT_DIR, exist_ok=True)

inicio_dt = datetime.strptime(HORARIO_INICIO, "%H:%M").time()
fin_dt = datetime.strptime(HORARIO_FIN, "%H:%M").time()

ultima_captura = None

print("🟢 Automatización iniciada...")

while True:
    ciclo_inicio = time.time()
    ahora = datetime.now()
    hora_actual = ahora.time()

    # --- Clicks SIEMPRE ---
    for x, y in points:
        pyautogui.moveTo(x, y, duration=0.2)
        pyautogui.click()
        time.sleep(DELAY_ENTRE_CLICKS)

    # --- Captura cada 1 hora desde inicio ---
    if inicio_dt <= hora_actual <= fin_dt:
        if ultima_captura is None:
            capturar = True
        else:
            capturar = (ahora - ultima_captura) >= timedelta(hours=1)

        if capturar:
            filename = ahora.strftime("capture_%Y%m%d_%H%M%S.png")
            path = os.path.join(OUTPUT_DIR, filename)

            img = ImageGrab.grab()
            img.save(path)

            ultima_captura = ahora
            print(f"📸 Captura horaria: {filename}")

    # --- Mantener ciclo de 1 minuto ---
    restante = 60 - (time.time() - ciclo_inicio)
    if restante > 0:
        time.sleep(restante)
