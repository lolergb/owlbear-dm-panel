# 📚 DM screen for Owlbear Rodeo

Esta es una extensión para [Owlbear Rodeo](https://www.owlbear.rodeo/) que permite incrustar páginas de Notion y contenido externo directamente en Owlbear Rodeo. Te permite compartir hojas de personaje, documentación adicional y más con los jugadores, proporcionando acceso rápido a información vital y recursos para todos los involucrados.

## ✨ Características

- 🎯 Abrir páginas de Notion en modales dentro de Owlbear
- 📝 Gestión de páginas por carpetas desde la interfaz
- 🎨 Interfaz limpia y oscura
- 💾 Caché persistente para carga rápida
- 🏠 Configuración independiente por sala de Owlbear
- 🖼️ Visualización de imágenes a tamaño completo en modal
- 📥 Importar/Exportar configuración JSON
- 🔑 Gestión de token de usuario (global para todas las salas)
- 🌐 Soporte para URLs externas con selectores CSS
- 🎛️ Filtrado de tipos de bloques para páginas de Notion
- 📊 Carpetas anidadas con profundidad ilimitada
- 🎨 Iconos automáticos de páginas desde Notion
- 🗑️ Gestión de caché (limpiar todo o por página)
- 📄 **Soporte para PDFs:** Cualquier archivo PDF accesible públicamente
- 📁 **Gestión de carpetas:** Colapsar/expandir todas las carpetas, reordenar elementos
- ⚙️ **Panel de configuración:** Interfaz de configuración unificada
- 🎯 **Integración con tokens:** Vincular páginas a tokens de escena mediante menú contextual

## 🚀 Instalación

La extensión se puede instalar manualmente pegando la URL del manifiesto a continuación en el diálogo "Add Extension".

```
https://owlbear-notion-embed.netlify.app/manifest.json
```

O usa la URL proporcionada por el desarrollador de la extensión.

## 📖 Cómo usar DM screen

### Configuración inicial

**Cada usuario usa su propia cuenta de Notion.** Solo necesitas configurar tu token una vez.

#### 1. Obtener tu token de Notion

**Paso 1: Crear la integración**
1. Ve a https://www.notion.so/my-integrations
2. Haz clic en **"+ New integration"**
3. Dale un nombre (por ejemplo, "Owlbear Notion")
4. Selecciona tu espacio de trabajo
5. Haz clic en **"Submit"**

**Paso 2: Copiar el token**
1. En la página de integración, encuentra **"Internal Integration Token"**
2. Haz clic en **"Show"** y copia el token (comienza con `secret_`)

**Paso 3: Compartir tus páginas**
1. En Notion, abre cada página que quieras usar
2. Haz clic en **"Share"** (arriba a la derecha)
3. Encuentra el nombre de tu integración y dale acceso

**Paso 4: Configurar en la extensión**
1. En la extensión: **🔑** → Pega el token → **Guardar**
2. ¡Listo! Ya puedes usar tus páginas

### Uso diario

1. **Abre Owlbear Rodeo** y entra a tu sala de juego
2. **Abre la extensión** desde el menú de extensiones (icono en la barra superior)
3. **Verás una lista** de páginas de Notion organizadas por categorías
4. **Haz clic en una página** para abrirla y ver su contenido
5. **Usa el botón ← Atrás** para volver a la lista

### Gestionar tus páginas

**Cada sala tiene su propia configuración:**

1. Haz clic en el botón **⚙️** (arriba a la derecha) para abrir Configuración
2. Desde la vista principal, puedes:
   - Haz clic en **➕** para agregar nuevas carpetas o páginas
   - Usa el menú **⋯** en cualquier elemento para:
     - Editar nombre y URL
     - Mover arriba/abajo para reordenar
     - Eliminar elementos
   - Haz clic en las carpetas para colapsar/expandirlas
   - Usa el botón **📁** para colapsar/expandir todas las carpetas a la vez
3. En Configuración, puedes:
   - Configurar tu token de Notion
   - Ver la configuración JSON actual
   - Cargar JSON desde archivo
   - Descargar configuración JSON

### Estructura de configuración JSON

```json
{
  "categories": [
    {
      "name": "Nombre de carpeta",
      "pages": [
        {
          "name": "Nombre de página",
          "url": "URL de la página",
          "selector": "selector-opcional",
          "blockTypes": ["tipos", "opcionales", "de", "bloques"]
        }
      ],
      "categories": [
        {
          "name": "Subcarpeta",
          "pages": [
            {
              "name": "Página en subcarpeta",
              "url": "URL de la página"
            }
          ]
        }
      ]
    }
  ]
}
```

#### Propiedades de configuración

**Carpetas (`categories`)**
- **Tipo:** Array de objetos
- **Requerido:** Sí
- **Descripción:** Lista de carpetas que agrupan páginas

**Páginas (`categories[].pages`)**
- **Tipo:** Array de objetos
- **Requerido:** No (opcional si hay subcarpetas)
- **Descripción:** Lista de páginas dentro de la carpeta

**Subcarpetas (`categories[].categories`)**
- **Tipo:** Array de objetos
- **Requerido:** No (opcional)
- **Descripción:** Lista de subcarpetas anidadas dentro de la carpeta
- **Nota:** Las subcarpetas pueden tener sus propias páginas y subcarpetas (anidamiento ilimitado)

**Página (`categories[].pages[].name`)**
- **Tipo:** String
- **Requerido:** Sí
- **Descripción:** Nombre mostrado en el botón de la página

**Página (`categories[].pages[].url`)**
- **Tipo:** String (URL)
- **Requerido:** Sí
- **Descripción:** URL completa de la página.
- **Ejemplos:**
  - Notion: `https://your-workspace.notion.site/Title-2d0d4856c90e80f6801dcafb6b7366e6`
  - PDF: `https://example.com/document.pdf`
  - URL externa: `https://5e.tools/book.html#mm,1`

**Página (`categories[].pages[].selector`)**
- **Tipo:** String (selector CSS)
- **Requerido:** No (opcional)
- **Descripción:** Selector CSS (ID o clase) para cargar solo un elemento específico de la página
- **Cuándo usar:** Solo para URLs que NO son de Notion (URLs externas)
- **Ejemplos:**
  - Por ID: `"#main-content"`
  - Por clase: `".article-body"`

**Página (`categories[].pages[].blockTypes`)**
- **Tipo:** String o Array de strings
- **Requerido:** No (opcional)
- **Descripción:** Filtro de tipo de bloque para mostrar solo ciertos tipos de contenido en páginas de Notion
- **Cuándo usar:** Solo para URLs de Notion (ignorado en URLs externas)
- **Ejemplos:**
  - Tipo único: `"quote"` (solo mostrar citas)
  - Múltiples tipos: `["quote", "callout"]` (solo mostrar citas y callouts)

### Actualizar contenido

- **Recarga automática:** El contenido se almacena en caché para carga rápida
- **Botón 🔄:** Fuerza la recarga de una página específica (útil si actualizaste Notion)
- **Gestión de caché:** Disponible en el panel de Configuración

### Integración con tokens

Puedes vincular páginas directamente a tokens/personajes en la escena:

1. **Haz clic derecho en cualquier token** en la escena
2. Selecciona **"Vincular página"**
3. Elige una página de tu configuración
4. La página ahora está vinculada a ese token

**Para ver una página vinculada:**
- Haz clic derecho en el token → **"Ver página vinculada"**

**Para desvincular:**
- Haz clic derecho en el token → **"Desvincular página"** - Solo GM

**Nota:** Solo el GM puede vincular/desvincular páginas. Todos los jugadores pueden ver páginas vinculadas.

### Contenido soportado

- **Páginas de Notion** - Páginas privadas o públicas (compartidas con tu integración)
- **PDFs** - Cualquier archivo PDF accesible públicamente
- **URLs externas** - Cualquier página web (con selectores CSS opcionales)

### 💡 Consejos

- **Cada usuario tiene su propio token:** Configura tu token una vez y úsalo en todas las salas
- **Cada sala es independiente:** Las páginas se configuran por sala, pero el token se comparte
- **Token privado:** Tu token se almacena localmente en tu navegador, solo tú puedes verlo
- **URLs de Notion:** Puedes usar páginas privadas (no necesitan ser públicas) si las compartes con tu integración
- **Iconos:** Las páginas muestran automáticamente su icono de Notion
- **Imágenes:** Haz clic en cualquier imagen para verla a tamaño completo
- **Cambiar token:** Haz clic en **🔑** → Eliminar Token para volver a usar el token del servidor (si está configurado)

## 🐛 Solución de problemas

**La página no se abre:**
- Verifica que la URL de Notion sea correcta
- Asegúrate de que la URL esté completa (sin parámetros `?source=...`)
- Verifica que la página esté compartida con tu integración

**El contenido externo no carga:**
- Para PDFs: Asegúrate de que la URL sea accesible públicamente
- Para URLs externas: Algunas páginas bloquean iframes por seguridad (CORS)
- Revisa la consola del navegador para errores CORS o de iframe

**La extensión no aparece:**
- Verifica que `manifest.json` sea accesible públicamente
- Verifica que la URL del manifiesto sea correcta en Owlbear

**Error de token:**
- Verifica que tu token sea correcto (comienza con `secret_` o `ntn_`)
- Asegúrate de que la integración tenga acceso a las páginas que intentas ver

**Problemas de caché:**
- Usa el botón 🔄 para recargar una página específica
- Usa el botón 🗑️ para limpiar todo el caché

## 💬 Soporte

### Obtener ayuda

Si encuentras algún problema, tienes preguntas o quieres solicitar una función:

1. **Revisa el README:** La mayoría de las preguntas comunes están respondidas en este documento
2. **Revisa la sección de solución de problemas:** Ver arriba para problemas comunes y soluciones
3. **GitHub Issues:** Abre un issue en [GitHub](https://github.com/lolergb/owlbear-notion-embed/issues) para:
   - Reportes de errores
   - Solicitudes de funciones
   - Preguntas sobre uso
4. **GitHub Discussions:** Usa [GitHub Discussions](https://github.com/lolergb/owlbear-notion-embed/discussions) para:
   - Preguntas generales
   - Compartir configuraciones
   - Soporte de la comunidad

### Reportar errores

Al reportar un error, por favor incluye:
- **Descripción:** Qué pasó vs. qué esperabas
- **Pasos para reproducir:** Cómo activar el problema
- **Navegador/OS:** Tu navegador y sistema operativo
- **Errores de consola:** Cualquier error visible en la consola del navegador (F12)
- **Versión de extensión:** Revisa la versión en manifest.json

## 📄 Licencia

Uso personal - Siéntete libre de modificar y usar como desees.
