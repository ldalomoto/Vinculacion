import pyautogui
import time
from datetime import datetime, timedelta
import os
import pyscreenshot as ImageGrab

pyautogui.FAILSAFE = False

# ================= CONFIGURACIÓN =================
HORARIOS = [
    ("21:46", "22:46"),   # mañana
    ("23:00", "00:00")    # tarde / noche
]
# =================================================

points = [
    (261, 476),
    (770, 256),
    (1192, 225),
    (1190, 515)
]

DELAY_ENTRE_CLICKS = 0.5
INTERVALO_CICLO = 60  # segundos

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "captures")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# --- Preprocesar horarios ---
HORARIOS_DT = [
    (
        datetime.strptime(h[0], "%H:%M").time(),
        datetime.strptime(h[1], "%H:%M").time()
    )
    for h in HORARIOS
]

def hora_en_rango(actual, inicio, fin):
    def to_min(t):
        return t.hour * 60 + t.minute

    a = to_min(actual)
    i = to_min(inicio)
    f = to_min(fin)

    # rango normal (ej: 09:00 - 17:00)
    if i <= f:
        return i <= a <= f

    # rango cruza medianoche (ej: 22:00 - 02:00)
    return a >= i or a <= f



ultima_captura_por_bloque = {}

print("🟢 Automatización iniciada...")

while True:
    inicio_ciclo = time.time()
    ahora = datetime.now()
    hora_actual = ahora.time()

    # ================= CLICKS (SIEMPRE) =================
    for x, y in points:
        pyautogui.moveTo(x, y, duration=0.2)
        pyautogui.click()
        time.sleep(DELAY_ENTRE_CLICKS)

    # ================= CAPTURA POR BLOQUE =================
    for inicio, fin in HORARIOS_DT:

        if hora_en_rango(hora_actual, inicio, fin):

            bloque_id = f"{inicio.strftime('%H:%M')}-{fin.strftime('%H:%M')}"
            ultima = ultima_captura_por_bloque.get(bloque_id)

            if ultima is None or (ahora - ultima) >= timedelta(hours=1):
                filename = ahora.strftime("capture_%Y%m%d_%H%M%S.png")
                path = os.path.join(OUTPUT_DIR, filename)

                img = ImageGrab.grab()
                img.save(path)

                ultima_captura_por_bloque[bloque_id] = ahora
                print(f"📸 Captura horaria [{bloque_id}] → {filename}")

    # ================= ESPERA =================
    restante = INTERVALO_CICLO - (time.time() - inicio_ciclo)
    if restante > 0:
        time.sleep(restante)
