# Voz de Gala AI - Generador de Anuncios Épicos

> **Transforma texto simple en experiencias auditivas de nivel cinematográfico.**

Voz de Gala AI es una aplicación web progresiva (PWA) construida con React, TypeScript y Tailwind CSS que utiliza la potencia de **Google Gemini 2.5** (Flash & Pro) para reescribir guiones y sintetizar voz neural de ultra-alta calidad.

## 🌟 Características Principales

*   **Motor de Reescrutura IA:** Convierte frases simples en guiones épicos o corporativos.
*   **Síntesis de Voz Neural:** Utiliza las voces más avanzadas de Gemini (Fenrir, Puck, Kore, Zephyr).
*   **Modos de Estilo:**
    *   🎉 **Gran Evento:** Estilo "Voice of God" para estadios y shows.
    *   💼 **Profesional:** Estilo sobrio para noticias y corporativos.
*   **Seguridad Enterprise:** Simulaciones de biometría, rate limiting y sanitización de inputs.
*   **Audio Engine:** Visualizador de audio en tiempo real y controles de mezcla (pitch/speed).
*   **Persistencia:** Historial de generaciones y feed comunitario.

## 🚀 Tecnologías

*   **Frontend:** React 19, Vite
*   **Estilos:** Tailwind CSS, Lucide Icons
*   **AI Core:** Google GenAI SDK (`@google/genai`)
*   **Audio:** Web Audio API (Native Context)

## 🛠 Instalación y Uso

1.  Clona el repositorio.
2.  Instala dependencias:
    ```bash
    npm install
    ```
3.  Configura tu API Key de Gemini en las variables de entorno (`.env`):
    ```env
    API_KEY=tu_api_key_aqui
    ```
4.  Inicia el servidor de desarrollo:
    ```bash
    npm start
    ```

## 🔒 Seguridad

La aplicación implementa varias capas de seguridad frontend:
*   **Input Sanitization:** Limpieza de HTML y caracteres de control.
*   **Rate Limiting:** Prevención de abuso de API (cooldown de 5s).
*   **Secure Simulation:** Interfaz de autenticación simulada para experiencia de usuario.

---
**Desarrollado por Iyari Cancino Gomez**
