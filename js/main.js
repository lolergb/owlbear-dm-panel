/**
 * @fileoverview Punto de entrada principal de GM Vault
 * 
 * Este archivo inicializa la aplicación y conecta todos los módulos.
 * NOTA: Este es el nuevo punto de entrada modular. El index.js original
 * se mantiene como backup durante la migración.
 */

import OBR from "https://esm.sh/@owlbear-rodeo/sdk@3.1.0";
import { ExtensionController } from './controllers/ExtensionController.js';
import { log, logError } from './utils/logger.js';

// Instancia global del controlador
let extensionController = null;

/**
 * Inicializa la aplicación
 */
async function init() {
  log('🚀 Iniciando GM Vault (versión modular)...');
  
  try {
    // Crear controlador
    extensionController = new ExtensionController();
    
    // Inicializar con OBR SDK
    await extensionController.init(OBR, {
      pagesContainer: '#pages-list',
      contentContainer: '#content-area'
    });
    
    log('✅ GM Vault inicializado correctamente');
  } catch (e) {
    logError('❌ Error iniciando GM Vault:', e);
    
    // Mostrar error en la UI
    const container = document.getElementById('pages-list');
    if (container) {
      container.innerHTML = `
        <div class="error-container">
          <h3>Error</h3>
          <p>Failed to initialize GM Vault: ${e.message}</p>
          <button onclick="window.location.reload()">Retry</button>
        </div>
      `;
    }
  }
}

// Limpiar al cerrar
window.addEventListener('beforeunload', () => {
  if (extensionController) {
    extensionController.cleanup();
  }
});

// Exponer controlador globalmente para debugging
window.gmVault = {
  getController: () => extensionController,
  getConfig: () => extensionController?.getConfig(),
  version: '2.0.0-modular'
};

// Iniciar aplicación
init();

