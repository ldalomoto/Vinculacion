import pyautogui
import time
from datetime import datetime
import os
import pyscreenshot as ImageGrab
from pynput import keyboard

pyautogui.FAILSAFE = False

# ================= CONFIGURACIÓN =================
HORARIOS = [
    ("06:00", "09:00")  # tarde / noche
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

    # rango cruza medianoche (ej: 18:00 - 00:00)
    return a >= i or a <= f


# 🔑 Guarda la última HORA capturada por bloque
ultima_hora_capturada = {}

ejecutando_clicks = True

def activar_pausa():
    global ejecutando_clicks
    if ejecutando_clicks:
        ejecutando_clicks = False
        print("🔴 Clicks pausados (Alt+3 para reanudar)")

def desactivar_pausa():
    global ejecutando_clicks
    if not ejecutando_clicks:
        ejecutando_clicks = True
        print("🟢 Clicks reanudados (Alt+2 para pausar)")

# Implementación con pynput para evitar requerir ROOT en Linux
def on_press(key):
    try:
        # Detectar combinaciones Alt+2 y Alt+3
        if key == keyboard.KeyCode.from_char('2') and (keyboard.Key.alt in pressed_keys or keyboard.Key.alt_gr in pressed_keys):
            activar_pausa()
        elif key == keyboard.KeyCode.from_char('3') and (keyboard.Key.alt in pressed_keys or keyboard.Key.alt_gr in pressed_keys):
            desactivar_pausa()
    except Exception:
        pass

pressed_keys = set()

def on_key_down(key):
    pressed_keys.add(key)
    on_press(key)

def on_key_up(key):
    if key in pressed_keys:
        pressed_keys.remove(key)

# Iniciar el escuchador en segundo plano
listener = keyboard.Listener(on_press=on_key_down, on_release=on_key_up)
listener.start()

print("🟢 Automatización iniciada...")
print("⌨️  Comandos: Alt+2 = Detener clicks | Alt+3 = Continuar clicks")

while True:
    inicio_ciclo = time.time()
    ahora = datetime.now()
    hora_actual = ahora.time()
    hora_actual_hh = ahora.strftime("%H")

    # ================= CLICKS (SIEMPRE) =================
    if ejecutando_clicks:
        for x, y in points:
            pyautogui.moveTo(x, y, duration=0.2)
            pyautogui.click()
            #time.sleep(DELAY_ENTRE_CLICKS)

    # ================= CAPTURA POR BLOQUE =================
    for inicio, fin in HORARIOS_DT:

        if hora_en_rango(hora_actual, inicio, fin):

            bloque_id = f"{inicio.strftime('%H:%M')}-{fin.strftime('%H:%M')}"
            ultima_hora = ultima_hora_capturada.get(bloque_id)

            # 📸 Capturar SOLO si esta hora aún no fue capturada
            if ultima_hora != hora_actual_hh:
                filename = ahora.strftime("capture_%Y%m%d_%H%M%S.png")
                path = os.path.join(OUTPUT_DIR, filename)

                img = ImageGrab.grab()
                img.save(path)

                ultima_hora_capturada[bloque_id] = hora_actual_hh
                print(f"📸 Captura horaria [{bloque_id}] → {filename}")

    #time.sleep(5)
    time.sleep(2)
    # ================= ESPERA =================
    #restante = INTERVALO_CICLO - (time.time() - inicio_ciclo)
    #if restante > 0:
    #    time.sleep(restante)   
