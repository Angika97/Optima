
# Proyecto Optima

Este es un proyecto que consiste en una aplicación web construida con un backend en Flask y un frontend en React. Utiliza Docker para la contenedorización y facilitar su despliegue.

## Estructura del Proyecto

```
Optima/
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app.py
│
└── frontend/
    ├── Dockerfile
    ├── package.json
    └── src/
```

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente:

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Configuración

1. **Clona el repositorio**

   ```bash
   git clone https://github.com/Angika97/Optima.git
   cd Optima
   ```

2. **Navega a la carpeta del backend y crea el archivo `requirements.txt`**

   Crea un archivo `requirements.txt` dentro de la carpeta `backend` con el siguiente contenido:

   ```
   Flask==2.3.2
   Flask-CORS==3.1.0
   ```

   Asegúrate de que las versiones sean las que necesitas y estén disponibles.

3. **Crea el archivo `Dockerfile` para el backend**

   Crea un archivo `Dockerfile` dentro de la carpeta `backend` con el siguiente contenido:

   ```dockerfile
   # Utilizar una imagen base oficial de Python
   FROM python:3.12-slim

   # Establecer el directorio de trabajo en el contenedor
   WORKDIR /app

   # Copiar los archivos de requerimientos al directorio de trabajo
   COPY requirements.txt requirements.txt

   # Instalar las dependencias
   RUN pip install --no-cache-dir -r requirements.txt

   # Copiar el resto de la aplicación al contenedor
   COPY . .

   # Exponer el puerto en el que correrá la aplicación
   EXPOSE 5000

   # Comando para ejecutar la aplicación
   CMD ["python", "app.py"]
   ```

4. **Crea el archivo `Dockerfile` para el frontend**

   Crea un archivo `Dockerfile` dentro de la carpeta `frontend` con el siguiente contenido:

   ```dockerfile
   # Etapa de construcción
   FROM node:16 AS build

   # Establecer el directorio de trabajo
   WORKDIR /app

   # Copiar el package.json y el package-lock.json
   COPY package*.json ./

   # Instalar las dependencias
   RUN npm install

   # Copiar el resto de la aplicación
   COPY . .

   # Construir la aplicación
   RUN npm run build

   # Etapa de producción
   FROM nginx:alpine

   # Copiar los archivos construidos a Nginx
   COPY --from=build /app/build /usr/share/nginx/html

   # Exponer el puerto 80
   EXPOSE 80

   # Comando para ejecutar Nginx
   CMD ["nginx", "-g", "daemon off;"]
   ```

5. **Crea el archivo `docker-compose.yml`**

   En el directorio raíz del proyecto, crea un archivo `docker-compose.yml` con el siguiente contenido:

   ```yaml
   version: '3'

   services:
     backend:
       build:
         context: ./backend
       ports:
         - "5000:5000"
   
     frontend:
       build:
         context: ./frontend
       ports:
         - "3000:80"
   ```

## Ejecución

Para ejecutar la aplicación utilizando Docker Compose, sigue estos pasos:

1. Asegúrate de estar en el directorio raíz del proyecto donde se encuentra el archivo `docker-compose.yml`.

2. Ejecuta el siguiente comando:

   ```bash
   docker-compose up
   ```

3. Accede a la aplicación:

   - **Frontend:** [http://localhost:3000](http://localhost:3000)
   - **Backend:** [http://localhost:5000](http://localhost:5000)

## Detener la aplicación

Para detener la aplicación, presiona `Ctrl + C` en la terminal donde ejecutaste `docker-compose up`. Si deseas eliminar los contenedores y las imágenes creadas, ejecuta:

```bash
docker-compose down --rmi all
```

## Contribuciones

Las contribuciones son bienvenidas. Si deseas contribuir, por favor abre un issue o envía un pull request.

## Licencia

Este proyecto está bajo la Licencia MIT - consulta el archivo [LICENSE](LICENSE) para más detalles.
