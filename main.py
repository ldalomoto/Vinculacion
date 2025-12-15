import pyautogui
import time
from datetime import datetime

# Seguridad: mover mouse a esquina superior izquierda detiene el script
pyautogui.FAILSAFE = True

# Puntos capturados
points = [
    (261, 476),
    (770, 256),
    (1192, 225),
    (1190, 515)
]

intervalo_ciclo = 60  # segundos (1 minuto)
delay_entre_clicks = 0.5  # segundos entre puntos

print("Iniciando clicks automáticos...")
print("Mover el mouse a la esquina superior izquierda para detener.\n")

while True:
    inicio = time.time()
    print(f"Ciclo iniciado: {datetime.now().strftime('%H:%M:%S')}")

    for x, y in points:
        pyautogui.moveTo(x, y, duration=0.2)
        pyautogui.click()
        print(f"Click en ({x}, {y})")
        time.sleep(delay_entre_clicks)

    # Esperar hasta completar el minuto
    tiempo_restante = intervalo_ciclo - (time.time() - inicio)
    if tiempo_restante > 0:
        time.sleep(tiempo_restante)
