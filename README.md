# GTG BOT :

# GTG Bot es un repositorio en el cual funciona el bot de discord de la empresa de colectivos virtual
# "General Tomas Guido".
# La funcion principal de este bot es sincronizar la WEB (Alocada en otro repositorio) en donde se
# pueden sacar tickets, anotarse para trabajar en la empresa, y otras cosas destinadas al personal de la
# misma: Con sincronizar nos referimos a mantener las cuentas de la web, cuentas destinadas al personal, 
# seguras y mantenidas luego con el paso del tiempo y muchos bugs, se consiguio hacer funcionar por      # primera vez al bot.
# Finalmente, se agregaron funciones para la moderacion de la empresa, como el /ban, /kick y /warn.

# Como funcionan los comandos :

# El comando /cuenta abre un panel que solo el usuario que ejecuta el comando puede ver (Modo ephemeral)
# y que despliega dos botones, "Cambiar contraseña" y "Crear cuenta" (Luego se integraran mas funciones).
# Cuando le das a "Crear Cuenta" genera un "Modal" con tres campos obligatorios, "Nombre de Usuario", "Usuario de Discord" y "Contraseña", una vez el usuario envia el formulario, el bot reconoce cual es el 
# rol del usuario dentro del discord y luego sube a una FIRESTORE el usuario, la contraseña y el rol del 
# usuario.
# Con la parte de "Cambiar Contraseña", abre un "Modal" que pide un Usuario ya creado previamente, luego,
# para verificar la posesion de la cuenta, envia un DM al usuario registrado en la cuenta con un embed,
# el cual tiene un boton para confirmar que el usuario solicito el cambio de contraseña. Si el usuario
# confirma que fue el, abre otro "Modal" que tiene un unico campo obligatorio, el cual es "Nueva Contraseñ
# _a", una vez completado el "Modal", el bot sobreescribe la informacion que esta en la FIRESTORE, 
# cambiando la parte de "Contraseña".

# Los comandos /ban, /kick y /warn son muy simples :
# En todos estos comandos, el bot revisa primero que el usuario tenga uno de estos tres roles : 
# | Jefe
# | Secretario
# | Moderador

# Una vez que el bot certifica que el usuario tiene uno de estos roles, se autoriza a que el usuario
# ejecute el comando. 
# Cuando se usa uno de los comandos, en todos los casos, hay tres campos a rellenar : Razón, Usuario y
# Evidencia. El campo de "Razón" es un input de texto, luego, por otro lado, el campo de "Usuario" 
# solicita un ID de usuario o un @<Usuario>, y por ultimo, el campo de "Evidencia" solicita un archivo
# de imagen.
# Luego que se rellenan todos estos campos, el bot envia un embed al canal de # SANCIONES, en donde dice :
# | Usuario sancionado :
# | Moderador :
# | Razón :
# | Fecha :
# | Tipo de Sancion :

# Ademas que el bot anota la sancion en una coleccion distinta de la FIRESTORE.
