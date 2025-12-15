from pynput import mouse, keyboard
import pyautogui

# Obtener resolución real de pantalla
screen_width, screen_height = pyautogui.size()
print(f"Resolución detectada: {screen_width} x {screen_height}")
print("Haz clic izquierdo para capturar puntos")
print("Presiona ESC para finalizar\n")

points = []

def on_click(x, y, button, pressed):
    if pressed and button == mouse.Button.left:
        points.append((x, y))
        print(f"Punto capturado: x={x}, y={y}")

def on_press(key):
    if key == keyboard.Key.esc:
        print("\nCaptura finalizada.")
        print("Puntos obtenidos:")
        for i, p in enumerate(points, 1):
            print(f"{i}: {p}")
        return False  # detener listener

# Listeners
mouse_listener = mouse.Listener(on_click=on_click)
keyboard_listener = keyboard.Listener(on_press=on_press)

mouse_listener.start()
keyboard_listener.start()

mouse_listener.join()
keyboard_listener.join()
