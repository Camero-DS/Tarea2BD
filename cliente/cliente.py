import requests

BASE_URL = "http://localhost:3000/api"

def main():

    correo = login()

    if correo == False:
        print("Credenciales incorrectas. Saliendo del programa.")
        return

    while True:
        print("\nMenú de opciones:")
        print("1. Enviar un correo")
        print("2. Ver información de una dirección de correo electrónico")
        print("3. Ver correos marcados como favoritos")
        print("4. Marcar correo como favorito")
        print("5. Terminar con la ejecución del cliente")
        
        option = input("¿Qué desea hacer?: ")

        if option == '1':
            enviarCorreo()
        elif option == '2':
            verInfoCorreo()
        elif option == '3':
            verCorreosFav(correo)
        elif option == '4':
            marcarCorreoFav()
        elif option == '5':
            print("Saliendo del programa.")
            break
        else:
            print("Opción inválida. Intente de nuevo.")

def login():

    print("Bienvenido al cliente de CommuniKen")

    correo = input("Ingrese su correo electrónico: ")
    contraseña = input("Ingrese su contraseña: ")
    url = f'{BASE_URL}/login'
    
    infoLogin = {
        "correo": correo,
        "clave": contraseña
    }

    respuesta = requests.post(url, json = infoLogin)

    if respuesta.estado == 200:
        return correo
    else:
        return False

def enviarCorreo(correoRemitente):

    correoDest = input("Ingrese el correo electrónico del destinatario: ")
    asunto = input("Ingrese el asunto del correo: ")
    cuerpo = input("Ingrese el cuerpo del correo: ")
    url = f'{BASE_URL}/correos'

    correoAEnv = {
        "remitente": correoRemitente,
        "destinatario": correoDest,
        "asunto": asunto,
        "cuerpo": cuerpo
    }

    respuesta = requests.post(url, json = correoAEnv)

    if respuesta.estado == 200:
        print("Correo enviado exitosamente.")
    else:
        print("Error al enviar el correo.")

def verInfoCorreo():

    correo = input("Ingrese una dirección de correo electrónico para obtener su información: ")
    url = f'{BASE_URL}/informacion/{correo}'

    respuesta = requests.get(url)

    if respuesta.estado != 400:
        infoCorreo = respuesta.json()
        print(f"Nombre: {infoCorreo['nombre']}")
        print(f"Correo: {infoCorreo['correo']}")
        print(f"Descripción: {infoCorreo['descripcion']}")
    else:
        print("Error al obtener la información del usuario. Verifique la dirección de correo electrónico.")

def verCorreosFav(correo):

    url = f'{BASE_URL}/correos/favoritos/{correo}'

    respuesta = requests.get(url)

    if respuesta.estado != 400:
        correosFav = respuesta.json()
        for n in correosFav:
            if n == 0:
                n = 1
            print(f"Correo {n}: {n['correo']}")
    else:
        print("Error al obtener los correos favoritos.")

def marcarCorreoFav():

    url = f'{BASE_URL}/correos/marcarcorreo'

    correo = input("Ingrese la dirección de correo electrónico que desea marcar como favorita: ")

    respuesta = requests.post(url, json = {"correo": correo})
    
    if respuesta.estado == 200:
        print("Correo marcado como favorito exitosamente.")
    else:
        print("Error al marcar el correo como favorito.")

if __name__ == '__main__':
    main()
